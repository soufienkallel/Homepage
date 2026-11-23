import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import { ArrowRight } from '../components/icons';
import { supabase } from '../lib/supabase';
import PartnerCard from '../components/PartnerCard';
import { PARTNER_TYPES, listPublicPartners } from '../lib/partnerService';

/**
 * /partenaires — les cartes des partenaires publiées depuis /admin/partenaires
 * (docs/specs/2026-10-refonte-accueil.md §9, décisions du 16 oct. 2026) :
 * - un centre partenaire réalise le diagnostic dans son atelier, avec son personnel formé,
 *   et émet le rapport à son nom ; on réserve par ses canaux, jamais par notre formulaire ;
 * - aucun prix : chaque partenaire fixe le sien ;
 * - la ligne « Avec MALLOULIAUTO » vient du type (RELATIONSHIP_LINE), pas d'un texte libre ;
 * - aucune carte inventée : sans carte publiée, la page le dit.
 * Chaque carte porte l'ancre de son identifiant (/partenaires#myrage), pour être partagée.
 */
const TYPE_ORDER = PARTNER_TYPES.map((type) => type.value);

export default function Partenaires() {
  const [partners, setPartners] = useState(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState('all');
  const { hash } = useLocation();

  useEffect(() => {
    let cancelled = false;
    listPublicPartners(supabase)
      .then((rows) => {
        if (!cancelled) setPartners(rows.filter((row) => row.has_profile));
      })
      .catch((error) => {
        console.error('Failed to load partners', error);
        if (!cancelled) {
          setFailed(true);
          setPartners([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The cards arrive after the route has rendered: scroll to /partenaires#<slug> once they do.
  useEffect(() => {
    if (!partners || !hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [partners, hash]);

  const sorted = useMemo(
    () =>
      (partners || [])
        .slice()
        .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)),
    [partners]
  );
  const presentTypes = PARTNER_TYPES.filter((type) => sorted.some((p) => p.type === type.value));
  const shown = filter === 'all' ? sorted : sorted.filter((p) => p.type === filter);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Nos partenaires"
        description="Les centres partenaires MALLOULIAUTO en Tunisie et en Allemagne, où faire le diagnostic d'une voiture d'occasion, et les partenaires de la plateforme."
        path="/partenaires"
      />
      <PageHero
        eyebrow="Nos partenaires"
        title="Faites le diagnostic chez un partenaire."
        lead="En Tunisie et en Allemagne. La réservation se fait directement auprès du partenaire."
      />

      <section className="py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {partners === null && (
            <p className="text-sm text-ink-2" role="status">
              Chargement des partenaires…
            </p>
          )}

          {partners !== null && sorted.length === 0 && (
            <div className="border border-rule-2 p-6 max-w-2xl" role="status">
              <p className="font-semibold text-ink">
                {failed
                  ? 'Les partenaires ne peuvent pas être affichés pour le moment.'
                  : 'Nos premiers partenaires arrivent.'}
              </p>
              <p className="text-sm text-ink-2 mt-2">
                En attendant, nos inspecteurs se déplacent chez le vendeur ou chez vous.
              </p>
            </div>
          )}

          {presentTypes.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filtrer par type">
              {[{ value: 'all', plural: 'Tous' }, ...presentTypes].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  aria-pressed={filter === type.value}
                  onClick={() => setFilter(type.value)}
                  className={`px-3.5 py-1.5 border text-sm font-semibold transition-colors ${
                    filter === type.value
                      ? 'bg-ink border-ink text-white'
                      : 'border-rule-2 text-ink-2 hover:border-ink'
                  }`}
                >
                  {type.plural}
                </button>
              ))}
            </div>
          )}

          {shown.length > 0 && (
            <ul className="grid md:grid-cols-2 gap-3">
              {shown.map((partner) => (
                <PartnerCard key={partner.slug} partner={partner} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="py-12 border-t border-rule bg-ground-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          <Link to="/demande-inspection" className="group flex items-center gap-2">
            <span className="text-[15px] text-ink">
              Vous préférez que MALLOULIAUTO se déplace ?{' '}
              <span className="font-semibold text-accent-ink group-hover:underline underline-offset-[3px]">
                Demander un diagnostic
              </span>
            </span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" accent="currentColor" />
          </Link>
          <Link to="/devenir-partenaire" className="group flex items-center gap-2">
            <span className="text-[15px] text-ink">
              Votre garage veut proposer le diagnostic ?{' '}
              <span className="font-semibold text-accent-ink group-hover:underline underline-offset-[3px]">
                Devenir partenaire
              </span>
            </span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" accent="currentColor" />
          </Link>
        </div>
      </section>
    </div>
  );
}
