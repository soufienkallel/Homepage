/**
 * Pages recorded by the visit measurement (docs/specs/2026-09-admin-analytics.md): the
 * public routes of src/App.jsx. Any other address — mistyped or probed, which renders
 * NotFound — is not recorded, so it never shows up in the dashboard's entry pages.
 *
 * Used by src/lib/analytics.js (the browser skips the view, so the next real page of
 * the visit becomes its entry page) and by api/page-views.ts (a request for any other
 * path is acknowledged and dropped).
 *
 * Keep in sync with the routes of src/App.jsx: a new public page must be added here, or
 * its views are silently dropped. scripts/prerender.mjs pre-renders the same list.
 */
export const PUBLIC_PAGES = [
  '/',
  '/tarifs',
  '/technology',
  '/about',
  '/guides',
  '/careers',
  '/contact',
  '/privacy',
  '/terms',
  '/newsletter/confirmation',
  '/demande-inspection',
  '/professionnels',
  '/devenir-partenaire',
  '/partenaires',
  '/inspection',
  '/exemple-de-rapport',
];
const PAGES = new Set(PUBLIC_PAGES);

// One guide per slug. An unknown slug (« Article introuvable ») still matches: telling
// it apart would need a database lookup on every page view.
const GUIDE = /^\/guides\/[a-z0-9._~%-]{1,150}$/;

/**
 * The path to record for `pathname`, or null when it is not a page of the site.
 * Trailing slashes are dropped and case is folded, as the router matches routes
 * case-insensitively (/Tarifs renders /tarifs).
 */
export function trackedPath(pathname) {
  if (typeof pathname !== 'string' || pathname.length > 200) return null;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '').toLowerCase() : pathname;
  return PAGES.has(path) || GUIDE.test(path) ? path : null;
}
