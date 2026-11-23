// Sales prospect discovery via Claude web_search + web_fetch.
// See doc/requirements/mallouliauto_agents_specifications.md §14

import { runClaudeWithTools } from '../shared/claude-client.js';
import { supabaseAdmin } from '../shared/supabase.js';
import type { AgentSegment } from '../shared/types.js';

// ─── Types ─────────────────────────────────────────────────────────

export interface DiscoverOptions {
  segment: AgentSegment;
  city?: string;
  count?: number;
  trigger?: 'manual' | 'api' | 'cron';
}

export interface DiscoverResult {
  run_id: string;
  prospects_found: number;
  prospects_created: number;
  prospects_skipped: number;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  model: string;
}

interface DiscoveredProspect {
  company: string;
  contact_name?: string;
  role?: string;
  email?: string;
  linkedin_url?: string;
  phone?: string;
  city?: string;
  website?: string;
  notes?: string;
}

// ─── Dynamic config from Supabase ─────────────────────────────────

interface SegmentConfig {
  slug: string;
  label_fr: string;
  description_fr: string;
  search_hints: string | null;
}

interface SourceConfig {
  name: string;
  url: string | null;
  description_fr: string;
}

async function getSegmentConfig(segment: string): Promise<SegmentConfig | null> {
  const { data } = await supabaseAdmin()
    .from('agent_discovery_segments')
    .select('slug, label_fr, description_fr, search_hints')
    .eq('slug', segment)
    .eq('enabled', true)
    .single();
  return data;
}

async function getDiscoverySources(segment: string): Promise<SourceConfig[]> {
  const { data } = await supabaseAdmin()
    .from('agent_discovery_sources')
    .select('name, url, description_fr, segments')
    .eq('enabled', true)
    .or('source_type.eq.discovery,source_type.eq.both')
    .order('priority', { ascending: false });

  if (!data) return [];
  // Filter to sources relevant to this segment (empty segments array = all)
  return data.filter(
    (s: any) => !s.segments || s.segments.length === 0 || s.segments.includes(segment)
  );
}

// ─── System prompt (dynamic) ───────────────────────────────────────

// Fallback if DB is empty (backward compatibility)
const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  insurance:
    "compagnies d'assurance automobile (assurance auto, responsabilité civile, tous risques)",
  garage: 'garages automobiles, ateliers de réparation, centres de service agréés, carrosseries',
  dealer: 'concessionnaires automobiles, revendeurs agréés de véhicules neufs et occasions',
  fleet:
    'gestionnaires de flottes automobiles, sociétés de leasing, agences de location de voitures',
};

function buildDiscoverySystemPrompt(
  segConfig: SegmentConfig | null,
  sources: SourceConfig[]
): string {
  const sourcesBlock =
    sources.length > 0
      ? sources
          .map((s) => `- ${s.name}${s.url ? ` (${s.url})` : ''} — ${s.description_fr}`)
          .join('\n')
      : `- Annuaires professionnels tunisiens (Pages Jaunes Tunisie, Tunisie Annuaire)
- LinkedIn (pages entreprises)
- Registre du commerce tunisien
- Associations professionnelles du secteur`;

  const hintsBlock = segConfig?.search_hints
    ? `\n## Conseils de recherche spécifiques\n${segConfig.search_hints}\n`
    : '';

  return `Tu es un expert en prospection commerciale B2B spécialisé dans le marché automobile tunisien.

## Objectif
Rechercher et identifier des entreprises correspondant au segment demandé en Tunisie.

## Instructions
1. Utilise web_search pour chercher des entreprises tunisiennes correspondant au segment et à la ville spécifiés.
2. Utilise web_fetch pour visiter les sites web pertinents (annuaires, sites d'entreprises, registres professionnels).
3. Pour chaque entreprise trouvée, collecte :
   - Nom de l'entreprise (obligatoire)
   - Nom du contact / décideur (si trouvé)
   - Rôle / titre du contact
   - Email professionnel
   - URL LinkedIn de l'entreprise ou du contact
   - Numéro de téléphone (format international +216...)
   - Ville / localisation
   - Site web
   - Notes pertinentes (spécialité, taille, marques représentées)

## Sources recommandées
${sourcesBlock}
${hintsBlock}
## Format de sortie
Réponds UNIQUEMENT avec un JSON valide (sans markdown fences) :
{
  "prospects": [
    {
      "company": "Nom de l'entreprise",
      "contact_name": "Prénom Nom",
      "role": "Directeur Général",
      "email": "contact@exemple.tn",
      "linkedin_url": "https://linkedin.com/company/...",
      "phone": "+21671234567",
      "city": "Tunis",
      "website": "https://www.exemple.tn",
      "notes": "Spécialisé en assurance auto"
    }
  ]
}

## Règles
- Ne retourne QUE des entreprises réelles et vérifiées par ta recherche
- Ne génère PAS de données fictives ou inventées
- Si tu ne trouves pas une information, omets le champ (ne mets pas "N/A")
- Concentre-toi sur la Tunisie uniquement
- Retourne au maximum le nombre demandé de prospects`;
}

function buildDiscoveryUserPrompt(opts: DiscoverOptions, segConfig: SegmentConfig | null): string {
  const segDesc = segConfig?.description_fr ?? FALLBACK_DESCRIPTIONS[opts.segment] ?? opts.segment;
  const cityClause = opts.city
    ? ` dans la ville de ${opts.city}`
    : ' en Tunisie (Grand Tunis en priorité)';
  const count = opts.count ?? 10;

  return `Recherche ${count} entreprises du segment "${opts.segment}" (${segDesc})${cityClause}.

Retourne les résultats en JSON selon le format spécifié.`;
}

// ─── Discovery function ────────────────────────────────────────────

export async function discoverProspects(opts: DiscoverOptions): Promise<DiscoverResult> {
  const count = Math.min(opts.count ?? 10, 20); // Cap at 20

  // Fetch dynamic config from Supabase
  const [segConfig, sources] = await Promise.all([
    getSegmentConfig(opts.segment),
    getDiscoverySources(opts.segment),
  ]);

  // Create agent_run row
  const { data: runRow, error: runErr } = await supabaseAdmin()
    .from('agent_runs')
    .insert({
      agent_type: 'sales',
      trigger: opts.trigger ?? 'manual',
      input: { action: 'discover', segment: opts.segment, city: opts.city, count },
    })
    .select('id')
    .single();
  if (runErr) throw new Error(`[sales/discovery] Failed to create run: ${runErr.message}`);
  const run_id: string = runRow!.id;

  const startMs = Date.now();

  try {
    const result = await runClaudeWithTools({
      systemPrompt: buildDiscoverySystemPrompt(segConfig, sources),
      userPrompt: buildDiscoveryUserPrompt({ ...opts, count }, segConfig),
      maxTokens: 8192,
      maxTurns: 8,
    });

    // Parse the JSON response
    const cleaned = result.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let discovered: DiscoveredProspect[] = [];
    try {
      const parsed = JSON.parse(cleaned);
      discovered = Array.isArray(parsed.prospects) ? parsed.prospects : [];
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = cleaned.match(/\{[\s\S]*"prospects"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        discovered = Array.isArray(parsed.prospects) ? parsed.prospects : [];
      }
    }

    // Dedup against existing prospects
    let prospects_created = 0;
    let prospects_skipped = 0;

    for (const d of discovered) {
      if (!d.company || d.company.trim().length === 0) {
        prospects_skipped++;
        continue;
      }

      // Check if already exists (by company name + city, case-insensitive)
      const { data: existing } = await supabaseAdmin()
        .from('agent_prospects')
        .select('id')
        .ilike('company', d.company.trim())
        .limit(1);

      if (existing && existing.length > 0) {
        prospects_skipped++;
        continue;
      }

      // Insert new prospect
      const { error: insertErr } = await supabaseAdmin()
        .from('agent_prospects')
        .insert({
          segment: opts.segment,
          company: d.company.trim(),
          contact_name: d.contact_name?.trim() || null,
          role: d.role?.trim() || null,
          email: d.email?.trim() || null,
          linkedin_url: d.linkedin_url?.trim() || null,
          whatsapp_e164: d.phone?.trim() || null,
          language: 'fr',
          city: d.city?.trim() || opts.city || null,
          source: 'ai_discovery',
          notes:
            [d.notes, d.website ? `Site: ${d.website}` : null].filter(Boolean).join(' | ') || null,
          status: 'new',
        });

      if (insertErr) {
        // Skip duplicates (unique constraint on email if it exists)
        prospects_skipped++;
      } else {
        prospects_created++;
      }
    }

    // Update run
    const duration_ms = Date.now() - startMs;
    await supabaseAdmin()
      .from('agent_runs')
      .update({
        status: 'success',
        output_summary: {
          prospects_found: discovered.length,
          prospects_created,
          prospects_skipped,
          turns: result.turns,
        },
        tokens_input: result.tokens_input,
        tokens_output: result.tokens_output,
        cost_usd: result.cost_usd,
        duration_ms,
      })
      .eq('id', run_id);

    return {
      run_id,
      prospects_found: discovered.length,
      prospects_created,
      prospects_skipped,
      tokens_input: result.tokens_input,
      tokens_output: result.tokens_output,
      cost_usd: result.cost_usd,
      model: result.model,
    };
  } catch (err) {
    const duration_ms = Date.now() - startMs;
    await supabaseAdmin()
      .from('agent_runs')
      .update({
        status: 'failed',
        output_summary: { error: (err as Error).message },
        duration_ms,
      })
      .eq('id', run_id);
    throw err;
  }
}
