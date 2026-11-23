import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import InspectorPhoto from '../components/InspectorPhoto';
import { ArrowRight } from '../components/icons';
import { trackEvent } from '../lib/analytics';

/**
 * /professionnels — l'offre pour les showrooms et revendeurs de voitures d'occasion
 * (docs/specs/2026-10-refonte-accueil.md, décision du 16 oct. 2026 : une page dédiée).
 * Tarifs sur devis, aucun montant publié. Les garages qui veulent proposer le diagnostic
 * dans leur atelier vont sur /devenir-partenaire.
 */
const benefits = [
  {
    title: 'Vendez avec un argument vérifiable',
    body: "Un rapport chiffré, vérifiable par l'acheteur, coupe court à la négociation fondée sur le doute.",
  },
  {
    title: 'Sur place, dans votre showroom',
    body: 'Nos inspecteurs viennent diagnostiquer votre stock, 30 à 60 minutes par voiture.',
  },
  {
    title: 'Le prix le plus probable',
    body: "Une estimation de la valeur de la voiture sur le marché tunisien, pour fixer votre prix d'après les annonces.",
  },
  {
    title: 'Une référence et un QR par voiture',
    body: "À afficher sur l'annonce et sur le véhicule.",
  },
];

const QUOTE_LINK = '/contact?type=professionnel';

export default function Professionnels() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Professionnels"
        description="Showrooms et revendeurs de voitures d'occasion : un diagnostic complet et un rapport chiffré, vérifiable par l'acheteur, pour chaque véhicule de votre stock. Tarifs sur devis."
        path="/professionnels"
      />
      <PageHero
        eyebrow="Showrooms · revendeurs"
        title="Chaque voiture de votre parc, diagnostiquée."
        lead="Un rapport chiffré et vérifiable pour chaque véhicule que vous vendez. Tarifs sur devis."
        media={
          <InspectorPhoto
            sizes="(min-width: 1280px) 560px, 45vw"
            className="w-full aspect-[4/3] object-cover object-[75%_35%]"
          />
        }
      >
        <Link
          to={QUOTE_LINK}
          onClick={() => trackEvent('cta_click', 'pro-hero')}
          className="inline-flex items-center gap-2 px-6 py-4 bg-accent-ink hover:bg-white/15 transition-colors"
        >
          <span className="text-white font-bold inline-flex items-center gap-2">
            Demander un devis
            <ArrowRight className="w-5 h-5" accent="currentColor" />
          </span>
        </Link>
      </PageHero>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {benefits.map((item, index) => (
              <li key={item.title} className="border border-rule p-6 flex flex-col gap-2">
                <span className="font-mono text-[11px] font-semibold text-accent-ink">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="text-lg font-semibold text-ink leading-snug">{item.title}</h2>
                <p className="text-sm text-ink-2 leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-2 max-w-[70ch] leading-relaxed">
            Le prix ne dépend pas du résultat, le rapport est toujours remis en entier et vous ne
            pouvez pas le modifier : c&apos;est ce qui lui donne sa valeur auprès de vos acheteurs.
          </p>
        </div>
      </section>

      <section className="py-12 border-t border-rule bg-ground-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-xl font-semibold text-ink">Parlons de votre stock.</p>
            <p className="text-sm text-ink-2 mt-1.5">
              Vous êtes un garage ?{' '}
              <Link
                to="/devenir-partenaire"
                className="text-accent-ink underline underline-offset-[3px]"
              >
                Proposez le diagnostic dans votre atelier
              </Link>
              .
            </p>
          </div>
          <Link
            to={QUOTE_LINK}
            onClick={() => trackEvent('cta_click', 'pro-closing')}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-6 py-4 bg-accent-ink hover:bg-ink transition-colors"
          >
            <span className="text-white font-bold inline-flex items-center gap-2">
              Demander un devis
              <ArrowRight className="w-5 h-5" accent="currentColor" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
