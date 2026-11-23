# Prompts de génération — images des instruments (guide « Notre protocole d'inspection »)

Pour la grille « Nos instruments » du guide n° 4 (`docs/specs/2026-10-guide-protocole.md`). Décision du fondateur (3 oct. 2026) : images générées avec ChatGPT, intégrées par Claude (option B : fichiers dans le dépôt, migration qui les insère dans le guide).

Écart assumé avec le design system (imagerie réelle) : illustrations provisoires, à remplacer par des photos de notre matériel. Chaque image doit **ressembler à notre appareil réel** : si votre modèle diffère de la description (forme, écran, accessoires), corrigez la ligne avant de générer.

## Méthode

1. Ouvrir **une seule conversation** ChatGPT et y coller d'abord le **prompt de série** ci-dessous : il fixe le style pour toutes les images.
2. Envoyer ensuite les lignes d'instrument **une par une** (« Image 1 : … »), en demandant à chaque fois « même style que la série ».
3. Enregistrer chaque image dans `docs/img/instruments/` sous le **nom de fichier** indiqué (n'importe quel format, PNG convient).
4. Prévenir Claude : conversion en WebP carré (~800 px, 100 à 200 Ko), copie dans `public/images/guides/instruments/`, migration qui ajoute les images au guide, vérification de la grille.

## Prompt de série (à coller en premier)

> Je vais te demander une série de 18 images d'instruments de diagnostic automobile, pour un même site professionnel. Toutes les images de la série doivent respecter exactement ce style :
>
> - **Format carré** 1024 × 1024, photographie produit réaliste, style catalogue professionnel sobre.
> - **Fond uni gris très clair (#F4F7F8)**, sans dégradé, sans décor, sans surface visible ; une ombre portée très douce sous l'objet, rien d'autre.
> - **Un seul instrument par image**, avec ses accessoires essentiels, entier, centré, vu de trois quarts légèrement en plongée, occupant environ 70 % du cadre (marge d'environ 15 % sur chaque bord).
> - **Lumière douce et diffuse** de studio, même direction et même intensité pour toute la série, couleurs naturelles, pas de reflets violents.
> - Boîtiers sobres (noir, gris anthracite, gris clair, métal) ; aucune couleur vive ajoutée qui ne serait pas celle de l'appareil.
> - **Interdits absolus** : aucune marque, aucun logo, aucun texte, aucune lettre, aucun chiffre lisible, y compris sur les écrans, cadrans, boutons et étiquettes (un écran affiche au plus une courbe ou des barres abstraites ; un cadran n'a que des graduations sans chiffres) ; aucune main ni personne ; aucun véhicule ; aucun filigrane.
>
> Réponds « prêt » ; je t'envoie ensuite chaque instrument.

## Lignes d'instrument (à envoyer une par une)

Commencer chaque message par « Même style que la série. » puis la ligne.

| # | Fichier | Ligne à envoyer |
| --- | --- | --- |
| 1 | `appareil-diagnostic` | Image 1 : un appareil de diagnostic automobile portable (lecteur OBD), boîtier robuste gris anthracite avec coins protégés en caoutchouc, écran couleur affichant uniquement des barres graphiques abstraites, câble relié à une prise de diagnostic OBD-II à 16 broches posée à côté. |
| 2 | `oscilloscope` | Image 2 : un oscilloscope automobile portable, boîtier noir, écran affichant une seule courbe de signal sur une grille, sans aucun texte ; deux cordons de mesure avec sondes et pinces crocodiles posés devant. |
| 3 | `multimetre` | Image 3 : un multimètre numérique portable, boîtier gris et noir, sélecteur rotatif avec uniquement des pictogrammes, écran éteint ; cordons de mesure rouge et noir avec pointes de touche. |
| 4 | `detecteur-epaisseur-peinture` | Image 4 : un détecteur d'épaisseur de peinture de poche, petit boîtier gris clair et noir tenant dans la main, petit écran éteint, sonde ronde à une extrémité. |
| 5 | `jauge-usure-pneus` | Image 5 : une jauge de profondeur de sculpture de pneu, type stylo en acier inoxydable avec petite tige de mesure, posée à plat. |
| 6 | `testeur-batterie` | Image 6 : un testeur de batterie et de système de charge portable, boîtier noir avec petit écran éteint, deux câbles courts terminés par des pinces rouge et noire. |
| 7 | `testeur-liquide-frein` | Image 7 : un testeur de liquide de frein en forme de stylo, boîtier gris, deux pointes métalliques à une extrémité, une rangée de petits voyants vert, jaune et rouge, sans inscription. |
| 8 | `testeur-qualite-huile` | Image 8 : un testeur de qualité d'huile moteur portable, boîtier noir avec une coupelle de mesure ronde en métal sur le dessus et une petite échelle de voyants colorés, sans inscription. |
| 9 | `kit-pression-huile` | Image 9 : un kit de mesure de pression d'huile moteur : un manomètre à aiguille (graduations sans chiffres) relié à un flexible renforcé, et plusieurs raccords filetés en laiton disposés en ligne devant. |
| 10 | `testeur-refroidissement` | Image 10 : un testeur de circuit de refroidissement : pompe à main avec manomètre à aiguille (graduations sans chiffres) et flexible, accompagnée de trois adaptateurs de bouchon de radiateur de tailles différentes. |
| 11 | `testeur-froid-climatisation` | Image 11 : un thermomètre numérique de contrôle de climatisation, boîtier compact gris, longue sonde fine en inox pour bouche d'aération, écran éteint. |
| 12 | `compressiometre-essence` | Image 12 : un compressiomètre pour moteur essence : grand manomètre à aiguille (graduations sans chiffres) protégé par une gaine en caoutchouc, flexible terminé par un embout fileté pour trou de bougie, deux embouts supplémentaires. |
| 13 | `compressiometre-diesel` | Image 13 : un compressiomètre pour moteur diesel : manomètre à aiguille haute pression plus massif (graduations sans chiffres), flexible épais renforcé, adaptateurs pour bougie de préchauffage et injecteur, dans une mallette noire ouverte. |
| 14 | `analyseur-gaz` | Image 14 : un analyseur de gaz d'échappement portable, boîtier gris clair et anthracite avec écran affichant des barres abstraites, long flexible de prélèvement terminé par une sonde métallique d'échappement. |
| 15 | `opacimetre` | Image 15 : un opacimètre portable pour moteur diesel : cellule de mesure compacte grise reliée par un flexible à une sonde d'échappement métallique, petit boîtier de commande à écran éteint. |
| 16 | `stethoscope-mecanique` | Image 16 : un stéthoscope de mécanicien : écouteurs noirs, tubes noirs, longue tige de sonde métallique et pavillon métallique. |
| 17 | `pompe-a-vide` | Image 17 : une pompe à vide manuelle en forme de pistolet, poignée noire, manomètre à aiguille (graduations sans chiffres), tuyau transparent et quelques petits adaptateurs en caoutchouc. |
| 18 | `camera-inspection` | Image 18 : une caméra d'inspection portable à écran TFT : poignée noire avec écran affichant une image sombre et floue d'un intérieur de moteur, sans texte, câble flexible à col de cygne terminé par une petite tête de caméra avec éclairage LED. |

Les cinq équipements (élévateur amovible, bloc volant, torche, caisse à outils, chariot garagiste) restent en texte, sans image.

## Contrôle qualité à la réception

1. **Aucun texte, logo ni chiffre lisible**, écrans et cadrans compris. Sinon : « régénère la même image sans aucun texte ni chiffre ».
2. **Fond gris très clair uni**, sans décor ; instrument entier, centré, même taille apparente que les précédents.
3. **L'appareil ressemble au nôtre** et est plausible (pas de pièce inventée, pas d'accessoire absurde, câbles qui se rejoignent correctement).
4. Même lumière et même angle que le reste de la série. Si une image détonne, la régénérer plutôt que de la garder.
