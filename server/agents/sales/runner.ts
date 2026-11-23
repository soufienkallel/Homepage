// Sales agent runner — generates a 3-touch outbound sequence for a prospect.
// See doc/requirements/mallouliauto_agents_specifications.md §5.2

import { runClaude } from '../shared/claude-client.js';
import { loadKnowledge } from '../shared/knowledge.js';
import { supabaseAdmin } from '../shared/supabase.js';
import type { AgentChannel, AgentLanguage, DraftContent } from '../shared/types.js';
import { SALES_SYSTEM_PROMPT } from './system-prompt-text.js';
import {
  getProspect,
  listProspectTouches,
  saveSalesDraft,
  updateProspectStatus,
  type Prospect,
} from './tools.js';

interface SalesTouchRaw {
  day: number;
  channel: 'email' | 'linkedin_dm' | 'whatsapp';
  language: AgentLanguage;
  subject?: string;
  body: string;
}

interface SalesOutput {
  touches: SalesTouchRaw[];
}

export interface SalesRunOptions {
  trigger: 'cron' | 'manual' | 'api';
  prospect_id: string;
}

export interface SalesRunResult {
  run_id: string;
  prospect_id: string;
  touches_created: number;
  touches_blocked: number;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  model: string;
}

function buildUserPrompt(
  prospect: Prospect,
  knowledge: { company: string; voice: string; proof: string; valueProp: string },
  priorTouches: string[]
): string {
  const calUrl =
    process.env.CAL_COM_DEMO_URL ??
    'https://calendar.zoho.com/zc/view/slot-booking/zz08011220ffb6cf75cb62a5e4811b76cf2ae7ed1fa19cdea04f9e14b8c2f8a7f24dd480c6';

  return `## Prospect

- **Entreprise** : ${prospect.company}
- **Contact** : ${prospect.contact_name ?? 'Non spécifié'}
- **Rôle** : ${prospect.role ?? 'Non spécifié'}
- **Segment** : ${prospect.segment}
- **Ville** : ${prospect.city ?? 'Tunis'}
- **Langue** : ${prospect.language === 'ar' ? 'Arabe (MSA)' : 'Français'}
- **Email** : ${prospect.email ?? 'Non disponible'}
- **LinkedIn** : ${prospect.linkedin_url ?? 'Non disponible'}
- **WhatsApp** : ${prospect.whatsapp_e164 ?? 'Non disponible'}
- **Notes** : ${prospect.notes ?? 'Aucune'}

## Lien de démo (CTA obligatoire dans chaque touche)

${calUrl}

## Contexte entreprise MALLOULIAUTO

${knowledge.company}

## Voix & ton

${knowledge.voice}

## Faits & preuves (à citer)

${knowledge.proof}

## Proposition de valeur pour le segment "${prospect.segment}"

${knowledge.valueProp}

${priorTouches.length > 0 ? `## Touches précédentes envoyées\n\n${priorTouches.join('\n\n---\n\n')}` : ''}

---

Génère maintenant la séquence de 3 touches en JSON.`;
}

export async function runSalesAgent(opts: SalesRunOptions): Promise<SalesRunResult> {
  const prospect = await getProspect(opts.prospect_id);

  // Create agent_run row
  const { data: runRow, error: runErr } = await supabaseAdmin()
    .from('agent_runs')
    .insert({
      agent_type: 'sales',
      trigger: opts.trigger,
      input: { prospect_id: opts.prospect_id, segment: prospect.segment },
    })
    .select('id')
    .single();
  if (runErr) throw new Error(`[sales] Failed to create run: ${runErr.message}`);
  const run_id: string = runRow!.id;

  const startMs = Date.now();

  try {
    // Load knowledge for the prospect's segment
    const knowledge = await loadKnowledge(prospect.segment);

    // Get prior touches for context
    const priorTouchRows = await listProspectTouches(prospect.id);
    const priorTouches = priorTouchRows.map((t) => `[${t.channel}] (${t.status}) ${t.body}`);

    const userPrompt = buildUserPrompt(prospect, knowledge, priorTouches);

    // Call Claude
    const result = await runClaude<SalesOutput>({
      systemPrompt: SALES_SYSTEM_PROMPT,
      userPrompt,
      expectJson: true,
      maxTokens: 4096,
    });

    // Save each touch
    let touches_created = 0;
    let touches_blocked = 0;

    for (const touch of result.data.touches) {
      const content: DraftContent = {
        subject: touch.subject,
        body: touch.body,
      };

      const saved = await saveSalesDraft({
        channel: touch.channel as AgentChannel,
        language: touch.language,
        segment: prospect.segment,
        content,
        run_id,
        prospect_id: prospect.id,
      });

      if (saved.status === 'pending_review') {
        touches_created++;
      } else {
        touches_blocked++;
      }
    }

    // Update prospect status
    const newStatus = touches_created > 0 ? 'sequence_generated' : prospect.status;
    const nextTouch = new Date();
    nextTouch.setDate(nextTouch.getDate() + 3);

    await updateProspectStatus(prospect.id, newStatus as any, {
      last_touch_at: new Date().toISOString(),
      next_touch_at: nextTouch.toISOString(),
    });

    // Update run with results
    const duration_ms = Date.now() - startMs;
    await supabaseAdmin()
      .from('agent_runs')
      .update({
        status: touches_blocked > 0 && touches_created === 0 ? 'failed' : 'success',
        output_summary: { touches_created, touches_blocked },
        tokens_input: result.tokens_input,
        tokens_output: result.tokens_output,
        cost_usd: result.cost_usd,
        duration_ms,
      })
      .eq('id', run_id);

    return {
      run_id,
      prospect_id: prospect.id,
      touches_created,
      touches_blocked,
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
        error: (err as Error).message,
        duration_ms,
      })
      .eq('id', run_id);
    throw err;
  }
}
