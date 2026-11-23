import { getAdmin } from '../../server/adminAuth.js';

// Edge runtime: not counted in the 12 Node.js functions of the Hobby plan (docs/api.md).
export const config = { runtime: 'edge' };

// Vercel deploy hooks all live under this prefix: the server never POSTs anywhere else,
// even if the variable is mis-set.
const HOOK_PREFIX = 'https://api.vercel.com/v1/integrations/deploy/';

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

/**
 * POST /api/admin/redeploy — rebuilds the production site so that a guide published,
 * edited or removed in /admin/guides gets its pre-rendered page and sitemap entry
 * (docs/specs/2026-10-prerendering.md). Auth: admin Supabase session.
 *
 * The hook URL is a secret (anyone holding it can trigger builds): it stays in the server
 * environment, VERCEL_DEPLOY_HOOK_URL, never in the browser bundle.
 */
export default async function handler(request) {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const admin = await getAdmin(request);
  if (!admin) return json(401, { error: 'unauthorized' });

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook || !hook.startsWith(HOOK_PREFIX)) {
    return json(503, { error: 'deploy_hook_not_configured' });
  }

  try {
    const response = await fetch(hook, { method: 'POST' });
    if (!response.ok) {
      console.error('[redeploy] deploy hook answered', response.status);
      return json(502, { error: 'deploy_hook_failed' });
    }
    return json(202, { triggered: true });
  } catch (error) {
    console.error('[redeploy] deploy hook unreachable', error?.message);
    return json(502, { error: 'deploy_hook_failed' });
  }
}
