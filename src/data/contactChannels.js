/**
 * Canaux de contact publiés sur le site — seule source pour l'en-tête, la barre
 * mobile, le pied de page, /contact et /demande-inspection.
 *
 * Décisions du fondateur, 26 sept. 2026 (docs/specs/2026-09-cta-demande-inspection.md) :
 * le numéro WhatsApp est distinct du numéro d'appel, et l'engagement de réponse est
 * de 24 h, du lundi au samedi.
 */
export const PHONE = { display: '+216 25 571 398', href: 'tel:+21625571398' };

export const WHATSAPP = { display: '+49 177 833 4621', number: '491778334621' };

export const EMAIL = { display: 'info@mallouliauto.com', href: 'mailto:info@mallouliauto.com' };

export const HOURS = 'du lundi au samedi, 8 h – 18 h';
export const HOURS_SHORT = 'Lun – sam, 8 h – 18 h';

export const RESPONSE_PROMISE = 'Réponse sous 24 h';

export const WHATSAPP_MESSAGES = {
  default: 'Bonjour, je souhaite faire inspecter un véhicule.',
  afterRequest: (reference) => `Bonjour, j'ai envoyé la demande ${reference}.`,
};

/** wa.me link, with an optional prefilled message. */
export const whatsappLink = (text = WHATSAPP_MESSAGES.default) =>
  `https://wa.me/${WHATSAPP.number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
