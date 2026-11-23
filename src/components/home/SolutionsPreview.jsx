import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Truck, Users, Building2, Car, ArrowRight, Check } from 'lucide-react';

export default function SolutionsPreview() {
  const solutions = [
    {
      id: 'insurance',
      icon: <Shield className="w-8 h-8" />,
      title: 'Assureurs',
      subtitle: 'SaaS Gestion Sinistres',
      description: 'Digitalisez le traitement de vos sinistres automobiles avec notre IA Vision',
      gradient: 'from-brand-blue to-brand-navy',
      features: ['Inspection IA en 60s', 'Détection fraude', 'Dashboard temps réel'],
    },
    {
      id: 'fleet',
      icon: <Truck className="w-8 h-8" />,
      title: 'Flottes',
      subtitle: 'Gestion de Parc',
      description: 'Optimisez votre flotte avec le suivi OBD-II et la maintenance prédictive',
      gradient: 'from-brand-navy to-brand-blue',
      features: ['Maintenance prédictive', 'Dashboard flotte', 'Alertes temps réel'],
    },
    {
      id: 'individuals',
      icon: <Users className="w-8 h-8" />,
      title: 'Particuliers',
      subtitle: 'Services Auto',
      description:
        'Du diagnostic gratuit au technicien mobile, tous les services pour votre véhicule',
      gradient: 'from-brand-orange to-brand-orange-dark',
      features: ['Diagnostic IA gratuit', 'Technicien à domicile', 'Prix transparents'],
    },
    {
      id: 'dealers',
      icon: <Car className="w-8 h-8" />,
      title: 'Concessionnaires',
      subtitle: 'Certification VO',
      description:
        "Certifiez vos véhicules d'occasion avec l'IA et gérez votre inventaire en ligne",
      gradient: 'from-brand-orange to-brand-orange-dark',
      features: ['Certification IA Grade A-F', 'Gestion inventaire', 'Marketplace en ligne'],
    },
    {
      id: 'garages',
      icon: <Building2 className="w-8 h-8" />,
      title: 'Garages',
      subtitle: 'Réseau Partenaire',
      description:
        'Rejoignez notre réseau et augmentez votre visibilité auprès de nouveaux clients',
      gradient: 'from-emerald to-emerald/80',
      features: ['Zéro commission', 'Clients qualifiés', 'Outils de gestion'],
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-brand-navy mb-4"
          >
            Nos Solutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Une plateforme complète pour tous les acteurs de l'écosystème automobile
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className={`bg-gradient-to-br ${solution.gradient} p-6 text-white`}>
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  {solution.icon}
                </div>
                <h3 className="text-xl font-bold">{solution.title}</h3>
                <p className="text-white/80 text-sm">{solution.subtitle}</p>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">{solution.description}</p>
                <ul className="space-y-2 mb-6">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-emerald mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/solutions/${solution.id}`}
                  className="inline-flex items-center text-brand-blue font-semibold text-sm hover:text-brand-orange transition-colors group-hover:gap-2"
                >
                  En savoir plus
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/solutions"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors shadow-lg"
          >
            Découvrir toutes nos solutions
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
