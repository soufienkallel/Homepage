import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gauge, Layers, Cpu, Ruler, Eye, ScrollText, ArrowRight } from '../../icons';

/**
 * « Ce que nous repérons » (docs/specs/2026-10-refonte-accueil.md, bloc 2) : nommer la
 * peur du visiteur, et pour chacune, l'instrument qui permet de la vérifier. Formulation
 * prudente voulue : on montre des signes mesurés (« compteur suspect », kilométrage
 * comparé), jamais une conclusion (« fraude détectée »).
 *
 * Les noms d'outils sont ceux d'INSTRUMENTS et d'EQUIPEMENTS (src/data/inspectionFacts.js).
 * La liste complète des points contrôlés est sur /inspection.
 */
const surprises = [
  {
    icon: Gauge,
    title: 'Compteur suspect',
    body: 'Kilométrage comparé dans plusieurs calculateurs.',
    tool: 'Appareil de diagnostic',
  },
  {
    icon: Layers,
    title: 'Accident ou repeinture cachés',
    body: 'Épaisseur de peinture mesurée panneau par panneau.',
    tool: "Détecteur d'épaisseur de peinture",
  },
  {
    icon: Cpu,
    title: 'Défauts électroniques',
    body: 'Codes défaut actifs et mémorisés, même voyant éteint.',
    tool: 'Appareil de diagnostic',
  },
  {
    icon: Ruler,
    title: 'Pneus et freinage',
    body: 'Usure mesurée par pneu, liquide de frein testé.',
    tool: 'Jauge d’usure · testeur de liquide de frein',
  },
  {
    icon: Eye,
    title: 'Dessous de caisse',
    body: 'Rouille, chocs et fuites, contrôlés sous la voiture.',
    tool: "Élévateur amovible · caméra d'inspection",
  },
  {
    icon: ScrollText,
    title: 'Réparations à prévoir',
    body: 'Chaque défaut chiffré en dinars, et le total.',
    tool: "Chiffrage de l'inspecteur",
  },
];

export default function SurprisesGrid() {
  return (
    <section id="ce-que-nous-reperons" className="py-20 border-t border-rule scroll-mt-[90px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
            Ce que nous repérons
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold leading-tight text-ink">
            Repérez la mauvaise surprise avant de signer.
          </h2>
        </div>

        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {surprises.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="border border-rule p-3.5 sm:p-5 flex flex-col gap-2 min-w-0"
              >
                <span className="w-10 h-10 bg-ground-3 text-ink flex items-center justify-center mb-1">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="text-[15px] sm:text-base font-semibold text-ink leading-snug">
                  {item.title}
                </h3>
                <p className="text-[13px] sm:text-sm text-ink-2 leading-relaxed">{item.body}</p>
                <p className="mt-auto pt-2 font-mono text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.06em] text-ink-3 break-words">
                  {item.tool}
                </p>
              </motion.li>
            );
          })}
        </ul>

        <Link to="/inspection" className="group inline-flex items-center gap-2 mt-6">
          <span className="text-sm font-semibold text-accent-ink group-hover:underline underline-offset-[3px]">
            Tout ce que couvre le diagnostic
          </span>
          <ArrowRight className="w-4 h-4" accent="currentColor" />
        </Link>
      </div>
    </section>
  );
}
