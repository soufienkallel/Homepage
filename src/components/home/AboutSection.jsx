import { motion } from 'framer-motion';
import { Target, Eye, Award, TrendingUp } from 'lucide-react';

export default function AboutSection() {
  const values = [
    {
      icon: <Target className="w-10 h-10 text-brand-orange" />,
      title: 'Notre Mission',
      description:
        "Démocratiser l'accès aux services automobiles de qualité en Tunisie grâce à l'intelligence artificielle et à un réseau de professionnels certifiés.",
    },
    {
      icon: <Eye className="w-10 h-10 text-brand-blue" />,
      title: 'Notre Vision',
      description:
        "Devenir la plateforme de référence pour l'entretien automobile en Afrique du Nord, en combinant technologie et expertise humaine.",
    },
    {
      icon: <Award className="w-10 h-10 text-emerald" />,
      title: 'Nos Valeurs',
      description:
        'Transparence, professionnalisme, innovation et satisfaction client. Chaque intervention est garantie et évaluée par nos utilisateurs.',
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-brand-navy" />,
      title: 'Notre Croissance',
      description:
        'Lancé en 2025, MALLOULIAUTO compte déjà 50+ partenaires et 15K+ diagnostics réalisés dans le Grand Tunis.',
    },
  ];

  return (
    <section id="a-propos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-navy mb-4">À Propos de MALLOULIAUTO</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une initiative MALLOULINOVA pour révolutionner les services automobiles en Tunisie
          </p>
        </div>

        {/* Company Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-brand-blue/5 to-brand-orange/5 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-brand-navy mb-6">Notre Histoire</h3>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                MALLOULIAUTO est né d'une constatation simple : les automobilistes tunisiens perdent
                du temps et de l'argent par manque de transparence dans les services automobiles.
                Diagnostic imprécis, prix opaques, garages surchargés...
              </p>
              <p>
                Forte de son expertise en systèmes embarqués et IoT, l'équipe MALLOULINOVA a
                développé une solution innovante combinant intelligence artificielle et réseau de
                professionnels certifiés. Notre plateforme offre un diagnostic instantané, des prix
                transparents et un choix entre plusieurs niveaux de service.
              </p>
              <p>
                Aujourd'hui, MALLOULIAUTO transforme l'expérience automobile de milliers de
                Tunisiens, en offrant rapidité, qualité et tranquillité d'esprit.
              </p>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h4 className="font-semibold text-lg text-brand-navy mb-2">{value.title}</h4>
              <p className="text-sm text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* MALLOULINOVA Link */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">MALLOULIAUTO est une initiative de</p>
          <a
            href="https://malloulinova.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <div className="bg-brand-navy text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-brand-blue transition-colors">
              MALLOULINOVA
            </div>
          </a>
          <p className="text-sm text-gray-500 mt-4">
            Pionnier de l'IoT et des systèmes embarqués en Tunisie
          </p>
        </div>
      </div>
    </section>
  );
}
