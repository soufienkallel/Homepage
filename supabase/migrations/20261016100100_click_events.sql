-- MALLOULIAUTO homepage — click events of the cookieless measurement
-- (docs/specs/2026-10-refonte-accueil.md, 16 Oct 2026): which button brings requests, calls
-- and WhatsApp messages, and how many visitors each partner receives from the site.
--
-- Same rules as page_views: written by POST /api/events (service role), tied to the
-- in-memory visit id of src/lib/analytics.js, no IP, no user agent, nothing stored in the
-- browser. RLS on, no policy: browser roles have no direct access. Admins read the totals
-- through public.homepage_click_counts(). Retention 13 months, with the page views.

create table if not exists public.click_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  visit_id    uuid        not null,
  path        text        not null check (char_length(path) between 1 and 200),
  name        text        not null
              check (name in ('cta_click', 'call_click', 'whatsapp_click', 'partner_call', 'partner_link')),
  -- The place (hero, mobile-bar, …) or the partner's slug.
  target      text        not null check (target ~ '^[a-z0-9-]{1,60}$'),
  device      text        not null check (device in ('mobile', 'tablet', 'desktop'))
);

create index if not exists click_events_created_at_idx on public.click_events (created_at);

alter table public.click_events enable row level security;
revoke all on public.click_events from anon, authenticated;

-- Totals per event and target for [p_from, p_to). Callable by a signed-in admin from the
-- browser (the admin partners list); returns nothing for anyone else.
create or replace function public.homepage_click_counts(p_from timestamptz, p_to timestamptz)
returns table (name text, target text, clicks bigint, visits bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.name, e.target, count(*), count(distinct e.visit_id)
  from public.click_events e
  where public.is_homepage_admin()
    and e.created_at >= p_from
    and e.created_at < p_to
  group by e.name, e.target
  order by count(*) desc;
$$;

revoke all on function public.homepage_click_counts(timestamptz, timestamptz) from public, anon;
grant execute on function public.homepage_click_counts(timestamptz, timestamptz) to authenticated;

-- The existing 13-month purge (called by /api/admin/analytics) now covers click events too.
create or replace function public.purge_old_page_views()
returns integer
language sql
volatile
set search_path = public
as $$
  with gone_views as (
    delete from public.page_views where created_at < now() - interval '13 months' returning 1
  ),
  gone_clicks as (
    delete from public.click_events where created_at < now() - interval '13 months' returning 1
  )
  select ((select count(*) from gone_views) + (select count(*) from gone_clicks))::integer;
$$;

revoke all on function public.purge_old_page_views() from public, anon, authenticated;

-- Ask PostgREST (the API) to reload its table list now, not at its next restart.
notify pgrst, 'reload schema';
