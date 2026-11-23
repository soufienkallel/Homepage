import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/adminApi';

/**
 * Admin dashboard: is the site bringing requests, and through which channel?
 * Approved mockup: "Admin — Tableau de bord campagne" (26 Sept 2026);
 * spec: docs/specs/2026-09-admin-analytics.md. One call to GET /api/admin/analytics.
 */

const PERIODS = [
  { value: '7j', label: '7 jours' },
  { value: '30j', label: '30 jours' },
  { value: 'lancement', label: 'Depuis le lancement' },
];

const MEDIUM_LABELS = {
  direct: 'lien tapé, favori ou partagé',
  autres: 'sources moins fréquentes',
};

const number = new Intl.NumberFormat('fr-FR');
const fmt = (value) => number.format(value ?? 0);
const percent = (part, total) =>
  total > 0 ? `${(Math.round((part / total) * 1000) / 10).toLocaleString('fr-FR')} %` : '—';

const dateLabel = (iso, options) =>
  new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'Africa/Tunis', ...options });
const dayLabel = (date) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

// "D 20": the phone chart has no room for "dim. 20".
const shortDayLabel = (date) => {
  const d = new Date(`${date}T12:00:00Z`);
  const weekday = d.toLocaleDateString('fr-FR', { weekday: 'narrow', timeZone: 'UTC' });
  return `${weekday.toUpperCase()} ${d.getUTCDate()}`;
};

const eyebrow = 'font-mono text-[10.5px] font-medium tracking-[0.08em] uppercase text-ink-3';
const th = `${eyebrow} px-[18px] py-3 font-medium`;

// Borders between the four figures: a row of four from lg, two rows of two below.
const FIGURE_BORDERS = [
  '',
  'border-l border-rule',
  'border-t lg:border-t-0 lg:border-l border-rule',
  'border-t lg:border-t-0 border-l border-rule',
];

function Figure({ label, value, children, position }) {
  return (
    <div className={`px-[22px] py-[18px] flex flex-col gap-1.5 ${FIGURE_BORDERS[position]}`}>
      <div className={eyebrow}>{label}</div>
      <div className="font-mono text-[30px] font-semibold tabular-nums leading-tight">{value}</div>
      <div className="text-[12.5px] text-ink-2">{children}</div>
    </div>
  );
}

function Section({ title, aside, children }) {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Bar({ value, max, className = 'bg-blue', height = 'h-1.5' }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 0.6 : 0) : 0;
  return (
    <div className={`${height} bg-ground-3`}>
      <div className={`h-full ${className}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function SourcesTable({ rows, totals }) {
  const max = Math.max(...rows.map((r) => r.visits), 0);
  const done = rows.reduce((sum, r) => sum + r.done, 0);
  return (
    <>
      {/* Phones: one stacked row per source (approved mobile mockup). */}
      <ul className="sm:hidden bg-white border border-rule">
        {rows.map((row) => (
          <li
            key={`${row.source}|${row.medium ?? ''}`}
            className="px-3.5 py-3 border-b border-rule last:border-b-0 flex flex-col gap-2"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span>
                <span className="text-sm font-semibold">{row.source}</span>{' '}
                <span className="font-mono text-[11.5px] text-ink-3">
                  · {row.medium ?? MEDIUM_LABELS[row.source] ?? '—'}
                </span>
              </span>
              <span className="font-mono text-xs text-ink-2">
                {percent(row.requests, row.visits)}
              </span>
            </div>
            {max > 0 && <Bar value={row.visits} max={max} />}
            <span className="font-mono text-xs text-ink-2">
              {fmt(row.visits)} visites · {fmt(row.requests)} demandes · {fmt(row.done)} réalisées
            </span>
          </li>
        ))}
        <li className="px-3.5 py-3 bg-ground-2 font-mono text-xs font-bold">
          Total · {fmt(totals.visits)} visites · {fmt(totals.requests)} demandes ·{' '}
          {percent(totals.requests, totals.visits)}
        </li>
      </ul>
      <div className="hidden sm:block overflow-x-auto bg-white border border-rule">
        <table className="w-full border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className={`${th} text-left`}>
                Source
              </th>
              <th scope="col" className={`${th} text-left w-[330px]`}>
                Visites
              </th>
              <th scope="col" className={`${th} text-right`}>
                Demandes
              </th>
              <th scope="col" className={`${th} text-right`}>
                Conversion
              </th>
              <th scope="col" className={`${th} text-right`}>
                Inspections réalisées
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.source}|${row.medium ?? ''}`} className="border-b border-rule">
                <td className="px-[18px] py-3.5 whitespace-nowrap">
                  <span className="text-sm font-semibold">{row.source}</span>{' '}
                  <span className="font-mono text-xs text-ink-3">
                    · {row.medium ?? MEDIUM_LABELS[row.source] ?? '—'}
                  </span>
                </td>
                <td className="px-[18px] py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[13px] font-semibold tabular-nums w-11 text-right">
                      {fmt(row.visits)}
                    </span>
                    {max > 0 && (
                      <div className="flex-1">
                        <Bar value={row.visits} max={max} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-[18px] py-3.5 text-right font-mono text-[13px] font-semibold tabular-nums">
                  {fmt(row.requests)}
                </td>
                <td className="px-[18px] py-3.5 text-right font-mono text-[13px] tabular-nums text-ink-2">
                  {percent(row.requests, row.visits)}
                </td>
                <td className="px-[18px] py-3.5 text-right font-mono text-[13px] tabular-nums text-ink-2">
                  {fmt(row.done)}
                </td>
              </tr>
            ))}
            <tr className="bg-ground-2">
              <td className="px-[18px] py-3.5 text-sm font-bold">Total</td>
              <td className="px-[18px] py-3.5">
                <span className="inline-block font-mono text-[13px] font-bold tabular-nums w-11 text-right">
                  {fmt(totals.visits)}
                </span>
              </td>
              <td className="px-[18px] py-3.5 text-right font-mono text-[13px] font-bold">
                {fmt(totals.requests)}
              </td>
              <td className="px-[18px] py-3.5 text-right font-mono text-[13px] font-bold">
                {percent(totals.requests, totals.visits)}
              </td>
              <td className="px-[18px] py-3.5 text-right font-mono text-[13px] font-bold">
                {fmt(done)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function DayChart({ days }) {
  const max = Math.max(...days.map((d) => d.visits), 0);
  const compact = days.length > 14;
  return (
    <div className="bg-white border border-rule px-4 sm:px-7 pt-6 pb-4 flex flex-col gap-2.5 overflow-x-auto">
      <div
        className={`relative h-[196px] flex items-end border-b border-rule-2 ${compact ? 'gap-1' : 'gap-2 sm:gap-4'}`}
      >
        {max === 0 && (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-[13px] text-ink-3">
            Aucune visite mesurée sur la période
          </p>
        )}
        {days.map((d) => (
          <div
            key={d.date}
            className="flex-1 min-w-[10px] flex flex-col items-center justify-end gap-1.5 h-full"
            title={`${dayLabel(d.date)} : ${fmt(d.visits)} visites, ${fmt(d.requests)} demandes`}
          >
            {!compact && (
              <span className="font-mono text-xs text-ink-2 tabular-nums">{fmt(d.visits)}</span>
            )}
            <div
              className="w-full max-w-14 bg-blue"
              style={{ height: max > 0 ? `${Math.round((d.visits / max) * 160)}px` : 0 }}
            />
          </div>
        ))}
      </div>
      <div className={`flex ${compact ? 'gap-1' : 'gap-2 sm:gap-4'}`}>
        {days.map((d, i) => (
          <div key={d.date} className="flex-1 min-w-[10px] flex flex-col items-center gap-1">
            <span className="font-mono text-[11px] text-ink-3 whitespace-nowrap">
              {!compact || i % 5 === 0 ? (
                <>
                  <span className="sm:hidden">{shortDayLabel(d.date)}</span>
                  <span className="hidden sm:inline">{dayLabel(d.date)}</span>
                </>
              ) : (
                ' '
              )}
            </span>
            <span className="font-mono text-sm font-semibold text-accent-ink tabular-nums">
              {d.requests > 0 || !compact ? fmt(d.requests) : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Funnel({ funnel }) {
  // Each bar against the largest step, not visits alone: requests can outnumber measured
  // visits (visitors who refuse measurement, requests from before it started).
  const max = Math.max(
    funnel.visits,
    funnel.pricingViewed,
    funnel.formOpened,
    funnel.inspectionRequests,
    funnel.inspectionsDone
  );
  const steps = [
    { label: 'Visites', value: funnel.visits, note: 'Toutes sources' },
    {
      // Not a required step: a visitor can open the form without seeing /tarifs.
      label: 'Page Tarifs consultée',
      value: funnel.pricingViewed,
      note: `${percent(funnel.pricingViewed, funnel.visits)} des visites · ${fmt(
        funnel.pricingThenForm
      )} ont ensuite ouvert le formulaire`,
    },
    {
      label: "Formulaire d'inspection ouvert",
      value: funnel.formOpened,
      note: `${percent(funnel.formOpened, funnel.visits)} des visites`,
    },
    {
      label: "Demandes d'inspection envoyées",
      value: funnel.inspectionRequests,
      // Visitors who refuse measurement (or block scripts) still send requests.
      note:
        funnel.inspectionRequests > funnel.formOpened
          ? 'plus que de formulaires mesurés : certaines viennent de visites non mesurées'
          : `${percent(funnel.inspectionRequests, funnel.formOpened)} des formulaires ouverts`,
    },
    {
      label: 'Inspections réalisées',
      value: funnel.inspectionsDone,
      note: `${fmt(funnel.inspectionsDone)} sur ${fmt(funnel.inspectionRequests)} demandes`,
    },
  ];
  return (
    <div className="bg-white border border-rule px-[22px] py-5 flex flex-col gap-[18px]">
      {steps.map((step) => (
        <div key={step.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13.5px] font-medium">{step.label}</span>
            <span className="font-mono text-sm font-semibold tabular-nums">{fmt(step.value)}</span>
          </div>
          <Bar value={step.value} max={max} className="bg-navy" height="h-2" />
          <span className="text-xs text-ink-3">{step.note}</span>
        </div>
      ))}
    </div>
  );
}

function AdsTable({ ads }) {
  if (!ads.length) {
    return (
      <p className="bg-white border border-rule px-5 py-6 text-sm text-ink-2">
        Aucune visite venue d&apos;un lien de campagne sur la période.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto bg-white border border-rule">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-rule">
            <th scope="col" className={`${th} text-left`}>
              Annonce
            </th>
            <th scope="col" className={`${th} text-right`}>
              Visites
            </th>
            <th scope="col" className={`${th} text-right`}>
              Demandes
            </th>
            <th scope="col" className={`${th} text-right`}>
              Conv.
            </th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={`${ad.campaign}|${ad.content ?? ''}`} className="border-b border-rule">
              <td className="px-4 py-3">
                <div className="font-mono text-[13px] font-semibold">
                  {ad.content ?? 'sans nom d’annonce'}
                </div>
                <div className="text-xs text-ink-3 mt-0.5">
                  {ad.campaign} · {ad.sources.join(' · ')}
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono text-[13px] font-semibold tabular-nums">
                {fmt(ad.visits)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[13px] font-semibold tabular-nums">
                {fmt(ad.requests)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[13px] text-ink-2 tabular-nums">
                {percent(ad.requests, ad.visits)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const num = 'px-4 py-3 text-right font-mono text-[13px] tabular-nums';

function PagesTable({ pages }) {
  if (!pages.length) {
    return (
      <p className="bg-white border border-rule px-5 py-6 text-sm text-ink-2">Aucune visite.</p>
    );
  }
  return (
    <div className="overflow-x-auto bg-white border border-rule">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-rule">
            <th scope="col" className={`${th} text-left`}>
              Page
            </th>
            <th scope="col" className={`${th} text-right`}>
              Vues
            </th>
            <th scope="col" className={`${th} text-right`}>
              Visites
            </th>
            <th scope="col" className={`${th} text-right`}>
              dont arrivées
            </th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.path} className="border-b border-rule last:border-b-0">
              <td className="px-4 py-3 font-mono text-[13px] break-all">{page.path}</td>
              <td className={`${num} text-ink-2`}>{fmt(page.views)}</td>
              <td className={`${num} font-semibold`}>{fmt(page.visits)}</td>
              <td className={`${num} text-ink-2`}>{fmt(page.entries)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransitionsTable({ transitions }) {
  if (!transitions.length) {
    return (
      <p className="bg-white border border-rule px-5 py-6 text-sm text-ink-2">
        Aucune visite n&apos;a ouvert plus d&apos;une page sur la période.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto bg-white border border-rule">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-rule">
            <th scope="col" className={`${th} text-left`}>
              De → vers
            </th>
            <th scope="col" className={`${th} text-right`}>
              Visites
            </th>
          </tr>
        </thead>
        <tbody>
          {transitions.map((move) => (
            <tr key={`${move.from}|${move.to}`} className="border-b border-rule last:border-b-0">
              <td className="px-4 py-3 font-mono text-[13px] break-all">
                {move.from} <span className="text-ink-3">→</span> {move.to}
              </td>
              <td className={`${num} font-semibold`}>{fmt(move.visits)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Devices({ devices }) {
  const total = devices.mobile + devices.desktop + devices.tablet;
  const rows = [
    { key: 'mobile', label: 'Mobile', value: devices.mobile, color: 'bg-navy' },
    { key: 'desktop', label: 'Ordinateur', value: devices.desktop, color: 'bg-blue' },
    { key: 'tablet', label: 'Tablette', value: devices.tablet, color: 'bg-rule-2' },
  ];
  return (
    <div className="bg-white border border-rule px-[22px] py-5 flex flex-col gap-4">
      <div className="flex h-2.5 bg-ground-3">
        {total > 0 &&
          rows.map((row) => (
            <div
              key={row.key}
              className={row.color}
              style={{ width: `${(row.value / total) * 100}%` }}
            />
          ))}
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.key} className="flex justify-between text-[13.5px]">
            <span className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 ${row.color}`} aria-hidden="true" />
              {row.label}
            </span>
            <span className="font-mono font-semibold tabular-nums">
              {fmt(row.value)} · {percent(row.value, total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsQueue({ agents }) {
  if (!agents) return null;
  const rows = [
    {
      label: 'Brouillons marketing en attente',
      value: agents.marketingDrafts,
      to: '/admin/marketing-drafts',
    },
    { label: 'Séquences sales en attente', value: agents.salesDrafts, to: '/admin/sales-drafts' },
    { label: 'Tâches en file', value: agents.jobsQueued, to: null },
  ];
  return (
    <Section title="À relire · agents IA">
      <div className="bg-white border border-rule">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 px-[18px] py-3 border-b border-rule last:border-b-0"
          >
            <span className={`text-sm ${row.to ? '' : 'text-ink-2'}`}>{row.label}</span>
            <span className="flex items-center gap-[18px]">
              <span className="font-mono text-[13px] font-semibold tabular-nums">
                {fmt(row.value)}
              </span>
              {row.to ? (
                <Link to={row.to} className="text-[13px] font-semibold min-w-[44px] text-right">
                  <span className="text-accent-ink">Relire</span>
                </Link>
              ) : (
                <span className="min-w-[44px]" aria-hidden="true" />
              )}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function HomepageAdminDashboard() {
  const [period, setPeriod] = useState('7j');
  const [campaign, setCampaign] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Only the latest request may update the page: a slower, older one must not win.
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ period });
      if (campaign) params.set('campaign', campaign);
      const result = await adminApi(`/api/admin/analytics?${params}`);
      if (requestId === latestRequest.current) setData(result);
    } catch {
      if (requestId === latestRequest.current) {
        setError('Les chiffres n’ont pas pu être chargés. Réessayez dans un instant.');
      }
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [period, campaign]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = data?.totals;
  const empty = data && totals.visits === 0 && totals.requests === 0;
  const campaigns = data?.campaigns ?? [];

  return (
    <div className="flex flex-col gap-9 text-ink">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-semibold tracking-[-0.015em]">Tableau de bord</h1>
          <p className="text-[14.5px] text-ink-2">
            Visites du site et demandes reçues
            {data &&
              ` · du ${dateLabel(data.period.from, { day: 'numeric', month: 'short' })} au ${dateLabel(
                data.period.to,
                { day: 'numeric', month: 'short', year: 'numeric' }
              )}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div role="group" aria-label="Période" className="flex">
            {PERIODS.map((p, i) => (
              <button
                key={p.value}
                type="button"
                aria-pressed={period === p.value}
                onClick={() => setPeriod(p.value)}
                className={`min-h-10 px-4 text-[13px] border ${i > 0 ? 'border-l-0' : ''} ${
                  period === p.value
                    ? 'bg-ink border-ink text-white font-semibold'
                    : 'bg-white border-rule-2 text-ink font-medium hover:bg-ground-2'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[13px] font-semibold">
            Campagne
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="min-h-10 px-3 border border-rule-2 bg-white text-[13px] font-normal"
            >
              <option value="">Toutes</option>
              {campaigns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              {campaign && campaign !== '_none' && !campaigns.includes(campaign) && (
                <option value={campaign}>{campaign}</option>
              )}
              <option value="_none">Sans campagne</option>
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="border border-rule-2 bg-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={load}
            className="min-h-10 px-4 border border-rule-2 text-[13px] font-semibold hover:bg-ground-2"
          >
            Réessayer
          </button>
        </div>
      )}

      {!data && loading && <p className="text-sm text-ink-2">Chargement des chiffres…</p>}

      {data && (
        <div className={`flex flex-col gap-9 ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
          <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-rule-2">
            <Figure label="Visites" value={fmt(totals.visits)} position={0}>
              {totals.visits > 0
                ? `dont ${percent(totals.campaignVisits, totals.visits)} venues d'une campagne`
                : 'aucune visite sur la période'}
            </Figure>
            <Figure label="Demandes" value={fmt(totals.requests)} position={1}>
              {fmt(totals.inspections)} inspections · {fmt(totals.contacts)} contacts
            </Figure>
            <Figure label="Conversion" value={percent(totals.requests, totals.visits)} position={2}>
              demandes pour 100 visites
            </Figure>
            <Figure label="À traiter" value={fmt(data.toHandle)} position={3}>
              {data.late > 0 ? `dont ${fmt(data.late)} depuis plus de 24 h · ` : ''}
              <Link to="/admin/demandes" className="font-semibold">
                <span className="text-accent-ink">Ouvrir</span>
              </Link>
            </Figure>
          </div>

          {empty ? (
            <div className="bg-white border border-rule px-6 sm:px-11 py-10 flex flex-col gap-3 max-w-[720px]">
              <h2 className="text-lg font-semibold">Aucune visite enregistrée sur la période</h2>
              <p className="text-[14.5px] leading-relaxed text-ink-2">
                Les sources, le parcours et les pages d&apos;arrivée s&apos;afficheront dès la
                première visite. Les demandes restent consultables dans Demandes, avec leur origine.
              </p>
            </div>
          ) : (
            <>
              <Section
                title="Sources"
                aside={
                  <span className="text-[12.5px] text-ink-3">
                    Triées par visites · source · canal du lien d&apos;arrivée
                  </span>
                }
              >
                <SourcesTable rows={data.sources} totals={totals} />
              </Section>

              <Section
                title="Par jour"
                aside={
                  <div className="flex gap-[18px] text-[12.5px] text-ink-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue" aria-hidden="true" />
                      Visites
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-accent-ink">12</span>
                      Demandes
                    </span>
                  </div>
                }
              >
                <DayChart days={data.days} />
              </Section>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title="Parcours vers l'inspection">
                  <Funnel funnel={data.funnel} />
                </Section>
                <Section title="Annonces">
                  <AdsTable ads={data.ads} />
                </Section>
              </div>

              <Section
                title="Pages visitées"
                aside={
                  <span className="text-[12.5px] text-ink-3">
                    Vues · visites qui ont ouvert la page · visites arrivées par elle
                  </span>
                }
              >
                <PagesTable pages={data.pages} />
              </Section>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section
                  title="Navigation entre pages"
                  aside={
                    <span className="text-[12.5px] text-ink-3">
                      Page suivante dans la même visite
                    </span>
                  }
                >
                  <TransitionsTable transitions={data.transitions} />
                </Section>
                <Section title="Appareils">
                  <Devices devices={data.devices} />
                </Section>
              </div>
            </>
          )}

          <AgentsQueue agents={data.agents} />

          <p className="text-[12.5px] leading-relaxed text-ink-3 max-w-[92ch]">
            Une visite = un chargement du site dans un onglet. Mesure sans cookie ni identifiant,
            adresse IP non conservée : un visiteur qui revient un autre jour compte une nouvelle
            visite. Une demande est attribuée à la source de la page par laquelle le visiteur est
            arrivé.
          </p>
        </div>
      )}
    </div>
  );
}
