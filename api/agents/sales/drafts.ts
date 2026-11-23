// GET /api/agents/sales/drafts — List sales drafts.
// Query params: ?status=pending_review&prospect_id=xxx&limit=50
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
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
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

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'pending_review';
  const prospect_id = url.searchParams.get('prospect_id');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200);

  let query = sb()
    .from('agent_drafts')
    .select('*')
    .eq('agent_type', 'sales')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (prospect_id) {
    query = query.eq('prospect_id', prospect_id);
  }

  const { data, error } = await query;

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
