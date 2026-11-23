-- MALLOULIAUTO — consent log for e-mail marketing (Mailjet compliance / GDPR art. 7).
-- Superseded in part by 20260925100300_newsletter_double_optin.sql (double opt-in,
-- server-side writes only). Idempotent, so it is safe on a project where this file
-- was already applied by hand from docs/ before it became a migration.
--
-- Design notes:
--  * Append-only: one row per consent EVENT (opt-in or form submission without
--    opt-in). Never updated, never de-duplicated — the history is the proof.
--  * The public site writes with the anon key, so the table is insert-only for
--    `anon` and never readable from the browser.

create table if not exists public.marketing_consents (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  email                  text        not null,
  full_name              text,
  phone                  text,
  -- Which form produced the event.
  source                 text        not null check (source in ('newsletter', 'contact')),
  -- Version of the wording shown; bump in src/lib/consentService.js when the text changes.
  consent_version        text        not null,
  privacy_accepted       boolean     not null default false,
  privacy_consent_text   text        not null,
  marketing_consent      boolean     not null default false,
  -- Non-null only when the marketing box was actually ticked.
  marketing_consent_text text,
  consent_page_url       text,
  user_agent             text,
  constraint marketing_consent_text_required
    check (marketing_consent is false or marketing_consent_text is not null)
);

create index if not exists marketing_consents_email_idx
  on public.marketing_consents (email);
create index if not exists marketing_consents_created_at_idx
  on public.marketing_consents (created_at desc);

alter table public.marketing_consents enable row level security;

-- Insert-only for the public site. No select/update/delete policy is defined,
-- so the anon key cannot read or alter the log; exports run with the service
-- role key from a trusted environment.
drop policy if exists "anon can log consent" on public.marketing_consents;
create policy "anon can log consent"
  on public.marketing_consents
  for insert
  to anon
  with check (
    privacy_accepted is true
    and char_length(email) between 5 and 320
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'
  );

-- Current opt-in status per address — the list to sync into Mailjet.
-- security_invoker keeps RLS applying to the caller, so the view cannot be used
-- to read the log with the anon key.
-- drop + create (not "or replace"): the next migration changes this view's columns,
-- and re-running this file after it must not fail.
drop view if exists public.marketing_consents_current;
create view public.marketing_consents_current
with (security_invoker = on) as
select distinct on (email)
  email,
  full_name,
  phone,
  marketing_consent,
  source,
  consent_version,
  created_at as consented_at
from public.marketing_consents
order by email, created_at desc;

revoke all on public.marketing_consents_current from anon;
