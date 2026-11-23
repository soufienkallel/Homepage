-- MALLOULIAUTO homepage — close the consent log to browser roles entirely.
--
-- 20260925100300_newsletter_double_optin revoked INSERT only. On the cloud project,
-- Supabase's default privileges had also granted SELECT / UPDATE / DELETE to anon and
-- authenticated (verified after the push of 25 Sept 2026: the anon key got 200 with an
-- empty result). RLS already hid every row, but no browser role needs any privilege:
-- all reads and writes go through api/newsletter/* with the service role.

revoke all on public.marketing_consents from anon, authenticated;
revoke all on public.marketing_consents_current from anon, authenticated;
