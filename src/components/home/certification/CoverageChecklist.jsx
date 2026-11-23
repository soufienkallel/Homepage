import { motion } from 'framer-motion';
import {
  FAMILLES,
  INSTRUMENTS,
  EQUIPEMENTS,
  TOTAL_POINTS,
  PERIMETRES,
} from '../../../data/inspectionFacts';

/**
 * Couverture d'inspection — familles, sous-familles et matériel repris
 * littéralement de la taxonomie produit via src/data/inspectionFacts.js.
 * Aucun libellé inventé ici : la liste affichée doit rester celle que le
 * rapport nomme réellement, sinon la promesse « la liste est publiée » est
 * fausse.
 */
export default function CoverageChecklist() {
  return (
    <section id="couverture" className="py-20 bg-ground-2 border-t border-rule scroll-mt-[90px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
            Ce que couvre l&apos;inspection
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold mb-4 leading-tight text-ink">
            {TOTAL_POINTS} points contrôlés, et la liste est publiée.
          </h2>
          <p className="text-lg text-ink-2 leading-relaxed">
            Un nombre ne vaut que si l&apos;on peut le vérifier. Chaque rapport nomme les éléments
            contrôlés, y compris ceux jugés conformes et ceux dont le véhicule n&apos;est pas
            équipé.
          </p>
        </div>

        <div className="grid md:grid-cols-2 md:gap-x-11 border-t border-rule">
          {FAMILLES.map((famille, index) => (
            <motion.section
              key={famille.nom}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (index % 2) * 0.08 }}
              className="py-[18px] border-b border-rule"
            >
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-accent-ink mb-2.5">
                {famille.nom}
              </h4>
              <ul className="grid gap-1.5 list-none p-0 m-0">
                {famille.sousFamilles.map((sousFamille) => (
                  <li
                    key={sousFamille}
                    className="grid grid-cols-[auto_1fr] gap-2.5 text-[14px] text-ink-2 leading-snug"
                  >
                    <span className="text-accent font-bold">·</span>
                    <span>{sousFamille}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        <div className="mt-9 grid lg:grid-cols-2 gap-9">
          <div>
            <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-2.5">
              Instruments de contrôle
            </p>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.map((tool) => (
                <span
                  key={tool}
                  className="border border-rule-2 bg-white px-3 py-2 text-sm text-ink"
                >
                  {tool}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-3 leading-relaxed">
              Équipements : {EQUIPEMENTS.join(', ').toLowerCase()}. Chaque rapport nomme le matériel
              réellement utilisé pour l&apos;inspection.
            </p>
          </div>

          <div>
            <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-2.5">
              Périmètres disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {PERIMETRES.map((perimetre) => (
                <span
                  key={perimetre}
                  className="border border-rule-2 bg-white px-3 py-2 text-sm text-ink"
                >
                  {perimetre}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-3 leading-relaxed">
              Les {TOTAL_POINTS} points correspondent au périmètre complet. Une inspection peut
              porter sur une seule famille, ou sur une sélection choisie avec vous.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
