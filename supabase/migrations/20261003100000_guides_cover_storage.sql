-- Cover images of guides: public Storage bucket `guides`, written by admins only.
-- The page reads the images through their public URL (no policy needed for a public
-- bucket); uploads, replacements and deletions require public.is_homepage_admin().
-- Limits are enforced by the bucket itself: 2 MB, JPEG / PNG / WebP. Idempotent.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guides', 'guides', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "guides_images_admin_insert" on storage.objects;
create policy "guides_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'guides' and public.is_homepage_admin());

drop policy if exists "guides_images_admin_update" on storage.objects;
create policy "guides_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'guides' and public.is_homepage_admin())
  with check (bucket_id = 'guides' and public.is_homepage_admin());

drop policy if exists "guides_images_admin_delete" on storage.objects;
create policy "guides_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'guides' and public.is_homepage_admin());
