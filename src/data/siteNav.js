/**
 * Plan du site, partagé par l'en-tête (Navigation.jsx) et le pied de page (Footer.jsx)
 * pour que bureau, mobile et pied de page présentent les pages de la même façon
 * (docs/specs/2026-10-refonte-accueil.md, §3) :
 *
 * - MAIN_LINKS : les trois liens toujours visibles de l'en-tête ;
 * - NAV_GROUPS : les autres pages, classées en trois rubriques, derrière « Plus »
 *   sur bureau, sous les liens principaux dans le menu mobile, en colonnes dans le
 *   pied de page.
 */

export const MAIN_LINKS = [
  { path: '/#parcours', label: 'Comment ça marche' },
  { path: '/tarifs', label: 'Tarifs' },
  { path: '/professionnels', label: 'Professionnels' },
];

export const NAV_GROUPS = [
  {
    title: 'Le diagnostic',
    links: [
      { path: '/inspection', label: 'Ce que couvre le diagnostic' },
      { path: '/exemple-de-rapport', label: 'Exemple de rapport' },
      { path: '/technology', label: 'Technologie' },
      { path: '/guides', label: 'Guides' },
    ],
  },
  {
    title: 'Partenaires',
    links: [
      { path: '/partenaires', label: 'Nos partenaires' },
      { path: '/devenir-partenaire', label: 'Devenir partenaire' },
    ],
  },
  {
    title: 'MALLOULIAUTO',
    links: [
      { path: '/about', label: 'À propos' },
      { path: '/careers', label: 'Carrières' },
      { path: '/contact', label: 'Contact' },
    ],
  },
];

/**
 * Pied de page : les mêmes rubriques ; « Le diagnostic » y reprend aussi les liens
 * principaux de l'en-tête et la FAQ de l'accueil.
 */
export const FOOTER_GROUPS = NAV_GROUPS.map((group, index) =>
  index === 0
    ? {
        ...group,
        links: [...MAIN_LINKS, ...group.links, { path: '/#faq', label: 'FAQ' }],
      }
    : group
);
