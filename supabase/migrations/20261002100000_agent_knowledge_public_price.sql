-- Public price in the agent knowledge base (2 Oct 2026).
--
-- The owner reversed the "no price anywhere" rule (docs/specs/2026-10-tarifs.md): the site now
-- publishes "inspection complète à partir de 250 TND TTC" on /tarifs, with the factors that
-- change the price and the travel rule. The chatbot prompt already carries the price from
-- src/data/pricing.js; this migration removes the two knowledge-base sentences that would
-- contradict it. The 250 TND figure below mirrors src/data/pricing.js (BASE_PRICE_TND).
--
-- Unlike 20260925100600, this patches sentences instead of replacing whole rows, so edits made
-- since then from /admin/knowledge are kept. Per uq_agent_knowledge_active_category, the
-- active row is archived and a new active row is inserted with version = max(version) + 1, in
-- the transaction the Supabase CLI opens for each migration file. Re-running is a no-op: once
-- patched, the old sentence is no longer found. If an admin already rewrote a sentence, that
-- category is left untouched and a notice is raised.
--
-- Professional segments keep "aucun prix": their conditions stay "sur devis".
--
-- Readable mirrors: server/agents/shared/knowledge/company.md and value-props/b2c.md.

create temp table _kb_patch (
  category text primary key,
  old_text text not null,
  new_text text not null
);

insert into _kb_patch (category, old_text, new_text) values
  ('company',
   $kb$Aucun prix n'est communiqué par ce canal. Le tarif dépend du besoin et du périmètre d'inspection : oriente vers le contact ou la prise de rendez-vous.$kb$,
   $kb$Tarif public, pour les particuliers : inspection complète à partir de 250 TND TTC, pour une citadine en inspection avant achat. Le prix exact dépend du type de véhicule, de sa valeur et de l'objet de l'inspection ; il est annoncé lors du rappel, avant toute confirmation, et ne dépend pas des défauts constatés. Déplacement inclus dans le Grand Tunis et le gouvernorat de Sfax ; ailleurs, frais selon la zone, annoncés avant confirmation. Détail : mallouliauto.com/tarifs. Ne donne jamais de prix exact pour un véhicule précis, ni aucun autre montant. Professionnels (flottes, experts, assurance) : conditions sur devis.$kb$),
  ('value_prop_b2c',
   $kb$pas de conseil d'achat, aucun prix, aucun gain chiffré.$kb$,
   $kb$pas de conseil d'achat, aucun prix autre que le tarif public (à partir de 250 TND TTC, détail sur mallouliauto.com/tarifs), aucun gain chiffré.$kb$);

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
    raise notice 'agent_knowledge public price: sentence not found, category left unchanged: %', missing;
  end if;
end $$;

-- 1. Archive the active row of each patched category.
update public.agent_knowledge k
   set is_active = false,
       updated_at = now(),
       updated_by = 'migration:20261002100000'
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
       'migration:20261002100000'
  from _kb_new n;

drop table _kb_new;
drop table _kb_patch;
