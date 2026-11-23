import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import ConsentCheckboxes from './ConsentCheckboxes';
import { recordConsent, isValidEmail } from '../lib/consentService';
import { OPTIN_TOKEN_TTL_HOURS } from '../lib/consentPolicy';

const INITIAL_STATE = {
  email: '',
  privacyAccepted: false,
  marketingConsent: false,
};

/**
 * Public opt-in form for marketing e-mails.
 *
 * Consent is explicit (nothing pre-checked), granular (privacy policy and
 * marketing are two independent checkboxes) and confirmed by e-mail (double
 * opt-in): submitting only sends a confirmation link — see
 * api/newsletter/subscribe.js and docs/marketing-consent.md.
 */
export default function NewsletterSignup({ variant = 'dark' }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');
  // Bots fill every field; humans never see this one.
  const [honeypot, setHoneypot] = useState('');

  const isDark = variant === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (honeypot) {
      // Silently pretend it worked — do not tell the bot why it failed.
      setStatus('success');
      return;
    }

    if (!isValidEmail(form.email)) {
      setError('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    if (!form.privacyAccepted) {
      setError('Vous devez accepter la politique de confidentialité.');
      return;
    }

    if (!form.marketingConsent) {
      setError(
        'Pour recevoir nos communications, vous devez cocher la case de consentement marketing.'
      );
      return;
    }

    setStatus('submitting');

    try {
      await recordConsent({
        email: form.email,
        source: 'newsletter',
        privacyAccepted: form.privacyAccepted,
        marketingConsent: form.marketingConsent,
      });
      setForm(INITIAL_STATE);
      setStatus('success');
    } catch (err) {
      console.error('[newsletter] consent registration failed', err);
      setStatus('error');
      setError(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div
        className={`flex items-start gap-3 rounded-xl p-6 ${
          isDark ? 'bg-white/10 text-white' : 'bg-emerald/10 text-brand-navy'
        }`}
      >
        <CheckCircle className="w-6 h-6 text-emerald flex-shrink-0" />
        <div>
          <p className="font-semibold">Vérifiez votre boîte mail.</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
            Nous vous avons envoyé un lien de confirmation, valable {OPTIN_TOKEN_TTL_HOURS} heures.
            Votre inscription ne sera active qu&apos;après avoir confirmé via ce lien.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Mail
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-white/50' : 'text-gray-400'
            }`}
          />
          <label htmlFor="newsletter-email" className="sr-only">
            Adresse e-mail
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="votre@email.com"
            className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all ${
              isDark
                ? 'bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-brand-orange'
                : 'bg-white border border-gray-300 text-brand-navy focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
        >
          <Send className="w-4 h-4" />
          {status === 'submitting' ? 'Envoi…' : "S'inscrire"}
        </button>
      </div>

      {/* Honeypot — hidden from users and assistive technology, visible to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="newsletter-company">Société</label>
        <input
          id="newsletter-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <ConsentCheckboxes
        idPrefix="newsletter"
        variant={variant}
        privacyAccepted={form.privacyAccepted}
        marketingConsent={form.marketingConsent}
        onPrivacyChange={(checked) => setForm({ ...form, privacyAccepted: checked })}
        onMarketingChange={(checked) => setForm({ ...form, marketingConsent: checked })}
      />

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm text-brand-orange">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}
    </form>
  );
}
