import { motion } from 'framer-motion';
import { Smartphone, Gauge, ScrollText } from '../../icons';
import InspectorPhoto from '../../InspectorPhoto';

/**
 * Parcours revu autour d'un opérateur qui se déplace — pas d'un kit en libre-service
 * (BP §1.2, Deck slide 5). Trois étapes : le rapport et le certificat sortent
 * ensemble (ReportShowcase, plus haut sur la page, possède déjà la mise en avant
 * du document — pas de rendu dupliqué du certificat ici). La durée de l'étape 2
 * est donnée en fourchette : un seul relevé réel (20 min 8 s) ne suffit pas à
 * fixer un chiffre unique fiable.
 *
 * Une seule photo, en bandeau au-dessus des trois étapes (17 oct. 2026) : l'inspecteur
 * accroupi devant la voiture, tablette en main, est l'étape 2. Pas une photo par étape :
 * l'étape 3 est illustrée par le rapport de ReportShowcase juste au-dessus, et l'étape 1
 * (réservation) est la plus difficile à photographier sans tomber dans la banque d'images
 * générique. Un connecteur « → » (vocabulaire typographique du design system) relie les
 * trois étapes sur desktop pour rendre visible « un seul rendez-vous ».
 *
 * Textes de la refonte du 16 oct. 2026 (docs/specs/2026-10-refonte-accueil.md, bloc 5) :
 * une phrase par étape, « avec ou sans vous » et le paiement après le diagnostic.
 */
const steps = [
  {
    number: '01',
    icon: <Smartphone className="w-7 h-7" />,
    title: 'Vous demandez',
    body: 'En ligne, par WhatsApp ou par téléphone. Réponse sous 24 h.',
  },
  {
    number: '02',
    icon: <Gauge className="w-7 h-7" />,
    title: 'Nous y allons, avec ou sans vous',
    body: 'Chez le vendeur ou chez vous, en 30 à 60 minutes.',
  },
  {
    number: '03',
    icon: <ScrollText className="w-7 h-7" />,
    title: 'Vous recevez le rapport aussitôt',
    body: 'Par e-mail, SMS ou WhatsApp, dès la fin. Vous payez ensuite.',
  },
];

export default function CertificationFlow() {
  return (
    <section id="parcours" className="py-20 bg-navy text-white scroll-mt-[90px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-3.5">
            Comment ça marche
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold leading-tight">
            Trois étapes, sans vous déplacer.
          </h2>
        </div>

        <InspectorPhoto
          sizes="(min-width: 1280px) 1216px, (min-width: 640px) 90vw, 100vw"
          className="w-full h-[220px] sm:h-[300px] lg:h-[400px] object-cover object-[70%_30%] lg:object-[center_25%] mb-12"
        />

        <div className="flex flex-col md:flex-row border-t border-white/15">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="flex-1 min-w-0 py-6 border-b border-white/15 md:border-b-0"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 border border-white/25 flex items-center justify-center text-white">
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-semibold text-white/25">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3 leading-snug">{step.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed pr-2">{step.body}</p>
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className="hidden md:flex flex-shrink-0 items-start pt-6 px-4"
                  aria-hidden="true"
                >
                  <span className="w-11 h-11 flex items-center justify-center font-mono text-2xl text-white/25">
                    →
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
