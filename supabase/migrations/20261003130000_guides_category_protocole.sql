-- Guides: new category « protocole » (docs/specs/2026-10-guide-protocole.md, 3 Oct 2026).
-- Mirrored by GUIDE_CATEGORIES in src/data/guides.js. Idempotent.

alter table public.guides drop constraint if exists guides_category_check;
alter table public.guides
  add constraint guides_category_check
  check (category is null or category in
    ('carrosserie', 'pneus-freins', 'mecanique', 'documents', 'diagnostic', 'protocole'));
