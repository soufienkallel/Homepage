import { Link } from 'react-router-dom';
import { ArrowRight } from './icons';
import { HOURS, PHONE, RESPONSE_PROMISE, whatsappLink } from '../data/contactChannels';
import { BASE_PRICE_LABEL, PAYMENT_RULE } from '../data/pricing';
import { trackEvent } from '../lib/analytics';

/**
 * Bandeau « Demander un diagnostic » (docs/specs/2026-09-cta-demande-inspection.md, §3.3).
 * Un simple trait rule, pas de carte ni d'ombre (design system : borders-first). Le prix
 * d'appel y figure (docs/specs/2026-10-tarifs.md), sauf sur /tarifs qui le détaille déjà.
 * `source` nomme l'emplacement dans les clics mesurés (src/lib/analytics.js).
 */
export default function InspectionCTA({
  title = 'Prêt à faire diagnostiquer un véhicule ?',
  showPrice = true,
  source = 'cta-band',
}) {
  return (
    <aside aria-label="Demander un diagnostic" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-y border-rule py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-xl lg:text-2xl font-semibold text-ink leading-snug">{title}</p>
            <p className="text-sm text-ink-2 mt-1.5">
              {showPrice && (
                <>
                  Dès <span className="font-mono font-semibold text-ink">{BASE_PRICE_LABEL}</span>,{' '}
                  {PAYMENT_RULE.toLowerCase()} ·{' '}
                  <Link to="/tarifs" className="text-accent-ink underline underline-offset-[3px]">
                    Voir les tarifs
                  </Link>{' '}
                  ·{' '}
                </>
              )}
              {RESPONSE_PROMISE}, {HOURS}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={PHONE.href}
              onClick={() => trackEvent('call_click', source)}
              className="text-sm font-semibold text-ink hover:text-accent-ink"
            >
              Appeler
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', source)}
              className="text-sm font-semibold text-ink hover:text-accent-ink"
            >
              WhatsApp
            </a>
            <Link
              to="/demande-inspection"
              onClick={() => trackEvent('cta_click', source)}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-accent-ink hover:bg-ink transition-colors"
            >
              <span className="text-white font-bold inline-flex items-center gap-2">
                Demander un diagnostic
                <ArrowRight className="w-5 h-5" accent="currentColor" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
