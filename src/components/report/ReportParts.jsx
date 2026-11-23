import { useMemo } from 'react';
import wheelIcon from '../../assets/mallouliauto_wheel_icon.svg';
import {
  CERTIFICATE,
  FAMILIES,
  PRICED_FINDINGS,
  SYNTHESIS,
  TOTAL_REPAIRS_TND,
  VALUATION,
  VEHICLE,
} from '../../data/sampleReport';
import { PHOTO_URL, frNumber, plural, tnd } from './format';
import './sample-report.css';

/**
 * The blocks of the report's first page, shared by the full sample report (SampleReport.jsx)
 * and by the homepage preview (ReportPreview.jsx), so the two always look and read the same.
 */

/**
 * Décoratif : le vrai QR du rapport d'origine mène au rapport en ligne, qui porte les
 * coordonnées du client. Motif fixe, sans lien.
 */
export function QrMark() {
  const cells = useMemo(() => {
    const size = 21;
    const out = [];
    let seed = 7;
    const random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const inFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
        let on;
        if (inFinder) {
          const dx = (x < 7 ? x : x - 14) - 3;
          const dy = (y < 7 ? y : y - 14) - 3;
          const ring = Math.max(Math.abs(dx), Math.abs(dy));
          on = ring === 3 || ring <= 1;
        } else {
          on = random() > 0.52;
        }
        if (on) out.push([x, y]);
      }
    }
    return out;
  }, []);
  return (
    <svg
      className="rp-qr"
      viewBox="0 0 63 63"
      width="54"
      height="54"
      fill="#111"
      aria-hidden="true"
    >
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x * 3} y={y * 3} width="3" height="3" />
      ))}
    </svg>
  );
}

export function ReportHeader() {
  return (
    <header className="rp-head">
      <div className="rp-brand">
        <img className="rp-wheel" src={wheelIcon} alt="Logo MALLOULIAUTO" width="40" height="40" />
        <div>
          <p className="rp-name">MALLOULIAUTO</p>
          <p className="rp-sub">Rapport de condition véhicule</p>
        </div>
      </div>
      <div className="rp-cert">
        <div>
          <p className="rp-sub rp-r">Certificat N°</p>
          <p className="rp-no">{CERTIFICATE}</p>
          <p className="rp-sub rp-r">Vérifiable en ligne</p>
        </div>
        <QrMark />
      </div>
    </header>
  );
}

/**
 * Title, VIN and the spec tiles (with the plate tile, masked, as in the report). `asText` is set by the
 * homepage preview: its copy of the page then adds no section title (and no duplicate
 * heading) to the homepage outline.
 */
export function VehicleIdentity({ asText = false }) {
  const specs = [
    ...VEHICLE.specs.slice(0, 4),
    { label: 'Plaque', value: 'Masquée' },
    ...VEHICLE.specs.slice(4),
  ];
  return (
    <>
      {asText ? (
        <p className="rp-vtitle">{VEHICLE.title}</p>
      ) : (
        <h2 className="rp-vtitle">{VEHICLE.title}</h2>
      )}
      <p className="rp-vin">VIN {VEHICLE.vin}</p>
      <dl className="rp-specs">
        {specs.map((spec) => (
          <div key={spec.label}>
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

/** The vehicle photo and the finding count of each family (zero ones first, as in the report). */
export function FamiliesTop({ priority = false }) {
  const families = FAMILIES.slice().sort((a, b) => Number(a.count > 0) - Number(b.count > 0));
  return (
    <div className="rp-top">
      <img
        className="rp-topimg"
        src={PHOTO_URL('coin-avant-gauche')}
        alt={`Véhicule inspecté : ${VEHICLE.title}`}
        width="960"
        height="540"
        loading={priority ? 'eager' : 'lazy'}
      />
      <ul className="rp-fams">
        {families.map((family) => (
          <li key={family.name} className={family.count > 0 ? 'is-on' : ''}>
            <span className="rp-fl">{family.name}</span>
            <span className="rp-fc">{family.count === 0 ? '0' : plural(family.count)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TotalBand() {
  return (
    <div className="rp-total">
      <div>
        <p className="rp-tt">Total estimé des réparations</p>
        <p className="rp-ts">
          Constats chiffrés : {PRICED_FINDINGS} / {PRICED_FINDINGS}
        </p>
      </div>
      <div className="rp-tr">
        <p className="rp-ts rp-up">TOTAL À CHARGE</p>
        <p className="rp-tv">{tnd(TOTAL_REPAIRS_TND)}</p>
      </div>
    </div>
  );
}

/** « Prix le plus probable », right under the total, as in the product's report. */
export function ValuationPanel() {
  return (
    <div className="rp-valuation">
      <p className="rp-tt">{VALUATION.title}</p>
      <p className="rp-vprice">{tnd(frNumber(VALUATION.headlineTnd))}</p>
      <p className="rp-vrange">
        Les voitures comparables sont généralement affichées entre {frNumber(VALUATION.lowTnd)} et{' '}
        {tnd(frNumber(VALUATION.highTnd))}.
      </p>
      <p className="rp-vnote">{VALUATION.note}</p>
    </div>
  );
}

export function SynthesisBlock({ asText = false }) {
  return (
    <>
      {asText ? (
        <p className="rp-sec">Synthèse de l&apos;inspecteur</p>
      ) : (
        <h3 className="rp-sec">Synthèse de l&apos;inspecteur</h3>
      )}
      <p className="rp-box">{SYNTHESIS}</p>
    </>
  );
}
