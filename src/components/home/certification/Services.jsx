import { motion } from 'framer-motion';
import { ScrollText, Tags, Scale, FileSignature, Award, Globe2, BadgeCheck } from '../../icons';
import { TRAVEL_INCLUDED_SHORT } from '../../../data/pricing';
import { TOTAL_POINTS, FAMILLES } from '../../../data/inspectionFacts';

/**
 * Remplace les anciennes sections Problème (UncertaintyDiscount) et Solution
 * (Solution.jsx) — une grille de services énonce directement l'offre plutôt
 * que de construire un récit problème/solution, cohérent avec le reste de la
 * page (segment-agnostique, orienté valeur).
 *
 * « Avis global de l'inspecteur » reprend le champ réel du produit
 * (syntheseTexte, cf. schema.ts) : une synthèse en langage clair de ce qui a
 * été mesuré, jamais un avis d'achat — Proposition de Valeur §3 interdit
 * explicitement toute recommandation d'achat ou de vente.
 *
 * « Valeur recommandée » est la seule capacité affichée comme à venir : elle
 * porte le badge `.ph-note` « Bientôt » plutôt qu'un statut « Disponible ».
 *
 * Image générée via le prompt docs/prompt-services-illustration.md, contrôlée
 * contre sa propre checklist QC avant intégration (texte de l'écran illisible,
 * aucun logo constructeur ou de matériel lisible).
 */
const services = [
  {
    icon: <ScrollText className="w-6 h-6" />,
    title: 'Inspection complète et rapport détaillé',
    body: `${TOTAL_POINTS} points sur ${FAMILLES.length} familles, un protocole unique, un rapport structuré remis à l'issue du rendez-vous.`,
  },
  {
    icon: <Tags className="w-6 h-6" />,
    title: 'Chiffrage des réparations',
    body: "Chaque constat porte un coût estimé, pièces et main-d'œuvre. Le rapport en donne le total.",
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: 'Conseils de négociation',
    body: 'Des arguments appuyés sur des mesures et un chiffrage, pas sur une impression.',
  },
  {
    icon: <FileSignature className="w-6 h-6" />,
    title: "Avis global de l'inspecteur",
    body: 'Une synthèse en langage clair de ce qui a été mesuré et constaté, rédigée par la personne qui a inspecté le véhicule.',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Valeur recommandée',
    badge: 'Bientôt',
    body: "Une fourchette de prix tenant compte de l'état constaté et du marché.",
  },
  {
    icon: <Globe2 className="w-6 h-6" />,
    title: 'Où que soit le véhicule',
    body: `Chez vous, chez le vendeur ou dans nos locaux : nous nous déplaçons avec notre matériel, sans frais dans ${TRAVEL_INCLUDED_SHORT}. Votre présence n'est pas nécessaire.`,
  },
  {
    icon: <BadgeCheck className="w-6 h-6" />,
    title: 'Certificat vérifié en ligne',
    body: "Référence unique et QR de vérification, consultable par n'importe quel tiers à la transaction.",
  },
];

export default function Services() {
  return (
    <section id="ce-que-vous-recevez" className="py-20 bg-white scroll-mt-[120px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
            Ce que vous recevez
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-ink mb-5 leading-tight">
            De la mesure au rapport, sans étape manquante.
          </h2>
          <p className="text-lg text-ink-2 leading-relaxed">
            Une inspection MALLOULIAUTO ne se limite pas à une liste de constats : elle est
            chiffrée, expliquée, et transportable jusqu&apos;à l&apos;autre partie à la transaction.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-14"
        >
          <picture>
            <source srcSet="/images/home/services-field-inspection.webp" type="image/webp" />
            <img
              src="/images/home/services-field-inspection.jpg"
              alt="Inspecteur MALLOULIAUTO sur site, tablette en main, saisie d'un constat près du véhicule utilitaire de service"
              className="w-full h-auto border border-rule-2 aspect-[16/9] object-cover"
              loading="lazy"
            />
          </picture>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 border-t border-rule">
          {services.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
              className="bg-ground-2 border border-rule p-7"
            >
              <div className="w-11 h-11 border border-rule-2 text-ink flex items-center justify-center mb-5">
                {item.icon}
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 mb-3">
                <h3 className="text-lg font-semibold text-ink leading-snug">{item.title}</h3>
                {item.badge && <span className="ph-note">{item.badge}</span>}
              </div>
              <p className="text-ink-2 text-sm leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
