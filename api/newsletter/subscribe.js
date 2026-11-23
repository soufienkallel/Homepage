import { createHash, randomBytes } from 'node:crypto';
import {
  CONFIRMATION_PATH,
  CONSENT_VERSION,
  MARKETING_CONSENT_TEXT,
  OPTIN_TOKEN_TTL_HOURS,
  PRIVACY_CONSENT_TEXT,
  isValidEmail,
  normalizeEmail,
} from '../../src/lib/consentPolicy.js';
import { getClientIp, getSiteUrl, getUserAgent, json, readJson } from '../../server/http.js';
import { isMailjetConfigured, sendConfirmationEmail } from '../../server/mailjet.js';
import { getSupabaseAdmin } from '../../server/supabaseAdmin.js';

const SOURCES = new Set(['newsletter', 'contact']);
const MAX_EVENTS_PER_IP_PER_HOUR = 10;
const MAX_REQUESTS_PER_EMAIL_PER_HOUR = 3;

const clip = (value, max) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? text.slice(0, max) : null;
};

const parsePageUrl = (value) => {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href.slice(0, 2048) : null;
  } catch {
    return null;
  }
};

async function countSince(supabase, column, value, extra = {}) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  let query = supabase
    .from('marketing_consents')
    .select('id', { count: 'exact', head: true })
    .eq(column, value)
    .gte('created_at', since);
  for (const [key, val] of Object.entries(extra)) query = query.eq(key, val);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/**
 * Records a consent event from the newsletter or contact form.
 *  - marketingConsent = true  → `requested` event + confirmation e-mail (double opt-in)
 *  - marketingConsent = false → `form_submitted` event (contact form only, privacy proof)
 * The wording stored is the server's own copy for CONSENT_VERSION, never text sent
 * by the browser.
 */
export async function POST(request) {
  const body = await readJson(request);
  if (!body) return json(400, { error: 'invalid_request' });

  // Honeypot: pretend it worked, do not tell the bot why it failed.
  if (body.website) return json(202, { status: 'pending' });

  const email = normalizeEmail(body.email);
  const source = body.source;
  const marketingConsent = body.marketingConsent === true;

  if (!SOURCES.has(source) || !isValidEmail(email) || body.privacyAccepted !== true) {
    return json(400, { error: 'invalid_request' });
  }
  if (source === 'newsletter' && !marketingConsent) {
    return json(400, { error: 'marketing_consent_required' });
  }
  if (body.consentVersion !== CONSENT_VERSION) {
    // The page shows an older wording than the one we would store: reload first.
    return json(409, { error: 'stale_consent_version' });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase || (marketingConsent && !isMailjetConfigured())) {
    console.error('[newsletter/subscribe] missing server configuration');
    return json(503, { error: 'unavailable' });
  }

  const ip = getClientIp(request);

  try {
    if (ip && (await countSince(supabase, 'ip_address', ip)) >= MAX_EVENTS_PER_IP_PER_HOUR) {
      return json(429, { error: 'rate_limited' });
    }
    if (
      marketingConsent &&
      (await countSince(supabase, 'email', email, { event_type: 'requested' })) >=
        MAX_REQUESTS_PER_EMAIL_PER_HOUR
    ) {
      return json(429, { error: 'rate_limited' });
    }

    const { data: event, error: eventError } = await supabase
      .from('marketing_consents')
      .insert({
        email,
        full_name: clip(body.name, 200),
        phone: clip(body.phone, 50),
        source,
        event_type: marketingConsent ? 'requested' : 'form_submitted',
        consent_version: CONSENT_VERSION,
        privacy_accepted: true,
        privacy_consent_text: PRIVACY_CONSENT_TEXT,
        marketing_consent: marketingConsent,
        marketing_consent_text: marketingConsent ? MARKETING_CONSENT_TEXT : null,
        consent_page_url: parsePageUrl(body.pageUrl),
        ip_address: ip,
        user_agent: getUserAgent(request),
      })
      .select('id')
      .single();
    if (eventError) throw eventError;

    if (!marketingConsent) return json(201, { status: 'recorded' });

    const token = randomBytes(32).toString('base64url');
    const { error: tokenError } = await supabase.from('newsletter_optin_tokens').insert({
      email,
      token_hash: createHash('sha256').update(token).digest('hex'),
      request_event_id: event.id,
      expires_at: new Date(Date.now() + OPTIN_TOKEN_TTL_HOURS * 3600 * 1000).toISOString(),
    });
    if (tokenError) throw tokenError;

    await sendConfirmationEmail({
      email,
      confirmationUrl: `${getSiteUrl()}${CONFIRMATION_PATH}?token=${token}`,
      ttlHours: OPTIN_TOKEN_TTL_HOURS,
    });

    return json(202, { status: 'pending' });
  } catch (error) {
    // No e-mail address in the logs.
    console.error('[newsletter/subscribe] failed:', error?.message || error);
    return json(500, { error: 'server_error' });
  }
}
