/**
 * Rapport de démonstration, source unique de l'aperçu de l'accueil (ReportPreview) et de la
 * page /exemple-de-rapport (docs/specs/2026-10-refonte-accueil.md §7).
 *
 * Origine : le diagnostic de démonstration fait le 11 oct. 2026 par la plateforme sur le
 * véhicule de l'équipe (certificat MA-2026-Z68HQ6, 7 pages). Ce n'est PAS le rapport d'un
 * client : la société est pré-commerciale (règle posée le 22 sept. 2026 : jamais « certificat
 * réel », jamais le nom d'une personne identifiable). La page est étiquetée « Exemple de
 * rapport ».
 *
 * Écarts voulus par rapport au rapport d'origine : des retraits, aucune valeur ajoutée ni
 * modifiée.
 * - VIN et plaque masqués (VIN : seul l'indicatif constructeur reste) ; plaques floutées sur
 *   les photos, y compris celle d'un véhicule tiers ;
 * - nom, téléphone et e-mail du client affichés « Masqué » ; opérateur affiché « Inspecteur
 *   MALLOULIAUTO » ;
 * - photos de la carte grise (un spécimen français), du carnet d'entretien (image d'illustration)
 *   et de la plaque VIN remplacées par « Masqué dans l'exemple » (PHOTO_SLOTS) ;
 * - « Câble de charge » et « Prise de charge », sans objet sur un diesel, retirés des
 *   éléments contrôlés et des mesures de peinture ;
 * - QR code décoratif : le vrai mène au rapport en ligne, qui porte les coordonnées du client.
 *
 * Gardés tels quels, y compris leurs défauts (décision du 17 oct. 2026 : publier tel quel) :
 * peinture à 120 µm partout, relevés de pneus sans côté, synthèse « côté gauche ».
 */

export const SAMPLE_REPORT_PATH = '/exemple-de-rapport';
export const SAMPLE_PHOTO_DIR = '/images/sample-report';

export const CERTIFICATE = 'MA-2026-Z68HQ6';
export const INSPECTION_DATE = '11 octobre 2026';
export const PAGES_COUNT = 7;

export const VEHICLE = {
  title: '2023 Volkswagen Tiguan',
  // Indicatif constructeur (WVG = Volkswagen) seulement.
  vin: 'WVG' + '•'.repeat(14),
  plate: 'masquée',
  specs: [
    { label: 'Kilométrage', value: '35 502 km' },
    { label: 'Carburant', value: 'Diesel' },
    { label: 'Transmission', value: 'Automatique' },
    { label: 'Couleur', value: 'Gris' },
    { label: 'Puissance fiscale', value: '10 CV' },
    { label: 'Puissance moteur', value: '200 ch DIN' },
  ],
};

/** Constats par famille, dans l'ordre du rapport. */
export const FAMILIES = [
  { name: 'Niveaux, liquides et batterie', count: 0 },
  { name: 'Motopropulseur', count: 0 },
  { name: 'Diagnostic électronique', count: 1 },
  { name: 'Enveloppe extérieure', count: 5 },
  { name: 'Confort et sécurité', count: 1 },
];

export const TOTAL_REPAIRS_TND = 910;
export const PRICED_FINDINGS = 6;

/**
 * Bloc « Prix le plus probable » du rapport, placé juste sous le total des réparations comme
 * dans le produit (ma-inspector : ReportDocument.tsx, wording dans valuationBlockText). Ce n'est
 * pas de l'IA : une équation (prix neuf du modèle, âge, kilométrage) × l'indice de marché, moins
 * les réparations chiffrées, texte entièrement modélisé.
 *
 * Chiffres calculés le 17 oct. 2026 avec la fonction du produit (evaluateInspectionValuation) :
 * équation v1 ajustée le 2026-10-08, indice de marché 1,0000, Volkswagen Tiguan à 154 980 TND
 * neuf (prix officiel, fiable), année 2023, 35 502 km, 910 TND de réparations. La même fonction,
 * sans réparations, donne exactement ce qu'affiche l'aperçu de l'application ce jour-là
 * (115 500 TND ; 102 000 à 130 500). Le résultat bouge un peu avec la date (l'âge entre dans
 * l'équation) : à mettre à jour avec les trois nombres ci-dessous quand le diagnostic de
 * démonstration est refinalisé avec l'estimation activée.
 */
export const VALUATION = {
  title: 'Prix le plus probable',
  headlineTnd: 114500,
  lowTnd: 101000,
  highTnd: 129500,
  note: "Estimation basée sur les prix affichés dans les annonces, pas sur les prix de vente réels. Le prix de vente final est souvent un peu plus bas, de l'ordre de 2\u00a0à\u00a06\u00a0%.",
};

export const SYNTHESIS =
  "Véhicule en bon état général. Kilométrage cohérent sur tous les calculateurs, peinture d'origine sur l'ensemble des éléments mesurés. Dommages carrosserie mineurs côté gauche. Une fissure du pare-brise est à traiter avant la vente. Un code FAP est mémorisé, non actif : à vérifier après régénération.";

/** Constats chiffrés. `costLines` : le détail du coût estimé (page 7 du rapport). */
export const FINDINGS = [
  {
    number: 1,
    family: 'Confort et sécurité',
    item: 'Planche de bord',
    severity: 'Mineure',
    detail: 'Panneau de coffre, rayure légère',
    priceTnd: 10,
    photo: 'constat-1',
    costLines: [{ label: 'Coût global (non détaillé)', priceTnd: 10 }],
  },
  {
    number: 2,
    family: 'Enveloppe extérieure',
    item: 'Pare-brise',
    severity: 'Modérée',
    detail: 'Fissure 1 cm, champ de vision conducteur',
    priceTnd: 200,
    photo: 'constat-2',
    costLines: [{ label: 'Coût global (non détaillé)', priceTnd: 200 }],
  },
  {
    number: 3,
    family: 'Enveloppe extérieure',
    item: 'Pare-chocs avant',
    severity: 'Mineure',
    detail: 'Rayure profonde, 10 cm',
    priceTnd: 250,
    photo: 'constat-3',
    costLines: [{ label: "Main d'œuvre : peinture", priceTnd: 250 }],
  },
  {
    number: 4,
    family: 'Enveloppe extérieure',
    item: 'Porte arrière gauche',
    severity: 'Mineure',
    detail: 'Rayure profonde, 1 cm',
    priceTnd: 100,
    photo: 'constat-4',
    costLines: [{ label: "Main d'œuvre : dressage", priceTnd: 100 }],
  },
  {
    number: 5,
    family: 'Enveloppe extérieure',
    item: 'Aile arrière gauche',
    severity: 'Mineure',
    detail: 'Rayure profonde sur tôle et baguette de passage de roue',
    priceTnd: 100,
    photo: 'constat-5',
    costLines: [
      { label: "Main d'œuvre : dressage", priceTnd: 80 },
      { label: 'Matériels : peinture', priceTnd: 20 },
    ],
  },
  {
    number: 6,
    family: 'Enveloppe extérieure',
    item: 'Aile avant droite',
    severity: 'Mineure',
    detail: 'Bosse profonde, 10 cm',
    priceTnd: 250,
    photo: 'constat-6',
    costLines: [
      { label: "Main d'œuvre : dressage", priceTnd: 200 },
      { label: 'Matériels : peinture', priceTnd: 50 },
    ],
  },
];

/** Diagnostic électronique : cohérence du kilométrage et code défaut. */
export const MILEAGE_READINGS = [
  { source: 'Tableau de bord', km: '35 502 km' },
  { source: 'Calculateur moteur', km: '35 502 km' },
];
export const MILEAGE_GAP = '0 km';

export const FAULT_CODES = [
  {
    source: 'Calculateur moteur',
    code: 'P2002',
    meaning: 'efficacité du filtre à particules sous le seuil (banc 1)',
    severity: 'Modérée',
  },
];

/** Éléments contrôlés sans rien à signaler, et éléments non équipés, par famille. */
export const CHECKED = {
  'Confort et sécurité': {
    ok: [
      'Cric',
      'Tapis',
      'Sièges',
      'Antenne',
      'Feu stop (3e feu)',
      'Horloge',
      'Autoradio / multimédia',
      'Navigation / GPS',
      'Optique droite',
      'Optique gauche',
      'Réflecteurs',
      'Voyant airbag',
      'Anti-démarrage',
      'Panneaux de porte',
      'Ceintures avant',
      'Airbags frontaux',
      'Airbags latéraux / rideaux',
      'Clignotant droit',
      'Feu arrière droit',
      'Ceintures arrière',
      'Clé de roue / manivelle',
      'Clignotant gauche',
      'Contact',
      'Essuie-glace avant',
      'Feu arrière gauche',
      'Rétroviseur droit',
      'Fermeture centrale',
      'Rétroviseur gauche',
      "Conditionnement d'air",
      'Essuie-glace arrière',
      "Feu d'immatriculation",
      'Allume-cigare / prise 12 V',
      'Rétroviseur intérieur',
      'Feu antibrouillard avant',
      'Feu antibrouillard arrière',
    ],
  },
  'Diagnostic électronique': {
    ok: ['Commodos', 'Câblage et connecteurs', 'Voyants du tableau de bord'],
    absent: ['Gestion électronique', 'Électronique de puissance'],
  },
  'Niveaux, liquides et batterie': {
    ok: [
      'Huile moteur',
      'Liquide de frein',
      'Batterie',
      'Liquide lave-glace',
      'Liquide de refroidissement (eau)',
      'Liquide de boîte automatique (ATF)',
      'Liquide de direction assistée',
    ],
  },
  Motopropulseur: {
    ok: [
      'Cardans',
      'Étriers',
      'Allumage',
      'Tambours',
      'Courroies',
      'Embrayage',
      'Servofrein',
      'Crémaillère',
      'Échappement',
      'Pont arrière',
      "Admission d'air",
      'Différentiel',
      'Disques de frein',
      'Motorisation',
      'Boîte de vitesses',
      'Lubrification',
      'Roulement de roue',
      'Boîte de transfert',
      'Berceau moteur',
      'Maître-cylindre',
      'Roue, pneu et enjoliveur avant droit',
      'Plaquettes de frein',
      'Refroidissement',
      'Roue, pneu et enjoliveur avant gauche',
      'Silentbloc droit',
      'Volant de direction',
      'Amortisseur droit',
      'Colonne de direction',
      'Roue, pneu et enjoliveur arrière droit',
      'Silentbloc gauche',
      'Divers accessoires',
      'Amortisseur gauche',
      'Bras / barre stabilisatrice',
      'Roue, pneu et enjoliveur arrière gauche',
      'Bras de suspension droit',
      'Bras de suspension gauche',
      'Alimentation carburant',
      'Fonctionnement du freinage',
      'Biellette de barre stabilisatrice droite',
      'Biellette de barre stabilisatrice gauche',
    ],
    absent: ['Roue de secours'],
  },
  'Enveloppe extérieure': {
    ok: [
      'Toit',
      'Capot',
      'Coffre',
      'Hayon / malle',
      'Toit ouvrant ou panoramique',
      'Custode droite',
      'Custode gauche',
      'Montant A droit',
      'Montant B droit',
      'Montant C droit',
      'Montant D droit',
      'Lunette arrière',
      'Montant A gauche',
      'Montant B gauche',
      'Montant C gauche',
      'Montant D gauche',
      'Aile avant gauche',
      'Porte avant droite',
      'Trappe de carburant',
      'Aile arrière droite',
      'Ancrage de cric droit',
      'Pare-chocs arrière',
      'Porte avant gauche',
      'Ancrage de cric gauche',
      'Porte arrière droite',
      'Vitre porte avant droite',
      'Vitre porte avant gauche',
      'Vitre porte arrière droite',
      'Point de levage avant droit',
      'Vitre porte arrière gauche',
      'Point de levage avant gauche',
      'Point de levage arrière droit',
      'Bas de caisse et marche-pied droit',
      'Point de levage arrière gauche',
      'Bas de caisse et marche-pied gauche',
      'Longeron droit',
      'Longeron gauche',
      'Passage de roue avant droit',
      'Passage de roue avant gauche',
      'Passage de roue arrière droit',
      'Passage de roue arrière gauche',
    ],
  },
};

export const TRACEABILITY = [
  { label: 'Organisme certificateur', value: 'MALLOULIAUTO' },
  { label: "Date d'inspection", value: INSPECTION_DATE },
  { label: "Lieu d'inspection", value: 'Atelier nord' },
  { label: 'Opérateur', value: 'Inspecteur MALLOULIAUTO' },
  { label: "Durée de l'inspection", value: '17 min 46 s' },
  { label: 'Terminée le', value: '11 octobre 2026 à 20:49' },
];

export const EQUIPMENT_USED = [
  'Multimètre',
  'Testeur de qualité de froid de climatisation',
  'Testeur de liquide de frein',
  'Tablette',
  'Connexion internet',
  'Lecteur de défauts',
  'Jauge de profondeur de sculpture des pneus',
  'Testeur de batterie et de système de charge',
  'Pont élévateur',
  "Caméra d'inspection",
];

/** Contexte de l'inspection, sans les coordonnées du client. */
export const CONTEXT = [
  { label: "Objet de l'inspection", value: 'Achat / Vente' },
  { label: 'Niveau de démontage', value: 'Aucun démontage' },
  { label: 'Immatriculé dans le pays', value: 'Oui' },
  { label: 'Soumis au contrôle technique', value: 'Oui' },
  { label: 'Prochain contrôle technique', value: '1 avril 2028' },
  { label: 'Niveau de carburant', value: '1/4' },
  { label: "Précision de l'estimation", value: 'Approximative' },
];

// ─── Structure complète du rapport (pour reproduire le rapport d'origine section par section) ───

/** Référence imprimée en pied de chaque page du rapport. */
export const REPORT_REF = 'MAL-INSP-514DDF1A';

/** Les familles, dans l'ordre où le rapport les présente. */
export const FAMILY_SECTIONS = [
  'Confort et sécurité',
  'Diagnostic électronique',
  'Niveaux, liquides et batterie',
  'Motopropulseur',
  'Enveloppe extérieure',
];

/**
 * Les 15 emplacements de photos d'identification, dans l'ordre du rapport.
 * state : 'photo' (affichée), 'missing' (« Manquante » dans le rapport d'origine), 'withheld'
 * (retirée de l'exemple : papiers et plaque VIN).
 */
export const PHOTO_SLOTS = [
  { label: 'Coin avant gauche', state: 'photo', file: 'coin-avant-gauche' },
  { label: 'Coin avant droit', state: 'photo', file: 'coin-avant-droit' },
  { label: 'Coin arrière gauche', state: 'photo', file: 'coin-arriere-gauche' },
  { label: 'Coin arrière droit', state: 'photo', file: 'coin-arriere-droit' },
  { label: 'Face avant', state: 'photo', file: 'face-avant' },
  { label: 'Face arrière', state: 'photo', file: 'face-arriere' },
  { label: 'Face (côté) gauche', state: 'photo', file: 'cote-gauche' },
  { label: 'Face (côté) droite', state: 'photo', file: 'cote-droit' },
  { label: 'Pare-brise', state: 'photo', file: 'pare-brise' },
  { label: 'Sièges avant et tableau de bord', state: 'photo', file: 'habitacle' },
  { label: 'Sièges arrière', state: 'missing' },
  { label: 'Plaque VIN', state: 'withheld' },
  { label: 'Compteur / tableau de bord', state: 'photo', file: 'compteur' },
  { label: 'Carte grise', state: 'withheld' },
  { label: "Carnet d'entretien", state: 'withheld' },
];
/** Photos fournies dans le rapport d'origine (14 sur 15 : « Sièges arrière » manque). */
export const PHOTOS_PROVIDED = 14;

/** Libellé complet du code défaut, tel qu'imprimé dans le tableau « Codes défaut ». */
export const FAULT_CODE_FULL =
  'P2002 - efficacité du filtre à particules sous le seuil (banc 1), calculateur moteur, gravité Mineure';

/**
 * Tableaux « Mesures - <famille> », dans l'ordre du rapport. Un élément peut porter plusieurs
 * mesures (liquide de frein, batterie) : elles s'affichent l'une sous l'autre.
 * `columns` : les colonnes du rapport (« État » n'existe pas pour les niveaux et la batterie).
 */
const paintRows = [
  'Pare-chocs avant',
  'Capot',
  'Montant A gauche',
  'Aile avant gauche',
  'Porte avant gauche',
  'Montant B gauche',
  'Bas de caisse et marche-pied',
  'Point de levage avant gauche',
  'Porte arrière gauche',
  'Montant C gauche',
  'Point de levage arrière gauche',
  'Ancrage de cric gauche',
  'Aile arrière gauche',
  'Montant D gauche',
  'Hayon / malle',
  'Coffre',
  'Pare-chocs arrière',
  'Aile arrière droite',
  'Montant D droit',
  'Porte arrière droite',
  'Montant C droit',
  'Point de levage arrière droit',
  'Ancrage de cric droit',
  'Porte avant droite',
  'Montant B droit',
  'Bas de caisse et marche-pied droit',
  'Point de levage avant droit',
  'Montant A droit',
  'Aile avant droite',
  'Trappe de carburant',
  'Toit',
].map((element) => ({
  element,
  lines: [{ measure: 'Épaisseur de peinture', value: '120 µm', state: 'Origine' }],
}));

export const MEASURE_TABLES = [
  {
    family: 'Confort et sécurité',
    columns: ['Élément', 'Mesure', 'Valeur', 'État'],
    rows: [
      {
        element: "Conditionnement d'air",
        lines: [{ measure: 'Test froid climatiseur', value: '8 °C', state: 'Conforme' }],
      },
    ],
  },
  {
    family: 'Niveaux, liquides et batterie',
    columns: ['Élément', 'Mesure', 'Valeur'],
    rows: [
      { element: 'Huile moteur', lines: [{ measure: 'Niveau', value: 'Correct' }] },
      {
        element: 'Liquide de refroidissement (eau)',
        lines: [{ measure: 'Niveau', value: 'Correct' }],
      },
      { element: 'Liquide lave-glace', lines: [{ measure: 'Niveau', value: 'À compléter' }] },
      {
        element: 'Liquide de frein',
        lines: [
          { measure: 'Niveau', value: 'Correct' },
          { measure: 'Humidité', value: 'Normale' },
        ],
      },
      {
        element: 'Liquide de direction assistée',
        lines: [{ measure: 'Niveau', value: 'Correct' }],
      },
      {
        element: 'Liquide de boîte automatique (ATF)',
        lines: [{ measure: 'Niveau', value: 'Correct' }],
      },
      {
        element: 'Batterie',
        lines: [
          { measure: 'Tension à vide', value: '12 V' },
          { measure: 'Tension au démarrage', value: '11 V' },
          { measure: 'Tension au ralenti', value: '13 V' },
          { measure: "Tension à l'accélération", value: '14 V' },
          { measure: 'State of Health (SOH)', value: '90 %' },
          { measure: 'State of Charge (SOC)', value: '60 %' },
          { measure: 'Résistance des plaques', value: '20 mΩ' },
        ],
      },
    ],
  },
  {
    family: 'Motopropulseur',
    columns: ['Élément', 'Mesure', 'Valeur', 'État'],
    rows: [
      ['avant', '6,5 mm'],
      ['arrière', '6,5 mm'],
      ['avant', '7 mm'],
      ['arrière', '7 mm'],
    ].map(([axle, value]) => ({
      element: `Roue, pneu et enjoliveur ${axle}`,
      lines: [{ measure: 'Profondeur de sculpture', value, state: 'Bon état' }],
    })),
  },
  {
    family: 'Enveloppe extérieure',
    columns: ['Élément', 'Mesure', 'Valeur', 'État'],
    rows: paintRows,
  },
];
