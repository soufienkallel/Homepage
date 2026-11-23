// POST /api/agents/marketing/approve — Approve or reject a marketing draft.
// Body: { id: string, action: 'approve' | 'reject', reject_reason?: string }
// Auth: admin Supabase session (server/adminAuth.js)

import { checkAuth } from '../../../server/adminAuth.js';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' },
        timestamp: new Date().toISOString(),
      }),
      { status: 405, headers: CORS }
    );
  }
  if (!(await checkAuth(request))) {
    return new Response(
      JSON.stringify({
        error: { code: 'UNAUTHORIZED', message: 'Admin session required' },
        timestamp: new Date().toISOString(),
      }),
      { status: 401, headers: CORS }
    );
  }

  let body: { id?: string; action?: string; reject_reason?: string; approved_by?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: { code: 'INVALID_JSON', message: 'Invalid JSON body' },
        timestamp: new Date().toISOString(),
      }),
      { status: 400, headers: CORS }
    );
  }

  if (!body.id || !body.action || !['approve', 'reject'].includes(body.action)) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Required: { id: string, action: "approve" | "reject" }',
        },
        timestamp: new Date().toISOString(),
      }),
      { status: 400, headers: CORS }
    );
  }

  let supabase;
  try {
    supabase = sb();
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: { code: 'CONFIG_ERROR', message: (e as Error).message },
        timestamp: new Date().toISOString(),
      }),
      { status: 400, headers: CORS }
    );
  }

  const update: Record<string, unknown> =
    body.action === 'approve'
      ? {
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: body.approved_by ?? null,
        }
      : { status: 'rejected', reject_reason: body.reject_reason ?? null };

  const { data, error } = await supabase
    .from('agent_drafts')
    .update(update)
    .eq('id', body.id)
    .eq('agent_type', 'marketing')
    .select('id, status, content, channel, language')
    .single();

  if (error) {
    return new Response(
      JSON.stringify({
        error: { code: 'DB_ERROR', message: error.message },
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: CORS }
    );
  }

  return new Response(JSON.stringify({ draft: data }), { status: 200, headers: CORS });
}
