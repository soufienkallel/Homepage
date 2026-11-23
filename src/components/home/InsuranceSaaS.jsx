import { motion } from 'framer-motion';
import {
  Shield,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  BarChart3,
  Lock,
} from 'lucide-react';

export default function InsuranceSaaS() {
  const platformFeatures = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Inspection IA en 60s',
      description: 'Analyse automatique des dommages avec notre IA Vision',
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: 'Réduction des Coûts',
      description: "20-35% d'économies sur les sinistres automobiles",
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Détection de Fraude',
      description: 'Score de fraude automatique avec indicateurs visuels',
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: 'Gestion Digitale',
      description: '100% traçabilité des sinistres et réparations',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Tableaux de Bord',
      description: 'KPIs en temps réel et analytics avancés',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Sécurité RGPD',
      description: 'Données cryptées et conformes aux standards',
    },
  ];

  const insuranceStats = [
    { value: '80%', label: 'Sinistres traités sans expert terrain' },
    { value: '28%', label: 'Réduction fraude détectée' },
    { value: '24-48h', label: 'Traitement vs 7-14 jours' },
    { value: '60s', label: "Temps moyen d'inspection" },
  ];

  const workflowSteps = [
    {
      number: '1',
      title: 'Déclaration Sinistre',
      description: "Assuré crée le sinistre via l'app avec photos et détails",
    },
    {
      number: '2',
      title: 'Inspection IA',
      description: 'Notre IA Vision analyse les dommages et estime les coûts',
    },
    {
      number: '3',
      title: 'Validation',
      description: 'Gestionnaire approuve/rejette avec score de fraude',
    },
    {
      number: '4',
      title: 'Réparation',
      description: 'Routage automatique vers garage partenaire ou mobile',
    },
  ];

  const targetCompanies = [
    'STAR (35% PDM)',
    'AMI Assurances',
    'GAT',
    'Maghrebia',
    'CARTE Assurances',
    'Lloyd Tunisien',
    'BH Assurance',
    'COMAR',
  ];

  return (
    <section id="assureurs" className="py-20 xl:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-semibold mb-4"
          >
            <Shield size={18} />
            Plateforme SaaS Assureurs
          </motion.div>
          <h2 className="text-4xl font-bold text-brand-navy mb-4">
            Solution Digitale pour Assurances Automobiles
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Réduisez vos coûts de sinistres de 20-35%, traitez les dossiers en 24-48h au lieu de
            7-14 jours, et prévenez la fraude avec notre plateforme IA.
          </p>
          {/* Target Companies */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {targetCompanies.map((company) => (
              <span
                key={company}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
              >
                {company}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {insuranceStats.map((stat, index) => (
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
          {/* Platform Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-brand-navy mb-6">Fonctionnalités Clés</h3>
            <div className="space-y-4">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center text-brand-orange">
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

          {/* Workflow Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-brand-navy mb-6">Flux de Traitement Sinistre</h3>
            <div className="space-y-6">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-orange-dark rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-navy mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="ml-6 h-6 w-0.5 bg-gray-200 mt-2" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Platform Demo Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h3 className="text-3xl font-bold mb-4">Interface Gestionnaire Sinistres</h3>
              <p className="text-gray-300 mb-6">
                Dashboard intuitif avec gestion complète des sinistres, inspection AI intégrée, et
                analytics en temps réel. Accessible depuis n'importe quel navigateur.
              </p>
              <ul className="space-y-3">
                {[
                  'Création et suivi des sinistres',
                  'Inspection AI avec photos',
                  'Score de fraude automatique',
                  'Validation/rejet en un clic',
                  'Export PDF et Excel',
                  'API REST pour intégration',
                ].map((item) => (
                  <li key={item} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href="https://platform.mallouliauto.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-brand-orange hover:bg-brand-orange-dark px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Commencer maintenant
                </a>
              </div>
            </div>

            {/* Platform Screenshot Placeholder */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="bg-white rounded-lg p-6 shadow-2xl">
                <div className="space-y-4">
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <div className="h-3 bg-brand-navy w-32 rounded mb-2"></div>
                      <div className="h-2 bg-gray-300 w-24 rounded"></div>
                    </div>
                    <Shield className="w-8 h-8 text-brand-blue" />
                  </div>

                  {/* Mock Stats Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 rounded p-3">
                        <div className="h-2 bg-gray-300 w-12 rounded mb-2"></div>
                        <div className="h-4 bg-brand-blue/20 w-16 rounded"></div>
                      </div>
                    ))}
                  </div>

                  {/* Mock Claims List */}
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="h-2 bg-gray-300 w-3/4 rounded mb-2"></div>
                          <div className="h-2 bg-gray-200 w-1/2 rounded"></div>
                        </div>
                        <div className="w-16 h-6 bg-emerald/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-brand-blue/5 rounded-2xl p-12"
        >
          <h3 className="text-2xl font-bold text-brand-navy mb-4">
            Vous êtes une compagnie d'assurance ?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Discutons de comment MALLOULIAUTO peut vous aider à réduire vos coûts et améliorer votre
            efficacité opérationnelle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@mallouliauto.com?subject=Démo Plateforme Assurances"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Demander une Présentation
            </a>
            <a
              href="#faq"
              className="bg-white hover:bg-gray-50 text-brand-navy px-8 py-4 rounded-lg font-semibold border-2 border-brand-navy transition-colors"
            >
              En savoir plus
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
