/**
 * Jeu d'icônes propriétaire MALLOULIAUTO.
 *
 * Design system : grille 24 px, trait 1.8 arrondi en currentColor, et sur chaque
 * icône un élément d'accent en orange de marque (#FE7743) — la signature visuelle
 * du set. L'accent est surchargeable via la prop `accent` (p. ex.
 * accent="currentColor" quand l'icône est posée sur un fond orange).
 *
 * Les noms d'export reprennent ceux utilisés par les composants de la homepage,
 * ce qui permet de remplacer lucide-react en ne changeant que la ligne d'import.
 */

const ACCENT = '#FE7743';

function Svg({ accent: _accent, children, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M6 12h12" />
    <path d="M12 6l6 6-6 6" />
    <circle cx="3.5" cy="12" r="1.1" fill={accent} stroke="none" />
  </Svg>
);

export const Check = ({ accent: _a, ...p }) => (
  <Svg {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Svg>
);

export const ShieldCheck = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M12 3l7 3v5c0 4.6-3 8.2-7 9.7C8 19.2 5 15.6 5 11V6l7-3z" />
    <path d="M9 11.5l2 2 4-4" stroke={accent} />
  </Svg>
);

export const Gauge = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M5 17a8 8 0 1 1 14 0" />
    <path d="M12 16l4.2-5.6" stroke={accent} />
    <circle cx="12" cy="16" r="1.4" fill={accent} stroke="none" />
  </Svg>
);

export const Smartphone = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <rect x="7.5" y="2.5" width="9" height="19" rx="2.2" />
    <path d="M7.5 12h9" stroke={accent} />
    <path d="M11 18.2h2" />
  </Svg>
);

export const FileCheck = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3z" />
    <path d="M13.5 3v5.5H19" />
    <path d="M9 14.5l2 2 4-4.5" stroke={accent} />
  </Svg>
);

export const FileSignature = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3z" />
    <path d="M13.5 3v5.5H19" />
    <path d="M8.5 16.5c1.3-2 2.1 1 3.5-.6s1.8.6 3.5-.4" stroke={accent} />
  </Svg>
);

export const Ruler = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M3 16.5L16.5 3l4.5 4.5L7.5 21 3 16.5z" />
    <path d="M7.2 12.8l1.6 1.6" stroke={accent} />
    <path d="M10.2 9.8l1.6 1.6" stroke={accent} />
    <path d="M13.2 6.8l1.6 1.6" stroke={accent} />
  </Svg>
);

export const Layers = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M12 3l8 4.5-8 4.5-8-4.5L12 3z" stroke={accent} />
    <path d="M4 12.5l8 4.5 8-4.5" />
    <path d="M4 17l8 4.5L20 17" />
  </Svg>
);

export const AudioLines = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M4 10v4" />
    <path d="M8 7.5v9" />
    <path d="M12 4.5v15" stroke={accent} />
    <path d="M16 7.5v9" />
    <path d="M20 10v4" />
  </Svg>
);

export const Cpu = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" />
    <rect x="10" y="10" width="4" height="4" rx="0.8" fill={accent} stroke="none" />
    <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
  </Svg>
);

export const ScanLine = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8" />
    <path d="M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8" />
    <path d="M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16" />
    <path d="M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16" />
    <path d="M6.5 12h11" stroke={accent} />
  </Svg>
);

export const EyeOff = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M3 12s3.5-6.5 9-6.5c1.7 0 3.2.6 4.5 1.4" />
    <path d="M21 12s-3.5 6.5-9 6.5c-1.7 0-3.2-.6-4.5-1.4" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M4.5 19.5l15-15" stroke={accent} />
  </Svg>
);

export const TrendingDown = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M3 7l6 6 4-4 8 8" />
    <path d="M21 13v4h-4" stroke={accent} />
  </Svg>
);

export const Ban = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6.2 6.2l11.6 11.6" stroke={accent} />
  </Svg>
);

export const Camera = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2.5h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5z" />
    <circle cx="12" cy="13" r="3.4" stroke={accent} />
  </Svg>
);

export const Package = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
    <path d="M4 7.5l8 4.5 8-4.5" />
    <path d="M12 12v9" />
    <path d="M8 5.25l8 4.5" stroke={accent} />
  </Svg>
);

export const BrainCircuit = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.2" stroke={accent} />
    <path d="M12 8.8V4M12 15.2V20M8.8 12H4M15.2 12H20" />
    <circle cx="12" cy="3.2" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="20.8" r="1" fill="currentColor" stroke="none" />
    <circle cx="3.2" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="20.8" cy="12" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const BadgeCheck = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path
      d="M12 3l2.2 1.8 2.8-.4 1 2.6 2.6 1-.4 2.8L22 13l-1.8 2.2.4 2.8-2.6 1-1 2.6-2.8-.4L12 23l-2.2-1.8-2.8.4-1-2.6-2.6-1 .4-2.8L2 13l1.8-2.2-.4-2.8 2.6-1 1-2.6 2.8.4L12 3z"
      transform="scale(0.92) translate(1,0)"
    />
    <path d="M9 12.5l2 2 4-4.5" stroke={accent} />
  </Svg>
);

export const Award = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <circle cx="12" cy="9.5" r="5.5" />
    <path d="M9 14.2L7.5 21l4.5-2.5L16.5 21 15 14.2" />
    <circle cx="12" cy="9.5" r="1.8" fill={accent} stroke="none" />
  </Svg>
);

export const Building2 = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" />
    <path d="M14 9h3a2 2 0 0 1 2 2v10" />
    <path d="M3 21h18" />
    <path d="M8.2 7h2.5M8.2 11h2.5M8.2 15h2.5" stroke={accent} />
  </Svg>
);

export const Store = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M5 4h14l1.5 5h-17L5 4z" />
    <path d="M3.5 9h17" stroke={accent} />
    <path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
    <path d="M10 21v-5.5h4V21" />
  </Svg>
);

export const Globe2 = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5c3.2 2.4 3.2 14.6 0 17M12 3.5c-3.2 2.4-3.2 14.6 0 17" />
    <path d="M3.5 12h17" stroke={accent} />
  </Svg>
);

export const LayoutGrid = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" fill={accent} stroke="none" />
  </Svg>
);

export const Handshake = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <circle cx="8.8" cy="12" r="5.6" />
    <circle cx="15.2" cy="12" r="5.6" />
    <circle cx="12" cy="12" r="1.5" fill={accent} stroke="none" />
  </Svg>
);

export const Tags = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M3 11V5a2 2 0 0 1 2-2h6l10 10-8 8L3 11z" />
    <circle cx="7.5" cy="7.5" r="1.5" fill={accent} stroke="none" />
  </Svg>
);

export const Eye = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z" />
    <circle cx="12" cy="12" r="2.5" fill={accent} stroke="none" />
  </Svg>
);

export const Database = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" stroke={accent} />
    <path d="M4.5 5.5v13c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v-13" />
    <path d="M4.5 12c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8" />
  </Svg>
);

export const ScrollText = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M8 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M6 7H4.5A1.5 1.5 0 0 1 3 5.5 2.5 2.5 0 0 1 5.5 3H8" />
    <path d="M10.5 8.5h6M10.5 12h6M10.5 15.5h4" stroke={accent} />
  </Svg>
);

export const UserCheck = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <circle cx="10" cy="8" r="3.5" />
    <path d="M4 20a6 6 0 0 1 12 0" />
    <path d="M15 10.5l2 2 4-4" stroke={accent} />
  </Svg>
);

export const Scale = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M12 5v16" />
    <path d="M5 7h14" />
    <path d="M5 7l-2.6 6a2.9 2.9 0 0 0 5.2 0L5 7z" />
    <path d="M19 7l-2.6 6a2.9 2.9 0 0 0 5.2 0L19 7z" />
    <path d="M9 21h6" />
    <circle cx="12" cy="5" r="1.4" fill={accent} stroke="none" />
  </Svg>
);

export const Phone = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M6.5 3.5h3l1.6 4.2-2.1 1.3a11 11 0 0 0 6 6l1.3-2.1 4.2 1.6v3a1.8 1.8 0 0 1-2 1.8A17 17 0 0 1 4.7 5.5a1.8 1.8 0 0 1 1.8-2z" />
    <circle cx="18.5" cy="5.5" r="1.1" fill={accent} stroke="none" />
  </Svg>
);

export const MessageCircle = ({ accent = ACCENT, ...p }) => (
  <Svg {...p}>
    <path d="M4 20l1.4-4.2A8.5 8.5 0 1 1 8.6 19L4 20z" />
    <circle cx="12.5" cy="11.5" r="1.1" fill={accent} stroke="none" />
  </Svg>
);
