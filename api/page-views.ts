// POST /api/page-views — records one page view of the cookieless visit measurement
// (src/lib/analytics.js, docs/specs/2026-09-admin-analytics.md).
// Public. Stores no IP address and no user agent: only the path, the visit's attribution
// (src/lib/trafficSource.js), the device class and the country Vercel derives at the edge.
// Runtime: Edge (not counted in the Hobby plan's 12 Node.js functions).

import { createClient } from '@supabase/supabase-js';
import { classifySource } from '../src/lib/trafficSource.js';
import { trackedPath } from '../src/lib/trackedPaths.js';
import { BOT_UA, deviceOf } from '../src/lib/visitorDevice.js';

export const config = { runtime: 'edge' };

const MAX_BODY = 4096;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Body = {
  visitId?: unknown;
  path?: unknown;
  isEntry?: unknown;
  utm?: unknown;
  referrer?: unknown;
};

function noContent(): Response {
  return new Response(null, { status: 204 });
}

function pickUtm(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const utm: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const item = (value as Record<string, unknown>)[key];
    if (typeof item === 'string' && item) utm[key] = item.slice(0, 200);
  }
  return Object.keys(utm).length ? utm : null;
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
    typeof body.path !== 'string'
  ) {
    return new Response(null, { status: 400 });
  }
  // Only pages of the site (src/lib/trackedPaths.js): a mistyped or probed address is
  // acknowledged, not counted. /admin, /login and /api are never pages.
  const path = trackedPath(body.path);
  if (!path) return noContent();

  const origin = classifySource({
    utm: pickUtm(body.utm),
    referrer: typeof body.referrer === 'string' ? body.referrer.slice(0, 2048) : null,
  });
  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('[page-views] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    return new Response(null, { status: 503 });
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('page_views').insert({
    visit_id: body.visitId.toLowerCase(),
    path,
    is_entry: body.isEntry === true,
    source: origin.source,
    medium: origin.medium,
    campaign: origin.campaign,
    content: origin.content,
    referrer_host: origin.referrerHost,
    device: deviceOf(userAgent),
    country: /^[A-Z]{2}$/.test(country) ? country : null,
  });
  if (error) {
    console.error('[page-views] insert failed:', error.message);
    return new Response(null, { status: 500 });
  }
  return noContent();
}
