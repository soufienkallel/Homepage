import { supabase } from './supabase';

/**
 * The admin API is served by this same deployment (api/agents/*), so requests are
 * same-origin by default. VITE_API_BASE_URL only overrides it for local setups
 * where the functions run on another port (e.g. `vercel dev`).
 *
 * Always read env vars by property: referencing `import.meta.env` as a whole
 * makes Vite inline every VITE_* variable into the public bundle.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * fetch() with the signed-in admin's Supabase access token. The server checks the
 * token and the admin role itself (server/adminAuth.js); no shared secret ever
 * reaches the browser.
 */
export async function adminFetch(path, opts = {}) {
  const { data } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;
  if (!accessToken) {
    throw new Error('Session administrateur expirée — reconnectez-vous.');
  }

  return fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/** JSON admin call; throws `API <status>: <body>` on a non-2xx response. */
export async function adminApi(path, opts) {
  const res = await adminFetch(path, opts);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}
