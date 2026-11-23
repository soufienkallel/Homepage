import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import InspectionCTA from '../components/InspectionCTA';
import SampleReport from '../components/report/SampleReport';
import { ArrowRight } from '../components/icons';
import { trackEvent } from '../lib/analytics';
import { SAMPLE_REPORT_PATH } from '../data/sampleReport';

/**
 * /exemple-de-rapport : le rapport complet d'un diagnostic de démonstration
 * (docs/specs/2026-10-refonte-accueil.md §7), pour que le visiteur voie ce qu'il recevra
 * avant de demander quoi que ce soit. Le rapport lui-même est SampleReport, reproduit
 * section par section depuis src/data/sampleReport.js.
 */
export default function ExempleRapport() {
  return (
    <div className="bg-white">
      <SEO
        title="Exemple de rapport de diagnostic"
        description="Le rapport complet d'un diagnostic de voiture d'occasion MALLOULIAUTO : photos, mesures, constats chiffrés en dinars et total des réparations."
        path={SAMPLE_REPORT_PATH}
      />
      <PageHero
        eyebrow="Exemple de rapport"
        title="Voici le rapport que vous recevez."
        lead="Photos, mesures, chaque défaut chiffré en dinars, le total des réparations et le prix le plus probable du véhicule."
      >
        <Link
          to="/demande-inspection"
          onClick={() => trackEvent('cta_click', 'sample-hero')}
          className="inline-flex items-center gap-2 px-6 py-4 bg-accent-ink hover:bg-white/15 transition-colors"
        >
          <span className="text-white font-bold inline-flex items-center gap-2">
            Demander un diagnostic
            <ArrowRight className="w-5 h-5" accent="currentColor" />
          </span>
        </Link>
      </PageHero>

      <SampleReport />

      <InspectionCTA title="Une voiture à faire diagnostiquer ?" source="sample-report" />
    </div>
  );
}
