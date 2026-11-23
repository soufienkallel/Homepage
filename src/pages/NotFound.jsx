import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <SEO
        title="Page non trouvée"
        description="Cette page n'existe pas. Retournez à l'accueil MALLOULIAUTO."
        noIndex
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <div className="text-8xl font-bold text-brand-navy/10 mb-4">404</div>
        <h1 className="text-3xl font-bold text-brand-navy mb-4">Page non trouvée</h1>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-navy/10 text-brand-navy rounded-lg font-semibold hover:bg-brand-navy/20 transition-colors"
          >
            <Search className="w-5 h-5" />
            Nous contacter
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
