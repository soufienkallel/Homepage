import { motion } from 'framer-motion';
import { Brain, Video, Truck, Building2, Check } from 'lucide-react';

export default function ServiceTiers() {
  const services = [
    {
      badge: 'Gratuit',
      icon: <Brain className="w-12 h-12" />,
      title: 'Diagnostic IA',
      priceRange: 'Gratuit',
      gradient: 'from-brand-blue to-brand-navy',
      features: [
        'Analyse en 60 secondes',
        'Rapport détaillé du problème',
        'Recommandations de réparation',
        'Estimation des coûts',
        'Disponible 24/7',
      ],
    },
    {
      badge: 'Expert en Ligne',
      icon: <Video className="w-12 h-12" />,
      title: 'Service à Distance',
      priceRange: '15-30 TND',
      gradient: 'from-brand-blue to-brand-blue/80',
      features: [
        'Appel vidéo avec expert',
        'Diagnostic en temps réel',
        'Conseils personnalisés',
        'Support 7j/7',
        'Suivi post-diagnostic',
      ],
    },
    {
      badge: 'À Domicile',
      icon: <Truck className="w-12 h-12" />,
      title: 'Technicien Mobile',
      priceRange: '50-150 TND',
      gradient: 'from-brand-orange to-brand-orange-dark',
      features: [
        'Intervention chez vous',
        'Réparation sur place',
        'Équipement professionnel',
        'Garantie service',
        'Paiement sécurisé',
      ],
    },
    {
      badge: 'Pro Atelier',
      icon: <Building2 className="w-12 h-12" />,
      title: 'Garage Partenaire',
      priceRange: '100-300+ TND',
      gradient: 'from-emerald to-emerald/80',
      features: [
        'Réseau de 50+ garages',
        'Équipement complet',
        'Réparations complexes',
        'Devis transparent',
        'Garantie constructeur',
      ],
    },
  ];

  return (
    <section id="services" className="py-20 xl:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl xl:text-5xl font-bold text-brand-navy mb-4">
            Nos Services Automobiles
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Du diagnostic IA instantané à la réparation complète en atelier, choisissez la solution
            adaptée à votre besoin
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className={`bg-gradient-to-br ${service.gradient} p-6 text-white`}>
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4">
                  {service.badge}
                </div>
                <div className="flex justify-center mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                <p className="text-white/90 font-semibold">{service.priceRange}</p>
              </div>

              <div className="p-6">
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://platform.mallouliauto.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-6 w-full py-3 text-center bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors"
                >
                  Découvrir
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
