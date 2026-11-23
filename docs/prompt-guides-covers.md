# Prompts de génération — images de couverture des guides (ChatGPT / GPT-Image)

Remplacent provisoirement les photos réelles d'inspection (voir « Écart assumé » en fin de
document). Même principe que `docs/prompt-hero-image.md` : l'image générée est une **plaque
propre, sans aucun texte ni logo**. Le logo MALLOULIAUTO est ajouté **après** génération, en
post-production — un générateur d'images déforme les logotypes et invente des lettres.

## Gabarit commun (à garder dans chaque prompt)

- **Format** : paysage 1536 × 1024. La carte de la liste recadre l'image en bandeau (~1,7:1) et
  la page du guide en bandeau plus large (~2,3:1) : le sujet reste donc dans la **bande
  horizontale centrale**, avec de l'air en haut et en bas.
- **Palette de marque** : bleu nuit `#273F4F`, bleu acier `#447D9B`, blanc, gris clair.
  Une seule touche orange `#FE7743` (liseré de l'uniforme).
- **Uniforme de l'opérateur** : polo ou veste de travail **bleu nuit uni** `#273F4F`, col et
  bord de manche avec un fin liseré orange `#FE7743`, pantalon sombre, gants noirs fins.
  **Poitrine gauche lisse et dégagée : aucun texte, aucune broderie, aucun écusson** (le logo y
  sera posé ensuite).
- **Style** : photographie documentaire professionnelle, lumière du jour douce, sobre. Pas de
  rendu « publicité », pas de halo, pas de dégradé coloré, pas d'effet numérique.
- **Interdits** : aucun texte, lettre ou chiffre lisible ; aucun logo (constructeur, pneumatique
  ou autre) ; flancs de pneu **sans inscription lisible** ; plaque d'immatriculation absente ou
  illisible ; aucune interface ni annotation ; pas de filigrane.

## Guide 1 — « Contrôler l'état des pneus avant d'acheter »

### Prompt à coller tel quel

> Génère une photographie réaliste au format paysage 1536 × 1024, style photographie
> documentaire professionnelle, lumière du jour douce et naturelle.
>
> **Scène.** Un inspecteur automobile, homme d'une trentaine d'années, accroupi à côté de la roue
> avant d'une berline compacte grise, sur un parking extérieur propre. Il mesure la profondeur de
> la sculpture du pneu avec une jauge de profondeur : la tige de la jauge est insérée dans une
> rainure principale de la bande de roulement, il lit la mesure d'un regard concentré. Vue de
> trois quarts, à hauteur de la roue, mise au point nette sur la main, la jauge et la sculpture
> du pneu ; l'arrière-plan (autres voitures, bâtiment) est flou et neutre.
>
> **Uniforme.** Il porte un polo de travail bleu nuit uni (#273F4F), avec un fin liseré orange
> (#FE7743) au col et au bord des manches, un pantalon sombre et des gants noirs fins. La
> poitrine gauche du polo est lisse et dégagée : aucune inscription, aucun écusson, aucune
> broderie. Mains naturelles, anatomiquement correctes (cinq doigts par main).
>
> **Composition.** Le sujet (l'inspecteur, la roue, la jauge) occupe la bande horizontale
> centrale du cadre, avec une marge d'environ 15 % en haut et en bas et 10 % sur les côtés. Le
> pneu est un pneu réellement usé de façon crédible (sculpture visible, légère usure), propre,
> jante grise.
>
> **Palette sobre** : bleus nuit et acier, gris clair, blanc ; la seule touche vive est le
> liseré orange de l'uniforme. Pas de gamme saturée, pas de contraste exagéré.
>
> **Interdits absolus** : aucun texte, aucune lettre, aucun chiffre lisible ; aucune inscription
> sur le flanc du pneu ; aucun logo ni badge de constructeur ; aucune plaque d'immatriculation
> lisible ; aucune interface ni annotation ; aucun filigrane ; aucune autre personne.

### Contrôle qualité à la réception

1. **Aucun texte nulle part**, flanc du pneu compris. Sinon : « regénère la même image en
   supprimant tout texte, toute inscription et tout logo ».
2. **La jauge est utilisée correctement** : la tige est dans une rainure du pneu, pas posée sur
   la gomme ni dans la jante.
3. **Mains et doigts corrects** ; une seule personne ; pas d'outil inventé ou déformé.
4. **Polo bleu nuit uni**, liseré orange discret, **poitrine gauche entièrement lisse**.
5. **Sujet dans la bande centrale** : recadrez mentalement à 2,3:1 — la jauge et le visage ne
   doivent pas être coupés.
6. Pas de plaque lisible, pas de badge sur la voiture. Rendu sobre, sans halo ni lueur.

## Guide 2 — « Reconnaître une peinture refaite »

Le guide 1 a été validé sans logo ajouté (décision du fondateur, 3 oct. 2026) : le logo n'est
plus posé sur l'uniforme, la poitrine reste lisse.

### Prompt à coller tel quel

> Génère une photographie réaliste au format paysage 1536 × 1024, style photographie
> documentaire professionnelle, lumière du jour douce et naturelle, même style que la série
> précédente.
>
> **Scène.** Un inspecteur automobile, homme d'une trentaine d'années, debout à côté d'une
> berline compacte blanc nacré, sur un parking extérieur propre. Il contrôle la peinture de la
> portière avant avec un testeur d'épaisseur de peinture : un petit appareil portatif noir et
> gris, tenu d'une main gantée, dont la sonde est posée à plat sur la tôle ; l'écran de
> l'appareil est de petite taille et ne montre aucun chiffre lisible. Il regarde la
> carrosserie avec attention. Vue de trois quarts, légèrement en contre-plongée basse, mise au
> point nette sur la main, l'appareil et le reflet de la lumière sur la portière ; arrière-plan
> (autres voitures, bâtiment) flou et neutre.
>
> **Uniforme.** Il porte un polo de travail bleu nuit uni (#273F4F), avec un fin liseré orange
> (#FE7743) au col et au bord des manches, un pantalon sombre et des gants noirs fins. La
> poitrine gauche du polo est lisse et dégagée : aucune inscription, aucun écusson, aucune
> broderie. Mains naturelles, anatomiquement correctes (cinq doigts par main).
>
> **Composition.** Le sujet (l'inspecteur, sa main, l'appareil, la portière) occupe la bande
> horizontale centrale du cadre, avec une marge d'environ 15 % en haut et en bas et 10 % sur
> les côtés. La carrosserie est propre, avec un reflet doux et régulier de la lumière du jour
> et du ciel sur la portière.
>
> **Palette sobre** : bleus nuit et acier, gris clair, blanc ; la seule touche vive est le
> liseré orange de l'uniforme. Pas de gamme saturée, pas de contraste exagéré.
>
> **Interdits absolus** : aucun texte, aucune lettre, aucun chiffre lisible (y compris sur
> l'écran de l'appareil) ; aucun logo ni badge de constructeur ; aucune plaque d'immatriculation
> lisible ; aucune interface ni annotation ; aucun filigrane ; aucune autre personne.

### Contrôle qualité à la réception

1. **Aucun texte ni chiffre lisible**, écran du testeur compris. Sinon : « regénère la même
   image en supprimant tout texte, tout chiffre et tout logo ».
2. **Le testeur est posé à plat sur la tôle**, tenu d'une seule main ; pas d'outil déformé.
3. **Mains et doigts corrects** ; une seule personne.
4. **Polo bleu nuit uni**, liseré orange discret, **poitrine gauche entièrement lisse**.
5. **Sujet dans la bande centrale** (recadrage à 2,3:1 sans couper l'appareil ni le visage).
6. Reflet sur la portière net et régulier ; pas de plaque lisible ni de badge.

## Guide 3 — « Vérifier les papiers d'une voiture d'occasion »

Sujet : comparer le numéro de châssis (à la base du pare-brise) avec la carte grise. Les
documents et plaques portent du texte par nature : on demande des **lignes floues et
illisibles**, jamais de caractères nets (un générateur les invente).

### Prompt à coller tel quel

> Génère une photographie réaliste au format paysage 1536 × 1024, style photographie
> documentaire professionnelle, lumière du jour douce et naturelle, même style que la série
> précédente.
>
> **Scène.** Un inspecteur automobile, homme d'une trentaine d'années, penché côté conducteur
> d'une berline compacte bleu-gris sombre, sur un parking extérieur propre. Il regarde à
> travers le pare-brise la petite plaque métallique située à sa base, côté conducteur, pour
> comparer son numéro avec un document qu'il tient dans l'autre main. Le document est une
> feuille de papier rigide pliée, vue de biais : on n'y distingue que des blocs et des lignes
> floues, **aucun mot ni chiffre lisible**. La plaque du pare-brise est un petit rectangle
> métallique à peine visible, sans caractères lisibles. Vue de trois quarts, mise au point nette
> sur son visage concentré, sa main gantée et le document ; arrière-plan (autres voitures,
> bâtiment) flou et neutre.
>
> **Uniforme.** Il porte un polo de travail bleu nuit uni (#273F4F), avec un fin liseré orange
> (#FE7743) au col et au bord des manches, un pantalon sombre et des gants noirs fins. La
> poitrine gauche du polo est lisse et dégagée : aucune inscription, aucun écusson, aucune
> broderie. Mains naturelles, anatomiquement correctes (cinq doigts par main).
>
> **Composition.** Le sujet (l'inspecteur, le document, le bas du pare-brise) occupe la bande
> horizontale centrale du cadre, avec une marge d'environ 15 % en haut et en bas et 10 % sur
> les côtés. Le pare-brise est propre, avec un léger reflet du ciel qui ne masque pas la zone
> examinée.
>
> **Palette sobre** : bleus nuit et acier, gris clair, blanc ; la seule touche vive est le
> liseré orange de l'uniforme. Pas de gamme saturée, pas de contraste exagéré.
>
> **Interdits absolus** : aucun texte, aucune lettre, aucun chiffre lisible (document, plaque
> du pare-brise, vignette ou pare-soleil compris) ; aucun logo ni badge de constructeur ;
> aucune plaque d'immatriculation lisible ; aucune interface ni annotation ; aucun filigrane ;
> aucune autre personne ; aucune carte d'identité ni document officiel reconnaissable.

### Contrôle qualité à la réception

1. **Aucun mot ni chiffre lisible** sur le document, la plaque, le pare-brise ou le pare-soleil.
   Sinon : « regénère la même image en rendant tout document et toute plaque flous, sans
   caractère lisible ».
2. **Le document ne ressemble pas à un papier officiel réel** (pas d'en-tête, pas de blason,
   pas de carte plastifiée reconnaissable) : on ne simule pas une vraie carte grise.
3. **Mains et doigts corrects**, une seule personne, une seule main tient le document.
4. **Polo bleu nuit uni**, liseré orange discret, **poitrine gauche entièrement lisse**.
5. **Sujet dans la bande centrale** (recadrage à 2,3:1 sans couper le visage ni le document).
6. Pas de plaque d'immatriculation lisible, pas de badge sur la voiture.

## Guide 4 — « Notre protocole d'inspection, de la demande au rapport »

Sujet : une vue d'ensemble de l'inspection, pas un geste unique. Plan plus large que les trois
premiers : le véhicule sur l'élévateur, l'inspecteur qui consigne un contrôle sur la tablette,
les instruments rangés à portée de main. L'écran de la tablette ne montre que des blocs flous.

### Prompt à coller tel quel

> Génère une photographie réaliste au format paysage 1536 × 1024, style photographie
> documentaire professionnelle, lumière du jour douce et naturelle, même style que la série
> précédente.
>
> **Scène.** Dans un atelier propre et lumineux aux murs gris clair, une berline compacte gris
> argent est levée à mi-hauteur sur un élévateur de voiture amovible, roues dans le vide. Un
> inspecteur automobile, homme d'une trentaine d'années, se tient debout à côté de l'aile avant,
> capot ouvert, et consigne un contrôle sur une tablette durcie tenue dans sa main gauche ; il
> regarde la tablette, concentré. L'écran de la tablette ne montre que des blocs gris et bleus
> flous, aucun texte. Au premier plan, légèrement flou, un chariot d'atelier gris où sont rangés
> quelques instruments de diagnostic : un appareil de diagnostic portable, un multimètre, une
> jauge de profondeur de pneu, un manomètre. Vue de trois quarts avant, mise au point nette sur
> l'inspecteur et la tablette.
>
> **Uniforme.** Il porte un polo de travail bleu nuit uni (#273F4F), avec un fin liseré orange
> (#FE7743) au col et au bord des manches, un pantalon sombre et des gants noirs fins. La
> poitrine gauche du polo est lisse et dégagée : aucune inscription, aucun écusson, aucune
> broderie. Mains naturelles, anatomiquement correctes (cinq doigts par main).
>
> **Composition.** L'inspecteur, la tablette et l'avant du véhicule occupent la bande
> horizontale centrale du cadre, avec une marge d'environ 15 % en haut et en bas et 10 % sur
> les côtés. Atelier rangé, sol propre, aucun encombrement.
>
> **Palette sobre** : bleus nuit et acier, gris clair, blanc ; la seule touche vive est le
> liseré orange de l'uniforme. Pas de gamme saturée, pas de contraste exagéré, pas d'effet
> lumineux ni d'hologramme.
>
> **Interdits absolus** : aucun texte, aucune lettre, aucun chiffre lisible (écran de la
> tablette, instruments, cadrans, murs compris) ; aucun logo ni badge de constructeur ; aucune
> plaque d'immatriculation lisible ; aucune interface lisible ni annotation ; aucun filigrane ;
> aucune autre personne.

### Contrôle qualité à la réception

1. **Aucun texte ni chiffre lisible**, écran de la tablette, cadrans et murs compris. Sinon :
   « regénère la même image en rendant l'écran et les cadrans flous, sans aucun caractère ».
2. **Le véhicule est posé de façon crédible** sur l'élévateur (bras sous les points de levage,
   pas de voiture flottante) ; l'élévateur ressemble au nôtre, mobile et non un pont fixe à
   colonnes.
3. **Mains et doigts corrects**, une seule personne, une seule tablette.
4. **Polo bleu nuit uni**, liseré orange discret, **poitrine gauche entièrement lisse**.
5. **Sujet dans la bande centrale** (recadrage à 2,3:1 sans couper le visage ni la tablette).
6. Instruments du chariot plausibles et sans marque ; atelier sobre, sans effet futuriste.

## Après génération (fait par Claude)

1. Déposer le fichier dans le dossier du dépôt (ou le donner à Claude).
2. (Abandonné pour la série : le fondateur n'ajoute pas de logo.) Claude ajoute le **logo MALLOULIAUTO** (`docs/general/logo/`, fichier vectoriel) sur la
   poitrine gauche, à l'échelle et à l'angle du tissu, dans une version adaptée au fond bleu
   nuit (logo blanc et orange). Pas de logo en coin d'image : il apparaît uniquement sur
   l'uniforme.
3. Export en WebP ou JPEG, **moins de 5 Mo** (limite du bucket ; viser 1 Mo ou moins pour la vitesse de la page), 1600 px de large.
4. Téléversement par le bouton de l'éditeur (`/admin/guides`), puis « Mettre à jour ».

## Écart assumé

`docs/design-system/README.md` impose des photos **réelles** d'inspection et refuse la banque
d'images. Une image générée n'est pas une inspection réelle : à traiter comme **illustration
provisoire**, à remplacer par de vraies photos dès qu'elles existent, et à ne jamais présenter
comme une preuve ni comme un client ou un inspecteur réel. Le texte du guide ne doit en aucun cas
s'appuyer sur l'image.
