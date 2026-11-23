-- The `articles` table becomes `guides` (docs/specs/2026-10-guides.md, 2 Oct 2026): the page,
-- the editor and the table now use one name. Idempotent. Policies, constraints and data follow
-- the table; only their names change.

do $$
begin
  if to_regclass('public.articles') is not null and to_regclass('public.guides') is null then
    alter table public.articles rename to guides;
  end if;
end
$$;

alter index if exists public.articles_pkey rename to guides_pkey;
alter index if exists public.articles_slug_key rename to guides_slug_key;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'articles_category_check') then
    alter table public.guides rename constraint articles_category_check to guides_category_check;
  end if;
  if exists (select 1 from pg_constraint where conname = 'articles_published_requires_review') then
    alter table public.guides
      rename constraint articles_published_requires_review to guides_published_requires_review;
  end if;
  if exists (select 1 from pg_policies where tablename = 'guides' and policyname = 'articles_published_select') then
    alter policy "articles_published_select" on public.guides rename to "guides_published_select";
  end if;
  if exists (select 1 from pg_policies where tablename = 'guides' and policyname = 'articles_admin_all') then
    alter policy "articles_admin_all" on public.guides rename to "guides_admin_all";
  end if;
  if exists (select 1 from pg_policies where tablename = 'guides' and policyname = 'articles_service_role_all') then
    alter policy "articles_service_role_all" on public.guides rename to "guides_service_role_all";
  end if;
end
$$;
