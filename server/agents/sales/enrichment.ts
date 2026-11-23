// Sales prospect enrichment via Claude web_search.
// See doc/requirements/mallouliauto_agents_specifications.md §14

import { runClaudeWithTools } from '../shared/claude-client.js';
import { supabaseAdmin } from '../shared/supabase.js';
import { getProspect, type Prospect } from './tools.js';

// ─── Types ─────────────────────────────────────────────────────────

export interface EnrichOptions {
  prospect_id: string;
  trigger?: 'manual' | 'api' | 'cron';
}

export interface EnrichBatchOptions {
  segment?: string;
  batch_size?: number;
  trigger?: 'manual' | 'api' | 'cron';
}

export interface EnrichResult {
  run_id: string;
  prospect_id: string;
  fields_updated: string[];
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  model: string;
}

interface EnrichedData {
  contact_name?: string;
  role?: string;
  email?: string;
  linkedin_url?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

// ─── Dynamic config from Supabase ─────────────────────────────────

interface SourceConfig {
  name: string;
  url: string | null;
  description_fr: string;
}

async function getEnrichmentSources(segment: string): Promise<SourceConfig[]> {
  const { data } = await supabaseAdmin()
    .from('agent_discovery_sources')
    .select('name, url, description_fr, segments')
    .eq('enabled', true)
    .or('source_type.eq.enrichment,source_type.eq.both')
    .order('priority', { ascending: false });

  if (!data) return [];
  return data.filter(
    (s: any) => !s.segments || s.segments.length === 0 || s.segments.includes(segment)
  );
}

// ─── System prompt (dynamic) ───────────────────────────────────────

function buildEnrichmentSystemPrompt(sources: SourceConfig[]): string {
  const sourcesBlock =
    sources.length > 0
      ? sources
          .map((s) => `- ${s.name}${s.url ? ` (${s.url})` : ''} — ${s.description_fr}`)
          .join('\n')
      : `- Site web officiel de l'entreprise
- LinkedIn (pages entreprises et profils dirigeants)
- Google Maps (fiche Business)
- Annuaires professionnels tunisiens`;

  return `Tu es un expert en recherche de contacts B2B spécialisé dans le marché tunisien.

## Objectif
Enrichir les informations d'une entreprise tunisienne en trouvant le décideur clé et ses coordonnées.

## Instructions
1. Utilise web_search pour rechercher l'entreprise et ses dirigeants.
2. Utilise web_fetch pour visiter le site web de l'entreprise, leur page LinkedIn, etc.
3. Cherche en priorité :
   - Le directeur général / PDG / gérant
   - Le directeur commercial / responsable achats
   - Le directeur technique (pour les garages)
   - Le responsable sinistres (pour les assurances)
   - Le responsable flotte (pour les entreprises de leasing)

## Sources à consulter
${sourcesBlock}

## Données à collecter
- Nom complet du décideur
- Titre / rôle exact
- Email professionnel (préférer les emails @entreprise.tn)
- URL LinkedIn (profil personnel ou page entreprise)
- Numéro de téléphone (format +216XXXXXXXX)
- Site web officiel
- Notes complémentaires (taille, spécialité, actualités récentes)

## Format de sortie
Réponds UNIQUEMENT avec un JSON valide (sans markdown fences) :
{
  "contact_name": "Prénom Nom",
  "role": "Directeur Général",
  "email": "prenom.nom@entreprise.tn",
  "linkedin_url": "https://linkedin.com/in/...",
  "phone": "+21671234567",
  "website": "https://www.entreprise.tn",
  "notes": "Informations complémentaires pertinentes"
}

## Règles
- Ne retourne QUE des informations réelles trouvées via ta recherche
- Ne génère PAS de données fictives ou inventées
- Si tu ne trouves pas une information, omets le champ
- Les emails doivent être des adresses professionnelles réalistes
- Les numéros tunisiens commencent par +216 suivi de 8 chiffres`;
}

function buildEnrichmentUserPrompt(prospect: Prospect): string {
  return `Enrichis les informations de l'entreprise suivante :

- **Entreprise** : ${prospect.company}
- **Segment** : ${prospect.segment}
- **Ville** : ${prospect.city ?? 'Non spécifié (cherche en Tunisie)'}
- **Informations actuelles** :
  - Contact : ${prospect.contact_name ?? 'Inconnu'}
  - Email : ${prospect.email ?? 'Inconnu'}
  - LinkedIn : ${prospect.linkedin_url ?? 'Inconnu'}
  - Téléphone : ${prospect.whatsapp_e164 ?? 'Inconnu'}
${prospect.notes ? `  - Notes : ${prospect.notes}` : ''}

Recherche le décideur clé (directeur, responsable) et ses coordonnées.
Retourne les résultats en JSON selon le format spécifié.`;
}

// ─── Enrichment function ───────────────────────────────────────────

export async function enrichProspect(opts: EnrichOptions): Promise<EnrichResult> {
  const prospect = await getProspect(opts.prospect_id);

  // Fetch dynamic enrichment sources
  const sources = await getEnrichmentSources(prospect.segment);

  // Create agent_run row
  const { data: runRow, error: runErr } = await supabaseAdmin()
    .from('agent_runs')
    .insert({
      agent_type: 'sales',
      trigger: opts.trigger ?? 'manual',
      input: { action: 'enrich', prospect_id: opts.prospect_id, company: prospect.company },
    })
    .select('id')
    .single();
  if (runErr) throw new Error(`[sales/enrichment] Failed to create run: ${runErr.message}`);
  const run_id: string = runRow!.id;

  const startMs = Date.now();

  try {
    const result = await runClaudeWithTools({
      systemPrompt: buildEnrichmentSystemPrompt(sources),
      userPrompt: buildEnrichmentUserPrompt(prospect),
      maxTokens: 4096,
      maxTurns: 6,
    });

    // Parse the JSON response
    const cleaned = result.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let enriched: EnrichedData = {};
    try {
      enriched = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        enriched = JSON.parse(jsonMatch[0]);
      }
    }

    // Only update fields that have new data and prospect doesn't already have
    const updates: Record<string, string> = {};
    const fields_updated: string[] = [];

    if (enriched.contact_name && !prospect.contact_name) {
      updates.contact_name = enriched.contact_name.trim();
      fields_updated.push('contact_name');
    }
    if (enriched.role && !prospect.role) {
      updates.role = enriched.role.trim();
      fields_updated.push('role');
    }
    if (enriched.email && !prospect.email) {
      updates.email = enriched.email.trim();
      fields_updated.push('email');
    }
    if (enriched.linkedin_url && !prospect.linkedin_url) {
      updates.linkedin_url = enriched.linkedin_url.trim();
      fields_updated.push('linkedin_url');
    }
    if (enriched.phone && !prospect.whatsapp_e164) {
      updates.whatsapp_e164 = enriched.phone.trim();
      fields_updated.push('whatsapp_e164');
    }

    // Build notes (append website + new notes)
    const noteParts: string[] = [];
    if (enriched.website) noteParts.push(`Site: ${enriched.website}`);
    if (enriched.notes) noteParts.push(enriched.notes);
    if (noteParts.length > 0) {
      const existing = prospect.notes ?? '';
      const newNotes = noteParts.join(' | ');
      updates.notes = existing ? `${existing} | ${newNotes}` : newNotes;
      fields_updated.push('notes');
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      // Mark source as enriched
      updates.source =
        prospect.source === 'ai_discovery'
          ? 'ai_discovery+enriched'
          : `${prospect.source}+enriched`;

      const { error: updateErr } = await supabaseAdmin()
        .from('agent_prospects')
        .update(updates)
        .eq('id', prospect.id);
      if (updateErr) throw new Error(`[sales/enrichment] Update failed: ${updateErr.message}`);
    }

    // Update run
    const duration_ms = Date.now() - startMs;
    await supabaseAdmin()
      .from('agent_runs')
      .update({
        status: 'success',
        output_summary: { fields_updated, enriched_data: enriched, turns: result.turns },
        tokens_input: result.tokens_input,
        tokens_output: result.tokens_output,
        cost_usd: result.cost_usd,
        duration_ms,
      })
      .eq('id', run_id);

    return {
      run_id,
      prospect_id: prospect.id,
      fields_updated,
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

// ─── Batch enrichment ──────────────────────────────────────────────

export async function enrichProspectsBatch(opts: EnrichBatchOptions): Promise<EnrichResult[]> {
  const batchSize = Math.min(opts.batch_size ?? 5, 10); // Cap at 10

  let query = supabaseAdmin()
    .from('agent_prospects')
    .select('id')
    .not('source', 'ilike', '%enriched%')
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (opts.segment) query = query.eq('segment', opts.segment);

  const { data: prospects, error } = await query;
  if (error) throw new Error(`[sales/enrichment] Batch query failed: ${error.message}`);
  if (!prospects || prospects.length === 0) return [];

  const results: EnrichResult[] = [];
  for (const p of prospects) {
    try {
      const result = await enrichProspect({
        prospect_id: p.id,
        trigger: opts.trigger ?? 'api',
      });
      results.push(result);
    } catch {
      // Continue with next prospect on individual failure
      continue;
    }
  }

  return results;
}
