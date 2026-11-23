-- Severity on three levels in the agent knowledge base (3 Oct 2026).
--
-- The product dropped the « Critique » severity (decision of Sept 2026, taxonomy.ts
-- GRAVITE_LEVELS = Mineure, Modérée, Majeure). The site figures now follow
-- (src/data/inspectionFacts.js); this migration patches the one knowledge-base sentence that
-- still lists four levels, so the agents do not contradict the site.
--
-- Same pattern as 20261002100000_agent_knowledge_public_price.sql: the sentence is patched in
-- place (edits made from /admin/knowledge are kept), the active row is archived and a new
-- active row is inserted with version = max(version) + 1. Re-running is a no-op. If an admin
-- already rewrote the sentence, the category is left untouched and a notice is raised.
--
-- Readable mirror: server/agents/shared/knowledge/proof.md.

create temp table _kb_patch (
  category text primary key,
  old_text text not null,
  new_text text not null
);

insert into _kb_patch (category, old_text, new_text) values
  ('proof',
   $kb$- Gravité par constat, sur quatre niveaux : Mineure, Modérée, Majeure, Critique.$kb$,
   $kb$- Gravité par constat, sur trois niveaux : Mineure, Modérée, Majeure.$kb$);

create temp table _kb_new as
select k.category,
       k.title,
       replace(k.content, p.old_text, p.new_text) as content
  from public.agent_knowledge k
  join _kb_patch p on p.category = k.category
 where k.is_active
   and position(p.old_text in k.content) > 0;

do $$
declare
  missing text;
begin
  select string_agg(p.category, ', ')
    into missing
    from _kb_patch p
   where not exists (select 1 from _kb_new n where n.category = p.category)
     and not exists (
       select 1 from public.agent_knowledge k
        where k.category = p.category and k.is_active
          and position(p.new_text in k.content) > 0
     );
  if missing is not null then
    raise notice 'agent_knowledge severity: sentence not found, category left unchanged: %', missing;
  end if;
end $$;

-- 1. Archive the active row of each patched category.
update public.agent_knowledge k
   set is_active = false,
       updated_at = now(),
       updated_by = 'migration:20261003120000'
  from _kb_new n
 where k.category = n.category
   and k.is_active;

-- 2. Insert the patched row as the new active version.
insert into public.agent_knowledge (category, title, content, is_active, version, updated_by)
select n.category,
       n.title,
       n.content,
       true,
       coalesce((select max(a.version) from public.agent_knowledge a where a.category = n.category), 0) + 1,
       'migration:20261003120000'
  from _kb_new n;

drop table _kb_new;
drop table _kb_patch;
