import { CONSENT_VERSION } from './consentPolicy';

export {
  CONSENT_VERSION,
  PRIVACY_CONSENT_TEXT,
  MARKETING_CONSENT_TEXT,
  CONFIRMATION_STATEMENT,
  MARKETING_EMAIL_REQUIRED,
  isValidEmail,
} from './consentPolicy';

const ERROR_MESSAGES = {
  rate_limited: 'Trop de demandes en peu de temps. Réessayez dans une heure.',
  stale_consent_version: 'Cette page a été mise à jour. Rechargez-la puis renvoyez le formulaire.',
};

const DEFAULT_ERROR =
  "Votre demande n'a pas pu être enregistrée. Réessayez ou écrivez-nous à info@mallouliauto.com.";

async function postJson(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, httpStatus: response.status, body };
}

/**
 * Records a consent event through the server (which adds the IP address and the
 * exact wording for CONSENT_VERSION). The browser never writes to the log.
 *
 * With marketingConsent = true, the server sends a confirmation e-mail: nothing is
 * subscribed until the link in that e-mail is opened and confirmed (double opt-in).
 *
 * @param {object} params
 * @param {string} params.email
 * @param {string} [params.name]
 * @param {string} [params.phone]
 * @param {'newsletter'|'contact'} params.source   Which form produced the event
 * @param {boolean} params.privacyAccepted         Privacy policy acceptance (required)
 * @param {boolean} params.marketingConsent        Marketing opt-in (optional, separate)
 * @param {string} [params.honeypot]               Hidden field, must stay empty
 * @returns {Promise<'pending'|'recorded'>}
 */
export async function recordConsent({
  email,
  name = null,
  phone = null,
  source,
  privacyAccepted,
  marketingConsent,
  honeypot = '',
}) {
  const { ok, body } = await postJson('/api/newsletter/subscribe', {
    email,
    name,
    phone,
    source,
    privacyAccepted: Boolean(privacyAccepted),
    marketingConsent: Boolean(marketingConsent),
    consentVersion: CONSENT_VERSION,
    pageUrl: typeof window !== 'undefined' ? window.location.href : null,
    website: honeypot,
  });

  if (!ok) {
    throw new Error(ERROR_MESSAGES[body.error] || DEFAULT_ERROR);
  }
  return body.status;
}

/**
 * Confirms a subscription from the token in the confirmation link.
 * @returns {Promise<'confirmed'|'already_confirmed'|'expired'|'invalid'>}
 */
export async function confirmSubscription(token) {
  const { body, httpStatus } = await postJson('/api/newsletter/confirm', { token });
  if (['confirmed', 'already_confirmed', 'expired', 'invalid'].includes(body.status)) {
    return body.status;
  }
  throw new Error(`Confirmation failed (HTTP ${httpStatus})`);
}
