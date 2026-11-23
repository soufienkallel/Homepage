// GET/POST/PATCH/DELETE /api/agents/knowledge — CRUD for agent knowledge base entries.
// Auth: admin Supabase session (server/adminAuth.js)

import { checkAuth } from '../../server/adminAuth.js';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function sb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const VALID_CATEGORIES = [
  'company',
  'voice',
  'proof',
  'value_prop_insurance',
  'value_prop_garage',
  'value_prop_dealer',
  'value_prop_fleet',
  'value_prop_b2c',
];

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
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

  // GET — list all KB entries
  if (request.method === 'GET') {
    const activeOnly = url.searchParams.get('active') !== 'false';
    let query = sb().from('agent_knowledge').select('*').order('category');
    if (activeOnly) query = query.eq('is_active', true);

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
    return new Response(JSON.stringify({ entries: data, count: data?.length ?? 0 }), {
      status: 200,
      headers: CORS,
    });
  }

  // POST — create new entry
  if (request.method === 'POST') {
    const body = await request.json().catch(() => null);
    if (!body || !body.category || !body.title || !body.content) {
      return new Response(
        JSON.stringify({
          error: { code: 'VALIDATION', message: 'category, title, and content are required' },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }
    if (!VALID_CATEGORIES.includes(body.category)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION',
            message: `Invalid category. Valid: ${VALID_CATEGORIES.join(', ')}`,
          },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    const { data, error } = await sb()
      .from('agent_knowledge')
      .insert({
        category: body.category,
        title: body.title,
        content: body.content,
        updated_by: body.updated_by ?? null,
      })
      .select()
      .single();

    if (error) {
      const isDuplicate = error.message?.includes('uq_agent_knowledge_active_category');
      return new Response(
        JSON.stringify({
          error: {
            code: isDuplicate ? 'DUPLICATE' : 'DB_ERROR',
            message: isDuplicate
              ? `An active entry for category "${body.category}" already exists`
              : error.message,
          },
          timestamp: new Date().toISOString(),
        }),
        { status: isDuplicate ? 409 : 500, headers: CORS }
      );
    }
    return new Response(JSON.stringify({ entry: data }), { status: 201, headers: CORS });
  }

  // PATCH — update entry (bumps version)
  if (request.method === 'PATCH') {
    const body = await request.json().catch(() => null);
    if (!body || !body.id) {
      return new Response(
        JSON.stringify({
          error: { code: 'VALIDATION', message: 'id is required' },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title) updates.title = body.title;
    if (body.content) updates.content = body.content;
    if (body.updated_by) updates.updated_by = body.updated_by;

    // Fetch current version to increment
    const { data: current } = await sb()
      .from('agent_knowledge')
      .select('version')
      .eq('id', body.id)
      .single();
    updates.version = (current?.version ?? 0) + 1;

    const { data, error } = await sb()
      .from('agent_knowledge')
      .update(updates)
      .eq('id', body.id)
      .select()
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
    if (!data) {
      return new Response(
        JSON.stringify({
          error: { code: 'NOT_FOUND', message: 'Entry not found' },
          timestamp: new Date().toISOString(),
        }),
        { status: 404, headers: CORS }
      );
    }
    return new Response(JSON.stringify({ entry: data }), { status: 200, headers: CORS });
  }

  // DELETE — soft-delete (set is_active = false)
  if (request.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(
        JSON.stringify({
          error: { code: 'VALIDATION', message: 'id query param is required' },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    const { data, error } = await sb()
      .from('agent_knowledge')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
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
    return new Response(JSON.stringify({ entry: data, archived: true }), {
      status: 200,
      headers: CORS,
    });
  }

  return new Response(
    JSON.stringify({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET, POST, PATCH, or DELETE' },
      timestamp: new Date().toISOString(),
    }),
    { status: 405, headers: CORS }
  );
}
