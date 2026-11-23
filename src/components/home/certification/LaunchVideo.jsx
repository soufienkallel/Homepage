import { useEffect, useRef } from 'react';

/**
 * Vidéo de lancement (story Instagram/Facebook « Les premières demandes
 * d'inspection sont arrivées », 20 s, 9:16, avec musique), décision du
 * 1er oct. 2026 : sur la homepage, jamais en pop-up à l'arrivée — une vignette
 * dans le hero, qui ouvre un lecteur au clic. Le clic du visiteur autorise la
 * lecture avec le son, et la vidéo n'est téléchargée qu'à ce moment-là
 * (preload="none") : aucun poids ajouté au premier chargement.
 *
 * Contenu relu image par image le 1er oct. 2026 : quatre écrans, dont un rapport
 * réel en marque blanche (Myrage, données personnelles masquées), publié tel
 * quel sur décision du fondateur malgré l'écart avec le design system et les
 * règles du partenariat — voir docs/specs/2026-10-video-lancement.md. L'engagement 24 h
 * et les horaires sont ceux de contactChannels.js. C'est une annonce datée — à
 * retirer (ou remplacer) quand « Lancement » ne sera plus vrai.
 */
const LAUNCH_VIDEO = {
  src: '/videos/lancement-premieres-demandes.mp4',
  posterWebp: '/videos/lancement-premieres-demandes-poster.webp',
  posterJpg: '/videos/lancement-premieres-demandes-poster.jpg',
  duration: '0:20',
  title: 'Les premières demandes d’inspection sont arrivées',
};

// Équivalent texte des quatre écrans de la vidéo (la musique ne porte aucune parole).
const TRANSCRIPT =
  "Lancement : les premières demandes d'inspection sont arrivées, merci pour votre confiance. " +
  "Avant d'acheter une voiture d'occasion, faites-la vérifier : un inspecteur indépendant, " +
  'un rapport écrit et clair pour décider ou négocier le prix — inspection visuelle, contrôle ' +
  "mécanique, rapport écrit et structuré. Un vrai rapport, photos à l'appui : extraits d'un " +
  "rapport d'inspection, données personnelles masquées. Demandez votre inspection : réponse " +
  'sous 24 h, du lundi au samedi, de 8 h à 18 h.';

const PlayMark = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
  </svg>
);

const Poster = () => (
  <picture>
    <source srcSet={LAUNCH_VIDEO.posterWebp} type="image/webp" />
    <img
      src={LAUNCH_VIDEO.posterJpg}
      alt="Aperçu de la vidéo de lancement"
      width="540"
      height="960"
      loading="lazy"
      className="w-full h-full object-cover"
    />
  </picture>
);

/**
 * Vignette : l'affiche de la vidéo dans un cadre plat à bordure.
 * `compact` : une ligne — petite affiche à gauche, libellé à droite.
 * `light` : sur fond clair (bandeau de confiance de l'accueil, refonte du 16 oct. 2026).
 */
export function LaunchVideoCard({ onOpen, compact = false, light = false, className = '' }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className={`group flex w-full items-center gap-3 p-2 pr-4 text-left border transition-colors ${
          light ? 'border-rule-2 hover:border-ink' : 'border-white/25 hover:border-white/60'
        } ${className}`}
      >
        <span className="block w-11 aspect-[9/16] flex-shrink-0 overflow-hidden">
          <Poster />
        </span>
        <span className="flex-1 min-w-0">
          <span
            className={`block font-mono text-[10px] font-medium uppercase tracking-[0.12em] ${
              light ? 'text-accent-ink' : 'text-[#f0a184]'
            }`}
          >
            Vidéo · {LAUNCH_VIDEO.duration}
          </span>
          <span
            className={`block text-sm leading-snug mt-0.5 ${light ? 'text-ink' : 'text-white'}`}
          >
            Lancement : les premières demandes
          </span>
        </span>
        <span className="inline-flex items-center justify-center w-9 h-9 flex-shrink-0 bg-accent group-hover:bg-accent-ink text-white transition-colors">
          <PlayMark />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`group block w-full text-left border border-white/25 hover:border-white/60 bg-navy-d transition-colors ${className}`}
    >
      <span className="relative block aspect-[9/16] overflow-hidden">
        <Poster />
        <span className="absolute left-3 bottom-3 inline-flex items-center justify-center w-10 h-10 bg-accent group-hover:bg-accent-ink text-white transition-colors">
          <PlayMark />
        </span>
      </span>
      <span className="block px-3 py-2.5 border-t border-white/25">
        <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#f0a184]">
          Vidéo · {LAUNCH_VIDEO.duration}
        </span>
        <span className="block text-xs text-white/85 leading-snug mt-0.5">
          Lancement : les premières demandes
        </span>
      </span>
    </button>
  );
}

/**
 * Lecteur en <dialog> natif : piège de focus, Échap et fond inerte fournis par
 * le navigateur. Le <video> n'est monté que dialogue ouvert : rien (ni affiche
 * ni octet de vidéo) n'est téléchargé avant le clic, et fermer l'arrête net.
 */
export function LaunchVideoDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // Toujours dans l'activation déclenchée par le clic : la lecture avec le son
      // est autorisée. Si le navigateur la refuse malgré tout, les contrôles restent.
      videoRef.current?.play().catch(() => {});
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Un clic sur le fond (la cible est le <dialog> lui-même, pas son contenu) ferme.
      onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
      aria-labelledby="launch-video-title"
      aria-describedby="launch-video-transcript"
      className="m-auto p-0 bg-transparent max-w-none max-h-none backdrop:bg-ink/85"
    >
      <div className="flex flex-col w-[min(92vw,calc((100dvh-7rem)*9/16))] bg-navy border border-white/25">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-white/25 text-white">
          <p
            id="launch-video-title"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] truncate"
          >
            Lancement · Vidéo {LAUNCH_VIDEO.duration}
          </p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="font-mono text-lg leading-none px-2 py-1 -mr-2 text-white/80 hover:text-white"
            aria-label="Fermer la vidéo"
          >
            ×
          </button>
        </div>
        {open && (
          <video
            ref={videoRef}
            src={LAUNCH_VIDEO.src}
            poster={LAUNCH_VIDEO.posterJpg}
            controls
            playsInline
            className="block w-full aspect-[9/16] bg-navy-d"
          >
            <a href={LAUNCH_VIDEO.src}>Télécharger la vidéo</a>
          </video>
        )}
        <p id="launch-video-transcript" className="sr-only">
          {TRANSCRIPT}
        </p>
      </div>
    </dialog>
  );
}
