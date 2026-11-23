# Tableau de bord admin : visites et sources de campagne

Décisions du 26 sept. 2026, sur la maquette « Admin — Tableau de bord campagne » (artboards
ordinateur, mobile, état vide) :

- Une visite = un chargement du site dans un onglet ; un visiteur qui revient compte une
  nouvelle visite (pas d'identifiant, pas de bandeau cookies).
- Les indicateurs des agents IA quittent le tableau de bord : trois lignes « À relire ».
- Articles, Newsletter et Carrières restent dans le menu.
- Les pages vues sont conservées 13 mois.
- La politique de confidentialité décrit la mesure (section 6).

## Pourquoi pas Vercel Web Analytics

Sur le plan Hobby : pas de ventilation UTM, pas d'événements personnalisés, historique d'un
mois, 50 000 événements partagés entre projets, et des chiffres séparés des demandes. La mesure
maison répond à la question du tableau de bord (quelle source amène des demandes) et reste
dans la même base que les demandes.

## Données

`public.page_views` (migration `20260927100000_page_views.sql`), une ligne par page vue :
chemin, première page de la visite ou non, source · canal · campagne · annonce du lien
d'arrivée, domaine du site référent, type d'appareil, pays (en-tête Vercel). Jamais d'adresse
IP, de user agent, ni de paramètre d'URL autre que `utm_*`. RLS sans politique : lecture et
écriture par la clé de service uniquement.

Attribution (`src/lib/trafficSource.js`, partagée par les visites, le tableau de bord et la
page Demandes) : les `utm_*` du lien d'arrivée d'abord (codes Meta `fb`/`ig` traduits), sinon le
site référent (moteurs → `recherche`, réseaux → `social`, messageries → `messaging`, autres →
`referral` avec leur domaine), sinon `direct`.

## Flux

1. `src/lib/analytics.js` : à chaque changement de route, `POST /api/page-views` (sendBeacon).
   Identifiant de visite aléatoire gardé en mémoire le temps du chargement, rien dans le
   navigateur. Pas de mesure pour `/admin`, `/login`, les navigateurs automatisés, ni si le
   navigateur signale un refus (Global Privacy Control, Do Not Track).
   Seules les pages du site sont mesurées (`src/lib/trackedPaths.js`, à tenir à jour avec
   les routes de `src/App.jsx`) : une adresse inconnue (page « introuvable ») n'est pas
   enregistrée, et la page réelle suivante devient la page d'arrivée de la visite.
2. `api/page-views.ts` (Edge, public) : valide, écarte les robots et les adresses qui ne sont pas
   des pages du site (même liste), classe la source, insère.
3. `api/admin/analytics.ts` (Edge, admin) : `homepage_visit_stats()` pour les visites, demandes
   de la période classées avec les mêmes règles, demandes à traiter, file des agents ; purge
   les pages vues de plus de 13 mois (`purge_old_page_views()`).
4. `src/pages/admin/HomepageAdminDashboard.jsx` : un seul appel par période / campagne.

Périodes : 7 jours, 30 jours, depuis le lancement (28 sept. 2026), en heure de Tunis.

Parcours : visites → page Tarifs consultée → formulaire d'inspection ouvert → demandes
envoyées → inspections réalisées. L'étape Tarifs (ajoutée le 2 oct. 2026, migration
`20261002110000_visit_stats_pricing.sql`) n'est pas obligatoire : un visiteur peut ouvrir le
formulaire sans passer par `/tarifs`. Sa note donne le nombre de visites qui ont ouvert le
formulaire après avoir vu la page.

Pages (migration `20261002120000_visit_stats_pages.sql`, 2 oct. 2026) : « Pages visitées »
remplace « Pages d'arrivée » et liste chaque page du site vue sur la période — vues, visites
qui l'ont ouverte, visites arrivées par elle. « Navigation entre pages » donne les passages
d'une page à la suivante dans une même visite (12 plus fréquents), comptés une fois par visite.
Les deux sont calculés à partir des pages vues déjà enregistrées : aucune donnée nouvelle.

## Limites connues

- Un article inexistant (`/newsroom/<slug inconnu>`) est encore compté : le distinguer
  demanderait une requête en base à chaque page vue.
- Les adresses inconnues enregistrées avant le 2 oct. 2026 (ex. `/demande-inspection/admin`)
  restent dans l'historique.

- Pas de visiteurs uniques (choix assumé ci-dessus).
- Les visiteurs qui refusent la mesure ou bloquent les scripts envoient quand même des
  demandes : le parcours peut compter plus de demandes que de formulaires mesurés, le tableau
  de bord l'indique au lieu d'afficher un pourcentage supérieur à 100 %.
- `POST /api/page-views` n'a pas de limite de débit : un tiers pourrait gonfler les compteurs,
  sans accès à aucune donnée. À ajouter si les chiffres deviennent incohérents.
- `vercel dev` ne sert pas toujours les fonctions Edge aussi vite qu'en production (~1,5 s par
  appel en local).
