import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ChatWidget from './components/ChatWidget';
import AdminRouteGuard from './components/AdminRouteGuard';
import { trackPageView } from './lib/analytics';

// Hidden while the chatbot cannot answer (e.g. no Anthropic credit). Set
// VITE_CHAT_ENABLED=true to show the widget.
const CHAT_ENABLED = import.meta.env.VITE_CHAT_ENABLED === 'true';

// Eagerly load home page for fast initial render
import Home from './pages/Home';

// Lazy-load all other pages for code splitting
const About = lazy(() => import('./pages/About'));
const Technology = lazy(() => import('./pages/Technology'));
const Guides = lazy(() => import('./pages/Guides'));
const Guide = lazy(() => import('./pages/Guide'));
const Login = lazy(() => import('./pages/Login'));
const Careers = lazy(() => import('./pages/Careers'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NewsletterConfirmation = lazy(() => import('./pages/NewsletterConfirmation'));
const DemandeInspection = lazy(() => import('./pages/DemandeInspection'));
const Tarifs = lazy(() => import('./pages/Tarifs'));
const Professionnels = lazy(() => import('./pages/Professionnels'));
const DevenirPartenaire = lazy(() => import('./pages/DevenirPartenaire'));
const Partenaires = lazy(() => import('./pages/Partenaires'));
const Inspection = lazy(() => import('./pages/Inspection'));
const ExempleRapport = lazy(() => import('./pages/ExempleRapport'));
const HomepageAdminContactRequests = lazy(() => import('./pages/admin/contact-requests'));
const HomepageAdminLayout = lazy(() => import('./pages/admin/HomepageAdminLayout'));
const HomepageAdminDashboard = lazy(() => import('./pages/admin/HomepageAdminDashboard'));
const AdminSectionPlaceholder = lazy(() => import('./pages/admin/AdminSectionPlaceholder'));
const HomepageAdminChatbotAnalytics = lazy(() => import('./pages/admin/chatbot-analytics'));
const HomepageAdminKnowledge = lazy(() => import('./pages/admin/knowledge'));
const HomepageAdminMarketingDrafts = lazy(() => import('./pages/admin/marketing-drafts'));
const HomepageAdminSalesDrafts = lazy(() => import('./pages/admin/sales-drafts'));
const HomepageAdminSalesProspects = lazy(() => import('./pages/admin/sales-prospects'));
const HomepageAdminDiscoveryConfig = lazy(() => import('./pages/admin/discovery-config'));
const HomepageAdminPartners = lazy(() => import('./pages/admin/partners'));

function PageLoader() {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center"
      role="status"
      aria-label="Chargement de la page"
    >
      <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isHomepageAdminRoute = location.pathname.startsWith('/admin');
  const isLoginRoute = location.pathname === '/login';

  // Cookieless visit measurement (src/lib/analytics.js); skips the admin and login.
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin" element={<HomepageAdminLayout />}>
              <Route index element={<HomepageAdminDashboard />} />
              <Route path="demandes" element={<HomepageAdminContactRequests />} />
              <Route path="guides" element={<Guides />} />
              <Route path="partenaires" element={<HomepageAdminPartners />} />
              <Route
                path="newsletter"
                element={
                  <AdminSectionPlaceholder
                    title="Newsletter"
                    description="Gestion des abonnés, segmentation et campagnes newsletter pour l'acquisition Homepage."
                  />
                }
              />
              <Route
                path="careers"
                element={
                  <AdminSectionPlaceholder
                    title="Carrières"
                    description="Gestion des offres d'emploi, publication et suivi des candidatures."
                  />
                }
              />
              <Route path="chatbot-analytics" element={<HomepageAdminChatbotAnalytics />} />
              <Route path="knowledge" element={<HomepageAdminKnowledge />} />
              <Route path="marketing-drafts" element={<HomepageAdminMarketingDrafts />} />
              <Route path="sales-drafts" element={<HomepageAdminSalesDrafts />} />
              <Route path="sales-prospects" element={<HomepageAdminSalesProspects />} />
              <Route path="discovery-config" element={<HomepageAdminDiscoveryConfig />} />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
          {/* Public pages: list each one in src/lib/trackedPaths.js too, or its visits are not measured. */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="technology" element={<Technology />} />
            <Route path="about" element={<About />} />
            <Route path="guides" element={<Guides />} />
            <Route path="guides/:slug" element={<Guide />} />
            <Route path="careers" element={<Careers />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="newsletter/confirmation" element={<NewsletterConfirmation />} />
            <Route path="demande-inspection" element={<DemandeInspection />} />
            <Route path="tarifs" element={<Tarifs />} />
            <Route path="professionnels" element={<Professionnels />} />
            <Route path="devenir-partenaire" element={<DevenirPartenaire />} />
            <Route path="partenaires" element={<Partenaires />} />
            <Route path="inspection" element={<Inspection />} />
            <Route path="exemple-de-rapport" element={<ExempleRapport />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      {CHAT_ENABLED && !isHomepageAdminRoute && !isLoginRoute && <ChatWidget />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
