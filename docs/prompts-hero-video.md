# Hero — spécification vidéo (variante B, plein cadre)

## Ce qui a changé depuis la version précédente de ce document

Cette spec a été écrite pour l'ancien hero (deux colonnes : texte à gauche, vidéo cadrée dans un panneau à droite) avec des annotations de mesure dessinées en code par-dessus la vidéo (`VehicleScanOverlay.jsx`). Les deux ont changé :

- **Le hero est maintenant en variante B** (`src/components/home/certification/HeroCertification.jsx`) : le média occupe tout le cadre de la section, le texte repose sur un voile directionnel — opaque sur la colonne de texte, dégradé vers la droite. Il n'y a plus de panneau vidéo séparé.
- **`VehicleScanOverlay.jsx` a été supprimé.** Il dessinait des annotations de mesure fictives (fissure de pare-choc inventée, code OBD inventé, kilométrage inventé) — jamais des constats réels. Il n'y a donc plus de séquence d'annotations synchronisée à la vidéo, plus de contrainte de durée exacte pour caler des timestamps, plus de coordonnées `dot`/`card` à ajuster.
- **En attendant la vidéo**, le fond du hero est la photo réelle de showroom déjà utilisée sur le site (`public/images/hero/hero-annotated-car.*`) — pas un fond gris, pas un contenu inventé. Voir la note en tête de `HeroCertification.jsx` pour le point d'échange exact quand la vidéo arrive.

Le reste de ce document (encodage, poster, chemins de fichiers) reste valable ; seuls le cadrage, le voile et la durée changent.

## À trancher avant de tourner ou de générer : vidéo réelle ou plaque générée par IA ?

La version précédente de ce document recommandait de générer la plaque de fond avec un modèle vidéo (Sora, Veo, Runway). Depuis, le design system du site a posé une règle explicite (`docs/design-system/README.md`, « Imagerie et vidéo ») : **toute photo ou vidéo montre une inspection réelle — jamais une banque d'images.** Le mockup homepage lui-même décrit un tournage réel pour cette place (jauge d'épaisseur posée sur une aile avec son relevé affiché, lecteur OBD branché, jauge de sculpture sur un pneu, véhicule sur le pont) — pas une voiture de synthèse qui tourne dans un showroom.

**Recommandation par défaut de ce document : tourner en réel**, avec un vrai véhicule et le vrai matériel d'inspection (cohérent avec le reste du site — hero photo actuelle, captures MA-Inspector, photos `/technology`). La section « Génération IA » plus bas reste documentée comme option de secours si un tournage n'est pas possible dans les temps, mais ce n'est plus la voie recommandée par défaut — à confirmer avec le fondateur avant de partir sur l'une ou l'autre, puisque ça engage soit un tournage, soit un écart assumé à la règle « pas de banque d'images ».

## Spécification technique

| Paramètre | Valeur |
| --- | --- |
| Format | 16:9, 1920 × 1080 minimum, 2560 × 1440 souhaité |
| Durée | 12 à 20 s, boucle naturelle — plus de contrainte de synchronisation à une séquence d'annotations |
| Boucle | Premier et dernier plan proches, sans coupe visible |
| Débit cible | Moins de 2,5 Mo en WebM VP9, moins de 3,5 Mo en MP4 H.264 |
| Son | Aucun — la vidéo est muette, lue en `autoplay muted loop playsInline`, `preload="none"` |
| Zone protégée | La partie gauche du cadre (environ 55 à 60 % de la largeur) doit rester visuellement calme — c'est là que repose le voile le plus sombre et le texte |
| Fichiers attendus | `public/videos/hero-showroom-certification.webm` et `.mp4`, poster `public/images/hero/showroom-certification-poster.jpg` |

## Cadrage et voile — où le texte va réellement s'afficher

Le voile n'est plus une simple bande sombre sur un tiers du cadre : c'est un dégradé directionnel, réglé dans `HeroCertification.jsx`.

**Desktop** — deux dégradés superposés sur toute la hauteur :
- Un voile bas → haut pour garder la bande de statistiques lisible en bas de cadre : `rgba(18,31,40,.72)` à 0 % de hauteur, transparent à 34 %.
- Un voile gauche → droite pour le texte : `rgba(18,31,40,.94)` à 0 % de largeur, `.91` à 34 %, `.52` à 62 %, `.30` à 100 %.

Concrètement : **tout ce qui doit rester lisible sous le texte se trouve dans les 60 premiers pourcents de la largeur du cadre** — c'est là qu'il faut composer le sujet le moins chargé (sol, mur, flou d'arrière-plan), pas dans le tiers gauche comme le disait la version précédente de ce document. Le sujet principal (le geste de mesure, l'instrument) peut occuper la partie droite du cadre sans contrainte.

**Mobile** — le texte occupe toute la largeur du cadre (pas de colonne dédiée), donc le voile est uniforme sur toute la largeur et un peu plus sombre partout : `rgba(18,31,40,.93)` en bas, `.88` au milieu, `.80` en haut. Un plan qui fonctionne en desktop grâce au dégradé directionnel doit donc aussi rester lisible une fois assombri uniformément — éviter un sujet qui a besoin de toute sa luminosité pour se lire.

## Prompts de tournage (réel) — ce qu'il faut capturer

Cohérent avec le brief du mockup et avec le reste du site (photo hero actuelle, captures MA-Inspector) :

- La jauge d'épaisseur de peinture posée sur une aile, avec son relevé affiché à l'écran de l'appareil.
- Le lecteur de diagnostic OBD branché sous le tableau de bord, écran allumé.
- La jauge de profondeur de sculpture appliquée sur un pneu.
- Le véhicule sur le pont élévateur, vu de dessous ou en cours de montée.

Un plan continu et lent sur l'un de ces gestes (pas un montage cut-cut) boucle plus proprement et coûte moins cher à produire qu'une plaque IA à corriger. Composer le geste et l'opérateur dans la partie droite du cadre, garder la partie gauche (sol, établi, mur) dégagée — voir la section cadrage ci-dessus pour les proportions exactes.

## Option de secours — génération par un modèle vidéo (IA)

À n'utiliser que si un tournage réel n'est pas possible avant le lancement, et avec l'accord du fondateur puisque ça s'écarte de la règle « pas de banque d'images » du design system.

**Ce que les modèles vidéo font bien** : une lumière de showroom, des reflets sur une carrosserie, un mouvement de caméra lent, une atmosphère haut de gamme.

**Ce qu'ils ne savent pas faire** : garder un véhicule géométriquement stable sur une rotation complète — la voiture se déforme, les proportions dérivent. Et ils ne produisent pas de texte lisible.

**Conséquence sur le cadrage à demander** : ne pas demander une rotation à 360°. Demander une **orbite lente de la caméra autour d'un véhicule immobile, sur 30 à 40° seulement**.

> Cinematic 14-second seamless loop, no text, no captions, no user interface, no logos, no watermarks.
>
> A modern, bright automotive showroom with polished light-grey concrete floors, floor-to-ceiling glass walls, soft diffused daylight and clean architectural ceiling lights. In the centre, a single dark grey mid-size sedan, immaculate, parked at a three-quarter front angle, positioned toward the right side of the frame. The camera performs one slow continuous orbit of about 35 degrees around the vehicle, at chest height, moving from the front three-quarter view towards the side profile, then easing back to the starting position so the shot loops seamlessly.
>
> The car itself does not move and does not change shape. Reflections travel across the paintwork and the wheel rims as the camera moves. Shallow depth of field, the background showroom gently blurred with soft bokeh from the ceiling lights.
>
> Colour grade: cool and clean, dominated by deep navy blue and steel blue, with warm amber highlights only on the reflections along the body line. Professional automotive commercial photography, 35mm lens, high dynamic range, subtle film grain.
>
> The left 55 to 60 percent of the frame must stay visually calm and uncluttered — mostly floor and soft blurred background, no important detail — because text sits over a dark gradient there. The vehicle and any detail should read within the right 40 percent of the frame.
>
> Negative: no text, no letters, no numbers, no number plate, no brand badge or manufacturer logo, no people, no hands, no UI overlays, no annotation callouts, no arrows, no HUD elements, no morphing or shape-shifting of the car.

## Poster (image fixe)

Le poster est ce que voit l'utilisateur avant que la vidéo ne démarre : c'est lui qui détermine le score LCP. Prenez de préférence une image extraite de la vidéo finale plutôt qu'une génération séparée, pour éviter tout saut visuel au démarrage.

Extraction depuis la vidéo :

```bash
ffmpeg -i hero-showroom-certification.mp4 -vf "select=eq(n\,0)" -vframes 1 -q:v 2 \
  public/images/hero/showroom-certification-poster.jpg
```

## Encodage web

```bash
# WebM VP9 — servi en priorité
ffmpeg -i source.mp4 -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -an \
  -vf "scale=2560:-2" public/videos/hero-showroom-certification.webm

# MP4 H.264 — repli Safari et anciens navigateurs
ffmpeg -i source.mp4 -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p \
  -movflags +faststart -an -vf "scale=1920:-2" public/videos/hero-showroom-certification.mp4
```

## Après réception de la vidéo

1. Déposer les trois fichiers aux chemins indiqués.
2. Dans `HeroCertification.jsx`, remplacer le bloc `<picture>` par un `<video autoPlay muted loop playsInline preload="none" poster={HERO_IMAGE_JPG}>` avec les deux `<source>` (webm puis mp4) — même conteneur, mêmes voiles, rien d'autre à changer (l'instruction exacte est déjà en commentaire en tête du fichier).
3. Vérifier le contraste du texte sur le média réel : les voiles ont été calés pour une scène sombre type atelier — si le tournage final est plus clair (ex. showroom très lumineux comme la photo actuelle), il faudra probablement remonter l'opacité des dégradés dans `HeroCertification.jsx` pour garder un ratio d'au moins 4,5:1 sur le texte blanc.
4. Vérifier la boucle à l'œil (pas de saut visible) et le poids des fichiers livrés contre les cibles du tableau ci-dessus.

## Ce qui fonctionne déjà sans la vidéo

Le hero est opérationnel dès maintenant : sans fichier vidéo, la photo réelle de showroom sert de fond plein cadre avec le même voile. Aucun écran cassé ni contenu fictif pendant la production du média — juste un remplacement d'élément le jour où la vidéo est prête.
