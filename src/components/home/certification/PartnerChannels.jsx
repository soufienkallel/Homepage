import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Handshake, ShieldCheck, Building2, ArrowRight } from '../../icons';

/**
 * Marque blanche — le protocole, les instruments et la plateforme sous la
 * marque du partenaire. Formulations alignées sur les Règles du partenariat
 * habilité (dataroom, 03-operations) :
 *  - « Nous ne certifions pas le constat. Nous certifions l'opérateur. »
 *  - « Rapport certifié MALLOULIAUTO » et « Powered by MALLOULIAUTO » sont
 *    explicitement interdits : la mention portable est « expert habilité ».
 *  - Un seul niveau d'habilitation, pas de palier ni de dérogation.
 * Aucun tarif ici : le frais de plateforme est contradictoire entre documents
 * du dataroom (frais fixe 10/20/10 TND vs commission uniforme de 20 %), donc
 * rien n'est publiable tant que ce n'est pas tranché.
 *
 * Depuis la refonte du 16 oct. 2026, ce contenu vit sur /devenir-partenaire et
 * s'adresse aux garages qui proposent le diagnostic dans leur atelier (les centres
 * partenaires de /partenaires). Règle ajoutée ce jour-là : un partenaire ne
 * diagnostique jamais un véhicule qu'il vend lui-même.
 */
const pillars = [
  {
    icon: <Handshake className="w-7 h-7" />,
    title: 'Le rapport porte votre marque',
    body: 'Vous vendez sous votre nom, à votre prix. Le rapport vous désigne comme expert habilité selon notre protocole, et précise que les constats engagent leur auteur — vous.',
  },
  {
    icon: <ShieldCheck className="w-7 h-7" />,
    title: "Un seul niveau d'habilitation",
    body: "Formation à la taxonomie et examen par personne, matériel homologué à numéro de série enregistré, période supervisée avant d'être habilité. Pas de palier inférieur, pas de régime dérogatoire.",
  },
  {
    icon: <Building2 className="w-7 h-7" />,
    title: 'Ce que nous garantissons, et ce que nous ne garantissons pas',
    body: "Nous ne certifions pas le constat : nous certifions l'opérateur. Vous répondez du contenu de votre rapport ; nous répondons de vous avoir formé, mesuré, et déclassé s'il le fallait.",
  },
];

export default function PartnerChannels() {
  return (
    <section id="marque-blanche" className="py-20 bg-white scroll-mt-[90px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
            Marque blanche
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-ink mb-4 leading-tight">
            Notre protocole et nos instruments, sous votre marque.
          </h2>
          <p className="text-lg text-ink-2 leading-relaxed">
            Garages et ateliers réalisent le même diagnostic que nos propres inspecteurs, sous leur
            propre nom. Nous fournissons le protocole, les instruments et la plateforme ; vous
            gardez la relation client. Les conditions se discutent au cas par cas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8 border-t border-rule">
          {pillars.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-ground-2 border border-rule border-t-0 md:border-t md:border-rule p-7"
            >
              <div className="w-12 h-12 border border-rule-2 text-ink flex items-center justify-center mb-5">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-ink mb-3 leading-snug">{item.title}</h3>
              <p className="text-ink-2 text-sm leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-sm text-ink-2 leading-relaxed max-w-[70ch] mb-8">
          Une règle sans exception : un partenaire ne diagnostique jamais un véhicule qu&apos;il
          vend lui-même, reprises comprises.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 border border-rule-2 bg-ground-2 p-7">
          <p className="text-ink-2 leading-relaxed max-w-2xl">
            Votre garage veut proposer le diagnostic à ses clients ?
          </p>
          <Link
            to="/contact?type=partenaire"
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy hover:bg-navy-d font-semibold transition-colors whitespace-nowrap"
          >
            <span className="text-white inline-flex items-center gap-2">
              Discuter d&apos;un partenariat
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
