-- MALLOULIAUTO homepage — cookieless visit measurement (docs/specs/2026-09-admin-analytics.md).
--
-- One row per page view, written by POST /api/page-views (service role) and read by the
-- admin dashboard through /api/admin/analytics. A "visit" is one load of the site in a
-- browser tab: `visit_id` is a random id held in memory for that load only — never stored
-- in the browser, no cookie, no IP address, no user agent. RLS on, no policy: browser
-- roles have no access.
--
-- Retention (privacy policy): 13 months, purged by public.purge_old_page_views().

create table if not exists public.page_views (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  visit_id       uuid        not null,
  path           text        not null check (char_length(path) between 1 and 200),
  is_entry       boolean     not null default false,
  -- Attribution of the visit (same on every page view of a load), from the landing
  -- link's utm_* or, without them, from the referring site (src/lib/trafficSource.js).
  source         text        not null check (char_length(source) between 1 and 100),
  medium         text        check (medium is null or char_length(medium) <= 100),
  campaign       text        check (campaign is null or char_length(campaign) <= 100),
  content        text        check (content is null or char_length(content) <= 100),
  referrer_host  text        check (referrer_host is null or char_length(referrer_host) <= 255),
  device         text        not null check (device in ('mobile', 'tablet', 'desktop')),
  country        text        check (country is null or country ~ '^[A-Z]{2}$')
);

create index if not exists page_views_created_at_idx on public.page_views (created_at);
create index if not exists page_views_visit_id_idx on public.page_views (visit_id);

alter table public.page_views enable row level security;
revoke all on public.page_views from anon, authenticated;

-- Dashboard figures for [p_from, p_to), in one round trip. p_campaign: null = every visit,
-- '' = visits without a campaign, otherwise that campaign. Days are counted in Tunis time.
create or replace function public.homepage_visit_stats(
  p_from timestamptz,
  p_to timestamptz,
  p_campaign text default null
)
returns jsonb
language sql
stable
set search_path = public
as $$
  with views as (
    select *
    from public.page_views
    where created_at >= p_from
      and created_at < p_to
      and (
        p_campaign is null
        or (p_campaign = '' and campaign is null)
        or campaign = p_campaign
      )
  ),
  entries as (
    select * from views where is_entry
  )
  select jsonb_build_object(
    'visits', (select count(*) from entries),
    'campaignVisits', (select count(*) from entries where campaign is not null),
    'formOpened', (
      select count(distinct visit_id) from views where path = '/demande-inspection'
    ),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object('source', source, 'medium', medium, 'visits', n))
      from (select source, medium, count(*) as n from entries group by source, medium) s
    ), '[]'::jsonb),
    'days', coalesce((
      select jsonb_agg(jsonb_build_object('date', day, 'visits', n))
      from (
        select (created_at at time zone 'Africa/Tunis')::date as day, count(*) as n
        from entries group by 1
      ) d
    ), '[]'::jsonb),
    'ads', coalesce((
      select jsonb_agg(jsonb_build_object(
        'campaign', campaign, 'content', content, 'sources', sources, 'visits', n))
      from (
        select campaign, content, count(*) as n,
               jsonb_agg(distinct source) as sources
        from entries where campaign is not null group by campaign, content
      ) a
    ), '[]'::jsonb),
    'entryPages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'visits', n))
      from (select path, count(*) as n from entries group by path) p
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_object_agg(device, n)
      from (select device, count(*) as n from entries group by device) v
    ), '{}'::jsonb),
    -- Every campaign of the period, whatever the filter: it feeds the filter's own list.
    'campaigns', coalesce((
      select jsonb_agg(distinct campaign)
      from public.page_views
      where created_at >= p_from and created_at < p_to and is_entry and campaign is not null
    ), '[]'::jsonb)
  );
$$;

create or replace function public.purge_old_page_views()
returns integer
language sql
volatile
set search_path = public
as $$
  with gone as (
    delete from public.page_views where created_at < now() - interval '13 months' returning 1
  )
  select count(*)::integer from gone;
$$;

-- Functions are executable by PUBLIC by default: only the service role may call these.
revoke all on function public.homepage_visit_stats(timestamptz, timestamptz, text) from public, anon, authenticated;
revoke all on function public.purge_old_page_views() from public, anon, authenticated;
grant execute on function public.homepage_visit_stats(timestamptz, timestamptz, text) to service_role;
grant execute on function public.purge_old_page_views() to service_role;
