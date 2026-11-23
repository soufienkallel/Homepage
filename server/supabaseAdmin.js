import { createClient } from '@supabase/supabase-js';

let client = null;

/**
 * Service-role Supabase client for the Vercel Functions. Server-only: the
 * service role key bypasses RLS and must never reach the browser bundle.
 * Returns null when the environment is not configured.
 */
export function getSupabaseAdmin() {
  if (client) return client;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
