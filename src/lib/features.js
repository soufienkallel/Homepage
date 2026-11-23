/**
 * Build-time switches read by the public site.
 *
 * Always read env vars by property: referencing `import.meta.env` as a whole makes Vite
 * inline every VITE_* variable into the public bundle.
 */

/**
 * The newsletter form in the footer. Hidden unless VITE_NEWSLETTER_ENABLED=true: it only
 * works once the server has MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE and MJ_LIST_ID (otherwise
 * subscribing answers 503). The separate marketing checkbox of /contact and /demande-inspection
 * is not behind this switch: a failed opt-in never blocks the request (see
 * requestMarketingConfirmation in src/lib/contactRequests.js).
 */
export const NEWSLETTER_FORM_ENABLED = import.meta.env.VITE_NEWSLETTER_ENABLED === 'true';
