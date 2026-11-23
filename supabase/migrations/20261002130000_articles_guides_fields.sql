-- « Actualités » becomes « Guides » (docs/specs/2026-10-guides.md, 2 Oct 2026).
-- Adds a category and a review date to articles, and moves the recorded visits of the old
-- /newsroom pages to /guides so the dashboard shows one continuous series.
-- Idempotent. Row-level security is unchanged: the new columns follow the existing policies
-- (visitors read published rows, admins read and write everything).

alter table public.articles
  add column if not exists category text,
  add column if not exists reviewed_at date;

-- Closed list, mirrored by GUIDE_CATEGORIES in src/data/guides.js.
alter table public.articles drop constraint if exists articles_category_check;
alter table public.articles
  add constraint articles_category_check
  check (category is null or category in
    ('carrosserie', 'pneus-freins', 'mecanique', 'documents', 'diagnostic'));

-- A guide is published only once someone has reviewed it. NOT VALID: rows written before this
-- migration are not re-checked, every later insert or update is.
alter table public.articles drop constraint if exists articles_published_requires_review;
alter table public.articles
  add constraint articles_published_requires_review
  check (status <> 'published' or reviewed_at is not null) not valid;

-- Visits recorded under the old addresses (the site now redirects them with a 301).
update public.page_views
set path = '/guides' || substr(path, length('/newsroom') + 1)
where path = '/newsroom' or path like '/newsroom/%';
