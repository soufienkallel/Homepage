import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import MobileContactBar from './MobileContactBar';

function ScrollToTop() {
  // `key` changes on every navigation, even to the URL already shown: a second click
  // on « Comment ça marche » scrolls back to the section.
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash, key]);

  return null;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-[88px] lg:bottom-6 left-6 z-40 w-12 h-12 bg-brand-orange text-white rounded-full shadow-lg hover:bg-brand-orange-dark transition-colors flex items-center justify-center"
          aria-label="Retour en haut"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Layout() {
  return (
    // pb-[76px]: room for MobileContactBar below lg, so it never covers the footer.
    <div className="min-h-screen flex flex-col pb-[76px] lg:pb-0">
      <ScrollToTop />
      <Navigation />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileContactBar />
      <BackToTop />
      <CookieConsent />
    </div>
  );
}
