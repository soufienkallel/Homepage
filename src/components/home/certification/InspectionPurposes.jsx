import { motion } from 'framer-motion';
import { OBJETS_INSPECTION } from '../../../data/inspectionFacts';

/**
 * À quoi sert le rapport — construit sur INSPECTION_PURPOSE_LABELS
 * (apps/packages/certification/src/schema.ts), l'objet d'inspection déclaré
 * sur chaque rapport. C'est la segmentation que le produit connaît
 * réellement : un rapport unique, dont l'objet change — pas une offre
 * différente par type de client.
 *
 * Remplace l'ancien découpage par audience (particuliers / professionnels /
 * partenaires), qui présentait comme trois offres ce qui est un seul produit.
 */
export default function InspectionPurposes() {
  return (
    <section id="a-quoi-ca-sert" className="py-20 bg-white border-t border-rule scroll-mt-[90px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
            À quoi ça sert
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-ink mb-4 leading-tight">
            Un rapport, plusieurs objets.
          </h2>
          <p className="text-lg text-ink-2 leading-relaxed">
            Le protocole ne change pas selon qui commande l&apos;inspection. Ce qui change,
            c&apos;est l&apos;objet déclaré sur le rapport — et ce que le lecteur en fait ensuite.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 border-t border-rule">
          {OBJETS_INSPECTION.map((objet, index) => (
            <motion.div
              key={objet.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
              className="bg-white border border-rule p-7"
            >
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-accent-ink mb-3">
                {objet.label}
              </p>
              <p className="text-sm text-ink-2 leading-relaxed">{objet.body}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-sm text-ink-3 leading-relaxed max-w-3xl">
          L&apos;objet de l&apos;inspection figure dans la traçabilité du rapport : un lecteur sait
          toujours pourquoi le véhicule a été contrôlé, et ne peut pas confondre un constat
          d&apos;entrée d&apos;atelier avec une inspection avant achat.
        </p>
      </div>
    </section>
  );
}
