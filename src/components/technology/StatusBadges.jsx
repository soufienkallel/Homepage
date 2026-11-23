import { MATURITY, INTEGRATION } from '../../data/platformCapabilities';

/**
 * Les deux statuts d'une capacité : maturité, puis intégration au rapport.
 * Neutre quand la capacité produit déjà le rapport ; orange sinon. Jamais les
 * couleurs de gravité, réservées au vocabulaire du rapport.
 */
const TONES = {
  dark: {
    settled: 'border-white/35 text-white/80',
    pending: 'border-[#f0a184]/60 text-[#f0a184]',
  },
  light: {
    settled: 'border-rule-2 text-ink-2',
    pending: 'border-accent text-accent-ink',
  },
};

function Badge({ label, settled, tone }) {
  return (
    <span
      className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 border whitespace-nowrap ${
        settled ? TONES[tone].settled : TONES[tone].pending
      }`}
    >
      {label}
    </span>
  );
}

export default function StatusBadges({ maturity, integration, tone = 'light' }) {
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      <Badge label={maturity} settled={maturity === MATURITY.DISPONIBLE} tone={tone} />
      {integration && (
        <Badge label={integration} settled={integration === INTEGRATION.AU_RAPPORT} tone={tone} />
      )}
    </span>
  );
}
