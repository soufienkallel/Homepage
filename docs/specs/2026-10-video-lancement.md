# Vidéo de lancement sur la homepage

Décision du 1er oct. 2026 : la story « Les premières demandes d'inspection sont arrivées »
(Instagram/Facebook, 20 s, 1080×1920, avec musique) est publiée dans le hero, **pas en pop-up
à l'arrivée**.

## Pourquoi pas de pop-up

- Le bandeau cookies et la barre mobile occupent déjà le premier écran d'un nouveau visiteur.
- Les navigateurs bloquent la lecture automatique avec le son : un pop-up jouerait la vidéo
  muette, alors que la musique en fait partie.
- Une interstitielle qui couvre le contenu à l'arrivée pénalise le référencement mobile
  (Google) et masque l'appel à l'action principal au moment où le visiteur décide.

## Comportement

- Écrans ≥ 1280 px (`xl`) : vignette 9:16 de 200 px dans le tiers droit du hero.
- En dessous : ligne compacte (petite affiche, libellé, bouton lecture) sous les liens du hero.
- Clic → `<dialog>` natif (Échap, clic sur le fond et × ferment ; focus rendu au déclencheur).
  Le `<video>` n'est monté qu'à l'ouverture : rien de la vidéo n'est téléchargé avant le clic.
  La lecture démarre avec le son, le clic valant geste utilisateur.
- Équivalent texte des trois écrans dans le dialogue (`aria-describedby`), la musique ne porte
  aucune parole.

Fichiers : `src/components/home/certification/LaunchVideo.jsx`, `public/videos/`.
Affiche : `story_premieres-demandes_photo_1.png` (premier écran de la vidéo), 540×960.
Vidéo réencodée pour le site : 720×1280, H.264 CRF 27, AAC 96 kb/s, `faststart` — 2,2 Mo
(original 11 Mo ; SSIM 0,984 face à l'original).

## Contenu

Relu image par image le 1er oct. 2026. Quatre écrans : premières demandes (0–5 s), « Avant
d'acheter… » (5–9 s), « Un vrai rapport, photos à l'appui » (9–14 s), « Demandez votre
inspection » (14–20 s). « Réponse sous 24 h » et « Lun – sam · 8 h – 18 h » correspondent à
`src/data/contactChannels.js`. C'est une annonce datée (« Lancement ») : à retirer ou remplacer
quand elle ne sera plus vraie.

**Écart accepté** — l'écran 9–14 s montre un
rapport réel en marque blanche (Dacia Dokker 2021, Myrage, 24 sept. 2026, 3 895 TND ; VIN,
plaque, n° de certificat et opérateur masqués). Il entre en conflit avec trois règles écrites
du site :

- le design system : « aucun certificat réel n'est publiable », l'aperçu du rapport porte des
  valeurs illustratives étiquetées comme telles ;
- les Règles du partenariat habilité (reprises dans `PartnerChannels.jsx`) : la mention
  « Powered by MALLOULIAUTO », visible en pied du rapport, y est explicitement interdite ;
- le hero, qui présente MALLOULIAUTO comme certificateur indépendant, alors que le rapport
  désigne Myrage comme « Organisme certificateur ».

Décision du fondateur (1er oct. 2026) : vidéo publiée telle quelle. L'écart avec ces règles est
accepté pour le lancement, faute d'autre matériel pour monter la vidéo. Ce n'est **pas** une
modification des règles : le design system et les règles du partenariat restent la référence
pour tout nouveau support, et la vidéo est à remplacer dès qu'une version conforme existe.
