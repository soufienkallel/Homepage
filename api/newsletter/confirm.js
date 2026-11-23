import { createHash } from 'node:crypto';
import { CONFIRMATION_PATH, CONFIRMATION_STATEMENT } from '../../src/lib/consentPolicy.js';
import { getClientIp, getSiteUrl, getUserAgent, json, readJson } from '../../server/http.js';
import { addContactToList } from '../../server/mailjet.js';
import { getSupabaseAdmin } from '../../server/supabaseAdmin.js';

// randomBytes(32) encoded as base64url.
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const HTTP_STATUS = { confirmed: 200, already_confirmed: 200, expired: 410, invalid: 404 };

/**
 * Called by the confirmation page when the subscriber clicks « Confirmer mon
 * inscription ». This is a POST from an explicit button, not a GET on the e-mail
 * link, so mail scanners that prefetch links cannot confirm on the user's behalf.
 *
 * Proof written on the `confirmed` event: the hyperlink the subscriber opened
 * (the confirmation page URL), the timestamp (DB clock, timestamptz), the
 * statement next to the button, the public IP and the user agent.
 */
export async function POST(request) {
  const body = await readJson(request);
  const token = typeof body?.token === 'string' ? body.token : '';
  if (!TOKEN_PATTERN.test(token)) return json(404, { status: 'invalid' });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('[newsletter/confirm] missing server configuration');
    return json(503, { error: 'unavailable' });
  }

  try {
    const { data, error } = await supabase.rpc('confirm_newsletter_optin', {
      p_token_hash: createHash('sha256').update(token).digest('hex'),
      p_confirmation_url: `${getSiteUrl()}${CONFIRMATION_PATH}?token=${token}`,
      p_statement: CONFIRMATION_STATEMENT,
      p_ip_address: getClientIp(request),
      p_user_agent: getUserAgent(request),
    });
    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    const status = HTTP_STATUS[result?.status] ? result.status : 'invalid';

    if (status === 'confirmed') {
      // The proof is already stored: a Mailjet failure must not undo the
      // confirmation. The contact can be re-synced from marketing_consents_current.
      try {
        await addContactToList({ email: result.email, name: result.full_name });
      } catch (syncError) {
        console.error('[newsletter/confirm] Mailjet list sync failed:', syncError?.message);
      }
    }

    return json(HTTP_STATUS[status], { status });
  } catch (error) {
    console.error('[newsletter/confirm] failed:', error?.message || error);
    return json(500, { error: 'server_error' });
  }
}
