import { getCampaign } from './campaign';
import { recordConsent } from './consentService';
import { EMAIL, PHONE } from '../data/contactChannels';

const ERROR_MESSAGES = {
  rate_limited: 'Trop de demandes envoyées depuis cette connexion. Réessayez dans une heure.',
};

const DEFAULT_ERROR = `Votre demande n'a pas pu être envoyée. Réessayez, ou appelez-nous au ${PHONE.display} ou écrivez à ${EMAIL.display}.`;

export class ContactRequestError extends Error {
  constructor(message, fields = null) {
    super(message);
    this.fields = fields;
  }
}

/**
 * Sends an inspection or contact request (POST /api/contact-requests).
 * @param {object} payload fields as in src/lib/contactRequestPolicy.js
 * @returns {Promise<string>} the request reference (D-XXXXXX)
 */
export async function submitContactRequest(payload) {
  const { utm, referrer } = getCampaign();
  let response;
  try {
    response = await fetch('/api/contact-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, utm, referrer, pageUrl: window.location.href }),
    });
  } catch {
    throw new ContactRequestError(DEFAULT_ERROR);
  }
  const body = await response.json().catch(() => ({}));
  if (response.ok && body.reference) return body.reference;
  if (body.error === 'invalid_fields') {
    throw new ContactRequestError('Vérifiez les champs signalés.', body.fields || {});
  }
  throw new ContactRequestError(ERROR_MESSAGES[body.error] || DEFAULT_ERROR);
}

/**
 * Marketing opt-in of a request form. Call it once the request is stored: it sends the
 * double opt-in confirmation e-mail when the visitor ticked the separate marketing box.
 * Never throws: the request itself is already saved, only the subscription can fail
 * (e.g. Mailjet unreachable), and the page tells the visitor so.
 *
 * The consent log only knows the sources 'newsletter' and 'contact'; both request forms
 * use 'contact', and the page URL stored with the event says which form it was.
 *
 * @returns {Promise<'sent'|'failed'|null>} null when the box was not ticked
 */
export async function requestMarketingConfirmation({
  marketingConsent,
  email,
  fullName,
  phone,
  honeypot,
}) {
  if (!marketingConsent) return null;
  try {
    await recordConsent({
      email,
      name: fullName || null,
      phone: phone || null,
      source: 'contact',
      privacyAccepted: true, // the request form cannot be sent without it
      marketingConsent: true,
      honeypot,
    });
    return 'sent';
  } catch (error) {
    console.error('[consent] marketing opt-in failed', error);
    return 'failed';
  }
}
