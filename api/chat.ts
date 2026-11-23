// POST /api/chat — Streaming chatbot endpoint for the homepage.
// Auth: public (no token required — rate-limited by IP).
// Uses raw fetch to Anthropic API (Edge-compatible, no SDK needed).
// See issue #132 Phase 6.

import { createClient } from '@supabase/supabase-js';
import { renderChatbotSystemPrompt } from '../server/agents/chatbot/system-prompt-text.js';

export const config = { runtime: 'edge' };

const CORS: Record<string, string> = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const JSON_CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ─── Rate limiting (in-memory, per-edge instance) ──────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20; // messages per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ipHash: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// ─── IP hashing (privacy-preserving) ──────────────────────────────
async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (process.env.RATE_LIMIT_SALT ?? 'mallouliauto'));
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Supabase client ──────────────────────────────────────────────
function sb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─── Knowledge loader (lightweight, edge-compatible) ──────────────
interface KnowledgeBundle {
  company: string;
  voice: string;
  proof: string;
  valueProp: string;
}

async function loadKnowledge(segment: string | null): Promise<KnowledgeBundle> {
  const { data, error } = await sb()
    .from('agent_knowledge')
    .select('category, content')
    .eq('is_active', true);

  if (error || !data || data.length === 0) {
    return { company: '', voice: '', proof: '', valueProp: '' };
  }

  const byCategory = new Map(
    data.map((row: { category: string; content: string }) => [row.category, row.content])
  );
  const segmentKey = segment ? `value_prop_${segment}` : null;

  return {
    company: byCategory.get('company') ?? '',
    voice: byCategory.get('voice') ?? '',
    proof: byCategory.get('proof') ?? '',
    valueProp: segmentKey ? (byCategory.get(segmentKey) ?? '') : '',
  };
}

// ─── Segment detection ────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function detectSegment(messages: ChatMessage[]): string | null {
  const text = messages
    .map((m) => m.content)
    .join(' ')
    .toLowerCase();
  const segments: Array<{ key: string; keywords: string[] }> = [
    { key: 'insurance', keywords: ['assur', 'sinistre', 'fraude', 'expert', 'claim'] },
    { key: 'garage', keywords: ['garage', 'atelier', 'mécanicien', 'réparation', 'devis'] },
    { key: 'fleet', keywords: ['flotte', 'fleet', 'chauffeur', 'parc auto'] },
    { key: 'dealer', keywords: ['concessionnaire', 'dealer', 'occasion', 'pré-vente'] },
    { key: 'b2c', keywords: ['ma voiture', 'mon véhicule', 'particulier', 'contrôle technique'] },
  ];
  for (const seg of segments) {
    if (seg.keywords.some((kw) => text.includes(kw))) return seg.key;
  }
  return null;
}

// ─── Background logging (fire-and-forget) ─────────────────────────
async function logToSupabase(
  sessionId: string,
  userMsg: string,
  assistantMsg: string,
  segment: string | null,
  tokensIn: number,
  tokensOut: number,
  costUsd: number,
  ipHash: string,
  model: string,
  durationMs: number
): Promise<void> {
  const client = sb();

  const saveMessagesOp = client.from('agent_chat_sessions').insert([
    {
      session_id: sessionId,
      role: 'user',
      content: userMsg,
      detected_segment: segment,
      ip_hash: ipHash,
    },
    {
      session_id: sessionId,
      role: 'assistant',
      content: assistantMsg,
      detected_segment: segment,
      tokens_input: tokensIn,
      tokens_output: tokensOut,
      cost_usd: costUsd,
      ip_hash: ipHash,
    },
  ]);

  const logRunOp = client.from('agent_runs').insert({
    agent_type: 'chatbot',
    trigger: 'api',
    input: { session_id: sessionId, segment },
    output_summary: { tokens_input: tokensIn, tokens_output: tokensOut },
    tokens_input: tokensIn,
    tokens_output: tokensOut,
    cost_usd: costUsd,
    status: 'success',
    duration_ms: durationMs,
  });

  const [saveMessagesResult, logRunResult] = await Promise.allSettled([saveMessagesOp, logRunOp]);

  if (saveMessagesResult.status === 'rejected') {
    console.error('[chat] Save messages failed:', saveMessagesResult.reason);
  }
  if (logRunResult.status === 'rejected') {
    console.error('[chat] Log run failed:', logRunResult.reason);
  }
}

// ─── Input validation ─────────────────────────────────────────────
function validateInput(body: unknown): { messages: ChatMessage[]; sessionId: string } | string {
  if (!body || typeof body !== 'object') return 'Invalid request body';
  const { messages, sessionId } = body as Record<string, unknown>;

  if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100) {
    return 'Invalid sessionId';
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
    return 'messages must be a non-empty array (max 50)';
  }
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') return 'Invalid message format';
    if (!['user', 'assistant'].includes(msg.role)) return 'Invalid message role';
    if (typeof msg.content !== 'string' || msg.content.length === 0 || msg.content.length > 4000) {
      return 'Message content must be 1-4000 characters';
    }
  }
  const last = messages[messages.length - 1];
  if (last.role !== 'user') return 'Last message must be from user';

  return { messages: messages as ChatMessage[], sessionId: sessionId as string };
}

// ─── Handler ──────────────────────────────────────────────────────
export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_CORS });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: JSON_CORS,
    });
  }

  // Rate limiting
  const clientIP =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const ipHash = await hashIP(clientIP);

  if (isRateLimited(ipHash)) {
    return new Response(
      JSON.stringify({ error: 'Trop de messages. Veuillez patienter une minute.' }),
      { status: 429, headers: JSON_CORS }
    );
  }

  // Parse + validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: JSON_CORS,
    });
  }

  const validation = validateInput(body);
  if (typeof validation === 'string') {
    return new Response(JSON.stringify({ error: validation }), { status: 400, headers: JSON_CORS });
  }

  const { messages, sessionId } = validation;

  // Check required env vars
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'Chat service unavailable' }), {
      status: 503,
      headers: JSON_CORS,
    });
  }

  // Detect segment + load knowledge
  const segment = detectSegment(messages);
  let knowledge: KnowledgeBundle;
  try {
    knowledge = await loadKnowledge(segment);
  } catch {
    knowledge = { company: '', voice: '', proof: '', valueProp: '' };
  }

  const systemPrompt = renderChatbotSystemPrompt(knowledge);
  const model = process.env.ANTHROPIC_MODEL_CHATBOT ?? 'claude-haiku-4-5';
  const startMs = Date.now();

  // Stream response via SSE using raw fetch (Edge-compatible)
  const encoder = new TextEncoder();

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!anthropicRes.ok || !anthropicRes.body) {
    return new Response(JSON.stringify({ error: 'Chat service error' }), {
      status: 502,
      headers: JSON_CORS,
    });
  }

  let fullReply = '';
  let tokensIn = 0;
  let tokensOut = 0;
  const reader = anthropicRes.body.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;

            let event: Record<string, unknown>;
            try {
              event = JSON.parse(payload);
            } catch {
              continue;
            }

            if (event.type === 'content_block_delta') {
              const delta = event.delta as Record<string, unknown> | undefined;
              if (delta?.type === 'text_delta' && typeof delta.text === 'string') {
                fullReply += delta.text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`)
                );
              }
            } else if (event.type === 'message_delta') {
              const usage = event.usage as Record<string, number> | undefined;
              if (usage?.output_tokens) tokensOut = usage.output_tokens;
            } else if (event.type === 'message_start') {
              const msg = event.message as Record<string, unknown> | undefined;
              const usage = msg?.usage as Record<string, number> | undefined;
              if (usage?.input_tokens) tokensIn = usage.input_tokens;
            }
          }
        }

        const pricing = model.includes('haiku') ? { i: 1.0, o: 5.0 } : { i: 3.0, o: 15.0 };
        const costUsd = Number(
          ((tokensIn * pricing.i + tokensOut * pricing.o) / 1_000_000).toFixed(6)
        );
        const durationMs = Date.now() - startMs;

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, tokens_input: tokensIn, tokens_output: tokensOut })}\n\n`
          )
        );

        // Await logging before closing stream (Edge runtime terminates after close)
        const lastUserMsg = messages[messages.length - 1].content;
        await logToSupabase(
          sessionId,
          lastUserMsg,
          fullReply,
          segment,
          tokensIn,
          tokensOut,
          costUsd,
          ipHash,
          model,
          durationMs
        );
        controller.close();
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, { status: 200, headers: CORS });
}
