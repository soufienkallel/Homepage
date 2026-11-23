import { trackEvent } from '../lib/analytics';
import { PARTNER_TYPES, RELATIONSHIP_LINE, countryName } from '../lib/partnerService';

/** « aij-automotive.de » from the stored URL; the URL itself if it can't be parsed. */
function siteLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * A partner's card, as /partenaires shows it and as the admin editor previews it
 * (docs/specs/2026-10-refonte-accueil.md §9). `preview`: no click is measured.
 */
export default function PartnerCard({ partner, preview = false }) {
  const place = [partner.city, countryName(partner.country)].filter(Boolean).join(', ');
  const typeLabel = PARTNER_TYPES.find((type) => type.value === partner.type)?.label;
  const books = partner.type !== 'technologie';

  return (
    <li id={partner.slug} className="border border-rule-2 p-5 flex flex-col gap-3 scroll-mt-[90px]">
      <div className="flex items-center gap-4">
        <span
          className={`w-24 h-16 flex-shrink-0 border border-rule flex items-center justify-center p-1 ${
            partner.logo_tile === 'dark' ? 'bg-black' : 'bg-white'
          }`}
        >
          {partner.logo_url && (
            <img
              src={partner.logo_url}
              alt=""
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink leading-snug">{partner.name}</h2>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">
            {[typeLabel, place].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {partner.description && (
        <p className="text-sm text-ink-2 leading-relaxed">{partner.description}</p>
      )}
      {partner.services?.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-ink-2 flex flex-col gap-0.5">
          {partner.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      )}

      <p className="text-sm text-ink border-t border-rule pt-3">
        {RELATIONSHIP_LINE[partner.type]}
      </p>
      {books && <p className="text-xs text-ink-3">Tarif : auprès du partenaire</p>}

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
        {books && partner.booking_phone && (
          <a
            href={`tel:${partner.booking_phone}`}
            onClick={() => !preview && trackEvent('partner_call', partner.slug)}
            className="inline-flex flex-col items-start px-4 py-2.5 bg-accent-ink hover:bg-ink transition-colors"
          >
            {/* Colour on <span>s: the global `a { color: inherit }` wins on the link. */}
            <span className="text-white text-sm font-bold">
              Réserver un diagnostic chez {partner.name}
            </span>
            <span className="text-white/85 font-mono text-xs">{partner.booking_phone}</span>
          </a>
        )}
        {partner.website_url && (
          <a
            href={partner.website_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => !preview && trackEvent('partner_link', partner.slug)}
            className={
              books && !partner.booking_phone
                ? 'inline-flex items-center px-4 py-2.5 bg-accent-ink hover:bg-ink transition-colors'
                : 'text-sm font-semibold underline underline-offset-[3px]'
            }
          >
            <span
              className={
                books && !partner.booking_phone ? 'text-white text-sm font-bold' : 'text-accent-ink'
              }
            >
              {books && !partner.booking_phone
                ? partner.type === 'centre'
                  ? `Réserver un diagnostic chez ${partner.name}`
                  : `Réserver sur ${partner.name}`
                : `Voir le site ${siteLabel(partner.website_url)} ↗`}
            </span>
          </a>
        )}
      </div>
    </li>
  );
}
