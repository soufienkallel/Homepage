// GET/POST/PUT/DELETE /api/agents/sales/discovery-config
// Manage discovery segments and sources dynamically.
// Auth: admin Supabase session (server/adminAuth.js)

import { checkAuth } from '../../../server/adminAuth.js';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
      JSON.stringify({
        error: { code: 'UNAUTHORIZED', message: 'Admin session required' },
        timestamp: new Date().toISOString(),
      }),
      { status: 401, headers: CORS }
    );
  }

  const url = new URL(request.url);
  const entity = url.searchParams.get('entity'); // 'segments' or 'sources'

  if (!entity || !['segments', 'sources'].includes(entity)) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'BAD_REQUEST',
          message: 'Query param "entity" must be "segments" or "sources"',
        },
      }),
      { status: 400, headers: CORS }
    );
  }

  const table = entity === 'segments' ? 'agent_discovery_segments' : 'agent_discovery_sources';

  try {
    switch (request.method) {
      case 'GET':
        return handleGet(table, url);
      case 'POST':
        return handlePost(table, request);
      case 'PUT':
        return handlePut(table, entity, request);
      case 'DELETE':
        return handleDelete(table, entity, url);
      default:
        return new Response(
          JSON.stringify({
            error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET, POST, PUT, or DELETE' },
          }),
          { status: 405, headers: CORS }
        );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: { code: 'INTERNAL_ERROR', message: (err as Error).message },
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: CORS }
    );
  }
}

// ─── GET: list all segments or sources ────────────────────────────

async function handleGet(table: string, url: URL): Promise<Response> {
  const enabledOnly = url.searchParams.get('enabled_only') === 'true';
  const sourceType = url.searchParams.get('source_type'); // 'discovery' | 'enrichment' | 'both'

  let query = sb().from(table).select('*');

  if (enabledOnly) {
    query = query.eq('enabled', true);
  }

  if (table === 'agent_discovery_segments') {
    query = query.order('sort_order', { ascending: true });
  } else {
    // Sources
    if (sourceType) {
      query = query.or(`source_type.eq.${sourceType},source_type.eq.both`);
    }
    query = query.order('priority', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return new Response(
    JSON.stringify({ [table === 'agent_discovery_segments' ? 'segments' : 'sources']: data }),
    { status: 200, headers: CORS }
  );
}

// ─── POST: create a new segment or source ─────────────────────────

async function handlePost(table: string, request: Request): Promise<Response> {
  const body = await request.json();

  const { data, error } = await sb().from(table).insert(body).select().single();
  if (error) throw new Error(error.message);

  return new Response(JSON.stringify({ created: data }), { status: 201, headers: CORS });
}

// ─── PUT: update a segment or source ──────────────────────────────

async function handlePut(table: string, entity: string, request: Request): Promise<Response> {
  const body = await request.json();
  const id = entity === 'segments' ? body.slug : body.id;

  if (!id) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'BAD_REQUEST',
          message: `Missing "${entity === 'segments' ? 'slug' : 'id'}" in body`,
        },
      }),
      { status: 400, headers: CORS }
    );
  }

  const idCol = entity === 'segments' ? 'slug' : 'id';
  const updates = { ...body };
  delete updates[idCol]; // Don't update the PK

  const { data, error } = await sb().from(table).update(updates).eq(idCol, id).select().single();
  if (error) throw new Error(error.message);

  return new Response(JSON.stringify({ updated: data }), { status: 200, headers: CORS });
}

// ─── DELETE: remove a segment or source ───────────────────────────

async function handleDelete(table: string, entity: string, url: URL): Promise<Response> {
  const id = url.searchParams.get('id') ?? url.searchParams.get('slug');

  if (!id) {
    return new Response(
      JSON.stringify({
        error: { code: 'BAD_REQUEST', message: 'Missing "id" or "slug" query param' },
      }),
      { status: 400, headers: CORS }
    );
  }

  const idCol = entity === 'segments' ? 'slug' : 'id';
  const { error } = await sb().from(table).delete().eq(idCol, id);
  if (error) throw new Error(error.message);

  return new Response(JSON.stringify({ deleted: id }), { status: 200, headers: CORS });
}
