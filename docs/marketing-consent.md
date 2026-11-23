# Consentement marketing (conformité Mailjet / RGPD)

## Exigence Mailjet (Compliance, 24 sept. 2026)

Pour chaque contact marketing, Mailjet exige que nous conservions :

| Preuve exigée | Où elle est stockée |
| --- | --- |
| URL du lien cliqué pour confirmer l'inscription | événement `confirmed` → `confirmation_url` |
| Horodatage du clic (date, heure, fuseau) | événement `confirmed` → `created_at` (`timestamptz`, exporté en UTC ISO 8601) |
| Texte accepté par l'abonné | `requested.marketing_consent_text` (case du formulaire) + `confirmed.confirmation_statement` (texte à côté du bouton de confirmation) |
| Adresse IP publique (si possible) | `ip_address` sur les deux événements |

Export prêt à transmettre : vue `marketing_consent_proofs` (une ligne par confirmation).

## Parcours (double opt-in)

1. Le visiteur coche la case marketing (`/contact`, `/demande-inspection` ou, une fois activé, le pied
   de page `#newsletter`)
   et envoie le formulaire. Sur les deux formulaires de demande, la demande est d'abord
   enregistrée (`POST /api/contact-requests`), puis l'inscription est demandée ; si elle échoue,
   la demande reste enregistrée et la page de confirmation le dit.
2. `POST /api/newsletter/subscribe` (Vercel Function) valide, limite le débit, enregistre un
   événement `requested` (texte, page, IP, user agent), crée un jeton (seul son hash SHA-256 est
   stocké, validité 72 h) et envoie l'e-mail de confirmation via Mailjet Send API v3.1.
3. Le lien de l'e-mail ouvre `/newsletter/confirmation?token=…`, qui affiche le texte de
   confirmation et un bouton. Le bouton est obligatoire : un scanner de messagerie qui ouvre le
   lien automatiquement ne confirme rien.
4. `POST /api/newsletter/confirm` appelle la fonction SQL `confirm_newsletter_optin` qui, dans une
   seule transaction, enregistre l'événement `confirmed` (URL cliquée, horodatage, IP, texte) et
   consomme le jeton. Le contact est ensuite ajouté à la liste Mailjet (`managecontact`,
   `addforce`) ; un échec de cette synchronisation n'annule pas la confirmation.

Les formulaires `/contact` et `/demande-inspection` gardent la preuve d'acceptation de la
politique de confidentialité dans `contact_requests` (`privacy_consent_*`). Envoyés **sans** la case
marketing, ils n'écrivent rien dans `marketing_consents` et n'envoient aucun e-mail. Les deux
utilisent la source `contact` du journal ; l'URL de page stockée avec l'événement dit lequel.

## Fichiers

| Élément | Emplacement |
| --- | --- |
| Textes de consentement, version, durée du lien | `src/lib/consentPolicy.js` (partagé navigateur / serveur) |
| Appels depuis le navigateur | `src/lib/consentService.js` |
| Formulaire newsletter | `src/components/NewsletterSignup.jsx` |
| Cases de consentement | `src/components/ConsentCheckboxes.jsx` |
| Formulaires de demande (case marketing) | `src/pages/Contact.jsx`, `src/pages/DemandeInspection.jsx` |
| Case marketing des formulaires de demande, message de retour | `src/components/MarketingOptIn.jsx` |
| Envoi de la demande d'inscription après une demande | `requestMarketingConfirmation` dans `src/lib/contactRequests.js` |
| Interrupteur (`VITE_NEWSLETTER_ENABLED`) | `src/lib/features.js` |
| Page de confirmation | `src/pages/NewsletterConfirmation.jsx` |
| Endpoints | `api/newsletter/subscribe.js`, `api/newsletter/confirm.js` |
| Helpers serveur (Supabase service role, Mailjet, IP) | `server/` |
| Schéma SQL | `supabase/migrations/20260925100200_marketing_consents.sql` puis `…100300_newsletter_double_optin.sql` |
| Politique de confidentialité | `src/pages/Privacy.jsx`, section 7 |

Règles : deux cases distinctes, aucune pré-cochée, aucune restaurée depuis un brouillon ; cocher la
case marketing impose une adresse e-mail (le lien de confirmation y est envoyé) ;
le formulaire du pied de page est masqué tant que `VITE_NEWSLETTER_ENABLED` n'est pas `true`
(il exige les clés Mailjet), la case des formulaires de demande est toujours affichée ; refuser le marketing n'empêche pas l'envoi du
formulaire de contact ; le texte stocké est la copie **serveur** correspondant à `CONSENT_VERSION`
(une page affichant une ancienne version reçoit `409` et doit être rechargée) ; journal en ajout
seul ; aucune adresse e-mail dans les logs.

## Mise en service

1. Authentifier `mallouliauto.com` dans Mailjet (SPF + DKIM) et valider l'expéditeur
   `newsletter@mallouliauto.com` — sans cela, l'envoi de l'e-mail de confirmation échoue.
2. Appliquer les migrations `supabase/migrations/` (voir `docs/api.md`). Après
   `…100300_newsletter_double_optin`, l'ancien code (insertion depuis le navigateur) ne
   fonctionne plus : déployer le nouveau code en même temps.
3. Variables d'environnement Vercel (serveur uniquement, jamais préfixées `VITE_`) :
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` (ou `VITE_SUPABASE_URL` à défaut),
   `MJ_APIKEY_PUBLIC`, `MJ_APIKEY_PRIVATE`, `MJ_LIST_ID`, et facultativement `MJ_SENDER_EMAIL`,
   `MJ_SENDER_NAME`, `PUBLIC_SITE_URL` (par défaut `https://mallouliauto.com` — c'est l'origine
   des liens envoyés par e-mail, jamais déduite de l'en-tête `Host`).
   Sans Supabase ou sans clés Mailjet, l'inscription renvoie `503` et le formulaire affiche un
   message d'erreur.
4. Tester : s'inscrire depuis le pied de page, ouvrir le lien reçu, confirmer, puis
   `select * from marketing_consent_proofs order by clicked_at_utc desc limit 5;`.

Remarque : `vite dev` ne sert pas les fonctions `api/` ; utiliser `vercel dev` ou un déploiement
de preview pour tester le parcours complet.

## Contacts antérieurs

Les inscriptions faites avant la migration 002 (simple opt-in) sont marquées `form_submitted` et
**ne figurent pas** dans `marketing_consents_current` : elles n'ont pas de preuve de clic. Elles
doivent se réinscrire (ou recevoir un e-mail de reconfirmation) avant tout envoi marketing.

## Points ouverts

- **Désinscriptions** (phase 2) : gérées par le lien Mailjet. À terme, un webhook Mailjet
  enregistrera un événement `unsubscribed` pour garder une source de vérité unique. En attendant,
  la liste Mailjet fait foi pour les désinscriptions.
- **Purge** : conservation annoncée « durée de l'inscription + 3 ans après désinscription » ; la
  purge automatique n'est pas implémentée. Les demandes jamais confirmées pourraient être
  supprimées plus tôt (non implémenté).
- **Rate limiting** : 10 événements / IP / heure et 3 demandes / adresse / heure, calculés sur la
  table. Suffisant au volume actuel ; passer à un compteur dédié si le trafic augmente.
