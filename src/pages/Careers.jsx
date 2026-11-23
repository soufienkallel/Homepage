import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const candidateTimeline = [
  {
    title: 'Dépôt',
    description: 'Envoi de votre CV et lettre de motivation par email.',
    note: 'Réponse sous 2 semaines. Sans retour de notre part, nous vous remercions pour votre intérêt.',
  },
  {
    title: 'Pré-sélection',
    description: 'Nos recruteurs évaluent votre dossier et vérifient l’adéquation avec le poste.',
  },
  {
    title: 'Entretien RH',
    description:
      'Premier échange pour valider la motivation, les valeurs et la culture d’entreprise.',
  },
  {
    title: 'Entretien Technique',
    description: 'Discussion approfondie sur vos compétences techniques et votre expérience.',
  },
  {
    title: 'Offre',
    description: 'Proposition claire et personnalisée pour rejoindre l’équipe MALLOULIAUTO.',
  },
  {
    title: 'Intégration',
    description: 'Accompagnement complet dès votre première journée chez nous.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function Careers() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Carrières"
        description="Rejoignez MALLOULIAUTO : postes ouverts et candidatures spontanées."
        path="/careers"
      />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4"
          >
            MALLOULIAUTO
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl lg:text-5xl font-semibold leading-tight mb-6 max-w-3xl"
          >
            Carrières
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 max-w-2xl leading-relaxed"
          >
            Rejoignez une petite équipe qui construit un protocole d’inspection automobile
            standardisé, en Tunisie.
          </motion.p>
        </div>
      </section>

      {/* Postes ouverts */}
      <section className="py-20 bg-white border-t border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
              Offres d'emploi
            </p>
            <h2 className="text-3xl font-semibold text-ink mb-6 leading-tight">
              Aucun poste ouvert actuellement.
            </h2>
            <div className="border border-rule p-7 md:p-9">
              <p className="text-ink-2 leading-relaxed mb-6">
                MALLOULIAUTO est une équipe restreinte, cohérente avec le stade du projet. Nous ne
                recrutons pas activement pour le moment, mais nous restons attentifs aux profils qui
                partagent notre approche mesurée de l'inspection automobile.
              </p>
              <a
                href="mailto:info@mallouliauto.com?subject=Candidature%20spontan%C3%A9e%20-%20MALLOULIAUTO"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-ink font-semibold transition-colors"
              >
                <span className="text-white">Envoyer une candidature spontanée</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pipeline de recrutement */}
      <section className="py-20 bg-ground-2 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
              Le processus
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-ink leading-tight">
              Un processus clair, pour quand un poste s'ouvrira.
            </h2>
          </div>

          <div className="border-t border-rule">
            {candidateTimeline.map((item, index) => (
              <div key={item.title}>
                <motion.div
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex gap-5 py-6 border-b border-rule"
                >
                  <div className="w-11 h-11 flex-shrink-0 border border-rule-2 flex items-center justify-center">
                    <span className="font-mono text-sm font-semibold text-ink">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink mb-1">{item.title}</h3>
                    <p className="text-ink-2 leading-relaxed">{item.description}</p>
                    {item.note && <p className="mt-2 text-sm text-ink-3">{item.note}</p>}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
