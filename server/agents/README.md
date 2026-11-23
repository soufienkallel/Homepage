# @mallouliauto/agents

AI-powered content generation agents for MALLOULIAUTO. Implements a **Marketing Agent** and a **Sales Agent**, both powered by Claude (Anthropic) with automated guardrails and human-in-the-loop approval.

## Purpose

Automate B2B marketing and sales outreach for the Tunisian automotive SaaS platform:

- **Marketing Agent** — generates publish-ready social media posts (LinkedIn, Facebook, Instagram) in French and Arabic, complete with branded OG images.
- **Sales Agent** — generates 3-touch outbound sequences (cold email → LinkedIn DM → WhatsApp) per prospect, with segment-specific value propositions and demo-booking CTAs.

All content is draft-only — reviewed by a human before publishing/sending.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Admin UI (Expo)                        │
│   apps/unified/app/admin/                                │
│   ├── marketing-drafts.tsx  (marketing review)           │
│   ├── sales-drafts.tsx      (sales review)               │
│   ├── sales-prospects.tsx   (prospect management)        │
│   ├── knowledge.tsx         (knowledge base editor)      │
│   └── discovery-config.tsx  (discovery config)           │
└──────────────┬───────────────────────────┬───────────────┘
               │ POST /run, /approve,      │ GET /drafts,
               │ /correct, /discover,      │ /prospects,
               │ /enrich                   │ /jobs
               ▼                           ▼
┌──────────────────────────────────────────────────────────┐
│              Vercel API Endpoints                        │
│           apps/api/agents/                               │
│   ├── campaigns.ts    (campaign scope CRUD)              │
│   ├── knowledge.ts    (knowledge base CRUD)              │
│   ├── marketing/                                         │
│   │   ├── run.ts         (trigger marketing agent)       │
│   │   ├── drafts.ts      (list drafts by status)         │
│   │   ├── approve.ts     (approve/reject a draft)        │
│   │   ├── correct.ts     (AI correction of a draft)      │
│   │   └── og-image.tsx   (render OG image as PNG)        │
│   └── sales/                                             │
│       ├── run.ts         (generate 3-touch sequence)     │
│       ├── drafts.ts      (list sales drafts)             │
│       ├── approve.ts     (approve/reject sales draft)    │
│       ├── correct.ts     (AI correction of sales draft)  │
│       ├── prospects.ts   (list prospects)                │
│       ├── prospects-import.ts (CSV / seed import)        │
│       ├── discover.ts    (queue discovery job)           │
│       ├── enrich.ts      (queue enrichment job)          │
│       ├── worker.ts      (process queued jobs)           │
│       ├── jobs.ts        (list/cancel async jobs)        │
│       └── discovery-config.ts (segments & sources CRUD)  │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│            @mallouliauto/agents (this package)            │
│                                                          │
│  shared/                                                 │
│  ├── claude-client.ts    Claude SDK wrapper + cost calc   │
│  ├── guardrails.ts       Content policy enforcement       │
│  ├── knowledge.ts        Supabase KB loader + fallback    │
│  ├── supabase.ts         Supabase service-role client     │
│  └── types.ts            Zod schemas + TypeScript types   │
│                                                          │
│  marketing/                                              │
│  ├── runner.ts           Orchestrates a full agent run    │
│  ├── retry.ts            Self-correction loop             │
│  ├── image-validator.ts  Puppeteer image validation       │
│  ├── system-prompt-text.ts  Claude system prompt          │
│  ├── system-prompt.md    Readable copy (documentation)    │
│  └── tools.ts            DB read/write + guardrail pipe   │
│                                                          │
│  sales/                                                  │
│  ├── runner.ts           3-touch sequence orchestrator    │
│  ├── tools.ts            Prospect CRUD + draft save       │
│  ├── csv-import.ts       Zod-validated CSV parser         │
│  ├── discovery.ts        Claude web_search prospecting    │
│  ├── enrichment.ts       Contact enrichment via web       │
│  └── system-prompt-text.ts  Sales system prompt           │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                        │
│   ├── agent_runs          — execution log (tokens, cost) │
│   ├── agent_drafts        — generated content + status   │
│   ├── agent_prospects     — sales prospects              │
│   ├── agent_campaigns     — campaign scope presets       │
│   ├── agent_knowledge     — dynamic knowledge base       │
│   ├── agent_jobs          — async job queue              │
│   ├── agent_discovery_segments — discovery config        │
│   └── agent_discovery_sources  — source config           │
└──────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Trigger a Run

A run is triggered via the admin UI ("Générer" button) or directly via `POST /api/agents/marketing/run`. The runner:

1. Checks the daily draft cap (default 50) to control costs
2. Creates an `agent_runs` row in Supabase for audit/tracing
3. Loads the knowledge base (company info, brand voice, proof points)
4. Fetches recent drafts to avoid topic repetition
5. Calls Claude with the system prompt + user context
6. Parses the JSON array of drafts from Claude's response

### 2. Guardrails

Every generated draft passes through automated guardrails before being saved:

| Rule | Action |
|------|--------|
| No emojis | **Block** |
| No third-party vendor names (PAVE, DeepSeek, etc.) | **Block** |
| French accents required (`Véhicule`, not `Vehicule`) | **Block** |
| URL whitelist (only `mallouliauto.com`, `cal.com`, `wa.me`) | **Block** |
| Body length within channel limits | **Warn** |
| `#MALLOULIAUTO` hashtag present | **Warn** |

Drafts that fail a blocking rule are saved with status `rejected`. Passing drafts get status `pending_review`.

### 3. Feedback Loop (Self-Correction)

When a draft is blocked by guardrails, the runner automatically **retries** by feeding the error reasons back to Claude:

1. The `blocked_reasons` array is sent to Claude with the original draft
2. Claude fixes only the violations (preserves original intent/style)
3. The corrected draft is re-validated through guardrails
4. Max **2 retries** per draft to control costs
5. If all retries fail, the draft remains `rejected`

This recovers ~60-80% of blocked drafts without human intervention.

**Image validation** (opt-in via `AGENT_VALIDATE_IMAGES=true`):
- After a draft passes guardrails, its `image_html` is rendered via Puppeteer
- If rendering fails (bad HTML, overflow, empty output), triggers the retry loop with `image_render_failed` as the error reason
- Adds ~2-3s per draft due to Puppeteer cold start

Retry uses a cheaper model (`ANTHROPIC_MODEL_RETRY`, defaults to the main model if unset) to minimize cost overhead.

### 4. Human Review

The admin reviews drafts at `/admin/marketing-drafts`:

- **Filter** by status: pending, approved, rejected
- **Preview** post body, hashtags, pillar, and OG image
- **Approve** — moves to `approved` status
- **Reject** — with optional reason, moves to `rejected`
- **Copy** — copies post text to clipboard for publishing
- **Download** — downloads the rendered OG image as PNG

### 5. OG Image Rendering

Each draft includes an `image_html` field — a complete HTML document with channel-specific dimensions (1200×630 for LinkedIn, 1080×1080 for Instagram/Facebook). The `/api/agents/marketing/og-image` endpoint renders it to PNG via Puppeteer (`puppeteer-core` + `@sparticuz/chromium`), automatically selecting the viewport size based on the draft's channel. Images follow strict brand guidelines (colors, compass-rose logo, wordmark).

## Content Strategy

The agent rotates across **5 content pillars**:

1. **Product education** — explain a MALLOULIAUTO feature
2. **Customer story** — realistic Tunisian scenario
3. **Market data** — industry facts from the proof file
4. **Partner ecosystem** — highlight the garage/insurer network
5. **Recruitment** — attract talent to build automotive AI in Tunisia

Channels: LinkedIn, Facebook, Instagram  
Languages: French (primary), Arabic (secondary)

## Usage

### Admin UI

Start the unified app and navigate to the admin screen:

```bash
cd apps/unified
npx expo start --web --port 8080 --clear
# Open http://localhost:8080/admin/marketing-drafts
```

### Local Smoke Test

```bash
npx tsx --env-file .env scripts/test-marketing-agent.ts
```

### API Endpoints

All endpoints require `Authorization: Bearer <AGENT_ADMIN_TOKEN>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/agents/marketing/run` | Trigger a generation run (with campaign scope) |
| `GET` | `/api/agents/marketing/drafts?status=pending_review` | List drafts by status |
| `POST` | `/api/agents/marketing/approve` | Approve or reject a draft |
| `POST` | `/api/agents/marketing/correct` | Human-initiated correction (text + images) |
| `GET` | `/api/agents/marketing/og-image?draftId=...` | Render OG image as PNG |

#### Trigger a Run (with Campaign Scope)

```bash
curl -X POST https://mallouliauto-api.vercel.app/api/agents/marketing/run \
  -H "Authorization: Bearer $AGENT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "draftCount": 5,
    "channels": ["linkedin", "facebook"],
    "languages": ["fr", "ar"],
    "segment": "insurance",
    "objective": "awareness",
    "pillars": ["product_education", "customer_story"]
  }'
```

Response:
```json
{
  "run_id": "uuid",
  "drafts_created": 5,
  "drafts_blocked": 0,
  "drafts_retried": 1,
  "drafts_recovered": 1,
  "tokens_input": 4200,
  "tokens_output": 8500,
  "retry_tokens_input": 800,
  "retry_tokens_output": 1200,
  "cost_usd": 0.14,
  "retry_cost_usd": 0.02,
  "model": "claude-sonnet-4-5"
}
```

#### Approve / Reject

```bash
curl -X POST https://mallouliauto-api.vercel.app/api/agents/marketing/approve \
  -H "Authorization: Bearer $AGENT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": "draft-uuid", "action": "approve"}'
```

#### Correct a Draft

Human-initiated correction — provide instructions and optional reference images:

```bash
curl -X POST https://mallouliauto-api.vercel.app/api/agents/marketing/correct \
  -H "Authorization: Bearer $AGENT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "draft-uuid",
    "instructions": "Le texte est trop long, raccourcir à 3 phrases. Ajouter le logo en bas."
  }'
```

Response includes the corrected draft, retry attempts, and cost breakdown.

## Campaign Scope

The admin UI provides a campaign configuration modal before each run. Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `segment` | string | Target audience: `all`, `insurance`, `garage`, `dealer`, `fleet`, `b2c` |
| `objective` | string | Content goal: `awareness`, `lead_gen`, `conversion`, `engagement`, `recruitment` |
| `channels` | string[] | Platforms: `linkedin`, `facebook`, `instagram` |
| `languages` | string[] | Content language: `fr`, `ar` |
| `pillars` | string[] | Content themes: `product_education`, `customer_story`, `market_data`, `partner_ecosystem`, `recruitment` |
| `draftCount` | number | Number of drafts (1–15) |

Campaign presets can be saved in the `agent_campaigns` table (migration 046).

## OG Image Rendering

Images are rendered via Puppeteer in a Vercel serverless function. Key features:

- **Brand asset injection** — `{{MALLOULIAUTO_LOGO}}` and `{{MALLOULIAUTO_ICON}}` placeholders replaced with SVG data URIs
- **Arabic font support** — Noto Sans Arabic embedded as base64 `@font-face` when Arabic characters detected
- **RTL fix** — `dir="rtl"` moved to inner div for Chrome headless compatibility
- **Fallback rendering** — blank results (<10KB) trigger sanitized re-render (strips `backdrop-filter`)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `ANTHROPIC_MODEL_DRAFT` | No | Model for generation (default: `claude-sonnet-4-5`) |
| `ANTHROPIC_MODEL_RETRY` | No | Model for retry corrections (default: same as DRAFT; use `claude-haiku-4-5` for lower cost) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service-role key (server-only) |
| `AGENT_ADMIN_TOKEN` | Yes | Bearer token for API authentication |
| `AGENT_DAILY_DRAFT_CAP` | No | Max drafts per day (default: 50) |
| `AGENT_VALIDATE_IMAGES` | No | Set to `true` to enable Puppeteer image validation on each draft |
| `EXPO_PUBLIC_API_BASE_URL` | No | API base URL for the admin UI |
| `EXPO_PUBLIC_AGENT_ADMIN_TOKEN` | No | Token exposed to the admin UI client |

## Cost Control

- **Daily cap**: configurable via `AGENT_DAILY_DRAFT_CAP` (default 50)
- **Cost tracking**: every run records `tokens_input`, `tokens_output`, and `cost_usd` in the `agent_runs` table (includes retry costs)
- **Retry cost isolation**: run results expose `retry_tokens_input`, `retry_tokens_output`, `retry_cost_usd` separately so you can monitor retry overhead
- **Retry model**: set `ANTHROPIC_MODEL_RETRY=claude-haiku-4-5` to use a 3× cheaper model for corrections
- **Model selection**: use `ANTHROPIC_MODEL_DRAFT` to switch between Sonnet (higher quality) and Haiku (lower cost)
- **Batch size**: `draftCount` parameter controls how many drafts per run
- **Retry cap**: max 2 retries per draft — diminishing returns beyond that

## Database Tables

### `agent_runs`

Tracks each agent execution for audit and cost monitoring.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `agent_type` | text | `marketing` or `sales` |
| `trigger` | text | `cron`, `manual`, or `api` |
| `status` | text | `success` or `failed` |
| `input` | jsonb | Run parameters |
| `output_summary` | jsonb | Result summary |
| `tokens_input` | int | Input tokens consumed |
| `tokens_output` | int | Output tokens consumed |
| `cost_usd` | numeric | Computed cost in USD |
| `duration_ms` | int | Execution time |
| `error` | text | Error message (if failed) |

### `agent_drafts`

Stores generated content with review lifecycle.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `agent_type` | text | `marketing` or `sales` |
| `channel` | text | `linkedin`, `facebook`, `instagram`, `email`, `linkedin_dm`, `whatsapp` |
| `language` | text | `fr` or `ar` |
| `status` | text | `pending_review`, `approved`, `rejected`, `published` |
| `content` | jsonb | Body, hashtags, image_html, pillar |
| `guardrails` | jsonb | Pass/fail report with reasons |
| `run_id` | UUID | FK to `agent_runs` |
| `reject_reason` | text | Human-provided rejection reason |
| `approved_at` | timestamptz | Approval timestamp |

### `agent_prospects`

Sales prospects with lifecycle tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `segment` | text | `insurance`, `garage`, `dealer`, `fleet`, `b2c` |
| `company` | text | Company name |
| `contact_name` | text | Decision-maker name |
| `role` | text | Job title |
| `email` | text | Email address |
| `linkedin_url` | text | LinkedIn profile URL |
| `whatsapp_e164` | text | WhatsApp number (E.164 format) |
| `language` | text | `fr` or `ar` |
| `city` | text | City in Tunisia |
| `source` | text | `csv`, `seed`, `ai_discovery`, `ai_discovery+enriched` |
| `status` | text | `new`, `sequence_generated`, `in_progress`, `replied`, `demo_booked`, `won`, `lost`, `unsubscribed` |
| `last_touch_at` | timestamptz | Last outreach timestamp |

### `agent_campaigns`

Reusable campaign scope presets.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | text | Campaign name |
| `segment` | text | Target segment |
| `channels` | text[] | Target channels |
| `languages` | text[] | Content languages |
| `objective` | text | Campaign objective |
| `pillars` | text[] | Content pillars |

### `agent_knowledge`

Dynamic knowledge base entries (editable via admin UI).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `category` | text | `company`, `voice`, `proof`, `value_prop_*` |
| `title` | text | Human-readable label |
| `content` | text | Markdown content injected into prompts |
| `is_active` | boolean | Active flag |
| `version` | int | Version counter |

### `agent_jobs`

Async job queue for discovery and enrichment.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `job_type` | enum | `discover`, `enrich`, `enrich_batch` |
| `status` | enum | `queued`, `running`, `completed`, `failed` |
| `payload` | jsonb | Input parameters (segment, prospect_id, etc.) |
| `output` | jsonb | Result data (discovered prospects, enrichment data) |
| `error` | text | Error message if failed |
| `attempts` | int | Number of execution attempts (max 3) |
| `created_at` | timestamptz | Job creation time |
| `updated_at` | timestamptz | Last status change (used for stuck-job detection) |

### `agent_discovery_segments` / `agent_discovery_sources`

Dynamic configuration for AI prospect discovery and enrichment. See spec §14.

## Knowledge Base

Brand knowledge files are in `src/shared/knowledge/`:

| File | Content |
|------|---------|
| `company.md` | Mission, dual AI, B2B-first model, Tunisian market |
| `voice.md` | Tone rules, banned words, accent checklist, CTA style |
| `proof.md` | Verified stats and facts (no fabrication allowed) |
| `value-props/insurance.md` | Pain points + MALLOULIAUTO benefits for insurers |
| `value-props/garage.md` | Pain points + benefits for independent garages |
| `value-props/dealer.md` | Pain points + benefits for car dealers |
| `value-props/fleet.md` | Pain points + benefits for fleet operators |
| `value-props/b2c.md` | Pain points + benefits for individual drivers |

Editable via `/admin/knowledge` UI in the unified app.

---

## Sales Agent

### Overview

The Sales Agent uses Claude with `web_search` (server-side tool) to discover new B2B prospects and enrich existing ones with real-time web data. Because Claude web_search can take 2–4 minutes per request (multiple search turns), the pipeline uses an **async job queue** to avoid HTTP timeouts.

### Prospect Lifecycle

```
CSV Import / AI Discovery → new → enriched → sequence_generated → contacted
```

| Status | Meaning |
|--------|---------|
| `new` | Imported or discovered, not yet enriched |
| `enriched` | Claude found contact details, revenue estimates, decision-makers |
| `sequence_generated` | Outreach sequence generated (3-touch: email → LinkedIn → WhatsApp) |
| `contacted` | Outreach initiated |
| `replied` | Prospect responded to outreach |
| `demo_booked` | Demo scheduled |
| `won` | Conversion successful |
| `lost` | Prospect disqualified |
| `unsubscribed` | Prospect opted out |

**What does "enriched" mean?**

A prospect starts as `new` — typically just a company name and segment from CSV import or AI discovery. **Enrichment** is the process where Claude uses `web_search` to find additional real-world information:

- **Contact details** — email addresses, phone numbers, LinkedIn profiles of decision-makers
- **Company info** — estimated revenue, employee count, office locations
- **Decision-makers** — names and roles of key people (CEO, fleet manager, claims director)
- **Pain points** — industry-specific challenges identified from web presence
- **Digital footprint** — website quality, social media activity, recent news/press mentions

Once enrichment completes, the prospect has enough data to craft a personalized outreach sequence (cold email → LinkedIn DM → WhatsApp).

### Async Job Queue Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   SALES AGENT — ASYNC PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐     HTTP 202      ┌─────────────────┐                  │
│  │  Admin UI   │ ─────────────────► │  Queue Endpoint │                  │
│  │  or API     │  (instant return)  │  (discover.ts / │                  │
│  │  client     │                    │   enrich.ts)    │                  │
│  └──────┬──────┘                    └───────┬─────────┘                  │
│         │                                   │                            │
│         │ polls /jobs                       │ INSERT into agent_jobs     │
│         │                                   ▼                            │
│         │                          ┌─────────────────┐                   │
│         │                          │   Supabase DB   │                   │
│         │                          │  (agent_jobs)   │                   │
│         │                          └───────┬─────────┘                   │
│         │                                  │                             │
│         │                          picks queued jobs                      │
│         │                                  │                             │
│         │                          ┌───────▼─────────┐                   │
│         └──────────────────────────│    Worker       │                   │
│              status updates        │  (worker.ts)    │                   │
│                                    │  5-min cron     │                   │
│                                    │  maxDuration:   │                   │
│                                    │  300s           │                   │
│                                    └───────┬─────────┘                   │
│                                            │                             │
│                                    Claude web_search                      │
│                                    (8 turns discover,                     │
│                                     6 turns enrich)                       │
│                                            │                             │
│                                            ▼                             │
│                                    ┌─────────────────┐                   │
│                                    │ agent_prospects  │                   │
│                                    │ (enriched data)  │                   │
│                                    └─────────────────┘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- **Instant HTTP 202**: `discover.ts` and `enrich.ts` only insert a row into `agent_jobs` and return immediately — no timeout risk
- **Worker processes sequentially**: Picks one queued job at a time, marks it `running`, executes Claude, marks `completed`/`failed`
- **Stuck-job recovery**: If a job stays `running` for >10 minutes (worker killed at 300s), the next worker invocation resets it to `queued` for retry
- **Max 3 attempts**: Jobs that fail 3 times are marked `failed` permanently
- **Cron every 5 min**: Vercel cron calls the worker endpoint automatically (requires Pro plan)

#### Job Types

| Type | Description | Typical Duration |
|------|-------------|------------------|
| `discover` | Find new prospects in a segment/city using web_search | ~240s (8 search turns) |
| `enrich` | Enrich a single prospect with contact info, revenue, decision-makers | ~130s (6 search turns) |
| `enrich_batch` | Enrich multiple prospects in one job | N × ~130s |

### How It Works

1. **Import prospects** — via CSV upload (`POST /api/agents/sales/prospects-import`) or seed data
2. **Discover prospects** — AI-powered web search via Claude `web_search` tool (`POST /api/agents/sales/discover`)
3. **Enrich prospects** — find contact details via Claude web search (`POST /api/agents/sales/enrich`)
4. **Generate sequences** — `POST /api/agents/sales/run { prospect_id }` produces a 3-touch outbound sequence:
   - **Day 0**: Cold email (≤120 words)
   - **Day 3**: LinkedIn DM (≤60 words)
   - **Day 7**: WhatsApp message (≤40 words)
5. **Review & approve** — admin reviews at `/admin/sales-drafts`

### Sales API Endpoints

All endpoints require `Authorization: Bearer <AGENT_ADMIN_TOKEN>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/agents/sales/run` | Generate 3-touch sequence `{ prospect_id }` |
| `GET` | `/api/agents/sales/drafts?status=pending_review` | List sales drafts |
| `POST` | `/api/agents/sales/approve` | Approve or reject `{ id, action, reject_reason? }` |
| `POST` | `/api/agents/sales/correct` | AI correction `{ id, instructions }` |
| `GET` | `/api/agents/sales/prospects?segment=&status=&enriched=` | List prospects |
| `POST` | `/api/agents/sales/prospects-import` | Import CSV or seed data |
| `POST` | `/api/agents/sales/discover` | Queue discovery `{ segment, city?, count? }` |
| `POST` | `/api/agents/sales/enrich` | Queue enrichment `{ prospect_id }` or `{ segment?, batch_size? }` |
| `POST` | `/api/agents/sales/worker` | Process queued jobs (cron) |
| `GET/DELETE` | `/api/agents/sales/jobs` | List or cancel async jobs |
| `GET/POST/PUT/DELETE` | `/api/agents/sales/discovery-config` | CRUD for segments & sources |

### Shared Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PATCH/DELETE` | `/api/agents/campaigns` | Campaign scope presets CRUD |
| `GET/POST/PATCH/DELETE` | `/api/agents/knowledge` | Knowledge base entries CRUD |

### CSV Import Format

The prospects CSV import endpoint accepts semicolon (`;`) or comma (`,`) delimited files. The first row **must** be a header. Delimiter is auto-detected from the header row.

**Header columns:**

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| `segment` | **Yes** | enum | `insurance`, `garage`, `dealer`, `fleet`, or `b2c` |
| `company` | **Yes** | string | Company name |
| `contact_name` | No | string | Contact person full name |
| `role` | No | string | Job title / role |
| `email` | No | email | Contact email (validated) |
| `linkedin_url` | No | URL | LinkedIn profile URL |
| `whatsapp_e164` | No | E.164 | WhatsApp number (e.g. `+21612345678`) |
| `language` | **Yes** | enum | `fr` (default), `ar`, or `en` |
| `city` | No | string | City name |
| `notes` | No | string | Free-text notes |

**Minimal CSV example** (only required + useful columns):

```csv
segment;company;contact_name;role;email;language;city
dealer;Kia Sfax;Safouane Daoud;;;fr;Sfax
insurance;STAR Assurances;Ahmed Ben Ali;DG;ahmed@star.tn;fr;Tunis
garage;AutoFix Sousse;Mohamed Trabelsi;Gérant;m.trabelsi@autofix.tn;fr;Sousse
fleet;Tunisie Télécom;;DSI;;fr;Tunis
```

**Full CSV example** (all columns):

```csv
segment;company;contact_name;role;email;linkedin_url;whatsapp_e164;language;city;notes
dealer;Kia Sfax;Safouane Daoud;Directeur Commercial;s.daoud@kia-sfax.tn;https://linkedin.com/in/sdaoud;+21698765432;fr;Sfax;Concessionnaire Kia région sud
insurance;GAT Assurances;Fatma Gharbi;Responsable Sinistres;f.gharbi@gat.tn;;;fr;Tunis;Groupe Africa Takaful
garage;Garage Ben Amor;;;;;;;;Spécialiste Peugeot et Citroën
```

> **Note**: Empty columns must still have their delimiters. For example, a row with only `segment`, `company`, and `city` filled must include the correct number of semicolons for the skipped columns.

**Three ways to send the CSV:**

```bash
# 1. JSON body with csv field
curl -X POST .../api/agents/sales/prospects-import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"csv": "segment;company;contact_name;role;email;language;city\ndealer;Kia Sfax;Safouane Daoud;;;fr;Sfax"}'

# 2. Raw CSV body
curl -X POST .../api/agents/sales/prospects-import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: text/csv" \
  --data-binary @prospects.csv

# 3. Seed data (51 pre-built Tunisian B2B prospects)
curl -X POST .../api/agents/sales/prospects-import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seed": true}'
```

**Duplicate handling**: If a batch insert hits a unique constraint (e.g. same email), the endpoint falls back to one-by-one inserts — duplicates are silently skipped and counted in the `skipped` field of the response.

**Response format:**

```json
{
  "imported": 1,
  "skipped": 0,
  "errors": []
}
```

### Usage Examples

```bash
# Import Tunisian seed data (51 real B2B prospects)
curl -X POST https://mallouliauto-api.vercel.app/api/agents/sales/prospects-import \
  -H "Authorization: Bearer $AGENT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seed": true}'

# Discover new insurance prospects in Tunis
curl -X POST https://mallouliauto-api.vercel.app/api/agents/sales/discover \
  -H "Authorization: Bearer $AGENT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"segment": "insurance", "city": "Tunis", "count": 5}'
# → Returns: { "job_id": "uuid", "status": "queued" }

# Enrich a specific prospect
curl -X POST https://mallouliauto-api.vercel.app/api/agents/sales/enrich \
  -H "Authorization: Bearer $AGENT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prospect_id": "uuid-of-prospect"}'

# Trigger the worker manually (process queued jobs now)
curl -X POST https://mallouliauto-api.vercel.app/api/agents/sales/worker \
  -H "Authorization: Bearer $AGENT_ADMIN_TOKEN"

# Check job status
curl https://mallouliauto-api.vercel.app/api/agents/sales/jobs?id=JOB_UUID \
  -H "Authorization: Bearer $AGENT_ADMIN_TOKEN"
# → Returns: { "job": { "status": "completed", "output": {...}, "attempts": 1 } }

# List all prospects in a segment
curl "https://mallouliauto-api.vercel.app/api/agents/sales/prospects?segment=insurance&limit=10" \
  -H "Authorization: Bearer $AGENT_ADMIN_TOKEN"
```

### Admin UI

The prospects admin panel is at `/admin/sales-prospects` in the unified app:

- View all prospects with segment/status filters and search
- Import prospects from CSV or seed Tunisian data
- Trigger AI discovery for any segment
- Trigger enrichment (single or batch)
- Monitor job queue (running/queued/completed/failed counts with 10s polling)
- Manual "Traiter" button to invoke the worker immediately

### Dynamic Configuration (`/admin/discovery-config`)

Segments and enrichment sources are **fully dynamic** — stored in Supabase and editable via the admin UI:

- **Segments tab**: Add/edit/disable discovery segments (e.g. insurance, garage, dealer, fleet). Each segment has a description and optional search hints used in the Claude prompt.
- **Sources tab**: Add/edit/disable research sources (e.g. FTUSA, LinkedIn, Google Maps). Each source has a type (`discovery`, `enrichment`, or `both`), priority (1-10), and optional segment filter.
- Changes take effect immediately — no code deploy required.
