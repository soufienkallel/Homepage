import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageCircle } from './icons';
import { PHONE, whatsappLink } from '../data/contactChannels';
import { trackEvent } from '../lib/analytics';

/**
 * Barre collante mobile : Appeler · WhatsApp · Demander un diagnostic
 * (docs/specs/2026-09-cta-demande-inspection.md, §3.4). Masquée à partir de lg et
 * sur la page de demande elle-même. Layout réserve la hauteur de la barre en bas de
 * page (pb-[76px]) pour qu'elle ne masque jamais le pied de page.
 */
export default function MobileContactBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/demande-inspection')) return null;

  return (
    <nav
      aria-label="Contact rapide"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-rule-2 px-2.5 pt-2 flex gap-2"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <a
        href={PHONE.href}
        onClick={() => trackEvent('call_click', 'mobile-bar')}
        className="flex flex-col items-center justify-center gap-0.5 w-[72px] min-h-[52px] border border-rule-2 text-ink text-xs font-semibold"
      >
        <Phone className="w-5 h-5" />
        Appeler
      </a>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('whatsapp_click', 'mobile-bar')}
        className="flex flex-col items-center justify-center gap-0.5 w-[84px] min-h-[52px] border border-rule-2 text-ink text-xs font-semibold"
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </a>
      <Link
        to="/demande-inspection"
        onClick={() => trackEvent('cta_click', 'mobile-bar')}
        className="flex-grow flex items-center justify-center min-h-[52px] bg-accent-ink"
      >
        <span className="text-white text-[15px] font-bold">Demander un diagnostic</span>
      </Link>
    </nav>
  );
}
