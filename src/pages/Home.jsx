import SEO from '../components/SEO';
import InspectionCTA from '../components/InspectionCTA';
import HeroCertification from '../components/home/certification/HeroCertification';
import SurprisesGrid from '../components/home/certification/SurprisesGrid';
import ReportShowcase from '../components/home/certification/ReportShowcase';
import AudienceDoors from '../components/home/certification/AudienceDoors';
import CertificationFlow from '../components/home/certification/CertificationFlow';
import TrustBand from '../components/home/certification/TrustBand';
import PartnerLogos from '../components/home/certification/PartnerLogos';
import FAQ from '../components/home/certification/FAQ';
import { questions as faqQuestions } from '../data/homeFaqData';
import { BASE_PRICE_TND } from '../data/pricing';

/**
 * Accueil, refonte du 16 oct. 2026 (docs/specs/2026-10-refonte-accueil.md) : une promesse,
 * trois publics, sept blocs, une action. Ce qui en est sorti a sa page : la couverture
 * complète sur /inspection, le partenariat sur /devenir-partenaire, l'offre showroom sur
 * /professionnels, les partenaires sur /partenaires.
 */
export default function Home() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Diagnostic de voiture d'occasion avant achat"
        description={`Achetez ou vendez une voiture d'occasion sans mauvaise surprise : diagnostic par un inspecteur indépendant, en Tunisie. Dès ${BASE_PRICE_TND} TND TTC.`}
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': ['Organization', 'AutomotiveBusiness'],
              '@id': 'https://mallouliauto.com/#organization',
              name: 'MALLOULIAUTO',
              url: 'https://mallouliauto.com',
              logo: 'https://mallouliauto.com/favicon.svg',
              description: `Service de diagnostic de voitures d'occasion basé à Sfax, en Tunisie, pour les particuliers, les showrooms et les revendeurs. Un inspecteur indépendant se déplace, contrôle le véhicule avec des instruments et remet aussitôt un rapport chiffré, vérifiable en ligne. Dès ${BASE_PRICE_TND} TND TTC, payés après le diagnostic.`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Sfax',
                addressRegion: 'Sfax',
                addressCountry: 'TN',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@mallouliauto.com',
                contactType: 'sales',
                availableLanguage: ['French', 'Arabic', 'English'],
              },
              sameAs: [
                'https://www.linkedin.com/company/mallouliauto',
                'https://www.facebook.com/profile.php?id=61589350186498',
                'https://www.instagram.com/mallouliauto/',
              ],
            },
            {
              '@type': 'Service',
              name: "Certification de véhicules d'occasion MALLOULIAUTO",
              serviceType: "Inspection et certification de véhicules d'occasion",
              provider: { '@id': 'https://mallouliauto.com/#organization' },
              areaServed: 'TN',
            },
            {
              '@type': 'FAQPage',
              mainEntity: faqQuestions.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
            },
          ],
        }}
      />
      <HeroCertification />
      <SurprisesGrid />
      <ReportShowcase />
      <AudienceDoors />
      <CertificationFlow />
      <TrustBand />
      <PartnerLogos />
      <FAQ />
      <InspectionCTA title="Avant de signer, faites le diagnostic." source="closing" />
    </div>
  );
}
