import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logoSvg from '../../assets/mallouliauto_logo.svg';
import SEO from '../../components/SEO';

/**
 * Admin frame, as the approved mockup "Admin — Tableau de bord campagne" (26 Sept 2026):
 * navy header, flat text menu grouped by task (no icons, no rounded pills), content on
 * ground-2. Below lg the menu folds behind a button.
 *
 * Link colours sit on inner <span>s: the global `a { color: inherit }` rule is outside
 * Tailwind's layers and wins over colour utilities on the link itself.
 */

const NAV_SECTIONS = [
  {
    title: 'Pilotage',
    items: [
      { to: '/admin', label: 'Tableau de bord' },
      { to: '/admin/demandes', label: 'Demandes' },
    ],
  },
  {
    title: 'Contenu',
    items: [
      { to: '/admin/guides', label: 'Guides' },
      { to: '/admin/partenaires', label: 'Partenaires' },
      { to: '/admin/newsletter', label: 'Newsletter' },
      { to: '/admin/careers', label: 'Carrières' },
    ],
  },
  {
    title: 'Agents IA',
    items: [
      { to: '/admin/marketing-drafts', label: 'Brouillons marketing' },
      { to: '/admin/sales-prospects', label: 'Prospects' },
      { to: '/admin/sales-drafts', label: 'Séquences sales' },
      { to: '/admin/discovery-config', label: 'Recherche de prospects' },
    ],
  },
  {
    title: 'Chatbot',
    items: [
      { to: '/admin/chatbot-analytics', label: 'Statistiques' },
      { to: '/admin/knowledge', label: 'Base de connaissances' },
    ],
  },
];

function AdminNav() {
  return (
    <nav aria-label="Administration" className="flex flex-col gap-[26px]">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="flex flex-col gap-0.5">
          <h2 className="px-3 pb-2 font-mono text-[10px] font-medium tracking-[0.08em] uppercase text-ink-3">
            {section.title}
          </h2>
          {section.items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'} className="block">
              {({ isActive }) => (
                <span
                  className={`block px-3 py-2.5 text-sm ${
                    isActive
                      ? 'bg-ground-2 text-ink font-semibold'
                      : 'text-ink-2 font-medium hover:text-ink hover:bg-ground-2'
                  }`}
                >
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default function HomepageAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ground-2 text-ink">
      <SEO title="Administration" path="/admin" noIndex />
      <header className="h-14 bg-navy flex items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          to="/admin"
          aria-label="Administration — tableau de bord"
          className="flex items-center"
        >
          <img src={logoSvg} alt="" className="h-[13px] sm:h-[17px] w-auto" />
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/" className="hidden sm:block">
            <span className="text-[13px] font-medium text-white/80 hover:text-white">
              Retour au site
            </span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="hidden sm:block h-9 px-3.5 border border-white/35 text-white text-[13px] font-semibold hover:border-white"
          >
            Se déconnecter
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="lg:hidden w-11 h-11 flex items-center justify-center border border-white/35 text-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:min-h-[calc(100vh-56px)]">
        <aside
          id="admin-menu"
          className={`${menuOpen ? 'block' : 'hidden'} lg:block bg-white border-b lg:border-b-0 lg:border-r border-rule px-3.5 py-7`}
        >
          <AdminNav />
          <div className="sm:hidden mt-7 pt-5 border-t border-rule flex flex-col gap-2 px-3">
            <Link to="/" className="py-2">
              <span className="text-sm font-medium text-ink-2">Retour au site</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="min-h-11 border border-rule-2 text-sm font-semibold"
            >
              Se déconnecter
            </button>
          </div>
        </aside>

        <main className="min-w-0 px-4 sm:px-8 lg:px-12 pt-6 sm:pt-9 pb-14 max-w-[1152px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
