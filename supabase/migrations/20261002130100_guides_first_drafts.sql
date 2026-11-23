-- Three first guides, as DRAFTS (docs/specs/2026-10-guides.md, 2 Oct 2026).
-- They are not visible to visitors: the founder reviews them in /admin/articles, fills in
-- « Relu le » and switches them to « Publié ». Re-running never overwrites an edited guide
-- (on conflict do nothing).

insert into public.articles (title, slug, category, status, excerpt, body, author)
values
(
  'Contrôler l''état des pneus avant d''acheter',
  'controler-etat-pneus-voiture-occasion',
  'pneus-freins',
  'draft',
  'Âge, usure, dégâts visibles : ce que vous pouvez vérifier en quelques minutes sur les pneus d''une voiture d''occasion, et ce que cela ne prouve pas.',
  $body$Les pneus sont le seul contact entre la voiture et la route, et leur remplacement est un coût réel pour l'acheteur. Quelques minutes suffisent pour repérer les signes les plus courants.

## Ce que vous pouvez contrôler vous-même

**1. L'âge des pneus.** Sur le flanc, cherchez le code qui suit les lettres « DOT ». Ses quatre derniers chiffres donnent la semaine et l'année de fabrication : « 2420 » signifie la 24ᵉ semaine de 2020. Un pneu vieillit même s'il roule peu : la gomme durcit avec le temps. Au-delà de 5 à 6 ans, faites contrôler les pneus par un professionnel.

**2. La profondeur des sculptures.** Dans les rainures principales, repérez les petits témoins d'usure (les « TWI », de petits ressauts dans le fond de la rainure). Quand la gomme arrive à leur niveau, le pneu est à remplacer. Le seuil légal est de 1,6 mm dans de nombreux pays ; vérifiez celui qui s'applique chez vous.

**3. Les quatre pneus.** Notez la marque, la taille et le niveau d'usure de chacun. Quatre pneus très différents peuvent indiquer des remplacements faits au coup par coup, au fil des pannes.

**4. Les dégâts visibles.** Passez la main sur les flancs et regardez la bande de roulement : bosses ou hernies, fissures, coupures, corps étranger planté, objets coincés. Un pneu qui présente une bosse sur le flanc ne doit pas être utilisé.

**5. La forme de l'usure.** L'usure n'est pas toujours régulière, et sa forme donne des pistes :

| Ce que vous voyez | Pistes possibles (à confirmer) |
| --- | --- |
| Usure sur les deux bords | Pression souvent trop basse |
| Usure au centre | Pression souvent trop élevée |
| Usure sur un seul bord | Géométrie ou alignement à vérifier |
| Zones creusées, en « cuvettes » | Suspension ou amortisseurs à vérifier |

Ce sont des indices, pas des diagnostics : la même usure peut avoir plusieurs causes.

**6. La roue de secours et l'outillage.** Vérifiez qu'elle existe, qu'elle est utilisable et que le cric et la clé de roue sont présents.

## Ce que ce contrôle ne dit pas

- Un pneu en bon état ne dit rien de l'état des freins, de la suspension ou de la direction.
- Des pneus neufs peuvent masquer une usure irrégulière passée : demandez depuis quand ils ont été changés.
- Vous ne voyez pas l'intérieur du pneu. Un choc ou un roulage à plat peut l'avoir endommagé sans signe extérieur évident.
- Une usure irrégulière signale un défaut possible, mais ne dit pas lequel. Seul un contrôle de la géométrie et de la suspension permet de conclure.

## Quand demander une inspection

Si les pneus présentent une usure irrégulière, des dégâts, un âge avancé ou des écarts entre les quatre, faites vérifier le véhicule avant d'acheter. Une inspection indépendante examine aussi les éléments que vous ne pouvez pas voir depuis le trottoir, et vous remet un rapport écrit.
$body$,
  'MALLOULIAUTO'
),
(
  'Reconnaître une peinture refaite',
  'reconnaitre-peinture-refaite-voiture-occasion',
  'carrosserie',
  'draft',
  'Reflets, teintes, jeux entre panneaux, traces de peinture : comment repérer une carrosserie repeinte, et pourquoi une repeinte n''est pas forcément un accident.',
  $body$Une carrosserie repeinte n'est pas un défaut en soi : elle peut venir d'une rayure, de la grêle ou de la rouille. Elle est en revanche une raison de poser des questions, car elle peut aussi cacher une réparation après un choc.

## Comment procéder

Examinez la voiture **de jour, à l'ombre ou par temps couvert**, sur une voiture propre et sèche. Le soleil direct et la saleté cachent les différences.

**1. Le reflet.** Placez-vous en biais et regardez le reflet d'un objet lointain le long de chaque panneau. Il doit rester net et continu d'un panneau à l'autre. Un reflet qui se déforme, ou une surface qui ressemble à une peau d'orange, signale souvent une peinture refaite.

**2. La teinte et la brillance.** Comparez deux panneaux voisins, par exemple l'aile et la portière. Une légère différence de couleur ou de brillance est un indice, surtout sur les teintes métallisées.

**3. Les jeux entre les panneaux.** Les espaces entre capot, ailes, portières et coffre doivent être réguliers, de chaque côté de la voiture. Des jeux inégaux ou différents entre la gauche et la droite peuvent indiquer qu'un élément a été démonté, remplacé ou réparé.

**4. Les traces de peinture là où elle ne devrait pas être.** Regardez les joints en caoutchouc, les moulures, les optiques, les poignées et les bas de caisse : de la peinture dessus (le « brouillard » de pistolet) indique que la zone a été repeinte sans tout démonter.

**5. Les zones cachées.** Ouvrez les portes, le capot et le coffre. La peinture des montants, des feuillures et du compartiment moteur est rarement refaite par un propriétaire qui rénove seulement l'extérieur : si elle diffère, c'est un indice.

**6. Les professionnels utilisent un testeur d'épaisseur.** Cet appareil mesure l'épaisseur de la couche de peinture. Une épaisseur nettement plus forte sur un panneau signale une couche ajoutée (peinture, mastic). Un aimant léger peut aussi révéler du mastic sur une tôle d'acier, mais il ne fonctionne pas sur l'aluminium ni sur les pièces en plastique.

## Ce que ce contrôle ne dit pas

- **Repeinte ne veut pas dire accidentée.** Une rayure de parking, un impact ou une rouille traitée suffisent.
- **Une peinture d'origine ne garantit pas l'absence de choc.** Certains éléments sont changés ou redressés sans toucher à la peinture.
- **Une bonne réparation est difficile à voir.** Une repeinte soignée peut échapper à l'œil, même averti.
- **La peinture ne dit rien de la structure.** Seul un examen de la caisse (longerons, soudures, plis) permet de juger s'il y a eu un choc sérieux.

Posez la question au vendeur : quand, pourquoi et par qui la voiture a-t-elle été repeinte ? Demandez les factures. Une réponse floue est une information en soi.

## Quand demander une inspection

Dès que vous repérez une différence de teinte, des jeux inégaux ou des traces de peinture, faites inspecter le véhicule avant de vous engager. Une inspection indépendante mesure l'épaisseur de peinture, examine la structure et consigne les constats dans un rapport écrit.
$body$,
  'MALLOULIAUTO'
),
(
  'Vérifier les papiers d''une voiture d''occasion',
  'verifier-papiers-voiture-occasion',
  'documents',
  'draft',
  'Carte grise, numéro de châssis, vendeur, kilométrage : les points à vérifier avant de payer, et ce que les papiers ne peuvent pas vous dire.',
  $body$Les papiers établissent l'identité et la situation administrative d'un véhicule. Les vérifier avant de payer évite les mauvaises surprises les plus coûteuses.

## Ce que vous pouvez contrôler vous-même

**1. La carte grise.** Demandez l'original et lisez-la en entier : marque, modèle, couleur, numéro d'immatriculation, numéro de châssis. Tout doit correspondre au véhicule que vous avez devant vous. Méfiez-vous d'un document raturé, surchargé ou qui semble photocopié.

**2. Le numéro de châssis.** Repérez-le sur la voiture (en général à la base du pare-brise côté conducteur, sur le montant de porte ou sous le capot) et comparez-le, caractère par caractère, avec celui de la carte grise. Un numéro illisible, repris à la main ou différent est un motif suffisant pour renoncer ou pour demander un avis professionnel.

**3. Le vendeur.** Le nom sur la carte grise doit être celui de la personne qui vend, ou celui d'une personne qui peut prouver qu'elle agit pour elle. Si le vendeur n'est pas le titulaire, demandez une explication et des justificatifs avant d'aller plus loin.

**4. La situation du véhicule.** Renseignez-vous auprès des services compétents pour savoir si le véhicule est grevé d'un gage ou d'une opposition. Ne payez rien avant d'avoir cette réponse.

**5. Le kilométrage.** Comparez le compteur avec l'usure du volant, des pédales, du siège conducteur et des pneus, et avec les factures d'entretien ou de contrôle technique. Un kilométrage très bas sur un véhicule très usé est incohérent.

**6. L'historique d'entretien.** Demandez les factures, le carnet d'entretien et les comptes rendus de contrôle. Ils montrent comment la voiture a été suivie, et à quel kilométrage.

**7. Le contrat de vente.** Faites un écrit qui nomme les deux parties, décrit le véhicule (numéro de châssis compris), indique le prix, la date et les engagements du vendeur. Gardez des copies de tous les documents.

## Ce que ce contrôle ne dit pas

- Des papiers en règle ne disent **rien sur l'état** de la voiture : mécanique, carrosserie, pneus et freins restent à contrôler.
- Vous ne pouvez pas toujours juger de l'authenticité d'un document à l'œil. En cas de doute, la vérification auprès des services officiels fait foi.
- Un kilométrage affiché peut être modifié : la cohérence avec l'usure et les justificatifs est un indice, pas une preuve.
- Ce guide n'est pas un avis juridique. Pour une démarche précise, renseignez-vous auprès des autorités compétentes.

## Quand demander une inspection

Une fois les papiers contrôlés, l'état du véhicule reste à vérifier. Une inspection indépendante examine la voiture elle-même et vous remet un rapport écrit que vous pouvez conserver et montrer.
$body$,
  'MALLOULIAUTO'
)
on conflict (slug) do nothing;
