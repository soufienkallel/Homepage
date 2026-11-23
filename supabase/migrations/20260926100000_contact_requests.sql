-- MALLOULIAUTO homepage — inspection and contact requests (docs/specs/2026-09-cta-demande-inspection.md).
--
-- Replaces the contact form's `mailto:` hand-off, which silently lost every request
-- whose visitor had no mail client configured. Written by POST /api/contact-requests
-- (service role), read and updated by /admin/demandes through
-- /api/admin/contact-requests. RLS on, no policy: browser roles have no access.
--
-- Retention (privacy policy): requests are kept 24 months after the last exchange.

create table if not exists public.contact_requests (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  reference               text        not null unique,
  kind                    text        not null
    check (kind in ('inspection', 'professionnel', 'partenaire', 'autre')),
  status                  text        not null default 'nouvelle'
    check (status in ('nouvelle', 'contactee', 'planifiee', 'realisee', 'sans_suite', 'annulee')),
  status_changed_at       timestamptz,
  handled_by              uuid,

  full_name               text        not null check (char_length(full_name) between 2 and 200),
  phone                   text        not null check (char_length(phone) between 6 and 40),
  email                   text        check (email is null or char_length(email) <= 320),
  company                 text        check (company is null or char_length(company) <= 200),
  message                 text        check (message is null or char_length(message) <= 4000),
  preferred_channel       text        not null default 'appel'
    check (preferred_channel in ('appel', 'whatsapp')),

  -- Inspection requests only.
  vehicle_make            text        check (vehicle_make is null or char_length(vehicle_make) <= 80),
  vehicle_model           text        check (vehicle_model is null or char_length(vehicle_model) <= 80),
  vehicle_year            text        check (vehicle_year is null or char_length(vehicle_year) <= 20),
  listing_url             text        check (listing_url is null or char_length(listing_url) <= 2048),
  purpose                 text        check (purpose is null or char_length(purpose) <= 80),
  location_type           text
    check (location_type is null or location_type in ('vendeur', 'domicile', 'locaux')),
  city                    text        check (city is null or char_length(city) <= 120),
  preferred_date          text        check (preferred_date is null or char_length(preferred_date) <= 80),

  -- Campaign measurement (no cookie: UTM kept in the tab's sessionStorage).
  page_url                text,
  referrer                text,
  utm                     jsonb,

  -- Abuse control and proof of the privacy-policy acceptance.
  ip_hash                 text,
  user_agent              text,
  privacy_consent_version text        not null,
  privacy_consent_text    text        not null,

  internal_note           text        check (internal_note is null or char_length(internal_note) <= 2000),

  constraint contact_requests_inspection_fields
    check (kind <> 'inspection' or (vehicle_make is not null and vehicle_model is not null
      and purpose is not null and location_type is not null and city is not null)),
  constraint contact_requests_message_required
    check (kind = 'inspection' or message is not null)
);

create index if not exists contact_requests_status_created_idx
  on public.contact_requests (status, created_at desc);
create index if not exists contact_requests_created_idx
  on public.contact_requests (created_at desc);
-- Per-IP rate limit in api/contact-requests.js.
create index if not exists contact_requests_ip_created_idx
  on public.contact_requests (ip_hash, created_at desc);

drop trigger if exists set_contact_requests_updated_at on public.contact_requests;
create trigger set_contact_requests_updated_at
  before update on public.contact_requests
  for each row execute function public.set_updated_at_now();

alter table public.contact_requests enable row level security;
revoke all on public.contact_requests from anon, authenticated;
