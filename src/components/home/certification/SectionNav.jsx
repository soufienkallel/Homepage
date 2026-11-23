import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Sommaire de la page — un onglet par section réelle de Home.jsx, dans
 * l'ordre du DOM, libellé avec l'eyebrow que porte la section elle-même.
 * Une section renommée doit être répercutée ici : un onglet qui annonce une
 * section qui ne porte plus ce nom est pire que pas d'onglet du tout.
 *
 * `verifier` n'y figure pas volontairement : la navigation principale porte
 * déjà « Vérifier un certificat », et le rapport un lien direct.
 *
 * Le défilement reste natif (ancre + `scroll-margin-top` sur chaque section,
 * calé sur la hauteur des deux barres collantes) ; l'onglet actif suit la
 * section visible via IntersectionObserver.
 */
const ITEMS = [
  { id: 'rapport', label: 'Le rapport' },
  { id: 'ce-que-vous-recevez', label: 'Ce que vous recevez' },
  { id: 'parcours', label: 'Le parcours' },
  { id: 'couverture', label: "Ce que couvre l'inspection" },
  { id: 'a-quoi-ca-sert', label: 'À quoi ça sert' },
  { id: 'plateforme', label: 'La plateforme' },
  { id: 'marque-blanche', label: 'Marque blanche' },
  { id: 'faq', label: 'FAQ' },
];

export default function SectionNav() {
  const [activeId, setActiveId] = useState(ITEMS[0].id);
  const railRef = useRef(null);
  const lockUntilRef = useRef(0);

  useEffect(() => {
    const sections = ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        // `scroll-behavior: smooth` fait traverser toutes les sections
        // intermédiaires après un clic : sans ce verrou, l'onglet actif
        // défilerait sur toute la barre avant de se poser.
        if (Date.now() < lockUntilRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: '-140px 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Recentre l'onglet actif dans le rail en agissant sur son seul `scrollLeft`
  // plutôt que via scrollIntoView, qui remonte aussi les conteneurs parents.
  useEffect(() => {
    const rail = railRef.current;
    const activeButton = rail?.querySelector(`[data-id="${activeId}"]`);
    if (!rail || !activeButton) return;
    const offsetInRail =
      rail.scrollLeft +
      activeButton.getBoundingClientRect().left -
      rail.getBoundingClientRect().left;
    const left = offsetInRail - (rail.clientWidth - activeButton.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [activeId]);

  const handleClick = useCallback((id) => {
    lockUntilRef.current = Date.now() + 800;
    setActiveId(id);
  }, []);

  return (
    <nav
      aria-label="Sommaire de la page"
      className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-rule"
    >
      <div
        ref={railRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar"
      >
        {ITEMS.map((item) => (
          <a
            key={item.id}
            data-id={item.id}
            href={`#${item.id}`}
            onClick={() => handleClick(item.id)}
            aria-current={activeId === item.id ? 'true' : undefined}
            className={`group flex-shrink-0 px-3.5 py-1.5 border text-sm font-semibold whitespace-nowrap transition-colors ${
              activeId === item.id
                ? 'bg-navy border-navy'
                : 'border-transparent hover:border-rule-2'
            }`}
          >
            {/* span, pas de couleur directement sur <a> : la règle globale
                `a { color: inherit }` (hors cascade layer) prime sur les
                utilitaires Tailwind non-!important comme text-white. */}
            <span
              className={`transition-colors ${
                activeId === item.id ? 'text-white' : 'text-ink-2 group-hover:text-ink'
              }`}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
