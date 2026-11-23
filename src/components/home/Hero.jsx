import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Brain, Shield, Truck, Car, Wrench, ArrowRight, Award } from 'lucide-react';

export default function Hero() {
  const segments = [
    {
      id: 'assureurs',
      icon: <Shield className="w-6 h-6" />,
      label: 'Assureurs',
      value: 'SaaS Sinistres',
      description: 'Inspection IA, détection fraude',
      color: 'from-brand-blue/20 to-brand-blue/10 border-brand-blue/40 hover:border-brand-blue',
      href: '/solutions#assureurs',
    },
    {
      id: 'flottes',
      icon: <Truck className="w-6 h-6" />,
      label: 'Flottes',
      value: 'Gestion de Parc',
      description: 'Maintenance prédictive, OBD-II',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/40 hover:border-emerald-400',
      href: '/solutions#flottes',
    },
    {
      id: 'particuliers',
      icon: <Car className="w-6 h-6" />,
      label: 'Particuliers',
      value: 'Services Auto',
      description: 'Diagnostic IA, technicien mobile',
      color:
        'from-brand-orange/20 to-brand-orange/10 border-brand-orange/40 hover:border-brand-orange',
      href: '/solutions#particuliers',
    },
    {
      id: 'concessionnaires',
      icon: <Award className="w-6 h-6" />,
      label: 'Concessionnaires',
      value: 'Certification VO',
      description: 'IA Grade A-F, inventaire',
      color:
        'from-brand-orange/20 to-brand-orange/10 border-brand-orange/40 hover:border-brand-orange',
      href: '/solutions/dealers',
    },
    {
      id: 'garages',
      icon: <Wrench className="w-6 h-6" />,
      label: 'Garages',
      value: 'Réseau Partenaire',
      description: 'Nouveaux clients, outils IA',
      color: 'from-emerald/20 to-emerald/10 border-emerald/40 hover:border-emerald',
      href: '/partners',
    },
  ];

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #273F4F 0%, #1a2a36 50%, #273F4F 100%)' }}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMTIgMTJoMTJ2MTJINDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-20 lg:py-28 xl:py-32 relative z-10">
        {/* Main Hero Content */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-6 leading-tight">
              Plateforme Automobile
              <span className="block text-brand-orange">Intelligente</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/80 mb-6 max-w-3xl mx-auto">
              Solutions IA pour assureurs, flottes, concessionnaires, particuliers et garages.
              Diagnostic en 60 secondes, inspection automatisée, maintenance prédictive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://platform.mallouliauto.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg font-semibold transition-colors"
              >
                Essayer Gratuitement
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                to="/solutions"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-semibold transition-colors"
              >
                Découvrir nos Solutions
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Dual AI Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 xl:gap-8 mb-12 max-w-4xl xl:max-w-5xl mx-auto"
        >
          {/* Computer Vision AI */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all">
            <div className="h-40 overflow-hidden">
              <img
                src="/images/technology/technician-ia-vision.png"
                alt="Technicien réalisant une inspection IA Vision avec son smartphone"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-blue to-brand-navy flex items-center justify-center">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">IA Vision</h3>
                  <p className="text-white/60 text-sm">Computer Vision</p>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-4">
                Analyse automatique des photos de sinistres automobiles avec détection des dommages
                et score de fiabilité.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-white/10 rounded-full">Assureurs</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Concessionnaires</span>
              </div>
            </div>
          </div>

          {/* LLM Diagnostic AI */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all">
            <div className="h-40 overflow-hidden">
              <img
                src="/images/technology/technician-obd-diagnostic.png"
                alt="Technicien réalisant un diagnostic IA avec boîtier OBD-II connecté"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue/80 flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">IA Diagnostic</h3>
                  <p className="text-white/60 text-sm">Large Language Model</p>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-4">
                Diagnostic conversationnel basé sur les symptômes décrits. Interprétation des codes
                DTC et recommandations.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-white/10 rounded-full">Particuliers</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Flottes</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Segments Grid - Clickable Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-center text-white/60 text-sm mb-6 uppercase tracking-wider">
            Une plateforme pour tous les acteurs
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {segments.map((segment, index) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <Link
                  to={segment.href}
                  className={`block bg-gradient-to-br ${segment.color} border backdrop-blur-sm rounded-xl p-5 text-center hover:scale-105 transition-all cursor-pointer group`}
                >
                  <div className="flex justify-center mb-3 text-white/90 group-hover:text-white transition-colors">
                    {segment.icon}
                  </div>
                  <p className="font-bold text-white mb-1">{segment.label}</p>
                  <p className="text-sm text-brand-orange font-semibold mb-1">{segment.value}</p>
                  <p className="text-xs text-white/60 leading-tight">{segment.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
