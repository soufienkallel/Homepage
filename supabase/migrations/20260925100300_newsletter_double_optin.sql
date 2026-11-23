-- MALLOULIAUTO — double opt-in + server-side proof of consent (was docs/marketing-consent-002).
-- Runs after 20260925100200_marketing_consents.sql. Idempotent.
--
-- Why: Mailjet requires, for every marketing contact, the URL of the hyperlink
-- clicked to confirm the subscription, the timestamp of that click, the
-- statement agreed to, and (if possible) the public IP address. This needs a
-- confirmation link (double opt-in) and a server endpoint that sees the IP.
--
-- After this migration the browser no longer writes to the log: all inserts go
-- through the Vercel Functions in api/newsletter/*, which use the service role.

-- 1. Event log: new columns -------------------------------------------------

alter table public.marketing_consents
  add column if not exists event_type text not null default 'form_submitted',
  add column if not exists ip_address inet,
  add column if not exists confirmation_url text,
  add column if not exists confirmation_statement text,
  add column if not exists request_event_id uuid references public.marketing_consents (id);

-- form_submitted : contact form sent without marketing opt-in (privacy proof only),
--                  and every row written before this migration (single opt-in).
-- requested      : marketing opt-in submitted, confirmation e-mail sent.
-- confirmed      : the subscriber clicked the confirmation link and confirmed.
-- unsubscribed   : consent withdrawn (reserved — Mailjet webhook sync, phase 2).
alter table public.marketing_consents
  drop constraint if exists marketing_consents_event_type_check;
alter table public.marketing_consents
  add constraint marketing_consents_event_type_check
  check (event_type in ('form_submitted', 'requested', 'confirmed', 'unsubscribed'));

alter table public.marketing_consents
  drop constraint if exists marketing_consents_optin_marketing_required;
alter table public.marketing_consents
  add constraint marketing_consents_optin_marketing_required
  check (event_type not in ('requested', 'confirmed') or marketing_consent is true);

alter table public.marketing_consents
  drop constraint if exists marketing_consents_confirmation_proof_required;
alter table public.marketing_consents
  add constraint marketing_consents_confirmation_proof_required
  check (
    event_type <> 'confirmed'
    or (
      confirmation_url is not null
      and confirmation_statement is not null
      and request_event_id is not null
    )
  );

-- Used by the per-IP rate limit in api/newsletter/subscribe.js.
create index if not exists marketing_consents_ip_created_at_idx
  on public.marketing_consents (ip_address, created_at desc);

-- 2. The browser can no longer write to the log ------------------------------

drop policy if exists "anon can log consent" on public.marketing_consents;
revoke insert on public.marketing_consents from anon, authenticated;

-- 3. Confirmation tokens -----------------------------------------------------
-- Only the SHA-256 hash of the token is stored; the raw token exists only in
-- the confirmation e-mail. RLS is on with no policy: service role only.

create table if not exists public.newsletter_optin_tokens (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  email               text        not null,
  token_hash          text        not null unique,
  request_event_id    uuid        not null references public.marketing_consents (id),
  expires_at          timestamptz not null,
  consumed_at         timestamptz,
  confirmed_event_id  uuid        references public.marketing_consents (id)
);

create index if not exists newsletter_optin_tokens_email_idx
  on public.newsletter_optin_tokens (email, created_at desc);

alter table public.newsletter_optin_tokens enable row level security;
revoke all on public.newsletter_optin_tokens from anon, authenticated;

-- 4. Atomic confirmation -----------------------------------------------------
-- Locks the token, writes the `confirmed` event and consumes the token in one
-- transaction, so a double click cannot produce two confirmations and a failed
-- insert cannot burn the token.

create or replace function public.confirm_newsletter_optin(
  p_token_hash       text,
  p_confirmation_url text,
  p_statement        text,
  p_ip_address       inet,
  p_user_agent       text
)
returns table (status text, email text, full_name text, confirmed_event_id uuid)
language plpgsql
set search_path = public
as $$
declare
  v_token   public.newsletter_optin_tokens%rowtype;
  v_request public.marketing_consents%rowtype;
  v_event   uuid;
begin
  select * into v_token
  from public.newsletter_optin_tokens t
  where t.token_hash = p_token_hash
  for update;

  if not found then
    return query select 'invalid'::text, null::text, null::text, null::uuid;
    return;
  end if;

  if v_token.consumed_at is not null then
    return query select 'already_confirmed'::text, v_token.email, null::text, v_token.confirmed_event_id;
    return;
  end if;

  if v_token.expires_at <= now() then
    return query select 'expired'::text, null::text, null::text, null::uuid;
    return;
  end if;

  select * into v_request
  from public.marketing_consents c
  where c.id = v_token.request_event_id;

  insert into public.marketing_consents (
    email, full_name, phone, source, event_type, consent_version,
    privacy_accepted, privacy_consent_text, marketing_consent, marketing_consent_text,
    consent_page_url, confirmation_url, confirmation_statement,
    ip_address, user_agent, request_event_id
  ) values (
    v_request.email, v_request.full_name, v_request.phone, v_request.source, 'confirmed',
    v_request.consent_version, v_request.privacy_accepted, v_request.privacy_consent_text,
    true, v_request.marketing_consent_text, v_request.consent_page_url,
    p_confirmation_url, p_statement, p_ip_address, p_user_agent, v_request.id
  )
  returning id into v_event;

  update public.newsletter_optin_tokens
  set consumed_at = now(), confirmed_event_id = v_event
  where id = v_token.id;

  return query select 'confirmed'::text, v_request.email, v_request.full_name, v_event;
end;
$$;

revoke all on function public.confirm_newsletter_optin(text, text, text, inet, text)
  from public, anon, authenticated;
grant execute on function public.confirm_newsletter_optin(text, text, text, inet, text)
  to service_role;

-- 5. Current subscription status ---------------------------------------------
-- Only `confirmed` and `unsubscribed` events change the status: a pending
-- request or a contact form sent without the marketing box never does.
-- Contacts from before this migration (single opt-in) are NOT subscribed here:
-- they must go through the confirmation link to be added to Mailjet.

drop view if exists public.marketing_consents_current;
create view public.marketing_consents_current
with (security_invoker = on) as
select distinct on (email)
  email,
  full_name,
  phone,
  (event_type = 'confirmed') as is_subscribed,
  source,
  consent_version,
  created_at as status_changed_at
from public.marketing_consents
where event_type in ('confirmed', 'unsubscribed')
order by email, created_at desc;

revoke all on public.marketing_consents_current from anon, authenticated;

-- 6. Proof of consent per contact — the export to hand to Mailjet ------------

drop view if exists public.marketing_consent_proofs;
create view public.marketing_consent_proofs
with (security_invoker = on) as
select
  c.email,
  c.confirmation_url                                   as clicked_url,
  to_char(c.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as clicked_at_utc,
  c.ip_address                                         as clicked_from_ip,
  c.confirmation_statement                             as confirmation_statement,
  r.marketing_consent_text                             as form_statement,
  r.consent_version,
  r.consent_page_url                                   as form_page_url,
  to_char(r.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as form_submitted_at_utc,
  r.ip_address                                         as form_submitted_from_ip,
  c.source
from public.marketing_consents c
join public.marketing_consents r on r.id = c.request_event_id
where c.event_type = 'confirmed';

revoke all on public.marketing_consent_proofs from anon, authenticated;
