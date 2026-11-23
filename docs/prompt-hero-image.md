# Prompt de génération — image hero (ChatGPT / GPT-Image)

## Architecture retenue

L'image générée est une **plaque propre, sans aucun texte** : voiture moderne en showroom
lumineux, effet de scan wireframe, rien d'autre. Les annotations (défauts extérieurs et
mesures mécaniques) sont dessinées **en HTML/SVG par-dessus** par
`src/components/home/certification/VehicleScanOverlay.jsx`, animées en séquence.

Avantages : aucun risque de faute dans les libellés générés, texte net sur tout écran,
traduisible (FR/AR/EN), modifiable en une ligne de code, lisible par Google. Et comme
l'image est affichée à son ratio naturel dans une carte — jamais recadrée — les positions
en pourcentage des annotations restent exactes sur mobile : la carte entière se réduit,
les points restent sur la bonne pièce du véhicule.

## Prompt à coller tel quel dans ChatGPT

> Génère une image photoréaliste au format paysage 1536 × 1024, style photographie
> commerciale automobile haut de gamme.
>
> **Scène.** Une berline moderne gris métallisé, impeccable, vue de trois quarts avant
> (l'avant orienté vers la gauche du cadre), au centre d'un showroom automobile
> contemporain très lumineux : sol en marbre clair poli avec reflets nets du véhicule,
> baies vitrées du sol au plafond, lumière du jour douce et diffuse, un ou deux véhicules
> flous en arrière-plan. Ambiance premium, propre, professionnelle.
>
> **Effet technologique.** Sur la moitié arrière de la carrosserie, un maillage filaire
> (wireframe) bleu lumineux (#447D9B) épouse précisément les formes du véhicule, comme un
> scan 3D en cours — il s'estompe progressivement vers l'avant, qui reste purement
> photographique. Quelques fines particules lumineuses bleues flottent autour du maillage.
> Au sol près de la roue avant, un petit boîtier OBD-II noir relié au véhicule par un fin
> câble lumineux bleu.
>
> **Palette stricte** : bleu nuit #273F4F, bleu acier #447D9B, blanc, gris clair. Une
> seule touche orange (#FE7743) autorisée : une lueur discrète le long de la ligne de
> caisse.
>
> **Interdits absolus** : aucun texte, aucune lettre, aucun chiffre, aucune étiquette,
> aucune annotation, aucune flèche, aucun élément d'interface, aucun logo de constructeur,
> aucune plaque d'immatriculation lisible, aucune personne, aucun filigrane.
>
> Laisser de l'espace visuel autour du véhicule (marges d'environ 10 % sur les bords) :
> des annotations seront superposées par-dessus en post-production.

## Contrôle qualité à la réception

1. **Aucun texte nulle part** — c'est le critère principal. Si un badge ou un caractère
   apparaît, demander : « regénère la même image en supprimant tout texte et tout logo ».
2. Pas de badge constructeur sur la calandre, plaque illisible ou absente.
3. Le véhicule occupe le centre du cadre avec ~10 % de marge — les annotations HTML ont
   besoin de cet espace.

## Intégration

1. Enregistrer le PNG sous `public/images/hero/hero-annotated-car.png` (écraser le
   fichier provisoire). Aucun code à modifier.
2. Me le dire : je calerai alors les coordonnées `dot` (point sur le véhicule) et `card`
   (position du cartouche) dans `VehicleScanOverlay.jsx` sur les vraies positions —
   pare-chocs, portière, aile, roue avant, capot — et j'optimiserai le poids du fichier
   (WebP ~150 Ko au lieu de ~2 Mo).

## Les annotations affichées (déjà en place dans le code)

| Annotation | Type | Contenu |
| --- | --- | --- |
| Pare-chocs fissuré | Extérieur (bleu) | Sévérité haute |
| Rayure porte avant | Extérieur (bleu) | Sévérité modérée |
| Peinture : 218 µm | Mécanique (orange) | +96 µm vs constructeur — repeinte détectée |
| Pneus : 3,2 mm | Mécanique (orange) | Au-dessus du seuil légal |
| OBD : P0420 | Mécanique (orange) | Catalyseur — efficacité sous seuil |
| Signature acoustique | Mécanique (orange) | Moteur conforme à la référence |

Elles apparaissent par groupes de deux ou trois, en boucle de 12 secondes, avec trait de
liaison orange et point pulsant. Si l'utilisateur a activé « réduire les animations »,
trois annotations s'affichent en statique. Sur mobile, les cartouches passent en taille
réduite et masquent la seconde ligne. Pour modifier un libellé : tableau `ANNOTATIONS`
dans `VehicleScanOverlay.jsx` — une ligne à changer, aucune image à regénérer.
