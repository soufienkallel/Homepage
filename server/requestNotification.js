// E-mail sent to the team when a contact request is stored (api/contact-requests.js).
// Sent through Mailjet (same account as the double opt-in), from an address of the domain
// verified there.
import { CHANNELS, LOCATION_TYPES } from '../src/lib/contactRequestPolicy.js';
import { isMailjetConfigured, sendTeamEmail } from './mailjet.js';

const KIND_LABELS = {
  inspection: "Demande d'inspection",
  professionnel: 'Professionnel',
  partenaire: 'Partenaire',
  autre: 'Autre',
};

const recipient = () => process.env.REQUEST_NOTIFY_TO || 'info@mallouliauto.com';

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]
  );

const labelOf = (list, value) => list.find((item) => item.value === value)?.label || value;

/** [label, value] pairs worth reading, empty values dropped. */
function describe(reference, row, pageUrl) {
  const pairs = [
    ['Référence', reference],
    ['Type', KIND_LABELS[row.kind] || row.kind],
    ['Nom', row.full_name],
    ['Téléphone', row.phone],
    ['Contact préféré', labelOf(CHANNELS, row.preferred_channel)],
    ['E-mail', row.email],
    ['Société', row.company],
  ];
  if (row.kind === 'inspection') {
    pairs.push(
      [
        'Véhicule',
        [row.vehicle_make, row.vehicle_model, row.vehicle_year].filter(Boolean).join(' '),
      ],
      ['Annonce', row.listing_url],
      ['Objet', row.purpose],
      ['Lieu', labelOf(LOCATION_TYPES, row.location_type)],
      ['Ville', row.city],
      ['Date souhaitée', row.preferred_date]
    );
  }
  pairs.push(['Message', row.message], ['Page', pageUrl]);
  return pairs.filter(([, value]) => value);
}

/**
 * Tells the team a request arrived. Never throws: the request is already stored and the
 * visitor must not see an error because the mail service is down. Returns true when sent.
 * The log carries the reference and the error only, never a name, phone or e-mail.
 */
export async function notifyNewRequest({ reference, row, pageUrl }) {
  if (!isMailjetConfigured()) {
    console.warn(`[contact-requests] notification skipped for ${reference}: MJ_APIKEY_* not set`);
    return false;
  }

  try {
    const pairs = describe(reference, row, pageUrl);
    const kind = KIND_LABELS[row.kind] || row.kind;
    const text = pairs.map(([label, value]) => `${label} : ${value}`).join('\n');
    const html = `<table cellpadding="4" style="border-collapse:collapse">${pairs
      .map(
        ([label, value]) =>
          `<tr><td style="color:#555;vertical-align:top">${escapeHtml(label)}</td><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
      )
      .join('')}</table>`;

    await sendTeamEmail({
      from: process.env.REQUEST_NOTIFY_FROM || 'notifications@mallouliauto.com',
      fromName: 'MALLOULIAUTO site',
      to: recipient(),
      // Reply goes to the visitor when they gave an address.
      replyTo: row.email ? { email: row.email, name: row.full_name } : undefined,
      subject: `${kind} ${reference} — ${row.full_name}`.replace(/[\r\n]+/g, ' '),
      text,
      html,
    });
    console.info(`[contact-requests] notification accepted by Mailjet for ${reference}`);
    return true;
  } catch (error) {
    console.error(
      `[contact-requests] notification failed for ${reference}:`,
      error?.message || 'error'
    );
    return false;
  }
}
