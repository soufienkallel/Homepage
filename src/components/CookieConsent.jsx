import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'mallouliauto_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on first render
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-brand-orange flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-brand-navy font-semibold text-sm mb-1">
                  Nous utilisons des cookies
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Ce site utilise des cookies pour améliorer votre expérience. Consultez notre{' '}
                  <Link to="/privacy" className="text-brand-blue underline hover:text-brand-navy">
                    politique de confidentialité
                  </Link>{' '}
                  pour en savoir plus.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={decline}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-navy border border-gray-300 rounded-lg hover:border-brand-navy transition-colors"
              >
                Refuser
              </button>
              <button
                onClick={accept}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-navy rounded-lg transition-colors"
              >
                Accepter
              </button>
              <button
                onClick={() => setVisible(false)}
                className="p-1 text-gray-400 hover:text-gray-600 sm:hidden"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
