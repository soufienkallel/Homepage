// GET/POST/PATCH/DELETE /api/agents/sales/prospects — List, create, update, or delete prospects.
// GET query params: ?segment=insurance&status=new&limit=50
// POST body: { segment, company, language?, contact_name?, role?, email?, ... }
// PATCH body: { id: string, ...partial fields }
// DELETE body: { id: string }
// Auth: admin Supabase session (server/adminAuth.js)

import { checkAuth } from '../../../server/adminAuth.js';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const VALID_SEGMENTS = ['insurance', 'garage', 'dealer', 'fleet', 'b2c'];
const VALID_LANGUAGES = ['fr', 'ar', 'en'];
const VALID_STATUSES = [
  'new',
  'enriched',
  'sequence_generated',
  'in_progress',
  'replied',
  'demo_booked',
  'won',
  'lost',
  'unsubscribed',
];

function sb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(request.method)) {
    return new Response(
      JSON.stringify({
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET, POST, PATCH, or DELETE' },
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

  // ─── POST: create a single prospect ─────────────────────────────
  if (request.method === 'POST') {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({
          error: { code: 'INVALID_REQUEST', message: 'Body must be a JSON object' },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    // Required fields
    if (
      !body.segment ||
      typeof body.segment !== 'string' ||
      !VALID_SEGMENTS.includes(body.segment)
    ) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: `segment is required and must be one of: ${VALID_SEGMENTS.join(', ')}`,
          },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }
    if (!body.company || typeof body.company !== 'string' || !body.company.trim()) {
      return new Response(
        JSON.stringify({
          error: { code: 'INVALID_REQUEST', message: 'company is required' },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    const language = body.language || 'fr';
    if (!VALID_LANGUAGES.includes(language)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: `language must be one of: ${VALID_LANGUAGES.join(', ')}`,
          },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    const prospect: Record<string, unknown> = {
      segment: body.segment,
      company: body.company.trim(),
      language,
      source: 'manual',
      status: 'new',
    };

    // Optional string fields
    const optionalFields = [
      'contact_name',
      'role',
      'email',
      'linkedin_url',
      'whatsapp_e164',
      'city',
      'notes',
    ];
    for (const key of optionalFields) {
      if (key in body && typeof body[key] === 'string' && body[key].trim()) {
        prospect[key] = body[key].trim();
      }
    }

    const { data, error } = await sb()
      .from('agent_prospects')
      .insert(prospect)
      .select('*')
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

    return new Response(JSON.stringify({ prospect: data }), { status: 201, headers: CORS });
  }

  // ─── PATCH: update a single prospect ──────────────────────────────
  if (request.method === 'PATCH') {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.id !== 'string') {
      return new Response(
        JSON.stringify({
          error: { code: 'INVALID_REQUEST', message: 'Body must include { id: string }' },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    const ALLOWED_FIELDS = [
      'segment',
      'company',
      'contact_name',
      'role',
      'email',
      'linkedin_url',
      'whatsapp_e164',
      'language',
      'city',
      'status',
      'notes',
    ];

    const updates: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        const val = body[key];
        // Allow null or string
        if (val !== null && typeof val !== 'string') continue;
        updates[key] = val === '' ? null : val;
      }
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({
          error: { code: 'INVALID_REQUEST', message: 'No valid fields to update' },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    // Validate enum fields
    if (updates.segment && !VALID_SEGMENTS.includes(updates.segment as string)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: `segment must be one of: ${VALID_SEGMENTS.join(', ')}`,
          },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }
    if (updates.language && !VALID_LANGUAGES.includes(updates.language as string)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: `language must be one of: ${VALID_LANGUAGES.join(', ')}`,
          },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }
    if (updates.status && !VALID_STATUSES.includes(updates.status as string)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: `status must be one of: ${VALID_STATUSES.join(', ')}`,
          },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    const { data, error } = await sb()
      .from('agent_prospects')
      .update(updates)
      .eq('id', body.id)
      .select('*')
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
          error: { code: 'NOT_FOUND', message: 'Prospect not found' },
          timestamp: new Date().toISOString(),
        }),
        { status: 404, headers: CORS }
      );
    }

    return new Response(JSON.stringify({ prospect: data }), { status: 200, headers: CORS });
  }

  // ─── DELETE: remove a single prospect ─────────────────────────────
  if (request.method === 'DELETE') {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.id !== 'string') {
      return new Response(
        JSON.stringify({
          error: { code: 'INVALID_REQUEST', message: 'Body must include { id: string }' },
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: CORS }
      );
    }

    const { error } = await sb().from('agent_prospects').delete().eq('id', body.id);

    if (error) {
      return new Response(
        JSON.stringify({
          error: { code: 'DB_ERROR', message: error.message },
          timestamp: new Date().toISOString(),
        }),
        { status: 500, headers: CORS }
      );
    }

    return new Response(JSON.stringify({ deleted: true, id: body.id }), {
      status: 200,
      headers: CORS,
    });
  }

  // ─── GET: list prospects ──────────────────────────────────────────

  const url = new URL(request.url);
  const segment = url.searchParams.get('segment');
  const status = url.searchParams.get('status');
  const enriched = url.searchParams.get('enriched');
  const countOnly = url.searchParams.get('count_only') === 'true';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200);

  // count_only mode: return just the count using Supabase head:true
  if (countOnly) {
    let countQuery = sb().from('agent_prospects').select('id', { count: 'exact', head: true });

    if (segment) countQuery = countQuery.eq('segment', segment);
    if (status) countQuery = countQuery.eq('status', status);
    if (enriched === 'true')
      countQuery = countQuery.or(
        'contact_name.not.is.null,email.not.is.null,linkedin_url.not.is.null'
      );
    if (enriched === 'false')
      countQuery = countQuery.is('contact_name', null).is('email', null).is('linkedin_url', null);

    const { count, error } = await countQuery;
    if (error) {
      return new Response(
        JSON.stringify({
          error: { code: 'DB_ERROR', message: error.message },
          timestamp: new Date().toISOString(),
        }),
        { status: 500, headers: CORS }
      );
    }
    return new Response(JSON.stringify({ count: count ?? 0 }), { status: 200, headers: CORS });
  }

  let query = sb()
    .from('agent_prospects')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (segment) query = query.eq('segment', segment);
  if (status) query = query.eq('status', status);
  if (enriched === 'true')
    query = query.or('contact_name.not.is.null,email.not.is.null,linkedin_url.not.is.null');
  if (enriched === 'false')
    query = query.is('contact_name', null).is('email', null).is('linkedin_url', null);

  const { data, count, error } = await query;

  if (error) {
    return new Response(
      JSON.stringify({
        error: { code: 'DB_ERROR', message: error.message },
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: CORS }
    );
  }

  return new Response(JSON.stringify({ prospects: data, count: count ?? data?.length ?? 0 }), {
    status: 200,
    headers: CORS,
  });
}
