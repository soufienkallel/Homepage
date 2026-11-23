/**
 * Where a visit comes from, as one `source · medium` pair. Shared by POST /api/page-views
 * (visits) and /api/admin/analytics (requests), so both are counted with the same rules.
 *
 * 1. The landing link's utm_* win (docs/campagne-utm.md).
 * 2. Without them, the referring site: search engines, social networks, messaging apps,
 *    else the site's host as a referral.
 * 3. No referrer, or our own site: "direct" (typed address, bookmark, shared link in an
 *    app that hides the referrer).
 */

const MAX = 100;

// Meta fills utm_source={{site_source_name}} with these codes.
const SOURCE_ALIASES = {
  fb: 'facebook',
  ig: 'instagram',
  msg: 'messenger',
  an: 'audience-network',
};

// Registrable-domain match on the referrer host, first match wins.
const REFERRERS = [
  { test: /(^|\.)google\.[a-z.]+$/, source: 'google', medium: 'recherche' },
  { test: /(^|\.)bing\.com$/, source: 'bing', medium: 'recherche' },
  { test: /(^|\.)duckduckgo\.com$/, source: 'duckduckgo', medium: 'recherche' },
  { test: /(^|\.)(yahoo\.com|search\.yahoo\.com)$/, source: 'yahoo', medium: 'recherche' },
  { test: /(^|\.)ecosia\.org$/, source: 'ecosia', medium: 'recherche' },
  { test: /(^|\.)(facebook\.com|fb\.com|fb\.me)$/, source: 'facebook', medium: 'social' },
  { test: /(^|\.)messenger\.com$/, source: 'messenger', medium: 'messaging' },
  { test: /(^|\.)instagram\.com$/, source: 'instagram', medium: 'social' },
  { test: /(^|\.)(linkedin\.com|lnkd\.in)$/, source: 'linkedin', medium: 'social' },
  { test: /(^|\.)(t\.co|x\.com|twitter\.com)$/, source: 'x', medium: 'social' },
  { test: /(^|\.)(youtube\.com|youtu\.be)$/, source: 'youtube', medium: 'social' },
  { test: /(^|\.)tiktok\.com$/, source: 'tiktok', medium: 'social' },
  { test: /(^|\.)(whatsapp\.com|wa\.me)$/, source: 'whatsapp', medium: 'messaging' },
  { test: /(^|\.)(telegram\.org|t\.me)$/, source: 'telegram', medium: 'messaging' },
];

const OWN_HOSTS = /(^|\.)(mallouliauto\.com|vercel\.app|localhost)$/;

/** Lower-case, trimmed, spaces to dashes, control characters dropped, capped. */
export function cleanTag(value) {
  if (typeof value !== 'string') return null;
  const text = value
    .normalize('NFKC')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, MAX);
  return text || null;
}

/** Host of a referrer URL without `www.`, or null. Path and query are never kept. */
export function referrerHost(referrer) {
  if (typeof referrer !== 'string' || !referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return (
      url.hostname
        .toLowerCase()
        .replace(/^www\./, '')
        .slice(0, 255) || null
    );
  } catch {
    return null;
  }
}

/**
 * @param {{ utm?: object|null, referrer?: string|null }} input
 * @returns {{ source: string, medium: string|null, campaign: string|null, content: string|null, referrerHost: string|null }}
 */
export function classifySource({ utm, referrer } = {}) {
  const tags = utm && typeof utm === 'object' ? utm : {};
  const host = referrerHost(referrer);
  const campaign = cleanTag(tags.utm_campaign);
  const content = cleanTag(tags.utm_content);
  const utmSource = cleanTag(tags.utm_source);

  if (utmSource) {
    return {
      source: SOURCE_ALIASES[utmSource] || utmSource,
      medium: cleanTag(tags.utm_medium),
      campaign,
      content,
      referrerHost: host,
    };
  }
  if (!host || OWN_HOSTS.test(host)) {
    return { source: 'direct', medium: null, campaign, content, referrerHost: host };
  }
  const known = REFERRERS.find((entry) => entry.test.test(host));
  return {
    source: known ? known.source : host,
    medium: known ? known.medium : 'referral',
    campaign,
    content,
    referrerHost: host,
  };
}
