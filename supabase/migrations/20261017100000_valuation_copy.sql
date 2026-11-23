-- « Prix le plus probable » in the guide and in the agent knowledge base (17 Oct 2026).
--
-- The inspection product can print a market valuation under the repair total (ma-inspector,
-- issue #317, approved 5 Oct 2026): a price computed by an equation (new price of the model,
-- age, mileage) minus the estimated repairs. No AI, no language model. The founder asked to
-- highlight it (17 Oct 2026). Two places still said the opposite or forbade talking about it:
--
--   1. The protocol guide ("Notre protocole d'inspection"): « ni estimation du prix du véhicule ».
--   2. The agents' knowledge base: « aucun prix » read as « never mention a vehicle price ».
--
-- Same mechanics as 20261002100000_agent_knowledge_public_price.sql: sentences are patched in
-- place, so edits made from /admin/guides and /admin/knowledge are kept; a sentence an admin
-- already rewrote is left alone (a notice is raised). Re-running is a no-op. For the knowledge
-- base the active row is archived and a new active row is inserted with version = max + 1.
--
-- Readable mirrors: server/agents/shared/knowledge/company.md and value-props/{b2c,dealer}.md.
-- The guide is rebuilt into the public site by the next deployment (or « Reconstruire » in the
-- admin).

-- ─── 1. Guide ────────────────────────────────────────────────────────────────

update public.guides
   set body = replace(
                replace(
                  body,
                  $old$Il ne donne **ni note globale, ni conseil d'achat, ni estimation du prix du véhicule, ni garantie sur sa structure**.$old$,
                  $new$Il ne donne **ni note globale, ni conseil d'achat, ni garantie sur sa structure**. Le prix le plus probable du véhicule est une estimation du marché, pas un prix garanti.$new$
                ),
                $old$les mesures, le total estimé des réparations s'il a été demandé, la synthèse de l'inspecteur$old$,
                $new$les mesures, le total estimé des réparations s'il a été demandé, le prix le plus probable du véhicule, la synthèse de l'inspecteur$new$
              )
 where slug = 'protocole-inspection-mallouliauto'
   and (
     position($old$ni estimation du prix du véhicule, ni garantie sur sa structure**.$old$ in body) > 0
     or position($old$le total estimé des réparations s'il a été demandé, la synthèse de l'inspecteur$old$ in body) > 0
   );

-- ─── 2. Agent knowledge base ─────────────────────────────────────────────────

create temp table _kb_patch (
  category text primary key,
  old_text text not null,
  new_text text not null
);

insert into _kb_patch (category, old_text, new_text) values
  ('company',
   $kb$- Constat, gravité et coût : produits par l'inspecteur. Un inspecteur habilité audite et signe chaque rapport.$kb$,
   $kb$- Constat, gravité et coût : produits par l'inspecteur. Un inspecteur habilité audite et signe chaque rapport.
- Prix le plus probable : estimation de la valeur du véhicule sur le marché tunisien, calculée par une équation (prix neuf du modèle, âge, kilométrage) puis diminuée du chiffrage des réparations. Ce n'est pas de l'IA. Tu ne donnes jamais toi-même le prix d'un véhicule : renvoie au rapport.$kb$),
  ('value_prop_b2c',
   $kb$pas de conseil d'achat, aucun prix autre que le tarif public (à partir de 250 TND TTC, détail sur mallouliauto.com/tarifs), aucun gain chiffré.$kb$,
   $kb$pas de conseil d'achat, aucun prix de service autre que le tarif public (à partir de 250 TND TTC, détail sur mallouliauto.com/tarifs), aucun gain chiffré. Le rapport indique le prix le plus probable du véhicule ; tu ne donnes jamais toi-même de prix de véhicule.$kb$),
  ('value_prop_dealer',
   $kb$pas de programme partenaire en marque blanche pour les marchands, aucun prix, aucun gain chiffré.$kb$,
   $kb$pas de programme partenaire en marque blanche pour les marchands, aucun tarif communiqué (sur devis), aucun gain chiffré. Le rapport indique le prix le plus probable de chaque véhicule ; tu ne donnes jamais toi-même de prix de véhicule.$kb$);

create temp table _kb_new as
select k.category,
       k.title,
       replace(k.content, p.old_text, p.new_text) as content
  from public.agent_knowledge k
  join _kb_patch p on p.category = k.category
 where k.is_active
   and position(p.old_text in k.content) > 0
   -- the company patch only appends to the old sentence: skip a row that already has the new text
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
    raise notice 'agent_knowledge valuation: sentence not found, category left unchanged: %', missing;
  end if;
end $$;

-- 1. Archive the active row of each patched category.
update public.agent_knowledge k
   set is_active = false,
       updated_at = now(),
       updated_by = 'migration:20261017100000'
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
       'migration:20261017100000'
  from _kb_new n;

drop table _kb_new;
drop table _kb_patch;
