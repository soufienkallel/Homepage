/**
 * Cookieless visit measurement (docs/specs/2026-09-admin-analytics.md). One page view per
 * route, sent to POST /api/page-views. A visit is one load of the site in this tab: its id
 * lives in memory only — nothing is written to cookies or storage, so a reload or a later
 * return counts as a new visit. No measurement for the admin, the login page, automated
 * browsers, or visitors who ask not to be tracked (Global Privacy Control, Do Not Track),
 * and none for addresses that are not a page of the site (src/lib/trackedPaths.js).
 */

import { trackedPath } from './trackedPaths';

const EXCLUDED = /^\/(admin|login)(\/|$)/;

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // RFC 4122 v4 layout from Math.random: only needs to be unique among a few page views.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function measurementAllowed() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (navigator.webdriver) return false;
  if (navigator.globalPrivacyControl === true) return false;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return false;
  return true;
}

// Attribution of this load, read once: later in-app navigation keeps the landing's.
const visit = (() => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 200);
  }
  return {
    id: randomId(),
    utm: Object.keys(utm).length ? utm : null,
    referrer: document.referrer ? document.referrer.slice(0, 2048) : null,
  };
})();

let entrySent = false;
let lastPath = null;
let adminLoad = false;

/** Records a view of `pathname`. Safe to call on every route change; never throws. */
export function trackPageView(pathname) {
  if (!visit || adminLoad || !measurementAllowed()) return;
  const path = String(pathname || '/').slice(0, 200);
  if (EXCLUDED.test(path)) {
    // A load that starts in the admin (or passes through it) is not measured at all.
    adminLoad = true;
    return;
  }
  // Not a page of the site (NotFound): skipped, so the next real page becomes the entry.
  const page = trackedPath(path);
  if (!page || page === lastPath) return;
  lastPath = page;

  const body = JSON.stringify({
    visitId: visit.id,
    path: page,
    isEntry: !entrySent,
    utm: visit.utm,
    referrer: visit.referrer,
  });
  entrySent = true;

  try {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon && navigator.sendBeacon('/api/page-views', blob)) return;
    fetch('/api/page-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Measurement is best-effort: it must never break the page.
  }
}

/**
 * Click events of the same cookieless measurement (docs/specs/2026-10-refonte-accueil.md):
 * which button brings requests, calls and WhatsApp messages, and how many visitors each
 * partner centre receives from the site. Same rules as page views: tied to the in-memory
 * visit id, nothing stored in the browser, nothing for the admin or opted-out visitors.
 *
 * `name` is one of EVENT_NAMES; `target` names the place or the partner (a-z, 0-9, dashes,
 * ≤ 60 characters). Anything else is dropped here and again by POST /api/events.
 */
export const EVENT_NAMES = [
  'cta_click',
  'call_click',
  'whatsapp_click',
  'partner_call',
  'partner_link',
];
const EVENT_TARGET = /^[a-z0-9-]{1,60}$/;

export function trackEvent(name, target) {
  if (!visit || adminLoad || !measurementAllowed()) return;
  if (!EVENT_NAMES.includes(name) || !EVENT_TARGET.test(String(target || ''))) return;
  const page = trackedPath(window.location.pathname);
  if (!page) return;

  const body = JSON.stringify({ visitId: visit.id, path: page, name, target });
  try {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon && navigator.sendBeacon('/api/events', blob)) return;
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Measurement is best-effort: it must never break the page.
  }
}
