// Mailjet REST calls used by the double opt-in.
// Send API v3.1:  POST https://api.mailjet.com/v3.1/send
// Contacts API:   POST https://api.mailjet.com/v3/REST/contactslist/{list_ID}/managecontact
// Both use HTTP Basic auth with MJ_APIKEY_PUBLIC:MJ_APIKEY_PRIVATE.

const API_BASE = 'https://api.mailjet.com';

function getConfig() {
  const publicKey = process.env.MJ_APIKEY_PUBLIC;
  const privateKey = process.env.MJ_APIKEY_PRIVATE;
  if (!publicKey || !privateKey) return null;
  return {
    auth: `Basic ${Buffer.from(`${publicKey}:${privateKey}`).toString('base64')}`,
    senderEmail: process.env.MJ_SENDER_EMAIL || 'newsletter@mallouliauto.com',
    senderName: process.env.MJ_SENDER_NAME || 'MALLOULIAUTO',
    listId: process.env.MJ_LIST_ID || null,
  };
}

export const isMailjetConfigured = () => getConfig() !== null;

async function call(path, body, config) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: config.auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    // The response body can echo the recipient address: log the status only.
    throw new Error(`Mailjet ${path} failed with HTTP ${response.status}`);
  }
  return response.json();
}

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]
  );

/** Sends the double opt-in e-mail containing the confirmation hyperlink. */
export async function sendConfirmationEmail({ email, confirmationUrl, ttlHours }) {
  const config = getConfig();
  if (!config) throw new Error('Mailjet is not configured');

  const safeUrl = escapeHtml(confirmationUrl);
  const text = [
    'Bonjour,',
    '',
    'Vous avez demandé à recevoir les communications de MALLOULIAUTO par e-mail. Pour confirmer votre inscription, ouvrez le lien ci-dessous :',
    '',
    confirmationUrl,
    '',
    `Ce lien est valable ${ttlHours} heures. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : aucune inscription ne sera enregistrée.`,
    '',
    'MALLOULIAUTO — Sfax, Tunisie',
  ].join('\n');

  const html = `<p>Bonjour,</p>
<p>Vous avez demandé à recevoir les communications de MALLOULIAUTO par e-mail. Pour confirmer votre inscription, cliquez sur le lien ci-dessous :</p>
<p><a href="${safeUrl}">Confirmer mon inscription</a></p>
<p>Ce lien est valable ${ttlHours} heures. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : aucune inscription ne sera enregistrée.</p>
<p>MALLOULIAUTO — Sfax, Tunisie</p>`;

  await call(
    '/v3.1/send',
    {
      Messages: [
        {
          From: { Email: config.senderEmail, Name: config.senderName },
          To: [{ Email: email }],
          Subject: 'Confirmez votre inscription — MALLOULIAUTO',
          TextPart: text,
          HTMLPart: html,
        },
      ],
    },
    config
  );
}

/**
 * Sends one internal e-mail (notifications to the team). `from` must be an address of the
 * domain verified in Mailjet. Throws when Mailjet is not configured or refuses the message.
 */
export async function sendTeamEmail({ from, fromName, to, replyTo, subject, text, html }) {
  const config = getConfig();
  if (!config) throw new Error('Mailjet is not configured');

  const result = await call(
    '/v3.1/send',
    {
      Messages: [
        {
          From: { Email: from || config.senderEmail, Name: fromName || config.senderName },
          To: [{ Email: to }],
          ...(replyTo ? { ReplyTo: { Email: replyTo.email, Name: replyTo.name } } : {}),
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    },
    config
  );
  const status = result?.Messages?.[0]?.Status;
  if (status !== 'success') throw new Error(`Mailjet message status: ${status ?? 'unknown'}`);
}

/**
 * Adds a confirmed subscriber to the Mailjet list. `addforce` re-subscribes a
 * contact that had unsubscribed — correct here, since they just confirmed again.
 * Returns false when no list is configured (the export view remains the fallback).
 */
export async function addContactToList({ email, name }) {
  const config = getConfig();
  if (!config || !config.listId) return false;

  await call(
    `/v3/REST/contactslist/${encodeURIComponent(config.listId)}/managecontact`,
    { Email: email, ...(name ? { Name: name } : {}), Action: 'addforce' },
    config
  );
  return true;
}
