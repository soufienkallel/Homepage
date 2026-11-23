import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../../icons';
import { supabase } from '../../../lib/supabase';
import { listPublicPartners } from '../../../lib/partnerService';

/**
 * Bandeau « Nos partenaires » de l'accueil. Les logos viennent de la table `partners`, gérée
 * dans /admin/partenaires (docs/specs/2026-10-refonte-accueil.md §9) : un logo n'apparaît
 * que si « Logo sur l'accueil » est coché ET si la fiche du partenaire est publiée, c'est-à-dire
 * validée par lui (la publication exige la date d'accord pour le logo). Il mène à sa carte
 * sur /partenaires. Aucune fiche publiée, ou base qui ne répond pas : le bandeau n'est pas
 * affiché, jamais un logo sans accord.
 *
 * Intitulé « Nos partenaires » : vrai à toute échelle, sans revendiquer plus que ce qui est
 * confirmé.
 */
function Logo({ partner, duplicate }) {
  const tile = `flex-shrink-0 w-[240px] h-32 mx-3 border border-rule-2 flex items-center justify-center p-1.5 ${
    partner.logo_tile === 'dark' ? 'bg-black' : 'bg-white'
  }`;
  const image = (
    <img
      src={partner.logo_url}
      alt={duplicate ? '' : partner.name}
      className="max-h-[122px] max-w-full object-contain"
      loading="lazy"
    />
  );
  return (
    <Link
      to={`/partenaires#${partner.slug}`}
      className={`${tile} hover:border-ink transition-colors`}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
    >
      {image}
    </Link>
  );
}

export default function PartnerLogos() {
  // null while loading. Nothing is shown until there is a logo to show.
  const [partners, setPartners] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listPublicPartners(supabase)
      .then((rows) => {
        if (!cancelled) {
          setPartners(
            rows.filter((row) => row.has_profile && row.show_logo_on_home && row.logo_url)
          );
        }
      })
      .catch((error) => {
        console.error('Failed to load partners', error);
        if (!cancelled) setPartners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!partners || partners.length === 0) return null;

  // Repeated 3x for the continuous scroll (.partner-marquee in index.css); the copies are
  // hidden from assistive technology and from the keyboard.
  const track = [0, 1, 2].flatMap((copy) => partners.map((p) => ({ p, copy })));

  return (
    <section className="py-14 bg-ground-2 border-t border-rule overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em]">
          Nos partenaires
        </p>
        <Link to="/partenaires" className="group inline-flex items-center gap-2">
          <span className="text-sm font-semibold text-accent-ink group-hover:underline underline-offset-[3px]">
            Vous préférez un garage près de chez vous ? Voir nos centres partenaires
          </span>
          <ArrowRight className="w-4 h-4" accent="currentColor" />
        </Link>
      </div>

      <div className="partner-marquee min-h-32">
        <div className="partner-marquee__track">
          {track.map(({ p, copy }) => (
            <Logo key={`${p.slug}-${copy}`} partner={p} duplicate={copy > 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
