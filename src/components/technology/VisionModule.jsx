import { motion } from 'framer-motion';
import StatusBadges from './StatusBadges';
import { CAPABILITIES } from '../../data/platformCapabilities';

const vision = CAPABILITIES.find((item) => item.id === 'vision');

const OUTPUTS = [
  {
    title: 'Détection',
    body: 'Le type de dommage et la pièce, localisés sur l’image : bosse, fissure, dégât de peinture, pièce cassée ou manquante.',
  },
  {
    title: 'Gradation',
    body: 'Une gravité par constat, de critique à faible, et un indice de confiance sur la localisation.',
  },
  {
    title: 'Recommandation',
    body: 'Réparer ou remplacer, une estimation de coût par constat, et un score d’état global du véhicule.',
  },
];

/**
 * Sortie du module vision, telle que le prototype la produit. Format réel,
 * valeurs illustratives (pas une inspection réelle). Ce n'est PAS le rapport
 * certifié : le rapport n'a ni score global ni indice de confiance, et sa
 * gravité est sur 3 niveaux. Les gravités du module restent donc en style
 * neutre — jamais les couleurs de gravité du rapport — et l'ensemble est
 * encadré en pointillés, étiqueté « ne figure pas sur le rapport certifié ».
 */
const SPECIMEN_METRICS = [
  { value: '63/100', label: 'Score d’état global' },
  { value: '7', label: 'Constats détectés' },
  { value: '1 critique', label: '2 élevés · 2 moyens' },
  { value: '1 faible', label: '1 indéterminé' },
];

const SPECIMEN_FINDING = [
  { key: 'Type de dommage', value: 'Rayures' },
  { key: 'Pièce', value: 'Pare-chocs avant' },
  { key: 'Confiance de localisation', value: '91 %' },
  { key: 'Gravité (échelle du module)', value: 'Critique' },
  { key: 'Action recommandée', value: 'Remplacer' },
];

export default function VisionModule() {
  return (
    <section id="module-vision" className="py-20 bg-white border-t border-rule scroll-mt-[80px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3.5">
            <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em]">
              Vision par ordinateur
            </p>
            <StatusBadges maturity={vision.maturity} integration={vision.integration} />
          </div>
          <h2 className="text-3xl lg:text-4xl font-semibold text-ink mb-4 leading-tight">
            Un prototype qui détecte, localise et qualifie.
          </h2>
          <p className="text-lg text-ink-2 leading-relaxed">
            Le module vision tourne aujourd&apos;hui en dehors du rapport. Sur un lot de photos, il
            produit pour chaque dommage une localisation, une gravité, un indice de confiance, une
            action recommandée et une estimation de coût, ainsi qu&apos;un score d&apos;état global
            du véhicule. Ces sorties préparent son intégration à l&apos;outil de l&apos;inspecteur.
          </p>
        </div>

        <div className="grid md:grid-cols-3 border border-rule-2 mb-10">
          {OUTPUTS.map((item, index) => (
            <div
              key={item.title}
              className={`p-6 ${index > 0 ? 'border-t md:border-t-0 md:border-l border-rule-2' : ''}`}
            >
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-ink mb-2">
                {item.title}
              </h3>
              <p className="text-ink-2 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border border-dashed border-ink-3"
        >
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-5 py-3 border-b border-dashed border-ink-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-2">
            <span>Sortie du module vision · exemple</span>
            <span>Ne figure pas sur le rapport certifié</span>
          </div>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-6 p-5">
            <div>
              <dl className="grid grid-cols-2 border border-rule-2">
                {SPECIMEN_METRICS.map((metric, index) => (
                  <div
                    key={metric.label}
                    className={`px-4 py-3 ${index % 2 === 1 ? 'border-l border-rule' : ''} ${
                      index > 1 ? 'border-t border-rule' : ''
                    }`}
                  >
                    <dt className="text-xs text-ink-3">{metric.label}</dt>
                    <dd className="font-mono text-lg font-semibold text-ink tabular-nums">
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 border border-rule-2 text-sm">
                <p className="px-4 py-2 bg-ground-2 border-b border-rule font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
                  Constat · sortie du module
                </p>
                <dl>
                  {SPECIMEN_FINDING.map((row, index) => (
                    <div
                      key={row.key}
                      className={`flex justify-between gap-4 px-4 py-2 ${
                        index > 0 ? 'border-t border-rule' : ''
                      }`}
                    >
                      <dt className="text-ink-3">{row.key}</dt>
                      <dd className="font-mono text-ink tabular-nums text-right">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <p className="mt-3 text-xs text-ink-3 leading-relaxed">
                Format de sortie réel du prototype ; valeurs illustratives.
              </p>
            </div>
            <figure>
              <img
                src="/images/technology/vision-concept-tablet.jpg"
                alt="Tablette affichant une photo de pare-chocs avant rayé, encadré par le module vision, avec une gravité « critique » et l'action « remplacer »"
                className="w-full h-auto border border-rule-2"
                width="1100"
                height="619"
                loading="lazy"
              />
              <figcaption className="mt-2 text-xs text-ink-3">Visualisation de concept.</figcaption>
            </figure>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-8 mt-10 items-start">
          <figure>
            <img
              src="/images/technology/vision-prototype-review.jpg"
              alt="Interface du prototype : photo d'un pare-chocs avec deux dommages encadrés, et un panneau de détections où chaque proposition est validée, rejetée ou modifiée"
              className="w-full h-auto border border-rule-2"
              width="1000"
              height="528"
              loading="lazy"
            />
            <figcaption className="mt-2 text-xs text-ink-3">
              Capture du prototype : les détections incertaines sont soumises à une revue humaine —
              valider, rejeter ou modifier.
            </figcaption>
          </figure>
          <div className="border-l-2 border-accent pl-5">
            <h3 className="font-semibold text-ink mb-2">
              La caméra propose. L&apos;inspecteur tranche.
            </h3>
            <p className="text-ink-2 text-sm leading-relaxed">
              Le prototype sépare déjà ce qu&apos;il retient seul de ce qu&apos;il soumet à une
              revue. Intégré à l&apos;outil de l&apos;inspecteur, il ne fera que proposer :
              l&apos;inspecteur valide, corrige ou rejette chaque constat. Tant que cette
              intégration n&apos;est pas faite, rien de ce que produit le module n&apos;entre au
              rapport.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
