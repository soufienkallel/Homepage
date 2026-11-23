import { Link } from 'react-router-dom';
import { MARKETING_CONSENT_TEXT } from '../lib/consentService';

/**
 * The two consent checkboxes required for e-mail marketing compliance:
 *  - privacy policy acceptance (required to submit the form)
 *  - marketing opt-in (optional, strictly separate)
 *
 * Both are uncontrolled-by-default OFF: the parent must initialise its state to
 * `false`. Neither box may ever be pre-checked or bundled with the other.
 */
export default function ConsentCheckboxes({
  idPrefix,
  privacyAccepted,
  marketingConsent,
  onPrivacyChange,
  onMarketingChange,
  variant = 'light',
}) {
  const isDark = variant === 'dark';
  const textClass = isDark ? 'text-white/80' : 'text-gray-600';
  const linkClass = isDark
    ? 'text-brand-orange hover:underline'
    : 'text-brand-blue hover:underline';
  const boxClass = `mt-0.5 w-4 h-4 flex-shrink-0 rounded border-gray-400 text-brand-orange focus:ring-2 focus:ring-brand-orange/40 ${
    isDark ? 'bg-white/10' : 'bg-white'
  }`;

  return (
    <div className="space-y-3">
      <label htmlFor={`${idPrefix}-privacy`} className="flex items-start gap-3 cursor-pointer">
        <input
          id={`${idPrefix}-privacy`}
          name="privacyAccepted"
          type="checkbox"
          checked={privacyAccepted}
          onChange={(e) => onPrivacyChange(e.target.checked)}
          required
          className={boxClass}
        />
        <span className={`text-sm leading-snug ${textClass}`}>
          J&apos;ai lu et j&apos;accepte la{' '}
          <Link to="/privacy" className={linkClass}>
            Politique de confidentialité
          </Link>{' '}
          et le traitement de mes données personnelles pour le traitement de ma demande. *
        </span>
      </label>

      <label htmlFor={`${idPrefix}-marketing`} className="flex items-start gap-3 cursor-pointer">
        <input
          id={`${idPrefix}-marketing`}
          name="marketingConsent"
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => onMarketingChange(e.target.checked)}
          className={boxClass}
        />
        <span className={`text-sm leading-snug ${textClass}`}>{MARKETING_CONSENT_TEXT}</span>
      </label>
    </div>
  );
}
