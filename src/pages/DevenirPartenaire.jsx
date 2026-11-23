import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import PartnerChannels from '../components/home/certification/PartnerChannels';

/**
 * /devenir-partenaire — recrutement des centres partenaires : garages et ateliers qui
 * proposent le diagnostic dans leur atelier, rapport à leur nom (refonte du 16 oct. 2026,
 * docs/specs/2026-10-refonte-accueil.md §9). Ce contenu était sur l'accueil (« Marque
 * blanche ») ; l'accueil n'en parle plus.
 */
export default function DevenirPartenaire() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Devenir partenaire"
        description="Garages et ateliers : proposez le diagnostic MALLOULIAUTO de voitures d'occasion dans votre atelier, avec notre protocole et nos instruments, le rapport à votre nom."
        path="/devenir-partenaire"
      />
      <PageHero
        eyebrow="Devenir partenaire"
        title="Proposez le diagnostic dans votre atelier."
        lead="Notre protocole et nos instruments, le rapport à votre nom."
      >
        <Link to="/partenaires" className="text-[#f0a184] underline underline-offset-[3px]">
          Voir nos centres partenaires
        </Link>
      </PageHero>
      <PartnerChannels />
    </div>
  );
}
