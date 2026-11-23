-- Guide n° 4, « Notre protocole d'inspection », as a DRAFT (docs/specs/2026-10-guide-protocole.md).
-- Facts come from the product taxonomy (checked on 3 Oct 2026) and from the founder's list of
-- instruments; the figures mirror src/data/inspectionFacts.js. The founder reviews it in
-- /admin/guides, fills in « Relu le », adds the instrument images, and publishes.
-- Re-running never overwrites an edited guide (on conflict do nothing).
--
-- Instrument grid: each list item starts with an image, then the name in bold, then one line
-- of use. Until the images exist, items are plain text; to add one, insert
-- ![Nom de l'instrument](url) at the start of the item (button « image » of the editor).

insert into public.guides (title, slug, category, status, excerpt, body, author)
values
(
  'Notre protocole d''inspection, de la demande au rapport',
  'protocole-inspection-mallouliauto',
  'protocole',
  'draft',
  'Comment se déroule une inspection MALLOULIAUTO : ce qui est contrôlé, avec quels instruments, et ce que contient le rapport. Une introduction pour nos partenaires.',
  $body$Une inspection MALLOULIAUTO suit toujours le même protocole, quel que soit l'inspecteur : les mêmes familles de contrôle, les mêmes instruments, le même rapport. Ce guide en donne une vue d'ensemble, pour un partenaire qui découvre notre méthode ou un client qui veut savoir ce qu'il recevra.

## En bref

- Un inspecteur habilité contrôle le véhicule sur place, avec une application sur tablette.
- 131 points de contrôle en inspection complète, répartis en 5 familles.
- 18 instruments de contrôle, et chaque rapport nomme le matériel utilisé.
- Chaque défaut constaté porte une description, une gravité, des photos et, si vous le demandez, un chiffrage des réparations en dinars.
- Le rapport porte un numéro de certificat, vérifiable en ligne.

## 1. La création de l'inspection

L'inspection commence par l'identité du véhicule (numéro de châssis, marque, modèle, année, immatriculation, énergie, boîte de vitesses, puissance, couleur), les coordonnées du client et le lieu.

On y fixe aussi trois choix qui figurent ensuite sur le rapport :

- **L'objet de l'inspection** : achat ou vente, avant réparation, après réparation, préventive, visite technique, après accident ou expertise.
- **Le périmètre** : une seule famille de contrôle, l'inspection complète, ou une sélection personnalisée.
- **Le niveau de démontage** : aucun, partiel ou complet.

Le chiffrage des réparations est une option : approximatif ou précis, en dinars.

## 2. L'identification du véhicule

L'inspecteur relève le numéro de châssis et prend une série de photos guidées : les quatre coins du véhicule, l'avant, l'arrière, les deux côtés, le pare-brise, l'habitacle, la plaque du numéro de châssis et le compteur.

## 3. Les contrôles, famille par famille

| Famille | Ce qui est contrôlé | Instruments |
| --- | --- | --- |
| Diagnostic électronique | Cohérence du kilométrage entre calculateurs, codes défaut, voyants, système électronique | Appareil de diagnostic, oscilloscope, multimètre |
| Niveaux, liquides et batterie | Huile, liquide de refroidissement, lave-glace, liquide de frein, direction assistée, boîte automatique ; batterie | Testeur de liquide de frein, testeur de qualité d'huile moteur, testeur de circuit de refroidissement, testeur de batterie et de système de charge |
| Motopropulseur | Moteur, transmission, train roulant : pneus, direction, suspension, freins | Compressiomètre, kit de mesure de pression d'huile, analyseur de gaz (essence) ou opacimètre (diesel), stéthoscope mécanique, pompe à vide, jauge d'usure des pneus |
| Enveloppe extérieure | Châssis, carrosserie et tôlerie, vitrage | Détecteur d'épaisseur de peinture, caméra d'inspection |
| Confort et sécurité | Éclairage et signalisation, climatisation, airbags, ceintures, rétroviseurs, essuie-glaces, équipements intérieurs, accès et démarrage | Testeur de qualité de froid de climatisation, appareil de diagnostic |

Les contrôles combinent l'examen visuel, les essais de fonctionnement, l'essai dynamique et la mesure. Deux exemples :

- **Les pneus** : la profondeur de sculpture est mesurée sur chaque pneu, et la conclusion suit une règle fixe. Moins de 1,6 mm : non conforme ; de 1,6 à moins de 3 mm : usure avancée ; de 3 à moins de 5 mm : état moyen ; 5 mm et plus : bon état.
- **La peinture** : l'épaisseur est mesurée panneau par panneau. La conclusion (origine ou repeint) reste le jugement de l'inspecteur, qui croise la mesure avec ce qu'il observe : un chiffre seul ne suffit pas à l'affirmer.

## 4. Les constats

Pour chaque défaut, l'inspecteur note :

- une description ;
- une gravité : **mineure**, **modérée** ou **majeure** ;
- des photos ;
- si le chiffrage est demandé : réparation ou remplacement, avec les pièces, la main-d'œuvre et le matériel.

Chaque information indique d'où elle vient : mesurée par un instrument, observée par l'inspecteur, calculée, estimée par l'expert, ou non évaluée. Un élément sans défaut est noté comme tel, et un élément dont le véhicule n'est pas équipé l'est aussi : le rapport ne passe rien sous silence.

## 5. La finalisation

Avant de générer le rapport, l'inspecteur rédige lui-même sa synthèse, en langage clair. Elle n'est jamais produite automatiquement. Une fois finalisée, l'inspection ne peut plus être modifiée ni supprimée.

## 6. Le rapport et son certificat

Le rapport réunit l'identité du véhicule, les photos, les constats classés par famille et par gravité, les mesures, le total estimé des réparations s'il a été demandé, la synthèse de l'inspecteur et la traçabilité : qui a inspecté, où, quand, avec quel matériel.

Il porte un **numéro de certificat** et un **code QR**. La page de vérification en ligne indique si le certificat est valide, et affiche l'empreinte numérique du document : elle permet de vérifier qu'il n'a pas été modifié depuis son émission.

## Ce que le rapport ne dit pas

Le rapport décrit l'état du véhicule le jour de l'inspection. Il ne donne **ni note globale, ni conseil d'achat, ni estimation du prix du véhicule, ni garantie sur sa structure**. Le certificat atteste que le rapport a bien été émis par MALLOULIAUTO et qu'il est intact, pas que le véhicule est en bon état : la décision vous appartient, avec des faits vérifiables.

## Nos instruments

- **Appareil de diagnostic** Lit les codes défaut et les données des calculateurs.
- **Oscilloscope** Visualise les signaux électriques des capteurs et des actionneurs.
- **Multimètre** Mesure les tensions, la continuité et les résistances.
- **Détecteur d'épaisseur de peinture** Mesure l'épaisseur de peinture, panneau par panneau.
- **Jauge d'usure des pneus** Mesure la profondeur de sculpture de chaque pneu.
- **Testeur de batterie et de système de charge** Contrôle l'état de la batterie et la tension de charge.
- **Testeur de liquide de frein** Mesure la teneur en eau du liquide de frein.
- **Testeur de qualité d'huile moteur** Contrôle l'état de l'huile moteur.
- **Kit de mesure de pression d'huile** Mesure la pression de lubrification du moteur.
- **Testeur de circuit de refroidissement** Contrôle l'étanchéité du circuit et du radiateur.
- **Testeur de qualité de froid de climatisation** Mesure la température de l'air soufflé.
- **Compressiomètre essence** Mesure la compression de chaque cylindre d'un moteur essence.
- **Compressiomètre diesel** Mesure la compression de chaque cylindre d'un moteur diesel.
- **Analyseur de gaz** Analyse les gaz d'échappement d'un moteur essence.
- **Opacimètre** Mesure l'opacité des fumées d'un moteur diesel.
- **Stéthoscope mécanique** Localise un bruit anormal dans le moteur ou la transmission.
- **Pompe à vide** Contrôle les circuits à dépression, dont l'assistance de freinage.
- **Caméra d'inspection** Montre les zones que l'œil n'atteint pas.

Équipements : élévateur de voiture amovible, bloc volant (il immobilise le volant pendant le contrôle de la direction), torche et caisse à outils.
$body$,
  'MALLOULIAUTO'
)
on conflict (slug) do nothing;
