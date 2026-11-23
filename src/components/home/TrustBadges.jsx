import { motion } from 'framer-motion';
import {
  Lock,
  CheckCircle,
  DollarSign,
  HeadphonesIcon,
  Zap,
  Eye,
  Brain,
  Layers,
} from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: <Zap className="w-10 h-10 text-brand-orange" />,
      title: 'Double IA Performante',
      description: 'Vision + LLM : inspection et diagnostic en 60 secondes',
      highlight: true,
    },
    {
      icon: <Eye className="w-10 h-10 text-brand-blue" />,
      title: 'Inspection Automatisée',
      description: 'Analyse photo IA avec estimation instantanée des dommages',
    },
    {
      icon: <Brain className="w-10 h-10 text-brand-blue" />,
      title: 'Diagnostic Intelligent',
      description: 'Interprétation codes DTC et recommandations personnalisées',
    },
    {
      icon: <Layers className="w-10 h-10 text-emerald" />,
      title: 'Workflow Centralisé',
      description: 'Une plateforme unique pour tous les acteurs automobiles',
    },
    {
      icon: <DollarSign className="w-10 h-10 text-brand-orange" />,
      title: 'Coûts Optimisés',
      description: "Réduction des coûts grâce à l'automatisation IA",
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-emerald" />,
      title: 'Transparence Totale',
      description: 'Devis clairs, traçabilité complète, sans frais cachés',
    },
    {
      icon: <Lock className="w-10 h-10 text-brand-navy" />,
      title: 'Données Sécurisées',
      description: 'Chiffrement et protection de vos données personnelles',
    },
    {
      icon: <HeadphonesIcon className="w-10 h-10 text-brand-blue" />,
      title: 'Support 7j/7',
      description: 'Assistance disponible tous les jours pour vos questions',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-brand-navy mb-4">
            Pourquoi Choisir MALLOULIAUTO ?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Une plateforme automobile propulsée par double IA pour des services plus rapides, moins
            chers et totalement transparents
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`rounded-xl p-6 text-center hover:shadow-lg transition-all ${
                badge.highlight
                  ? 'bg-gradient-to-br from-brand-navy to-brand-blue text-white border-2 border-brand-orange'
                  : 'bg-white border-2 border-gray-100'
              }`}
            >
              <div className="flex justify-center mb-4">
                {badge.highlight ? (
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-brand-orange" />
                  </div>
                ) : (
                  badge.icon
                )}
              </div>
              <h3
                className={`font-semibold text-lg mb-2 ${badge.highlight ? 'text-white' : 'text-brand-navy'}`}
              >
                {badge.title}
              </h3>
              <p className={`text-sm ${badge.highlight ? 'text-white/80' : 'text-gray-600'}`}>
                {badge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
