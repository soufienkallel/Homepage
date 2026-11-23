-- Admin dashboard: every page visited and the navigation between pages (2 Oct 2026).
--
-- Adds two figures to homepage_visit_stats(), computed from the page views already recorded
-- (no new data is collected):
--   `pages`       — per page: views, visits that opened it, visits that started on it;
--   `transitions` — moves from one page to the next within a visit (from → to, visits).
-- `entryPages` is kept so the dashboard deployed before this change keeps working.
-- The rest of the function is unchanged from 20261002110000_visit_stats_pricing.sql.

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
    -- Pricing page (docs/specs/2026-10-tarifs.md): visits that viewed /tarifs, and those
    -- among them that opened the request form afterwards in the same visit.
    'pricingViewed', (
      select count(distinct visit_id) from views where path = '/tarifs'
    ),
    'pricingThenForm', (
      select count(distinct t.visit_id)
      from views t
      where t.path = '/tarifs'
        and exists (
          select 1 from views f
          where f.visit_id = t.visit_id
            and f.path = '/demande-inspection'
            and f.created_at > t.created_at
        )
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
    -- Every page of the site seen in the period: views, visits that opened it, and visits
    -- that started on it. Only pages of the site are recorded (src/lib/trackedPaths.js).
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object(
        'path', path, 'views', views, 'visits', visits, 'entries', entries))
      from (
        select path,
               count(*) as views,
               count(distinct visit_id) as visits,
               count(distinct visit_id) filter (where is_entry) as entries
        from views group by path
      ) p
    ), '[]'::jsonb),
    -- Moves from one page to the next within a visit, counted once per visit.
    'transitions', coalesce((
      select jsonb_agg(jsonb_build_object('from', from_path, 'to', to_path, 'visits', n))
      from (
        select from_path, to_path, count(distinct visit_id) as n
        from (
          select visit_id,
                 lag(path) over (partition by visit_id order by created_at, id) as from_path,
                 path as to_path
          from views
        ) m
        where from_path is not null and from_path <> to_path
        group by from_path, to_path
      ) t
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

revoke all on function public.homepage_visit_stats(timestamptz, timestamptz, text) from public, anon, authenticated;
grant execute on function public.homepage_visit_stats(timestamptz, timestamptz, text) to service_role;
