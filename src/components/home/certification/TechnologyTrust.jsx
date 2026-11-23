import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Cpu,
  ScrollText,
  UserCheck,
  ScanLine,
  AudioLines,
  ArrowRight,
} from '../../icons';
import StatusBadges from '../../technology/StatusBadges';
import { SUMMARY_CAPABILITIES } from '../../../data/platformCapabilities';

/**
 * Cette section présente la plateforme comme la couche d'intégration qui relie
 * les briques existantes (caméra, instruments, saisie structurée) — pas comme
 * une explication mécanisme par mécanisme. Aujourd'hui, c'est l'opérateur qui
 * produit le constat, le coût et la gravité — l'IA reformule et traduit ce qui
 * est déjà établi, elle ne décide ni du coût ni de la gravité (Deck slide 4 ;
 * Rapport §6.5, §7).
 *
 * Résumé de la page /technology, remise en ligne sur décision du fondateur
 * (24 sept. 2026, annule celle du 22 sept.) : MALLOULIAUTO, certificateur
 * indépendant, développe sa propre plateforme d'inspection. Les capacités et
 * leurs statuts viennent de platformCapabilities.js, partagé avec
 * /technology — ne pas les redéfinir ici.
 */
const ICONS = {
  protocole: <LayoutGrid className="w-6 h-6" />,
  instruments: <Cpu className="w-6 h-6" />,
  vision: <ScanLine className="w-6 h-6" />,
  'passerelle-iot': <AudioLines className="w-6 h-6" />,
};

const governance = [
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: "Aujourd'hui, l'IA ne décide pas",
    body: "C'est l'opérateur qui produit le constat, le coût estimé et la gravité. L'IA reformule et traduit ce qui est déjà établi — elle n'ajoute jamais de fait nouveau.",
  },
  {
    icon: <ScrollText className="w-6 h-6" />,
    title: 'Traçabilité des décisions',
    body: "Nous documentons la traçabilité de ce que produit le modèle, en réponse aux obligations du règlement européen sur l'IA — un engagement de gouvernance dès le premier pilote.",
  },
];

export default function TechnologyTrust() {
  return (
    <section id="plateforme" className="py-20 text-white bg-navy-d scroll-mt-[120px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14">
          {/* Plateforme */}
          <div>
            <p className="font-mono text-[#f0a184] font-medium uppercase tracking-[0.14em] text-sm mb-3">
              La plateforme
            </p>
            <h2 className="text-3xl font-bold mb-5 leading-tight">
              L&apos;inspection est humaine. Sa production est industrialisée.
            </h2>
            <p className="text-white/80 leading-relaxed mb-6">
              L&apos;intelligence artificielle et les instruments connectés ne sont pas un argument
              technique : ils servent à retirer de l&apos;inspection ce qui dépend de la personne
              qui la réalise. Même séquence, mêmes mesures, même classification d&apos;un véhicule
              au suivant — plus vite, sans ressaisie, et sans que la qualité du constat tienne à la
              journée qu&apos;a passée l&apos;inspecteur.
            </p>
            <p className="text-white/80 leading-relaxed mb-6">
              Chaque capacité ci-dessous porte deux statuts : sa maturité, et si elle alimente déjà
              le rapport.
            </p>
            <figure className="mb-8">
              <img
                src="/images/technology/ma-inspector-gravite-capture.png"
                alt="Capture d'écran de MA-Inspector : saisie d'un constat sur le tableau de bord, avec description, sélecteur de gravité et capture photo obligatoire"
                className="w-full h-auto border border-rule-2"
                width="636"
                height="857"
                loading="lazy"
              />
              <figcaption className="mt-2 text-xs text-white/80 leading-relaxed">
                Capture d&apos;écran de MA-Inspector, l&apos;outil terrain de nos inspecteurs —
                saisie d&apos;un constat sur le tableau de bord. D&apos;autres captures (procédure
                complète, instruments) suivront à mesure du déploiement.
              </figcaption>
            </figure>
            <div className="space-y-5">
              {SUMMARY_CAPABILITIES.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 border border-white/25 text-white flex items-center justify-center flex-shrink-0">
                    {ICONS[item.id]}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                      <h3 className="font-bold">{item.title}</h3>
                      <StatusBadges
                        maturity={item.maturity}
                        integration={item.integration}
                        tone="dark"
                      />
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link
              to="/technology"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 border border-white/35 hover:bg-white/10 hover:border-white font-semibold transition-colors"
            >
              <span className="text-white inline-flex items-center gap-2">
                Voir la plateforme en détail
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
          </div>

          {/* Gouvernance */}
          <div>
            <p className="font-mono text-[#f0a184] font-medium uppercase tracking-[0.14em] text-sm mb-3">
              L&apos;auditabilité
            </p>
            <h2 className="text-3xl font-bold mb-5 leading-tight">
              Un certificat n&apos;a de valeur que s&apos;il peut être vérifié.
            </h2>
            <p className="text-white/80 leading-relaxed mb-8">
              L&apos;auditabilité n&apos;est pas une case de conformité ajoutée après coup : elle
              conditionne l&apos;acceptation du constat par un tiers — acheteur, douane, banque ou
              assureur.
            </p>
            <div className="space-y-5">
              {governance.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  className="flex items-start gap-4 border border-white/15 p-5"
                >
                  <div className="w-10 h-10 border border-white/25 text-white flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1.5">{item.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
