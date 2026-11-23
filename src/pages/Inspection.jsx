import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import InspectionCTA from '../components/InspectionCTA';
import CoverageChecklist from '../components/home/certification/CoverageChecklist';
import InspectionPurposes from '../components/home/certification/InspectionPurposes';
import { TOTAL_INSTRUMENTS, TOTAL_POINTS } from '../data/inspectionFacts';

/**
 * /inspection — tout ce que couvre le diagnostic. La liste complète a quitté l'accueil
 * lors de la refonte du 16 oct. 2026 (docs/specs/2026-10-refonte-accueil.md) : l'accueil
 * en montre l'essentiel (« Ce que nous repérons ») et renvoie ici.
 */
export default function Inspection() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Ce que couvre le diagnostic"
        description={`Le diagnostic complet MALLOULIAUTO d'une voiture d'occasion : ${TOTAL_POINTS} points contrôlés selon un protocole fixe, ${TOTAL_INSTRUMENTS} instruments de mesure, la liste publiée.`}
        path="/inspection"
      />
      <PageHero
        eyebrow="Ce que couvre le diagnostic"
        title={`${TOTAL_POINTS} points contrôlés, ${TOTAL_INSTRUMENTS} instruments.`}
        lead="La même méthode pour chaque voiture, et la liste complète de ce qui est contrôlé."
      />
      <CoverageChecklist />
      <InspectionPurposes />
      <InspectionCTA source="inspection-page" />
    </div>
  );
}
