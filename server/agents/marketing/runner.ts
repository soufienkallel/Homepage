// Marketing agent runner — orchestrates Claude + tools + guardrails + retry loop.
// See doc/requirements/mallouliauto_agents_specifications.md §5.1

import { runClaude } from '../shared/claude-client.js';
import { runGuardrails } from '../shared/guardrails.js';
import { loadKnowledge } from '../shared/knowledge.js';
import { supabaseAdmin } from '../shared/supabase.js';
import { listRecentDrafts, saveDraft, countTodayDrafts } from './tools.js';
import { retryBlockedDraft } from './retry.js';
import { isImageValidationEnabled, validateImageHtml } from './image-validator.js';
import { MARKETING_SYSTEM_PROMPT } from './system-prompt-text.js';
import type {
  AgentChannel,
  AgentLanguage,
  AgentSegment,
  DraftContent,
  ImageSpec,
} from '../shared/types.js';

interface MarketingDraftRaw {
  channel: AgentChannel;
  language: AgentLanguage;
  body: string;
  hashtags: string[];
  image_brief?: string;
  image_spec?: ImageSpec;
  image_html?: string;
  /** Structured prompt for external AI image generation (DALL-E 3 / Gemini Imagen). */
  image_prompt?: string;
  pillar?: string;
}

export interface MarketingRunOptions {
  trigger: 'cron' | 'manual' | 'api';
  /** Override default draft count (5–9). */
  draftCount?: number;
  /** Override target channels (default: linkedin + facebook + instagram). */
  channels?: AgentChannel[];
  /** Override target languages (default: fr + ar). */
  languages?: AgentLanguage[];
  /** Campaign scope — target segment for value prop selection. */
  segment?: AgentSegment | 'all';
  /** Campaign scope — content objective. */
  objective?: 'awareness' | 'lead_gen' | 'conversion' | 'engagement' | 'recruitment';
  /** Campaign scope — restrict to specific pillars. */
  pillars?: string[];
}

export interface MarketingRunResult {
  run_id: string;
  drafts_created: number;
  drafts_blocked: number;
  drafts_retried: number;
  drafts_recovered: number;
  tokens_input: number;
  tokens_output: number;
  retry_tokens_input: number;
  retry_tokens_output: number;
  cost_usd: number;
  retry_cost_usd: number;
  model: string;
}

export async function runMarketingAgent(opts: MarketingRunOptions): Promise<MarketingRunResult> {
  const dailyCap = Number(process.env.AGENT_DAILY_DRAFT_CAP ?? 50);
  const todayCount = await countTodayDrafts();
  if (todayCount >= dailyCap) {
    throw new Error(`[marketing] Daily draft cap reached (${todayCount}/${dailyCap}). Aborting.`);
  }

  // Create agent_run row
  const { data: runRow, error: runErr } = await supabaseAdmin()
    .from('agent_runs')
    .insert({
      agent_type: 'marketing',
      trigger: opts.trigger,
      input: {
        draftCount: opts.draftCount,
        channels: opts.channels,
        languages: opts.languages,
        segment: opts.segment,
        objective: opts.objective,
        pillars: opts.pillars,
      },
    })
    .select('id')
    .single();
  if (runErr) throw new Error(`[marketing] Failed to create run: ${runErr.message}`);
  const run_id: string = runRow!.id;

  const startMs = Date.now();

  try {
    // Load context
    const segment = opts.segment && opts.segment !== 'all' ? (opts.segment as AgentSegment) : null;
    const knowledge = await loadKnowledge(segment);
    const recent = await listRecentDrafts(20);
    const systemPrompt = MARKETING_SYSTEM_PROMPT;

    const channels = opts.channels ?? ['linkedin', 'facebook', 'instagram'];
    const languages = opts.languages ?? ['fr', 'ar'];
    const count = Math.min(opts.draftCount ?? 7, dailyCap - todayCount);

    const userPrompt = buildUserPrompt({
      knowledge,
      recentPosts: recent,
      channels: channels as AgentChannel[],
      languages: languages as AgentLanguage[],
      count,
      objective: opts.objective,
      pillars: opts.pillars,
      segment: opts.segment,
    });

    // Call Claude
    const result = await runClaude<MarketingDraftRaw[]>({
      systemPrompt,
      userPrompt,
      expectJson: true,
      maxTokens: 16384,
    });

    // Save each draft through guardrails (with retry on failure)
    let drafts_created = 0;
    let drafts_blocked = 0;
    let drafts_retried = 0;
    let drafts_recovered = 0;
    let retryTokensIn = 0;
    let retryTokensOut = 0;
    let retryCost = 0;

    const shouldValidateImages = isImageValidationEnabled();

    for (const raw of result.data) {
      const content: DraftContent & { pillar?: string } = {
        body: raw.body,
        hashtags: raw.hashtags,
        image_brief: raw.image_brief,
        image_prompt: raw.image_prompt,
        image_spec: raw.image_spec,
        image_html: raw.image_html,
        pillar: raw.pillar,
      };

      const saved = await saveDraft({
        channel: raw.channel,
        language: raw.language,
        content,
        run_id,
      });

      if (saved.status === 'pending_review') {
        // Draft passed guardrails — optionally validate image
        if (shouldValidateImages && content.image_html) {
          const imgCheck = await validateImageHtml(content);
          if (!imgCheck.valid) {
            // Image failed — attempt retry with image error as reason
            drafts_retried++;
            const retryResult = await retryBlockedDraft(
              raw,
              [`image_render_failed: ${imgCheck.error}`],
              (corrected) => {
                const guardrailCheck = runGuardrails({
                  agentType: 'marketing',
                  channel: corrected.channel,
                  language: corrected.language,
                  content: {
                    body: corrected.body,
                    hashtags: corrected.hashtags,
                    image_html: corrected.image_html,
                  },
                });
                return guardrailCheck;
              }
            );
            retryTokensIn += retryResult.tokens_input;
            retryTokensOut += retryResult.tokens_output;
            retryCost += retryResult.cost_usd;

            if (retryResult.corrected) {
              // Overwrite the draft in DB with corrected version
              const correctedContent: DraftContent & { pillar?: string } = {
                body: retryResult.corrected.body,
                hashtags: retryResult.corrected.hashtags,
                image_prompt: retryResult.corrected.image_prompt,
                image_html: retryResult.corrected.image_html,
                pillar: retryResult.corrected.pillar,
              };
              await supabaseAdmin()
                .from('agent_drafts')
                .update({ content: correctedContent })
                .eq('id', saved.id);
              drafts_recovered++;
            }
          }
        }
        drafts_created++;
      } else {
        // Draft blocked by guardrails — attempt retry
        drafts_retried++;
        const retryResult = await retryBlockedDraft(
          raw,
          saved.guardrails.blocked_reasons,
          (corrected) => {
            const guardrailCheck = runGuardrails({
              agentType: 'marketing',
              channel: corrected.channel,
              language: corrected.language,
              content: {
                body: corrected.body,
                hashtags: corrected.hashtags,
                image_html: corrected.image_html,
              },
            });
            return guardrailCheck;
          }
        );
        retryTokensIn += retryResult.tokens_input;
        retryTokensOut += retryResult.tokens_output;
        retryCost += retryResult.cost_usd;

        if (retryResult.corrected) {
          // Save the corrected draft (will pass guardrails this time)
          const correctedContent: DraftContent & { pillar?: string } = {
            body: retryResult.corrected.body,
            hashtags: retryResult.corrected.hashtags,
            image_brief: retryResult.corrected.image_brief,
            image_prompt: retryResult.corrected.image_prompt,
            image_spec: retryResult.corrected.image_spec,
            image_html: retryResult.corrected.image_html,
            pillar: retryResult.corrected.pillar,
          };
          await saveDraft({
            channel: retryResult.corrected.channel,
            language: retryResult.corrected.language,
            content: correctedContent,
            run_id,
          });
          drafts_created++;
          drafts_recovered++;
        } else {
          drafts_blocked++;
        }
      }
    }

    const durationMs = Date.now() - startMs;

    // Update run row
    const summary: MarketingRunResult = {
      run_id,
      drafts_created,
      drafts_blocked,
      drafts_retried,
      drafts_recovered,
      tokens_input: result.tokens_input,
      tokens_output: result.tokens_output,
      retry_tokens_input: retryTokensIn,
      retry_tokens_output: retryTokensOut,
      cost_usd: result.cost_usd,
      retry_cost_usd: retryCost,
      model: result.model,
    };

    await supabaseAdmin()
      .from('agent_runs')
      .update({
        status: 'success',
        output_summary: summary,
        tokens_input: result.tokens_input + retryTokensIn,
        tokens_output: result.tokens_output + retryTokensOut,
        cost_usd: result.cost_usd + retryCost,
        duration_ms: durationMs,
      })
      .eq('id', run_id);

    return summary;
  } catch (err) {
    const durationMs = Date.now() - startMs;
    await supabaseAdmin()
      .from('agent_runs')
      .update({
        status: 'failed',
        error: (err as Error).message,
        duration_ms: durationMs,
      })
      .eq('id', run_id);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

interface PromptContext {
  knowledge: Awaited<ReturnType<typeof loadKnowledge>>;
  recentPosts: Awaited<ReturnType<typeof listRecentDrafts>>;
  channels: AgentChannel[];
  languages: AgentLanguage[];
  count: number;
  objective?: string;
  pillars?: string[];
  segment?: string;
}

function buildUserPrompt(ctx: PromptContext): string {
  const recentSummary =
    ctx.recentPosts.length > 0
      ? ctx.recentPosts
          .slice(0, 10)
          .map((p) => `- [${p.channel}/${p.language}] (${p.pillar}) ${p.body.slice(0, 80)}...`)
          .join('\n')
      : '(no previous posts)';

  // Campaign scope instructions
  const pillarList =
    ctx.pillars && ctx.pillars.length > 0
      ? ctx.pillars.join(', ')
      : 'product_education, customer_story, market_data, partner_ecosystem, recruitment';

  const objectiveInstructions = ctx.objective
    ? `\n\n## Campaign Objective\nAll drafts must serve this objective: **${ctx.objective}**.\n- awareness → educational, brand-building content\n- lead_gen → include CTAs, demo offers, pain-point hooks\n- conversion → urgency, social proof, pricing advantages\n- engagement → questions, polls, community-building\n- recruitment → team culture, growth opportunities`
    : '';

  const segmentInstructions =
    ctx.segment && ctx.segment !== 'all'
      ? `\n\n## Target Segment\nAll drafts target the **${ctx.segment}** segment. Tailor messaging, pain points, and value propositions specifically for this audience.`
      : '';

  return `## Knowledge Base

### Company
${ctx.knowledge.company}

### Brand Voice
${ctx.knowledge.voice}

### Proof Points
${ctx.knowledge.proof}

### Value Proposition
${ctx.knowledge.valueProp}
${segmentInstructions}${objectiveInstructions}

## Recent posts (avoid repeating similar topics)
${recentSummary}

## Task
Generate exactly **${ctx.count}** social media drafts for this week.

Distribute across:
- Channels: ${ctx.channels.join(', ')}
- Languages: ${ctx.languages.join(', ')}
- Pillars: rotate through: ${pillarList}

Ensure a good mix of channels, languages, and pillars. Do NOT repeat a topic already covered in recent posts above.

Return ONLY a JSON array — no markdown fences, no commentary.`;
}
