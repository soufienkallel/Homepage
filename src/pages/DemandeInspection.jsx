import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight } from '../components/icons';
import {
  CHANNELS,
  LOCATION_TYPES,
  PREFERRED_DATES,
  PURPOSES,
  VEHICLE_YEARS,
  validateContactRequest,
} from '../lib/contactRequestPolicy';
import MarketingOptIn, { MarketingOptInResult } from '../components/MarketingOptIn';
import { submitContactRequest, requestMarketingConfirmation } from '../lib/contactRequests';
import { MARKETING_EMAIL_REQUIRED, isValidEmail } from '../lib/consentService';
import { TOTAL_INSTRUMENTS, TOTAL_POINTS } from '../data/inspectionFacts';
import { BASE_PRICE_LABEL, TRAVEL_INCLUDED_SHORT } from '../data/pricing';
import {
  HOURS,
  PHONE,
  RESPONSE_PROMISE,
  WHATSAPP_MESSAGES,
  whatsappLink,
} from '../data/contactChannels';

/**
 * /demande-inspection — demande en 3 étapes (docs/specs/2026-09-cta-demande-inspection.md §3.5).
 * Véhicule d'abord, coordonnées en dernier ; brouillon conservé dans l'onglet ;
 * la demande est enregistrée par POST /api/contact-requests.
 */

const DRAFT_KEY = 'ma_demande_draft';

const STEPS = [
  {
    title: 'Le véhicule',
    fields: ['vehicleMake', 'vehicleModel', 'vehicleYear', 'listingUrl'],
  },
  { title: "L'inspection", fields: ['purpose', 'locationType', 'city', 'preferredDate'] },
  {
    title: 'Vos coordonnées',
    fields: ['fullName', 'phone', 'preferredChannel', 'email', 'message', 'privacyAccepted'],
  },
];

const EMPTY = {
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: VEHICLE_YEARS[0],
  listingUrl: '',
  purpose: PURPOSES[0],
  locationType: 'vendeur',
  city: '',
  preferredDate: PREFERRED_DATES[0],
  fullName: '',
  phone: '',
  preferredChannel: 'whatsapp',
  email: '',
  message: '',
  privacyAccepted: false,
  marketingConsent: false, // separate from the privacy box, never pre-checked
};

function readDraft() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) || 'null');
    return saved && typeof saved === 'object' ? saved : null;
  } catch {
    return null;
  }
}

function writeDraft(value) {
  try {
    if (value) window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage blocked: the form still works, without a draft.
  }
}

const inputClass = (hasError) =>
  `w-full h-12 px-3.5 border bg-white text-base text-ink outline-none focus:border-ink ${
    hasError ? 'border-accent-ink' : 'border-rule-2'
  }`;

function Field({ id, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {hint && <span className="font-normal text-ink-2"> — {hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-accent-ink">
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceGroup({ name, legend, options, value, onChange, error, columns = 3 }) {
  const grid = columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="text-sm font-semibold text-ink mb-2.5">{legend}</legend>
      <div className={`grid grid-cols-1 ${grid} gap-2`}>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const checked = value === optionValue;
          return (
            <label
              key={optionValue}
              className={`flex items-center gap-2.5 min-h-12 px-3.5 border cursor-pointer text-sm ${
                checked ? 'border-accent-ink bg-ground-2' : 'border-rule-2 bg-white'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={checked}
                onChange={() => onChange(optionValue)}
                className="w-4 h-4 accent-[#b5451b]"
              />
              {optionLabel}
            </label>
          );
        })}
      </div>
      {error && <p className="text-sm text-accent-ink">{error}</p>}
    </fieldset>
  );
}

export default function DemandeInspection() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  // Set by « Je vends » on the homepage (router state); the old ?profil= address still works.
  const profil = location.state?.profil || searchParams.get('profil');
  const [form, setForm] = useState(() => {
    const draft = typeof window !== 'undefined' ? readDraft() : null;
    const prefill = {
      vehicleMake: (searchParams.get('marque') || '').slice(0, 80),
      vehicleModel: (searchParams.get('modele') || '').slice(0, 80),
      // « Je vends » on the homepage: the car is at the seller's own place.
      locationType: profil === 'vendeur' ? 'domicile' : '',
    };
    return {
      ...EMPTY,
      ...(draft || {}),
      ...Object.fromEntries(Object.entries(prefill).filter(([, v]) => v)),
      // Consent is never restored from a draft: each box starts unticked.
      privacyAccepted: false,
      marketingConsent: false,
    };
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('editing'); // editing | submitting | done
  const [submitError, setSubmitError] = useState('');
  const [reference, setReference] = useState('');
  const [optIn, setOptIn] = useState({ status: null, email: '' });
  const [honeypot, setHoneypot] = useState('');
  const headingRef = useRef(null);
  const skipFirstFocus = useRef(true);

  useEffect(() => {
    if (status === 'editing') {
      const { privacyAccepted: _omit, marketingConsent: _omitMarketing, ...draft } = form;
      writeDraft(draft);
    }
  }, [form, status]);

  useEffect(() => {
    if (skipFirstFocus.current) {
      skipFirstFocus.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, status]);

  const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));
  const onInput = (field) => (event) =>
    set(field)(event.target.type === 'checkbox' ? event.target.checked : event.target.value);

  const stepErrors = (index) => {
    const { errors: all } = validateContactRequest({ ...form, kind: 'inspection' });
    // The confirmation link goes to the e-mail field, which is optional otherwise.
    if (form.marketingConsent && !isValidEmail(form.email)) {
      all.email ||= MARKETING_EMAIL_REQUIRED;
    }
    return Object.fromEntries(
      Object.entries(all).filter(([field]) => STEPS[index].fields.includes(field))
    );
  };

  const focusFirstError = (found) => {
    const first = STEPS.flatMap((s) => s.fields).find((field) => found[field]);
    if (first) window.requestAnimationFrame(() => document.getElementById(`f-${first}`)?.focus());
  };

  const next = async () => {
    const found = stepErrors(step);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(found);
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStatus('submitting');
    setSubmitError('');
    try {
      const { marketingConsent, ...fields } = form;
      const ref = await submitContactRequest({ ...fields, kind: 'inspection', website: honeypot });
      setReference(ref);
      // The request is stored: now the marketing opt-in, which can fail on its own.
      setOptIn({
        status: await requestMarketingConfirmation({
          marketingConsent,
          email: form.email,
          fullName: form.fullName,
          phone: form.phone,
          honeypot,
        }),
        email: form.email.trim(),
      });
      setStatus('done');
      writeDraft(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus('editing');
      setSubmitError(error.message);
      if (error.fields) {
        setErrors(error.fields);
        const target = STEPS.findIndex((s) => s.fields.some((f) => error.fields[f]));
        if (target >= 0 && target !== step) setStep(target);
        focusFirstError(error.fields);
      }
    }
  };

  const back = () => {
    setErrors({});
    setStep(Math.max(0, step - 1));
  };

  const maskedPhone = form.phone.replace(/\D/g, '').slice(-3);

  return (
    <div className="bg-white">
      <SEO
        title="Demander un diagnostic"
        description="Demandez le diagnostic d'une voiture d'occasion avant achat ou vente, en 3 étapes. Réponse sous 24 h, du lundi au samedi."
        path="/demande-inspection"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-16">
        <div className="max-w-[720px]">
          {status !== 'done' ? (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink mb-3">
                Demande de diagnostic
              </p>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-4 outline-none"
              >
                Demander un diagnostic
              </h1>
              <div className="flex items-center gap-4 mb-8">
                <p className="font-mono text-xs font-semibold text-ink-2 whitespace-nowrap">
                  Étape {step + 1} sur 3 · {STEPS[step].title}
                </p>
                <div className="flex-grow grid grid-cols-3 gap-1.5" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <div
                      key={s.title}
                      className={`h-1 ${i <= step ? 'bg-accent-ink' : 'bg-rule'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Honeypot — hidden from users and assistive technology. */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="f-website">Site web</label>
                <input
                  id="f-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {step === 0 && (
                <fieldset className="flex flex-col gap-5">
                  <legend className="text-lg font-semibold text-ink mb-5">Le véhicule</legend>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field id="f-vehicleMake" label="Marque *" error={errors.vehicleMake}>
                      <input
                        id="f-vehicleMake"
                        value={form.vehicleMake}
                        onChange={onInput('vehicleMake')}
                        maxLength={80}
                        aria-invalid={Boolean(errors.vehicleMake)}
                        aria-describedby={errors.vehicleMake ? 'f-vehicleMake-error' : undefined}
                        className={inputClass(errors.vehicleMake)}
                      />
                    </Field>
                    <Field id="f-vehicleModel" label="Modèle *" error={errors.vehicleModel}>
                      <input
                        id="f-vehicleModel"
                        value={form.vehicleModel}
                        onChange={onInput('vehicleModel')}
                        maxLength={80}
                        aria-invalid={Boolean(errors.vehicleModel)}
                        aria-describedby={errors.vehicleModel ? 'f-vehicleModel-error' : undefined}
                        className={inputClass(errors.vehicleModel)}
                      />
                    </Field>
                  </div>
                  <div className="sm:max-w-[240px]">
                    <Field id="f-vehicleYear" label="Année">
                      <select
                        id="f-vehicleYear"
                        value={form.vehicleYear}
                        onChange={onInput('vehicleYear')}
                        className={inputClass(false)}
                      >
                        {VEHICLE_YEARS.map((year) => (
                          <option key={year}>{year}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field
                    id="f-listingUrl"
                    label="Lien de l'annonce"
                    hint="facultatif : Tayara, automobile.tn, Facebook…"
                    error={errors.listingUrl}
                  >
                    <input
                      id="f-listingUrl"
                      type="url"
                      inputMode="url"
                      value={form.listingUrl}
                      onChange={onInput('listingUrl')}
                      placeholder="https://www.tayara.tn/…"
                      aria-invalid={Boolean(errors.listingUrl)}
                      aria-describedby={errors.listingUrl ? 'f-listingUrl-error' : undefined}
                      className={inputClass(errors.listingUrl)}
                    />
                  </Field>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset className="flex flex-col gap-6">
                  <legend className="text-lg font-semibold text-ink mb-5">L&apos;inspection</legend>
                  <ChoiceGroup
                    name="purpose"
                    legend="Objet de l'inspection *"
                    options={PURPOSES}
                    value={form.purpose}
                    onChange={set('purpose')}
                    error={errors.purpose}
                  />
                  <ChoiceGroup
                    name="locationType"
                    legend="Lieu de l'inspection *"
                    options={LOCATION_TYPES}
                    value={form.locationType}
                    onChange={set('locationType')}
                    error={errors.locationType}
                  />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field id="f-city" label="Ville *" error={errors.city}>
                      <input
                        id="f-city"
                        value={form.city}
                        onChange={onInput('city')}
                        maxLength={120}
                        autoComplete="address-level2"
                        aria-invalid={Boolean(errors.city)}
                        aria-describedby={errors.city ? 'f-city-help f-city-error' : 'f-city-help'}
                        className={inputClass(errors.city)}
                      />
                      <p id="f-city-help" className="text-[13px] leading-relaxed text-ink-2">
                        Déplacement inclus dans {TRAVEL_INCLUDED_SHORT}. Ailleurs, les frais vous
                        sont annoncés au rappel, avec le prix exact.
                      </p>
                    </Field>
                    <Field id="f-preferredDate" label="Date souhaitée">
                      <select
                        id="f-preferredDate"
                        value={form.preferredDate}
                        onChange={onInput('preferredDate')}
                        className={inputClass(false)}
                      >
                        {PREFERRED_DATES.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="flex flex-col gap-5">
                  <legend className="text-lg font-semibold text-ink mb-5">Vos coordonnées</legend>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field id="f-fullName" label="Nom *" error={errors.fullName}>
                      <input
                        id="f-fullName"
                        value={form.fullName}
                        onChange={onInput('fullName')}
                        autoComplete="name"
                        maxLength={200}
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={errors.fullName ? 'f-fullName-error' : undefined}
                        className={inputClass(errors.fullName)}
                      />
                    </Field>
                    <Field id="f-phone" label="Téléphone *" error={errors.phone}>
                      <input
                        id="f-phone"
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={onInput('phone')}
                        autoComplete="tel"
                        placeholder="+216 __ ___ ___"
                        maxLength={40}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? 'f-phone-error' : undefined}
                        className={inputClass(errors.phone)}
                      />
                    </Field>
                  </div>
                  <ChoiceGroup
                    name="preferredChannel"
                    legend="Nous vous recontactons par"
                    options={CHANNELS}
                    value={form.preferredChannel}
                    onChange={set('preferredChannel')}
                    columns={2}
                  />
                  <Field id="f-email" label="E-mail" hint="facultatif" error={errors.email}>
                    <input
                      id="f-email"
                      type="email"
                      value={form.email}
                      onChange={onInput('email')}
                      autoComplete="email"
                      maxLength={320}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'f-email-error' : undefined}
                      className={inputClass(errors.email)}
                    />
                  </Field>
                  <Field id="f-message" label="Précisions" hint="facultatif">
                    <textarea
                      id="f-message"
                      rows={3}
                      value={form.message}
                      onChange={onInput('message')}
                      maxLength={4000}
                      className="w-full px-3.5 py-3 border border-rule-2 bg-white text-base text-ink outline-none focus:border-ink"
                    />
                  </Field>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-2 cursor-pointer">
                      <input
                        id="f-privacyAccepted"
                        type="checkbox"
                        checked={form.privacyAccepted}
                        onChange={onInput('privacyAccepted')}
                        aria-invalid={Boolean(errors.privacyAccepted)}
                        className="mt-0.5 w-[18px] h-[18px] flex-shrink-0 accent-[#b5451b]"
                      />
                      <span>
                        J&apos;ai lu et j&apos;accepte la{' '}
                        <Link to="/privacy" className="text-accent-ink underline">
                          Politique de confidentialité
                        </Link>{' '}
                        et le traitement de mes données personnelles pour le traitement de ma
                        demande. *
                      </span>
                    </label>
                    {errors.privacyAccepted && (
                      <p className="text-sm text-accent-ink pl-7">{errors.privacyAccepted}</p>
                    )}
                  </div>
                  <MarketingOptIn
                    id="f-marketingConsent"
                    checked={form.marketingConsent}
                    onChange={onInput('marketingConsent')}
                  />
                </fieldset>
              )}

              <div className="mt-8 pt-5 border-t border-rule flex flex-col gap-3">
                {submitError && (
                  <p role="alert" className="text-sm text-accent-ink">
                    {submitError}
                  </p>
                )}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={back}
                      className="min-h-[50px] px-5 border border-rule-2 bg-white text-ink font-semibold hover:border-ink"
                    >
                      ← Retour
                    </button>
                  )}
                  <span className="hidden sm:block flex-grow" />
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="min-h-[52px] px-7 bg-accent-ink hover:bg-ink disabled:opacity-60 text-white font-bold inline-flex items-center justify-center gap-2"
                  >
                    {step < 2 ? (
                      <>
                        Continuer <ArrowRight className="w-5 h-5" accent="currentColor" />
                      </>
                    ) : status === 'submitting' ? (
                      'Envoi…'
                    ) : (
                      'Envoyer la demande'
                    )}
                  </button>
                </div>
                <p className="text-sm text-ink-2 sm:text-right">
                  {RESPONSE_PROMISE}. Aucun paiement à cette étape.
                </p>
              </div>
            </form>
          ) : (
            <div role="status" className="flex flex-col gap-5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink">
                Demande reçue
              </p>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-3xl lg:text-4xl font-semibold text-ink leading-tight outline-none"
              >
                Merci. Nous vous rappelons sous 24 h.
              </h1>
              <div className="self-start flex items-baseline gap-3.5 px-5 py-4 border border-rule-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-2">
                  Référence
                </span>
                <span className="font-mono text-xl font-semibold tabular-nums">{reference}</span>
              </div>
              <p className="text-base leading-relaxed text-ink-2 max-w-[62ch]">
                {HOURS.charAt(0).toUpperCase() + HOURS.slice(1)},{' '}
                {form.preferredChannel === 'whatsapp' ? 'par WhatsApp' : 'par téléphone'}
                {maskedPhone ? ` au numéro se terminant par ${maskedPhone}` : ''}. Gardez votre
                référence : elle permet de retrouver votre demande.
              </p>
              <MarketingOptInResult status={optIn.status} email={optIn.email} />
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappLink(WHATSAPP_MESSAGES.afterRequest(reference))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center min-h-[52px] px-6 bg-accent-ink hover:bg-ink"
                >
                  <span className="text-white font-bold">Écrire sur WhatsApp</span>
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center min-h-[52px] px-6 border border-rule-2 text-ink font-semibold hover:border-ink"
                >
                  Retour à l&apos;accueil
                </Link>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:pt-[118px] self-start">
          <div className="border-t border-rule">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink mt-4 mb-2">
              Ce qui se passe ensuite
            </p>
            {[
              [
                'Rappel sous 24 h, avec le prix',
                'Par appel ou WhatsApp, pour préciser le besoin, le lieu et le prix exact.',
              ],
              ['Rendez-vous fixé ensemble', 'Chez le vendeur, chez vous ou dans nos locaux.'],
              [
                'Inspection et rapport',
                `${TOTAL_POINTS} points, ${TOTAL_INSTRUMENTS} instruments, rapport vérifiable en ligne.`,
              ],
            ].map(([title, body], i) => (
              <div key={title} className="flex gap-3.5 py-3.5 border-b border-rule">
                <span className="font-mono text-sm font-semibold text-accent-ink">0{i + 1}</span>
                <div>
                  <p className="text-[15px] font-semibold text-ink">{title}</p>
                  <p className="text-sm leading-relaxed text-ink-2">{body}</p>
                </div>
              </div>
            ))}
            <div className="border border-rule-2 px-4 py-3.5 mt-4 flex flex-col gap-1 text-[13px] leading-relaxed text-ink-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em]">
                Inspection complète
              </span>
              <span>
                À partir de{' '}
                <span className="font-mono text-[22px] font-semibold text-ink">
                  {BASE_PRICE_LABEL}
                </span>
              </span>
              <span>
                Prix exact selon le véhicule, l&apos;objet et le lieu.{' '}
                <Link to="/tarifs" className="text-accent-ink underline font-semibold">
                  Voir les tarifs
                </Link>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink-2 mt-4">
              Une question avant d&apos;envoyer ?{' '}
              <a href={PHONE.href} className="text-accent-ink underline">
                {PHONE.display}
              </a>{' '}
              ou{' '}
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-ink underline"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
