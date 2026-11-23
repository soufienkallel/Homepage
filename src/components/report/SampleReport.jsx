import { useEffect } from 'react';
import {
  CERTIFICATE,
  CHECKED,
  CONTEXT,
  EQUIPMENT_USED,
  FAMILIES,
  FAMILY_SECTIONS,
  FAULT_CODES,
  FAULT_CODE_FULL,
  FINDINGS,
  MEASURE_TABLES,
  MILEAGE_GAP,
  MILEAGE_READINGS,
  PAGES_COUNT,
  PHOTOS_PROVIDED,
  PHOTO_SLOTS,
  PRICED_FINDINGS,
  REPORT_REF,
  SAMPLE_PHOTO_DIR,
  SYNTHESIS,
  VALUATION,
  TOTAL_REPAIRS_TND,
  TRACEABILITY,
  VEHICLE,
} from '../../data/sampleReport';
import { PHOTO_URL, tnd } from './format';
import {
  FamiliesTop,
  ReportHeader,
  SynthesisBlock,
  TotalBand,
  ValuationPanel,
  VehicleIdentity,
} from './ReportParts';
import './sample-report.css';

/**
 * Le rapport de condition véhicule du diagnostic de démonstration, reproduit section par
 * section dans l'ordre du rapport d'origine (docs/specs/2026-10-refonte-accueil.md §7) :
 * identité et résumé, synthèse, traçabilité, contexte, photos, puis chaque famille (constats,
 * éléments sans anomalie, tableaux), les mesures et le détail du coût.
 *
 * Ajouts propres au web, qui ne retirent rien : un sommaire collant, un bouton d'impression,
 * des tableaux compacts sur téléphone, et le tableau de 31 mesures de peinture replié par
 * défaut (« Voir les 31 mesures »). Toutes les données viennent de src/data/sampleReport.js.
 */

const plural = (count) => `${count} constat${count > 1 ? 's' : ''}`;
const slug = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const familyId = (name) => `famille-${slug(name)}`;

/** Un tableau de mesures plus long que ça est replié derrière « Voir les N mesures ». */
const FOLD_FROM = 12;

const INDEX = [
  ['Résumé', 'resume'],
  ['Photos', 'photos'],
  ...FAMILY_SECTIONS.map((name) => [name, familyId(name)]),
  ['Mesures', 'mesures'],
  ['Coûts', 'couts'],
];

const MASKED_CONTEXT = ['Nom du client', 'Téléphone du client', 'E-mail du client'];

function Icon({ name }) {
  const common = {
    viewBox: '0 0 24 24',
    width: 16,
    height: 16,
    'aria-hidden': true,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  if (name === 'clock') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  if (name === 'camera') {
    return (
      <svg {...common}>
        <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    );
  }
  if (name === 'lock') {
    return (
      <svg {...common} width={18} height={18} strokeWidth={2}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  if (name === 'print') {
    return (
      <svg {...common} strokeWidth={2}>
        <path d="M7 9V4h10v5M7 17H5v-6h14v6h-2M7 14h10v6H7z" />
      </svg>
    );
  }
  // warning triangle
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="#f97316">
      <path d="M12 3 1.8 20.5h20.4zM11 10h2v5h-2zm0 6.2h2v2h-2z" fillRule="evenodd" />
    </svg>
  );
}

function Severity({ level }) {
  return (
    <span className={`rp-pill ${level === 'Modérée' ? 'rp-pill-mod' : 'rp-pill-min'}`}>
      {level.toUpperCase()}
    </span>
  );
}

function FindingCard({ finding }) {
  return (
    <li className="rp-card">
      <img
        src={PHOTO_URL(finding.photo)}
        alt={`${finding.item} : photo du constat`}
        width="960"
        height="540"
        loading="lazy"
      />
      <div className="rp-card-body">
        <p className="rp-card-title">
          <span className={`rp-num ${finding.severity === 'Modérée' ? 'rp-num-mod' : ''}`}>
            {finding.number}
          </span>
          {finding.item}
        </p>
        <p className="rp-card-meta">
          <Severity level={finding.severity} /> <span>- Réparation</span>
        </p>
        <p className="rp-card-detail">{finding.detail}</p>
        <p className="rp-card-price">{tnd(finding.priceTnd)}</p>
      </div>
    </li>
  );
}

function Checked({ label, items }) {
  return (
    <>
      <p className="rp-lbl">{label}</p>
      <p className="rp-box rp-small">{items.join(', ')}</p>
    </>
  );
}

function FamilySection({ name }) {
  const count = FAMILIES.find((family) => family.name === name).count;
  const findings = FINDINGS.filter((finding) => finding.family === name);
  const checked = CHECKED[name];
  return (
    <section>
      {count > 0 ? (
        <h3 className="rp-fam rp-anchor" id={familyId(name)}>
          <Icon name="warn" />
          {name} - {plural(count)}
        </h3>
      ) : (
        <h3 className="rp-fam rp-plain rp-anchor" id={familyId(name)}>
          {name}
        </h3>
      )}
      {findings.length > 0 && (
        <ul className="rp-cards">
          {findings.map((finding) => (
            <FindingCard key={finding.number} finding={finding} />
          ))}
        </ul>
      )}
      <Checked label="Rien à signaler" items={checked.ok} />
      {checked.absent && <Checked label="Non équipé" items={checked.absent} />}
      {name === 'Diagnostic électronique' && (
        <>
          <p className="rp-lbl rp-lbl-dark">Cohérence kilométrique multi-calculateurs</p>
          <table className="rp-tbl rp-tbl-compact">
            <thead>
              <tr>
                <th>Calculateur</th>
                <th>Kilométrage relevé</th>
              </tr>
            </thead>
            <tbody>
              {MILEAGE_READINGS.map((reading) => (
                <tr key={reading.source}>
                  <td>{reading.source}</td>
                  <td className="rp-muted">{reading.km}</td>
                </tr>
              ))}
              <tr>
                <td>Écart entre relevés</td>
                <td className="rp-muted">{MILEAGE_GAP}</td>
              </tr>
            </tbody>
          </table>
          <p className="rp-lbl rp-lbl-dark">Codes défaut</p>
          <table className="rp-tbl">
            <thead>
              <tr>
                <th>Repère</th>
                <th>Constat</th>
                <th>Sévérité</th>
              </tr>
            </thead>
            <tbody>
              {FAULT_CODES.map((fault) => (
                <tr key={fault.code}>
                  <td className="rp-b" data-l="Repère">
                    {fault.source}
                  </td>
                  <td className="rp-muted" data-l="Constat">
                    {FAULT_CODE_FULL}
                  </td>
                  <td data-l="Sévérité">
                    <Severity level={fault.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

/** Le résumé d'une ligne pour un tableau replié : « Épaisseur de peinture · 120 µm · Origine ». */
function foldSummary(table) {
  const lines = table.rows.flatMap((row) => row.lines);
  const unique = (values) => [...new Set(values.filter(Boolean))];
  const values = unique(lines.map((line) => line.value));
  const states = unique(lines.map((line) => line.state));
  const measures = unique(lines.map((line) => line.measure));
  const what = measures.length === 1 ? measures[0] : 'Mesures';
  const range = values.length === 1 ? values[0] : `${values[0]} à ${values[values.length - 1]}`;
  return `${what} · ${range}${states.length === 1 ? ` · ${states[0]}` : ''}`;
}

function MeasureTable({ table }) {
  const { columns, rows } = table;
  const body = (
    <table className="rp-tbl rp-tbl-measures">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${row.element}-${index}`}>
            <td className="rp-b" data-l={columns[0]}>
              {row.element}
            </td>
            <td className="rp-muted" data-l={columns[1]}>
              {row.lines.map((line) => (
                <span className="rp-ln" key={line.measure}>
                  {line.measure}
                </span>
              ))}
            </td>
            <td className="rp-b" data-l={columns[2]}>
              {row.lines.map((line) => (
                <span className="rp-ln" key={line.measure}>
                  {line.value}
                </span>
              ))}
            </td>
            {columns.length === 4 && (
              <td className="rp-muted" data-l="État">
                {row.lines.map((line) => (
                  <span className="rp-ln" key={line.measure}>
                    {line.state ?? ''}
                  </span>
                ))}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <>
      <h3 className="rp-fam rp-plain rp-anchor" id={`mesures-${familyId(table.family)}`}>
        Mesures - {table.family}
      </h3>
      {rows.length > FOLD_FROM ? (
        <details className="rp-fold">
          <summary>
            <span>Voir les {rows.length} mesures</span>
            <span className="rp-fold-sum">{foldSummary(table)}</span>
          </summary>
          {body}
        </details>
      ) : (
        body
      )}
    </>
  );
}

function CostTable() {
  const groups = FAMILY_SECTIONS.map((family) => ({
    family,
    items: FINDINGS.filter((finding) => finding.family === family),
  })).filter((group) => group.items.length > 0);
  return (
    <>
      <h3 className="rp-fam rp-plain rp-anchor" id="couts">
        Détails coût estimé
      </h3>
      <table className="rp-tbl rp-tbl-cost">
        <thead>
          <tr>
            <th>Constat</th>
            <th>Réparation / remplacement</th>
            <th>Détails</th>
            <th className="rp-r">Prix</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <GroupRows key={group.family} group={group} />
          ))}
        </tbody>
      </table>
    </>
  );
}

function GroupRows({ group }) {
  return (
    <>
      <tr className="rp-famrow">
        <td colSpan={4}>{group.family}</td>
      </tr>
      {group.items.map((finding) => (
        <tr key={finding.number}>
          <td data-l="Constat">
            <span className="rp-b">{finding.item}</span>
            <span className="rp-muted rp-ln">{finding.detail}</span>
          </td>
          <td data-l="Réparation / remplacement" className="rp-muted">
            Réparation
          </td>
          <td data-l="Détails" className="rp-muted">
            {finding.costLines.map((line) => (
              <span className="rp-ln" key={line.label}>
                {line.label}
              </span>
            ))}
          </td>
          <td data-l="Prix" className="rp-price rp-r">
            {finding.costLines.map((line) => (
              <span className="rp-ln" key={line.label}>
                {tnd(line.priceTnd)}
              </span>
            ))}
          </td>
        </tr>
      ))}
    </>
  );
}

function KeyValues({ rows }) {
  return (
    <dl className="rp-kv">
      {rows.map(([label, value, masked]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className={masked ? 'rp-masked' : ''}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PhotoSlot({ slot }) {
  if (slot.state === 'photo') {
    return (
      <li className="rp-slot">
        <img
          src={PHOTO_URL(slot.file)}
          alt={`${VEHICLE.title} : ${slot.label}`}
          width="960"
          height="540"
          loading="lazy"
        />
        <p>{slot.label}</p>
      </li>
    );
  }
  return (
    <li className="rp-slot">
      {slot.state === 'missing' ? (
        <div className="rp-empty">Manquante</div>
      ) : (
        <div className="rp-empty rp-withheld">
          <Icon name="lock" />
          <span>Masqué dans l&apos;exemple</span>
        </div>
      )}
      <p>{slot.label}</p>
    </li>
  );
}

export default function SampleReport() {
  // Printing: only the report (the rules are scoped to this class), with every fold open.
  useEffect(() => {
    document.documentElement.classList.add('print-report');
    let reopened = [];
    const openFolds = () => {
      reopened = [...document.querySelectorAll('details.rp-fold:not([open])')];
      reopened.forEach((details) => details.setAttribute('open', ''));
    };
    const restoreFolds = () => reopened.forEach((details) => details.removeAttribute('open'));
    window.addEventListener('beforeprint', openFolds);
    window.addEventListener('afterprint', restoreFolds);
    return () => {
      document.documentElement.classList.remove('print-report');
      window.removeEventListener('beforeprint', openFolds);
      window.removeEventListener('afterprint', restoreFolds);
    };
  }, []);

  const context = [
    ...MASKED_CONTEXT.map((label) => [label, 'Masqué', true]),
    ...CONTEXT.map((row) => [row.label, row.value]),
  ];
  const traceability = [
    ...TRACEABILITY.map((row) => [row.label, row.value]),
    ['Matériel utilisé', EQUIPMENT_USED.join(', ')],
  ];

  return (
    <section className="bg-ground-2 border-b border-rule pb-14">
      <nav className="rp-index rp-noprint" aria-label="Sommaire du rapport">
        <div className="rp-index-in max-w-5xl mx-auto">
          {INDEX.map(([label, id]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
          <button type="button" className="rp-print" onClick={() => window.print()}>
            <Icon name="print" /> Imprimer / PDF
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 rp-stage">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink mt-8 mb-4">
          Exemple de rapport
        </p>

        <article className="rp-sheet" aria-label="Rapport de condition véhicule, exemple">
          <ReportHeader />

          <div className="rp-body">
            <section id="resume" className="rp-anchor">
              <VehicleIdentity />
              <FamiliesTop />
              <TotalBand />
              <ValuationPanel />
              <SynthesisBlock />
              <h3 className="rp-sec">
                <Icon name="clock" />
                Traçabilité
              </h3>
              <KeyValues rows={traceability} />
              <h3 className="rp-sec" style={{ marginTop: 28 }}>
                Contexte de l&apos;inspection
              </h3>
              <KeyValues rows={context} />
            </section>

            <section id="photos" className="rp-anchor">
              <h3 className="rp-sec rp-spaced">
                <Icon name="camera" />
                Photos d&apos;identification
                <span className="rp-count">
                  {PHOTOS_PROVIDED}/{PHOTO_SLOTS.length}
                </span>
              </h3>
              <ul className="rp-slots">
                {PHOTO_SLOTS.map((slot) => (
                  <PhotoSlot key={slot.label} slot={slot} />
                ))}
              </ul>
            </section>

            {FAMILY_SECTIONS.map((name) => (
              <FamilySection key={name} name={name} />
            ))}

            <section id="mesures" className="rp-anchor">
              {MEASURE_TABLES.map((table) => (
                <MeasureTable key={table.family} table={table} />
              ))}
            </section>

            <section>
              <CostTable />
            </section>
          </div>

          <footer className="rp-foot">
            <span>Powered by MALLOULIAUTO</span>
            <span>
              {REPORT_REF} · Certificat N° {CERTIFICATE} · {PAGES_COUNT} pages
            </span>
          </footer>
        </article>
      </div>
    </section>
  );
}
