// GET /api/agents/marketing/drafts — List marketing drafts.
// Query params: ?status=pending_review&limit=50
// Auth: admin Supabase session (server/adminAuth.js)

import { checkAuth } from '../../../server/adminAuth.js';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET' },
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

  let supabase;
  try {
    supabase = sb();
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: { code: 'CONFIG_ERROR', message: (e as Error).message },
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: CORS }
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'pending_review';
  const parsedLimit = Number(url.searchParams.get('limit') ?? 50);
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(Math.floor(parsedLimit), 200) : 50;

  const { data, error } = await supabase
    .from('agent_drafts')
    .select('*')
    .eq('agent_type', 'marketing')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return new Response(
      JSON.stringify({
        error: { code: 'DB_ERROR', message: error.message },
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: CORS }
    );
  }

  return new Response(JSON.stringify({ drafts: data, count: data?.length ?? 0 }), {
    status: 200,
    headers: CORS,
  });
}
