import { TOTAL_POINTS, TOTAL_INSTRUMENTS, GRAVITE_LEVELS } from './inspectionFacts';

/**
 * Capacités de la plateforme, et leur statut réel. Seule source pour la
 * section « La plateforme » de la homepage (TechnologyTrust) et pour la page
 * /technology — un statut ne peut donc jamais différer entre les deux.
 *
 * Deux axes indépendants (décision du fondateur, 24 sept. 2026) :
 *  - `maturity` : où en est la capacité elle-même.
 *  - `integration` : si elle alimente le rapport certifié. Le rapport fait
 *    foi ; un module peut tourner (prototype) sans y entrer.
 * Le module vision est un prototype qui fonctionne, mais hors rapport : il
 * n'est pas encore intégré à MA-Inspector. Aujourd'hui, le constat, la gravité
 * et le coût du rapport sont produits par l'opérateur.
 *
 * Un statut ne change ici qu'une fois le critère de performance documenté
 * atteint, et la dataroom mise à jour en conséquence.
 */

export const MATURITY = {
  DISPONIBLE: 'Disponible',
  PROTOTYPE: 'Prototype',
  EN_DEVELOPPEMENT: 'En développement',
};

export const INTEGRATION = {
  AU_RAPPORT: 'Au rapport',
  HORS_RAPPORT: 'Hors rapport',
  ASSISTE: 'Assisté',
  AUTOMATISE: 'Automatisé',
};

/**
 * `summary` : affichée dans la section de la homepage (qui renvoie vers
 * /technology pour le reste).
 * `source` : où l'affirmation a été vérifiée ou reprise.
 */
export const CAPABILITIES = [
  {
    id: 'protocole',
    title: 'Un protocole encodé, pas une mémoire',
    shortTitle: 'Protocole encodé',
    body: `L'inspecteur suit une séquence fixe sur tablette. Les ${TOTAL_POINTS} points et leur classification sont dans le système, pas dans sa tête.`,
    maturity: MATURITY.DISPONIBLE,
    integration: INTEGRATION.AU_RAPPORT,
    summary: true,
    source: 'taxonomy.ts (ELEMENTS), via inspectionFacts.js',
  },
  {
    id: 'instruments',
    title: `${TOTAL_INSTRUMENTS} instruments, un seul dossier`,
    shortTitle: `${TOTAL_INSTRUMENTS} instruments`,
    body: 'Lecteur de défauts, jauge de peinture, jauge de sculpture, testeurs : chaque relevé est rattaché au véhicule et horodaté dans le rapport, avec le matériel nommé.',
    maturity: MATURITY.DISPONIBLE,
    integration: INTEGRATION.AU_RAPPORT,
    summary: true,
    source: 'inspectionFacts.js (TOTAL_INSTRUMENTS)',
  },
  {
    id: 'constat-operateur',
    title: "Constat, gravité et coût par l'inspecteur",
    shortTitle: 'Constat par l’inspecteur',
    body: `L'inspecteur produit chaque constat, sa gravité sur ${GRAVITE_LEVELS.length} niveaux et son coût. C'est lui qui engage le rapport.`,
    maturity: MATURITY.DISPONIBLE,
    integration: INTEGRATION.AU_RAPPORT,
    summary: false,
    source: 'taxonomy.ts (GRAVITE_LEVELS) ; Rapport §6.5',
  },
  {
    id: 'verification',
    title: 'Un rapport vérifiable en ligne',
    shortTitle: 'Vérification en ligne',
    body: "Le rapport est horodaté et vérifiable en ligne par l'autre partie de la transaction.",
    maturity: MATURITY.DISPONIBLE,
    integration: INTEGRATION.AU_RAPPORT,
    summary: false,
    source: 'Affirmation déjà publiée sur la homepage (HeroCertification, CertificateVerification)',
  },
  {
    id: 'vision',
    title: 'Un module vision qui détecte, localise et qualifie',
    shortTitle: 'Module vision',
    body: "Sur les photos du véhicule, le prototype localise chaque dommage, propose sa nature, sa gravité et un coût. Il tourne aujourd'hui en dehors du rapport, en attendant son intégration à l'outil de l'inspecteur.",
    maturity: MATURITY.PROTOTYPE,
    integration: INTEGRATION.HORS_RAPPORT,
    summary: true,
    source: 'Décision du fondateur, 24 sept. 2026 (prototype fonctionnel, non intégré)',
  },
  {
    id: 'chiffrage',
    title: 'Chiffrage assisté',
    shortTitle: 'Chiffrage assisté',
    body: "Un coût par constat adossé à des prix de pièces et de main-d'œuvre documentés, pour qu'un même dommage soit chiffré pareil d'un dossier à l'autre.",
    maturity: MATURITY.EN_DEVELOPPEMENT,
    integration: INTEGRATION.HORS_RAPPORT,
    summary: false,
    source: 'TechnologyTrust.jsx (statut antérieur)',
  },
  {
    id: 'passerelle-iot',
    title: "Un dongle, passerelle vers d'autres capteurs",
    shortTitle: 'Passerelle IoT',
    body: "Le lecteur de diagnostic embarqué ne se limite pas aux codes défaut : il sert de passerelle IoT pour d'autres capteurs connectés — signature acoustique et vibratoire du moteur en particulier — à mesure qu'ils sont validés.",
    maturity: MATURITY.EN_DEVELOPPEMENT,
    integration: INTEGRATION.HORS_RAPPORT,
    summary: true,
    source: 'TechnologyTrust.jsx (statut antérieur)',
  },
  {
    id: 'corpus',
    title: "Un corpus qui s'enrichit",
    shortTitle: 'Corpus',
    body: "Chaque inspection apparie relevé d'instrument et constat vérifié. C'est ce corpus qui permettra d'entraîner, puis d'automatiser, la gravité et le chiffrage.",
    maturity: MATURITY.DISPONIBLE,
    integration: null,
    summary: false,
    source: 'TechnologyTrust.jsx (statut antérieur)',
  },
];

export const SUMMARY_CAPABILITIES = CAPABILITIES.filter((item) => item.summary);
