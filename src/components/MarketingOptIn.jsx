import { MARKETING_CONSENT_TEXT } from '../lib/consentService';
import { OPTIN_TOKEN_TTL_HOURS } from '../lib/consentPolicy';

/**
 * The marketing e-mail opt-in of the request forms (/contact, /demande-inspection).
 *
 * Mailjet's rule, and ours: a box of its own, distinct from the privacy-policy one, unchecked
 * by default, never restored from a saved draft, optional, with the exact wording stored as
 * proof (MARKETING_CONSENT_TEXT, versioned by CONSENT_VERSION). Ticking it only sends a
 * confirmation link to the visitor's e-mail: nothing is subscribed before it is opened.
 * Same markup as the privacy box next to it.
 */
export default function MarketingOptIn({ id, checked, onChange, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-2 cursor-pointer">
        <input
          id={id}
          name="marketingConsent"
          type="checkbox"
          checked={checked}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 w-[18px] h-[18px] flex-shrink-0 accent-[#b5451b]"
        />
        <span>{MARKETING_CONSENT_TEXT}</span>
      </label>
      {error && (
        <p id={`${id}-error`} className="text-sm text-accent-ink pl-7">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * What to tell the visitor once a request was sent with the marketing box ticked.
 * `status`: 'sent' (confirmation e-mail on its way), 'failed', or null (box not ticked).
 */
export function MarketingOptInResult({ status, email }) {
  if (!status) return null;
  return (
    <p className="text-base leading-relaxed text-ink-2 max-w-[62ch]">
      {status === 'sent' ? (
        <>
          <span className="font-semibold text-ink">Pour recevoir nos actualités :</span> ouvrez le
          lien de confirmation envoyé à{' '}
          <span className="font-semibold text-ink break-words">{email}</span> (valable{' '}
          {OPTIN_TOKEN_TTL_HOURS} h). Sans confirmation, aucune inscription n&apos;est enregistrée.
        </>
      ) : (
        <>
          Votre inscription aux e-mails n&apos;a pas pu être enregistrée. Votre demande, elle, est
          bien reçue : vous pourrez vous inscrire plus tard.
        </>
      )}
    </p>
  );
}
