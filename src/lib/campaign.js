/**
 * Campaign attribution without cookies: the `utm_*` parameters of the landing page
 * are kept in this tab's sessionStorage and sent with an inspection or contact
 * request, so /admin/demandes shows which ad produced it.
 */
const KEY = 'ma_campaign';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function storage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Call once at app start. Keeps the first landing with UTM parameters of the tab. */
export function captureCampaign() {
  if (typeof window === 'undefined') return;
  const store = storage();
  if (!store || store.getItem(KEY)) return;
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 200);
  }
  if (!Object.keys(utm).length) return;
  try {
    store.setItem(
      KEY,
      JSON.stringify({ utm, referrer: document.referrer ? document.referrer.slice(0, 2048) : null })
    );
  } catch {
    // Storage full or blocked: attribution is best-effort.
  }
}

/** @returns {{ utm: object|null, referrer: string|null }} */
export function getCampaign() {
  const store = storage();
  try {
    const saved = store ? JSON.parse(store.getItem(KEY) || 'null') : null;
    return {
      utm: saved?.utm ?? null,
      referrer: saved?.referrer ?? (document.referrer ? document.referrer.slice(0, 2048) : null),
    };
  } catch {
    return { utm: null, referrer: null };
  }
}
