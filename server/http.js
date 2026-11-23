import { isIP } from 'node:net';

/**
 * Public IP of the caller. On Vercel, `x-real-ip` and `x-forwarded-for` are set
 * by the edge network from the TCP connection. Anything that is not a valid IP
 * is dropped so it can never break the `inet` column.
 */
export function getClientIp(request) {
  const candidates = [
    request.headers.get('x-real-ip'),
    (request.headers.get('x-forwarded-for') || '').split(',')[0],
  ];
  for (const candidate of candidates) {
    const ip = (candidate || '').trim();
    if (ip && isIP(ip)) return ip;
  }
  return null;
}

export function getUserAgent(request) {
  return (request.headers.get('user-agent') || '').slice(0, 512) || null;
}

/** Parses a JSON body, returning null on malformed or oversized input. */
export async function readJson(request, maxBytes = 4096) {
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    const body = JSON.parse(text);
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

export const json = (status, body) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Canonical public origin used in e-mail links — never derived from the Host header. */
export const getSiteUrl = () =>
  (process.env.PUBLIC_SITE_URL || 'https://mallouliauto.com').replace(/\/+$/, '');
