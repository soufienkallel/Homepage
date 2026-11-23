# Design system MALLOULIAUTO — charte de contenu et de style

Source réelle : la maquette homepage `mallouliauto-homepage-v3.html` (20 sept. 2026), elle-même construite sur le rapport d'inspection réel MA-2026-SW8ZWJ et sur `apps/packages/certification/` (taxonomie, schéma, synthèse) du monorepo MALLOULIAUTO. Ce document fixe le vocabulaire visuel et le vocabulaire de contenu à réutiliser sur le site, les flyers et les supports sociaux — c'est la même charte, pas une déclinaison par canal.

Copié depuis l'artefact « MALLOULIAUTO » (Design System) publié le 20 sept. 2026 : https://claude.ai/artifact/RyL2Pufixt2oGoa7rQRQCX — cette copie est la référence pour ce dépôt ; toute évolution doit être répercutée dans les deux (voir la section « Écart connu » en bas de fichier).

## Fondamentaux de contenu

MALLOULIAUTO vend un fait vérifié, pas une impression. Chaque règle ci-dessous existe pour que ce positionnement ne se dilue pas au fil des supports.

- N'affichez jamais de note globale, de score de santé ou de grade sur un véhicule. Le rapport donne des constats individuels, une gravité par constat (`min`/`mod`/`maj`) et un total chiffré des réparations — jamais un chiffre unique de 0 à 100 ni une lettre A à F. C'est un choix produit assumé : `synthese.ts` documente explicitement « pas de note, pas de valorisation ».
- **Exception à deux couches, page `/technology` uniquement** (décision du fondateur, 24 sept. 2026). Le rapport certifié fait foi et la règle ci-dessus s'y applique sans exception. Les modules technologiques (module vision en prototype, hors rapport) peuvent montrer leurs propres sorties — score d'état global, indice de confiance par détection, gravité sur l'échelle du module, action réparer/remplacer — **comme fonctionnalités du module**, dans un cadre visuellement distinct (bordure en pointillés) étiqueté « Ne figure pas sur le rapport certifié ». Jamais à côté du visuel du certificat, jamais avec les couleurs de gravité du rapport, jamais de précision de modèle chiffrée (« 95 % de précision ») tant qu'aucune évaluation n'est documentée.
- N'affichez jamais la provenance d'un constat (mesuré / observé / calculé / estimé). Le rapport nomme le matériel utilisé (`.tool` — Multimètre, Testeur de batterie, Jauge de profondeur de sculpture, etc.), jamais la méthode d'obtention de chaque donnée individuelle.
- **Ne présentez jamais l'IA ni l'IoT comme fonctionnels ou en production.** Règle de la dataroom (`MALLOULIAUTO_Strategie_de_Reference.docx` §3, règle 3), qui fait foi : ces capacités sont en cours de développement, démontrables, et passeront en production à mesure que la performance requise est atteinte. Chaque capacité affichée porte son statut réel (« Disponible » / « En développement »), comme le fait la Proposition de valeur segment par segment. Une version antérieure de ce document disait l'inverse — c'était une erreur. **Mise à jour du 24 sept. 2026 :** le statut a désormais deux axes, définis dans `src/data/platformCapabilities.js` — la maturité (« Disponible » / « Prototype » / « En développement ») et l'intégration au rapport (« Au rapport » / « Hors rapport »). Le module vision est un prototype qui tourne, hors rapport : on peut le dire, mais on évite « fonctionnel » et « en production » tant que la dataroom (§3 règle 3) n'est pas amendée en ce sens.
- Corollaire (`Strategie_de_Reference` §2) : **ne pas vendre l'IA, vendre le rapport et ce qu'il permet de décider.** `MALLOULIAUTO_Specification_Rapport_Inspection.docx` §7 proscrit explicitement « Analysé par notre intelligence artificielle » et « Notre système a déterminé » — ne nommez pas le mécanisme. Cette règle vaut pour le rapport et pour les pages qui le vendent. La page `/technology` présente, elle, la plateforme que MALLOULIAUTO développe (décision du fondateur, 24 sept. 2026) : elle peut nommer la vision par ordinateur et l'IoT, avec leur statut, mais n'attribue jamais un constat du rapport à l'IA. L'amendement correspondant de `Strategie_de_Reference` §2 est en attente.
- Ne promettez jamais de recommandation d'achat ou de vente : le rapport donne une **conséquence de prix chiffrée**, pas un conseil de décision. « Achat recommandé » est une formulation proscrite. Un avis global ou une synthèse de l'inspecteur (langage clair sur ce qui a été mesuré) reste légitime — c'est un champ réel du produit (`syntheseTexte`) — tant qu'il ne dit pas « achetez » ou « n'achetez pas ».
- **« Valeur recommandée » est la seule capacité à afficher explicitement comme à venir**, avec le badge `.ph-note` « Bientôt » plutôt qu'un statut « Disponible »/« En développement » — elle n'a, à ce jour, aucune trace dans la dataroom en dehors d'une puce du Business Model Canvas. Ne l'annoncez jamais comme disponible.
- Les témoignages sont des emplacements tant qu'ils ne sont pas réels — jamais une citation inventée. Les logos partenaires, eux, sont réels depuis le 22 sept. 2026 (Myrage, Auto Lion, AIJ Automotive, ScoutCar.tn — usage confirmé avec chacun ; AutoPi ajouté le 25 sept. 2026 à la place d'Auto Sans Risque, qui n'est plus partenaire) : la section s'intitule **« Nos partenaires »**, ni « Partenaires pilotes » (devrait changer à la sortie du pilote — pas un intitulé durable) ni « Ils nous font confiance » (revendique une relation de confiance établie que la dataroom ne documente pas encore — zéro partenaire engagé contractuellement, Checklist Due Diligence). Le principe reste : jamais un nom, un logo ou une citation inventés — mais un logo confirmé se publie sous un intitulé neutre et durable, pas sous une étiquette qui devra changer.
- Vocabulaire de gravité fermé à **3 niveaux** : Mineure, Modérée, Majeure (`GRAVITE_LEVELS`, taxonomy.ts ; « Critique » abandonnée par décision produit de sept. 2026). « Sans objet » est un état de saisie de l'outil terrain, jamais une gravité affichée sur un rapport client. Vocabulaire de conformité fermé : Conforme, Bon état, Origine, Concordant. N'inventez pas d'autres qualificatifs.
- **Les faits produit se vérifient dans le dépôt produit, pas ici.** Source : `C:\Work\malloulinova\mallouliauto\apps\packages\certification\src\taxonomy.ts` (et `schema.ts`). Valeurs vérifiées le 3 oct. 2026 : **131** éléments (périmètre complet), **5** familles et 21 sous-familles, **3** niveaux de gravité, 7 périmètres (`PACKS`). Elles sont recopiées dans `src/data/inspectionFacts.js` — c'est le seul endroit du site où un chiffre d'inspection est écrit. Les **instruments** viennent de la liste du matériel réel fournie par le fondateur le 3 oct. 2026 (18 instruments de contrôle comptés, multimètre compris, 5 équipements cités) ; le catalogue produit `MATERIEL_CATALOGUE` ne lui correspond pas encore et doit être réaligné.
- Les chiffres précédemment cités ici (96 points, 10 instruments, 6 familles dont « Identité et historique », et le certificat « réel » MA-2026-SW8ZWJ / VW Tiguan / 1 410 TND) **ne venaient d'aucune source** : vérification faite, la référence n'existe nulle part dans le produit et le couple VIN/Tiguan provient de données de test d'un dossier sinistre. Ils ont été retirés du site. N'en réintroduisez aucun.
- La société est pré-commerciale (zéro inspection commercialisée) : **aucun certificat réel n'est publiable**. L'aperçu du rapport montre la structure du document avec des valeurs illustratives, explicitement étiquetées comme telles.
- Ton : direct, factuel, jamais promotionnel. Une phrase nomme ce qui a été mesuré plutôt que ce que le lecteur devrait ressentir (« Un chiffrage, pas seulement une liste » plutôt que « Une expérience unique »). Les titres de carte opposent souvent ce que fait MALLOULIAUTO à ce qu'un concurrent ou une méthode traditionnelle ne fait pas.
- **Appel à l'action principal : « Demander une inspection »**, qui mène au formulaire `/demande-inspection`. WhatsApp et l'appel sont des boutons secondaires, autorisés dans la barre mobile, le bloc contact et les bandeaux de fin de section (décision du fondateur, 26 sept. 2026, qui remplace l'ancienne règle « pas de bouton CTA WhatsApp »). Numéros et horaires : `src/data/contactChannels.js`, jamais écrits en dur. Le texte d'un bouton plein est posé sur `accent-ink`, pas sur `accent` (blanc sur `accent` = 2,85:1, sous le seuil AA).
- Ne jamais affirmer que l'inspection se déroule toujours chez le vendeur. Trois options réelles existent : chez le client, chez le vendeur, dans les locaux MALLOULIAUTO — soit on abstrait le lieu (hero), soit on les liste toutes (étape du parcours, FAQ).
- Aucun prix concurrent chiffré (ex. fourchette d'un concurrent en dinars) — l'argument se fait sans comparer de prix.
- **Tarif public** (décision du fondateur, 1–2 oct. 2026, qui remplace la règle « aucun prix sur le site » du 26 sept.) : un seul prix publié, « inspection complète à partir de 250 TND TTC » (citadine, inspection avant achat), détaillé sur `/tarifs` avec les facteurs qui le font varier, **sans montant par facteur**, et la règle de déplacement (inclus dans le Grand Tunis et le gouvernorat de Sfax, ailleurs annoncé avant confirmation). Le prix se rattache toujours à l'inspection complète. Il n'est écrit que dans `src/data/pricing.js`, jamais en dur. Aucun autre montant : ni frais de déplacement chiffrés, ni prix professionnel (sur devis), ni commission partenaire. Le prix est porté par `mono`, sans badge « promo » ni couleur d'alerte. Spec : `docs/specs/2026-10-tarifs.md`.

## Fondations visuelles

### Couleur

`navy` est le fond des séquences à fort engagement (hero, clôture) ; `navy-d` distingue la section Plateforme du hero sans introduire une troisième couleur de fond. `accent` et `accent-ink` ne sont jamais interchangeables : `accent` est réservé aux aplats (fond de bouton, barre du certificat, puce), `accent-ink` à tout ce qui porte du texte (eyebrow, lien, texte de bouton au survol). Cette séparation existe parce que `accent` seul tombe à 2,85:1 sur blanc — sous le seuil AA.

Les couleurs de sévérité (`min`, `mod`, `maj`) et de statut (`ok`) sont sémantiques et strictement réservées au vocabulaire de gravité d'un constat. Ne les réutilisez jamais pour un état d'interface (erreur de formulaire, succès d'action) : un futur produit qui aurait besoin de ce vocabulaire ajoutera ses propres tokens plutôt que de recycler celui-ci.

La rampe de neutres (`ink`, `ink-2`, `ink-3` pour le texte ; `ground`, `ground-2`, `ground-3` pour les fonds ; `rule`, `rule-2` pour les traits) porte toute la hiérarchie de lecture. Aucune ombre ne sert cette hiérarchie — voir Élévation.

### Typographie

`sans` (Montserrat) porte tout ce qui se lit comme de la prose : titres, chapôs, corps de texte, libellés d'interface. `mono` (IBM Plex Mono) est réservé sans exception aux identifiants et aux données : eyebrows, VIN, référence de certificat, valeurs de mesure avec leur unité, libellés de statut. Cette séparation est le signal « mesuré, pas décoré » du système — ne faites jamais porter une donnée par la police sans empattement, et n'utilisez jamais la monospace pour un titre ou un paragraphe de lecture.

Toute valeur numérique alignée en colonne (mesures, montants) porte `font-variant-numeric: tabular-nums`. Les eyebrows sont systématiquement en majuscules avec un tracking large (`letterSpacing` du style `eyebrow`).

### Espacement et mise en page

Le rythme entre sections vient de `space-7` (76px) et d'un simple trait `rule` en haut de section — jamais d'un fond alterné en damier ni d'une carte flottante. `space-6` (46px) resserre une section secondaire (vérification de certificat) sans casser ce rythme. Le contenu est plafonné à `content-max` (1140px) ; un paragraphe de lecture à `prose-max` (62ch) ; le bloc de texte du hero en variante plein cadre est plafonné à `hero-copy-max` (80ch depuis le 26 sept. 2026, décision du fondateur — 52ch auparavant) ; le voile directionnel reste fort jusqu'à ~68 % de la largeur pour que le texte reste lisible, le média restant visible sur le tiers droit.

### Élévation et bordures

Le système est borders-first, pas shadow-first : la séparation entre deux blocs se lit dans un trait `rule`/`rule-2`, pas dans une ombre portée. `nav-sticky` est la seule ombre du système, réservée à la navigation collante — n'en ajoutez pas une deuxième ailleurs, même pour une carte qui « a besoin de se détacher » : détachez-la avec une bordure plus forte (`rule-2`) ou un fond `ground-2`.

`radius-flat` (0) est la valeur par défaut de tout bouton, chip, tag et champ de formulaire. `radius-panel` (3px) est l'unique exception, réservée au panneau du certificat — une évocation de document physique, jamais un rayon de carte UI générique. `radius-full` reste cantonné aux marques circulaires (pastille de marque, avatar).

### Imagerie et vidéo

Toute photo ou vidéo montre une inspection réelle — jamais une banque d'images. Tant qu'un support réel n'existe pas, utilisez le motif `.slot` (hachures diagonales + bordure en tirets), en variante `.slot.dark` sur fond sombre : c'est le seul traitement acceptable pour un emplacement non finalisé, jamais un simple rectangle gris ni un contenu inventé pour « faire vrai ».

Pour la vidéo de hero en plein cadre : composez le sujet réel dans le tiers non voilé du cadre, filmez plus sombre et moins contrasté que ne le suggère l'œil (le voile assombrit encore), privilégiez un mouvement lent et continu. Livraison technique : `muted loop playsinline preload="none"`, image d'affiche (poster) comme élément LCP — la vidéo elle-même ne doit jamais être l'élément de plus grand rendu au chargement, encodage H.264 + WebM sous ~2 Mo, et un repli statique sous `prefers-reduced-motion`.

## Iconographie

Le système n'utilise aucune police d'icônes ni bibliothèque de pictogrammes. Le vocabulaire graphique est typographique : `+`/`–` en `mono` pour l'ouverture/fermeture d'un accordéon (FAQ), `→` pour amorcer un item de liste de livrables, `·` comme séparateur inline, une pastille bicolore (anneau `accent` + point `navy`) comme marque de marque — écho discret de la roue du logotype — et un motif de damier comme substitut visuel de QR code tant que le vrai code n'est pas généré. Un besoin d'icône futur doit rester dans ce registre restreint et typographique plutôt qu'importer un jeu d'icônes générique.

Le code React de ce dépôt utilise un jeu d'icônes SVG maison (`src/components/icons/index.jsx`) plutôt que ce vocabulaire typographique pur — c'est une divergence assumée entre le système "print/marque" ci-dessus et l'implémentation React existante ; ne pas essayer de les faire converger dans ce lot de travail.

## Qui fait foi, sur quoi

Trois sources, trois autorités — elles ont divergé, d'où les corrections du 22 sept. 2026 :

| Source | Fait foi sur | Emplacement |
| --- | --- | --- |
| Dataroom | Positionnement, gouvernance, ce qu'on a le droit d'affirmer | `Z:\MALLOULIAUTO\dataroom` — `Strategie_de_Reference.docx` arbitre les divergences internes |
| Dépôt produit | Faits produit : taxonomie, compteurs, vocabulaires, capacités | `C:\Work\malloulinova\mallouliauto\apps\packages\certification\src` |
| Ce dépôt | Rendu visuel et rédaction du site | recopie les faits, n'en invente aucun |

Quand la dataroom et le produit se contredisent sur un fait produit, **le produit gagne** — son gabarit de rapport décrit encore un « Score de santé global » et des périmètres « Extérieur seul / Mécanique seul » que le produit n'implémente pas (il n'expose aucune note globale, et ses périmètres sont les 7 valeurs de `PACKS`).

## Écart connu : gravité — résolu

Le vocabulaire de gravité est fermé à **3 valeurs** — Mineure, Modérée, Majeure — confirmé dans `GRAVITE_LEVELS` (taxonomy.ts, vérifié le 3 oct. 2026). « Critique » a été retirée par décision produit en sept. 2026 ; le token `--color-sev-crit` n'est plus utilisé par le rapport. « Sans objet » est un état de saisie de l'outil terrain, jamais une gravité affichée côté client : un point sans objet est absent du rapport, il ne porte pas de badge.

**Action restante** : mettre à jour l'artefact Design System publié (tokens.json + README) pour ajouter `crit`, documenter l'exclusion de « Sans objet », et répercuter les corrections ci-dessus sur l'IA/IoT et sur les chiffres d'inspection.
