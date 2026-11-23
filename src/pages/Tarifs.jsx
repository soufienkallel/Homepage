import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import InspectionCTA from '../components/InspectionCTA';
import { ArrowRight } from '../components/icons';
import { TOTAL_POINTS, TOTAL_INSTRUMENTS, FAMILLES } from '../data/inspectionFacts';
import { RESPONSE_PROMISE } from '../data/contactChannels';
import { trackEvent } from '../lib/analytics';
import {
  BASE_PRICE_TND,
  PAYMENT_RULE,
  PRICE_FACTORS,
  PRICE_GRID,
  PRICING_FAQ,
  PRO_OFFER,
  TRAVEL_INCLUDED_SHORT,
  TRAVEL_OTHER_ZONES,
  TRAVEL_ZONES_INCLUDED,
} from '../data/pricing';

/**
 * Page Tarifs (docs/specs/2026-10-tarifs.md, grille du 16 oct. 2026 :
 * docs/specs/2026-10-refonte-accueil.md) : grille par catégorie et énergie, ce qui
 * fixe le prix, contenu du diagnostic, déplacement par zone. Tous les chiffres
 * viennent de src/data/pricing.js et inspectionFacts.js.
 */
const soldGrid = PRICE_GRID.filter((row) => row.available);

const included = [
  `Diagnostic sur place : ${TOTAL_POINTS} points sur ${FAMILLES.length} familles`,
  `Mesures avec ${TOTAL_INSTRUMENTS} instruments, dont le diagnostic électronique, l'épaisseur de peinture et la sculpture des pneus`,
  'Rapport chiffré, constat par constat, avec le total estimé des réparations',
  "Certificat vérifiable en ligne par l'autre partie",
];

/** Repris sur chaque formule (le détail du protocole est dans « Compris dans le prix »). */
const formulaIncludes = [
  `${TOTAL_POINTS} points, ${TOTAL_INSTRUMENTS} instruments, sur place en 30 à 60 min`,
  'Rapport chiffré et certificat remis aussitôt',
  `Déplacement inclus : ${TRAVEL_INCLUDED_SHORT}`,
];

const eyebrow = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink';
const sectionTitle = 'text-2xl lg:text-[28px] font-semibold leading-tight text-ink mt-3 mb-6';

export default function Tarifs() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Tarifs"
        description={`Diagnostic complet de véhicule d'occasion (expertise avant achat) à partir de ${BASE_PRICE_TND} TND TTC selon la catégorie et l'énergie. Payé après le diagnostic. Déplacement inclus dans le Grand Tunis et à Sfax.`}
        path="/tarifs"
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              name: "Diagnostic complet de véhicule d'occasion",
              alternateName: 'Expertise avant achat',
              serviceType: "Inspection et certification de véhicules d'occasion",
              provider: { '@id': 'https://mallouliauto.com/#organization' },
              areaServed: 'TN',
              offers: soldGrid.map((row) => ({
                '@type': 'Offer',
                name: row.name,
                url: 'https://mallouliauto.com/tarifs',
                eligibleRegion: 'TN',
                price: row.priceTnd,
                priceCurrency: 'TND',
                priceSpecification: {
                  '@type': 'PriceSpecification',
                  price: row.priceTnd,
                  priceCurrency: 'TND',
                  valueAddedTaxIncluded: true,
                },
              })),
            },
            {
              '@type': 'FAQPage',
              mainEntity: PRICING_FAQ.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
            },
          ],
        }}
      />

      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4">
            Tarifs
          </p>
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight mb-4 max-w-3xl">
            Le prix du diagnostic complet, selon votre voiture.
          </h1>
          <p className="text-lg text-white/85 max-w-2xl leading-relaxed">
            {PAYMENT_RULE}. Le prix ne dépend pas des défauts trouvés.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {PRICE_GRID.map((row, index) => (
              <li
                key={row.name}
                className={`border border-rule-2 p-5 lg:p-6 flex flex-col ${
                  index < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
                } ${row.available ? 'bg-white' : 'bg-ground-2'}`}
              >
                <div className="flex items-start justify-between gap-3 min-h-[22px]">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-2">
                    {row.energy}
                  </span>
                  {!row.available && (
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-white bg-accent-ink px-1.5 py-0.5">
                      Bientôt
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-ink leading-snug mt-1.5">{row.name}</h2>
                <p
                  className={`font-mono text-[34px] font-semibold leading-none tabular-nums mt-4 ${
                    row.available ? 'text-ink' : 'text-ink-3'
                  }`}
                >
                  {row.priceTnd}
                  <span className="text-[13px] font-medium ml-1.5">TND TTC</span>
                </p>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-2 mt-5 mb-1.5">
                  Exemples de modèles
                </p>
                <p className="text-[14px] leading-relaxed text-ink">{row.examples.join(' · ')}</p>
                <ul className="mt-5 pt-4 border-t border-rule space-y-1.5 text-[13.5px] text-ink-2">
                  {[...formulaIncludes, ...(row.extra ? [row.extra] : [])].map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="font-mono text-accent-ink" aria-hidden="true">
                        →
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li className="md:col-span-2 lg:col-span-6 border border-ink bg-white p-5 lg:p-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] lg:gap-10 lg:items-center">
              <div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-2">
                  Professionnels
                </span>
                <h2 className="text-xl font-semibold text-ink leading-snug mt-1.5">
                  {PRO_OFFER.name}
                </h2>
                <p className="font-mono text-[28px] font-semibold leading-none text-ink mt-4">
                  {PRO_OFFER.priceLabel}
                </p>
                <p className="text-[14px] leading-relaxed text-ink mt-3">{PRO_OFFER.audience}</p>
              </div>
              <ul className="mt-5 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-rule space-y-1.5 text-[13.5px] text-ink-2">
                {PRO_OFFER.details.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="font-mono text-accent-ink" aria-hidden="true">
                      →
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={PRO_OFFER.quoteLink}
                onClick={() => trackEvent('cta_click', 'tarifs-pro')}
                className="mt-5 lg:mt-0 inline-flex items-center justify-center px-6 py-4 bg-accent-ink hover:bg-ink transition-colors"
              >
                <span className="text-white font-bold inline-flex items-center gap-2 whitespace-nowrap">
                  Demander un devis
                  <ArrowRight className="w-5 h-5" accent="currentColor" />
                </span>
              </Link>
            </li>
          </ul>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
            <li>{PAYMENT_RULE}</li>
            <li>Déplacement inclus dans {TRAVEL_INCLUDED_SHORT}</li>
            <li>
              <Link to="/partenaires" className="text-accent-ink underline underline-offset-[3px]">
                Centres partenaires
              </Link>{' '}
              : tarifs fixés par chaque centre
            </li>
          </ul>
          {/* Sous lg, la barre mobile porte déjà le bouton en permanence. */}
          <div className="hidden lg:flex items-center gap-5 mt-8">
            <Link
              to="/demande-inspection"
              className="inline-flex items-center justify-center px-6 py-4 bg-accent-ink hover:bg-ink transition-colors"
            >
              {/* Couleur sur un <span> : la règle globale « a { color: inherit } »
                  l'emporte sur une classe de couleur posée sur le lien. */}
              <span className="text-white font-bold inline-flex items-center gap-2">
                Demander un diagnostic
                <ArrowRight className="w-5 h-5" accent="currentColor" />
              </span>
            </Link>
            <span className="text-sm text-ink-2">{RESPONSE_PROMISE}.</span>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-16 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={eyebrow}>Ce qui fixe le prix</p>
          <h2 className={sectionTitle}>Trois éléments, tous connus avant le rendez-vous.</h2>
          <dl className="border-t border-rule max-w-4xl">
            {PRICE_FACTORS.map((factor) => (
              <div
                key={factor.key}
                className="grid sm:grid-cols-[190px_minmax(0,1fr)] gap-1 sm:gap-4 py-3.5 border-b border-rule"
              >
                <dt className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink pt-0.5">
                  {factor.key}
                </dt>
                <dd className="text-[14.5px] leading-relaxed text-ink-2">{factor.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-14 lg:py-16 bg-ground-2 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div>
            <p className={eyebrow}>Compris dans le prix</p>
            <h2 className={sectionTitle}>Le même protocole, quel que soit le prix.</h2>
            <ul className="border-t border-rule">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 py-3 border-b border-rule text-[14.5px] text-ink"
                >
                  <span className="font-mono text-accent-ink" aria-hidden="true">
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={eyebrow}>Déplacement</p>
            <h2 className={sectionTitle}>Inclus dans deux zones.</h2>
            <table className="w-full border-t border-rule text-[14.5px]">
              <tbody>
                {TRAVEL_ZONES_INCLUDED.map((zone) => (
                  <tr key={zone.name} className="border-b border-rule">
                    <th scope="row" className="py-3 text-left font-normal text-ink">
                      {zone.name}
                      {zone.detail && (
                        <span className="block text-[13px] text-ink-2">{zone.detail}</span>
                      )}
                    </th>
                    <td className="py-3 text-right font-mono text-xs font-semibold uppercase tracking-[0.06em] text-ink">
                      Inclus
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-rule">
                  <th scope="row" className="py-3 text-left font-normal text-ink">
                    Autres villes
                  </th>
                  <td className="py-3 text-right text-[13.5px] text-ink-2">{TRAVEL_OTHER_ZONES}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-14 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={eyebrow}>Questions sur le prix</p>
          <div className="border-t border-rule max-w-4xl mt-5">
            {PRICING_FAQ.map((item) => (
              <details key={item.q} className="group border-b border-rule">
                <summary className="py-4 font-semibold text-[15.5px] text-ink cursor-pointer list-none flex justify-between items-baseline gap-5">
                  {item.q}
                  <span className="font-mono text-accent-ink text-lg flex-shrink-0 group-open:hidden">
                    +
                  </span>
                  <span className="font-mono text-accent-ink text-lg flex-shrink-0 hidden group-open:inline">
                    –
                  </span>
                </summary>
                <p className="pb-5 text-[14.5px] text-ink-2 leading-relaxed max-w-[72ch]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <InspectionCTA title="Prêt à faire diagnostiquer un véhicule ?" showPrice={false} />
    </div>
  );
}
