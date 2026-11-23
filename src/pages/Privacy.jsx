import SEO from '../components/SEO';

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Politique de confidentialité"
        description="Politique de confidentialité et protection des données personnelles de MALLOULIAUTO."
        path="/privacy"
      />
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4">
            MALLOULIAUTO
          </p>
          <h1 className="text-4xl font-semibold leading-tight mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-white/80">Dernière mise à jour : 26 septembre 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">1. Collecte des données</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            MALLOULIAUTO collecte les données personnelles que vous nous fournissez volontairement
            lors d'une demande d'inspection ou d'une prise de contact : nom, adresse e-mail, numéro
            de téléphone, et les informations relatives au véhicule inspecté (identification,
            kilométrage, historique communiqué). Ces données sont nécessaires pour organiser
            l'inspection, produire le rapport et vous le transmettre.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">2. Utilisation des données</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Vos données sont utilisées exclusivement pour : organiser et réaliser l'inspection
            demandée, produire et vous transmettre le rapport et le certificat, vous contacter au
            sujet de votre demande, et — avec votre consentement explicite — vous envoyer des
            communications marketing (voir section 7).
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">3. Protection des données</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Toutes vos données sont chiffrées en transit (HTTPS/TLS) et au repos. Nous appliquons
            des mesures de sécurité conformes aux standards de l'industrie. L'accès aux données est
            strictement limité au personnel autorisé.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">4. Partage des données</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Nous ne vendons jamais vos données personnelles. Vos informations ne sont partagées
            qu'avec l'opérateur en charge de votre inspection et, lorsque le rapport est produit par
            un partenaire en marque blanche, avec ce partenaire.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">5. Vos droits</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de
            rectification, de suppression et de portabilité de vos données personnelles. Pour
            exercer ces droits, contactez-nous à{' '}
            <a href="mailto:info@mallouliauto.com" className="text-accent-ink hover:underline">
              info@mallouliauto.com
            </a>
            .
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">6. Cookies et mesure d'audience</h2>
          <p className="text-ink-2 leading-relaxed mb-4">
            Notre site utilise des cookies techniques nécessaires au fonctionnement de la
            plateforme. Aucun cookie publicitaire ou de suivi tiers n'est utilisé sans votre
            consentement explicite.
          </p>
          <p className="text-ink-2 leading-relaxed mb-6">
            Pour savoir d'où viennent nos visiteurs, nous mesurons la fréquentation du site sans
            cookie et sans identifiant. Pour chaque page consultée, nous enregistrons la page, le
            site ou le lien de campagne d'où vient la visite, le type d'appareil (mobile, tablette
            ou ordinateur) et le pays déduit de la connexion. Nous comptons aussi les clics sur nos
            boutons de contact (demande de diagnostic, appel, WhatsApp, lien vers un partenaire),
            avec la page et le type d&apos;appareil. Votre adresse IP et votre navigateur ne sont
            pas conservés et rien n'est enregistré sur votre appareil : ces données ne permettent
            pas de vous identifier. Elles sont conservées 13 mois. Si votre navigateur signale que
            vous refusez le suivi (Global Privacy Control ou « Do Not Track »), aucune mesure n'est
            effectuée.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">
            7. Communications marketing et consentement
          </h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Nous n&apos;envoyons de communications marketing (actualités, nouveautés produit,
            offres) qu&apos;aux personnes ayant coché, de leur propre initiative, la case de
            consentement dédiée présente dans nos formulaires, puis confirmé leur inscription en
            cliquant sur le lien reçu par e-mail (double opt-in). Cette case est distincte de
            l&apos;acceptation de la présente politique et n&apos;est jamais pré-cochée : ne pas la
            cocher n&apos;empêche ni l&apos;envoi de votre demande ni l&apos;accès à nos services.
            Sans confirmation dans un délai de 72 heures, le lien expire et aucune inscription
            n&apos;est enregistrée.
          </p>
          <p className="text-ink-2 leading-relaxed mb-6">
            Pour chaque inscription, nous conservons la preuve du consentement : adresse e-mail,
            date et heure (UTC) de la demande et de la confirmation, page d&apos;origine du
            formulaire, adresse du lien de confirmation utilisé, texte exact accepté à chaque étape,
            adresse IP publique et navigateur utilisés. Ces éléments sont conservés tant que vous
            êtes inscrit, puis trois ans après votre désinscription, afin de pouvoir démontrer la
            validité des envois effectués. Vous pouvez retirer votre consentement à tout moment,
            sans justification, via le lien de désabonnement présent dans chacun de nos e-mails ou
            en écrivant à{' '}
            <a href="mailto:info@mallouliauto.com" className="text-accent-ink hover:underline">
              info@mallouliauto.com
            </a>
            . Le retrait est traité sans délai et ne remet pas en cause la licéité des envois
            effectués auparavant.
          </p>
          <p className="text-ink-2 leading-relaxed mb-6">
            Nos e-mails sont acheminés par Mailjet (Sinch Email, Union européenne), qui agit en tant
            que sous-traitant pour notre compte et traite vos données uniquement selon nos
            instructions.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">
            8. Demandes d&apos;inspection et de contact
          </h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Lorsque vous envoyez une demande d&apos;inspection ou un message depuis le site, nous
            enregistrons les informations que vous saisissez (nom, téléphone, e-mail si vous le
            donnez, véhicule, lieu et ville de l&apos;inspection, message), le canal par lequel vous
            souhaitez être recontacté, la page d&apos;origine et, le cas échéant, les paramètres de
            la campagne publicitaire qui vous a amené sur le site. Ces données servent uniquement à
            répondre à votre demande et à organiser l&apos;inspection ; elles ne sont pas utilisées
            pour de la prospection sans votre consentement distinct.
          </p>
          <p className="text-ink-2 leading-relaxed mb-6">
            Pour limiter les abus, nous conservons une empreinte chiffrée de votre adresse IP,
            jamais l&apos;adresse elle-même. Les demandes sont conservées 24 mois après notre
            dernier échange, puis supprimées. Si vous choisissez d&apos;être recontacté par
            WhatsApp, l&apos;échange passe par ce service, édité par Meta, selon ses propres
            conditions.
          </p>

          <h2 className="text-2xl font-semibold text-ink mb-4">9. Contact</h2>
          <p className="text-ink-2 leading-relaxed mb-6">
            Pour toute question relative à la protection de vos données, contactez-nous :<br />
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
