/**
 * Faits d'inspection publiés sur le site — copiés depuis la taxonomie produit,
 * seule source faisant foi pour les faits produit :
 * C:\Work\malloulinova\mallouliauto\apps\packages\certification\src\taxonomy.ts
 *
 * Valeurs recalculées le 3 oct. 2026 en exécutant la taxonomie (tsx), pas
 * estimées : ELEMENTS.length = 131, FAMILLES.length = 5 (21 sous-familles),
 * GRAVITE_LEVELS = 3 niveaux (« Critique » abandonnée par décision produit de
 * sept. 2026). Les 6 liquides (NIVEAUX_FLUIDES_ELEMENTS) sont une liste à part
 * et ne sont pas comptés dans les points.
 *
 * Ne jamais modifier un chiffre ici sans le revérifier contre taxonomy.ts.
 * Historique : 96 points, 10 instruments, 6 familles (sans source) ; puis
 * 128 points et 4 niveaux de gravité (taxonomie du 22 sept. 2026).
 *
 * Instruments : liste fournie par le fondateur le 3 oct. 2026 (matériel réel).
 * Elle ne correspond pas à MATERIEL_CATALOGUE du produit (13 entrées, dont
 * « Tablette » et « Connexion internet », sans analyseur de gaz ni
 * compressiomètres) : catalogue produit à réaligner. Multimètre ajouté le
 * 3 oct. 2026 (oubli de la liste initiale, confirmé par le fondateur). Le site distingue les
 * instruments de contrôle (comptés) des équipements (cités, non comptés).
 */

/** ELEMENTS.length — périmètre « Complet » (PACKS.COMPLET = tous les éléments). */
export const TOTAL_POINTS = 131;

/**
 * FAMILLES — noms et sous-familles repris littéralement de taxonomy.ts.
 * Pas de compteur par famille ici : « Niveaux, liquides et batterie » ne porte
 * qu'un élément dans ELEMENTS (les fluides sont une liste séparée), un compteur
 * par famille donnerait donc une image fausse de la couverture.
 */
export const FAMILLES = [
  {
    nom: 'Diagnostic électronique',
    sousFamilles: ['Cohérence kilométrique', 'Codes défaut', 'Système électronique'],
  },
  {
    nom: 'Enveloppe extérieure',
    sousFamilles: ['Châssis', 'Carrosserie et tôlerie', 'Vitrage'],
  },
  {
    nom: 'Motopropulseur',
    sousFamilles: ['Moteur', 'Transmission', 'Train roulant'],
  },
  {
    nom: 'Niveaux, liquides et batterie',
    sousFamilles: ['Niveaux et liquides', 'Batterie'],
  },
  {
    nom: 'Confort et sécurité',
    sousFamilles: [
      'Optiques, éclairage et signalisation',
      "Conditionnement d'air",
      'Essuie-glace',
      'Airbag',
      'Ceintures de sécurité',
      'Rétroviseurs',
      'Audio, multimédia et communication',
      'Équipements et accessoires intérieurs',
      'Équipements de sécurité et de dépannage',
      'Accès, démarrage et antivol',
    ],
  },
];

/**
 * Instruments de contrôle (mesure, test, diagnostic) — liste du fondateur,
 * 3 oct. 2026. Ce sont eux que compte TOTAL_INSTRUMENTS.
 */
export const INSTRUMENTS = [
  'Appareil de diagnostic',
  'Oscilloscope',
  "Détecteur d'épaisseur de peinture",
  "Jauge d'usure des pneus",
  'Testeur de batterie et de système de charge',
  'Testeur de liquide de frein',
  "Testeur de qualité d'huile moteur",
  "Kit de mesure de pression d'huile",
  'Testeur de circuit de refroidissement (radiateur)',
  'Testeur de qualité de froid de climatisation',
  'Compressiomètre essence',
  'Compressiomètre diesel',
  'Analyseur de gaz',
  'Opacimètre',
  'Multimètre',
  'Stéthoscope mécanique',
  'Pompe à vide',
  "Caméra d'inspection (écran TFT/LCD)",
];

/** Équipements d'atelier, cités mais pas comptés comme instruments. */
export const EQUIPEMENTS = [
  'Élévateur de voiture amovible',
  'Bloc volant',
  'Torche',
  'Caisse à outils',
  'Chariot garagiste',
];

export const TOTAL_INSTRUMENTS = INSTRUMENTS.length;

/**
 * GRAVITE_LEVELS. « Sans objet » est un état de saisie interne, ajouté au
 * sélecteur de l'outil terrain — jamais une gravité de constat côté rapport
 * client : un point sans objet n'apparaît pas, il ne porte pas de badge.
 */
export const GRAVITE_LEVELS = ['Mineure', 'Modérée', 'Majeure'];

/**
 * INSPECTION_PURPOSE_LABELS (schema.ts) — l'objet de l'inspection, déclaré sur
 * chaque rapport. C'est la seule segmentation que le produit connaisse
 * réellement : un rapport unique, dont l'objet change. « Autre » (champ libre)
 * n'est pas affiché ici.
 */
export const OBJETS_INSPECTION = [
  {
    label: 'Achat / Vente',
    body: "Documenter l'état réel avant une transaction, et chiffrer ce qu'il faudra reprendre. Le vendeur peut le remettre, l'acheteur peut le vérifier.",
  },
  {
    label: 'Avant réparation',
    body: "Constater l'état du véhicule à l'entrée de l'atelier, avec photos horodatées — ce qui était déjà là avant l'intervention.",
  },
  {
    label: 'Après réparation',
    body: "Documenter l'état à la restitution. Deux rapports encadrent l'intervention et rendent le désaccord vérifiable plutôt qu'invérifiable.",
  },
  {
    label: 'Préventive',
    body: "Faire le point sur un véhicule qu'on garde : ce qui est conforme, ce qui s'use, ce qu'il faudra budgéter.",
  },
  {
    label: 'Visite technique',
    body: 'Préparer le passage au contrôle technique en identifiant à l’avance les points qui le feraient échouer.',
  },
  {
    label: 'Après accident / Expertise',
    body: "Structurer le constat d'un véhicule accidenté : constats localisés, gravité, chiffrage, dossier vérifiable par les deux parties.",
  },
];

/**
 * PACK_LABELS — périmètres de certification réellement vendables. Le total de
 * 131 points ne vaut que pour « Complet ».
 */
export const PERIMETRES = [
  'Diagnostic électronique',
  'Niveaux, liquides et batterie',
  'Enveloppe extérieure',
  'Motopropulseur',
  'Confort et sécurité',
  'Complet',
  'Personnalisé',
];
