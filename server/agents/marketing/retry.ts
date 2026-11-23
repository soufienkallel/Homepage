// Feedback loop: retry guardrail-blocked drafts by asking Claude to self-correct.
// Max retries per draft is capped at 2 to control costs.
// Uses a cheaper model (ANTHROPIC_MODEL_RETRY) if configured.

import { runClaude, type ClaudeRunResult, type ClaudeImageInput } from '../shared/claude-client.js';
import type { AgentChannel, AgentLanguage, ImageSpec } from '../shared/types.js';
import { PRICE_FROM_INLINE } from '../../../src/data/pricing.js';

const MAX_RETRIES = 2;

interface RetryableDraft {
  channel: AgentChannel;
  language: AgentLanguage;
  body: string;
  hashtags: string[];
  image_brief?: string;
  image_spec?: ImageSpec;
  image_html?: string;
  // Read by runner.ts after a retry; the correction prompt does not produce it yet,
  // so a retried draft currently keeps no image_prompt (behaviour unchanged).
  image_prompt?: string;
  pillar?: string;
}

export interface RetryResult {
  corrected: RetryableDraft | null;
  attempts: number;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
}

const RETRY_SYSTEM_PROMPT = `You are a content editor for MALLOULIAUTO. A marketing draft was rejected by automated guardrails. Your job is to fix ONLY the issues listed — do not rewrite the draft from scratch, preserve the original intent and style.

Return ONLY the corrected JSON object (same schema as input). No markdown fences, no commentary.

HARD RULES (same as original generation):
1. No emojis, anywhere (post body, subject, hashtags, image HTML).
2. French accents mandatory (Véhicule, Révision, Réparation, Contrôle, Coût, Précision, expirée, dépassée, Citroën, détection, etc.)
3. No third-party vendor names (PAVE, DeepSeek, Groq, Exypnos, Anthropic, Claude, OpenAI). Never attribute a report finding, severity or cost to AI; never present AI or IoT as working or in production.
4. URLs: only mallouliauto.com, platform.mallouliauto.com, calendar.zoho.com (demo booking), wa.me/<phone>.
5. The only price allowed is the public one, "${PRICE_FROM_INLINE}". Remove any other amount (exact price, travel fee, volume price, commission) rather than rewording it.
6. Always include #MALLOULIAUTO in hashtags.`;

// Brand logo placeholder instructions — injected into the prompt when image corrections reference visual elements
const BRAND_LOGO_CONTEXT = `
## MALLOULIAUTO Brand Logo — Placeholder tokens

Do NOT try to draw the compass-rose logo with SVG paths. Instead, use these placeholder tokens which the renderer replaces with the real logo automatically:

- Full wordmark (logo + text): \`<img src="{{MALLOULIAUTO_LOGO}}" style="height:40px" alt="MALLOULIAUTO">\`
- Compass-rose icon only: \`<img src="{{MALLOULIAUTO_ICON}}" style="width:48px;height:48px" alt="MALLOULIAUTO icon">\`

Adjust style dimensions as needed. The logos have transparent backgrounds so they work on any background color.
The wordmark text is: "MALLOULI" (weight 700, white or navy) + "AUTO" (weight 700, #FE7743).
Brand colors: #447D9B (blue), #FE7743 (orange), #273F4F (navy), #D7D7D7 (gray), #10B981 (emerald).
`;

function buildRetryPrompt(draft: RetryableDraft, blockedReasons: string[]): string {
  const hasImageCorrection = blockedReasons.some(
    (r) =>
      r.includes('image') ||
      r.includes('logo') ||
      r.includes('Image') ||
      r.includes('Logo') ||
      r.includes('SVG') ||
      r.includes('svg')
  );
  const imageNote = hasImageCorrection
    ? `\n\n## IMPORTANT: Image/Logo corrections\nIf the correction involves the logo or image_html, use the placeholder tokens {{MALLOULIAUTO_LOGO}} and {{MALLOULIAUTO_ICON}} as img src values. Do NOT draw the compass-rose logo with SVG paths — the renderer injects the real logo automatically.`
    : '';

  return `## Rejected draft

\`\`\`json
${JSON.stringify(draft, null, 2)}
\`\`\`

## Guardrail violations (MUST fix all)

${blockedReasons.map((r) => `- ${r}`).join('\n')}${imageNote}

## Instructions

Fix each violation listed above. Return the corrected draft as a single JSON object with the same fields: channel, language, body, hashtags, image_html, pillar.
The image_html field MUST be a complete HTML document starting with <!DOCTYPE html> — NOT a bare SVG. It must include <html>, <head> with a <style> for margins/sizing, and <body> containing the SVG.
IMPORTANT: The viewport depends on the channel — LinkedIn uses 1200×630px, Instagram and Facebook use 1080×1080px. Match the dimensions to the draft's channel.

CRITICAL CSS RULES for image_html (headless Chrome rendering):
- Do NOT use backdrop-filter (not supported in headless Chrome).
- Always set explicit background colors on html AND body elements (never rely on transparent).
- Use font-family: Arial, sans-serif for maximum compatibility.
- For Arabic/RTL content, use dir="rtl" on a <div> inside <body>, NOT on <html> or <body> elements.

Do NOT change content that isn't related to the violations.`;
}

/**
 * Attempt to fix a guardrail-blocked draft by prompting Claude with the error reasons.
 * Returns the corrected draft if successful within MAX_RETRIES, or null if all attempts fail.
 */
export async function retryBlockedDraft(
  draft: RetryableDraft,
  blockedReasons: string[],
  validateFn?: (corrected: RetryableDraft) => { passed: boolean; blocked_reasons: string[] },
  /** Optional reference images for Claude to see (e.g., brand logo reference). */
  images?: ClaudeImageInput[]
): Promise<RetryResult> {
  let attempts = 0;
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let totalCost = 0;
  let currentDraft = draft;
  let currentReasons = blockedReasons;

  const retryModel = process.env.ANTHROPIC_MODEL_RETRY ?? undefined;
  // When images are attached, include brand logo placeholder context
  const systemPrompt =
    images && images.length > 0
      ? RETRY_SYSTEM_PROMPT + '\n' + BRAND_LOGO_CONTEXT
      : RETRY_SYSTEM_PROMPT;

  while (attempts < MAX_RETRIES) {
    attempts++;

    const result: ClaudeRunResult<RetryableDraft> = await runClaude<RetryableDraft>({
      model: retryModel,
      systemPrompt,
      userPrompt: buildRetryPrompt(currentDraft, currentReasons),
      images,
      expectJson: true,
      // Image corrections need more tokens since image_html can be very long
      maxTokens: images && images.length > 0 ? 8192 : 4096,
    });

    totalTokensIn += result.tokens_input;
    totalTokensOut += result.tokens_output;
    totalCost += result.cost_usd;

    // Validate the corrected draft
    if (validateFn) {
      const check = validateFn(result.data);
      if (check.passed) {
        return {
          corrected: result.data,
          attempts,
          tokens_input: totalTokensIn,
          tokens_output: totalTokensOut,
          cost_usd: totalCost,
        };
      }
      // Still failing — update reasons for next attempt
      currentDraft = result.data;
      currentReasons = check.blocked_reasons;
    } else {
      // No validation function — assume success after one correction
      return {
        corrected: result.data,
        attempts,
        tokens_input: totalTokensIn,
        tokens_output: totalTokensOut,
        cost_usd: totalCost,
      };
    }
  }

  // All retries exhausted
  return {
    corrected: null,
    attempts,
    tokens_input: totalTokensIn,
    tokens_output: totalTokensOut,
    cost_usd: totalCost,
  };
}
