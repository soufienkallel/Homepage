// Admin authentication for /api/agents/* — replaces the shared AGENT_ADMIN_TOKEN,
// which was compiled into the public browser bundle (VITE_AGENT_ADMIN_TOKEN) and
// therefore readable by anyone.
//
// A request is admin when its bearer token is a Supabase session access token for
// a user who is admin on the server side:
//   - app_metadata.role === 'admin' or app_metadata.roles contains 'admin'
//     (app_metadata is writable only with the service role — never user_metadata,
//     which any signed-in user can edit), or
//   - their confirmed e-mail is listed in public.homepage_admins.
// Routes triggered by Vercel Cron may also accept `Bearer ${CRON_SECRET}`.
//
// Edge-compatible: no Node built-ins.

import { createClient } from '@supabase/supabase-js';

let client = null;

function getServiceClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

function readAuthorization(request) {
  const headers = request?.headers;
  if (!headers) return '';
  // Web Request (edge / fetch handlers) or VercelRequest (Node handlers).
  const value =
    typeof headers.get === 'function' ? headers.get('authorization') : headers.authorization;
  return typeof value === 'string' ? value : '';
}

function bearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(readAuthorization(request).trim());
  return match ? match[1].trim() : '';
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function hasAdminRole(user) {
  const meta = user?.app_metadata ?? {};
  const roles = Array.isArray(meta.roles) ? meta.roles.map((r) => String(r).toLowerCase()) : [];
  return String(meta.role ?? '').toLowerCase() === 'admin' || roles.includes('admin');
}

async function isListedAdmin(supabase, user) {
  const email = user?.email?.trim().toLowerCase();
  if (!email || !user.email_confirmed_at) return false;
  const { data, error } = await supabase
    .from('homepage_admins')
    .select('email')
    .eq('email', email)
    .maybeSingle();
  if (error) {
    console.error('[adminAuth] admin allowlist lookup failed:', error.message);
    return false;
  }
  return Boolean(data);
}

/**
 * Resolves the admin user behind a request, or null.
 *
 * @param {Request | import('@vercel/node').VercelRequest} request
 * @param {{ allowCron?: boolean }} [options]
 * @returns {Promise<{ id: string | null, email: string | null, via: 'session' | 'cron' } | null>}
 */
export async function getAdmin(request, { allowCron = false } = {}) {
  const token = bearerToken(request);
  if (!token) return null;

  const cronSecret = process.env.CRON_SECRET;
  if (allowCron && cronSecret && constantTimeEqual(token, cronSecret)) {
    return { id: null, email: null, via: 'cron' };
  }

  const supabase = getServiceClient();
  if (!supabase) {
    console.error('[adminAuth] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }

  // Verifies the JWT with Supabase Auth (signature, expiry, revoked session).
  const { data, error } = await supabase.auth.getUser(token);
  const user = data?.user;
  if (error || !user) return null;

  if (hasAdminRole(user) || (await isListedAdmin(supabase, user))) {
    return { id: user.id, email: user.email ?? null, via: 'session' };
  }
  return null;
}

/** Boolean shorthand used by the route handlers. */
export async function checkAuth(request, options) {
  return (await getAdmin(request, options)) !== null;
}
