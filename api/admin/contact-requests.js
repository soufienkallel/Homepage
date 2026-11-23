import { STATUSES, REQUEST_KINDS } from '../../src/lib/contactRequestPolicy.js';
import { getAdmin } from '../../server/adminAuth.js';
import { json, readJson } from '../../server/http.js';
import { getSupabaseAdmin } from '../../server/supabaseAdmin.js';

const OPEN_STATUSES = ['nouvelle', 'contactee'];
const FILTERS = {
  a_traiter: OPEN_STATUSES,
  planifiees: ['planifiee'],
  realisees: ['realisee'],
  closes: ['sans_suite', 'annulee'],
  toutes: null,
};
const STATUS_VALUES = STATUSES.map((s) => s.value);
const DAY_MS = 24 * 60 * 60 * 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireAdmin(request) {
  const admin = await getAdmin(request);
  if (!admin) return { error: json(401, { error: 'unauthorized' }) };
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: json(503, { error: 'unavailable' }) };
  return { admin, supabase };
}

async function countWhere(supabase, build) {
  const { count, error } = await build(
    supabase.from('contact_requests').select('id', { count: 'exact', head: true })
  );
  if (error) throw error;
  return count ?? 0;
}

/**
 * GET /api/admin/contact-requests?filter=a_traiter|planifiees|realisees|closes|toutes&kind=…
 * Oldest open requests first, so the one closest to breaking the 24 h promise is on top.
 */
export async function GET(request) {
  const { admin, supabase, error } = await requireAdmin(request);
  if (!admin) return error;

  const url = new URL(request.url);
  const filterKey =
    FILTERS[url.searchParams.get('filter')] !== undefined
      ? url.searchParams.get('filter')
      : 'a_traiter';
  const kind = url.searchParams.get('kind');

  try {
    let query = supabase
      .from('contact_requests')
      .select(
        'id, reference, created_at, kind, status, status_changed_at, full_name, phone, email, company, message, preferred_channel, vehicle_make, vehicle_model, vehicle_year, listing_url, purpose, location_type, city, preferred_date, utm, referrer, internal_note'
      )
      .order('created_at', { ascending: filterKey === 'a_traiter' })
      .limit(200);
    if (FILTERS[filterKey]) query = query.in('status', FILTERS[filterKey]);
    if (REQUEST_KINDS.includes(kind)) query = query.eq('kind', kind);
    const { data, error: listError } = await query;
    if (listError) throw listError;

    const dayAgo = new Date(Date.now() - DAY_MS).toISOString();
    const weekAgo = new Date(Date.now() - 7 * DAY_MS).toISOString();
    const [toHandle, late, thisWeek] = await Promise.all([
      countWhere(supabase, (q) => q.in('status', OPEN_STATUSES)),
      countWhere(supabase, (q) => q.eq('status', 'nouvelle').lt('created_at', dayAgo)),
      countWhere(supabase, (q) => q.gte('created_at', weekAgo)),
    ]);

    return json(200, { requests: data ?? [], counts: { toHandle, late, thisWeek } });
  } catch (err) {
    console.error('[admin/contact-requests] list failed:', err?.message || err);
    return json(500, { error: 'server_error' });
  }
}

/** PATCH { id, status?, internalNote? } — only the status and the internal note change. */
export async function PATCH(request) {
  const { admin, supabase, error } = await requireAdmin(request);
  if (!admin) return error;

  const body = await readJson(request);
  if (!body || !UUID_PATTERN.test(String(body.id || ''))) {
    return json(400, { error: 'invalid_request' });
  }

  const updates = {};
  if (body.status !== undefined) {
    if (!STATUS_VALUES.includes(body.status)) return json(400, { error: 'invalid_status' });
    updates.status = body.status;
    updates.status_changed_at = new Date().toISOString();
    updates.handled_by = admin.id;
  }
  if (body.internalNote !== undefined) {
    if (body.internalNote !== null && typeof body.internalNote !== 'string') {
      return json(400, { error: 'invalid_note' });
    }
    updates.internal_note = body.internalNote ? body.internalNote.slice(0, 2000) : null;
  }
  if (!Object.keys(updates).length) return json(400, { error: 'nothing_to_update' });

  try {
    const { data, error: updateError } = await supabase
      .from('contact_requests')
      .update(updates)
      .eq('id', body.id)
      .select('id, status, status_changed_at, internal_note')
      .maybeSingle();
    if (updateError) throw updateError;
    if (!data) return json(404, { error: 'not_found' });
    return json(200, { request: data });
  } catch (err) {
    console.error('[admin/contact-requests] update failed:', err?.message || err);
    return json(500, { error: 'server_error' });
  }
}
