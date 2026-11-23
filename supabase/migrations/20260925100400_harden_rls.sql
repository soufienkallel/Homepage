-- MALLOULIAUTO homepage — RLS hardening after taking ownership of the agent and
-- article tables from the monorepo.
--
-- Problems fixed (as found in the monorepo migrations 052, 056, 098):
--   * agent_knowledge "service_role_all" and agent_discovery_* "admin_all_*" were
--     `for all using (true)` WITHOUT a role: anyone holding the public anon key
--     could read and rewrite the chatbot knowledge base and discovery config;
--   * articles: any authenticated user could insert / update / delete articles;
--   * agent_* policies depended on public.get_my_role(), a product-schema helper;
--   * agent_drafts.approved_by referenced public.users, a product table.
--
-- Model after this migration:
--   * agent_* and agent_chat_sessions: no policy at all → deny for anon and
--     authenticated. Every access goes through api/agents/* with the service role
--     (which bypasses RLS) after server/adminAuth.js has checked the admin.
--   * articles: public reads published articles; admins read everything and write.
--   * Admin = app_metadata.role 'admin' / app_metadata.roles ∋ 'admin', or a
--     confirmed e-mail listed in public.homepage_admins (single source shared with
--     server/adminAuth.js).

-- ─── Admin allowlist ───────────────────────────────────────────────

create table if not exists public.homepage_admins (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.homepage_admins enable row level security;
revoke all on public.homepage_admins from anon, authenticated;

insert into public.homepage_admins (email) values ('admin@mallouliauto.tn')
on conflict do nothing;

create or replace function public.is_homepage_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or coalesce((auth.jwt() -> 'app_metadata' -> 'roles') ? 'admin', false)
    or exists (
      select 1
      from auth.users u
      join public.homepage_admins a on a.email = lower(u.email)
      where u.id = auth.uid()
        and u.email_confirmed_at is not null
    );
$$;

revoke all on function public.is_homepage_admin() from public;
grant execute on function public.is_homepage_admin() to anon, authenticated, service_role;

-- ─── Agent tables: service role only ───────────────────────────────

drop policy if exists "agent_prospects_admin_all" on public.agent_prospects;
drop policy if exists "agent_runs_admin_all" on public.agent_runs;
drop policy if exists "agent_drafts_admin_all" on public.agent_drafts;
drop policy if exists "service_role_all" on public.agent_knowledge;
drop policy if exists "agent_jobs_admin_all" on public.agent_jobs;
drop policy if exists "admin_all_agent_discovery_segments" on public.agent_discovery_segments;
drop policy if exists "admin_all_agent_discovery_sources" on public.agent_discovery_sources;
drop policy if exists "chat_sessions_service_role_all" on public.agent_chat_sessions;

revoke all on public.agent_prospects, public.agent_runs, public.agent_drafts,
  public.agent_knowledge, public.agent_jobs, public.agent_discovery_segments,
  public.agent_discovery_sources, public.agent_chat_sessions
  from anon, authenticated;

-- Decouple from the product schema: homepage admins are auth.users, not public.users.
alter table public.agent_drafts drop constraint if exists agent_drafts_approved_by_fkey;

-- api/agents/sales/prospects.ts accepts status 'enriched', which the enum never had
-- (PATCH status=enriched failed at the database).
alter type public.prospect_status add value if not exists 'enriched';

-- ─── Articles: public read of published, admin write ───────────────

drop policy if exists "articles_public_select" on public.articles;
drop policy if exists "articles_authenticated_insert" on public.articles;
drop policy if exists "articles_authenticated_update" on public.articles;
drop policy if exists "articles_authenticated_delete" on public.articles;
drop policy if exists "articles_published_select" on public.articles;
drop policy if exists "articles_admin_all" on public.articles;

create policy "articles_published_select"
  on public.articles for select
  to anon, authenticated
  using (status = 'published');

create policy "articles_admin_all"
  on public.articles for all
  to authenticated
  using (public.is_homepage_admin())
  with check (public.is_homepage_admin());

-- "articles_service_role_all" (098) is kept.
