import { motion } from 'framer-motion';
import {
  Truck,
  TrendingDown,
  Clock,
  Activity,
  FileText,
  Bell,
  CheckCircle,
  BarChart3,
  Cpu,
  Building2,
  Package,
  Car,
  Key,
} from 'lucide-react';

export default function FleetsSection() {
  const fleetFeatures = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Maintenance Prédictive',
      description: "Alertes IA avant les pannes, réduction de 20% des temps d'arrêt",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Dossiers Centralisés',
      description: 'Historique complet par VIN, accessible à tout moment',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Dashboard Temps Réel',
      description: 'Monitoring santé flotte, KPIs, benchmarking coûts',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Alertes Automatiques',
      description: 'Notifications entretien, codes erreur, anomalies',
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Boîtier OBD-II',
      description: 'Lecture DTC temps réel, suivi GPS, données télématiques',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Service Prioritaire',
      description: 'Techniciens mobiles dédiés, interventions rapides',
    },
  ];

  const fleetStats = [
    { value: '-20%', label: "Temps d'arrêt véhicule" },
    { value: '-15%', label: 'Coûts maintenance' },
    { value: '24h', label: 'Délai intervention max' },
    { value: '100%', label: 'Visibilité flotte' },
  ];

  const fleetTypes = [
    {
      title: 'Flottes Corporate',
      targets: 'Banques, Télécoms, Entreprises',
      size: '20-500+ véhicules',
      icon: <Building2 className="w-8 h-8" />,
    },
    {
      title: 'Logistique & Livraison',
      targets: 'Glovo, Jumia, Services postaux',
      size: '20-200 véhicules',
      icon: <Package className="w-8 h-8" />,
    },
    {
      title: 'VTC & Taxis',
      targets: 'Bolt, InDriver, Coopératives',
      size: '10-100 véhicules',
      icon: <Car className="w-8 h-8" />,
    },
    {
      title: 'Location Voitures',
      targets: 'Hertz, Europcar, Agences locales',
      size: '30-200 véhicules',
      icon: <Key className="w-8 h-8" />,
    },
  ];

  return (
    <section
      id="flottes"
      className="py-20 xl:py-24 bg-gradient-to-br from-brand-gray/30 to-brand-blue/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-semibold mb-4"
          >
            <Truck size={18} />
            Gestion de Flottes
          </motion.div>
          <h2 className="text-4xl font-bold text-brand-navy mb-4">
            Optimisez Votre Flotte avec l'IA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Maintenance prédictive, dossiers centralisés et interventions rapides pour réduire vos
            coûts et maximiser la disponibilité de vos véhicules.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {fleetStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-brand-blue to-brand-navy text-white rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-brand-navy mb-6">Fonctionnalités Clés</h3>
            <div className="space-y-4">
              {fleetFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-navy mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Fleet Types */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-brand-navy mb-6">Types de Flottes</h3>
            <div className="grid grid-cols-2 gap-4">
              {fleetTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 hover:border-brand-blue/50 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center text-brand-orange mb-3">
                    {type.icon}
                  </div>
                  <h4 className="font-bold text-brand-navy mb-1">{type.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{type.targets}</p>
                  <p className="text-xs text-brand-blue font-semibold">{type.size}</p>
                </motion.div>
              ))}
            </div>

            {/* Pricing Preview */}
            <div className="mt-6 bg-white rounded-xl p-6 border-2 border-brand-blue/20">
              <h4 className="font-bold text-brand-navy mb-3">Tarification Flottes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">10-20 véhicules</span>
                  <span className="font-semibold text-brand-navy">100-150 TND/mois</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">20-50 véhicules</span>
                  <span className="font-semibold text-brand-navy">200-350 TND/mois</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">50+ véhicules</span>
                  <span className="font-semibold text-brand-navy">Sur devis</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Inclut : Dashboard, alertes, historique VIN, dongles OBD-II, support prioritaire
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-brand-blue to-brand-navy rounded-2xl p-12 text-center text-white"
        >
          <h3 className="text-3xl font-bold mb-4">Vous Gérez une Flotte de Véhicules ?</h3>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Découvrez comment MALLOULIAUTO peut réduire vos temps d'arrêt de 20% et vos coûts de
            maintenance de 15%.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://platform.mallouliauto.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Commencer Maintenant
            </a>
            <a
              href="#faq"
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              En Savoir Plus
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
