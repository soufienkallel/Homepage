// Supabase service-role client (server-only).
// See doc/requirements/mallouliauto_agents_specifications.md §3.1, §4

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      '[agents] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (see spec §7).'
    );
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
