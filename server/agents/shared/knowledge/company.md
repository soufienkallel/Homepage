<!-- Copie de référence de la migration supabase/migrations/20260925100600_agent_knowledge_rebuild.sql.
     Aucun code ne lit ce fichier : la source live est la table agent_knowledge
     (voir /admin/knowledge). Toute modification passe par une nouvelle migration. -->

# MALLOULIAUTO — Entreprise

## Ce que fait MALLOULIAUTO
MALLOULIAUTO est un certificateur d'état de véhicules d'occasion, en Tunisie, adossé à sa propre plateforme d'inspection. Il inspecte en direct, sous sa marque, pour les particuliers. Il travaille aussi avec des experts automobiles habilités et avec des comptes professionnels : experts d'assurance, loueurs et gestionnaires de flotte.

L'inspection traditionnelle produit un constat qui dépend d'un seul expert. MALLOULIAUTO produit un rapport standardisé, qui aide à décider : un document unique, qui rassemble les mesures utiles à la transaction ou au sinistre, en langage clair, vérifiable par l'autre partie.

Un inspecteur contrôle le véhicule selon un protocole fixe, avec ses instruments. Le rapport donne des constats individuels, une gravité par constat et un chiffrage des réparations à prévoir. Il est horodaté et vérifiable en ligne.

## Un rapport, sept objets d'inspection
Le rapport est le même ; son objet change et figure sur chaque rapport.
- Achat / Vente : documenter l'état réel avant une transaction et chiffrer ce qu'il faudra reprendre.
- Avant réparation : constater l'état à l'entrée de l'atelier, avec photos horodatées.
- Après réparation : documenter l'état à la restitution. Deux rapports encadrent l'intervention.
- Préventive : faire le point sur un véhicule qu'on garde — ce qui est conforme, ce qui s'use, ce qu'il faudra budgéter.
- Visite technique : identifier à l'avance les points qui feraient échouer le contrôle.
- Après accident / Expertise : constats localisés, gravité, chiffrage, dans un dossier daté, vérifiable en ligne par l'autre partie.
- Autre : un objet précisé sur le rapport.

## Statut et tarifs
MALLOULIAUTO est en phase de lancement. Aucun chiffre d'activité (inspections réalisées, clients, rapports émis) n'est public : n'en cite aucun.
Tarif public, pour les particuliers : inspection complète à partir de 250 TND TTC, pour une citadine en inspection avant achat. Le prix exact dépend du type de véhicule, de sa valeur et de l'objet de l'inspection ; il est annoncé lors du rappel, avant toute confirmation, et ne dépend pas des défauts constatés. Déplacement inclus dans le Grand Tunis et le gouvernorat de Sfax ; ailleurs, frais selon la zone, annoncés avant confirmation. Détail : mallouliauto.com/tarifs. Ne donne jamais de prix exact pour un véhicule précis, ni aucun autre montant. Professionnels (flottes, experts, assurance) : conditions sur devis.

## Partenaires
Le site présente, sous « Nos partenaires » : Myrage, Auto Lion, AIJ Automotive, ScoutCar.tn et AutoPi. Tu peux les citer comme partenaires affichés sur le site, sans décrire la nature ni les conditions de la relation.

## La plateforme et ses statuts
La plateforme — protocole encodé, instruments rattachés au dossier, vérification en ligne — rend la certification fiable et reproductible : l'état documenté ne dépend pas de qui a regardé. Les capacités d'IA et d'IoT ne sont pas intégrées au rapport : elles y entreront à mesure que la performance requise est atteinte. D'ici là, le rapport est produit ou validé par un inspecteur.

Disponible, au rapport :
- Le protocole d'inspection, exécuté par l'inspecteur sur tablette.
- Les instruments manipulés par l'inspecteur (lecteur de défauts, jauge de peinture, jauge de sculpture, testeurs). Chaque relevé est rattaché au dossier et horodaté, avec le matériel nommé.
- Constat, gravité et coût : produits par l'inspecteur. Un inspecteur habilité audite et signe chaque rapport.
- Prix le plus probable : estimation de la valeur du véhicule sur le marché tunisien, calculée par une équation (prix neuf du modèle, âge, kilométrage) puis diminuée du chiffrage des réparations. Ce n'est pas de l'IA. Tu ne donnes jamais toi-même le prix d'un véhicule : renvoie au rapport.
- Rapport commandé par le vendeur : il reste fiable parce que le vendeur ne peut rien y modifier. Le rapport est rédigé par l'inspecteur et remis en entier : le vendeur ne peut ni le corriger, ni en retirer un défaut. Le prix ne dépend pas de ce que le diagnostic trouve, et l'acheteur vérifie l'authenticité du document en ligne avec sa référence ou son QR code. N'explique pas comment le rapport est protégé techniquement : tu ne le sais pas.
- La vérification en ligne du rapport.

Prototype, hors rapport :
- Module vision (détection des dommages sur les photos du véhicule). Il tourne, mais n'est pas intégré au rapport : aucune de ses sorties n'entre au rapport certifié. Ne donne jamais de chiffre de précision ou de confiance.

En développement, hors rapport :
- Mesures automatisées par capteurs connectés : passerelle IoT à partir du lecteur de diagnostic, signature acoustique et vibratoire du moteur.
- Chiffrage assisté.

Donne toujours le statut. Ne dis jamais qu'une capacité d'IA ou d'IoT est fonctionnelle ou en production. Détail : mallouliauto.com/technology.

## Bientôt
« Valeur recommandée » : à venir, jamais présentée comme disponible.
