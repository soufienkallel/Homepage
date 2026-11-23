// POST /api/events — records one click of the cookieless measurement (src/lib/analytics.js,
// trackEvent; docs/specs/2026-10-refonte-accueil.md): which button brings requests, calls and
// WhatsApp messages, and how many visitors each partner receives from the site.
// Public. Same rules as /api/page-views: no IP address, no user agent, only the page, the
// event, its target and the device class.
// Runtime: Edge (not counted in the Hobby plan's 12 Node.js functions).

import { createClient } from '@supabase/supabase-js';
import { trackedPath } from '../src/lib/trackedPaths.js';
import { BOT_UA, deviceOf } from '../src/lib/visitorDevice.js';

export const config = { runtime: 'edge' };

const MAX_BODY = 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Same closed list as src/lib/analytics.js and the click_events table.
const NAMES = new Set([
  'cta_click',
  'call_click',
  'whatsapp_click',
  'partner_call',
  'partner_link',
]);
const TARGET = /^[a-z0-9-]{1,60}$/;

type Body = { visitId?: unknown; path?: unknown; name?: unknown; target?: unknown };

function noContent(): Response {
  return new Response(null, { status: 204 });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  const userAgent = request.headers.get('user-agent') || '';
  // Bots are acknowledged, not counted.
  if (!userAgent || BOT_UA.test(userAgent)) return noContent();

  let body: Body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return new Response(null, { status: 400 });
  }
  if (
    typeof body.visitId !== 'string' ||
    !UUID.test(body.visitId) ||
    typeof body.path !== 'string' ||
    typeof body.name !== 'string' ||
    !NAMES.has(body.name) ||
    typeof body.target !== 'string' ||
    !TARGET.test(body.target)
  ) {
    return new Response(null, { status: 400 });
  }
  // Only pages of the site (src/lib/trackedPaths.js): anything else is acknowledged, not counted.
  const path = trackedPath(body.path);
  if (!path) return noContent();

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('[events] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    return new Response(null, { status: 503 });
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('click_events').insert({
    visit_id: body.visitId.toLowerCase(),
    path,
    name: body.name,
    target: body.target,
    device: deviceOf(userAgent),
  });
  if (error) {
    console.error('[events] insert failed:', error.message);
    return new Response(null, { status: 500 });
  }
  return noContent();
}
