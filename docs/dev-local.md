# Lancer le site en local

Le site (Vite) et ses fonctions `api/` tournent ensemble sous `vercel dev`, sur la même
origine, contre la base Supabase locale. `npm run dev` seul ne sert que le front : toutes les
routes `/api/*` (demandes d'inspection, admin, newsletter, chatbot) échouent.

## Prérequis (une fois)

- Node.js 20+, `npm install`
- Docker Desktop (démarré)
- Supabase CLI (`supabase --version`)
- Vercel CLI : `npm i -g vercel`, puis `vercel link` si le dossier `.vercel/` n'existe pas
- `.env` : copier `.env.example` en `.env` et y renseigner les secrets (clé Anthropic, Mailjet…)
  dont vous avez besoin. C'est le seul fichier d'environnement du dépôt ; il est ignoré par git.
  Pas de `.env.local` : `vercel dev` ne le lit pas pour les fonctions.

## Démarrer

```bash
supabase start          # base locale + migrations de supabase/migrations
npm run env:local       # met à jour .env à partir de `supabase status`
npx vercel dev --listen 3000
```

Ouvrir http://localhost:3000.

`npm run env:local` (`scripts/local-env.js`) met à jour dans `.env` (créé s'il manque) les clés
du Supabase local (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`) et vide `VITE_API_BASE_URL` / `VITE_CHAT_API_URL`. Il renseigne
`RATE_LIMIT_SALT`, `CRON_SECRET` et `PUBLIC_SITE_URL` seulement s'ils sont absents ou encore
au modèle. Toutes les autres lignes sont conservées.

Avec une clé Anthropic dans `.env`, les agents de l'admin et le chatbot consomment du crédit réel
en local ; avec les clés Mailjet, la newsletter envoie de vrais e-mails. Laisser ces variables
vides si le test n'en a pas besoin.

Relancer `npm run env:local` puis `vercel dev` si les clés locales changent (après
`supabase stop --no-backup` ou une nouvelle installation).

## Services locaux

| Adresse | Service |
| --- | --- |
| http://localhost:3000 | site + `/api/*` |
| http://127.0.0.1:54321 | API Supabase (auth, REST) |
| http://127.0.0.1:54323 | Supabase Studio (tables, SQL, utilisateurs) |
| http://127.0.0.1:54324 | boîte mail de test (e-mails d'auth du Supabase local) |
| `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | base Postgres |

## Espace admin en local

L'admin est `admin@mallouliauto.com` : l'adresse est autorisée par la migration
`20260926110000_admin_email.sql` (table `homepage_admins`), mais le compte d'authentification
se crée à la main, en local comme sur le cloud.

1. Studio → Authentication → Add user : `admin@mallouliauto.com`, un mot de passe local
   (6 caractères minimum), « Auto Confirm User » coché.
2. Pour changer le mot de passe d'un compte existant, Studio → SQL Editor :

   ```sql
   update auth.users
   set encrypted_password = extensions.crypt('MOT_DE_PASSE_LOCAL', extensions.gen_salt('bf'))
   where email = 'admin@mallouliauto.com';
   ```

   « No rows returned » est normal pour un `update`.
3. Se connecter sur http://localhost:3000/login, puis `/admin/demandes`.

Ne jamais réutiliser le mot de passe local sur le compte cloud.

## Tester un déploiement preview

Les previews sont protégées par l'authentification Vercel. Pour les appeler depuis un terminal,
renseigner `VERCEL_AUTOMATION_BYPASS_SECRET` dans `.env` (Project Settings → Deployment
Protection → Protection Bypass for Automation), puis :

```bash
set -a; . ./.env; set +a
curl -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" https://<preview>.vercel.app/api/agents/sales/run
```

Le secret ouvre toutes les previews du projet : ne jamais le mettre dans une URL partagée ni
dans une variable `VITE_`. S'il fuit, le régénérer dans Vercel et mettre `.env` à jour.

## Arrêter

`Ctrl+C` dans le terminal de `vercel dev`, puis `supabase stop` (les données locales sont
conservées). `supabase db reset` efface la base locale et rejoue toutes les migrations : les
comptes et demandes de test disparaissent.

## Dépannage

| Symptôme | Cause et correction |
| --- | --- |
| `PGRST205` « Could not find the table 'public.…' » (par exemple `partners_public`) | La base locale a été créée avant une migration récente. `supabase migration up` applique les migrations manquantes en gardant les données (s'il répond « Local database is up to date » et que l'erreur persiste, l'API garde l'ancienne liste de tables en mémoire : `docker restart supabase_rest_homepage-mallouliauto`) ; `supabase db reset` les rejoue toutes mais efface les comptes et demandes de test. Après un `git pull`, lancer `supabase migration up`. |
| « Failed to fetch » sur une page admin ou un formulaire | `VITE_API_BASE_URL` pointe vers une autre origine, ou un ancien `.env.local` traîne encore (Vite le lit en plus de `.env`). Supprimer `.env.local`, lancer `npm run env:local` et redémarrer `vercel dev`. |
| `/api/*` renvoie la page HTML ou une 404 | Le site tourne avec `npm run dev` : utiliser `vercel dev`. |
| `/api/*` en 500 ou 503 | `.env` manquant ou Supabase local arrêté : `supabase start`, `npm run env:local`, relancer `vercel dev`. |
| Port 3000 déjà utilisé | Un ancien `vercel dev` tourne encore (processus `vercel\dist\vc.js dev`) : le fermer, ou lancer sur un autre port avec `--listen 3100`. |
| Connexion refusée pour l'admin | Compte absent ou non confirmé (Studio → Authentication), ou adresse absente de `homepage_admins`. |
| Agents admin en 404 en local (`/api/agents/marketing/run`, `…/sales/run`, `…/correct`, `…/discover`, `…/enrich`, `…/prospects-import`, `…/sales/worker`) | Limite de `vercel dev` : il envoie la requête au serveur Vite avant la route dynamique `api/agents/[group]/[name].ts`. Ces routes ne fonctionnent qu'une fois déployées (preview ou production). Les autres routes agents (brouillons, prospects, base de connaissances) fonctionnent en local. |
| Une modification de `.env` n'est pas prise en compte | `vercel dev` lit `.env` au démarrage : le relancer. |
