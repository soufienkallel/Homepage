import { motion } from 'framer-motion';
import {
  Users,
  Wrench,
  Video,
  Building2,
  CheckCircle,
  TrendingUp,
  Clock,
  Award,
  Shield,
  Car,
} from 'lucide-react';

export default function DevenirPartenaire() {
  const partnerTypes = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Assureur Partenaire',
      description: 'Digitalisez vos sinistres automobiles et réduisez vos coûts de 20-35%',
      benefits: [
        'Inspection AI automatique',
        'Réduction fraude -28%',
        'Dashboard en temps réel',
        'API REST intégrable',
      ],
      gradient: 'from-brand-blue to-brand-navy',
    },
    {
      icon: <Wrench className="w-12 h-12" />,
      title: 'Technicien Mobile',
      description: 'Intervenez à domicile, gérez votre planning, maximisez vos revenus',
      benefits: [
        'Planning flexible',
        'Paiements garantis',
        'Assurance professionnelle',
        'Formation continue',
      ],
      gradient: 'from-brand-orange to-brand-orange-dark',
    },
    {
      icon: <Building2 className="w-12 h-12" />,
      title: 'Garage Partenaire',
      description: 'Rejoignez notre réseau, augmentez votre visibilité et vos clients',
      benefits: [
        'Flux de clients régulier',
        'Zéro commission',
        'Outils de gestion',
        'Support marketing',
      ],
      gradient: 'from-emerald to-emerald/80',
    },
    {
      icon: <Car className="w-12 h-12" />,
      title: 'Concessionnaire Partenaire',
      description: "Certifiez vos véhicules d'occasion avec l'IA et vendez via notre marketplace",
      benefits: [
        'Certification IA Grade A-F',
        'Gestion inventaire en ligne',
        'Marketplace intégrée',
        'SaaS dès 200 TND/mois',
      ],
      gradient: 'from-brand-orange to-brand-orange-dark',
    },
    {
      icon: <Video className="w-12 h-12" />,
      title: 'Expert à Distance',
      description: 'Consultez en visio, partagez votre expertise, travaillez de chez vous',
      benefits: [
        'Télétravail 100%',
        'Horaires adaptables',
        'Revenus complémentaires',
        'Plateforme intuitive',
      ],
      gradient: 'from-brand-blue to-brand-blue/80',
    },
  ];

  const stats = [
    { icon: <Users />, value: '50+', label: 'Partenaires Actifs' },
    { icon: <TrendingUp />, value: '2,500 TND', label: 'Revenu Moyen/Mois' },
    { icon: <Clock />, value: '24-48h', label: 'Validation Dossier' },
    { icon: <Award />, value: '4.8/5', label: 'Satisfaction Partenaires' },
  ];

  return (
    <section id="devenir-partenaire" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-navy mb-4">
            Rejoignez Notre Réseau de Professionnels
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Développez votre activité avec MALLOULIAUTO : plus de clients, moins de contraintes
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 text-center shadow-sm"
            >
              <div className="flex justify-center text-brand-orange mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-brand-navy mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Partner Types */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {partnerTypes.map((type, index) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className={`bg-gradient-to-br ${type.gradient} p-8 text-white`}>
                <div className="flex justify-center mb-4">{type.icon}</div>
                <h3 className="text-2xl font-bold mb-2 text-center">{type.title}</h3>
                <p className="text-white/90 text-center text-sm">{type.description}</p>
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {type.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-emerald mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-navy rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Prêt à Rejoindre MALLOULIAUTO ?</h3>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous en 5 minutes, soumettez vos certifications et commencez à recevoir des
            demandes sous 48h
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@mallouliauto.com?subject=Inscription Partenaire MALLOULIAUTO"
              className="px-8 py-4 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg font-semibold transition-colors inline-block"
            >
              Devenir Partenaire
            </a>
            <a
              href="mailto:info@mallouliauto.com?subject=Demande d'information - MALLOULIAUTO"
              className="px-8 py-4 bg-white text-brand-navy hover:bg-gray-100 rounded-lg font-semibold transition-colors inline-block"
            >
              En Savoir Plus
            </a>
          </div>

          <p className="text-sm text-white/60 mt-6">
            Questions ? Contactez-nous : info@mallouliauto.com
          </p>
        </div>
      </div>
    </section>
  );
}
