# Concept homepage — plateforme de confiance pour la certification VO

Date : 6 août 2026. Remplace `docs/refonte-homepage-certification-vo.md` (supprimé — construit sur une
lecture indirecte du modèle économique, jamais confronté aux sources primaires du dataroom).

## 0. Sources consultées

- **Brief produit/UX** transmis par Wassim (issue #9, commentaire du 6 août 2026) — structure en 10
  sections, positionnement Carfax/Stripe/Plaid, règles de copywriting.
- **Dataroom** : `Z:\MALLOULIAUTO\dataroom\`
  - `MALLOULIAUTO_Business_Plan_1.0.docx` — source principale, citée par section (ex. « BP §1.1 »).
  - `MALLOULIAUTO_Pitch_Deck_Investisseur.pdf` — présentation investisseur du 6 août 2026, cité par
    slide (ex. « Deck, slide 10 »).
  - `02-produit\MALLOULIAUTO_Rapport_Inspection_Apercu_Style.pdf` — rendu réel du gabarit de rapport,
    cité par section (ex. « Rapport §7 »).
  - `01-analyse-marche\08_Note_Concurrence_Locale_Tunisie.md` et `06_Note_Strategique_Positionnement.md`
    pour la concurrence.
  - `01-analyse-marche\00_Cadrage_et_Journal_des_Decisions.md` — journal de décisions vivant : plusieurs
    chiffres cités ci-dessous y sont encore en révision au moment d'écrire ce document.
- Le dossier `01-analyse-marche\99-deprecie\` a été retiré par Wassim — tout ce qui en provenait dans
  l'ancienne homepage doit être considéré comme non fiable par défaut.

**Correction explicite d'orientation (Wassim, 6 août 2026) :** notre concurrent réel est l'expertise
manuelle et papier (garages, experts automobiles indépendants), pas les fournisseurs de vision par
ordinateur (ACV, UVeye, Tchek, ProovStation). Le BP le confirme : ces derniers sont « une menace pour
plus tard, pas un concurrent aujourd'hui » (BP §2.6) — absents de nos marchés, liés à leur propre
plateforme. Toute comparaison sur la homepage doit se faire contre l'inspection manuelle, jamais contre
un « scanner » non nommé.

---

## 1. Le repositionnement

MALLOULIAUTO ne vend pas de véhicules et n'est pas un garage. C'est une société qui **standardise et
rend vérifiable** un acte aujourd'hui rendu à la main, sans méthode fixe et sans document consultable
après coup (BP §1.1). Le positionnement visé se lit à côté de Carfax, Stripe, Plaid — pas à côté d'un
concessionnaire ou d'un atelier.

**La phrase qui résume tout (BP §1.3, à réutiliser quasi telle quelle) :**
> Les autres listent les problèmes. Nous, on dit combien ça change le prix.

**Ce qu'on promet, ce qu'on ne promet pas (BP §1.2, Rapport §7 — à respecter au mot) :**

| On dit | On ne dit jamais |
| --- | --- |
| Un constat mesuré, horodaté, vérifiable par un tiers | Une recommandation d'achat |
| Une conséquence de prix, chiffrée à partir de coûts de réparation documentés | Un pourcentage de confiance chiffré global |
| Ce qui est mesuré vs. observé vs. estimé vs. non évalué (la provenance de chaque ligne) | Une garantie sur l'état structurel |
| — | Un coût de réparation produit par une IA générative |

---

## 2. Où la homepage actuelle s'écarte des faits

C'est le cœur de ce document : chaque section ci-dessous cite la source qui contredit une affirmation
actuellement en ligne. Objectif — ne rien publier qui ne survive pas à la question « quel scanner ? ».

### 2.1 Le statut réel de l'entreprise

> « Société pré-commerciale. Zéro client payant, zéro inspection commercialisée à ce jour. »
> — Deck, slide 10 (« STATUT ACTUEL »)

La homepage actuelle parle en société installée : comptes gratuits, paliers d'abonnement, réseau de
partenaires actif, canaux de revenu déjà négociés. Rien de tout cela n'existe encore — le pilote (200
inspections, canal direct uniquement) n'a même pas commencé (BP §4.5, phase 1, mois 1 à 6). Le canal
partenaire n'ouvre qu'en phase 2 (mois 6 à 18). La homepage doit lire comme une entreprise qui **démarre
un pilote**, pas comme une plateforme en régime établi. C'est très exactement le risque que le brief
pointe : « if a visitor leaves believing Mallouli Auto is simply another inspection garage — the redesign
has failed » s'applique dans les deux sens, y compris à l'excès de maturité affiché.

**Conséquence sur les CTA.** « Créer un compte gratuit », « Certifier un véhicule — dès 90 TND » vers une
plateforme self-service supposent un produit grand public déjà en ligne. Le brief propose plus juste :
*Request Certification*, *Book a Certification*, *Contact Us* — une demande, pas un achat en un clic.

### 2.2 Ce qui est mesuré aujourd'hui, ce qui est sur la feuille de route

| Modalité | Statut réel | Source |
| --- | --- | --- |
| Vision extérieure (dommages, VIN, plaque) | Éprouvée en interne | Deck, slide 10 |
| Diagnostic OBD | Éprouvé en interne | Deck, slide 10 |
| **Cohérence kilométrique multi-calculateurs** | Réelle, documentée — **absente de la homepage actuelle** | BP §1.3 ; Rapport §4.1 |
| Épaisseur de peinture par panneau | Outil physique disponible (jauge à induction) | Deck, slide 5 ; Rapport §2.2 |
| Profondeur de sculpture des pneus | Outil physique disponible (jauge de sculpture) | Deck, slide 5 ; Rapport §2.1 |
| Dessous de caisse (rouille, chocs, fuites) | Réel, documenté — absent de la homepage actuelle | BP §1.3 ; Rapport §3 |
| **Signature acoustique et vibratoire** | **Non éprouvée — corpus requis, horizon 2029** | Deck, slide 10 |
| Score de confiance chiffré (customer-facing) | **Explicitement jamais fourni** | Rapport §7 |
| Estimation de coût par IA | Phase 1 : par un expert humain. IA seulement en phase 2, jamais générative | Deck, slide 4 et 10 ; Rapport §7 |

La homepage actuelle présente la signature acoustique comme une mesure « décisive » livrée dès le palier
CERTIFY, avec un exemple de constat affirmatif (« Signature acoustique — Conforme à la référence » dans
la maquette de certificat). C'est la mesure la moins avancée du produit — elle doit soit disparaître de
« ce qu'on mesure aujourd'hui », soit apparaître explicitement comme un jalon 2029. À l'inverse, la
vérification kilométrique — un vrai différenciateur, déjà documenté et testé — n'apparaît nulle part.

### 2.3 Le modèle tarifaire

**Décision (Wassim, 6 août 2026) : le modèle tarifaire n'est plus exposé publiquement sur la homepage.**
Il reste documenté dans la dataroom (`04-modele-economique/`, classeur financier) — pas sur une page
publique, tant qu'il est encore en cours d'arbitrage (voir ci-dessous). En conséquence :

- `Pricing.jsx` et `KitVisual.jsx` ont été supprimés, ainsi que le rendu `<Pricing />` dans `Home.jsx` et
  l'`OfferCatalog` du JSON-LD (prix SCAN/DIAG/CERTIFY en `€`).
- Toute mention de prix (« dès 90 TND », etc.) a été retirée du Hero, du CTA final, d'`index.html`
  (meta description, Open Graph, Twitter Card) et d'`AccountArchetypes`.
- `PartnerChannels` ne mentionne plus de taux de partage de revenu (45/55, 65 %) — remplacé par une
  description qualitative des canaux.

Pour mémoire, ce qui avait été vérifié avant cette décision (non exposé, mais toujours utile pour la
prochaine itération si le choix est révisé) :

- Pas de paliers **SCAN / DIAG / CERTIFY** à 27 € / 34 € / 48 €, et pas d'abonnements **FLOW / GARAGE /
  BUSINESS / ENTERPRISE**. Ces noms et ces prix n'apparaissent dans aucune source consultée en dehors du
  dossier déprécié. Le modèle réel (BP §4.3, Deck slide 7, journal de décisions) : trois classes
  cumulatives **Extérieur seul / Mécanique seul / Complet**, prix moyen réalisé stable dans le BP et le
  deck (68 € en 2027 → 72 € en 2031), mais **prix par classe encore en cours d'arbitrage** dans le journal
  de décisions (au moins cinq itérations entre le 31/07 et le 4/08).
- Pas de « zéro investissement client, kit loué en libre-service ». Le produit est délivré par un
  **opérateur instrumenté** (scanner Autel MaxiSYS MS906 Pro ou équivalent, caméra d'endoscopie, jauge
  d'épaisseur, jauge de sculpture — 3 552 € par opérateur, amorti sur 3 ans — Deck slide 5). Ce n'est pas
  un kit que le client loue et utilise lui-même. **Ce point reste vrai et reste appliqué sur la homepage**
  (parcours, CTA) indépendamment de la décision de ne pas afficher de prix.

### 2.4 Le modèle de distribution et de partenariat

Pas de « réseau de contrôle technique agréé (45/55) » ni de « place de marché automobile (65 %) » — ces
deux canaux ne sont pas ceux du BP. Les canaux réels (BP §4.2, Deck slide 8) :

- **Direct** (nos propres équipes) — canal de lancement, ~89–92 % de marge brute.
- **Experts d'inspection sous marque partagée** (co-marquage) — partenaire retenu à 35–45 % pour
  MALLOULIAUTO ; taux administratif visé : **35 % du prix de détail, uniforme quelle que soit la classe**
  (journal, dernière itération lue).
- **Licence plateforme** — évoquée comme troisième canal théorique, **écartée pour l'instant** (BP §4.2 :
  « on écarte cette option pour l'instant »).
- Les **centres de contrôle technique agréés** sont explicitement « moins prioritaires... pas retenus
  pour l'instant » (BP §4.2) — à l'inverse de la homepage actuelle qui en fait un canal central.
- Les places de marché en ligne ne sont qu'un canal secondaire conditionnel : uniquement si elles
  imposent notre certification à leurs propres vendeurs (BP §4.2) — pas un canal à prix de gros garanti.

### 2.5 La segmentation

Pas six archétypes de compte. La segmentation réelle (BP §4.1) : **particuliers et professionnels
(concessionnaires, revendeurs, exportateurs) au Maghreb** ; **l'expert automobile agréé en Europe** (seul
client direct visé pour l'instant) ; **l'exportateur du corridor** (priorité plus basse). Ça correspond
presque exactement aux trois audiences du brief — Individuals / Dealers / Partners — sans qu'il soit
nécessaire d'inventer des sous-catégories (label VO de groupe, mégastore multimarque...) qui ne sont pas
dans le BP.

**Segments explicitement écartés, à ne jamais présenter comme cibles :** assurance/sinistres et
location/flottes au Maghreb — le prix soutenable y est inférieur au coût de production (BP §4.1, assumé
comme un renoncement volontaire).

---

## 3. Ce que le rapport d'inspection réel apporte à la section « Digital Report »

Le brief demande que cette section devienne « one of the visual highlights ». Le gabarit réel
(`02-produit\MALLOULIAUTO_Rapport_Inspection_Apercu_Style.pdf`) donne un mécanisme de confiance concret,
bien plus fort qu'un visuel générique :

- **Une légende de provenance sur chaque ligne** : Mesuré / Observé et annoté / Calculé / Estimé par un
  expert / Non évalué (Rapport §0). C'est exactement le genre de mécanique « precision, transparency »
  que le brief demande, et elle est déjà écrite — il suffit de la montrer.
- **Quatre niveaux de gravité** (Mineure / Modérée / Majeure / Critique), pas une distinction binaire.
- **Une synthèse en une page** : score de santé /100, liste des défauts avec gravité, coût de réparation
  estimé par fourchette, conséquence de prix chiffrée, résumé en langage naturel (Rapport §6).
- **Une section « ce que ce rapport ne couvre pas »** (Rapport §7) — à répliquer en substance sur la
  homepage : c'est la meilleure preuve de sérieux qu'on puisse montrer sans inventer de statistique.
- Outil nommé et réel : **Autel MaxiSYS MS906 Pro** (Rapport §8, Deck slide 5) — préférer ce nom concret à
  « diagnostic électronique » générique dans les visuels.

`CertificateVisual.jsx` (déjà construit) va dans la bonne direction mais doit être revu pour refléter ce
système de provenance plutôt qu'une simple liste de coches — et il ne doit jamais afficher une signature
acoustique comme un constat livré (cf. §2.2).

---

## 4. Architecture retenue (10 sections, mappées à l'existant)

**État : fait, à date du 6 août 2026.** L'ordre ci-dessous est celui réellement en place dans `Home.jsx`.

| # | Section (brief) | Composant | Statut |
| --- | --- | --- | --- |
| 1 | Hero | `HeroCertification.jsx` | ✅ Copie et CTA corrigés — « Demander une certification » / « Devenir partenaire », plus de prix ni de self-service. |
| 2 | Le problème | `UncertaintyDiscount.jsx` | ✅ Reformulé contre l'expertise manuelle/papier (BP §1.1), plus de référence à des « scanners ». |
| 3 | La solution | `Solution.jsx` (nouveau) | ✅ Construit : rapport unique, opérateur indépendant, deux contrôles en un rendez-vous, « ce que le rapport ne dit jamais ». |
| 4 | Comment ça marche | `CertificationFlow.jsx` | ✅ Parcours réécrit autour de l'opérateur instrumenté (prise de contact → inspection sur site → rapport avec provenance → certificat vérifiable). |
| 5 | Ce qui nous différencie | `DecisiveMeasures.jsx` | ✅ Cohérence kilométrique ajoutée ; signature acoustique déplacée en jalon « Horizon 2029 », plus dans la grille des mesures livrées. |
| 6 | Le rapport numérique | `CertificateVisual.jsx` | ✅ Corrigé (plus de signature acoustique, plus de nom de palier) ; intégré à la section 4 plutôt qu'en section autonome — refonte complète autour du système de provenance (Mesuré/Observé/Calculé/Estimé) encore à faire si on veut en faire « the visual highlight » que demande le brief. |
| 7 | Qui on sert | `AccountArchetypes.jsx` | ✅ Réduit à 3 cartes : Particuliers / Professionnels / Partenaires — plus de prix, plus de taux de partage. |
| 8 | Technologie | `TechnologyTrust.jsx` (moitié gauche) | ✅ Vocabulaire IA autonome retiré ; kits loués → instruments transportés par l'opérateur. |
| 9 | Confiance | `TechnologyTrust.jsx` (moitié droite) + `PartnerChannels.jsx` | ✅ « L'IA ne décide jamais » (Rapport §6.5, Deck slide 4) ; canaux réécrits sans pourcentages (décision du 6 août). |
| 10 | CTA final | `CertificationCTA.jsx` | ✅ Aligné sur « Demander une certification » / « Devenir partenaire », plus de prix. |

**Pricing — décision tranchée (Wassim, 6 août 2026) : retiré, pas seulement reporté.** `Pricing.jsx` et
`KitVisual.jsx` sont supprimés ; l'ancre `#offre` de `SectionNav` est devenue `#comment-demarrer`, pointée
sur `CertificationCTA`. Le modèle tarifaire reste documenté dans `04-modele-economique/` — pas republié
ici tant qu'il n'est pas arbitré (voir §2.3).

---

## 5. Direction visuelle

Le brief demande : précision, transparence, calme, minimal, premium — proche de Stripe/Plaid. Explicitement
à éviter : « cheap gradients », « excessive animations », clichés automobiles, blocs de texte denses.

**Tension à résoudre avec l'existant.** La construction actuelle utilise un dégradé sur au moins 4 sections
(Hero, CertificationFlow, TechnologyTrust, CertificationCTA) et une animation `whileInView` sur
quasiment chaque carte de chaque section. Ce n'est pas nécessairement à tout jeter — mais chaque section
dark-gradient doit se justifier individuellement plutôt que se reproduire par défaut, et les animations
d'entrée répétées sur 40+ cartes lisent plus comme un thème de landing page générique que comme Stripe ou
Plaid. À revoir section par section pendant l'implémentation, pas en bloc.

---

## 6. Règles de copywriting (rappel)

- Langage courant, toujours — voir la reformulation du Hero comme référence de registre.
- Aucune affirmation qui ne survit pas à « d'après quelle source ? ». Toute mesure présentée comme
  livrée aujourd'hui doit être vérifiable dans le BP, le deck ou les specs produit — pas seulement
  plausible.
- Aucun superlatif non prouvé (« meilleur », « numéro un », « révolutionnaire »...).
- Un chiffre de marché ou de traction ne se publie que s'il est sourcé et que Wassim confirme qu'il est
  approprié pour une audience publique (vs. réservé à l'investisseur).
- Toujours distinguer, dans la copie elle-même quand c'est pertinent, ce qui est mesuré aujourd'hui de ce
  qui est sur la feuille de route (ex. signature acoustique → horizon 2029).

---

## 7. Prochaines étapes

Fait, dans l'ordre, entre le 6 août (matin) et le 6 août (soir) 2026 : CTA vers `/contact` partout (plus
de self-service) ; Hero + « Le problème » réécrits contre l'expertise manuelle ; section « La solution »
construite ; parcours réécrit autour de l'opérateur instrumenté ; modalités différenciantes corrigées
(kilométrage ajouté, acoustique déplacée en jalon 2029) ; « qui on sert » réduit à 3 audiences ; vocabulaire
IA de la section Technologie corrigé ; Confiance + Partenaires réécrits ; CTA final aligné ; **décision de
retirer entièrement le pricing public** appliquée (`Pricing.jsx`/`KitVisual.jsx` supprimés, JSON-LD et
meta tags d'`index.html` nettoyés des prix, ancres nav/footer mises à jour) ; lint/prettier/build/
vérification visuelle à chaque étape.

Ce qui reste ouvert :

1. **Refonte visuelle de `CertificateVisual`** autour du système de provenance complet (Mesuré / Observé
   et annoté / Calculé / Estimé par un expert / Non évalué — Rapport §0) pour en faire le visuel phare que
   demande le brief, plutôt que la maquette actuelle à 4 lignes.
2. **Passe de style** : dégradés/animations à justifier section par section plutôt que par défaut (§5) —
   pas encore fait, le brief demande un registre plus calme (Stripe/Plaid) que l'existant.
3. **Pages internes** (`Partners`, `SolutionDealers`, `Technology`, `SolutionInsurance/Fleet/Individuals`)
   — toujours sur l'ancien modèle, hors périmètre de cette itération homepage.
4. **`public/sitemap.xml`** — à mettre à jour une fois le périmètre des pages internes arbitré.
5. **Version anglaise** — nécessaire dès l'archétype exportateur/l'ouverture Golfe.
