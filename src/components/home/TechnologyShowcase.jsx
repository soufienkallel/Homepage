import { motion } from 'framer-motion';
import { Brain, Database, Cpu, MapPin, Shield } from 'lucide-react';

export default function TechnologyShowcase() {
  const aiFeatures = [
    {
      icon: <Brain className="w-8 h-8 text-brand-orange" />,
      title: 'IA Entraînée',
      value: '100,000+',
      description: 'Cas réels analysés',
    },
    {
      icon: <Database className="w-8 h-8 text-brand-blue" />,
      title: 'Multi-Domaine',
      value: '9',
      description: 'Catégories de diagnostic',
    },
    {
      icon: <Cpu className="w-8 h-8 text-emerald" />,
      title: 'Précision',
      value: "Jusqu'à 95%",
      description: 'Taux de réussite',
    },
  ];

  return (
    <section id="technology" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-navy mb-4">Technologie de Pointe</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre plateforme combine intelligence artificielle avancée et matériel connecté pour un
            diagnostic précis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* AI Technology */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-brand-blue to-brand-navy rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Intelligence Artificielle</h3>

              <div className="space-y-6">
                {aiFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-1">{feature.value}</div>
                      <div className="font-semibold mb-1">{feature.title}</div>
                      <div className="text-sm text-white/70">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-white/80 text-sm">
                  Notre IA est entraînée sur des dizaines de milliers de cas réels, couvrant toutes
                  les marques et modèles populaires en Tunisie. Elle analyse les symptômes en temps
                  réel et propose des solutions personnalisées.
                </p>
                <div className="mt-4 bg-white/10 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-orange" /> Vision IA - Détection de Fraude
                  </p>
                  <p className="text-white/70 text-sm">
                    Intégré à notre plateforme SaaS pour assurances, notre module de vision par
                    ordinateur analyse automatiquement les photos de sinistres et détecte les
                    anomalies avec un score de fraude. Jusqu'à 28% de réduction des fraudes
                    détectées.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AutoDongle Hardware */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-brand-navy mb-6">Boîtier AutoDongle</h3>

              <div className="aspect-video rounded-xl mb-6 overflow-hidden">
                <img
                  src="/images/technology/obd-dongle.png"
                  alt="Boîtier OBD-II AutoDongle MALLOULIAUTO — diagnostic connecté plug and play"
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">Connexion OBD-II</p>
                    <p className="text-sm text-gray-600">Plug & play sous le volant</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">Suivi GPS en Temps Réel</p>
                    <p className="text-sm text-gray-600">Localisez votre véhicule à tout moment</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">Analyse des Codes DTC</p>
                    <p className="text-sm text-gray-600">Détection automatique des erreurs</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">Historique Complet</p>
                    <p className="text-sm text-gray-600">Toutes vos données sauvegardées</p>
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
