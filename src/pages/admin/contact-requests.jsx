import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../lib/adminApi';
import { LOCATION_TYPES, STATUSES } from '../../lib/contactRequestPolicy';
import { HOURS, RESPONSE_PROMISE } from '../../data/contactChannels';
import { classifySource } from '../../lib/trafficSource';

/**
 * /admin/demandes — inspection and contact requests (docs/specs/2026-09-cta-demande-inspection.md §3.8).
 * Open requests are listed oldest first, so the one closest to breaking the
 * 24 h promise is on top.
 */

const FILTERS = [
  { id: 'a_traiter', label: 'À traiter' },
  { id: 'planifiees', label: 'Planifiées' },
  { id: 'realisees', label: 'Réalisées' },
  { id: 'closes', label: 'Sans suite / annulées' },
  { id: 'toutes', label: 'Toutes' },
];

const KIND_LABELS = {
  inspection: 'Inspection',
  professionnel: 'Professionnel',
  partenaire: 'Partenaire',
  autre: 'Autre',
};

const DAY_MS = 24 * 60 * 60 * 1000;
const locationLabel = (value) => LOCATION_TYPES.find((l) => l.value === value)?.label ?? value;

function formatWhen(iso) {
  const date = new Date(iso);
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return "il y a moins d'1 h";
  if (hours < 48) return `il y a ${hours} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/** Digits for wa.me; a bare 8-digit number is taken as Tunisian (+216). */
function whatsappDigits(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 8) return `216${digits}`;
  return digits.replace(/^00/, '');
}

function RequestRow({ request, onChange }) {
  const [note, setNote] = useState(request.internal_note ?? '');
  const [saving, setSaving] = useState(false);
  const late = request.status === 'nouvelle' && Date.now() - new Date(request.created_at) > DAY_MS;

  const save = async (patch) => {
    setSaving(true);
    try {
      await onChange(request.id, patch);
    } finally {
      setSaving(false);
    }
  };

  const vehicle = [request.vehicle_make, request.vehicle_model, request.vehicle_year]
    .filter((v) => v && v !== 'Je ne sais pas')
    .join(' · ');
  const context =
    request.kind === 'inspection'
      ? [
          request.purpose,
          locationLabel(request.location_type),
          request.city,
          request.preferred_date,
        ]
          .filter(Boolean)
          .join(' · ')
      : request.message;
  // Source · medium · campaign · ad, as captured from the landing link (src/lib/campaign.js).
  // Same rules as the dashboard (src/lib/trafficSource.js): utm_* first, else the
  // referring site, else "direct".
  const source = classifySource({ utm: request.utm, referrer: request.referrer });
  const origin = [source.source, source.medium, source.campaign, source.content]
    .filter(Boolean)
    .join(' · ');

  return (
    <tr className="border-b border-rule align-top">
      <td className="py-3.5 px-3 whitespace-nowrap">
        <div className="flex flex-col gap-1.5">
          <span>{formatWhen(request.created_at)}</span>
          {late && (
            <span className="self-start font-mono text-[10px] font-semibold tracking-wider text-accent-ink border border-accent-ink px-1.5 py-0.5">
              &gt; 24 H
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-3 font-mono text-[13px] font-semibold whitespace-nowrap">
        {request.reference}
      </td>
      <td className="py-3.5 px-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">{request.full_name}</span>
          <span className="font-mono text-[12.5px] text-ink-2">{request.phone}</span>
          {request.email && <span className="text-[12.5px] text-ink-2">{request.email}</span>}
          <span className="text-[12.5px] text-ink-2">
            {KIND_LABELS[request.kind]}
            {request.company ? ` · ${request.company}` : ''}
          </span>
        </div>
      </td>
      <td className="py-3.5 px-3">
        <div className="flex flex-col gap-0.5">
          <span>{vehicle || '—'}</span>
          {request.listing_url && (
            <a
              href={request.listing_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-[12.5px] text-accent-ink underline"
            >
              Voir l&apos;annonce ↗
            </a>
          )}
        </div>
      </td>
      <td className="py-3.5 px-3 max-w-[320px]">
        <p className="whitespace-pre-line break-words">{context || '—'}</p>
        {request.kind === 'inspection' && request.message && (
          <p className="mt-1 text-[12.5px] text-ink-2 whitespace-pre-line break-words">
            « {request.message} »
          </p>
        )}
        {origin && <p className="mt-1 font-mono text-[11px] text-ink-2">origine : {origin}</p>}
      </td>
      <td className="py-3.5 px-3 whitespace-nowrap">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12.5px] text-ink-2">
            Préfère : {request.preferred_channel === 'whatsapp' ? 'WhatsApp' : 'Appel'}
          </span>
          <div className="flex gap-1.5">
            <a
              href={`tel:${request.phone.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center min-h-8 px-2.5 border border-rule-2 text-[12.5px] font-semibold text-ink"
            >
              Appeler
            </a>
            <a
              href={`https://wa.me/${whatsappDigits(request.phone)}?text=${encodeURIComponent(
                `Bonjour, MALLOULIAUTO au sujet de votre demande ${request.reference}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-8 px-2.5 border border-rule-2 text-[12.5px] font-semibold text-ink"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </td>
      <td className="py-3.5 pl-3">
        <div className="flex flex-col gap-1.5 w-[150px]">
          <label className="sr-only" htmlFor={`status-${request.id}`}>
            Statut de {request.reference}
          </label>
          <select
            id={`status-${request.id}`}
            value={request.status}
            disabled={saving}
            onChange={(e) => save({ status: e.target.value })}
            className="min-h-[34px] border border-rule-2 px-2 text-[13px] bg-white"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`note-${request.id}`}>
            Note interne sur {request.reference}
          </label>
          <input
            id={`note-${request.id}`}
            type="text"
            value={note}
            placeholder="Note interne"
            maxLength={2000}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== (request.internal_note ?? '') && save({ internalNote: note })}
            className="min-h-8 border border-rule px-2 text-[12.5px]"
          />
        </div>
      </td>
    </tr>
  );
}

export default function HomepageAdminContactRequests() {
  const [filter, setFilter] = useState('a_traiter');
  const [kind, setKind] = useState('');
  const [data, setData] = useState({ requests: [], counts: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ filter });
      if (kind) params.set('kind', kind);
      setData(await adminApi(`/api/admin/contact-requests?${params}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, kind]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRequest = async (id, patch) => {
    try {
      await adminApi('/api/admin/contact-requests', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...patch }),
      });
      await load();
    } catch (err) {
      window.alert(`Mise à jour impossible : ${err.message}`);
    }
  };

  const counts = data.counts;

  return (
    <section className="space-y-5 text-ink">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Demandes</h1>
          <p className="text-sm text-ink-2 mt-1">
            Engagement affiché : {RESPONSE_PROMISE.toLowerCase()}, {HOURS}.
          </p>
        </div>
        {counts && (
          <dl className="flex border border-rule-2 bg-white">
            {[
              ['À traiter', counts.toHandle, false],
              ['Plus de 24 h', counts.late, counts.late > 0],
              ['Cette semaine', counts.thisWeek, false],
            ].map(([label, value, alert]) => (
              <div key={label} className="px-4 py-2.5 border-r last:border-r-0 border-rule-2">
                <dt
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    alert ? 'text-accent-ink' : 'text-ink-2'
                  }`}
                >
                  {label}
                </dt>
                <dd className={`font-mono text-xl font-semibold ${alert ? 'text-accent-ink' : ''}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold mr-1">Statut</span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-9 px-3 border text-[13px] ${
              filter === f.id
                ? 'border-ink bg-ink text-white font-semibold'
                : 'border-rule-2 bg-white text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="flex-grow" />
        <label className="flex items-center gap-2 text-[13px] font-semibold">
          Type
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="min-h-9 border border-rule-2 px-2 font-normal bg-white"
          >
            <option value="">Tous</option>
            {Object.entries(KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="border border-accent-ink bg-white p-3 text-sm text-accent-ink">
          {error}
        </p>
      )}

      <div className="overflow-x-auto bg-white border border-rule">
        <table className="w-full text-[13.5px] border-collapse">
          <thead>
            <tr className="border-b border-rule-2 text-left">
              {[
                'Reçue',
                'Réf.',
                'Contact',
                'Véhicule',
                'Objet · lieu · ville',
                'Recontacter',
                'Statut',
              ].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="py-2.5 px-3 first:pl-3 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-2"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.requests.map((request) => (
              <RequestRow
                key={`${request.id}-${request.status}`}
                request={request}
                onChange={updateRequest}
              />
            ))}
          </tbody>
        </table>
        {!loading && !error && data.requests.length === 0 && (
          <p className="p-6 text-sm text-ink-2">Aucune demande pour ce filtre.</p>
        )}
        {loading && <p className="p-6 text-sm text-ink-2">Chargement…</p>}
      </div>
    </section>
  );
}
