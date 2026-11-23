// Chatbot runner — handles conversational chat with homepage visitors.
// Reuses shared knowledge base, Claude client, and Supabase infra.
// See issue #132 Phase 6.

import Anthropic from '@anthropic-ai/sdk';
import { loadKnowledge } from '../shared/knowledge.js';
import { supabaseAdmin } from '../shared/supabase.js';
import { renderChatbotSystemPrompt } from './system-prompt-text.js';
import type { AgentSegment } from '../shared/types.js';

// Pricing per 1M tokens (duplicated from claude-client for standalone cost calc)
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 },
};

function computeCost(model: string, tokensIn: number, tokensOut: number): number {
  const p = PRICING[model] ?? PRICING['claude-sonnet-4-5'];
  return Number(((tokensIn * p.input + tokensOut * p.output) / 1_000_000).toFixed(6));
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRunOptions {
  sessionId: string;
  messages: ChatMessage[];
  ipHash?: string;
}

export interface ChatRunResult {
  reply: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  model: string;
  detected_segment: string | null;
}

/** Detect which business segment the visitor is asking about. */
function detectSegment(messages: ChatMessage[]): AgentSegment | null {
  const text = messages
    .map((m) => m.content)
    .join(' ')
    .toLowerCase();
  const segments: Array<{ key: AgentSegment; keywords: string[] }> = [
    { key: 'insurance', keywords: ['assur', 'sinistre', 'fraude', 'expert', 'claim', 'tiers'] },
    { key: 'garage', keywords: ['garage', 'atelier', 'mécanicien', 'réparation', 'devis'] },
    {
      key: 'fleet',
      keywords: ['flotte', 'fleet', 'chauffeur', 'véhicule de service', 'parc auto'],
    },
    {
      key: 'dealer',
      keywords: ['concessionnaire', 'dealer', 'occasion', 'pré-vente', 'certification'],
    },
    {
      key: 'b2c',
      keywords: ['ma voiture', 'mon véhicule', 'particulier', 'contrôle technique', 'vidange'],
    },
  ];
  for (const seg of segments) {
    if (seg.keywords.some((kw) => text.includes(kw))) return seg.key;
  }
  return null;
}

/** Build the full system prompt by injecting knowledge. */
async function buildSystemPrompt(segment: AgentSegment | null): Promise<string> {
  const knowledge = await loadKnowledge(segment);

  return renderChatbotSystemPrompt(knowledge);
}

/** Save a message to the chat sessions table. */
async function saveMessage(opts: {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  detectedSegment: string | null;
  tokensInput?: number;
  tokensOutput?: number;
  costUsd?: number;
  ipHash?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await supabaseAdmin()
    .from('agent_chat_sessions')
    .insert({
      session_id: opts.sessionId,
      role: opts.role,
      content: opts.content,
      detected_segment: opts.detectedSegment,
      tokens_input: opts.tokensInput ?? null,
      tokens_output: opts.tokensOutput ?? null,
      cost_usd: opts.costUsd ?? null,
      ip_hash: opts.ipHash ?? null,
      metadata: opts.metadata ?? null,
    });
}

/** Log the chat run to agent_runs for unified analytics. */
async function logChatRun(opts: {
  sessionId: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  model: string;
  durationMs: number;
  segment: string | null;
}): Promise<void> {
  await supabaseAdmin()
    .from('agent_runs')
    .insert({
      agent_type: 'chatbot',
      trigger: 'api',
      input: { session_id: opts.sessionId, segment: opts.segment },
      output_summary: { tokens_input: opts.tokensInput, tokens_output: opts.tokensOutput },
      tokens_input: opts.tokensInput,
      tokens_output: opts.tokensOutput,
      cost_usd: opts.costUsd,
      status: 'success',
      duration_ms: opts.durationMs,
    });
}

/**
 * Run a single chatbot turn: takes conversation history, returns assistant reply.
 * Non-streaming version for simple use cases.
 */
export async function runChatbot(opts: ChatRunOptions): Promise<ChatRunResult> {
  const startMs = Date.now();
  const segment = detectSegment(opts.messages);
  const systemPrompt = await buildSystemPrompt(segment);
  const model =
    process.env.ANTHROPIC_MODEL_CHATBOT ?? process.env.ANTHROPIC_MODEL_DRAFT ?? 'claude-haiku-4-5';

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('[chatbot] ANTHROPIC_API_KEY missing');
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const reply = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  const tokens_input = response.usage?.input_tokens ?? 0;
  const tokens_output = response.usage?.output_tokens ?? 0;
  const cost_usd = computeCost(model, tokens_input, tokens_output);
  const durationMs = Date.now() - startMs;

  // Save messages + log run (fire-and-forget, don't block response)
  const lastUserMsg = opts.messages[opts.messages.length - 1];
  Promise.all([
    saveMessage({
      sessionId: opts.sessionId,
      role: 'user',
      content: lastUserMsg.content,
      detectedSegment: segment,
      ipHash: opts.ipHash,
    }),
    saveMessage({
      sessionId: opts.sessionId,
      role: 'assistant',
      content: reply,
      detectedSegment: segment,
      tokensInput: tokens_input,
      tokensOutput: tokens_output,
      costUsd: cost_usd,
      ipHash: opts.ipHash,
    }),
    logChatRun({
      sessionId: opts.sessionId,
      tokensInput: tokens_input,
      tokensOutput: tokens_output,
      costUsd: cost_usd,
      model,
      durationMs,
      segment,
    }),
  ]).catch((err) => console.error('[chatbot] Background save failed:', err));

  return { reply, tokens_input, tokens_output, cost_usd, model, detected_segment: segment };
}

/**
 * Create a streaming chatbot response.
 * Returns a ReadableStream of SSE-formatted text chunks.
 */
export async function streamChatbot(opts: ChatRunOptions): Promise<{
  stream: ReadableStream<Uint8Array>;
  sessionId: string;
}> {
  const segment = detectSegment(opts.messages);
  const systemPrompt = await buildSystemPrompt(segment);
  const model =
    process.env.ANTHROPIC_MODEL_CHATBOT ?? process.env.ANTHROPIC_MODEL_DRAFT ?? 'claude-haiku-4-5';

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('[chatbot] ANTHROPIC_API_KEY missing');
  const client = new Anthropic({ apiKey });

  const startMs = Date.now();
  const encoder = new TextEncoder();

  const anthropicStream = client.messages.stream({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
  });

  let fullReply = '';

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const text = event.delta.text;
            fullReply += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        // Final message with usage stats
        const finalMessage = await anthropicStream.finalMessage();
        const tokens_input = finalMessage.usage?.input_tokens ?? 0;
        const tokens_output = finalMessage.usage?.output_tokens ?? 0;
        const cost_usd = computeCost(model, tokens_input, tokens_output);
        const durationMs = Date.now() - startMs;

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, tokens_input, tokens_output, cost_usd })}\n\n`
          )
        );
        controller.close();

        // Background: save messages + log run
        const lastUserMsg = opts.messages[opts.messages.length - 1];
        Promise.all([
          saveMessage({
            sessionId: opts.sessionId,
            role: 'user',
            content: lastUserMsg.content,
            detectedSegment: segment,
            ipHash: opts.ipHash,
          }),
          saveMessage({
            sessionId: opts.sessionId,
            role: 'assistant',
            content: fullReply,
            detectedSegment: segment,
            tokensInput: tokens_input,
            tokensOutput: tokens_output,
            costUsd: cost_usd,
            ipHash: opts.ipHash,
          }),
          logChatRun({
            sessionId: opts.sessionId,
            tokensInput: tokens_input,
            tokensOutput: tokens_output,
            costUsd: cost_usd,
            model,
            durationMs,
            segment,
          }),
        ]).catch((err) => console.error('[chatbot] Background save failed:', err));
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return { stream, sessionId: opts.sessionId };
}
