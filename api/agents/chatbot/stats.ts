// GET /api/agents/chatbot/stats — Analytics for the chatbot agent.
// Auth: admin Supabase session (server/adminAuth.js)
// See issue #132 Phase 6.

import { checkAuth } from '../../../server/adminAuth.js';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function sb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (!(await checkAuth(request))) {
    return new Response(
      JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Admin session required' } }),
      { status: 401, headers: CORS }
    );
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: CORS,
    });
  }

  const client = sb();

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Fetch all chatbot runs
    const [runsResult, todayRunsResult, sessionsResult] = await Promise.all([
      client
        .from('agent_runs')
        .select('tokens_input, tokens_output, cost_usd, duration_ms')
        .eq('agent_type', 'chatbot'),
      client
        .from('agent_runs')
        .select('cost_usd')
        .eq('agent_type', 'chatbot')
        .gte('created_at', todayISO),
      client
        .from('agent_chat_sessions')
        .select('session_id, role, content, detected_segment, created_at')
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    const runs = runsResult.data ?? [];
    const todayRuns = todayRunsResult.data ?? [];
    const sessions = sessionsResult.data ?? [];

    // Compute KPIs
    const totalConversations = runs.length;
    const todayConversations = todayRuns.length;
    const totalTokensIn = runs.reduce((acc: number, r: any) => acc + (r.tokens_input ?? 0), 0);
    const totalTokensOut = runs.reduce((acc: number, r: any) => acc + (r.tokens_output ?? 0), 0);
    const totalCostUsd = runs.reduce((acc: number, r: any) => acc + Number(r.cost_usd ?? 0), 0);
    const todayCostUsd = todayRuns.reduce(
      (acc: number, r: any) => acc + Number(r.cost_usd ?? 0),
      0
    );
    const avgDurationMs =
      runs.length > 0
        ? runs.reduce((acc: number, r: any) => acc + (r.duration_ms ?? 0), 0) / runs.length
        : 0;

    // Recent sessions (deduplicated by session_id, with messages)
    const sessionMap = new Map<
      string,
      {
        session_id: string;
        created_at: string;
        detected_segment: string | null;
        message_count: number;
        messages: Array<{ role: string; content: string }>;
      }
    >();
    for (const s of sessions) {
      const existing = sessionMap.get(s.session_id);
      if (existing) {
        existing.message_count++;
        existing.messages.push({ role: s.role, content: s.content });
      } else {
        sessionMap.set(s.session_id, {
          session_id: s.session_id,
          created_at: s.created_at,
          detected_segment: s.detected_segment,
          message_count: 1,
          messages: [{ role: s.role, content: s.content }],
        });
      }
    }
    // Sort messages within each session chronologically (oldest first)
    for (const session of sessionMap.values()) {
      session.messages.reverse();
    }
    const recentSessions = Array.from(sessionMap.values()).slice(0, 20);

    // Segment breakdown (count per unique session, not per message row)
    const topSegments: Record<string, number> = {};
    for (const session of sessionMap.values()) {
      if (session.detected_segment) {
        topSegments[session.detected_segment] = (topSegments[session.detected_segment] ?? 0) + 1;
      }
    }

    return new Response(
      JSON.stringify({
        totalConversations,
        todayConversations,
        totalTokensIn,
        totalTokensOut,
        totalCostUsd: Number(totalCostUsd.toFixed(4)),
        todayCostUsd: Number(todayCostUsd.toFixed(4)),
        avgDurationMs: Math.round(avgDurationMs),
        topSegments,
        recentSessions,
      }),
      { status: 200, headers: CORS }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: CORS,
    });
  }
}
