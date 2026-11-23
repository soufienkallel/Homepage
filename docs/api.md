# API du site (Vercel Functions)

Le site et son API sont déployés ensemble par le projet Vercel `mallouliauto` : le front Vite
dans `dist/`, les fonctions dans `api/`. Depuis le 25 sept. 2026, les routes chatbot et agents
sont copiées du monorepo (`Malloulinova/mallouliauto@ad22609e`, `apps/api` +
`apps/packages/agents`) ; les copies du monorepo seront supprimées plus tard.

## Routes

| Route | Runtime | Auth | Rôle |
| --- | --- | --- | --- |
| `POST /api/chat` | edge | publique, limitée par IP | Chatbot du site (streaming SSE) |
| `POST /api/newsletter/subscribe`, `/confirm` | node | publique | Double opt-in — voir `docs/marketing-consent.md` |
| `POST /api/contact-requests` | node | publique, 20 / heure / IP | Demande d'inspection (`/demande-inspection`) ou message (`/contact`) → table `contact_requests`, puis e-mail de notification à l'équipe (`server/requestNotification.js`, via Mailjet, variables `MJ_*`, `REQUEST_NOTIFY_*`) |
| `GET`, `PATCH /api/admin/contact-requests` | node | admin | Liste et suivi des demandes (`/admin/demandes`) : statut, note interne |
| `POST /api/page-views` | edge | publique | Mesure des visites sans cookie → table `page_views` — voir `docs/specs/2026-09-admin-analytics.md` |
| `POST /api/events` | edge | publique | Clics mesurés sans cookie (boutons de demande, appel, WhatsApp, liens partenaires) → table `click_events` — voir `docs/specs/2026-10-refonte-accueil.md` |
| `POST /api/admin/redeploy` | edge | admin | Relance le déploiement de production (crochet Vercel) après publication, modification ou suppression d'un guide publié, ou d'un partenaire visible sur le site — voir `docs/specs/2026-10-prerendering.md` |
| `GET /api/admin/analytics` | edge | admin | Chiffres du tableau de bord (`/admin`) : visites, sources, parcours, demandes |
| `GET /api/agents/chatbot/stats` | edge | admin | Statistiques du chatbot |
| `/api/agents/knowledge` | edge | admin | Base de connaissances des agents (CRUD) |
| `/api/agents/marketing/{drafts,approve}` | edge | admin | Brouillons marketing |
| `/api/agents/marketing/{run,correct,og-image}` | node | admin (`run` : aussi cron) | Génération, correction, image PNG (Chromium) |
| `/api/agents/sales/{prospects,drafts,approve,jobs,discovery-config}` | edge | admin | Prospects, brouillons, file de jobs, configuration |
| `/api/agents/sales/{run,correct,discover,enrich,prospects-import,worker}` | node | admin (`worker` : aussi cron) | Génération, découverte, enrichissement, import, traitement de la file |

Code partagé côté serveur : `server/` (`server/agents/` = ancien `packages/agents`,
`server/marketing/` = rendu d'image, `server/data/` = données d'amorçage). Rien dans `server/`
n'est une route.

## Authentification admin

`server/adminAuth.js`. Le navigateur envoie le jeton de session Supabase de l'admin connecté
(`src/lib/adminApi.js`) ; le serveur le vérifie auprès de Supabase Auth puis exige :

- `app_metadata.role = 'admin'` ou `app_metadata.roles` contenant `admin` — jamais
  `user_metadata`, modifiable par l'utilisateur lui-même ; **ou**
- une adresse e-mail confirmée présente dans la table `public.homepage_admins`.

La même règle est appliquée en base par `public.is_homepage_admin()` (RLS des articles).
Ajouter un admin : `insert into public.homepage_admins (email) values ('prenom@mallouliauto.com');`.

L'ancien jeton partagé `VITE_AGENT_ADMIN_TOKEN` n'existe plus : étant préfixé `VITE_`, il était
inclus dans le JavaScript public du site.

Les routes appelées par Vercel Cron acceptent aussi `Authorization: Bearer <CRON_SECRET>`.

## Tâches planifiées

`vercel.json` ne planifie que `GET /api/agents/marketing/run` (lundi 06:00 UTC). Le worker
`/api/agents/sales/worker` n'est **pas** planifié (décision du 25 sept. 2026) : il se déclenche
depuis l'admin (« Traiter la file »). Pour le réactiver : ajouter une entrée `crons` et accepter
`GET` dans `worker.ts` — Vercel Cron appelle en `GET`, et la version d'origine n'acceptait que
`POST` (la tâche toutes les 5 min du monorepo échouait donc en 405).

## Base de données

Les migrations vivent dans `supabase/migrations/` (Supabase CLI, `supabase/config.toml`). Ce
dépôt est propriétaire des tables `agent_*`, `articles`, `marketing_consents`,
`newsletter_optin_tokens` et `homepage_admins` sur le projet Supabase cloud, ainsi que de
`partners` (vue publique `partners_public`, bucket `partners`) et `click_events` depuis le
16 oct. 2026. Les partenaires se lisent et s'écrivent depuis le navigateur de l'admin
(`/admin/partenaires`) sous RLS ; aucune route ne leur est dédiée.

| Migration | Contenu |
| --- | --- |
| `20260925100000_agents_baseline` | Tables agents (ex-migrations 049–059 du monorepo), idempotente |
| `20260925100100_articles_baseline` | Table `articles` (ex-098), idempotente |
| `20260925100200_marketing_consents` | Journal de consentement (ex-`docs/marketing-consent.sql`) |
| `20260925100300_newsletter_double_optin` | Double opt-in (ex-`docs/marketing-consent-002-…`) |
| `20260925100400_harden_rls` | Politiques RLS — voir ci-dessous |
| `20260925100500_revoke_consent_table_grants` | Retire tout privilège navigateur sur `marketing_consents` (constaté après la mise en production) |
| `20260926100000_contact_requests` | Demandes d'inspection et de contact (clé service uniquement) |
| `20260926110000_admin_email` | Admin : admin@mallouliauto.com remplace l'adresse .tn |
| `20260927100000_page_views` | Pages vues (mesure sans cookie), `homepage_visit_stats()`, purge à 13 mois (clé service uniquement) |

Corrections apportées par `harden_rls` aux politiques héritées :

- `agent_knowledge` et `agent_discovery_*` étaient ouvertes en lecture **et écriture** à la clé
  anonyme publique (`for all using (true)` sans rôle) ; toutes les tables `agent_*` sont
  désormais fermées à `anon`/`authenticated` (accès uniquement via l'API, clé service) ;
- `articles` : tout utilisateur connecté pouvait créer, modifier ou supprimer un article ;
  désormais lecture publique des articles publiés, écriture réservée aux admins ;
- dépendances au schéma produit supprimées (`get_my_role()`, clé étrangère vers `public.users`) ;
- ajout de la valeur `enriched` au statut prospect (acceptée par l'API mais absente de l'enum).

Toutes les migrations ont été testées deux fois de suite sur une base vierge et sur une base
reproduisant l'état cloud (migrations 049–059 et 098 du monorepo déjà appliquées).

### Prise en main du projet cloud (une fois)

L'historique `supabase_migrations.schema_migrations` du projet cloud contient les versions du
monorepo. `supabase db push` refusera tant qu'elles ne sont pas marquées :

```bash
supabase link --project-ref <ref-du-projet-cloud>
supabase migration list            # versions distantes inconnues localement
supabase migration repair --status reverted <versions du monorepo>
supabase db push                   # applique les 5 migrations de ce dépôt
```

`repair` ne modifie que la table d'historique, pas le schéma. À faire par le propriétaire du
projet, après sauvegarde.

## Limite de 12 fonctions (plan Hobby)

Vercel refuse un déploiement Hobby de plus de 12 fonctions Node.js ; les fonctions Edge
(`export const config = { runtime: 'edge' }`) ne sont pas comptées. Les huit routes agents
longues (`marketing/correct`, `marketing/run`, `sales/correct`, `sales/run`, `sales/discover`,
`sales/enrich`, `sales/prospects-import`, `sales/worker`) partagent donc une seule fonction,
`api/agents/[group]/[name].ts`, qui les aiguille vers `server/agents/routes/`. Les URL ne
changent pas : les fichiers statiques voisins (`api/agents/sales/prospects.ts`, …) restent
prioritaires. La réécriture SPA de `vercel.json` exclut `/api/`, sinon elle masquerait la route
dynamique. Une nouvelle route agent Node.js s'ajoute dans `ROUTES` de ce fichier plutôt qu'en
nouveau fichier. État : 6 fonctions Node.js sur 12.

## Variables d'environnement

Liste complète et commentée : `.env.example`. Serveur uniquement (jamais `VITE_`) :
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`,
`RATE_LIMIT_SALT`, `CAL_COM_DEMO_URL`, `MJ_*`, `PUBLIC_SITE_URL`, `VERCEL_DEPLOY_HOOK_URL`, et les options
`ANTHROPIC_MODEL_*`, `AGENT_DAILY_DRAFT_CAP`, `AGENT_VALIDATE_IMAGES`.

## Développement et vérifications

```bash
npx tsc -p api/tsconfig.json   # typage strict de api/ et server/
npm run build                  # front, puis pré-rendu des pages publiques (scripts/prerender.mjs)
vercel dev                     # front + fonctions en local
```

Les variables locales sont dans `.env`, seul fichier d'environnement du dépôt (ignoré par git,
modèle : `.env.example`) ; `npm run env:local` y met les clés du Supabase local lancé par
`supabase start`. En production, elles sont dans les réglages du projet Vercel. Procédure
complète, admin local et dépannage : `docs/dev-local.md`.

`api/tsconfig.json` est aussi celui qu'utilise Vercel au déploiement (sinon il compile sans
`strict` et les types zod deviennent optionnels). Les imports relatifs portent l'extension `.js`
(`"type": "module"` + résolution NodeNext).

## Écarts connus, non traités ici

- Plusieurs pages admin appellent des routes avec l'identifiant dans le chemin
  (`/api/agents/sales/prospects/:id`, `/prospects/:id/generate`, `/discovery-config/:id`) et
  des champs (`contact_email`, `country`, `owner`) que l'API ne connaît pas : l'API attend
  l'identifiant dans le corps et les champs `email`, `city`, etc. Écart hérité du monorepo.
- Le prompt du chatbot (`api/chat.ts`) et la base de connaissances amorcée contiennent
  des affirmations (« IA Vision inspecte en moins de 5 minutes », parts de marché) à confronter
  à la charte (`docs/design-system/README.md`) avant usage public prolongé.
