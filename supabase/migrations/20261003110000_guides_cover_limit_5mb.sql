-- Guide covers: size limit of the `guides` bucket raised from 2 MB to 5 MB (3 Oct 2026).
-- A generated 1536 x 1024 cover came out at 2.01 MB and was refused. Types are unchanged.
-- Idempotent. Keep COVER_MAX_BYTES in src/lib/guideService.js in step.

update storage.buckets
set file_size_limit = 5242880
where id = 'guides';
