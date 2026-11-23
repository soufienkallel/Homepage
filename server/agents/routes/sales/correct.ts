// POST /api/agents/sales/correct — AI-powered correction of a sales draft.
// Body: { id: string, instructions: string }
// The admin provides correction instructions (e.g., "Trop formel", "Raccourcir le body",
// "Ajouter le nom du contact"), and Claude fixes the draft.
// Auth: admin Supabase session (server/adminAuth.js)
// Runtime: Node.js (bundled via esbuild into _correct-bundle.js)

import { checkAuth } from '../../../adminAuth.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { runClaude } from '../../shared/claude-client.js';
import { runGuardrails } from '../../shared/guardrails.js';
import type { AgentChannel, AgentLanguage } from '../../shared/types.js';
import { PRICE_FROM_INLINE } from '../../../../src/data/pricing.js';

const CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function setCors(res: VercelResponse): void {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
}

function sb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const CORRECT_SYSTEM_PROMPT = `Tu es un éditeur de contenu commercial B2B pour MALLOULIAUTO. Un brouillon de prospection a besoin de corrections. Ton travail est de corriger UNIQUEMENT les problèmes indiqués — ne réécris pas le brouillon de zéro, préserve l'intention et le style d'origine.

Retourne UNIQUEMENT le JSON corrigé (même schéma que l'entrée). Pas de markdown fences, pas de commentaire.

RÈGLES STRICTES (identiques à la génération originale) :
1. Zéro emoji — jamais, nulle part.
2. Accents français obligatoires (Véhicule, Révision, Réparation, Contrôle, Coût, Précision, expirée, dépassée, Citroën, détection, etc.)
3. Aucun nom de fournisseur technique (PAVE, DeepSeek, Groq, Exypnos, Anthropic, Claude, OpenAI). N'attribue jamais un constat, une gravité ou un coût à une IA ; l'IA et l'IoT ne sont jamais présentés comme fonctionnels ou en production.
4. URLs autorisées uniquement : mallouliauto.com, platform.mallouliauto.com, calendar.zoho.com (réservation démo), wa.me/<phone>.
5. Aucun prix pour un professionnel (tarif, prix de volume, commission). Seul le tarif public « ${PRICE_FROM_INLINE} » est permis, pour un particulier : supprime tout autre montant.
6. Le body doit TOUJOURS contenir le lien de réservation démo (calendar.zoho.com).
7. Ton professionnel, direct et respectueux.`;

function buildCorrectionPrompt(
  draft: { channel: string; language: string; subject?: string; body: string },
  instructions: string
): string {
  return `## Brouillon actuel

\`\`\`json
${JSON.stringify(draft, null, 2)}
\`\`\`

## Instructions de correction de l'administrateur

${instructions}

## Consigne

Applique les corrections demandées ci-dessus. Retourne le brouillon corrigé en JSON avec les mêmes champs : channel, language, subject (si email), body.
Ne modifie PAS le contenu qui n'est pas concerné par les instructions.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' },
      timestamp: new Date().toISOString(),
    });
  }
  if (!(await checkAuth(req))) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Admin session required' },
      timestamp: new Date().toISOString(),
    });
  }

  const body = req.body ?? {};
  const { id, instructions } = body as { id?: string; instructions?: string };

  if (!id || !instructions || instructions.trim().length === 0) {
    return res.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'Required: { id: string, instructions: string }' },
      timestamp: new Date().toISOString(),
    });
  }

  // Fetch the existing draft
  const { data: draft, error: fetchErr } = await sb()
    .from('agent_drafts')
    .select('*')
    .eq('id', id)
    .eq('agent_type', 'sales')
    .single();

  if (fetchErr || !draft) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Draft ${id} not found` },
      timestamp: new Date().toISOString(),
    });
  }

  const content = draft.content as Record<string, unknown>;
  const draftForCorrection = {
    channel: draft.channel as string,
    language: draft.language as string,
    subject: content.subject as string | undefined,
    body: (content.body as string) ?? '',
  };

  try {
    const result = await runClaude<{
      channel: string;
      language: string;
      subject?: string;
      body: string;
    }>({
      systemPrompt: CORRECT_SYSTEM_PROMPT,
      userPrompt: buildCorrectionPrompt(draftForCorrection, instructions.trim()),
      expectJson: true,
      maxTokens: 2048,
    });

    const corrected = result.data;

    // Run guardrails on corrected content
    const calComDemoUrl = process.env.CAL_COM_DEMO_URL ?? 'https://cal.com/mallouliauto/demo-15min';
    const guardrailCheck = runGuardrails({
      agentType: 'sales',
      channel: (corrected.channel ?? draft.channel) as AgentChannel,
      language: (corrected.language ?? draft.language) as AgentLanguage,
      content: { subject: corrected.subject, body: corrected.body },
      calComDemoUrl,
    });

    // Update the draft in DB
    const correctedContent = {
      ...content,
      body: corrected.body,
      subject: corrected.subject,
    };

    const { data: updated, error: updateErr } = await sb()
      .from('agent_drafts')
      .update({
        content: correctedContent,
        guardrails: guardrailCheck,
        status: 'pending_review',
        reject_reason: null,
      })
      .eq('id', id)
      .select('id, status, content, channel, language, guardrails')
      .single();

    if (updateErr) {
      return res.status(500).json({
        error: { code: 'DB_ERROR', message: updateErr.message },
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      draft: updated,
      correction: {
        tokens_input: result.tokens_input,
        tokens_output: result.tokens_output,
        cost_usd: result.cost_usd,
        guardrails_passed: guardrailCheck.passed,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: { code: 'CORRECTION_ERROR', message: (err as Error).message },
      timestamp: new Date().toISOString(),
    });
  }
}
