import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Camera, Cpu, ArrowRight } from 'lucide-react';

export default function TechnologyPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Cpu className="w-4 h-4" />
              Innovation Technologique
            </div>
            <h2 className="text-4xl font-bold text-brand-navy mb-6">
              Intelligence Artificielle au Service de l'Automobile
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Notre plateforme combine deux technologies IA complémentaires pour révolutionner les
              services automobiles en Tunisie.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-navy mb-1">IA Vision</h3>
                  <p className="text-gray-600 text-sm">
                    Analyse automatique des photos de dommages pour les assureurs et certification
                    de véhicules d'occasion pour les concessionnaires. Détection de 9+ catégories
                    avec précision cible de 95%.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-navy mb-1">IA Diagnostic LLM</h3>
                  <p className="text-gray-600 text-sm">
                    Modèle conversationnel pour diagnostiquer les problèmes automobiles en 60
                    secondes basé sur les symptômes décrits.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/technology"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors"
            >
              Découvrir notre technologie
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-brand-blue to-brand-navy rounded-2xl p-8 text-white">
              {/* IA Vision - Annotated car image */}
              <div className="rounded-xl overflow-hidden mb-6">
                <img
                  src="/images/technology/ia-vision-annotated-car.png"
                  alt="Voiture analysée par IA Vision MALLOULIAUTO — dommages annotés automatiquement"
                  className="w-full h-48 object-cover rounded-xl"
                  loading="lazy"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-xl p-6 text-center border border-brand-orange/30">
                  <div className="text-4xl font-bold mb-2 text-brand-orange">60s</div>
                  <div className="text-white/80 text-sm">Temps d'analyse</div>
                </div>
                <div className="bg-white/10 rounded-xl p-6 text-center border border-brand-orange/30">
                  <div className="text-4xl font-bold mb-2 text-brand-orange">95%</div>
                  <div className="text-white/80 text-sm">Précision cible</div>
                </div>
                <div className="bg-white/10 rounded-xl p-6 text-center border border-brand-orange/30">
                  <div className="text-4xl font-bold mb-2 text-brand-orange">9+</div>
                  <div className="text-white/80 text-sm">Domaines couverts</div>
                </div>
                <div className="bg-white/10 rounded-xl p-6 text-center border border-brand-orange/30">
                  <div className="text-4xl font-bold mb-2 text-brand-orange">24/7</div>
                  <div className="text-white/80 text-sm">Disponibilité</div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-lg">
                    <img
                      src="/images/technology/obd-dongle.png"
                      alt="Boîtier AutoDongle OBD-II"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">Boîtier AutoDongle</h4>
                    <p className="text-white/70 text-sm">
                      OBD-II connecté pour le suivi temps réel des flottes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
