import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight } from '../components/icons';
import MarketingOptIn, { MarketingOptInResult } from '../components/MarketingOptIn';
import { submitContactRequest, requestMarketingConfirmation } from '../lib/contactRequests';
import { validateContactRequest } from '../lib/contactRequestPolicy';
import { MARKETING_EMAIL_REQUIRED, isValidEmail } from '../lib/consentService';
import {
  EMAIL,
  HOURS,
  HOURS_SHORT,
  PHONE,
  RESPONSE_PROMISE,
  whatsappLink,
} from '../data/contactChannels';

/**
 * /contact — canaux directs en tête, puis un formulaire réellement enregistré
 * (POST /api/contact-requests) à la place de l'ancien `mailto:`. Les particuliers
 * sont dirigés vers /demande-inspection (docs/specs/2026-09-cta-demande-inspection.md §3.7).
 */

const KINDS = [
  { id: 'particulier', label: 'Particulier', hint: 'Faire inspecter un véhicule' },
  { id: 'professionnel', label: 'Professionnel', hint: 'Showroom, revendeur, flotte' },
  { id: 'partenaire', label: 'Partenaire', hint: 'Garage, centre de diagnostic' },
  { id: 'autre', label: 'Autre', hint: 'Presse, question générale' },
];

const EMPTY = {
  fullName: '',
  company: '',
  phone: '',
  email: '',
  message: '',
  privacyAccepted: false,
  marketingConsent: false, // separate from the privacy box, never pre-checked
};

const inputClass = (hasError) =>
  `w-full h-12 px-3.5 border bg-white text-base text-ink outline-none focus:border-ink ${
    hasError ? 'border-accent-ink' : 'border-rule-2'
  }`;

export default function Contact() {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('type');
  const [kind, setKind] = useState(
    KINDS.some((k) => k.id === requested) ? requested : 'particulier'
  );
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('editing'); // editing | submitting | done
  const [submitError, setSubmitError] = useState('');
  const [reference, setReference] = useState('');
  const [optIn, setOptIn] = useState({ status: null, email: '' });
  const [honeypot, setHoneypot] = useState('');

  const onInput = (field) => (event) =>
    setForm((prev) => ({
      ...prev,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { marketingConsent, ...fields } = form;
    const payload = { ...fields, kind, preferredChannel: 'appel' };
    const { errors: found } = validateContactRequest(payload);
    // The confirmation link goes to the e-mail field, which is optional otherwise.
    if (marketingConsent && !isValidEmail(form.email)) {
      found.email ||= MARKETING_EMAIL_REQUIRED;
    }
    setErrors(found);
    if (Object.keys(found).length) {
      const first = ['fullName', 'phone', 'email', 'message', 'privacyAccepted'].find(
        (f) => found[f]
      );
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    setStatus('submitting');
    setSubmitError('');
    try {
      setReference(await submitContactRequest({ ...payload, website: honeypot }));
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
      setForm(EMPTY);
    } catch (error) {
      setStatus('editing');
      setSubmitError(error.message);
      if (error.fields) setErrors(error.fields);
    }
  };

  const channels = [
    { label: 'Téléphone', value: PHONE.display, href: PHONE.href, action: 'Appeler →' },
    {
      label: 'WhatsApp',
      // The WhatsApp line is a +49 number: the button opens it, the page never prints it.
      value: 'Message WhatsApp',
      href: whatsappLink(),
      action: 'Écrire →',
      external: true,
    },
    { label: 'E-mail', value: EMAIL.display, href: EMAIL.href, action: 'Écrire →' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Contact"
        description="Contactez MALLOULIAUTO : téléphone, WhatsApp, e-mail ou formulaire. Réponse sous 24 h, du lundi au samedi. Sfax, Tunisie."
        path="/contact"
      />

      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4">
            Contact
          </p>
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight mb-4 max-w-3xl">
            Parlons de votre véhicule.
          </h1>
          <p className="text-lg text-white/85 max-w-2xl leading-relaxed">
            {RESPONSE_PROMISE}, {HOURS}.
          </p>
        </div>
      </section>

      <section aria-label="Nous joindre directement" className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex flex-col gap-2 py-7 sm:pr-6 border-b lg:border-b-0 lg:border-r border-rule text-ink group"
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-2">
                {c.label}
              </span>
              <span className="text-lg font-semibold break-words">{c.value}</span>
              <span className="text-sm font-semibold text-accent-ink group-hover:underline">
                {c.action}
              </span>
            </a>
          ))}
          <div className="flex flex-col gap-2 py-7 lg:pl-6">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-2">
              Horaires
            </span>
            <span className="text-lg font-semibold">{HOURS_SHORT}</span>
            <span className="text-sm text-ink-2">Sfax, Tunisie</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-16">
        <div className="max-w-[760px]">
          <h2 className="text-2xl lg:text-3xl font-semibold text-ink mb-6">Écrivez-nous</h2>

          {status === 'done' ? (
            <div role="status" className="flex flex-col gap-4">
              <p className="text-lg font-semibold text-ink">
                Message reçu — référence <span className="font-mono tabular-nums">{reference}</span>
              </p>
              <p className="text-ink-2">
                {RESPONSE_PROMISE}, {HOURS}.
              </p>
              <MarketingOptInResult status={optIn.status} email={optIn.email} />
              <button
                type="button"
                onClick={() => setStatus('editing')}
                className="self-start text-sm text-accent-ink underline"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
              <fieldset>
                <legend className="text-sm font-semibold text-ink mb-2.5">Vous êtes</legend>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {KINDS.map((k) => {
                    const checked = kind === k.id;
                    return (
                      <label
                        key={k.id}
                        className={`flex flex-col gap-1 min-h-[72px] p-3 border cursor-pointer ${
                          checked ? 'border-accent-ink bg-ground-2' : 'border-rule-2 bg-white'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                          <input
                            type="radio"
                            name="kind"
                            value={k.id}
                            checked={checked}
                            onChange={() => {
                              setKind(k.id);
                              setErrors({});
                            }}
                            className="w-4 h-4 accent-[#b5451b]"
                          />
                          {k.label}
                        </span>
                        <span className="text-xs leading-snug text-ink-2">{k.hint}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {kind === 'particulier' ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border border-rule-2 bg-ground-2">
                  <p className="text-[15px] leading-relaxed text-ink">
                    Pour faire inspecter un véhicule, la demande se fait en 3 étapes courtes.
                  </p>
                  <Link
                    to="/demande-inspection"
                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 min-h-[50px] bg-accent-ink hover:bg-ink"
                  >
                    <span className="text-white font-bold inline-flex items-center gap-2">
                      Demander un diagnostic
                      <ArrowRight className="w-5 h-5" accent="currentColor" />
                    </span>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="c-website">Site web</label>
                    <input
                      id="c-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {[
                      ['fullName', 'Nom *', 'text', 'name'],
                      ['company', 'Société', 'text', 'organization'],
                      ['phone', 'Téléphone *', 'tel', 'tel'],
                      ['email', 'E-mail', 'email', 'email'],
                    ].map(([field, label, type, autoComplete]) => (
                      <div key={field} className="flex flex-col gap-1.5">
                        <label htmlFor={`c-${field}`} className="text-sm font-semibold text-ink">
                          {label}
                        </label>
                        <input
                          id={`c-${field}`}
                          type={type}
                          autoComplete={autoComplete}
                          value={form[field]}
                          onChange={onInput(field)}
                          aria-invalid={Boolean(errors[field])}
                          className={inputClass(errors[field])}
                        />
                        {errors[field] && (
                          <p className="text-sm text-accent-ink">{errors[field]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="c-message" className="text-sm font-semibold text-ink">
                      Message *
                    </label>
                    <textarea
                      id="c-message"
                      rows={5}
                      maxLength={4000}
                      value={form.message}
                      onChange={onInput('message')}
                      aria-invalid={Boolean(errors.message)}
                      className={`w-full px-3.5 py-3 border bg-white text-base text-ink outline-none focus:border-ink ${
                        errors.message ? 'border-accent-ink' : 'border-rule-2'
                      }`}
                    />
                    {errors.message && <p className="text-sm text-accent-ink">{errors.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-2 cursor-pointer">
                      <input
                        id="c-privacyAccepted"
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
                    id="c-marketingConsent"
                    checked={form.marketingConsent}
                    onChange={onInput('marketingConsent')}
                  />
                  {submitError && (
                    <p role="alert" className="text-sm text-accent-ink">
                      {submitError}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="min-h-[52px] px-7 bg-accent-ink hover:bg-ink disabled:opacity-60 text-white font-bold"
                    >
                      {status === 'submitting' ? 'Envoi…' : 'Envoyer'}
                    </button>
                    <span className="text-sm text-ink-2">{RESPONSE_PROMISE}.</span>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        <aside className="self-start border-t border-rule pt-4 flex flex-col gap-2.5">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink">
            Déjà un rapport ?
          </p>
          <p className="text-sm leading-relaxed text-ink-2">
            Vérifiez son authenticité avec la référence imprimée sur le certificat.
          </p>
          <Link to="/#verifier" className="text-sm font-semibold text-accent-ink hover:underline">
            Vérifier un certificat →
          </Link>
        </aside>
      </section>
    </div>
  );
}
