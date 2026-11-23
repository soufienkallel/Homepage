import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../../icons';
import { SAMPLE_REPORT_PATH } from '../../../data/sampleReport';
import ReportPreview from './ReportPreview';

/**
 * Le rapport, montré une fois et en grand (docs/specs/2026-10-refonte-accueil.md, bloc 3) :
 * cinq repères, pas davantage. Le bouton mène au rapport complet du diagnostic de
 * démonstration (/exemple-de-rapport).
 */
const annotations = [
  {
    number: '01',
    title: 'Chaque défaut chiffré',
    body: "Pièces et main-d'œuvre, en dinars, et le total des réparations.",
  },
  {
    number: '02',
    title: 'Le prix le plus probable',
    body: "Une estimation de la valeur du véhicule, d'après son prix neuf, son âge et son kilométrage, réparations déduites.",
  },
  {
    number: '03',
    title: 'Une photo et une gravité',
    body: 'Mineure, modérée ou majeure : la même échelle pour chaque voiture.',
  },
  {
    number: '04',
    title: 'Des mesures, pas des avis',
    body: "µm, mm, km : une valeur mesurée ne dépend pas de qui tient l'appareil.",
  },
  {
    number: '05',
    title: "Vérifiable par l'autre partie",
    body: 'Une référence unique et un QR code.',
  },
];

export default function ReportShowcase() {
  return (
    <section id="rapport" className="py-20 bg-ground-2 border-t border-rule scroll-mt-[90px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
            Votre rapport
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold mb-4 leading-tight text-ink">
            Un document de référence pour décider et négocier.
          </h2>
          <p className="text-lg text-ink-2 leading-relaxed">
            Voici la première page d&apos;un exemple de rapport.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ReportPreview variant="showcase" lazy className="max-w-[520px] mx-auto lg:mx-0" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <dl className="border-t border-rule">
              {annotations.map((item) => (
                <div
                  key={item.number}
                  className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 py-4 border-b border-rule"
                >
                  <dt className="font-mono text-[11px] font-semibold text-accent-ink pt-0.5">
                    {item.number}
                  </dt>
                  <dd className="m-0">
                    <p className="font-semibold text-ink text-[15px] mb-1">{item.title}</p>
                    <p className="text-ink-2 text-sm leading-relaxed">{item.body}</p>
                  </dd>
                </div>
              ))}
            </dl>
            <Link
              to={SAMPLE_REPORT_PATH}
              className="mt-7 inline-flex items-center gap-2 px-6 py-4 bg-ink hover:bg-accent-ink transition-colors"
            >
              <span className="text-white font-bold inline-flex items-center gap-2">
                Voir le rapport complet
                <ArrowRight className="w-5 h-5" accent="currentColor" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
