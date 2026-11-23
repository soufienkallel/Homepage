import SEO from '../components/SEO';

export default function Terms() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Conditions d'utilisation"
        description="Conditions générales d'utilisation de la plateforme MALLOULIAUTO."
        path="/terms"
      />
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4">
            MALLOULIAUTO
          </p>
          <h1 className="text-4xl font-semibold leading-tight mb-4">Conditions d'Utilisation</h1>
          <p className="text-white/80">Dernière mise à jour : mai 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">1. Objet</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Les présentes conditions générales d'utilisation régissent l'accès et l'utilisation de
            la plateforme MALLOULIAUTO, éditée par MALLOULINOVA, société basée à Sfax, Tunisie.
            L'utilisation de la plateforme implique l'acceptation pleine et entière de ces
            conditions.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">2. Services proposés</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            MALLOULIAUTO propose un service d'inspection et de certification de véhicules d'occasion
            : un protocole d'inspection standardisé, appliqué par un opérateur instrumenté, qui
            produit un rapport structuré (constats localisés, gravité, mesures, chiffrage) et un
            certificat vérifiable en ligne. Ce rapport est proposé en direct aux particuliers et, en
            marque blanche, à des garages, experts automobiles et experts d'assurance qui appliquent
            le même protocole sous leur propre nom. Les capacités d'intelligence artificielle et
            d'instruments connectés qui assistent la production du rapport sont en cours de
            développement ; chaque fonctionnalité affichée sur la plateforme précise son statut réel
            (disponible ou en développement).
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">3. Compte utilisateur</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            L'accès à certains services nécessite la création d'un compte. Vous êtes responsable de
            la confidentialité de vos identifiants et de toutes les activités réalisées sous votre
            compte. Vous vous engagez à fournir des informations exactes et à jour.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">
            4. Nature du rapport et de l'assistance technologique
          </h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Le rapport MALLOULIAUTO documente des constats mesurés par l'opérateur, avec la gravité
            et le chiffrage associés. Il ne constitue ni une recommandation d'achat ou de vente, ni
            un avis se substituant à celui d'un professionnel : il donne les éléments mesurés pour
            permettre à l'utilisateur de décider. Les fonctionnalités d'intelligence artificielle et
            d'instruments connectés qui assistent la production du rapport n'ajoutent aucun fait
            nouveau : elles reformulent ou complètent ce que l'opérateur a déjà constaté.
            MALLOULIAUTO ne saurait être tenu responsable d'une décision d'achat, de vente ou de
            réparation prise sur la seule base du rapport.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">5. Tarification</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Les prix des services sont affichés en Dinars Tunisiens (TND) et incluent toutes les
            taxes applicables. Les tarifs peuvent être modifiés à tout moment, les prix applicables
            étant ceux en vigueur au moment de la commande.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">6. Responsabilité</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            MALLOULIAUTO s'engage à appliquer son protocole d'inspection avec diligence et à
            documenter fidèlement les constats mesurés. Un rapport produit par un partenaire en
            marque blanche (garage, expert automobile, expert d'assurance) engage son auteur :
            celui-ci est désigné sur le rapport comme opérateur habilité selon le protocole
            MALLOULIAUTO, et répond du contenu de ses propres constats. MALLOULIAUTO ne garantit pas
            les décisions prises par un tiers sur la base d'un rapport, ni les réparations, achats
            ou ventes qui en découlent.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">7. Propriété intellectuelle</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            L'ensemble du contenu de la plateforme (textes, images, logos, protocole d'inspection,
            logiciels et technologies associées) est la propriété exclusive de MALLOULINOVA. Toute
            reproduction ou utilisation non autorisée est strictement interdite.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">8. Droit applicable</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Les présentes conditions sont régies par le droit tunisien. Tout litige relatif à
            l'utilisation de la plateforme sera soumis à la compétence exclusive des tribunaux de
            Sfax, Tunisie.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">9. Contact</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Pour toute question relative aux présentes conditions, contactez-nous :<br />
            MALLOULIAUTO — Sfax, Tunisie
            <br />
            E-mail :{' '}
            <a href="mailto:info@mallouliauto.com" className="text-accent-ink hover:underline">
              info@mallouliauto.com
            </a>
            <br />
            Téléphone : +216 25 571 398
          </p>
        </div>
      </section>
    </div>
  );
}
