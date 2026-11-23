import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';

export default function HomeCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl lg:text-4xl font-bold mb-6"
        >
          Prêt à transformer votre expérience automobile ?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
        >
          Rejoignez les milliers de Tunisiens qui font confiance à MALLOULIAUTO pour leurs services
          automobiles
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="https://platform.mallouliauto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg font-semibold transition-colors text-lg"
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-semibold transition-colors text-lg"
          >
            <Phone className="w-5 h-5" />
            Nous contacter
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
