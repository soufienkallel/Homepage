<!-- Copie de référence de la migration supabase/migrations/20260925100600_agent_knowledge_rebuild.sql.
     Aucun code ne lit ce fichier : la source live est la table agent_knowledge
     (voir /admin/knowledge). Toute modification passe par une nouvelle migration. -->

# Loueurs et gestionnaires de flotte

## Pour qui
Loueur ou gestionnaire de flotte qui a besoin d'un état documenté de ses véhicules.

## Ce que le rapport apporte
- L'état du véhicule à la sortie, au retour ou à intervalle régulier, selon le même protocole pour chaque véhicule.
- Une preuve datée et vérifiable en cas de désaccord sur l'état au retour.
- Avant et après réparation : deux rapports horodatés qui encadrent l'intervention d'un atelier.
- Avant cession : un rapport remis à l'acheteur.

## Objets d'inspection
Préventive, Avant réparation, Après réparation, Achat / Vente, Après accident / Expertise, Autre.

## À ne pas promettre
Pas de tableau de bord de flotte, pas de check-in chauffeur, pas d'alertes automatiques, pas de score de santé, aucun prix (ni prix de volume), aucun gain chiffré.
