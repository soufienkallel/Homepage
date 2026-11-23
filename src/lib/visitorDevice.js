/**
 * Shared by the cookieless measurement endpoints (api/page-views.ts, api/events.ts): which
 * requests come from bots (acknowledged, never counted), and the device class recorded
 * instead of the user agent.
 */
export const BOT_UA =
  /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime|monitor|facebookexternalhit|embedly|python|curl|wget|httpclient|go-http/i;

/** 'mobile' | 'tablet' | 'desktop' — the only trace of the user agent that is stored. */
export function deviceOf(userAgent) {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobi)/i.test(userAgent)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(userAgent)) return 'mobile';
  return 'desktop';
}
