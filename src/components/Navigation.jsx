import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import logoSvg from '../assets/mallouliauto_logo.svg';
import { trackEvent } from '../lib/analytics';
import { MAIN_LINKS, NAV_GROUPS } from '../data/siteNav';

/**
 * En-tête du site, tel que la maquette approuvée le 26 sept. 2026
 * (canvas « Demande d'inspection », Main.dc.html) : fond navy plein, logo 22 px,
 * liens 14 px blancs à 82 %, page courante en blanc gras — sans pastille de
 * couleur —, puis « Vérifier un certificat » et « Demander un diagnostic ».
 * La seule ombre du design system (nav-sticky) sépare l'en-tête du contenu.
 *
 * Trois liens toujours visibles, puis « Plus », qui ouvre les autres pages classées
 * en trois rubriques (src/data/siteNav.js, docs/specs/2026-10-refonte-accueil.md).
 * Le menu mobile présente les mêmes liens, les mêmes rubriques et les mêmes actions,
 * dans le même ordre.
 *
 * Le style global `a { color: inherit }` est hors des couches Tailwind et
 * l'emporte sur les classes de couleur posées sur un lien : les couleurs sont
 * donc portées par un <span> intérieur.
 */

const linkTextClass = (active, size = 'text-sm') =>
  `${size} transition-colors ${
    active ? 'text-white font-semibold' : 'text-white/80 font-medium group-hover:text-white'
  }`;

const GROUP_TITLE_CLASS =
  'font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/60 mb-2';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreButtonRef = useRef(null);
  const morePanelRef = useRef(null);
  const location = useLocation();

  // Close both menus on route change (a homepage anchor clicked on the homepage
  // does not change the pathname: those links close the menus themselves).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsOpen(false);
    setIsMoreOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location.pathname]);

  // « Plus » closes on a click outside it and on Escape (focus back on its button).
  useEffect(() => {
    if (!isMoreOpen) return undefined;
    const onPointerDown = (event) => {
      if (
        !moreButtonRef.current?.contains(event.target) &&
        !morePanelRef.current?.contains(event.target)
      ) {
        setIsMoreOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMoreOpen]);

  // An anchor of the homepage is never "the current page".
  const isActive = (path) => !path.includes('#') && location.pathname.startsWith(path);
  const moreActive = NAV_GROUPS.some((group) => group.links.some((link) => isActive(link.path)));
  // The request page is the CTA's destination: no need to offer it again there.
  const onRequestPage = location.pathname.startsWith('/demande-inspection');

  const closeMenus = () => {
    setIsOpen(false);
    setIsMoreOpen(false);
  };

  const renderGroups = (size) =>
    NAV_GROUPS.map((group) => (
      <div key={group.title}>
        <p className={GROUP_TITLE_CLASS}>{group.title}</p>
        <ul>
          {group.links.map((link) => {
            const active = isActive(link.path);
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  onClick={closeMenus}
                  className="group block py-2"
                >
                  <span className={linkTextClass(active, size)}>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    ));

  return (
    <nav
      aria-label="Navigation principale"
      className="sticky top-0 z-50 bg-navy shadow-[0_1px_2px_rgba(22,36,46,.05)]"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-10 2xl:px-16">
        <div className="flex items-center gap-8 xl:gap-6 2xl:gap-10 h-[60px] xl:h-[76px]">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src={logoSvg}
              alt="MALLOULIAUTO — accueil"
              className="h-[15px] xl:h-[22px] w-auto"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden xl:flex items-center gap-5 2xl:gap-7 flex-grow">
            {MAIN_LINKS.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  onClick={closeMenus}
                  className="group whitespace-nowrap py-2"
                >
                  <span className={linkTextClass(active)}>{link.label}</span>
                </Link>
              );
            })}
            <button
              ref={moreButtonRef}
              type="button"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              aria-expanded={isMoreOpen}
              aria-controls="menu-plus"
              className="group flex items-center gap-1 whitespace-nowrap py-2"
            >
              <span className={linkTextClass(moreActive || isMoreOpen)}>Plus</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`text-white/80 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* CTAs — the inspection request is the primary action (spec §3.1). */}
          <div className="hidden xl:flex items-center gap-2.5 flex-shrink-0">
            <Link
              to="/#verifier"
              onClick={closeMenus}
              className="group px-3.5 py-3 border border-white/35 hover:border-white transition-colors whitespace-nowrap"
            >
              <span className="text-white font-mono text-xs font-medium uppercase tracking-[0.08em]">
                Vérifier un certificat
              </span>
            </Link>
            {!onRequestPage && (
              <Link
                to="/demande-inspection"
                onClick={() => trackEvent('cta_click', 'header')}
                className="px-5 py-[13px] bg-accent-ink hover:bg-white/15 transition-colors whitespace-nowrap"
              >
                <span className="text-white text-sm font-bold">Demander un diagnostic</span>
              </Link>
            )}
          </div>

          {/* Compact header below 1280 px. Below lg the request button lives in the
              mobile contact bar (MobileContactBar.jsx), with its full label. */}
          <div className="xl:hidden ml-auto flex items-center gap-2.5">
            {!onRequestPage && (
              <Link
                to="/demande-inspection"
                onClick={() => trackEvent('cta_click', 'header')}
                className="hidden lg:flex items-center min-h-11 px-4 bg-accent-ink"
              >
                <span className="text-white text-sm font-bold">Demander un diagnostic</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="menu-mobile"
              aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="w-11 h-11 flex items-center justify-center border border-white/35 text-white hover:border-white transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop « Plus » panel: a band under the header, one column per group. */}
      {isMoreOpen && (
        <div
          id="menu-plus"
          ref={morePanelRef}
          className="hidden xl:block absolute inset-x-0 top-full bg-navy border-t border-white/15"
        >
          <div className="max-w-[1440px] mx-auto px-10 2xl:px-16 py-7">
            <div className="grid grid-cols-3 gap-12 max-w-[760px]">{renderGroups('text-sm')}</div>
          </div>
        </div>
      )}

      {/* Mobile menu: the same links, groups and action as the desktop header. It
          overlays the page, so closing it never shifts the page under an anchor scroll. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="menu-mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden absolute inset-x-0 top-full bg-navy border-t border-white/15 overflow-hidden"
          >
            {/* Scrolls on short screens; below lg it stops above the contact bar. */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 max-h-[calc(100dvh-136px)] lg:max-h-[calc(100dvh-60px)] overflow-y-auto">
              {MAIN_LINKS.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={active ? 'page' : undefined}
                    onClick={closeMenus}
                    className="block py-3 border-b border-white/10"
                  >
                    <span className={linkTextClass(active, 'text-base')}>{link.label}</span>
                  </Link>
                );
              })}
              <div className="grid sm:grid-cols-3 gap-x-8 gap-y-4 pt-5">
                {renderGroups('text-[15px]')}
              </div>
              <Link
                to="/#verifier"
                onClick={closeMenus}
                className="mt-5 mb-2 flex justify-center px-3.5 py-3 border border-white/35 hover:border-white transition-colors"
              >
                <span className="text-white font-mono text-xs font-medium uppercase tracking-[0.08em]">
                  Vérifier un certificat
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
