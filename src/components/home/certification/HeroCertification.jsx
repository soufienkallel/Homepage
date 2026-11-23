import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone } from '../../icons';
import { TOTAL_INSTRUMENTS } from '../../../data/inspectionFacts';
import { PHONE, whatsappLink } from '../../../data/contactChannels';
import { SAMPLE_REPORT_PATH } from '../../../data/sampleReport';
import { BASE_PRICE_LABEL, PAYMENT_RULE } from '../../../data/pricing';
import { trackEvent } from '../../../lib/analytics';
import ReportPreview from './ReportPreview';

/**
 * Hero de la refonte du 16 oct. 2026 (docs/specs/2026-10-refonte-accueil.md, bloc 1) :
 * une promesse dans les mots du client, une action, et le rapport lui-même comme visuel.
 * La vidéo de lancement et les preuves détaillées sont descendues dans le bandeau de
 * confiance ; aucun nombre de points ici (les concurrents annoncent tous « 200 points »).
 *
 * Fond : l'image de showroom générée (docs/prompt-hero-image.md), en attendant la séance
 * photo réelle décidée le 16 oct. 2026. Écart connu et accepté : le VUS flouté à
 * l'arrière-plan gauche porte un badge reconnaissable comme un logo Volkswagen, sous la
 * partie la plus opaque du voile. Pour brancher une vidéo ou la vraie photo : remplacer le
 * bloc <picture>, garder le conteneur et les voiles.
 *
 * Mini-formulaire : ses valeurs préremplissent l'étape 1 de /demande-inspection. Sous sm,
 * les champs disparaissent : un seul bouton pleine largeur et le téléphone. Le numéro et WhatsApp
 * sont des boutons à contour (pas une ligne de texte soulignée) : sur téléphone, un appel ou un
 * message en un geste ; les deux tiennent sur une ligne dès 360 px.
 */
const HERO_IMAGE_WEBP = '/images/hero/hero-annotated-car.webp';
const HERO_IMAGE_JPG = '/images/hero/hero-annotated-car.jpg';

const chips = ['Indépendant', `${TOTAL_INSTRUMENTS} instruments`, 'Vérifiable en ligne'];

export default function HeroCertification() {
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState({ make: '', model: '' });

  const startRequest = (event) => {
    event.preventDefault();
    trackEvent('cta_click', 'hero');
    const params = new URLSearchParams();
    if (vehicle.make.trim()) params.set('marque', vehicle.make.trim());
    if (vehicle.model.trim()) params.set('modele', vehicle.model.trim());
    const query = params.toString();
    navigate(`/demande-inspection${query ? `?${query}` : ''}`);
  };

  return (
    <section className="relative overflow-hidden text-white bg-navy border-b border-rule">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <picture>
          <source srcSet={HERO_IMAGE_WEBP} type="image/webp" />
          <img
            src={HERO_IMAGE_JPG}
            alt="Illustration : showroom de voitures d'occasion"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
        </picture>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(97deg, rgba(18,31,40,.94) 0%, rgba(18,31,40,.9) 55%, rgba(18,31,40,.78) 100%)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-14 lg:py-20 relative z-10 grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="min-w-0"
        >
          <span className="block font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4">
            Expertise avant achat ou vente · Tunisie
          </span>

          <h1 className="text-[clamp(31px,5vw,48px)] font-semibold leading-[1.06] tracking-[-0.027em] mb-5 max-w-[20ch]">
            Achetez ou vendez une voiture d&apos;occasion, sans mauvaise surprise.
          </h1>

          <p className="text-lg lg:text-xl text-white/85 mb-8 leading-relaxed max-w-[52ch]">
            Un inspecteur indépendant contrôle la voiture à votre place. Rapport chiffré immédiat,
            vérifiable en ligne.
          </p>

          <form
            onSubmit={startRequest}
            aria-label="Commencer une demande de diagnostic"
            className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] bg-white mb-3 max-w-[680px]"
          >
            <label className="hidden sm:flex flex-col gap-1 px-4 py-3 border-r border-rule">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-2">
                Marque
              </span>
              <input
                type="text"
                name="marque"
                value={vehicle.make}
                onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                placeholder="Peugeot"
                maxLength={80}
                className="text-base text-ink placeholder:text-ink-3 outline-none bg-transparent"
              />
            </label>
            <label className="hidden sm:flex flex-col gap-1 px-4 py-3 border-r border-rule">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-2">
                Modèle
              </span>
              <input
                type="text"
                name="modele"
                value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                placeholder="208"
                maxLength={80}
                className="text-base text-ink placeholder:text-ink-3 outline-none bg-transparent"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 lg:px-7 min-h-[56px] bg-accent-ink hover:bg-ink transition-colors text-white font-bold whitespace-nowrap"
            >
              Demander un diagnostic
              <ArrowRight className="w-5 h-5" accent="currentColor" />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <a
                href={PHONE.href}
                onClick={() => trackEvent('call_click', 'hero')}
                aria-label={`Appeler le ${PHONE.display}`}
                className="inline-flex items-center gap-2 sm:gap-2.5 min-h-[48px] px-2.5 sm:px-4 border border-white/60 hover:bg-white/10 transition-colors"
              >
                <Phone className="w-5 h-5 flex-shrink-0" accent="currentColor" />
                <span className="font-mono text-base sm:text-lg font-semibold tracking-tight whitespace-nowrap">
                  {PHONE.display}
                </span>
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', 'hero')}
                className="inline-flex items-center gap-2 sm:gap-2.5 min-h-[48px] px-2.5 sm:px-4 border border-white/60 hover:bg-white/10 transition-colors"
              >
                <MessageCircle className="w-5 h-5 flex-shrink-0" accent="currentColor" />
                <span className="text-base font-semibold">WhatsApp</span>
              </a>
            </div>
            <Link
              to={SAMPLE_REPORT_PATH}
              className="text-sm font-semibold text-white underline underline-offset-[3px]"
            >
              Voir un exemple de rapport
            </Link>
          </div>

          <p className="text-sm text-white mb-5">
            Dès <span className="font-mono font-semibold">{BASE_PRICE_LABEL}</span>,{' '}
            {PAYMENT_RULE.toLowerCase()} · Rapport immédiat · Avec ou sans vous
          </p>

          <ul className="flex flex-wrap gap-2" aria-label="En bref">
            {chips.map((chip) => (
              <li
                key={chip}
                className="font-mono text-[11px] uppercase tracking-[0.06em] border border-white/30 text-white/85 px-2.5 py-1"
              >
                {chip}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="rotate-[1.2deg] shadow-[0_18px_40px_rgba(0,0,0,.35)]">
            <ReportPreview variant="hero" className="max-w-[400px] mx-auto" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
