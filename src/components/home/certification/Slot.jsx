/**
 * Emplacement visuellement marqué pour un contenu non finalisé (photo, logo,
 * témoignage) — jamais un simple rectangle gris ni un contenu inventé.
 * Motif `.slot` / `.slot.dark` défini dans src/index.css.
 */
export default function Slot({ children, dark = false, className = '' }) {
  return (
    <div className={`slot ${dark ? 'dark' : ''} ${className}`}>
      <span>{children}</span>
    </div>
  );
}
