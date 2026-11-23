-- Partners of the site (docs/specs/2026-10-refonte-accueil.md §9, 16 Oct 2026): the logo strip
-- of the homepage and the cards of /partenaires, edited from /admin/partenaires.
--
-- Three types: partner centres (garages that run the diagnostic in their own workshop, report
-- in their own name), platforms (marketplaces that sell the diagnostic), technology suppliers.
-- A partner has two independent switches: its logo on the homepage, and its card
-- (draft / published / archived).
--
-- Access:
--   * the public reads `partners_public` only: homepage logos and published cards, with the
--     card text of unpublished partners left out (drafts are not public);
--   * admins (public.is_homepage_admin()) read and write `partners` directly;
--   * logos: public bucket `partners`, written by admins only (same model as `guides`).
-- Idempotent.

-- ─── Table ────────────────────────────────────────────────────────

-- At most 3 services of 1 to 60 characters each (immutable, so usable in a check).
create or replace function public.partner_services_valid(items text[])
returns boolean
language sql
immutable
as $$
  select cardinality(items) <= 3
     and coalesce(bool_and(char_length(btrim(item)) between 1 and 60), true)
  from unnest(items) as item;
$$;

create table if not exists public.partners (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique
                       check (char_length(slug) <= 60 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                 text not null check (char_length(btrim(name)) between 1 and 120),
  type                 text not null check (type in ('centre', 'plateforme', 'technologie')),
  country              text check (country is null or country ~ '^[A-Z]{2}$'),
  city                 text check (city is null or char_length(city) <= 80),
  -- International format, e.g. +21671000000: the card turns it into a tel: link.
  booking_phone        text check (booking_phone is null or booking_phone ~ '^\+[1-9][0-9]{6,14}$'),
  website_url          text check (
                         website_url is null
                         or (char_length(website_url) <= 300 and website_url ~ '^https://[^[:space:]]+$')
                       ),
  -- A file of the site (seeded logos) or a public URL of the `partners` bucket.
  logo_url             text check (
                         logo_url is null
                         or logo_url ~ '^/images/partners/[a-z0-9._-]+\.(png|webp|jpe?g)$'
                         or (char_length(logo_url) <= 500 and logo_url ~ '^https://[^[:space:]]+$')
                       ),
  logo_tile            text not null default 'light' check (logo_tile in ('light', 'dark')),
  description          text check (description is null or char_length(description) <= 160),
  services             text[] not null default '{}' check (public.partner_services_valid(services)),
  show_logo_on_home    boolean not null default false,
  profile_status       text not null default 'draft'
                       check (profile_status in ('draft', 'published', 'archived')),
  sort_order           integer not null default 0,
  -- Proof of consent: the date the partner allowed its logo, and approved its card.
  logo_consent_at      date,
  partner_approved_at  date,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  updated_by           uuid,
  constraint partners_home_logo_needs_logo check (not show_logo_on_home or logo_url is not null),
  constraint partners_archived_off_home check (profile_status <> 'archived' or not show_logo_on_home),
  -- Publishing a card needs everything the card shows, and both consents. Enforced here so
  -- the rule holds even if the editor is bypassed.
  constraint partners_published_complete check (
    profile_status <> 'published'
    or (
      logo_url is not null
      and char_length(btrim(coalesce(description, ''))) > 0
      and logo_consent_at is not null
      and partner_approved_at is not null
      and (type = 'technologie' or cardinality(services) >= 1)
      and (type = 'technologie' or booking_phone is not null or website_url is not null)
    )
  )
);

create index if not exists partners_sort_idx on public.partners (sort_order, name);

drop trigger if exists set_partners_updated_at on public.partners;
create trigger set_partners_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at_now();

-- Who changed a partner last (the admin's auth user id), set by the database itself.
create or replace function public.set_partners_updated_by()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists set_partners_updated_by on public.partners;
create trigger set_partners_updated_by
  before insert or update on public.partners
  for each row execute function public.set_partners_updated_by();

alter table public.partners enable row level security;
revoke all on public.partners from anon;

drop policy if exists "partners_admin_all" on public.partners;
create policy "partners_admin_all"
  on public.partners for all
  to authenticated
  using (public.is_homepage_admin())
  with check (public.is_homepage_admin());

-- ─── Public projection ────────────────────────────────────────────

-- What the public may see. Runs with the owner's rights (it bypasses the admin-only policy
-- above), so the filter and the column list here ARE the access rule: homepage logos and
-- published cards, card text only when the card is published, never the consent dates or
-- the editor's id.
create or replace view public.partners_public as
select
  id,
  slug,
  name,
  type,
  country,
  city,
  logo_url,
  logo_tile,
  show_logo_on_home,
  sort_order,
  profile_status = 'published' as has_profile,
  case when profile_status = 'published' then description end as description,
  case when profile_status = 'published' then services else '{}'::text[] end as services,
  case when profile_status = 'published' then booking_phone end as booking_phone,
  case when profile_status = 'published' then website_url end as website_url
from public.partners
where show_logo_on_home or profile_status = 'published';

revoke all on public.partners_public from public, anon, authenticated;
grant select on public.partners_public to anon, authenticated;

-- ─── Logos: public bucket, admin-only writes ──────────────────────

-- No SVG: an SVG file can carry script.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('partners', 'partners', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "partners_logos_admin_insert" on storage.objects;
create policy "partners_logos_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'partners' and public.is_homepage_admin());

drop policy if exists "partners_logos_admin_update" on storage.objects;
create policy "partners_logos_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'partners' and public.is_homepage_admin())
  with check (bucket_id = 'partners' and public.is_homepage_admin());

drop policy if exists "partners_logos_admin_delete" on storage.objects;
create policy "partners_logos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'partners' and public.is_homepage_admin());

-- ─── Today's partners ─────────────────────────────────────────────

-- The five logos shown on the homepage until now (src/components/home/certification/
-- PartnerLogos.jsx): logos switched on, cards in draft. The homepage shows a logo only once
-- its card is published, so nothing about a partner is public before its own approval.
-- Logo consent: confirmed on 22 Sept 2026 for Myrage, Auto Lion, AIJ Automotive and
-- ScoutCar.tn; none recorded for AutoPi (left empty, the admin shows it). Websites and cities
-- are filled in from the admin, from what each partner supplies.
insert into public.partners
  (slug, name, type, country, website_url, logo_url, logo_tile, show_logo_on_home, sort_order, logo_consent_at)
values
  ('myrage', 'Myrage Automotive Service', 'centre', 'TN', null, '/images/partners/myrage.png', 'light', true, 1, '2026-09-22'),
  ('auto-lion', 'STE Auto Lion', 'centre', 'TN', null, '/images/partners/auto-lion.png', 'light', true, 2, '2026-09-22'),
  ('aij-automotive', 'AIJ Automotive', 'centre', 'DE', 'https://aij-automotive.de', '/images/partners/aij-automotive.png', 'dark', true, 3, '2026-09-22'),
  ('scoutcar', 'ScoutCar.tn', 'plateforme', 'TN', 'https://scoutcar.tn', '/images/partners/scoutcar.png', 'light', true, 4, '2026-09-22'),
  ('autopi', 'AutoPi', 'technologie', null, null, '/images/partners/autopi.png', 'light', true, 5, null)
on conflict (slug) do nothing;

-- Ask PostgREST (the API) to reload its table list now, not at its next restart.
notify pgrst, 'reload schema';
