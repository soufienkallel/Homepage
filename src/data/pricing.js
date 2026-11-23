/**
 * Tarifs publics du diagnostic — seul endroit du site (et des agents) où un prix
 * est écrit. Décisions du fondateur :
 *
 * - 1–2 oct. 2026 (docs/specs/2026-10-tarifs.md) : prix d'appel de 250 TND TTC,
 *   déplacement inclus dans le Grand Tunis et dans tout le gouvernorat de Sfax,
 *   ailleurs frais selon la zone annoncés avant confirmation, professionnels sur devis ;
 * - 16 oct. 2026 (docs/specs/2026-10-refonte-accueil.md) : grille publique par
 *   catégorie et énergie (PRICE_GRID), paiement après le diagnostic, les centres
 *   partenaires fixent leurs propres tarifs.
 *
 * La grille vaut pour le diagnostic complet avant achat ou vente, réalisé par
 * MALLOULIAUTO. Des périmètres partiels existent (PERIMETRES, inspectionFacts.js) et
 * ne sont pas tarifés ici.
 */

/**
 * Grille publique, en TND TTC : une formule nommée par ligne (`name`, 17 oct. 2026 : le
 * fondateur veut des tarifs détaillés et nommés, comme les formules d'Evalveo).
 * `energy` et `category` restent les clés lues par les agents (system-prompt-text.ts) et la
 * FAQ de l'accueil. `examples` : modèles courants donnés comme repères, pas une liste fermée :
 * la catégorie du véhicule est confirmée avant le rendez-vous. `extra` : ce que la formule
 * ajoute au protocole commun. `available: false` = affiché « Bientôt » et pas encore vendu :
 * le diagnostic électrique attend l'équipement de contrôle de la batterie haute tension
 * (décision du 16 oct. 2026).
 */
export const PRICE_GRID = [
  {
    name: 'Diagnostic Citadine',
    energy: 'Thermique',
    category: 'Citadine',
    priceTnd: 250,
    available: true,
    examples: ['Peugeot 208', 'Renault Clio', 'Citroën C3', 'Volkswagen Polo', 'Kia Picanto'],
  },
  {
    name: 'Diagnostic Berline & SUV',
    energy: 'Thermique',
    category: 'Berline · SUV',
    priceTnd: 279,
    available: true,
    examples: [
      'Volkswagen Golf',
      'Peugeot 308',
      'Renault Mégane',
      'Dacia Duster',
      'Volkswagen Tiguan',
    ],
  },
  {
    name: 'Diagnostic Premium',
    energy: 'Thermique',
    category: 'Premium',
    priceTnd: 350,
    available: true,
    examples: ['BMW Série 3', 'Mercedes Classe C', 'Audi A4', 'Audi Q5', 'Volvo XC60'],
  },
  {
    name: 'Diagnostic Hybride',
    energy: 'Hybride',
    category: 'Toutes catégories',
    priceTnd: 300,
    available: true,
    examples: ['Toyota Yaris Hybrid', 'Toyota C-HR', 'Kia Niro', 'Hyundai Tucson Hybrid'],
  },
  {
    name: 'Diagnostic Électrique',
    energy: 'Électrique',
    category: 'Batterie haute tension contrôlée',
    priceTnd: 370,
    available: false,
    examples: ['Renault Zoe', 'Peugeot e-208', 'Tesla Model 3', 'Kia EV6'],
    extra: 'Contrôle de la batterie haute tension',
  },
];

/**
 * Offre professionnels, affichée comme une sixième carte de la grille mais hors de PRICE_GRID :
 * elle n'a pas de montant (sur devis), et PRICE_GRID alimente les prix publiés, le prix d'appel
 * et le garde-fou des agents. Contenu repris de /professionnels (décision du 16 oct. 2026).
 */
export const PRO_OFFER = {
  name: 'Diagnostic Pro',
  audience: 'Showrooms, revendeurs, loueurs, gestionnaires de flotte',
  priceLabel: 'Sur devis',
  details: [
    'Le même protocole et le même rapport que pour un particulier',
    'Sur place, dans votre showroom : 30 à 60 minutes par voiture',
    "Une référence et un QR par voiture, à afficher sur l'annonce",
    'Le prix le plus probable de chaque voiture, pour fixer votre prix',
  ],
  quoteLink: '/contact?type=professionnel',
};

/** Every amount the site publishes; the agents' guardrail allows these and no other. */
export const PUBLIC_PRICES_TND = PRICE_GRID.map((row) => row.priceTnd);

export const BASE_PRICE_TND = Math.min(...PUBLIC_PRICES_TND);

/** « 250 TND TTC » — le montant tel qu'il s'affiche partout. */
export const BASE_PRICE_LABEL = `${BASE_PRICE_TND} TND TTC`;

/** « à partir de 250 TND TTC », en milieu de phrase (prompts des agents). */
export const PRICE_FROM_INLINE = `à partir de ${BASE_PRICE_LABEL}`;

/** Quand le client paie (décision du 16 oct. 2026). */
export const PAYMENT_RULE = 'Payé après le diagnostic';

/** Cas de base auquel correspond le prix d'appel. */
export const BASE_CASE = {
  vehicle: 'Citadine',
  purpose: 'Avant achat',
  travel: 'Grand Tunis, Sfax',
};

export const TRAVEL_ZONES_INCLUDED = [
  { name: 'Grand Tunis', detail: 'Tunis, Ariana, Ben Arous, Manouba' },
  { name: 'Gouvernorat de Sfax', detail: null },
];

/** Formulation courte des zones incluses, reprise dans les phrases. */
export const TRAVEL_INCLUDED_SHORT = 'le Grand Tunis et le gouvernorat de Sfax';

export const TRAVEL_OTHER_ZONES = 'Frais selon la zone, annoncés avant confirmation';

/** Ce qui fixe le prix (le montant vient de PRICE_GRID). */
export const PRICE_FACTORS = [
  {
    key: 'Véhicule',
    body: 'La catégorie pour un véhicule thermique, un prix unique pour un hybride ou un électrique.',
  },
  {
    key: 'Objet du diagnostic',
    body: 'La grille correspond à un diagnostic avant achat ou vente. Pour un autre objet (avant ou après réparation, préventif, visite technique), le prix vous est annoncé au rappel.',
  },
  {
    key: 'Lieu',
    body: `Déplacement inclus dans ${TRAVEL_INCLUDED_SHORT}. Ailleurs, des frais s'ajoutent selon la zone.`,
  },
];

/**
 * Questions de la page /tarifs (accordéon et FAQPage JSON-LD). « Le prix ne dépend
 * pas des défauts trouvés » est un engagement commercial confirmé par le fondateur le
 * 2 oct. 2026 ; le paiement après le diagnostic, le 16 oct. 2026.
 */
export const PRICING_FAQ = [
  {
    q: 'Quand est-ce que je paie ?',
    a: "Après le diagnostic, une fois le rapport remis. Rien n'est demandé à l'envoi de la demande.",
  },
  {
    q: 'Le prix change-t-il si le diagnostic trouve beaucoup de défauts ?',
    a: "Non. Le prix est fixé avant le rendez-vous, d'après le véhicule, l'objet du diagnostic et le lieu. Il ne dépend pas de ce que le diagnostic constate.",
  },
  {
    q: 'Dans quelle formule se trouve ma voiture ?',
    a: 'Les modèles cités sont des repères, pas une liste fermée. Indiquez la marque et le modèle dans votre demande : la formule et le prix vous sont confirmés avant le rendez-vous.',
  },
  {
    q: 'Le prix est-il le même dans un centre partenaire ?',
    a: 'Non. Nos centres partenaires fixent leurs propres tarifs. Les prix de cette page sont ceux des diagnostics réalisés par MALLOULIAUTO.',
  },
];
