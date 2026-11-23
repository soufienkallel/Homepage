import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../../icons';
import { INSTRUMENTS, TOTAL_INSTRUMENTS } from '../../../data/inspectionFacts';
import CertificateVerification from './CertificateVerification';
import { LaunchVideoCard, LaunchVideoDialog } from './LaunchVideo';

/**
 * « Pourquoi nous faire confiance » (docs/specs/2026-10-refonte-accueil.md, bloc 6) :
 * trois preuves montrées plutôt qu'affirmées — les instruments, la vérification d'un
 * rapport, la vidéo de lancement — puis les logos partenaires (PartnerLogos, juste
 * après). Pas de témoignage tant qu'aucun n'est réel. L'ancre #verifier est celle du
 * bouton « Vérifier un certificat » de l'en-tête.
 */
const SHOWN_INSTRUMENTS = INSTRUMENTS.slice(0, 4);

const tile = 'border border-rule p-6 flex flex-col gap-3 min-w-0';
const tileTitle = 'font-semibold text-ink leading-snug';

export default function TrustBand() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section id="verifier" className="py-20 border-t border-rule scroll-mt-[90px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
            Pourquoi nous faire confiance
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold leading-tight text-ink">
            Indépendants, équipés, vérifiables.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className={tile}>
            <p className="font-mono text-[40px] font-semibold leading-none text-ink">
              {TOTAL_INSTRUMENTS}
            </p>
            <h3 className={tileTitle}>instruments de mesure</h3>
            <p className="text-sm text-ink-2 leading-relaxed">{SHOWN_INSTRUMENTS.join(', ')}…</p>
            <Link to="/inspection" className="group mt-auto inline-flex items-center gap-2">
              <span className="text-sm font-semibold text-accent-ink group-hover:underline underline-offset-[3px]">
                Voir les points contrôlés
              </span>
              <ArrowRight className="w-4 h-4" accent="currentColor" />
            </Link>
          </div>

          <div className={tile}>
            <h3 className={tileTitle}>Vérifiez un rapport</h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Saisissez la référence, ou scannez le QR du rapport.
            </p>
            <div className="mt-auto">
              <CertificateVerification />
            </div>
          </div>

          <div className={tile}>
            <h3 className={tileTitle}>Nos premiers diagnostics</h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Les premières demandes sont arrivées : 20 secondes en images.
            </p>
            <LaunchVideoCard compact light onOpen={() => setVideoOpen(true)} className="mt-auto" />
          </div>
        </div>
      </div>

      <LaunchVideoDialog open={videoOpen} onClose={() => setVideoOpen(false)} />
    </section>
  );
}
