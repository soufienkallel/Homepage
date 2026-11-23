import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import StatusBadges from '../components/technology/StatusBadges';
import VisionModule from '../components/technology/VisionModule';
import { ArrowRight } from '../components/icons';
import { CAPABILITIES, MATURITY, INTEGRATION } from '../data/platformCapabilities';
import { TOTAL_POINTS, TOTAL_INSTRUMENTS, GRAVITE_LEVELS } from '../data/inspectionFacts';

/**
 * /technology — la plateforme d'inspection MALLOULIAUTO.
 *
 * Remise en ligne sur décision du fondateur (24 sept. 2026), qui annule celle
 * du 22 sept. (commit 705ae9d). Spécification : « Scope Split Blueprint » v3,
 * https://claude.ai/artifact/DgyFkqHSfw7p6p36HmLoP1
 *
 * Principe de la page, deux couches :
 *  1. Le rapport certifié fait foi. Il est produit aujourd'hui par
 *     l'inspecteur : 3 niveaux de gravité, un coût par constat, pas de score
 *     global, pas d'indice de confiance.
 *  2. Les modules technologiques (vision, IoT, chiffrage) peuvent afficher
 *     davantage — score global, confiance — comme fonctionnalités du module,
 *     visuellement séparées du rapport et marquées « hors rapport ».
 *
 * Règles tenues ici : aucun statut hors de platformCapabilities.js ; jamais
 * « fonctionnel » ni « en production » pour l'IA ou l'IoT ; pas de date sur la
 * feuille de route ; pas de précision de modèle chiffrée ; pas de nom ni de
 * spécification commerciale du boîtier OBD tant qu'ils ne sont pas confirmés.
 * La section « Accès API — pilote » de la spec n'est pas publiée tant que
 * l'accord de licence entre sociétés n'est pas documenté.
 */

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const JUDGEMENT = [
  'Dépend de l’inspecteur, et du jour',
  'L’état de la carrosserie s’apprécie au lieu de se mesurer',
  'Localisation et gravité notées différemment d’un dossier à l’autre',
  'En cas de litige, une parole d’expert contre une autre',
];

const PROTOCOL = [
  `La même séquence de ${TOTAL_POINTS} points, dans le même ordre`,
  'Des relevés d’instrument rattachés au véhicule et horodatés',
  `Chaque constat porte une gravité, sur ${GRAVITE_LEVELS.length} niveaux, et un coût`,
  'Chaque constat renvoie à sa photo et au matériel utilisé',
];

const ROADMAP = [
  {
    when: 'Aujourd’hui',
    title: 'Manuel, protocolisé',
    body: 'L’inspecteur produit le constat, la gravité et le coût. Le module vision est testé hors rapport.',
    current: true,
  },
  {
    when: 'Étape suivante',
    title: 'Détection assistée',
    body: 'Le module vision est intégré à l’outil de l’inspecteur : il propose, l’inspecteur valide, corrige ou rejette.',
  },
  {
    when: 'Avec le corpus',
    title: 'Gravité et chiffrage assistés',
    body: 'Une fois le jeu de données constitué, la gravité et le coût sont proposés automatiquement, toujours validés.',
  },
  {
    when: 'À terme',
    title: 'Automatisé',
    body: 'Les modules produisent le constat. L’inspecteur audite et signe ; chaque sortie reste tracée.',
  },
];

const GOVERNANCE = [
  {
    title: 'Aujourd’hui',
    body: 'L’inspecteur produit le constat, la gravité et le coût. L’IA reformule et traduit ce qui est établi, sans ajouter de fait ; aucune sortie du module vision n’entre au rapport.',
  },
  {
    title: 'Demain',
    body: 'Automatiser ne retire pas le responsable : un inspecteur habilité audite et signe chaque rapport.',
  },
  {
    title: 'Toujours',
    body: 'Chaque constat renvoie à sa photo, à son instrument et à son horodatage — et, pour une sortie de module, à la version du modèle. Traçabilité documentée au regard du règlement européen sur l’IA.',
  },
];

const PAGE_URL = 'https://mallouliauto.com/technology';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: 'La plateforme d’inspection MALLOULIAUTO',
      inLanguage: 'fr',
      about: { '@id': 'https://mallouliauto.com/#organization' },
      publisher: { '@id': 'https://mallouliauto.com/#organization' },
      breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://mallouliauto.com/' },
        { '@type': 'ListItem', position: 2, name: 'Technologie', item: PAGE_URL },
      ],
    },
  ],
};

function Eyebrow({ children, dark = false }) {
  return (
    <p
      className={`font-mono text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5 ${
        dark ? 'text-[#f0a184]' : 'text-accent-ink'
      }`}
    >
      {children}
    </p>
  );
}

export default function Technology() {
  const iot = CAPABILITIES.find((item) => item.id === 'passerelle-iot');

  return (
    <div className="min-h-screen">
      <SEO
        title="Technologie"
        description={`La plateforme d'inspection de MALLOULIAUTO, certificateur indépendant : protocole de ${TOTAL_POINTS} points, ${TOTAL_INSTRUMENTS} instruments, et un module de vision par ordinateur en prototype, testé hors rapport. Chaque capacité porte son statut réel.`}
        path="/technology"
        jsonLd={JSON_LD}
      />

      {/* A · Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Eyebrow dark>La plateforme</Eyebrow>
            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight mb-6">
              Une inspection qui ne dépend pas de l&apos;inspecteur.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Certificateur indépendant, MALLOULIAUTO développe sa propre plateforme
              d&apos;inspection : un protocole encodé, des instruments connectés, et une vision par
              ordinateur dont le prototype est en test. L&apos;objectif : inspecté deux fois, le
              même véhicule donne le même rapport.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/exemple-de-rapport"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent hover:bg-accent-ink font-semibold transition-colors"
              >
                <span className="text-white inline-flex items-center gap-2">
                  Voir un exemple de rapport
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
              <Link
                to="/contact?type=partenaire"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/35 hover:bg-white/10 hover:border-white font-semibold transition-colors"
              >
                <span className="text-white">Devenir partenaire</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* B · Le problème */}
      <section className="py-20 bg-white border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <Eyebrow>Le problème</Eyebrow>
            <h2 className="text-3xl lg:text-4xl font-semibold text-ink mb-4 leading-tight">
              Deux experts, deux rapports.
            </h2>
            <p className="text-lg text-ink-2 leading-relaxed">
              Le même véhicule, inspecté par deux experts, donne deux rapports différents. Ce
              n&apos;est pas un défaut de formation : c&apos;est ce qui empêche un rapport
              d&apos;état de servir de certification.
            </p>
          </div>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 border border-rule-2"
          >
            <div className="p-7">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-ink-3 mb-4">
                Inspection au jugement
              </h3>
              <ul className="space-y-2.5 text-ink-2">
                {JUDGEMENT.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2.5 w-2 h-px bg-ink-3 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-7 bg-ground-2 border-t md:border-t-0 md:border-l border-rule-2">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-ink mb-4">
                Inspection protocolisée
              </h3>
              <ul className="space-y-2.5 text-ink">
                {PROTOCOL.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-accent flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
          <p className="mt-6 text-ink-2">
            Un rapport qu&apos;on ne peut pas reproduire ne peut pas servir à fixer un prix.
          </p>
        </div>
      </section>

      {/* C · Deux couches */}
      <section className="py-20 bg-ground-2 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <Eyebrow>Comment lire cette page</Eyebrow>
            <h2 className="text-3xl lg:text-4xl font-semibold text-ink leading-tight">
              Le rapport fait foi. Les modules préparent la suite.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white border border-rule-2 border-t-[3px] border-t-navy p-7">
              <h3 className="text-lg font-semibold text-ink mb-3">Le rapport certifié</h3>
              <p className="text-ink-2 leading-relaxed">
                Produit aujourd&apos;hui par l&apos;inspecteur : {TOTAL_POINTS} points, une gravité
                sur {GRAVITE_LEVELS.length} niveaux, un coût par constat, vérifiable en ligne.
                C&apos;est le seul document qui engage MALLOULIAUTO.
              </p>
            </div>
            <div className="bg-white border border-dashed border-ink-3 p-7">
              <h3 className="text-lg font-semibold text-ink mb-3">Les modules technologiques</h3>
              <p className="text-ink-2 leading-relaxed">
                Vision par ordinateur, passerelle IoT, chiffrage. Ils produisent déjà des résultats
                de leur côté, mais ne sont pas encore intégrés au rapport. Ce qu&apos;ils affichent
                — score global, indice de confiance — n&apos;apparaît pas sur le certificat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* D · La chaîne, aujourd'hui */}
      <section id="chaine" className="py-20 bg-navy-d text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <Eyebrow dark>La chaîne, aujourd&apos;hui</Eyebrow>
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4 leading-tight">
              Chaque étape porte son statut réel.
            </h2>
            <p className="text-white/80 leading-relaxed">
              Deux indications par étape : sa maturité ({MATURITY.DISPONIBLE}, {MATURITY.PROTOTYPE},{' '}
              {MATURITY.EN_DEVELOPPEMENT}), et si elle alimente déjà le rapport (
              {INTEGRATION.AU_RAPPORT} ou {INTEGRATION.HORS_RAPPORT}).
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/15">
            {CAPABILITIES.map((item, index) => (
              <motion.div
                key={item.id}
                {...fadeUp}
                transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
                className="p-6 border-r border-b border-white/15"
              >
                <h3 className="font-semibold leading-snug mb-2">{item.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4">{item.body}</p>
                <StatusBadges maturity={item.maturity} integration={item.integration} tone="dark" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* E · Module vision */}
      <VisionModule />

      {/* F · Mesure et IoT */}
      <section className="py-20 bg-ground-2 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Eyebrow>Instruments et IoT</Eyebrow>
              <h2 className="text-3xl lg:text-4xl font-semibold text-ink mb-5 leading-tight">
                Mesurer plutôt qu&apos;apprécier.
              </h2>
              <p className="text-ink-2 leading-relaxed mb-4">
                Lecteur de défauts, jauge d&apos;épaisseur de peinture, jauge de sculpture, testeurs
                : {TOTAL_INSTRUMENTS} instruments, chaque relevé rattaché au véhicule et horodaté
                dans le rapport, avec le matériel nommé.
              </p>
              <p className="text-ink-2 leading-relaxed mb-3">
                Le boîtier de diagnostic OBD-II sert aussi de passerelle vers d&apos;autres capteurs
                connectés, notamment la signature acoustique et vibratoire du moteur.
              </p>
              <div className="mb-8">
                <StatusBadges maturity={iot.maturity} integration={iot.integration} />
              </div>
              <div className="border-l-2 border-accent bg-white p-5">
                <h3 className="font-semibold text-ink mb-1.5">
                  Un code défaut n&apos;est pas une panne.
                </h3>
                <p className="text-ink-2 text-sm leading-relaxed">
                  Le calculateur signale un système ou une condition, pas la pièce défaillante.
                  C&apos;est l&apos;inspecteur qui établit le constat, et qui indique ce qui reste à
                  vérifier.
                </p>
              </div>
            </div>
            <figure>
              <picture>
                <source srcSet="/images/technology/obd-dongle-1200.webp" type="image/webp" />
                <img
                  src="/images/technology/obd-dongle-1200.jpg"
                  alt="Boîtier de diagnostic OBD-II, marine et orange, posé devant un tableau de bord"
                  className="w-full h-auto border border-rule-2"
                  width="1200"
                  height="675"
                  loading="lazy"
                />
              </picture>
              <figcaption className="mt-2 text-xs text-ink-3">
                Boîtier de diagnostic OBD-II — visualisation de concept.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* G · Feuille de route */}
      <section className="py-20 bg-white border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <Eyebrow>Feuille de route</Eyebrow>
            <h2 className="text-3xl lg:text-4xl font-semibold text-ink mb-4 leading-tight">
              De l&apos;inspection manuelle à l&apos;inspection automatisée, par étapes vérifiées.
            </h2>
            <p className="text-lg text-ink-2 leading-relaxed">
              Chaque étape n&apos;est franchie que lorsque sa performance est démontrée sur des
              inspections réelles. Pas de date annoncée.
            </p>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-rule-2">
            {ROADMAP.map((step, index) => (
              <motion.li
                key={step.title}
                {...fadeUp}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`p-6 border-r border-b border-rule-2 ${step.current ? 'bg-ground-2' : ''}`}
              >
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-accent-ink mb-2">
                  {step.when}
                </p>
                <h3 className="font-semibold text-ink mb-2 leading-snug">{step.title}</h3>
                <p className="text-ink-2 text-sm leading-relaxed">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* I · Gouvernance */}
      <section className="py-20 bg-ground-2 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <Eyebrow>Gouvernance</Eyebrow>
            <h2 className="text-3xl lg:text-4xl font-semibold text-ink leading-tight">
              Aujourd&apos;hui, l&apos;IA ne décide pas.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {GOVERNANCE.map((item) => (
              <div key={item.title} className="bg-white border border-rule p-7">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-ink mb-3">
                  {item.title}
                </h3>
                <p className="text-ink-2 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* J · Clôture */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <h2 className="text-3xl font-semibold leading-tight max-w-2xl">
              Inspecteurs, experts : travaillez avec notre protocole et nos instruments, sous votre
              marque.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact?type=partenaire"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent hover:bg-accent-ink font-semibold transition-colors whitespace-nowrap"
              >
                <span className="text-white inline-flex items-center gap-2">
                  Devenir partenaire
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
              <Link
                to="/demande-inspection"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/35 hover:bg-white/10 hover:border-white font-semibold transition-colors whitespace-nowrap"
              >
                <span className="text-white">Demander un diagnostic</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
