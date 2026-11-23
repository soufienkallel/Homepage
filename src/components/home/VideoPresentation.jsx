import { motion } from 'framer-motion';
import { Play, Film } from 'lucide-react';

export default function VideoPresentation() {
  const videoId = 'bO5BHhuH4fo';

  return (
    <section className="py-20 xl:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
            <Film className="w-4 h-4" />
            Présentation Vidéo
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-4">
            Découvrez MALLOULIAUTO en Action
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Notre plateforme automobile intelligente expliquée en quelques minutes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Video Container with Shadow and Border */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-brand-navy/10">
            {/* Aspect Ratio Container (16:9) */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title="Présentation MALLOULIAUTO"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-orange/20 rounded-full blur-2xl -z-10" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-blue/20 rounded-full blur-2xl -z-10" />
        </motion.div>

        {/* CTA Below Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-600 mb-4">Prêt à transformer votre expérience automobile ?</p>
          <a
            href="https://platform.mallouliauto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg font-semibold transition-colors"
          >
            <Play className="w-5 h-5" />
            Essayer Gratuitement
          </a>
        </motion.div>
      </div>
    </section>
  );
}
