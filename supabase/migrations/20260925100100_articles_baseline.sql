-- MALLOULIAUTO homepage — newsroom articles.
-- Copied from the monorepo migration 098 (Malloulinova/mallouliauto@ad22609e), whose
-- ownership moves to this repository. Idempotent. The write policies for
-- authenticated users are replaced by admin-only ones in 20260925100400_harden_rls.sql.


CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  author TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy
DROP POLICY IF EXISTS "articles_public_select" ON public.articles;
CREATE POLICY "articles_public_select"
  ON public.articles FOR SELECT
  TO public
  USING (true);

-- 2. Authenticated Insert Policy
DROP POLICY IF EXISTS "articles_authenticated_insert" ON public.articles;
CREATE POLICY "articles_authenticated_insert"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Authenticated Update Policy
DROP POLICY IF EXISTS "articles_authenticated_update" ON public.articles;
CREATE POLICY "articles_authenticated_update"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Authenticated Delete Policy (Fixes deletion failure on Supabase side)
DROP POLICY IF EXISTS "articles_authenticated_delete" ON public.articles;
CREATE POLICY "articles_authenticated_delete"
  ON public.articles FOR DELETE
  TO authenticated
  USING (true);

-- 5. Service Role Policy
DROP POLICY IF EXISTS "articles_service_role_all" ON public.articles;
CREATE POLICY "articles_service_role_all"
  ON public.articles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
