import { motion } from 'framer-motion';
import { FileText, Brain, CheckCircle, ThumbsUp } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: <FileText className="w-8 h-8" />,
      title: 'Décrivez le Problème',
      description: 'Expliquez les symptômes de votre véhicule en quelques mots',
    },
    {
      number: 2,
      icon: <Brain className="w-8 h-8" />,
      title: 'IA Analyse',
      description: 'Notre intelligence artificielle analyse en 60 secondes',
      badge: '60s',
    },
    {
      number: 3,
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Choisissez le Service',
      description: 'Sélectionnez la solution adaptée à votre besoin',
    },
    {
      number: 4,
      icon: <ThumbsUp className="w-8 h-8" />,
      title: 'Problème Résolu',
      description: "Profitez d'un service rapide et professionnel",
    },
  ];

  return (
    <section className="py-20 xl:py-24 bg-gradient-to-br from-brand-blue to-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl xl:text-5xl font-bold mb-4">Comment Ça Marche ?</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Un processus simple et rapide en 4 étapes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line (hidden on mobile) */}
          <div
            className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-white/20"
            style={{ top: '80px' }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center hover:bg-white/20 transition-colors">
                {/* Number circle */}
                <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center mb-4 z-10">
                  <span className="text-2xl font-bold">{step.number}</span>
                  {step.badge && (
                    <div className="absolute -top-2 -right-2 bg-emerald px-2 py-0.5 rounded-full text-xs font-bold">
                      {step.badge}
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4 text-brand-orange">{step.icon}</div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-white/70 text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://platform.mallouliauto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors text-lg"
          >
            Commencer Maintenant
          </a>
        </div>
      </div>
    </section>
  );
}
