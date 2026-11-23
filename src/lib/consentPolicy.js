/**
 * Consent wording and validation rules — shared by the browser (forms) and the
 * server (api/newsletter/*). Plain module with no browser or Node dependency.
 *
 * The exact wording is stored with every consent event so we can prove, later,
 * what the person actually agreed to (GDPR art. 7.1 — proof of consent, and
 * Mailjet's proof-of-consent requirement). Never change these strings without
 * also bumping CONSENT_VERSION.
 */
export const CONSENT_VERSION = '2026-09-25';

export const PRIVACY_CONSENT_TEXT =
  "J'ai lu et j'accepte la Politique de confidentialité et le traitement de mes données personnelles pour le traitement de ma demande.";

export const MARKETING_CONSENT_TEXT =
  "J'accepte de recevoir par e-mail les actualités, offres et informations commerciales de MALLOULIAUTO. Ce consentement est facultatif et peut être retiré à tout moment via le lien de désabonnement présent dans chaque e-mail.";

/**
 * Statement shown on the confirmation page, next to the button the subscriber
 * clicks to confirm (double opt-in). Stored on the `confirmed` event.
 */
export const CONFIRMATION_STATEMENT =
  'En cliquant sur « Confirmer mon inscription », je confirme vouloir recevoir par e-mail les actualités, offres et informations commerciales de MALLOULIAUTO. Je peux me désinscrire à tout moment via le lien présent dans chaque e-mail.';

/** Shown when the marketing box is ticked on a form where the e-mail field is optional. */
export const MARKETING_EMAIL_REQUIRED =
  'Indiquez votre e-mail pour recevoir nos communications : nous y envoyons le lien de confirmation.';

/** How long the confirmation link stays valid. */
export const OPTIN_TOKEN_TTL_HOURS = 72;

/** Path of the confirmation page — the hyperlink sent by e-mail points here. */
export const CONFIRMATION_PATH = '/newsletter/confirmation';

export const normalizeEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (email) => {
  const normalized = normalizeEmail(email);
  return normalized.length >= 5 && normalized.length <= 320 && EMAIL_PATTERN.test(normalized);
};
