/**
 * La photo d'un inspecteur au travail (public/images/process, deux largeurs). C'est une
 * illustration, pas une photo de l'équipe : pas de légende qui parle de « nos inspecteurs ».
 * Une séance photo réelle la remplacera (docs/specs/2026-10-refonte-accueil.md §6).
 * Toujours sous la ligne de flottaison : chargement différé.
 */
export default function InspectorPhoto({ className = '', sizes = '100vw' }) {
  return (
    <img
      src="/images/process/inspector-on-site-1600.webp"
      srcSet="/images/process/inspector-on-site-800.webp 800w, /images/process/inspector-on-site-1600.webp 1600w"
      sizes={sizes}
      width="1600"
      height="900"
      alt="Un inspecteur contrôle une voiture avec une tablette, son véhicule d'intervention garé derrière."
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
