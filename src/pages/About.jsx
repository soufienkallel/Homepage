import { motion } from 'framer-motion';
import { MapPin, Linkedin } from 'lucide-react';
import {
  Handshake,
  Globe2,
  Smartphone,
  Ruler,
  BrainCircuit,
  ArrowRight,
} from '../components/icons';
import { Link } from 'react-router-dom';
import wassimPhoto from '../assets/team/wassim_mallouli.jpeg';
import wassimPhotoWebp from '../assets/team/wassim_mallouli.webp';
import marwaPhoto from '../assets/team/marwa_maalej.jpeg';
import marwaPhotoWebp from '../assets/team/marwa_maalej.webp';
import soufiénPhoto from '../assets/team/soufien_kallel.jpeg';
import soufiénPhotoWebp from '../assets/team/soufien_kallel.webp';
import SEO from '../components/SEO';

/**
 * Réalignée sur le design system (docs/design-system/README.md) et sur la
 * dataroom, dans le prolongement de la refonte de la page d'accueil.
 *
 * Deux décisions du fondateur à conserver si cette page est retouchée :
 * - La feuille de route est présentée par phase (Business Plan §4.5), pas
 *   par année : la dataroom elle-même ne documente aucune date de fondation
 *   ou de MVP (Stratégie_de_Reference règle 6 — écrit sans référence à des
 *   versions antérieures). L'ancienne version affirmait un « lancement
 *   commercial 2026 avec premiers clients » qui contredit le statut
 *   pré-commercial documenté partout ailleurs sur le site.
 * - L'équipe (noms, titres — dont le « CTO » de Soufien —, bios) est
 *   volontairement inchangée : décision explicite du fondateur, ne pas la
 *   raccorder à la distinction MALLOULINOVA/MALLOULIAUTO qui a justifié le
 *   retrait de /technology. Seul le traitement visuel des cartes change ici.
 */

const roadmap = [
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Lancement',
    body: "Instrumenter le protocole d'inspection et le déployer en direct, en Tunisie.",
  },
  {
    icon: <Ruler className="w-6 h-6" />,
    title: 'Preuve',
    body: 'Mesurer, à petite échelle, le taux de recours réel et la disposition à payer.',
  },
  {
    icon: <Handshake className="w-6 h-6" />,
    title: 'Densification',
    body: 'Ouvrir le réseau de partenaires en marque blanche, sous gouvernance.',
  },
  {
    icon: <Globe2 className="w-6 h-6" />,
    title: 'Extension du corridor',
    body: "Monter en volume sur le corridor d'exportation vers l'Afrique.",
  },
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: 'Bascule technologique',
    body: "Mettre en production l'IA et l'IoT une fois la performance validée.",
  },
];

/**
 * `focus` = point de visée vertical du recadrage. Les portraits sont en 2:3
 * (1066×1600) et la vignette est carrée : le recadrage centré par défaut
 * rogne le haut de l'image et coupe le crâne. Chaque valeur place le visage
 * à la même hauteur dans la pastille, pour que les trois s'alignent.
 */
const team = [
  {
    name: 'Wassim Mallouli',
    title: 'Founder & CEO',
    bio: "Expert en systèmes embarqués et IoT. Plus de 10 ans d'expérience dans l'automobile connectée et les technologies embarquées.",
    photo: wassimPhoto,
    photoWebp: wassimPhotoWebp,
    focus: '50% 0%',
    linkedin: 'https://www.linkedin.com/in/wassim-mallouli/',
  },
  {
    name: 'Marwa Maalej',
    title: 'CFO & Operations',
    bio: "Spécialiste en finance et gestion d'opérations. Pilote la stratégie financière et l'excellence opérationnelle de la plateforme.",
    photo: marwaPhoto,
    photoWebp: marwaPhotoWebp,
    focus: '50% 23%',
    linkedin: 'https://www.linkedin.com/in/marwa-maalej/',
  },
  {
    name: 'Soufien Kallel',
    title: 'CTO',
    bio: "Développeur full-stack et architecte IA. Conçoit l'infrastructure technique et les algorithmes d'intelligence artificielle.",
    photo: soufiénPhoto,
    photoWebp: soufiénPhotoWebp,
    focus: '50% 2%',
    linkedin: 'https://www.linkedin.com/in/soufien-kallel/',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function About() {
  return (
    <div className="min-h-screen">
      <SEO
        title="À propos"
        description="MALLOULIAUTO est un certificateur d'état de véhicules d'occasion basé en Tunisie : protocole d'inspection standardisé, instruments de mesure, rapport vérifiable en ligne."
        path="/about"
      />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4"
          >
            À propos
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl lg:text-5xl font-semibold leading-tight mb-6 max-w-3xl"
          >
            Un certificateur d&apos;état de véhicules d&apos;occasion, basé en Tunisie.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 max-w-2xl leading-relaxed"
          >
            Un protocole d&apos;inspection standardisé, des instruments de mesure, et un rapport
            vérifiable en ligne — pour remplacer l&apos;avis oral par un constat mesuré.
          </motion.p>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-20 bg-white border-t border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
              Notre histoire
            </p>
            <h2 className="text-3xl font-semibold text-ink mb-6 leading-tight">
              Un constat mesuré, pas un avis.
            </h2>
            <div className="space-y-4 text-ink-2 leading-relaxed border border-rule p-7 md:p-9">
              <p className="text-ink font-medium">
                MALLOULIAUTO est un service de diagnostic de voitures d&apos;occasion, basé à Sfax
                (Tunisie), pour les particuliers, les showrooms et les revendeurs. Un inspecteur
                indépendant se déplace chez le vendeur ou chez vous, contrôle le véhicule avec des
                instruments et remet aussitôt un rapport chiffré, vérifiable en ligne. Ce n&apos;est
                ni un garage ni un outil réservé aux marchands : le constat est établi par
                l&apos;inspecteur, pas par une intelligence artificielle.
              </p>
              <p>
                L&apos;inspection d&apos;un véhicule d&apos;occasion avant une transaction reste
                aujourd&apos;hui largement manuelle : elle dépend du jugement d&apos;un expert,
                prend du temps, et produit des constats peu standardisés d&apos;un inspecteur à
                l&apos;autre. L&apos;acheteur comme le vendeur ont intérêt à un avis indépendant,
                mais aucune offre standardisée n&apos;existe à l&apos;échelle.
              </p>
              <p>
                MALLOULIAUTO est né de ce constat. Nous avons construit un protocole
                d&apos;inspection unique, appliqué par un opérateur instrumenté — scanner de
                diagnostic, jauges de mesure, tablette de saisie guidée — pour produire un rapport
                structuré : des constats localisés, une gravité par constat, un chiffrage, et un
                certificat horodaté, vérifiable en ligne par un tiers.
              </p>
              <p>
                Le rapport est vendu en direct aux particuliers, et en marque blanche à des garages,
                des experts automobiles et des experts d&apos;assurance qui appliquent le même
                protocole sous leur propre nom.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-ground-2 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
              Mission et vision
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-ink leading-tight">
              Ce que nous construisons, et pourquoi.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 border-t border-rule">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5 }}
              className="bg-white border border-rule p-7"
            >
              <div className="w-12 h-12 border border-rule-2 text-ink flex items-center justify-center mb-5">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-3">Notre mission</h3>
              <p className="text-ink-2 leading-relaxed">
                Donner à tout acteur d&apos;une transaction ou d&apos;un sinistre automobile —
                particulier, professionnel, expert automobile, assureur — un rapport d&apos;
                inspection standardisé, vérifiable et rapide.
              </p>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-rule p-7"
            >
              <div className="w-12 h-12 border border-rule-2 text-ink flex items-center justify-center mb-5">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-3">Notre vision</h3>
              <p className="text-ink-2 leading-relaxed">
                Devenir la référence de l&apos;inspection automobile digitalisée et automatisée en
                Tunisie, puis sur le continent africain.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feuille de route */}
      <section className="py-20 bg-navy text-white border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-3.5">
              Notre feuille de route
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4 leading-tight">
              Cinq phases, une seule à la fois.
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Le déploiement suit une séquence délibérée plutôt qu&apos;une expansion simultanée sur
              tous les fronts.
            </p>
          </div>

          <div className="flex flex-col md:flex-row border-t border-white/15">
            {roadmap.map((phase, index) => (
              <div key={phase.title} className="flex flex-1 min-w-0">
                <motion.div
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-1 min-w-0 py-6 border-b border-white/15 md:border-b-0"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 border border-white/25 flex items-center justify-center">
                      {phase.icon}
                    </div>
                    <span className="font-mono text-2xl font-semibold text-white/25">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 leading-snug">{phase.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed pr-2">{phase.body}</p>
                </motion.div>
                {index < roadmap.length - 1 && (
                  <div
                    className="hidden md:flex flex-shrink-0 items-start pt-6 px-3"
                    aria-hidden="true"
                  >
                    <span className="w-11 h-11 flex items-center justify-center font-mono text-xl text-white/25">
                      →
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-white/80 max-w-2xl leading-relaxed border-t border-white/15 pt-6">
            Le pilote en cours avec nos premiers partenaires couvre les deux premières phases : le
            protocole est instrumenté, la demande réelle est mesurée sur le terrain.
          </p>
        </div>
      </section>

      {/* Équipe */}
      <section className="py-20 bg-ground-2 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
              L&apos;équipe fondatrice
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-ink leading-tight">
              Une équipe restreinte, cohérente avec le stade du projet.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                {...fadeUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-rule p-7 text-center"
              >
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden mb-4 border-2 border-rule-2">
                  <picture>
                    <source srcSet={member.photoWebp} type="image/webp" />
                    <img
                      src={member.photo}
                      alt={member.name}
                      loading="lazy"
                      style={{ objectPosition: member.focus }}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
                <h3 className="text-lg font-semibold text-ink mb-1">{member.name}</h3>
                <p className="font-mono text-accent-ink text-xs uppercase tracking-wide mb-3">
                  {member.title}
                </p>
                <p className="text-ink-2 text-sm leading-relaxed mb-4">{member.bio}</p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center w-9 h-9 border border-rule-2 hover:border-accent-ink transition-colors"
                  aria-label={`Profil LinkedIn de ${member.name}`}
                >
                  <Linkedin className="w-4 h-4 text-ink group-hover:text-accent-ink" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Localisation */}
      <section className="py-20 bg-white border-t border-rule">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-accent-ink mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wide">
              Basé en Tunisie
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-semibold text-ink mb-4 leading-tight">
            Une entreprise tunisienne, basée à Sfax.
          </h2>
          <p className="text-ink-2 leading-relaxed mb-8">
            MALLOULIAUTO est développé en Tunisie. Notre siège est à Sfax.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demande-inspection"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-ink hover:bg-ink font-semibold transition-colors"
            >
              <span className="text-white inline-flex items-center gap-2">
                Demander un diagnostic
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            <Link
              to="/contact?type=partenaire"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-rule-2 hover:border-ink transition-colors font-semibold"
            >
              <span className="text-ink">Devenir partenaire</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
