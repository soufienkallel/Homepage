-- MALLOULIAUTO homepage — baseline for the marketing / sales / chatbot agents.
--
-- Consolidates the monorepo migrations 049–059 (Malloulinova/mallouliauto@ad22609e),
-- whose ownership moves to this repository. Written to be idempotent: on the cloud
-- project, where those migrations already ran, every statement is a no-op; on a
-- fresh database it creates the same schema.
--
-- Deliberately NOT carried over (see 20260925100400_harden_rls.sql):
--   * RLS policies based on public.get_my_role() (a product-schema helper) and the
--     permissive "using (true)" policies — all access goes through the API with the
--     service role, so the hardening migration defines the policies instead;
--   * the agent_drafts.approved_by FK to public.users (product table);
--   * agent_campaigns (054) — not used by the homepage code.

-- ─── Enums ─────────────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'agent_segment') then
    create type public.agent_segment as enum ('insurance', 'garage', 'dealer', 'fleet', 'b2c');
  end if;
  if not exists (select 1 from pg_type where typname = 'agent_language') then
    create type public.agent_language as enum ('fr', 'ar');
  end if;
  if not exists (select 1 from pg_type where typname = 'prospect_status') then
    create type public.prospect_status as enum (
      'new', 'sequence_generated', 'in_progress', 'replied',
      'demo_booked', 'won', 'lost', 'unsubscribed'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'agent_type') then
    create type public.agent_type as enum ('marketing', 'sales');
  end if;
  if not exists (select 1 from pg_type where typname = 'agent_run_status') then
    create type public.agent_run_status as enum ('success', 'partial', 'failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'agent_channel') then
    create type public.agent_channel as enum (
      'linkedin', 'facebook', 'instagram', 'email', 'linkedin_dm', 'whatsapp'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'agent_draft_status') then
    create type public.agent_draft_status as enum (
      'pending_review', 'approved', 'rejected', 'published'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'agent_job_status') then
    create type public.agent_job_status as enum ('queued', 'running', 'completed', 'failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'agent_job_type') then
    create type public.agent_job_type as enum ('discover', 'enrich', 'enrich_batch');
  end if;
end$$;

-- 057, 058
alter type public.agent_language add value if not exists 'en';
alter type public.agent_type add value if not exists 'chatbot';

-- ─── Shared trigger functions ──────────────────────────────────────

create or replace function public.set_updated_at_now()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.agent_jobs_update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─── agent_prospects (049) ─────────────────────────────────────────

create table if not exists public.agent_prospects (
  id uuid primary key default gen_random_uuid(),
  segment public.agent_segment not null,
  company text not null,
  contact_name text null,
  role text null,
  email text null,
  linkedin_url text null,
  whatsapp_e164 text null,                       -- normalized to E.164 (e.g. +21698123456)
  language public.agent_language not null default 'fr',
  city text null,
  source text not null default 'csv',
  notes text null,
  status public.prospect_status not null default 'new',
  last_touch_at timestamp null,
  next_touch_at timestamp null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create unique index if not exists uq_agent_prospects_email
  on public.agent_prospects (lower(email)) where email is not null;
create index if not exists idx_agent_prospects_segment on public.agent_prospects (segment);
create index if not exists idx_agent_prospects_status on public.agent_prospects (status);
create index if not exists idx_agent_prospects_next_touch on public.agent_prospects (next_touch_at);

alter table public.agent_prospects enable row level security;

-- ─── agent_runs (050) ──────────────────────────────────────────────

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_type public.agent_type not null,
  trigger text not null,                        -- 'cron' | 'manual' | 'api'
  input jsonb null,
  output_summary jsonb null,                    -- { drafts_created, drafts_blocked, ... }
  tokens_input int null,
  tokens_output int null,
  cost_usd numeric(8,4) null,
  status public.agent_run_status not null default 'success',
  error text null,
  duration_ms int null,
  created_at timestamp not null default now()
);

create index if not exists idx_agent_runs_agent_type on public.agent_runs (agent_type);
create index if not exists idx_agent_runs_created_at on public.agent_runs (created_at);

alter table public.agent_runs enable row level security;

-- ─── agent_drafts (051) ────────────────────────────────────────────

create table if not exists public.agent_drafts (
  id uuid primary key default gen_random_uuid(),
  agent_type public.agent_type not null,
  channel public.agent_channel not null,
  language public.agent_language not null,
  segment public.agent_segment null,
  prospect_id uuid null references public.agent_prospects(id) on delete cascade,
  run_id uuid null references public.agent_runs(id) on delete set null,
  status public.agent_draft_status not null default 'pending_review',
  content jsonb not null,                       -- { subject?, body, hashtags?, image_brief?, scheduled_for? }
  guardrails jsonb null,                        -- { passed: bool, warnings: [], blocked_reasons: [] }
  reject_reason text null,
  approved_by uuid null,
  approved_at timestamp null,
  published_at timestamp null,
  external_post_id text null,
  created_at timestamp not null default now()
);

create index if not exists idx_agent_drafts_status on public.agent_drafts (status);
create index if not exists idx_agent_drafts_agent_type on public.agent_drafts (agent_type);
create index if not exists idx_agent_drafts_prospect on public.agent_drafts (prospect_id);
create index if not exists idx_agent_drafts_run on public.agent_drafts (run_id);

alter table public.agent_drafts enable row level security;

-- ─── agent_knowledge (052, 053, 059) ───────────────────────────────

create table if not exists public.agent_knowledge (
  id uuid primary key default gen_random_uuid(),
  category text not null,             -- 'company' | 'voice' | 'proof' | 'value_prop_*'
  title text not null,                -- human-readable label for admin UI
  content text not null,              -- markdown content injected into agent prompt
  is_active boolean not null default true,
  version int not null default 1,
  updated_by text null,               -- admin identifier
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_agent_knowledge_active_category
  on public.agent_knowledge (category) where (is_active = true);
create index if not exists idx_agent_knowledge_category on public.agent_knowledge (category);

alter table public.agent_knowledge enable row level security;

-- Seed (053) — skipped for categories that already have an active entry.
INSERT INTO public.agent_knowledge (category, title, content, is_active, version)
VALUES
(
  'company',
  'MALLOULIAUTO — Company Knowledge',
  E'# MALLOULIAUTO — Company Knowledge\n\n## Mission\nModernize the Tunisian automotive aftermarket by combining computer-vision damage inspection (IA Vision MALLOULIAUTO) and LLM-based mechanical diagnostics (IA Diagnostic MALLOULIAUTO) into a single B2B-first SaaS platform.\n\n## Audience\n- 35% Insurance companies (claims inspection + fraud detection)\n- 25% Independent garages (lead generation + AI diagnostic tools)\n- 15% Car dealers (certified pre-owned grading)\n- 15% Fleet operators (preventive maintenance + driver compliance)\n- 10% B2C drivers (premium services)\n\n## Geographic focus\nGreater Tunis (La Marsa, Ariana, Carthage, Tunis Centre, Ben Arous), expanding to Sfax and Sousse in v1.1.\n\n## Differentiators\n- Dual-AI architecture (Vision + Diagnostic) — most competitors do only one\n- Built for Tunisian context: French/Arabic UX, TND pricing, Carte Bancaire + D17 + cash\n- Offline-first mobile experience (technicians work in basements)\n- Integrates with existing insurer claim workflows (no rip-and-replace)\n\n## Why now\n- Tunisian car parc is aging (avg 12 years) → more diagnostic + repair needs\n- Insurance fraud losses estimated at 15% of claims volume → high ROI for AI inspection\n- Smartphone penetration > 80% → mobile-first is viable',
  true,
  1
),
(
  'voice',
  'MALLOULIAUTO — Brand Voice',
  E'# MALLOULIAUTO — Brand Voice\n\n## Tone\n- Professional, confident, evidence-driven — never salesy or hyped\n- French primary, Tunisian Arabic when appropriate (MSA-with-Tunisian-flavor for posts)\n- Concise: prefer 1–2 sentence paragraphs in social posts, ≤120 words for cold emails\n\n## Mandatory rules (HARD)\n- **No emojis.** Ever. Use Lucide icon names in image briefs only.\n- **French accents are mandatory.** Always write `Véhicule`, `Révision`, `Réparation`, `Contrôle`, `Coût`, `Précision`, `expirée`, `dépassée`, `Citroën`, etc.\n- **No third-party vendor names** in user-visible text. Never say "PAVE", "DeepSeek", "Groq", "AutoPi", "Exypnos", "Anthropic", "Claude", "OpenAI". Always attribute AI to MALLOULIAUTO: `IA Vision MALLOULIAUTO`, `IA Diagnostic MALLOULIAUTO`.\n- **Currency** is `TND` formatted as `150 TND` (number first, space, TND).\n- **URLs**: only `mallouliauto.com`, `cal.com/mallouliauto`, `wa.me/<approved>` are allowed in drafts.\n- **No fabricated stats.** Only facts from `proof.md`.\n\n## Words to avoid\n- "Révolutionnaire", "magique", "incroyable", "le meilleur" (over-promising)\n- "Game changer", "disruption" (English jargon)\n- All caps shouting\n\n## Words we like\n- "Moderniser", "fiabiliser", "automatiser"\n- "Pour les assureurs / garages / flottes tunisiens"\n- "En 5 minutes", "sans déplacement", "sans paperasse"\n\n## CTA style\n- Sales: always one CTA at the end → "15 minutes pour en discuter? {CAL_COM_DEMO_URL}"\n- Marketing: invite, don''t push → "Découvrez la plateforme sur mallouliauto.com"',
  true,
  1
),
(
  'proof',
  'MALLOULIAUTO — Proof Points',
  E'# MALLOULIAUTO — Proof Points\n\n> Only cite facts from this file. Never invent statistics.\n\n## Product capabilities\n- IA Vision MALLOULIAUTO inspects 360° vehicle photos in under 5 minutes\n- IA Diagnostic MALLOULIAUTO interprets 5,000+ OBD-II DTC codes in French and Arabic\n- Mobile app works offline; syncs when connectivity returns\n- Cross-platform: iOS, Android, Web — same workflow everywhere\n\n## Market context\n- Tunisian car parc: ~2 million vehicles, average age ~12 years (source: ANCSEP, public)\n- Estimated insurance-fraud share of claims: ~15% (industry estimate, internal benchmark)\n- Smartphone penetration in Tunisia: >80% (public ITU data)\n\n## Platform reach\n- 5 user roles in one unified app: customer, insurance, garage, fleet, dealer\n- Greater Tunis coverage with onboarding partners in La Marsa, Ariana, Carthage\n\n## Awards & ecosystem\n- Member of Tunisian startup ecosystem (Startup Act label)\n- Demo platform: platform.mallouliauto.com\n- Marketing site: mallouliauto.com',
  true,
  1
),
(
  'value_prop_b2c',
  'Value Proposition — Individual drivers (B2C)',
  E'# Value Proposition — Individual drivers (B2C)\n\n## Buyer\nParticulier propriétaire d''un véhicule, 25–55 ans, urbain, smartphone.\n\n## Pain points\n- Manque de confiance envers les garages (peur d''être surfacturé)\n- Pas de visibilité sur l''état réel de leur véhicule\n- Oubli du contrôle technique, de l''assurance, de la révision\n- Procédure sinistre lourde et lente\n\n## What MALLOULIAUTO offers\n- **Auto-diagnostic gratuit** par photo + OBD via app\n- **Rappels automatiques** : assurance, contrôle technique, révision\n- **Devis transparent** comparé entre garages partenaires\n- **Inspection sinistre** directement depuis l''app (pas besoin d''expert physique)\n\n## Quantifiable benefit\n- Coût d''entretien annuel : -20% grâce aux comparaisons\n- Aucun oubli d''échéance réglementaire\n- Sinistre traité en 24h au lieu de 7 jours',
  true,
  1
),
(
  'value_prop_dealer',
  'Value Proposition — Car dealers',
  E'# Value Proposition — Car dealers (used + new)\n\n## Buyer\nResponsable parc / responsable qualité chez concessionnaire ou marchand multimarque.\n\n## Pain points\n- Inspection pré-vente manuelle, hétérogène entre techniciens\n- Litiges post-vente sur des défauts non déclarés\n- Difficulté à valoriser un véhicule d''occasion sans certification crédible\n- Acheteurs particuliers méfiants face aux occasions\n\n## What MALLOULIAUTO offers\n- **Inspection IA standardisée** avant mise en vente (visuel + OBD)\n- **Certificat MALLOULIAUTO** joint à l''annonce, gage de transparence\n- **Grading automatique** A/B/C/D basé sur l''état réel\n- Historique digital du véhicule (entretiens, sinistres déclarés)\n- Plateforme de mise en relation acheteurs sur mallouliauto.com\n\n## Quantifiable benefit\n- Temps d''inspection pré-vente : -50%\n- Réduction des litiges post-vente : -30%\n- Délai moyen de vente d''un véhicule certifié : -20%',
  true,
  1
),
(
  'value_prop_fleet',
  'Value Proposition — Fleet operators',
  E'# Value Proposition — Fleet operators\n\n## Buyer\nResponsable de flotte / fleet manager chez sociétés de logistique, taxis, location, ou administrations (>20 véhicules).\n\n## Pain points\n- Maintenance curative coûteuse faute de suivi préventif\n- Pas de visibilité sur l''état mécanique réel de la flotte\n- Conducteurs non responsabilisés (déclarations tardives, sinistres mal documentés)\n- Carburant et entretien dépassent souvent le budget\n\n## What MALLOULIAUTO offers\n- **Check-in quotidien chauffeur** (5 photos + OBD) via app MALLOULIAUTO\n- **Alertes préventives** sur usure pneus, freins, vidange en retard\n- **Tableau de bord flotte** : score santé moyen, alertes critiques, budget projeté\n- Réservation de réparation directe chez garages partenaires\n- Suivi carburant + sinistres centralisé\n\n## Quantifiable benefit\n- Coût d''entretien annuel par véhicule : -15% à -25%\n- Taux d''immobilisation : -30%\n- Détection précoce des défaillances majeures avant casse',
  true,
  1
),
(
  'value_prop_garage',
  'Value Proposition — Independent garages',
  E'# Value Proposition — Independent garages\n\n## Buyer\nPatron de garage indépendant ou chef d''atelier (Greater Tunis, 2–10 mécaniciens).\n\n## Pain points\n- Acquisition client difficile : dépendance au bouche-à-oreille\n- Diagnostic mécanique chronophage sans outil OBD performant\n- Difficulté à justifier les devis auprès des clients sceptiques\n- Pas de visibilité en ligne (pas de site, pas de Google Business optimisé)\n- Concurrence des concessionnaires sur les véhicules récents\n\n## What MALLOULIAUTO offers\n- **Génération de leads** depuis l''app MALLOULIAUTO (clients particuliers + sinistres assureurs partenaires)\n- **IA Diagnostic MALLOULIAUTO** : interprétation des codes OBD-II en français, suggestion de réparation\n- **Devis pré-formaté** envoyé directement au client via l''app\n- Profil garage public avec photos, services, avis clients, géolocalisation\n- Commission MALLOULIAUTO uniquement sur leads convertis (pas d''abonnement initial)\n\n## Quantifiable benefit\n- +5 à +15 leads qualifiés par mois selon zone\n- Diagnostic en 10 minutes au lieu de 30 minutes\n- Conversion devis → réparation : +20% grâce aux explications IA',
  true,
  1
),
(
  'value_prop_insurance',
  'Value Proposition — Insurance companies',
  E'# Value Proposition — Insurance companies\n\n## Buyer\nDirection des sinistres / Direction technique chez STAR, COMAR, GAT, Maghrebia, Comar Vie, AMI, etc.\n\n## Pain points\n- Inspections d''expertise lentes (3–7 jours) → mécontentement client + immobilisation véhicule\n- Fraude estimée à 15% du volume de sinistres → pertes annuelles significatives\n- Manque d''objectivité dans l''évaluation des dommages → litiges fréquents avec assurés\n- Coûts d''expertise externes élevés (200–500 TND par dossier)\n- Difficulté à industrialiser sur le portefeuille auto en croissance\n\n## What MALLOULIAUTO offers\n- **IA Vision MALLOULIAUTO** : inspection photo 360° en moins de 5 minutes, score de fiabilité automatique\n- **Détection de fraude** intégrée (incohérences photo, dommages préexistants, surévaluation)\n- **Workflow assureur** complet : déclaration → expertise → devis garage partenaire → règlement\n- API d''intégration au système de gestion sinistres existant\n- Tableau de bord temps réel avec KPIs (délai moyen, taux de fraude détectée, coût moyen)\n\n## Quantifiable benefit\n- Délai d''expertise : 3–7 jours → moins de 24h\n- Coût par dossier : -40% à -60%\n- Détection précoce des cas suspects → -10% à -15% sur les pertes sinistres',
  true,
  1
)
ON CONFLICT DO NOTHING;

-- 059
UPDATE public.agent_knowledge
SET content = REPLACE(
  content,
  'cal.com/mallouliauto',
  'calendar.zoho.com (réservation démo)'
),
version = version + 1
WHERE category = 'voice'
  AND content LIKE '%cal.com/mallouliauto%';

-- ─── agent_jobs (055) ──────────────────────────────────────────────

create table if not exists public.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type public.agent_job_type not null,
  status public.agent_job_status not null default 'queued',
  input jsonb not null default '{}',            -- job-specific params (segment, prospect_id, etc.)
  output jsonb null,
  error text null,
  attempts int not null default 0,
  max_attempts int not null default 3,
  started_at timestamp null,
  completed_at timestamp null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create index if not exists idx_agent_jobs_status_created
  on public.agent_jobs (status, created_at) where status = 'queued';
create index if not exists idx_agent_jobs_created_at on public.agent_jobs (created_at desc);
create index if not exists idx_agent_jobs_type_status on public.agent_jobs (job_type, status);

alter table public.agent_jobs enable row level security;

drop trigger if exists trg_agent_jobs_updated on public.agent_jobs;
create trigger trg_agent_jobs_updated
  before update on public.agent_jobs
  for each row execute function public.agent_jobs_update_timestamp();

-- ─── agent_discovery_segments / agent_discovery_sources (056) ──────

create table if not exists public.agent_discovery_segments (
  slug text primary key,
  label_fr text not null,
  description_fr text not null,  -- used in the Claude system prompt to describe what to search for
  search_hints text,             -- extra search strategy hints injected into the prompt
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_agent_discovery_segments_updated_at on public.agent_discovery_segments;
create trigger set_agent_discovery_segments_updated_at
  before update on public.agent_discovery_segments
  for each row execute function public.set_updated_at_now();

alter table public.agent_discovery_segments enable row level security;

create table if not exists public.agent_discovery_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  description_fr text not null,
  segments text[] not null default '{}',          -- relevant segments (empty = all)
  source_type text not null default 'discovery',  -- 'discovery' | 'enrichment' | 'both'
  priority integer not null default 5 check (priority >= 1 and priority <= 10),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_agent_discovery_sources_updated_at on public.agent_discovery_sources;
create trigger set_agent_discovery_sources_updated_at
  before update on public.agent_discovery_sources
  for each row execute function public.set_updated_at_now();

create index if not exists idx_agent_discovery_sources_type_enabled
  on public.agent_discovery_sources (source_type, enabled);

alter table public.agent_discovery_sources enable row level security;

-- Seeds (056)
INSERT INTO public.agent_discovery_segments (slug, label_fr, description_fr, search_hints, sort_order) VALUES
  ('insurance', 'Assurance',
   'Compagnies d''assurance automobile (assurance auto, responsabilité civile, tous risques, assurance flotte)',
   'Chercher sur le site de la FTUSA (Fédération Tunisienne des Sociétés d''Assurance), les comparateurs d''assurance tunisiens, et les annuaires professionnels.',
   1),
  ('garage', 'Garage',
   'Garages automobiles, ateliers de réparation, centres de service agréés, carrosseries, centres de contrôle technique',
   'Chercher les garages agréés par les constructeurs (Renault, Peugeot, Hyundai, Kia), les réseaux de réparation rapide, et les annuaires automobiles tunisiens.',
   2),
  ('dealer', 'Concessionnaire',
   'Concessionnaires automobiles, revendeurs agréés de véhicules neufs et occasions, showrooms',
   'Chercher les représentants officiels des marques en Tunisie, les sites de vente automobile tunisiens (Tayara, Automobile.tn).',
   3),
  ('fleet', 'Flotte',
   'Gestionnaires de flottes automobiles, sociétés de leasing, agences de location de voitures, entreprises de transport',
   'Chercher les sociétés de leasing tunisiennes (Tunisie Leasing, ATL, CIL), les agences de location (Hertz, Avis, locales), et les entreprises de transport.',
   4)
ON CONFLICT (slug) DO NOTHING;

-- The sources table has no natural key, so ON CONFLICT never fires: seed only once.
do $seed$
begin
  if not exists (select 1 from public.agent_discovery_sources) then
    INSERT INTO public.agent_discovery_sources (name, url, description_fr, segments, source_type, priority) VALUES
      -- Discovery sources (general)
      ('Pages Jaunes Tunisie', 'https://www.pagesjaunes.tn',
       'Annuaire professionnel tunisien — recherche par catégorie et ville',
       '{}', 'both', 8),
      ('Tunisie Annuaire', 'https://www.tunisie-annuaire.com',
       'Annuaire d''entreprises tunisiennes classées par secteur',
       '{}', 'both', 7),
      ('LinkedIn', 'https://www.linkedin.com',
       'Réseau professionnel — pages entreprises et profils de dirigeants',
       '{}', 'both', 9),
      ('Registre du Commerce', NULL,
       'Registre National des Entreprises (RNE) — informations légales et dirigeants',
       '{}', 'enrichment', 6),
    
      -- Insurance-specific
      ('FTUSA', 'https://www.ftusanet.org',
       'Fédération Tunisienne des Sociétés d''Assurance — liste officielle des compagnies membres',
       '{insurance}', 'discovery', 10),
      ('Comparateurs assurance TN', NULL,
       'Sites comparateurs d''assurance tunisiens (Mon Assurance, Assurances.tn)',
       '{insurance}', 'discovery', 6),
    
      -- Garage-specific
      ('Annuaires garages agréés', NULL,
       'Listes de garages agréés par constructeur (Renault, Peugeot, Hyundai, Kia, Citroën)',
       '{garage}', 'discovery', 8),
      ('Fédération Nationale Auto', NULL,
       'Syndicat et fédérations des garagistes tunisiens',
       '{garage}', 'discovery', 7),
    
      -- Dealer-specific
      ('Tayara Auto', 'https://www.tayara.tn/vehicles',
       'Marketplace tunisienne — concessionnaires actifs et annonces automobiles',
       '{dealer}', 'discovery', 7),
      ('Automobile.tn', 'https://www.automobile.tn',
       'Portail automobile tunisien — liste des concessionnaires et marques',
       '{dealer}', 'discovery', 8),
    
      -- Fleet-specific
      ('Association Leasing TN', NULL,
       'Association Professionnelle des Sociétés de Leasing en Tunisie',
       '{fleet}', 'discovery', 9),
      ('Annuaire Location', NULL,
       'Agences de location de voitures en Tunisie (nationales et internationales)',
       '{fleet}', 'discovery', 7),
    
      -- Enrichment-specific
      ('Sites entreprises', NULL,
       'Visiter le site web officiel de l''entreprise pour trouver l''organigramme, page contact, et mentions légales',
       '{}', 'enrichment', 10),
      ('Google Maps', 'https://maps.google.com',
       'Fiche Google Business — numéro de téléphone, horaires, avis',
       '{}', 'enrichment', 7),
      ('Societe.com Tunisie', NULL,
       'Informations légales, dirigeants, et données financières des entreprises tunisiennes',
       '{}', 'enrichment', 8);
  end if;
end
$seed$;

-- ─── agent_chat_sessions (058) ─────────────────────────────────────

create table if not exists public.agent_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,                       -- client-generated session ID (per browser tab)
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  detected_segment text null,
  tokens_input int null,
  tokens_output int null,
  cost_usd numeric(8,4) null,
  ip_hash text null,                              -- SHA-256 of IP + salt (never the raw IP)
  metadata jsonb null,
  created_at timestamp not null default now()
);

create index if not exists idx_chat_sessions_session_id on public.agent_chat_sessions (session_id);
create index if not exists idx_chat_sessions_created_at on public.agent_chat_sessions (created_at);

alter table public.agent_chat_sessions enable row level security;
