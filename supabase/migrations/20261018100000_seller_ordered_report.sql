-- « Le rapport est-il fiable si c'est le vendeur qui le commande ? » in the agents' knowledge base
-- (18 Oct 2026).
--
-- An assistant's answer about MALLOULIAUTO objected that a report produced on the seller's side
-- does not replace an independent expert. The site now answers it (homepage FAQ, /professionnels):
-- the seller cannot modify the report (confirmed by the founder, 18 Oct 2026). The agents must say
-- the same thing, no more: nothing about how the report is protected technically.
--
-- Same mechanics as 20261017100000_valuation_copy.sql: the sentence is added in place, so edits
-- made from /admin/knowledge are kept; a row an admin already rewrote is left alone (a notice is
-- raised); re-running is a no-op. The active row is archived and a new active row is inserted
-- with version = max + 1.
--
-- Readable mirror: server/agents/shared/knowledge/company.md.

create temp table _kb_patch (
  category text primary key,
  old_text text not null,
  new_text text not null
);

insert into _kb_patch (category, old_text, new_text) values
  ('company',
   $kb$Tu ne donnes jamais toi-même le prix d'un véhicule : renvoie au rapport.$kb$,
   $kb$Tu ne donnes jamais toi-même le prix d'un véhicule : renvoie au rapport.
- Rapport commandé par le vendeur : il reste fiable parce que le vendeur ne peut rien y modifier. Le rapport est rédigé par l'inspecteur et remis en entier : le vendeur ne peut ni le corriger, ni en retirer un défaut. Le prix ne dépend pas de ce que le diagnostic trouve, et l'acheteur vérifie l'authenticité du document en ligne avec sa référence ou son QR code. N'explique pas comment le rapport est protégé techniquement : tu ne le sais pas.$kb$);

create temp table _kb_new as
select k.category,
       k.title,
       replace(k.content, p.old_text, p.new_text) as content
  from public.agent_knowledge k
  join _kb_patch p on p.category = k.category
 where k.is_active
   and position(p.old_text in k.content) > 0
   -- the patch only appends to the old sentence: skip a row that already has the new text
   and position(p.new_text in k.content) = 0;

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
    raise notice 'agent_knowledge seller-ordered report: sentence not found, category left unchanged: %', missing;
  end if;
end $$;

-- 1. Archive the active row of each patched category.
update public.agent_knowledge k
   set is_active = false,
       updated_at = now(),
       updated_by = 'migration:20261018100000'
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
       'migration:20261018100000'
  from _kb_new n;

drop table _kb_new;
drop table _kb_patch;
