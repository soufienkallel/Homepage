import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../../icons';
import { trackEvent } from '../../../lib/analytics';

/**
 * « Pour qui » (docs/specs/2026-10-refonte-accueil.md, bloc 4) : trois portes, un bénéfice
 * chacune. Acheteur et vendeur vont au même formulaire, l'état de navigation `profil`
 * (pas un paramètre d'adresse : les liens internes restent sans « ? ») préremplit le lieu du
 * rendez-vous ; les showrooms ont leur page, /professionnels.
 */
const doors = [
  {
    key: 'acheteur',
    who: "J'achète",
    title: 'Négociez avec des faits.',
    body: "Faites diagnostiquer la voiture avant de payer : vous savez ce qu'il faudra réparer.",
    action: 'Diagnostiquer avant d’acheter',
    to: '/demande-inspection',
    primary: true,
  },
  {
    key: 'vendeur',
    who: 'Je vends',
    title: 'Prouvez que votre voiture est saine.',
    body: "Un rapport vérifiable par l'acheteur, qui coupe court aux doutes.",
    action: 'Faire diagnostiquer ma voiture',
    to: '/demande-inspection',
    state: { profil: 'vendeur' },
    primary: true,
  },
  {
    key: 'showroom',
    who: 'Showroom · revendeur',
    title: 'Chaque voiture de votre parc, diagnostiquée.',
    body: 'Un rapport pour chaque véhicule de votre stock. Tarifs pro sur devis.',
    action: 'Offre professionnels',
    to: '/professionnels',
    primary: false,
  },
];

export default function AudienceDoors() {
  return (
    <section id="pour-qui" className="py-20 border-t border-rule scroll-mt-[90px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
            Pour qui
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold leading-tight text-ink">
            Achetez, vendez, exposez : un même diagnostic.
          </h2>
        </div>

        <ul className="grid md:grid-cols-3 gap-3">
          {doors.map((door, index) => (
            <motion.li
              key={door.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={`border border-rule-2 p-6 flex flex-col gap-3 ${
                door.primary ? 'bg-white' : 'bg-ground-2'
              }`}
            >
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-accent-ink">
                {door.who}
              </span>
              <h3 className="text-xl font-semibold text-ink leading-snug">{door.title}</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{door.body}</p>
              <Link
                to={door.to}
                state={door.state}
                onClick={() => trackEvent('cta_click', `audience-${door.key}`)}
                className={`mt-auto self-start inline-flex items-center gap-2 px-5 py-3 transition-colors ${
                  door.primary
                    ? 'bg-accent-ink hover:bg-ink'
                    : 'border border-rule-2 hover:border-ink'
                }`}
              >
                {/* Colour on a <span>: the global `a { color: inherit }` wins on the link. */}
                <span
                  className={`text-sm font-bold inline-flex items-center gap-2 ${
                    door.primary ? 'text-white' : 'text-ink'
                  }`}
                >
                  {door.action}
                  <ArrowRight className="w-4 h-4" accent="currentColor" />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
