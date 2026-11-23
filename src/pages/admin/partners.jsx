import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { adminFetch } from '../../lib/adminApi';
import PartnerCard from '../../components/PartnerCard';
import {
  LOGO_MAX_BYTES,
  PARTNER_TYPES,
  PHONE_PATTERN,
  PROFILE_STATUSES,
  SLUG_PATTERN,
  WEBSITE_PATTERN,
  countryName,
  createPartner,
  listAllPartners,
  partnerClickCounts,
  savePartnerOrder,
  updatePartner,
  uploadPartnerLogo,
} from '../../lib/partnerService';

/**
 * /admin/partenaires — the partners of the site (docs/specs/2026-10-refonte-accueil.md §9):
 * the homepage logo strip and the /partenaires cards. Two switches per partner: « Logo sur
 * l'accueil » and the card's status. Publishing a card needs the partner's own texts and
 * both consent dates; the database refuses it otherwise (migration 20261016100000).
 * A partner who leaves is archived, never deleted.
 */

const COUNTRIES = ['TN', 'DE', 'FR', 'DZ', 'LY', 'MA'];
const DESCRIPTION_MAX = 160;
const SERVICE_MAX = 60;

const EMPTY_FORM = {
  name: '',
  slug: '',
  type: 'centre',
  country: 'TN',
  city: '',
  booking_phone: '',
  website_url: '',
  logo_url: '',
  logo_tile: 'light',
  description: '',
  services: ['', '', ''],
  show_logo_on_home: false,
  profile_status: 'draft',
  logo_consent_at: '',
  partner_approved_at: '',
};

/** « Myrage Automotive Service » → « myrage-automotive-service ». */
function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function toForm(partner) {
  const services = [...(partner.services || []), '', '', ''].slice(0, 3);
  return {
    ...EMPTY_FORM,
    ...Object.fromEntries(Object.entries(partner).map(([key, value]) => [key, value ?? ''])),
    services,
  };
}

/** Form → row: trimmed text, empty fields as null, only the columns the editor owns. */
function toRow(form) {
  const text = (value) => (String(value || '').trim() ? String(value).trim() : null);
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    type: form.type,
    country: form.country || null,
    city: text(form.city),
    booking_phone: text(form.booking_phone)?.replace(/[\s.-]/g, '') ?? null,
    website_url: text(form.website_url),
    logo_url: text(form.logo_url),
    logo_tile: form.logo_tile,
    description: text(form.description),
    services: form.services.map((s) => s.trim()).filter(Boolean),
    show_logo_on_home: form.show_logo_on_home,
    profile_status: form.profile_status,
    logo_consent_at: form.logo_consent_at || null,
    partner_approved_at: form.partner_approved_at || null,
  };
}

/** The same rules as the table's checks, in words. Empty list = the row can be saved. */
function validate(row) {
  const errors = [];
  if (!row.name) errors.push('Indiquez le nom.');
  if (!SLUG_PATTERN.test(row.slug) || row.slug.length > 60) {
    errors.push("L'identifiant : lettres minuscules, chiffres et tirets.");
  }
  if (row.booking_phone && !PHONE_PATTERN.test(row.booking_phone)) {
    errors.push('Le téléphone : format international, par exemple +21671000000.');
  }
  if (row.website_url && !WEBSITE_PATTERN.test(row.website_url)) {
    errors.push('Le site web doit commencer par https://.');
  }
  if (row.description && row.description.length > DESCRIPTION_MAX) {
    errors.push(`La présentation : ${DESCRIPTION_MAX} caractères au plus.`);
  }
  if (row.services.some((service) => service.length > SERVICE_MAX)) {
    errors.push(`Chaque service : ${SERVICE_MAX} caractères au plus.`);
  }
  if (row.show_logo_on_home && !row.logo_url) errors.push("Le logo sur l'accueil demande un logo.");
  if (row.profile_status === 'archived' && row.show_logo_on_home) {
    errors.push("Un partenaire archivé ne peut pas garder son logo sur l'accueil.");
  }
  if (row.profile_status === 'published') {
    const missing = [];
    if (!row.logo_url) missing.push('le logo');
    if (!row.description) missing.push('la présentation');
    if (row.type !== 'technologie' && row.services.length === 0)
      missing.push('au moins un service');
    if (row.type !== 'technologie' && !row.booking_phone && !row.website_url) {
      missing.push('un téléphone de réservation ou un site');
    }
    if (!row.logo_consent_at) missing.push("la date d'accord pour le logo");
    if (!row.partner_approved_at)
      missing.push('la date de validation de la fiche par le partenaire');
    if (missing.length) errors.push(`Pour publier la fiche, il manque : ${missing.join(', ')}.`);
  }
  return errors;
}

/** Database refusals the editor did not catch, in words. */
function saveErrorMessage(error) {
  const text = `${error?.message || ''} ${error?.details || ''}`;
  if (/duplicate key|partners_slug_key/.test(text)) return 'Cet identifiant est déjà utilisé.';
  if (/partners_published_complete/.test(text)) {
    return 'La fiche ne peut pas être publiée : il manque un élément obligatoire.';
  }
  if (/row-level security|permission denied/i.test(text)) {
    return 'Accès refusé : un compte administrateur est requis.';
  }
  return `Enregistrement impossible : ${error?.message || 'erreur inconnue'}.`;
}

/** Visible on the public site: only a published card (and its logo, if switched on). */
const isPublic = (row) => row?.profile_status === 'published';

/** Is the logo on the homepage, waiting for the card to be published, or off? */
const homeLogoState = (row) => {
  if (!row.show_logo_on_home) return '—';
  return row.profile_status === 'published' ? 'Oui' : 'Dès la publication';
};

const inputClass = 'w-full min-h-10 border border-rule-2 px-2.5 text-sm bg-white';
const labelClass = 'flex flex-col gap-1 text-[13px] font-semibold text-ink';
const hintClass = 'text-[11.5px] font-normal text-ink-3';

function Editor({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(() => toForm(initial || EMPTY_FORM));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setName = (name) =>
    setForm((current) => ({ ...current, name, slug: slugTouched ? current.slug : slugify(name) }));
  const setService = (index, value) =>
    setForm((current) => {
      const services = current.services.slice();
      services[index] = value;
      return { ...current, services };
    });
  const setStatus = (status) => {
    if (status === 'archived' && form.profile_status !== 'archived') {
      if (!window.confirm('Archiver ce partenaire ? Il disparaît du site dès l’enregistrement.')) {
        return;
      }
      setForm((current) => ({ ...current, profile_status: status, show_logo_on_home: false }));
      return;
    }
    set('profile_status', status);
  };

  const onLogo = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      set('logo_url', await uploadPartnerLogo(supabase, file));
      setErrors([]);
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const row = toRow(form);
    const problems = validate(row);
    setErrors(problems);
    if (problems.length) return;
    setSaving(true);
    try {
      const saved = initial
        ? await updatePartner(supabase, initial.id, row)
        : await createPartner(supabase, row);
      onSaved(saved, isPublic(initial) || isPublic(saved));
    } catch (error) {
      setErrors([saveErrorMessage(error)]);
    } finally {
      setSaving(false);
    }
  };

  const previewRow = { ...toRow(form), has_profile: true };

  return (
    <form onSubmit={submit} className="border border-rule-2 bg-white p-5 space-y-5">
      <h2 className="text-lg font-semibold">
        {initial ? `Modifier ${initial.name}` : 'Ajouter un partenaire'}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <label className={labelClass}>
          Nom
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label className={labelClass}>
          <span>
            Identifiant <span className={hintClass}>— l&apos;ancre /partenaires#…</span>
          </span>
          <input
            className={`${inputClass} font-mono`}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set('slug', e.target.value);
            }}
            maxLength={60}
            required
          />
        </label>
        <label className={labelClass}>
          Type
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => set('type', e.target.value)}
          >
            {PARTNER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Pays
            <select
              className={inputClass}
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
            >
              <option value="">—</option>
              {COUNTRIES.map((code) => (
                <option key={code} value={code}>
                  {countryName(code)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Ville
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              maxLength={80}
            />
          </label>
        </div>
        <label className={labelClass}>
          <span>
            Téléphone de réservation <span className={hintClass}>— +216…</span>
          </span>
          <input
            className={`${inputClass} font-mono`}
            value={form.booking_phone}
            onChange={(e) => set('booking_phone', e.target.value)}
            inputMode="tel"
          />
        </label>
        <label className={labelClass}>
          <span>
            Site ou page de réservation <span className={hintClass}>— https:// uniquement</span>
          </span>
          <input
            className={inputClass}
            value={form.website_url}
            onChange={(e) => set('website_url', e.target.value)}
            maxLength={300}
            inputMode="url"
          />
        </label>
        <div className={labelClass}>
          <span>
            Logo{' '}
            <span className={hintClass}>
              — PNG, WebP ou JPEG, {LOGO_MAX_BYTES / 1024 / 1024} Mo au plus
            </span>
          </span>
          <div className="flex items-center gap-3">
            <span
              className={`w-24 h-14 border border-rule flex items-center justify-center p-1 ${
                form.logo_tile === 'dark' ? 'bg-black' : 'bg-white'
              }`}
            >
              {form.logo_url && (
                <img src={form.logo_url} alt="" className="max-h-full max-w-full object-contain" />
              )}
            </span>
            <input
              type="file"
              accept="image/png,image/webp,image/jpeg"
              onChange={onLogo}
              disabled={uploading}
              className="text-[12.5px] font-normal"
            />
          </div>
        </div>
        <label className={labelClass}>
          Fond du logo
          <select
            className={inputClass}
            value={form.logo_tile}
            onChange={(e) => set('logo_tile', e.target.value)}
          >
            <option value="light">Clair</option>
            <option value="dark">Sombre (logo clair)</option>
          </select>
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          <span>
            Présentation, fournie par le partenaire{' '}
            <span className={hintClass}>
              — {form.description.length} / {DESCRIPTION_MAX}
            </span>
          </span>
          <textarea
            className={`${inputClass} py-2 min-h-[70px]`}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            maxLength={DESCRIPTION_MAX}
          />
        </label>
        <fieldset className="md:col-span-2 flex flex-col gap-2">
          <legend className="text-[13px] font-semibold mb-1">
            Services, fournis par le partenaire{' '}
            <span className={hintClass}>— 3 au plus, {SERVICE_MAX} caractères chacun</span>
          </legend>
          {form.services.map((service, index) => (
            <input
              key={index}
              aria-label={`Service ${index + 1}`}
              className={inputClass}
              value={service}
              onChange={(e) => setService(index, e.target.value)}
              maxLength={SERVICE_MAX}
            />
          ))}
        </fieldset>
        <label className={labelClass}>
          Logo autorisé par le partenaire le
          <input
            type="date"
            className={inputClass}
            value={form.logo_consent_at}
            onChange={(e) => set('logo_consent_at', e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Fiche validée par le partenaire le
          <input
            type="date"
            className={inputClass}
            value={form.partner_approved_at}
            onChange={(e) => set('partner_approved_at', e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-[13px] font-semibold">
          <input
            type="checkbox"
            checked={form.show_logo_on_home}
            onChange={(e) => set('show_logo_on_home', e.target.checked)}
            disabled={form.profile_status === 'archived'}
            className="w-4 h-4 accent-[#b5451b]"
          />
          <span>
            Logo sur l&apos;accueil{' '}
            <span className={hintClass}>— affiché une fois la fiche publiée</span>
          </span>
        </label>
        <label className={labelClass}>
          Fiche sur /partenaires
          <select
            className={inputClass}
            value={form.profile_status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {PROFILE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3 mb-2">
          Aperçu de la fiche
        </p>
        <ul className="max-w-md">
          <PartnerCard partner={previewRow} preview />
        </ul>
      </div>

      {errors.length > 0 && (
        <ul
          className="border border-accent-ink px-4 py-3 text-sm text-accent-ink space-y-1"
          role="alert"
        >
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-5 min-h-10 bg-ink text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 min-h-10 border border-rule-2 text-sm font-semibold"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function HomepageAdminPartners() {
  const [partners, setPartners] = useState([]);
  const [clicks, setClicks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | partner

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPartners(await listAllPartners(supabase));
      setError('');
    } catch (loadError) {
      console.error('Failed to load partners', loadError);
      setError('Impossible de charger les partenaires.');
    } finally {
      setLoading(false);
    }
    // Click counts are a bonus: their failure never blocks the list.
    partnerClickCounts(supabase)
      .then(setClicks)
      .catch(() => setClicks({}));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The public pages read the partners live; the rebuild refreshes their pre-rendered HTML
  // (search engines). Optional, as in the guides editor: without a deploy hook (503) or an
  // API (local dev), nothing is said; only a configured hook that fails is reported.
  const rebuildSite = async () => {
    try {
      const response = await adminFetch('/api/admin/redeploy', { method: 'POST' });
      if (response.ok) {
        setNotice(
          'Enregistré. Le site est à jour ; sa version pour les moteurs de recherche suit dans 2 à 3 minutes.'
        );
      } else if (response.status === 502) {
        setNotice(
          'Enregistré. La mise à jour automatique du site a échoué : elle suivra le prochain déploiement.'
        );
      }
    } catch {
      // Network error: stay silent, the partner itself is saved.
    }
  };

  const onSaved = async (_saved, publicChange) => {
    setEditing(null);
    setNotice('Enregistré.');
    await load();
    if (publicChange) rebuildSite();
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= partners.length) return;
    const ordered = partners.slice();
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setPartners(ordered);
    try {
      await savePartnerOrder(supabase, ordered);
      await load();
      if (isPublic(ordered[index]) || isPublic(ordered[target])) rebuildSite();
    } catch (moveError) {
      setError(saveErrorMessage(moveError));
      load();
    }
  };

  const statusLabel = (value) => PROFILE_STATUSES.find((s) => s.value === value)?.label ?? value;
  const typeLabel = (value) => PARTNER_TYPES.find((t) => t.value === value)?.label ?? value;

  return (
    <section className="space-y-5 text-ink">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Partenaires</h1>
          <p className="text-sm text-ink-2 mt-1 max-w-[70ch]">
            Le bandeau de logos de l&apos;accueil et les fiches de /partenaires. Les textes
            d&apos;une fiche viennent du partenaire, qui la valide avant publication.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="px-4 min-h-10 bg-ink text-white text-sm font-semibold"
          >
            + Ajouter un partenaire
          </button>
        )}
      </header>

      {notice && (
        <p className="border border-rule-2 bg-white px-4 py-3 text-sm text-ink-2" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="border border-accent-ink px-4 py-3 text-sm text-accent-ink" role="alert">
          {error}
        </p>
      )}

      {editing && (
        <Editor
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      <div className="overflow-x-auto border border-rule-2 bg-white">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-rule-2 text-left font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">
              <th className="py-2.5 px-3">Ordre</th>
              <th className="py-2.5 px-3">Partenaire</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Pays</th>
              <th className="py-2.5 px-3">Logo accueil</th>
              <th className="py-2.5 px-3">Fiche</th>
              <th className="py-2.5 px-3">Accord logo</th>
              <th className="py-2.5 px-3">Clics 30 j</th>
              <th className="py-2.5 px-3" />
            </tr>
          </thead>
          <tbody>
            {loading && partners.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 px-3 text-ink-2">
                  Chargement…
                </td>
              </tr>
            )}
            {!loading && partners.length === 0 && !error && (
              <tr>
                <td colSpan={9} className="py-6 px-3 text-ink-2">
                  Aucun partenaire pour le moment.
                </td>
              </tr>
            )}
            {partners.map((partner, index) => {
              const count = clicks[partner.slug];
              return (
                <tr key={partner.id} className="border-b border-rule last:border-b-0 align-middle">
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Monter ${partner.name}`}
                      className="w-7 h-7 border border-rule-2 disabled:opacity-30"
                    >
                      ↑
                    </button>{' '}
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === partners.length - 1}
                      aria-label={`Descendre ${partner.name}`}
                      className="w-7 h-7 border border-rule-2 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{partner.name}</td>
                  <td className="py-2.5 px-3">{typeLabel(partner.type)}</td>
                  <td className="py-2.5 px-3 font-mono">{partner.country || '—'}</td>
                  <td className="py-2.5 px-3">{homeLogoState(partner)}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-mono text-[10.5px] px-1.5 py-0.5 border ${
                        partner.profile_status === 'published'
                          ? 'border-ok text-ok'
                          : 'border-rule-2 text-ink-2'
                      }`}
                    >
                      {statusLabel(partner.profile_status)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[12.5px]">
                    {partner.logo_consent_at ? (
                      // A date column (YYYY-MM-DD): no time zone conversion.
                      partner.logo_consent_at.split('-').reverse().join('/')
                    ) : (
                      <span
                        className={partner.show_logo_on_home ? 'text-accent-ink' : 'text-ink-3'}
                      >
                        non renseigné
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[12.5px] whitespace-nowrap">
                    {count ? `${count.calls} appels · ${count.links} liens` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(partner)}
                      className="px-3 min-h-8 border border-rule-2 text-[12.5px] font-semibold"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
