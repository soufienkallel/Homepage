-- Admin dashboard: pricing page in the visit funnel (2 Oct 2026, docs/specs/2026-10-tarifs.md).
--
-- Adds two figures to homepage_visit_stats(): `pricingViewed` (visits that viewed /tarifs)
-- and `pricingThenForm` (those that opened /demande-inspection afterwards, same visit).
-- The rest of the function is unchanged from 20260927100000_page_views.sql. CREATE OR
-- REPLACE keeps the function's grants; they are restated below anyway so this file reads
-- on its own.

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
