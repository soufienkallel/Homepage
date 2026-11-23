import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Formulaire « Vérifier un rapport », posé dans le bandeau de confiance de l'accueil
 * (TrustBand.jsx). Aucune vérification en ligne n'existe encore dans cette base de code
 * (pas de table Supabase ni d'endpoint dédié). Le formulaire est réel et soumissible,
 * mais honnête sur l'état du service : jamais de résultat « vérifié » fabriqué côté
 * client — c'est exactement le type de fausse authenticité que le design system interdit.
 */
export default function CertificateVerification() {
  const [reference, setReference] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="cert-ref"
        className="block font-mono text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-3 mb-2"
      >
        Référence du rapport
      </label>
      <div className="flex">
        <input
          id="cert-ref"
          type="text"
          value={reference}
          onChange={(e) => {
            setReference(e.target.value);
            setSubmitted(false);
          }}
          spellCheck="false"
          autoComplete="off"
          placeholder="MA-AAAA-XXXXXX"
          className="flex-1 min-w-0 font-mono text-sm px-3 py-3 border border-rule-2 border-r-0 tracking-wide text-ink bg-white"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-ink hover:bg-accent-ink text-white font-semibold text-sm transition-colors flex-shrink-0"
        >
          Vérifier
        </button>
      </div>
      {submitted && (
        <p className="mt-3 text-sm text-ink-2 leading-relaxed" role="status">
          La vérification en ligne n&apos;est pas encore active.{' '}
          <Link to="/contact" className="text-accent-ink font-semibold underline">
            Contactez-nous
          </Link>{' '}
          avec cette référence pour confirmer un rapport.
        </p>
      )}
    </form>
  );
}
