# Spec — Refonte de l'accueil, tarifs, partenaires

Statut : **validée le 16 oct. 2026, implémentée sur `claude/stoic-dirac-qqruff`**, sauf la section 10
du document de conception (voitures diagnostiquées), écartée par le fondateur pour cette livraison.

Document de conception (diagnostic, références, maquettes, décisions) :
https://claude.ai/artifact/Ko8pHRHVMGavgGzkUkw3b7

## 1. Objectif

L'accueil expliquait la méthode ; il répond maintenant à la question du visiteur : « pouvez-vous
m'éviter une mauvaise surprise en achetant ou en vendant une voiture d'occasion ? ». Une promesse,
trois publics, sept blocs, une action. Ce qui n'y répond pas a sa propre page.

Mesuré sur la version précédente (`develop @ 82e533d`) puis sur celle-ci, au même build local :

| | Avant | Après |
| --- | --- | --- |
| Écrans à faire défiler, bureau (1440 × 900) | 13,9 | 6,9 |
| Écrans à faire défiler, téléphone (390 × 844) | 23,6 | 10,1 |
| Mots dans `<main>` (bureau) | ~2 090 | ~840, dont ~150 dans l'exemple de rapport |
| Blocs (sections + bandeaux d'action) | 17 + sommaire à 8 onglets | 9, sans sommaire |

## 2. Décisions du fondateur (16 oct. 2026)

| Sujet | Décision |
| --- | --- |
| Titre | « Achetez ou vendez une voiture d'occasion, sans mauvaise surprise. » |
| Mot pour le client | « diagnostic » (« Demander un diagnostic ») ; « expertise avant achat » reste en sur-titre et en SEO ; l'URL `/demande-inspection` ne change pas |
| Rapport | Remis dès la fin du diagnostic, par e-mail, SMS ou WhatsApp ; le chiffrage est toujours terminé sur place |
| Présence | Le diagnostic se fait avec ou sans l'acheteur (« Avec ou sans vous ») |
| Paiement | Après le diagnostic |
| Tarifs | Thermique : citadine 250, berline · SUV 279, premium 350 ; hybride 300 ; électrique 370 (« Bientôt », en attendant l'équipement de contrôle de la batterie haute tension). TND TTC, prix uniques par énergie pour l'hybride et l'électrique |
| WhatsApp | Pas de numéro tunisien pour l'instant : le numéro +49 n'est plus jamais affiché, le bouton reste ; le téléphone +216 est le contact imprimé |
| Pages dédiées | `/professionnels` (showrooms, sur devis), `/devenir-partenaire` (recrutement des centres), `/partenaires` (fiches), `/inspection` (couverture complète) |
| Mentions retirées de l'accueil | « Nos inspecteurs ne vendent ni ne réparent… », « Aucune commission sur le prix de vente » ; moins de mots partout |
| Partenaires | Myrage et Auto Lion : concessionnaires de voitures neuves (option A de `docs/dataroom-corrections.md` §14). Centres partenaires (Myrage, Auto Lion, AIJ Automotive en Allemagne) : diagnostic par leur propre personnel formé, rapport à leur nom, réservation par leurs canaux, tarifs fixés par eux. ScoutCar.tn : plateforme. AutoPi : technologie. Aucun partenaire ne paie MALLOULIAUTO. Textes des fiches fournis par les partenaires. Un partenaire ne diagnostique jamais un véhicule qu'il vend lui-même |
| Fiches partenaires | Bouton « Réserver un diagnostic chez [nom] » ; pas de mention « réalisé par l'atelier… », pas de mention sur la réparation |

## 3. Ce qui a été construit

### Accueil (`src/pages/Home.jsx`)

1. `HeroCertification` — promesse, mini-formulaire marque/modèle (un seul bouton sous `sm`), téléphone,
   « Dès 250 TND TTC, payé après le diagnostic · Rapport immédiat · Avec ou sans vous », aperçu
   de la première page du rapport de démonstration (`ReportPreview`) et lien « Voir un exemple de
   rapport ».
2. `SurprisesGrid` (nouveau) — six signes repérés, chacun avec son instrument ; lien vers `/inspection`.
3. `ReportShowcase` — cinq repères (dont « Le prix le plus probable ») au lieu de six ; carte courte sur téléphone (`compact="mobile"`).
   Le bouton « Voir le rapport complet » mène à `/exemple-de-rapport`.
4. `AudienceDoors` (nouveau) — J'achète, Je vends (l'état de navigation `profil: vendeur` préremplit « Chez moi », pas un paramètre d'adresse), Showroom.
5. `CertificationFlow` — trois étapes réécrites.
6. `TrustBand` (nouveau) — 18 instruments, vérification d'un rapport (formulaire honnête : la
   vérification en ligne n'existe pas encore), vidéo de lancement. Ancre `#verifier`.
7. `PartnerLogos` — logos lus dans la table `partners`. Un logo n'apparaît que si « Logo sur
   l'accueil » est coché **et** si la fiche du partenaire est publiée (donc validée par lui, avec
   la date d'accord pour le logo). Aucune fiche publiée, ou base qui ne répond pas : le bandeau
   n'est pas affiché.
8. `FAQ` — cinq questions visibles, les autres derrière « Voir toutes les questions » (toutes dans
   le JSON-LD).
9. `InspectionCTA` final.

Sortis de l'accueil, non supprimés : `SectionNav`, `Services`, `TechnologyTrust` (inutilisés),
`CoverageChecklist` et `InspectionPurposes` (→ `/inspection`), `PartnerChannels` (→ `/devenir-partenaire`).

### En-tête, pied de page, actions

- En-tête : Comment ça marche · Tarifs · Professionnels · « Plus », puis « Vérifier un certificat »
  et « Demander un diagnostic ». « Plus » ouvre les autres pages en trois rubriques
  (`src/data/siteNav.js`) : **Le diagnostic** (Ce que couvre le diagnostic, Technologie, Guides),
  **Partenaires** (Nos partenaires, Devenir partenaire), **MALLOULIAUTO** (À propos, Carrières,
  Contact). Le menu mobile présente les mêmes liens et rubriques ; « Demander un diagnostic » y
  est porté par la barre de contact du bas d'écran. Le pied de page reprend les trois rubriques
  (« Le diagnostic » y ajoute les liens principaux et la FAQ).
- « Demander une inspection » devient « Demander un diagnostic » sur tout le site.

### Tarifs

`src/data/pricing.js` porte la grille (`PRICE_GRID`), seul endroit où un prix est écrit. `/tarifs`
l'affiche en cinq tuiles. Le chatbot (`PRICE_FACTS`) donne la grille ; le garde-fou des agents
(`containsNonPublicPrice`) accepte les montants de la grille et aucun autre.

### Partenaires

- Migration `20261016100000_partners.sql` : table `partners` (RLS admin), vue publique
  `partners_public` (logos de l'accueil et fiches publiées ; le texte d'une fiche non publiée n'est
  jamais public), bucket `partners` (PNG / WebP / JPEG, 1 Mo, pas de SVG), contrôles en base (format
  du téléphone, `https://`, publication impossible sans logo, présentation, service, moyen de
  réservation, date d'accord du logo et date de validation de la fiche), les cinq partenaires actuels
  en amorçage (logo coché pour l'accueil, fiches en brouillon : rien n'est public tant qu'une fiche
  n'est pas publiée).
- `/admin/partenaires` : liste (ordre, logo sur l'accueil, statut de fiche, accord logo, clics des
  30 derniers jours) et éditeur avec aperçu de la fiche ; archivage avec confirmation, jamais de
  suppression ; reconstruction du site comme pour les guides.
- `/partenaires` : fiches publiées, filtre par type, ancres `/partenaires#<identifiant>`.

### Mesure des clics

Migration `20261016100100_click_events.sql` et `POST /api/events` : clics sur les boutons de
demande, d'appel et WhatsApp (avec leur emplacement), et sur les fiches partenaires
(`partner_call`, `partner_link`). Mêmes règles que les visites : sans cookie, sans IP, rien sur
l'appareil, rien pour l'admin ni pour qui refuse le suivi ; purge à 13 mois avec les visites.
Mention ajoutée à la politique de confidentialité (§6).

## 4. Mise en production

1. Appliquer les deux migrations **avant** le déploiement. Sans elles, l'accueil n'affiche pas
   le bandeau, `/partenaires` affiche « Les partenaires ne peuvent pas être affichés pour le
   moment » et les clics ne sont pas enregistrés.
2. Déployer.
3. Dans `/admin/partenaires` : saisir pour chaque partenaire ses textes, son téléphone ou son site,
   la date de validation de sa fiche, puis publier : son logo apparaît alors sur l'accueil. Tant
   qu'aucune fiche n'est publiée, le bandeau est absent et `/partenaires` annonce « Nos premiers
   partenaires arrivent ». Renseigner l'accord de logo d'AutoPi (aucun n'est enregistré à ce
   jour) : sans lui, sa fiche ne peut pas être publiée.

## 5. Vérifications faites

- Les 23 migrations appliquées dans l'ordre sur un Postgres 16 local (schémas `auth` et `storage`
  simulés), deux fois de suite pour les deux nouvelles ; droits et contraintes testés : anonyme sans
  accès à `partners` ni à `click_events`, vue publique sans texte de brouillon, non-admin sans
  écriture, publication refusée sans validation, formats refusés, `updated_by` renseigné, compteurs
  de clics réservés à l'admin.
- `npm run lint`, `prettier --check`, `tsc -p api/tsconfig.json`, `npm run build` avec
  pré-rendu des 14 pages.
- Captures bureau et téléphone de l'accueil et des nouvelles pages (aucun débordement horizontal,
  aucune erreur de console), parcours de l'éditeur admin avec des données simulées.

Pas de tests automatisés : le dépôt n'a pas de cadre de test.

## 6. Reste à faire (hors de cette livraison)

- Section 10 (voitures diagnostiquées) : en attente du rendez-vous avec ScoutCar.tn.
- Séance photo réelle : remplacera l'image générée du hero et la photo de l'inspecteur (§9).
- Rapport de démonstration : refaire le diagnostic de démonstration dans l'application avec des
  données plus convaincantes, puis mettre à jour `src/data/sampleReport.js` (voir §7).
- Équipement électrique : retirer `available: false` de la ligne électrique de `PRICE_GRID`.
- Après publication des fiches : mettre à jour la règle « sans décrire la nature de la relation »
  des agents (`server/agents/shared/knowledge/company.md`) et `docs/dataroom-corrections.md` §14.
- Supprimer les composants d'accueil devenus inutilisés (`SectionNav`, `Services`, `TechnologyTrust`
  et l'ancien dossier `src/components/home/*.jsx`).

## 7. Exemple de rapport (`/exemple-de-rapport`, 17 oct. 2026)

Remplace le PDF d'exemple prévu. Page HTML construite à partir du rapport PDF du diagnostic de
démonstration du 11 oct. 2026 (certificat MA-2026-Z68HQ6), sur le véhicule du fondateur. Les
données sont dans `src/data/sampleReport.js`, source unique de la page et de l'aperçu de l'accueil
(`ReportPreview`) ; les 17 photos sont dans `public/images/sample-report/`.

**Ce que la page est, et dit** : un diagnostic de démonstration, pas le rapport d'un client (la
société est pré-commerciale ; règle du 22 sept. 2026 : jamais « certificat réel », jamais le nom
d'une personne identifiable). Décision du 17 oct. : la page porte la seule étiquette « Exemple de
rapport » (la mention longue « ce n'est pas le rapport d'un client » est retirée) ; la carte de
l'accueil n'a plus de mention (retirée le 17 oct.).

**Structure** : la page reproduit le rapport d'origine section par section et dans le même ordre
(`src/components/report/SampleReport.jsx`, styles `sample-report.css`, couleurs du rapport) :
en-tête avec certificat et QR, identité et tuiles, photo et familles, total, prix le plus probable, synthèse,
traçabilité, contexte, les 15 emplacements de photos, puis chaque famille (constats, « Rien à
signaler », « Non équipé », tableaux de cohérence kilométrique et de codes défaut), les quatre
tableaux de mesures, le détail du coût et la référence en pied. Un premier essai réorganisait le
rapport pour le web (synthèse d'abord, détails repliés) : écarté, car il ne reproduisait ni
l'ordre ni l'exhaustivité du rapport.

**Aperçu de l'accueil** : l'accueil montre la vraie première page du rapport, pas une miniature
dessinée à la main (elle ne ressemblait plus au rapport). `ReportPreview` assemble les mêmes
composants que la page (`ReportParts.jsx`), à leur largeur naturelle de 640 px, réduits à la
largeur du cadre par le CSS seul (`.rp-pv`, sans script) et coupés par un fondu : le héros va
jusqu'au prix le plus probable, la section « Votre rapport » jusqu'au début de la synthèse. Toute
la carte est un lien vers la page complète. La mise en page du rapport suit la largeur de la
feuille (requête de conteneur), pas celle de l'écran : l'aperçu garde la mise en page bureau sur
téléphone.

**Ajouts propres au web** (rien n'est retiré) : sommaire collant sous l'en-tête du site ; bouton
« Imprimer / PDF » (seul le rapport s'imprime, tous les replis ouverts) ; tableaux compacts sur
téléphone ; le tableau des 31 mesures de peinture replié par défaut (« Voir les 31 mesures »,
résumé en une ligne) ; l'icône roue (`src/assets/mallouliauto_wheel_icon.svg`) dans l'en-tête du
rapport et de la carte de l'accueil.

**Retraits et masques faits pour la rendre publiable** (rien n'est ajouté ni modifié) : VIN et
plaque masqués (seul l'indicatif constructeur reste) ; plaques floutées sur les photos, dont celle
d'un véhicule tiers ; nom, téléphone et e-mail du client affichés « Masqué », opérateur affiché
« Inspecteur MALLOULIAUTO » ; photos de la carte grise (un spécimen français), du carnet (image
d'illustration) et de la plaque VIN remplacées par « Masqué dans l'exemple » ; « Câble de charge »
et « Prise de charge », sans objet sur un diesel, retirés ; QR code décoratif (le vrai mène au
rapport en ligne, qui porte les coordonnées du client) ; « Vérifiable en ligne » conservé.

**À corriger dans le diagnostic de démonstration lui-même** (décision du 17 oct. : publié tel quel ;
`src/data/sampleReport.js` est le seul fichier à mettre à jour) :
- la peinture mesure exactement 120 µm sur les 31 éléments, ce qui ressemble à une valeur par
  défaut ;
- la synthèse parle de dommages « côté gauche » alors qu'un constat porte sur l'aile avant droite ;
- le constat « Planche de bord » est décrit par « Panneau de coffre, rayure légère » ;
- le code P2002 est classé « Modérée » dans le tableau et « Mineure » dans son libellé d'origine ;
- les deux relevés de pneus « avant » (6,5 et 7 mm) et les deux « arrière » n'ont pas de côté,
  et sont affichés tels quels.

**Mesure** : le visionnage de la page est compté comme les autres pages (visites sans cookie) ;
les clics vers la page ne sont pas comptés à part (pas de nouvel événement dans `click_events`).

## 8. « Prix le plus probable » (17 oct. 2026)

Le produit (ma-inspector, issue #317, décision du 5 oct. 2026) peut imprimer, juste sous le total
des réparations, une estimation de la valeur du véhicule. Décision du 17 oct. : on la met en avant
(clients et partenaires), sans en parler comme d'une option.

**Ce que c'est** (vérifié dans le code, `inspection-valuation.ts`, `equation.ts`) : une équation à
neuf coefficients (prix neuf du modèle, âge, kilométrage) × un indice de marché saisi à la main,
moins les réparations chiffrées, arrondie à 500 TND. **Pas de l'IA, pas de modèle de langage** : le
texte est entièrement modélisé. Erreur médiane d'environ 12 % sur un modèle jamais vu. Résultat
figé avec le rapport, dans son empreinte. Le bloc dit « Prix le plus probable », la fourchette des
« voitures comparables » et que l'estimation repose sur des prix d'annonces (la vente se fait
souvent 2 à 6 % plus bas).

**Sur le site** : le bloc figure dans l'exemple de rapport (sous le total, comme dans le produit) et
dans la carte de l'accueil ; un repère « Le prix le plus probable » dans la section du rapport ; la
réponse « Le rapport me dit-il si je dois acheter ? » le cite ; la page Professionnels le présente
comme un atout pour fixer son prix. Nulle part il n'est appelé « IA » : la spécification du rapport
proscrit « Analysé par notre intelligence artificielle ».

**Chiffres de l'exemple** (`VALUATION` dans `src/data/sampleReport.js`) : calculés avec la fonction
du produit pour le Tiguan de démonstration (équation v1, indice 1,0000, prix neuf 154 980 TND,
2023, 35 502 km, 910 TND de réparations, au 17 oct.) : 114 500 TND, entre 101 000 et 129 500. La
même fonction, sans réparations, redonne exactement l'aperçu de l'application du même jour
(115 500 ; 102 000 à 130 500). Le résultat varie avec la date : à remplacer quand le diagnostic de
démonstration est refinalisé avec l'estimation activée.

**Textes corrigés** : le guide « Notre protocole d'inspection » disait que le rapport ne donne pas
d'estimation du prix ; la base de connaissances des agents ne permettait pas d'en parler. La
migration `20261017100000_valuation_copy.sql` corrige le guide et les lignes `company`,
`value_prop_b2c` et `value_prop_dealer` (même mécanique que les migrations précédentes : les
modifications faites à la main dans l'admin sont conservées, rejouable sans effet). Le guide est
reconstruit dans le site au prochain déploiement.

**Points à connaître** : l'estimation n'existe que pour un inspecteur tunisien et un modèle du
catalogue avec un prix neuf fiable ; sinon le rapport imprime une ligne « Estimation de valeur
indisponible ». Les réparations sont déduites sans que le PDF le dise (décision du 5 oct.).
Le document de conception du produit décrit encore un ancien moteur par échantillon d'annonces ;
le code utilise désormais l'équation, sans durée de validité ni nombre minimal d'annonces.

## 9. Photo de l'inspecteur (17 oct. 2026)

Photo fournie par le fondateur : un inspecteur accroupi devant une voiture grise, tablette en main,
son véhicule d'intervention derrière. Elle ressemble à une image générée : aucune légende du type
« nos inspecteurs », aucune mention d'une personne réelle. À remplacer par la séance photo prévue.

**Placements retenus** (composant `src/components/InspectorPhoto.jsx`, deux tailles WebP de
800 et 1 600 px dans `public/images/process/`, `srcSet`, chargement différé) :

1. Accueil, section « Comment ça marche » : bandeau au-dessus des trois étapes (illustre l'étape 2).
2. `/professionnels` : à droite du titre, à partir de `lg` seulement (masquée sur téléphone pour
   garder le bandeau court ; `PageHero` accepte une prop `media`).

**Vérifié** (aperçu de production, Chromium) : bureau 1 440 px et téléphone 390 px, image chargée,
bonne taille choisie par `srcset`, pas de défilement horizontal, cadrage centré sur l'inspecteur.

**Image de partage (Open Graph)** : `public/images/og-share.jpg`, 1 200 × 630, 108 Ko (sous les
300 Ko conseillés par WhatsApp) : logo, « Le diagnostic complet, avec ou sans vous. » sur fond navy à
gauche, la photo à droite. Elle remplace la photo du hero comme image par défaut dans `SEO.jsx` et
`index.html` (avec largeur, hauteur et texte alternatif) ; les guides gardent leur propre image.
Vérifié dans le HTML pré-rendu de l'accueil, de `/professionnels` et de `/guides`. Pas vérifié :
l'aperçu réel dans WhatsApp / LinkedIn (domaine inaccessible d'ici) ; les réseaux gardent l'ancienne
image en cache : à rafraîchir avec le débogueur de partage de Facebook ou en changeant le nom du
fichier. L'image est à refaire avec la photo définitive.

## 10. Numéro de téléphone du hero (17 oct. 2026)

Le numéro n'était qu'un lien souligné dans une ligne de texte de 14 px. Il est maintenant un bouton à
contour (icône, numéro en police mono 18 px, cible de 48 px de haut) sous le formulaire, à côté du
lien « Voir un exemple de rapport ». Le bouton plein orange reste la seule action principale ; le
suivi `call_click` / `hero` est conservé. Vérifié à 1 440 px et 390 px (pas de défilement horizontal).

Ajout le même jour : un bouton « WhatsApp » à côté du téléphone (lien `wa.me` avec le message
prérempli de `contactChannels.js`, nouvel onglet, événement `whatsapp_click` / `hero`). Le bouton
affiche le mot et non le numéro : le numéro WhatsApp (+49…) diffère du numéro d'appel (+216…) et
afficher les deux prêterait à confusion. Les deux boutons tiennent sur une ligne dès 360 px de large.

## 11. Aperçu du rapport sur téléphone (17 oct. 2026)

Sur un téléphone, l'aperçu de l'accueil s'affichait agrandi et coupé : l'échelle était calculée en
CSS avec `tan(atan2(100cqw, 640px))`, que le navigateur du téléphone évaluait de travers. L'échelle
(largeur du cadre / 640 px) est maintenant calculée dans `ReportPreview.jsx` et passée au CSS dans
`--pv-scale`. Vérifié dans Chromium (390, 360, 768 et 1 440 px : échelle 0,56 ; 0,51 ; 0,81 ; 0,63,
page entière visible, pas de défilement horizontal). Pas vérifié dans Safari iOS, qui n'est pas
disponible ici : à contrôler sur le téléphone après le déploiement.

## 12. Tarifs détaillés et nommés (18 oct. 2026)

Demande du fondateur, à la manière d'Evalveo (formules nommées : EVAL VISIO 150, EXPERT 250, DOM 300,
VIP 350, PRO sur devis, chacune avec son contenu ; relevé par recherche, le site n'étant pas
joignable d'ici). Choix du fondateur : les noms se posent sur la grille existante, sans nouveau prix
ni nouveau service.

`/tarifs` : cinq cartes (`PRICE_GRID` dans `src/data/pricing.js`) : Diagnostic Citadine 250,
Berline & SUV 279, Premium 350, Hybride 300, Électrique 370 (« Bientôt »). Chaque carte donne le
nom, le prix, des exemples de modèles et le détail (131 points, 18 instruments, 30 à 60 min, rapport
et certificat aussitôt, déplacement inclus ; l'électrique ajoute le contrôle de la batterie haute
tension). Nouvelle question de la FAQ : « Dans quelle formule se trouve ma voiture ? ». Les offres
du JSON-LD portent les noms. `energy` et `category` sont conservés (agents, FAQ de l'accueil).

**À valider par le fondateur** : les modèles d'exemple sont une proposition (aucune source interne
ne définit « Citadine / Berline · SUV / Premium » pour le public) ; leur classement décide du prix
que le client attend. Les noms « Diagnostic … » sont modifiables dans `pricing.js`.

Ajout (18 oct. 2026) : une sixième carte pleine largeur, « Diagnostic Pro — Sur devis » (showrooms,
revendeurs, loueurs, gestionnaires de flotte), avec le détail repris de `/professionnels` et un bouton
« Demander un devis » vers `/contact?type=professionnel` (événement `cta_click` / `tarifs-pro`). Elle
vit dans `PRO_OFFER` (`pricing.js`), pas dans `PRICE_GRID` : elle n'a pas de montant et `PRICE_GRID`
alimente les prix publiés, le prix d'appel et le garde-fou des agents. Le bandeau « Professionnels »
du bas de page et la puce « sur devis » sont retirés : la carte les remplace.

## 13. Fiabilité d'un rapport commandé par le vendeur (18 oct. 2026)

Origine : une réponse de Grok sur MALLOULIAUTO reprenait l'ancien positionnement (outil B2B pour
marchands, « AI Vision », « 5 minutes », « 30 % de litiges en moins », pas de service pour les
particuliers) et objectait qu'un rapport produit côté vendeur ne remplace pas un expert indépendant.
Aucune de ces affirmations n'est sur le site aujourd'hui (vérifié dans les sources). L'objection est
réelle : réponse ajoutée, sur la base de ce que le fondateur a confirmé (le vendeur ne peut pas
modifier le rapport).

- FAQ de l'accueil : « Le rapport est-il fiable si c'est le vendeur qui le commande ? » devient une
  des cinq questions visibles ; « En quoi est-ce différent de la visite technique ? » passe derrière
  « Voir toutes les questions » (toujours sur la page et dans le JSON-LD).
- `/professionnels` : « … et vous ne pouvez pas le modifier ».
- Mots-clés meta : « inspection automobile IA » retiré (`index.html`).
- Description factuelle de l'entreprise, reprise par les assistants : bloc « En bref » en tête de
  « Notre histoire » (`/about`) et description de l'`Organization` du JSON-LD (prix lu dans
  `pricing.js`).

**Chatbot** : la ligne `company` de la base de connaissances reçoit la même réponse (migration
`20261018100000_seller_ordered_report.sql`, miroir `server/agents/shared/knowledge/company.md`). Même
mécanique que la migration du prix le plus probable : phrase ajoutée en place, modifications faites
à la main dans l'admin conservées (une notice est levée si la phrase d'origine a été réécrite),
rejouable sans effet. Testée sur un Postgres 16 jetable : ligne neuve, deuxième passage sans effet,
ligne modifiée à la main laissée telle quelle ; le contenu en base est identique au miroir. La
consigne interdit d'expliquer une protection technique du rapport, que nous ne décrivons pas.

**Zone** : le `Service` du JSON-LD de l'accueil annonce maintenant `areaServed: TN` seulement (il
disait aussi MA et DZ).

**À faire par le fondateur** : appliquer la migration (avec les trois précédentes), mettre à jour le
profil et les publications Instagram.
