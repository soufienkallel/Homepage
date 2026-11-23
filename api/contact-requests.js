import { createHash, randomInt } from 'node:crypto';
import { CONSENT_VERSION, PRIVACY_CONSENT_TEXT } from '../src/lib/consentPolicy.js';
import { validateContactRequest } from '../src/lib/contactRequestPolicy.js';
import { getClientIp, getUserAgent, json, readJson } from '../server/http.js';
import { notifyNewRequest } from '../server/requestNotification.js';
import { getSupabaseAdmin } from '../server/supabaseAdmin.js';

// Generous on purpose: Tunisian mobile operators put many customers behind one public
// IP (carrier-grade NAT). The honeypot and server-side validation stop simple spam.
const MAX_REQUESTS_PER_IP_PER_HOUR = 20;
// No 0/O, 1/I/L: a reference is read out over the phone.
const REFERENCE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

const newReference = () =>
  `D-${Array.from({ length: 6 }, () => REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)]).join('')}`;

const hashIp = (ip) =>
  ip
    ? createHash('sha256')
        .update(`${ip}${process.env.RATE_LIMIT_SALT ?? 'mallouliauto'}`)
        .digest('hex')
    : null;

const clip = (value, max) => (typeof value === 'string' && value ? value.slice(0, max) : null);

function cleanUtm(value) {
  if (!value || typeof value !== 'object') return null;
  const utm = {};
  for (const key of UTM_KEYS) {
    const v = clip(value[key], 200);
    if (v) utm[key] = v;
  }
  return Object.keys(utm).length ? utm : null;
}

/**
 * POST /api/contact-requests — public. Records an inspection request
 * (/demande-inspection) or a professional / partner / other message (/contact).
 * Responds { reference } with 201.
 */
export async function POST(request) {
  const body = await readJson(request, 16384);
  if (!body) return json(400, { error: 'invalid_request' });

  // Honeypot: pretend it worked, do not tell the bot why it failed.
  if (body.website) return json(201, { reference: newReference() });

  const { data, errors } = validateContactRequest(body);
  if (Object.keys(errors).length) return json(400, { error: 'invalid_fields', fields: errors });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('[contact-requests] missing server configuration');
    return json(503, { error: 'unavailable' });
  }

  const ipHash = hashIp(getClientIp(request));

  try {
    if (ipHash) {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('contact_requests')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', since);
      if (error) throw error;
      if ((count ?? 0) >= MAX_REQUESTS_PER_IP_PER_HOUR) return json(429, { error: 'rate_limited' });
    }

    const row = {
      ...data,
      page_url: clip(body.pageUrl, 2048),
      referrer: clip(body.referrer, 2048),
      utm: cleanUtm(body.utm),
      ip_hash: ipHash,
      user_agent: getUserAgent(request),
      privacy_consent_version: CONSENT_VERSION,
      privacy_consent_text: PRIVACY_CONSENT_TEXT,
    };

    // A reference collision is astronomically rare; retry a couple of times anyway.
    for (let attempt = 0; attempt < 3; attempt++) {
      const reference = newReference();
      const { error } = await supabase.from('contact_requests').insert({ ...row, reference });
      if (!error) {
        // Awaited: a serverless function may be frozen once the response is sent.
        await notifyNewRequest({ reference, row, pageUrl: row.page_url });
        return json(201, { reference });
      }
      if (error.code !== '23505') throw error;
    }
    throw new Error('could not allocate a unique reference');
  } catch (error) {
    // No name, phone or e-mail in the logs.
    console.error('[contact-requests] failed:', error?.message || error);
    return json(500, { error: 'server_error' });
  }
}
