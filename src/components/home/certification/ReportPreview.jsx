import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FamiliesTop,
  ReportHeader,
  SynthesisBlock,
  TotalBand,
  ValuationPanel,
  VehicleIdentity,
} from '../../report/ReportParts';
import { SAMPLE_REPORT_PATH } from '../../../data/sampleReport';

/**
 * La première page du rapport de démonstration, telle quelle, en aperçu : les mêmes composants
 * et les mêmes données que /exemple-de-rapport (src/components/report), à leur largeur
 * naturelle de 640 px, réduits à la largeur du cadre (échelle posée dans --pv-scale ci-dessous ;
 * sample-report.css, « .rp-pv ») et coupés en bas par un fondu. Un aperçu fait à la main finissait par ne plus
 * ressembler au vrai rapport : celui-ci ne peut pas diverger.
 *
 * `variant` règle la hauteur montrée : « hero » s'arrête après le prix le plus probable,
 * « showcase » montre aussi le début de la synthèse. Un lien posé sur tout l'aperçu mène au rapport
 * complet ; le texte de l'aperçu, trop petit pour être lu, est caché aux lecteurs d'écran et
 * remplacé par le libellé du lien (propre à chaque variante : deux liens, deux textes).
 *
 * L'accueil montre deux fois le même aperçu : `lazy` ne monte la page qu'à l'approche de
 * l'écran. Le HTML pré-rendu (et le premier affichage) ne porte donc qu'un exemplaire de
 * son texte, sans doublon ; le cadre, lui, réserve la place dès le départ. Ses titres sont
 * des paragraphes : l'aperçu n'ajoute aucun titre de section à la page.
 */
const NATURAL_WIDTH = 640;
const NATURAL_HEIGHT = { hero: 1060, showcase: 1150 };
const LINK_LABEL = {
  hero: 'Aperçu du rapport de démonstration',
  showcase: 'Première page du rapport de démonstration',
};

export default function ReportPreview({ variant = 'hero', lazy = false, className = '' }) {
  const frameRef = useRef(null);
  const [ready, setReady] = useState(!lazy || typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const frame = frameRef.current;
    if (ready || !frame) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setReady(true);
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [ready]);

  // Échelle = largeur du cadre / 640 px. Calculée ici et non en CSS (tan(atan2(100cqw, 640px))) :
  // un navigateur de téléphone évaluait cette formule de travers et affichait la page agrandie.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const applyScale = () =>
      frame.style.setProperty('--pv-scale', String(frame.clientWidth / NATURAL_WIDTH));
    applyScale();
    const observer = new ResizeObserver(applyScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={frameRef}
          className="rp-pv"
          style={{ aspectRatio: `${NATURAL_WIDTH} / ${NATURAL_HEIGHT[variant]}` }}
        >
          {ready && (
            <div className="rp-pv-page" aria-hidden="true">
              <article className="rp-sheet">
                <ReportHeader />
                <div className="rp-body">
                  <VehicleIdentity asText />
                  <FamiliesTop priority={variant === 'hero'} />
                  <TotalBand />
                  <ValuationPanel />
                  <SynthesisBlock asText />
                </div>
              </article>
            </div>
          )}
        </div>
        {/* Laid over the frame, not around it: the link's text is its label, not the page. */}
        <Link to={SAMPLE_REPORT_PATH} className="rp-pv-link">
          <span className="sr-only">{LINK_LABEL[variant]}</span>
        </Link>
      </div>
    </div>
  );
}
