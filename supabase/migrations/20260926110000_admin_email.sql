-- MALLOULIAUTO homepage — the admin account moves to admin@mallouliauto.com
-- (owner decision, 26 Sept 2026). Replaces admin@mallouliauto.tn in the allowlist
-- read by server/adminAuth.js and public.is_homepage_admin(). Idempotent.
--
-- The Supabase Auth user itself (e-mail, password, confirmation) is managed in the
-- dashboard, not by migrations.

insert into public.homepage_admins (email) values ('admin@mallouliauto.com')
on conflict do nothing;

delete from public.homepage_admins where email = 'admin@mallouliauto.tn';
