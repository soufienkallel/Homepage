import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { CONFIRMATION_STATEMENT, confirmSubscription } from '../lib/consentService';

const RESULT_COPY = {
  confirmed: {
    title: 'Inscription confirmée',
    text: 'Vous recevrez désormais nos communications par e-mail. Vous pouvez vous désinscrire à tout moment via le lien présent dans chacun de nos e-mails.',
  },
  already_confirmed: {
    title: 'Inscription déjà confirmée',
    text: "Ce lien a déjà été utilisé : votre inscription est active. Vous n'avez rien d'autre à faire.",
  },
  expired: {
    title: 'Lien expiré',
    text: "Ce lien de confirmation n'est plus valable. Inscrivez-vous de nouveau depuis le pied de page pour recevoir un nouveau lien.",
  },
  invalid: {
    title: 'Lien invalide',
    text: "Ce lien de confirmation n'est pas reconnu. Vérifiez qu'il a été copié en entier, ou inscrivez-vous de nouveau depuis le pied de page.",
  },
  error: {
    title: 'Confirmation impossible pour le moment',
    text: 'Une erreur est survenue. Réessayez dans quelques minutes ou écrivez-nous à info@mallouliauto.com.',
  },
};

/**
 * Landing page of the double opt-in link. Confirmation requires an explicit
 * click on the button (POST), so mail scanners that open links automatically
 * cannot subscribe anyone. The statement shown here is the one stored as proof.
 */
export default function NewsletterConfirmation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState(token ? 'ready' : 'invalid');

  const handleConfirm = async () => {
    setStatus('submitting');
    try {
      setStatus(await confirmSubscription(token));
    } catch (error) {
      console.error('[newsletter] confirmation failed', error);
      setStatus('error');
    }
  };

  const result = RESULT_COPY[status];

  return (
    <div className="min-h-[70vh] bg-white border-t border-rule">
      <SEO
        title="Confirmation d'inscription"
        description="Confirmez votre inscription aux communications de MALLOULIAUTO."
        noIndex
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent-ink mb-4">
          Newsletter
        </p>

        {result ? (
          <div role="status">
            <h1 className="text-3xl font-semibold text-ink mb-4 leading-tight">{result.title}</h1>
            <p className="text-ink-2 leading-relaxed mb-8">{result.text}</p>
            <Link to="/" className="text-accent-ink font-semibold hover:underline">
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-ink mb-4 leading-tight">
              Confirmez votre inscription
            </h1>
            <p className="text-ink-2 leading-relaxed mb-8 border-l-2 border-rule-2 pl-4">
              {CONFIRMATION_STATEMENT}
            </p>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={status === 'submitting'}
              className="inline-flex items-center justify-center px-8 py-4 bg-accent hover:bg-accent-ink disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {status === 'submitting' ? 'Confirmation…' : 'Confirmer mon inscription'}
            </button>
            <p className="mt-6 text-sm text-ink-2">
              Vous n&apos;êtes pas à l&apos;origine de cette demande ? Ignorez simplement cette page
              : aucune inscription ne sera enregistrée.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
