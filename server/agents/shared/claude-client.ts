// Anthropic Claude client wrapper with cost calculation.
// See doc/requirements/mallouliauto_agents_specifications.md §3.1, §7

import Anthropic from '@anthropic-ai/sdk';

// Pricing per 1M tokens, USD. Update if Anthropic changes pricing.
// Source: https://www.anthropic.com/pricing
const PRICING: Record<string, { input: number; output: number }> = {
  // Latest models (2025+)
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 },
  'claude-opus-4': { input: 15.0, output: 75.0 },
  // Older naming conventions (fallback)
  'claude-3-5-sonnet-latest': { input: 3.0, output: 15.0 },
  'claude-3-5-haiku-latest': { input: 1.0, output: 5.0 },
};

export interface ClaudeRunResult<T> {
  data: T;
  raw_text: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  model: string;
}

let _client: Anthropic | null = null;

function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      '[agents] ANTHROPIC_API_KEY missing. Set it in .env (see doc/requirements/mallouliauto_agents_specifications.md §7).'
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

function computeCost(model: string, tokensIn: number, tokensOut: number): number {
  const p = PRICING[model] ?? PRICING['claude-sonnet-4-5'];
  return Number(((tokensIn * p.input + tokensOut * p.output) / 1_000_000).toFixed(4));
}

/** Image attachment for vision-enabled requests. */
export interface ClaudeImageInput {
  /** Base64-encoded image data. */
  base64: string;
  /** MIME type: image/png, image/jpeg, image/gif, image/webp */
  media_type: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
}

export interface RunClaudeOptions {
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  /** Optional images to attach (vision). Claude will see these alongside the text. */
  images?: ClaudeImageInput[];
  maxTokens?: number;
  /** If provided, expects model to return JSON matching this shape (parsed). */
  expectJson?: boolean;
}

/**
 * Run a single Claude completion. Returns parsed JSON if `expectJson` is true,
 * otherwise the raw text. Always returns token counts and computed USD cost.
 */
export async function runClaude<T = string>(opts: RunClaudeOptions): Promise<ClaudeRunResult<T>> {
  const model = opts.model ?? process.env.ANTHROPIC_MODEL_DRAFT ?? 'claude-sonnet-4-5';
  const c = client();

  // Build user content: text-only or multi-part (images + text)
  let userContent: Anthropic.MessageCreateParams['messages'][0]['content'];
  if (opts.images && opts.images.length > 0) {
    const parts: Anthropic.ContentBlockParam[] = opts.images.map((img) => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: img.media_type, data: img.base64 },
    }));
    parts.push({ type: 'text' as const, text: opts.userPrompt });
    userContent = parts;
  } else {
    userContent = opts.userPrompt;
  }

  const response = await c.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });

  const raw_text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  const tokens_input = response.usage?.input_tokens ?? 0;
  const tokens_output = response.usage?.output_tokens ?? 0;
  const cost_usd = computeCost(model, tokens_input, tokens_output);

  let data: T;
  if (opts.expectJson) {
    // Strip ```json fences if present
    const cleaned = raw_text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    try {
      data = JSON.parse(cleaned) as T;
    } catch (err) {
      const parseError = new Error(
        `[agents] Failed to parse Claude JSON response: ${(err as Error).message}\n--- raw ---\n${raw_text}`
      ) as Error & { cause?: unknown };
      parseError.cause = err;
      throw parseError;
    }
  } else {
    data = raw_text as unknown as T;
  }

  return { data, raw_text, tokens_input, tokens_output, cost_usd, model };
}

// ─── Tool-use variant (server tools: web_search, web_fetch) ────────

export interface RunClaudeWithToolsOptions {
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  /** Server tools to enable. Defaults to web_search + web_fetch. */
  serverTools?: Array<{ type: string; name: string }>;
  /** Maximum agentic loop iterations (prevents runaway). Default: 15 */
  maxTurns?: number;
}

export interface ClaudeToolUseResult {
  /** Final text response after all tool calls resolved. */
  text: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  model: string;
  /** Number of tool-use turns in the loop. */
  turns: number;
}

/**
 * Run Claude with server-side tools (web_search, web_fetch).
 * Handles the agentic loop: Claude may call tools multiple times,
 * Anthropic executes them server-side and returns results automatically.
 * We simply continue the conversation until Claude returns end_turn.
 */
export async function runClaudeWithTools(
  opts: RunClaudeWithToolsOptions
): Promise<ClaudeToolUseResult> {
  const model = opts.model ?? process.env.ANTHROPIC_MODEL_DRAFT ?? 'claude-sonnet-4-5';
  const c = client();
  const maxTurns = opts.maxTurns ?? 15;

  const tools: Anthropic.Tool[] = (opts.serverTools ?? [
    { type: 'web_search_20260209', name: 'web_search' },
    { type: 'web_fetch_20260209', name: 'web_fetch' },
  ]) as Anthropic.Tool[];

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: opts.userPrompt }];

  let totalInput = 0;
  let totalOutput = 0;
  let turns = 0;

  while (turns < maxTurns) {
    turns++;

    const response = await c.messages.create({
      model,
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.systemPrompt,
      tools,
      messages,
    });

    totalInput += response.usage?.input_tokens ?? 0;
    totalOutput += response.usage?.output_tokens ?? 0;

    // If stop_reason is end_turn, we're done
    if (response.stop_reason === 'end_turn') {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();

      return {
        text,
        tokens_input: totalInput,
        tokens_output: totalOutput,
        cost_usd: computeCost(model, totalInput, totalOutput),
        model,
        turns,
      };
    }

    // If Claude wants to use tools, add assistant message and continue
    // For server tools, Anthropic handles execution — the response already
    // contains tool_result blocks. We just need to feed back the full response.
    if (response.stop_reason === 'tool_use') {
      // Add assistant response (contains tool_use blocks)
      messages.push({ role: 'assistant', content: response.content });

      // For server tools, the results come back in the same response cycle.
      // We need to add a user message with tool_result blocks.
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      // Server tools: results are returned by the API inline.
      // For server-side tools, we don't need to provide results — Anthropic does it.
      // But the SDK may still return tool_use stop_reason. In that case we continue
      // by passing empty tool results to signal continuation.
      const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((tu) => ({
        type: 'tool_result' as const,
        tool_use_id: tu.id,
        content: 'Server tool executed by Anthropic.',
      }));

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // Unexpected stop reason — break
    break;
  }

  // If we hit max turns, return whatever text we have
  const lastAssistant = messages.filter((m) => m.role === 'assistant').pop();
  const fallbackText = lastAssistant
    ? ((lastAssistant.content as Anthropic.ContentBlock[])
        ?.filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('\n') ?? '')
    : '';

  return {
    text: fallbackText,
    tokens_input: totalInput,
    tokens_output: totalOutput,
    cost_usd: computeCost(model, totalInput, totalOutput),
    model,
    turns,
  };
}
