# Dataroom — corrections à appliquer

**Date :** 22 septembre 2026 — **mis à jour le 25 septembre 2026**
**Objet :** divergences constatées entre la dataroom, le produit réellement implémenté et les décisions du fondateur, et corrections décidées.
**Mode d'application :** ce mémo est une liste de changements à appliquer à la main dans Word. Aucun fichier de `Z:\MALLOULIAUTO\dataroom` n'a été modifié — les documents sont formatés et destinés aux investisseurs, une conversion automatique détruirait leur mise en page.

**Mise à jour du 25 septembre.** Deux changements depuis la première version :

1. La dataroom a été retravaillée entre-temps (plan 2026-2031, archives `_archive\2026-09-23` et `_archive\2026-09-24-plan-2026-2031`). Les corrections 1 à 5 ont été revérifiées contre les documents actuels : leur statut figure dans le tableau ci-dessous et en tête de chaque section.
2. Le fondateur a tranché le 24 septembre la séparation MALLOULIAUTO / MALLOULINOVA et la remise en ligne de la page Technologie du site. Ces décisions contredisent plusieurs formulations actuelles de la dataroom : corrections 7 à 14.

Relecture faite le 25 sept. 2026 sur les `.docx` actuels (conversion texte par `pandoc`, lecture seule). Les deux `.pptx` (BMC, Pitch Deck) n'ont pas pu être relus ainsi : à vérifier à la main pour les mêmes points.

## Principe retenu

Trois sources, trois autorités :

| Source | Fait foi sur |
| --- | --- |
| Dataroom (`Z:\MALLOULIAUTO\dataroom`) | Positionnement, gouvernance, ce qui peut être affirmé publiquement |
| Dépôt produit (`C:\Work\malloulinova\mallouliauto`, `apps/packages/certification/src`) | Faits produit : taxonomie, compteurs, vocabulaires, capacités |
| Dépôt site (`homepage-mallouliauto`) | Rendu et rédaction du site — recopie les faits, n'en invente aucun |

**Sur un fait produit, le produit fait foi.** **Sur le positionnement, la dataroom fait foi — sauf décision explicite et datée du fondateur, qui doit alors y être reportée**, ce qui est l'objet des corrections 7 à 14.

## Tableau de suivi

| # | Correction | Statut au 25 sept. |
| --- | --- | --- |
| 1 | Score de santé global | **Révisée par le fondateur** — conservé comme indicateur prévu, non produit au lancement |
| 2 | Périmètres d'inspection | **Appliquée** |
| 3 | Objet de l'inspection | **Appliquée** |
| 4 | Taxonomie d'annotation | **Appliquée** |
| 5 | Tarification partenaires | **Appliquée**, sur un modèle de canaux différent de celui décrit |
| 6 | Points restants | Toujours ouverts ; le point concessionnaire devient une contradiction active → **correction 14** |
| 7 | Positionnement : certificateur indépendant, plateforme propre | **À appliquer** |
| 8 | Statut de l'IA : deux axes, prototype de vision | **À appliquer** — prioritaire |
| 9 | Discours public : page Technologie, sorties de module | **À appliquer** |
| 10 | Chiffrage automatisé : pas de modèle de langage | **À appliquer** |
| 11 | Accès API au module de vision | **À appliquer** — dépend de 12 |
| 12 | Propriété de la technologie : contrat avec MALLOULINOVA | **À produire** — prioritaire |
| 13 | Matériel connecté : nom du boîtier | Pour information |
| 14 | Concessionnaires partenaires habilités | **Décision requise** |

**Ordre d'application recommandé :** 12 et 8 d'abord (ce sont eux que la page Technologie du site suppose déjà), puis 7, 9, 10, 14, et 11 en dernier.

---

# Partie I — Corrections du 22 septembre

## 1. Le score de santé global

> **Statut au 25 sept. : révisée.** Le fondateur a gardé le score comme indicateur **prévu, non produit au lancement** : `Rapport_Inspection_Gabarit` et `Exemple` le portent avec la mention « Prévu — non produit au lancement », la `Specification_Rapport_Inspection` le rattache aux critères de bascule de sa section 8, et §7 ne propose la formulation « score de santé X sur 100 » qu'« une fois l'indicateur en production (prévu) ». C'est cohérent avec la décision du 24 sept. (correction 9) : un score global existe aujourd'hui comme **sortie du module de vision**, hors rapport, et pourra entrer au rapport s'il passe les critères de bascule. **Aucune action.** Le texte ci-dessous est conservé pour mémoire.

Le produit refuse délibérément de produire une note globale : `apps/packages/certification/src/synthese.ts` porte le commentaire « deliberately no grade, no valuation », et `schema.ts` précise que les agrégats sont « dérivés à l'affichage … jamais stockés ». Aucune note sur 100 n'existe ni n'est calculée.

C'est cohérent avec le reste du positionnement : une note unique de 0 à 100 ramène des constats mesurés à une opinion, exactement ce que la Proposition de valeur §3 refuse par ailleurs (pas de taux de confiance chiffré, pas de recommandation d'achat).

### 1.1 `02-produit\MALLOULIAUTO_Rapport_Inspection_Gabarit.docx`

- **Supprimer la sous-section « 6.1 Score de santé global »** en entier, y compris la ligne de tableau « Score de santé global — [valeur] / 100 — Calculé, pondération documentée en annexe, à réviser sur données réelles ».
- **Renuméroter** : 6.2 Gravité des défauts identifiés → **6.1**, 6.3 Coût de réparation estimé → **6.2**, 6.4 Conséquence de prix → **6.3**, 6.5 Résumé en langage naturel → **6.4**.
- Vérifier le sommaire (section « Sommaire » en tête de document), qui reprend ces numéros.

### 1.2 `02-produit\MALLOULIAUTO_Rapport_Inspection_Exemple.docx`

- Même suppression : la sous-section « 6.1 Score de santé global » et sa valeur d'exemple **« 78 / 100 »**.
- Même renumérotation.

### 1.3 `02-produit\MALLOULIAUTO_Specification_Rapport_Inspection.docx`

Deux endroits :

- **Tableau des champs calculés** : supprimer la ligne « Score de santé global — CALCULÉ — pondération documentée — Pondération à réviser sur données réelles ».
- **§7 « Formulations proscrites »** : la ligne qui proscrit « Le véhicule est en bon état » propose aujourd'hui comme formulation de remplacement « Score de santé X sur 100, selon la pondération documentée en annexe ». Cette formulation disparaît avec le score. La remplacer par :

  > « *n* constats relevés, dont *n* de gravité majeure ou critique. Total estimé des réparations : *X* TND. »

  C'est la conséquence de prix chiffrée, déjà prévue en §6.4 du gabarit — factuelle, vérifiable, et elle ne porte aucun jugement d'ensemble.

---

## 2. Les périmètres d'inspection — à remplacer

> **Statut au 25 sept. : appliquée.** Le gabarit §1.2 porte les sept périmètres ; `Strategie_de_Reference` §5 est réécrite sur les cinq familles et les sept périmètres, en conservant la distinction entre champ déjà couvert et écart défensif.

Le gabarit §1.2 propose trois cases : **« [ ] Extérieur seul [ ] Mécanique seul [ ] Complet »**. Le produit n'implémente pas ce découpage. Il expose **sept** périmètres (`PACKS` / `PACK_LABELS`, taxonomy.ts), dont les libellés reprennent les noms de familles :

| Périmètre | Libellé produit |
| --- | --- |
| `diagnostic` | Diagnostic électronique |
| `liquides` | Niveaux, liquides et batterie |
| `carrosserie` | Enveloppe extérieure |
| `mecanique` | Motopropulseur |
| `confortSecurite` | Confort et sécurité |
| `complet` | Complet |
| `personnalise` | Personnalisé |

**À appliquer dans** `Rapport_Inspection_Gabarit.docx` §1.2 et `Rapport_Inspection_Exemple.docx` : remplacer les trois cases par ces sept, en conservant la forme à cocher.

**Également dans** `MALLOULIAUTO_Strategie_de_Reference.docx` **§5 « Deux classes d'inspection »** : le tableau oppose une classe « Extérieur » et une classe « Mécanique ». Ce modèle à deux classes est plus grossier que le produit. Le réécrire sur les cinq familles réelles, en conservant la distinction utile du §5 (ce qui est déjà couvert par des offres existantes vs ce qui constitue l'écart défensif) — celle-ci reste vraie, elle porte simplement sur des familles et non sur deux classes.

---

## 3. L'objet de l'inspection — à ajouter

> **Statut au 25 sept. : appliquée.** Le gabarit porte le champ ; la Proposition de valeur décrit les objets d'inspection, y compris la maintenance préventive comme « objet d'inspection de plein droit ».

Le produit enregistre sur chaque rapport un **objet d'inspection** (`INSPECTION_PURPOSE_LABELS`, `schema.ts`). La dataroom ne le documente nulle part, alors que c'est l'articulation la plus nette des cas d'usage — et la seule segmentation que le produit connaisse réellement : un rapport unique, dont l'objet change.

| Valeur produit | Libellé |
| --- | --- |
| `purchase_sale` | Achat / Vente |
| `before_repair` | Avant réparation |
| `after_repair` | Après réparation |
| `preventive` | Préventive |
| `technical_inspection_visit` | Visite technique |
| `post_accident_expertise` | Après accident / Expertise |
| `other` | Autre (champ libre) |

**À ajouter :**
- `Rapport_Inspection_Gabarit.docx` **§1.2 « Le contexte de l'inspection »** : un champ « Objet de l'inspection » avec ces sept valeurs. Le gabarit documente déjà `lieu`, `opérateur`, `niveau de démontage` — l'objet manque, alors qu'il est enregistré et affiché dans la traçabilité.
- `MALLOULIAUTO_Proposition_de_Valeur.docx` : ces objets couvrent les cas d'usage que le document décrit segment par segment, **y compris la maintenance préventive**, qui n'apparaît aujourd'hui que dans une puce du Business Model Canvas (« Maintenance préventive & réduction du risque de pannes ») sans protocole, sans tarif et sans section de rapport. Le produit, lui, la gère comme un objet d'inspection de plein droit. À écrire comme tel.

---

## 4. La taxonomie d'annotation — à resynchroniser

> **Statut au 25 sept. : appliquée.** `Taxonomie_Annotation` énonce « 5 familles, 128 éléments, 20 natures de dommage … Implémenté dans la plateforme », et les nouvelles natures y figurent.

`02-produit\MALLOULIAUTO_Taxonomie_Annotation.docx` décrit un référentiel **limité aux dommages extérieurs**. Le produit l'a étendu à l'ensemble de l'inspection. Le modèle à trois axes (où / quoi / combien) reste juste — seuls les périmètres et les compteurs ont changé.

| Élément | Document actuel | Produit (vérifié) |
| --- | --- | --- |
| Portée | « Référentiel de constatation des dommages **extérieurs** » | Les 5 familles d'inspection |
| Axe 1 — Localisation | « **Trente-cinq** zones extérieures » | **128** éléments répartis sur 5 familles, dont **47** pour Enveloppe extérieure |
| Axe 2 — Nature du dommage | **12** codes : RAY ENF ENR FIS ECL BRV OPT COR MAN AJU PEI USU | **20** codes |
| Axe 3 — Étendue et profondeur | inchangé | inchangé |

**Les 8 natures à ajouter** (elles correspondent à l'extension hors carrosserie) :

| Code | Libellé |
| --- | --- |
| CAS | Pièce cassée / en mauvais état |
| DEC | Déchirure |
| SAL | Salissure |
| FUI | Fuite |
| JEU | Jeu mécanique |
| BRU | Bruit anormal |
| VOY | Voyant allumé |
| CAB | Câblage endommagé |

Corriger aussi la phrase d'introduction de l'axe 1 (« Trente-cinq zones extérieures, désignées selon le vocabulaire du devis de réparation ») : la désignation par schéma de véhicule reste vraie pour la carrosserie, mais le référentiel couvre désormais aussi le motopropulseur, les liquides, le diagnostic électronique et le confort/sécurité.

---

## 5. La tarification marque blanche — commission uniforme de 20 %

> **Statut au 25 sept. : appliquée, sur un modèle de canaux différent.** Le plan 2026-2031 a revu les segments (particulier, loueurs et gestionnaires de flotte, expert automobile, expert d'assurance) et scindé les canaux : le **partenaire marque blanche** (expert automobile, puis MENA) paie la commission uniforme de 20 % (40 TND par acte en Tunisie) ; les loueurs, gestionnaires de flotte et experts d'assurance sont des **comptes à volume**, au prix de gros de 10 TND par rapport (15 TND pour un sinistre complexe / VEI). `Strategie_de_Reference` §7, `Proposition_de_Valeur`, `Regles_Partenariat_Habilite` et la `Checklist_Due_Diligence` sont alignés sur ce modèle. **Aucune action.** Le texte ci-dessous, qui supposait trois partenaires marque blanche, est conservé pour mémoire.

**Décision : la commission uniforme est la bonne.** Le frais de plateforme fixe est la version périmée.

La dataroom se contredit aujourd'hui, et sa propre checklist de due diligence le signale (« à revalider contre le modèle de frais de plateforme fixe »).

### Documents **déjà corrects** — ne pas y toucher

`MALLOULIAUTO_Business_Plan.docx`, `MALLOULIAUTO_Resume_Executif.docx`, `04-modele-economique\...BMC.pptx`, `01-analyse-marche\MALLOULIAUTO_Dimensionnement_Marche.docx` : tous énoncent déjà la commission uniforme de 20 % du prix moyen du rapport (200 TND), soit **40 TND par acte**.

### Documents **à corriger**

**a) `MALLOULIAUTO_Proposition_de_Valeur.docx`** — trois sous-titres en italique :

| Section | Actuel | Corrigé |
| --- | --- | --- |
| §2.2 Le professionnel | « — 10 TND par rapport. » | « — commission de 20 %, soit 40 TND par rapport. » |
| §2.3 L'expert automobile | « — 20 TND par rapport. » | « — commission de 20 %, soit 40 TND par rapport. » |
| §2.4 L'expert d'assurance | « — 10 TND par dossier (standard et complexe/VEI, même tarif…) » | « — commission de 20 %, soit 40 TND par dossier (standard et complexe/VEI, même tarif). » |

Le tarif direct du particulier (**250 TND**) est inchangé et correct.

**b) `03-operations\MALLOULIAUTO_Regles_Partenariat_Habilite.docx`** — ligne « Tarification » du tableau d'en-tête. Remplacer :

> « MALLOULIAUTO perçoit uniquement un frais de plateforme fixe par rapport, indépendant du volume : 10 TND (professionnel), 20 TND (expert automobile), 10 TND (expert d'assurance). Il n'y a pas de partage de revenu »

par :

> « MALLOULIAUTO perçoit une commission uniforme de 20 % du prix moyen du rapport (200 TND), soit 40 TND par acte, quelle que soit la catégorie de partenaire et que le dossier soit standard ou complexe/VEI. »

**c) `MALLOULIAUTO_Strategie_de_Reference.docx`** — tableau des canaux (§6) : la colonne « Frais… » des trois lignes marque blanche (professionnel, expert automobile, expert d'assurance) doit énoncer la commission uniforme de 20 % (40 TND), et non un frais fixe.

**Une fois ces trois documents corrigés**, le point ouvert correspondant peut être clos dans `05-investisseur\MALLOULIAUTO_Checklist_Due_Diligence.docx`.

---

## 6. Points restants — pour information

> **Statut au 25 sept.** Les deux premiers points restent ouverts : la `Checklist_Due_Diligence` porte la police d'assurance « Manquant », et la `Strategie_de_Reference` §10 point 3 la validation juridique de l'architecture de responsabilité. Le troisième point est devenu une contradiction active : voir **correction 14**.

- **Assurance de responsabilité professionnelle** : toujours non souscrite (`Resume_Executif` §12, `Registre_des_Risques` S2). À finaliser avant la première inspection commercialisée — c'est aussi une condition d'habilitation exigée des partenaires (§3 condition 6), ce qui serait difficile à tenir sans l'avoir soi-même.
- **Architecture de responsabilité partenaire** non validée juridiquement (`Registre_des_Risques` R3, réserve rappelée en tête des Règles du partenariat).
- **Un concessionnaire ne peut pas être partenaire habilité** : `Regles_Partenariat` §3 condition 7 exclut « aucune activité de négoce de véhicules d'occasion pour compte propre ». Le concessionnaire qui veut certifier son stock est donc client d'un expert habilité, jamais opérateur habilité lui-même. À garder en tête pour tout support commercial qui viserait les concessionnaires.

---

# Partie II — Corrections du 25 septembre

Décisions du fondateur du 24 septembre 2026 :

- **MALLOULIAUTO** est un certificateur indépendant de véhicules d'occasion, qui développe sa propre plateforme d'inspection automatisée — IA, vision par ordinateur et IoT.
- **MALLOULINOVA** est une société technologique spécialisée en IA et IoT, qui propose une solution d'inspection industrielle automatisée. Son site ne mentionne plus MALLOULIAUTO.
- Le **rapport certifié fait foi**. Les modules technologiques peuvent présenter davantage que le rapport (score global, indice de confiance, gravité, recommandation), comme **sorties de module**, hors rapport.
- Le module de vision par ordinateur **existe à l'état de prototype qui fonctionne, non intégré** à l'outil de l'inspecteur. La gravité et le chiffrage sont **manuels aujourd'hui, automatisés plus tard**, une fois le jeu de données et l'IA constitués.
- L'**accès API** au module de vision est conservé, comme accès pilote.

Ces décisions sont déjà en ligne côté site (voir « Répercussion côté site »). La dataroom doit les porter, sinon le site et les documents investisseurs se contredisent.

## 7. Positionnement — certificateur indépendant, plateforme propre

**a) `MALLOULIAUTO_Strategie_de_Reference.docx` §1.** Remplacer le début de la première phrase :

> « MALLOULIAUTO est un certificateur d'état de véhicules d'occasion, adossé à une technologie propriétaire, qui exerce en direct … »

par :

> « MALLOULIAUTO est un certificateur indépendant de l'état des véhicules d'occasion, qui développe sa propre plateforme d'inspection automatisée — vision par ordinateur, IA et IoT — et exerce en direct … »

La suite de la phrase est inchangée.

**b) `Strategie_de_Reference.docx` §3 — ajouter une règle 7 :**

> « 7 — « Certificateur indépendant » désigne un tiers qui ne vend ni ne répare le véhicule qu'il contrôle. Ce n'est pas un organisme accrédité : aucune formulation ne suggère une accréditation (« organisme de certification accrédité », norme d'accréditation) tant qu'elle n'est pas obtenue. »

**c) `Resume_Executif.docx`, `Business_Plan.docx`, `Memorandum_Investissement.docx` — phrase d'ouverture.** Tous trois ouvrent sur :

> « MALLOULIAUTO Inspector est une plateforme SaaS qui digitalise et automatise l'inspection de véhicules d'occasion … »

Cette phrase présente la société comme un éditeur de logiciel, ce que la Stratégie de référence §1 et §8 écartent explicitement (« On passe de certificateur à fournisseur de plateforme sans difficulté ; l'inverse reviendrait à concurrencer ses propres partenaires »). Remplacer par :

> « MALLOULIAUTO, certificateur indépendant de véhicules d'occasion, développe sa propre plateforme d'inspection automatisée, MALLOULIAUTO Inspector, en Tunisie puis dans les marchés MENA. Elle combine … »

**d) Même paragraphe du `Resume_Executif`** : « la plateforme permet … de détecter et localiser automatiquement les dommages … d'en classer la sévérité, de recommander une réparation … » est au présent, alors que la règle 3 interdit de présenter ces capacités comme en production. Remplacer « permet » par « est conçue pour ». L'encadré « Où en est la technologie » qui suit reste juste.

**Nommage — à trancher, non corrigé ici.** La dataroom nomme la plateforme « MALLOULIAUTO Inspector » ; l'outil terrain des inspecteurs, dans le produit et sur le site, s'appelle « MA-Inspector ». Choisir si ce sont deux noms (plateforme / outil terrain) ou un seul, puis l'écrire une fois dans la Stratégie de référence.

## 8. Statut de l'IA — deux axes, et le prototype de vision

C'est la correction dont dépend la page Technologie du site.

**a) `Strategie_de_Reference.docx` §3, règle 3.** Texte actuel :

> « L'intelligence artificielle et l'IoT ne sont jamais présentés comme fonctionnels ou en production : ils sont en cours de développement, vérifiables dès aujourd'hui, et passeront en production à mesure que la performance requise est atteinte »

Un prototype qui fonctionne est, littéralement, fonctionnel : la règle actuelle interdit de dire ce qui est vrai. La remplacer par :

> « L'intelligence artificielle et l'IoT ne sont jamais présentés comme intégrés au rapport certifié ni comme en production. Chaque capacité porte deux statuts : sa maturité (disponible, prototype, en développement) et son intégration au rapport (au rapport, hors rapport). Le module de vision par ordinateur existe à l'état de prototype, testé hors rapport. Le rapport reste produit par un opérateur jusqu'à la bascule de chaque champ, selon les critères de la Spécification du rapport d'inspection, section 8. »

**b) `Strategie_de_Reference.docx` §6, tableau des couches.** Ligne « Vision par ordinateur — En construction, assistée par un opérateur — Annotation humaine tant que la performance requise n'est pas atteinte ». Remplacer le statut par :

> « Prototype, testé hors rapport »

et la justification par :

> « Au rapport, l'annotation reste humaine tant que les critères de bascule (Spécification du rapport, §8) ne sont pas atteints »

**c) `MALLOULIAUTO_Proposition_de_Valeur.docx`, colonnes de statut.** Pour les lignes portées par le module de vision, remplacer « En développement » par « Prototype (hors rapport) » :

| Segment | Ligne |
| --- | --- |
| §2.1 Particulier | « Détection et localisation des dommages assistées par vision par ordinateur » |
| §2.1 Particulier | « Recommandation réparation/remplacement avec chiffrage des pièces et de la main d'œuvre » |
| §2.2 Loueurs et gestionnaires de flotte | « Détection des dommages assistée par vision par ordinateur » |
| §2.3 Expert automobile | « Détection des dommages assistée par vision par ordinateur, avec validation par un opérateur… » |
| §2.4 Expert d'assurance | « Détection, localisation et classification de sévérité par vision par ordinateur » |
| §2.4 Expert d'assurance | « Recommandation réparation/remplacement avec chiffrage des pièces et de la main d'œuvre » |

Les lignes « Mesures et diagnostics automatisés via capteurs connectés » **restent « En développement »**.

Pour les deux lignes « chiffrage » : le prototype produit une estimation de coût et une action réparer/remplacer ; le chiffrage adossé à un référentiel de prix documenté, lui, reste en développement. Si la cellule ne peut porter qu'un statut, garder « Prototype (hors rapport) » et ajouter cette précision en note.

**d) Encadrés « Où en est la technologie aujourd'hui »** (`Proposition_de_Valeur`, `Resume_Executif`, `Memorandum_Investissement`). Ajouter une phrase à chacun :

> « Le module de vision par ordinateur existe déjà à l'état de prototype, testé en dehors du rapport. »

**e) « Sans technologie » en 2026.** Deux documents écrivent que 2026 est consacré à « l'exploitation directe, sans technologie » : `Resume_Executif` §7 et `Strategie_de_Reference` §8, phase 0. Le `Resume_Executif` §7 ajoute que « la plateforme et le protocole d'inspection sont en cours de construction ».

Ces formulations contredisent :

- la Stratégie de référence §6 : acquisition « Possédée », rapport et certificat « Possédé » ;
- la Proposition de valeur : protocole et rapport « disponibles dès le lancement » ;
- la Taxonomie : « Implémenté dans la plateforme » ;
- le produit lui-même : l'outil terrain MA-Inspector existe, sa capture figure sur le site.

Remplacer :

- « sans technologie » par « sans IA ni IoT en production » ;
- et, dans le `Resume_Executif` §7, « La plateforme et le protocole d'inspection sont en cours de construction » par « Le protocole d'inspection et l'outil terrain sont construits ; les modules d'IA et d'IoT sont en développement, la vision par ordinateur à l'état de prototype ».

## 9. Discours public — page Technologie et sorties de module

**a) `Strategie_de_Reference.docx` §2.** La règle « Ne pas vendre l'intelligence artificielle — vendre le rapport et ce qu'il permet de décider » reste vraie pour le rapport et pour les pages commerciales. Ajouter à la suite :

> « Exception encadrée : la page Technologie du site présente la plateforme que MALLOULIAUTO développe, capacité par capacité, avec ses deux statuts (règle 3). Elle ne vend pas l'IA comme un produit, n'attribue jamais un constat du rapport à l'IA, et sépare visuellement les sorties d'un module — score global, indice de confiance — du rapport certifié. »

**b) `Specification_Rapport_Inspection.docx` §7.** La ligne « Confiance 96 % → Aucune mention, tant que la valeur n'est pas calibrée et documentable » vaut pour le rapport. Ajouter sous le tableau :

> « Ces formulations valent pour le rapport. Sur la page Technologie, une sortie de module peut afficher son propre indice de confiance à titre d'exemple, étiquetée « sortie du module — ne figure pas sur le rapport certifié ». Aucune précision de modèle chiffrée n'est publiée tant que les conditions 2 à 4 de la section 8 ne sont pas remplies. »

**c) `Specification_Rapport_Inspection.docx` §8** — aucune modification. Ses six critères de bascule sont la règle que suit le site : aucune capacité ne passe « Au rapport » sans eux.

## 10. Chiffrage automatisé — pas de modèle de langage

`Resume_Executif` §6 écrit : « vision par ordinateur, **modèles de langage pour le chiffrage automatisé**, capteurs IoT ».

La `Specification_Rapport_Inspection` §6 proscrit précisément qu'une IA générative produise un coût de réparation : « Un modèle de langage produira un coût de réparation confiant et sans fondement. Sur un document opposable, c'est indéfendable. » Les deux documents se contredisent, et c'est la Spécification qui a raison.

Remplacer, dans le `Resume_Executif` §6 :

> « modèles de langage pour le chiffrage automatisé »

par :

> « chiffrage automatisé adossé à une base de prix de pièces et de main-d'œuvre documentée »

Le chiffrage automatisé que le fondateur prévoit à terme relève des critères de bascule (§8 de la Spécification), pas d'un modèle de langage. La section 6 reste inchangée : l'IA générative rédige, elle ne chiffre pas.

## 11. Accès API au module de vision

> **Dépend de la correction 12.** Côté site, la section API est volontairement retenue tant que le contrat de propriété n'est pas produit.

`Resume_Executif` §6 écrit que MALLOULIAUTO « ne la vend pas [la technologie] comme un outil ou une API autonome ». La décision du 24 sept. conserve un accès API pilote au module de vision. Deux options :

- **Option A — reporter l'API** : laisser le texte en l'état, et ne pas proposer d'API avant la phase 4 (bascule technologique).
- **Option B — l'assumer** (décision actuelle du fondateur) :
  - `Resume_Executif` §6 : remplacer « mais ne la vend pas comme un outil ou une API autonome » par « et en ouvre l'accès, à titre pilote, par une API au module de vision — dont la sortie n'est pas un rapport certifié ».
  - `Strategie_de_Reference` §7, tableau des canaux — ajouter une ligne :

    | Canal | Marque du rapport | Qui répond du contenu | Tarification |
    | --- | --- | --- | --- |
    | Accès API au module de vision (pilote) | Aucune — le client reçoit une sortie de module, pas un rapport | Le client | À définir ; aucun tarif publié pendant le pilote |

**Question ouverte, à trancher avant tout client API.** La Stratégie de référence §8 note que devenir fournisseur de plateforme reviendrait, dans un sens, à concurrencer ses propres partenaires. Un client API qui produit lui-même des rapports d'inspection est un concurrent direct du partenaire marque blanche. Définir quels clients API sont admis : par exemple les plateformes et assureurs qui ne produisent pas de rapport d'inspection avant achat. L'écrire dans la Stratégie §7.

## 12. Propriété de la technologie — produire le contrat avec MALLOULINOVA

Le principe est posé partout : `Strategie_de_Reference` §3 règle 5, `Business_Plan`, `Resume_Executif`, `Checklist_Due_Diligence` §3 — « toute la technologie développée pour la plateforme, quel que soit le développeur, appartient à MALLOULIAUTO SARL ». La Checklist porte le « Contrat écrit formalisant cette propriété » à **« En cours »**.

Ce contrat devient urgent, pour trois raisons :

1. Le `Business_Plan`, le `Resume_Executif` et le `Memorandum` attribuent le « développement de la plateforme » à **MALLOULINOVA**.
2. Le prototype de vision tourne sur la plateforme d'IA de MALLOULINOVA, conçue pour plusieurs clients : sa capture d'écran, publiée sur le site de MALLOULIAUTO, montre un espace « Car Tenant ».
3. Depuis le 24 sept., MALLOULINOVA vend sa propre solution d'inspection industrielle, bâtie sur le même socle.

En l'état, la règle 5 et le produit industriel de MALLOULINOVA ne peuvent pas être vrais en même temps sans contrat. Le contrat doit distinguer :

- **ce qui appartient à MALLOULIAUTO** : modèles et données automobiles, taxonomie, corpus, outil terrain MA-Inspector, et tout ce qui est développé pour la plateforme automobile ;
- **le socle commun éventuel** que MALLOULINOVA conserve pour son usage industriel, avec la licence correspondante, dans un sens ou dans l'autre.

**Préalable à** : la publication de l'offre API côté site (correction 11) et la levée d'amorçage. Une fois produit, passer la ligne de la Checklist §3 à « Disponible ».

## 13. Matériel connecté — nom du boîtier (pour information)

Le `Business_Plan` et le `Memorandum` nomment le kit connecté « **passerelle AutoPi** ». L'ancienne page Technologie du site le présentait comme « AutoDongle OBD-II — Plug & Play · Bluetooth/4G · GPS intégré ». Ni ce nom ni ces caractéristiques ne figurent dans la dataroom. La nouvelle page ne les reprend pas : elle montre le boîtier comme « visualisation de concept » et décrit sa seule fonction.

**Aucune action dans la dataroom.** Si un nom commercial doit être donné au kit, le fixer d'abord dans la Stratégie de référence, puis sur le site.

## 14. Concessionnaires partenaires — contradiction active

Le point 3 de la section 6 était donné pour information. Il est désormais contredit par un document investisseur.

`Resume_Executif` §7 présente **Myrage** et **Auto Lion** comme « partenaire du réseau : rapport d'inspection sous sa marque (reprises et véhicules d'occasion) ». Tous deux sont concessionnaires. Or `Regles_Partenariat_Habilite` §3 condition 7 exige « aucune activité de négoce de véhicules d'occasion pour compte propre », sous peine de « retrait immédiat ». Des reprises revendues sont un négoce pour compte propre.

**Décision requise, deux options :**

- **Option A — requalifier ces partenaires.** Dans le `Resume_Executif`, les présenter comme **comptes à volume** ou comme clients d'un expert habilité, et non comme partenaires marque blanche. La condition 7 reste intacte : c'est l'option la plus sûre pour l'indépendance du certificat.
- **Option B — assouplir la condition 7.** Par exemple : habilitation possible pour des véhicules de tiers, jamais pour le stock propre du partenaire. Plus risqué : le certificat d'un vendeur sur son propre stock est précisément ce qu'un certificateur indépendant doit exclure.

Au passage : ces deux lignes du `Resume_Executif` rattachent Myrage et Auto Lion à un segment « Professionnel » que la Proposition de valeur ne connaît plus (ses quatre segments sont particulier, loueurs et flottes, expert automobile, expert d'assurance). À aligner dans le même mouvement.

La même décision s'applique à la mention de ces partenaires sur le site (section « Nos partenaires »), qui doit rester neutre sur leur rôle tant qu'elle n'est pas prise.

---

## Répercussion côté site

**Déjà en ligne sur les branches du site :**

- **Corrections 1 à 5** — appliquées sur la page d'accueil (commit `1f5a707`) : plus de note globale au rapport, périmètres réels, objets d'inspection comme grille de lecture, aucun tarif partenaire publié. Les faits produit sont centralisés dans `src/data/inspectionFacts.js`.
- **Décisions du 24 sept.**, commit `6f7a97c` de `homepage-mallouliauto` :
  - page `/technology` et statuts sur deux axes (`src/data/platformCapabilities.js`) ;
  - sortie du module de vision présentée hors rapport ;
  - « certificateur indépendant » ;
  - suppression des pages pré-pivot `/solutions/*` et `/partners`.
- **Côté MALLOULINOVA**, commit `d02bd06` du dépôt `homepage` : suppression de tout contenu automobile et de toute mention de MALLOULIAUTO.

**Ce que le site suppose et qui attend la dataroom :**

- **Correction 8** : le site emploie déjà « Prototype · Hors rapport ». `docs/design-system/README.md` signale l'amendement de la règle 3 comme « en attente » ; mettre cette mention à jour une fois l'amendement appliqué.
- **Correction 9** : le site affiche déjà un indice de confiance et un score global dans la sortie de module, étiquetés hors rapport.
- **Corrections 11 et 12** : la section « Accès API — pilote » est prête dans la spécification du site, mais n'est pas publiée tant que le contrat n'est pas produit.

**Tarif public particulier — à reporter dans la dataroom (2 oct. 2026).** Le site publie désormais, sur `/tarifs`, « inspection complète à partir de 250 TND TTC » pour une citadine en inspection avant achat, le prix exact variant selon le type de véhicule, sa valeur et l'objet de l'inspection (facteurs nommés, sans montant). Déplacement inclus dans le Grand Tunis et le gouvernorat de Sfax ; ailleurs, frais par zone annoncés avant confirmation. Le prix ne dépend pas des défauts constatés. À reporter dans la Stratégie de référence §7 et dans la Proposition de valeur (segment particulier). Spec : `docs/specs/2026-10-tarifs.md`.

**Possible, non fait.** La contradiction qui interdisait de publier un tarif partenaire est levée : commission uniforme de 20 % partout. La Stratégie de référence §7 règle 6 prévoit même une « grille tarifaire publique et identique pour tous les partenaires ». Le site peut donc publier la commission marque blanche si le fondateur le souhaite ; la règle « aucun tarif partenaire » du design system serait alors à lever.

**Suivi technique côté site.** `platformCapabilities.js` indique qu'un statut ne change qu'« une fois le critère de performance documenté atteint » : y citer explicitement la Spécification du rapport §8, qui est ce critère.
