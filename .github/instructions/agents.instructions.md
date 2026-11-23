---
applyTo: '**'
---

# MALLOULIAUTO Agent Instructions

> **Purpose**: This document defines the prompt frameworks, workflows, and implementation rules that AI agents must follow when working on MALLOULIAUTO projects.

---

## 1. AGENT WORKFLOW

Before executing any task, agents MUST follow this workflow:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT WORKFLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CLASSIFY TASK                                               │
│     └─► Analysis | Design | Implementation                       │
│                                                                  │
│  2. SELECT FRAMEWORK                                            │
│     └─► CRISPE (Analysis) | ToT (Design) | RACE (Implementation)│
│                                                                  │
│  3. FORMULATE PROMPT                                            │
│     └─► Fill all framework components with user                  │
│                                                                  │
│  4. VALIDATE SCOPE                                              │
│     └─► Iterate until all aspects are collected                  │
│                                                                  │
│  5. UPDATE DESIGN DOCS                                          │
│     └─► Create or update design/spec docs BEFORE coding          │
│                                                                  │
│  6. EXECUTE                                                     │
│     └─► Only proceed when prompt is complete                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1 Task Classification

| Task Type | Description | Framework |
|-----------|-------------|-----------|
| **Analysis** | Research, investigation, understanding requirements, audits | CRISPE |
| **Design** | Architecture, UI/UX, system design, problem-solving | ToT |
| **Implementation** | Coding, building, deploying, fixing | RACE |

---

## 2. PROMPT FRAMEWORKS

### 2.1 CRISPE Framework (Analysis Tasks)

Use for: Requirements gathering, audits, research, understanding business logic.

| Component | Description | Questions to Ask |
|-----------|-------------|------------------|
| **C**apacity | What role/expertise is needed? | "What domain expertise is required?" |
| **R**ole | Define the agent's persona | "As what type of expert should I approach this?" |
| **I**nsight | Background context needed | "What existing knowledge/documents are relevant?" |
| **S**tatement | The specific task/question | "What exactly needs to be analyzed?" |
| **P**ersonality | Tone and communication style | "How should findings be presented?" |
| **E**xperiment | Expected output format | "What deliverable is expected?" |

**Example CRISPE Prompt:**
```
[C] Expert in automotive SaaS business models and Tunisian market
[R] Business Analyst for MALLOULIAUTO
[I] Business plan shows 90% B2B revenue (40% Insurance, 30% Garage, 20% Fleet)
[S] Analyze the revenue model sustainability and identify risks
[P] Professional, data-driven, actionable recommendations
[E] Risk matrix with mitigation strategies in table format
```

### 2.2 ToT Framework - Tree of Thoughts (Design Tasks)

Use for: Architecture decisions, UI/UX design, system design, complex problem-solving.

| Component | Description | Questions to Ask |
|-----------|-------------|------------------|
| **Problem** | Clear problem statement | "What problem are we solving?" |
| **Branches** | Multiple solution approaches | "What are 3+ different approaches?" |
| **Evaluation** | Criteria for each branch | "What are pros/cons of each approach?" |
| **Selection** | Choose best path with reasoning | "Which approach best fits constraints?" |
| **Refinement** | Iterate on chosen solution | "How can we improve the selected approach?" |

**Example ToT Process:**
```
PROBLEM: Design authentication flow for technician app

BRANCH 1: Email/Password + OTP
  ├─ Pros: Simple, familiar, low cost
  └─ Cons: Friction, password management

BRANCH 2: Phone Number + SMS OTP
  ├─ Pros: Tunisia-friendly, no password
  └─ Cons: SMS costs, number changes

BRANCH 3: Social Login (Google/Facebook)
  ├─ Pros: One-click, trusted
  └─ Cons: Privacy concerns, dependency

EVALUATION: Tunisia context → Phone is universal, SMS is expected
SELECTION: Branch 2 with fallback to Branch 1
REFINEMENT: Add biometric for returning users
```

### 2.3 RACE Framework (Implementation Tasks)

Use for: Coding, building features, deployments, bug fixes.

| Component | Description | Questions to Ask |
|-----------|-------------|------------------|
| **R**ole | Technical expertise required | "What technical skills are needed?" |
| **A**ction | Specific task to perform | "What exactly needs to be built/fixed?" |
| **C**ontext | Technical constraints and codebase | "What are the technical constraints?" |
| **E**xpectation | Success criteria and deliverables | "What does 'done' look like?" |

**Example RACE Prompt:**
```
[R] Senior React Native + Expo developer with NativeWind expertise
[A] Implement garage booking flow with 5-step wizard
[C] Expo Router, Zustand store, existing UI components in packages/ui
[E] Working booking flow: Vehicle → Problem → Garage → Schedule → Confirm
```

---

## 3. ITERATION PROTOCOL

Agents MUST iterate with the user until ALL framework components are filled:

```
┌─────────────────────────────────────────────────────────────────┐
│                  ITERATION CHECKLIST                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  □ Task type identified (Analysis/Design/Implementation)         │
│  □ Framework selected (CRISPE/ToT/RACE)                         │
│  □ All framework components filled                               │
│  □ Scope boundaries defined                                      │
│  □ Success criteria agreed                                       │
│  □ Constraints documented                                        │
│  □ User confirmed ready to proceed                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Iteration Questions:**
- "Before I proceed, let me confirm the scope..."
- "I need clarification on [component]..."
- "What are the constraints for [aspect]?"
- "How should I handle [edge case]?"
- "Is this understanding correct: [summary]?"

### 3.1 Design Docs Before Implementation (Mandatory)

Agents MUST create or update the relevant design/specification documents **before** writing any implementation code. This ensures traceability, alignment with stakeholders, and a clear record of architectural decisions.

```
┌─────────────────────────────────────────────────────────────────┐
│              DESIGN DOCS CHECKLIST                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  □ Identify the relevant spec/design doc in doc/                 │
│  □ Create a new doc section or update the existing one           │
│  □ Document: what is being changed, why, and how                 │
│  □ Include version bump (e.g. v3.12 → v3.13)                    │
│  □ List affected files, components, and routes                   │
│  □ Document any new status values, types, or data structures     │
│  □ Confirm doc changes with the user before proceeding to code   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Rules:**
- For new features: create or extend the implementation plan / spec document under `doc/`
- For modifications to existing features: update the relevant section with a new version entry
- For bug fixes: document the root cause and fix approach in the spec if it changes expected behavior
- Design doc updates are **not optional** — skipping this step is a workflow violation
- The design doc must be committed alongside (or before) the implementation code

---

## 4. IMPLEMENTATION RULES

### 4.1 Visual & UI Rules

| Rule | DO | DON'T |
|------|-----|-------|
| **Icons** | Use Lucide icons (`lucide-react`, `lucide-react-native`) | ❌ No emojis in code or UI |
| **Colors** | Use brand palette variables | ❌ No hardcoded hex values |
| **Typography** | System fonts, defined scales | ❌ No custom fonts without approval |
| **Spacing** | Tailwind/NativeWind spacing scale | ❌ No arbitrary pixel values |

### 4.2 Brand Colors (Mandatory)

```javascript
// STRICT COLOR PALETTE - Use these exact values
colors: {
  'brand-blue': '#447D9B',    // Primary - trust, technology
  'brand-orange': '#FE7743',  // Secondary - CTAs, accents
  'brand-navy': '#273F4F',    // Text, professional elements
  'brand-gray': '#D7D7D7',    // Backgrounds, borders
  'emerald': '#10B981',       // Success states
}
```

### 4.3 Icon Usage

```tsx
// ✅ CORRECT - Use Lucide icons
import { Shield, Truck, Car, Wrench, Brain, Eye } from 'lucide-react';
<Shield className="w-6 h-6 text-brand-blue" />

// ❌ WRONG - Never use emojis
<span>🚗</span>  // FORBIDDEN
<span>✅</span>  // FORBIDDEN
```

### 4.4 Code Standards

| Aspect | Standard |
|--------|----------|
| **Language** | TypeScript (strict mode) |
| **Styling** | NativeWind (mobile), Tailwind CSS (web) |
| **State** | Zustand with persistence |
| **Navigation** | Expo Router (file-based) |
| **Components** | Functional with hooks |
| **Naming** | PascalCase (components), camelCase (functions/variables) |

### 4.5 Commit Messages

```
feat: Add garage booking flow
fix: Correct navigation on mobile
docs: Update README with API docs
style: Format with prettier
refactor: Simplify store logic
test: Add unit tests for diagnosis
```

### 4.6 French Language — Accents (Mandatory)

All user-facing French text **MUST** include proper accents and diacritics. This applies to UI labels, mock data, status strings, form options, alert messages, descriptions, and any other text displayed to the user.

| Wrong | Correct |
|-------|---------|
| `Precision` | `Précision` |
| `Score sante` | `Score santé` |
| `Vehicule` | `Véhicule` |
| `Revision` | `Révision` |
| `Reparation` | `Réparation` |
| `Controle technique` | `Contrôle technique` |
| `Citroen` | `Citroën` |
| `Assurance expiree` | `Assurance expirée` |
| `Controle technique expire` | `Contrôle technique expiré` |
| `Revision depassee` | `Révision dépassée` |
| `defaillant` | `défaillant` |
| `defaut` | `défaut` |
| `Cout` | `Coût` |
| `Entretien du` | `Entretien dû` |
| `Pneus ete` | `Pneus été` |
| `periodique` | `périodique` |
| `intermediaire` | `intermédiaire` |
| `reglementaire` | `réglementaire` |
| `Equilibrage` | `Équilibrage` |
| `Geometrie` | `Géométrie` |
| `jusqu'a` | `jusqu'à` |
| `a verifier` | `à vérifier` |
| `Disponibilite` | `Disponibilité` |
| `Generation` | `Génération` |
| `Detection` | `Détection` |
| `Echappement` | `Échappement` |

**Key rules:**
- Always use `é`, `è`, `ê`, `ë`, `à`, `â`, `ô`, `î`, `ï`, `ù`, `û`, `ç` where required by French orthography
- Past participles must be accented: `expiré(e)`, `dépassé(e)`, `confirmé(e)`, `planifié(e)`, `détecté(e)`
- Distinguish verb vs. past participle: `expire` (present tense) vs. `expiré` (past participle)
- Brand names must keep their diacritics: `Citroën`, `Peugeot`, `Renault`
- Accents apply to **both** UI code (`.tsx` files) **and** mock data files (`.ts` data sources)

### 4.7 No Third-Party / Partner References in User Screens (Mandatory)

All user-facing screens **MUST NOT** reference third-party API names, partner brands, or external service providers. The end user should only see **MALLOULIAUTO** branding. This applies to labels, headers, badges, footers, results screens, and any other visible text.

| Wrong | Correct |
|-------|---------|
| `IA Vision PAVE` | `IA Vision MALLOULIAUTO` |
| `IA Vision PAVE × MALLOULIAUTO` | `IA Vision MALLOULIAUTO` |
| `Capture PAVE` | `Capture IA Vision MALLOULIAUTO` |
| `Démarrer la capture PAVE` | `Démarrer la capture IA` |
| `Statut PAVE` | `Statut MALLOULIAUTO` (or `Statut analyse`) |
| `Mode démo PAVE` | `Mode démo MALLOULIAUTO` (or `Mode démo IA Vision`) |
| `Powered by DeepSeek` | `IA Diagnostic MALLOULIAUTO` |
| `Analyse Groq` | `Analyse IA MALLOULIAUTO` |
| `AutoPi OBD Diagnostic` | `Diagnostic OBD MALLOULIAUTO` |
| `Exypnos Tire Inspection` | `Inspection Pneus MALLOULIAUTO` |

**Key rules:**
- Third-party names (PAVE, DeepSeek, Groq, AutoPi, Exypnos, etc.) may appear in **code comments**, **import statements**, and **internal variable names** — but **never** in user-visible text
- Always attribute AI features to `MALLOULIAUTO` in the UI (e.g., `IA Vision MALLOULIAUTO`, `IA Diagnostic MALLOULIAUTO`)
- Partner logos and names may only appear on dedicated partnership/about pages if explicitly requested

#### 4.7.1 Visual scrub for PAVE (explicit)

The literal token **`PAVE`** is a third-party vendor name and **MUST NOT** appear in any rendered string visible to the end user. This is a hard rule with **zero exceptions** in user-facing UI.

---

## 5. DOMAIN CONTEXT

### 5.1 Business Model (B2B-First: 90% B2B Revenue)

| Segment | Revenue % | Solution |
|---------|-----------|----------|
| **Insurance SaaS** | 35% | AI Claims Inspection |
| **Garage Commissions** | 25% | Partner Network |
| **Dealer SaaS** | 15% | Certified Pre-Owned Platform |
| **Fleet SaaS** | 15% | Fleet Management |
| **Individual Premium** | 10% | Premium Services |

### 5.2 Dual AI Architecture

| AI System | Technology | Use Case |
|-----------|------------|----------|
| **IA Vision** | Computer Vision | Photo damage inspection, fraud detection, dealer vehicle grading (pre-sale certification) |
| **IA Diagnostic** | LLM (DeepSeek/Groq) | Symptom analysis, DTC interpretation, dealer OBD pre-sale scanning |

---

## 6. DESIGN PRINCIPLES

### 6.1 Core Principles

1. **Vehicle-Centric**: All bookings start with vehicle selection
2. **B2B-First**: Prioritize enterprise features over consumer
3. **Offline-Ready**: Core features work without connectivity
4. **Cross-Platform**: Same UX on iOS, Android, Web
5. **Demo-Ready**: Impressive for investor presentations

### 6.2 UX Patterns

| Pattern | Implementation |
|---------|----------------|
| **Wizards** | Multi-step flows with progress indicator |
| **Cards** | Information containers with consistent styling |
| **Modals** | Bottom sheets for mobile, centered for web |
| **Loading** | Skeleton screens, not spinners |
| **Errors** | Inline validation, toast notifications |

---

## 7. QUALITY CHECKLIST

Before completing any task, verify:

```
□ Code compiles without errors
□ No emojis used (Lucide icons only)
□ Brand colors used consistently
□ TypeScript types defined
□ Cross-platform tested (web minimum)
□ French language for user-facing text
□ French accents/diacritics on ALL user-facing text (UI + mock data)
□ TND currency format correct
□ Responsive design verified
□ Accessibility basics (labels, contrast)
□ No console.log statements in production code
□ All tests pass locally (unit + integration if applicable)
□ `doc/tests/test_coverage_plan.md` updated (if tests were added/changed)
□ No force-push without explicit user approval
□ No git push unless explicitly requested by the user (see §6.3.2)
□ One issue = one branch = one PR (keep changes atomic)
□ Push incrementally after each logical milestone (never batch all changes into one push)
□ Lint and format clean before every push (see §8.2)
```

### 7.1 Pre-Push Lint & Format Gate (Mandatory)

Agents MUST run **both** ESLint and Prettier checks **before every `git push`**. A push with lint errors or formatting violations is a workflow violation.

**Required commands before pushing:**

```bash
# Root-level lint (covers apps/api, apps/packages, apps/unified)
npx eslint . --quiet

# Homepage lint (separate ESLint config)
cd homepage && npx eslint . --quiet && cd ..

# Format check (all files)
npm run format:check
```

**If any command fails:**
1. Fix lint errors manually or with `npx eslint . --fix --quiet`
2. Fix formatting with `npx prettier --write <file1> <file2> ...`
3. Stage the fixes, re-run checks, then push

**Anti-pattern (forbidden):**
```bash
# ❌ WRONG — pushing without checking
git commit -m "feat: add feature" && git push
```

**Correct pattern:**
```bash
# ✅ CORRECT — validate then push
npx eslint . --quiet
cd homepage && npx eslint . --quiet && cd ..
npm run format:check
git add -A && git commit -m "feat: add feature" && git push
```


### 7.2 Incremental Push Policy (Mandatory)

Agents MUST push changes **incrementally** after each logical milestone rather than accumulating all work into a single large push at the end.

> **Note:** This policy applies only when the user has explicitly requested a push (see §6.3.2). When not pushing, agents should still commit incrementally at each milestone so that a future push contains small, reviewable diffs.

**Push after each of these milestones:**
- Spec/design docs created or updated
- Migrations written and tested
- Implementation of a self-contained unit (e.g., store, component, route)
- Tests written and passing
- Bug fixes or CI corrections

**Why:**
- Smaller diffs are easier to review
- CI feedback arrives sooner (catch issues earlier)
- Reduces merge conflict risk on active branches
- Enables partial progress visibility for the team
- Makes `git bisect` effective if regressions occur

**Anti-pattern (forbidden):**
```bash
# ❌ WRONG — one giant push with 20+ files after hours of work
git add -A && git commit -m "feat: implement entire feature" && git push
```

**Correct pattern:**
```bash
# ✅ CORRECT — incremental pushes at milestones
git commit -m "docs: add implementation spec for feature X"
git push
# ... work on migrations ...
git commit -m "feat: add database migrations for feature X"
git push
# ... work on implementation ...
git commit -m "feat: implement store logic for feature X"
git push
# ... work on tests ...
git commit -m "test: add integration tests for feature X"
git push
```

### 7.3 Token-Efficient Prompting (Cost-First)

Use these rules to reduce chat credit usage while preserving implementation quality.

**Prompt rules (mandatory by default):**
- One task per prompt.
- Provide only one failing error and one target file when possible.
- Limit logs to the first 20-40 relevant lines.
- Ask for minimal diff and no refactor unless explicitly requested.
- Prefer execution format over explanation format.

**Response format to request from the agent:**
1. Root cause (1 sentence)
2. Files changed
3. Minimal patch applied
4. Verification command + result

**Template A — Single failing test**
```text
Goal: fix one failing test with minimal edits.
Failing test: <path + test name>
Error: <exact failing line>
Target file: <path>
Constraints: minimal patch only; no refactor; run only this test.
Output: root cause, files changed, patch, test result.
```

**Template B — CI failure**
```text
Goal: fix one CI failure only.
Job: <name>
Step: <name>
Error snippet: <20-40 lines>
Constraints: fix only this failure; no unrelated changes.
Output: cause, fix, verification command, result.
```

**Template C — Small feature change**
```text
Goal: implement one requirement.
Requirement: <single sentence>
Scope in: <files/folder>
Scope out: no redesign, no architecture changes, no dependency changes unless required.
Constraints: smallest working diff.
Output: files touched, changes, verification.
```

**Template D — Docs sync only**
```text
Goal: update docs to match existing code/policy.
Source of truth: <file>
Doc file: <file>
Constraints: no code changes; concise wording.
Output: sections updated, policy alignment summary.
```

**Template E — Review focused on risk**
```text
Goal: review changed files for regressions only.
Scope: changed files in diff.
Check: behavioral regressions, missing tests, security risks.
Constraints: no style-only feedback.
Output: findings by severity with file references.
```

### 7.4 AI Chat Credit Threshold Policy (RAG)

Use this Red/Yellow/Green policy to decide when prompt usage is too expensive. Thresholds are calibrated for a large monorepo with multiple complex features.

| Level | Credits per prompt (avg) | Daily credits per developer | Required Action |
|------|---------------------------|-----------------------------|----------------|
| **Green** | `<= 40` | `<= 200` | Continue normal workflow |
| **Yellow** | `41-80` | `201-320` | Next day: use strict one-task templates; cap logs to 20-40 lines; minimize context |
| **Red** | `> 80` | `> 320` | Next day: pause broad prompting; use reproduce -> patch -> verify; minimal-diff only |

**Escalation rule:**
- If weekly average remains in **Red** for 3 consecutive working days, switch to template-only mode until usage returns to **Yellow/Green**.

### 7.5 Prompt Rework Trigger (Advisory Guardrail)

When a user prompt is likely to exceed **Yellow/Red** cost (too broad, multi-task, or oversized context), the agent should interrupt once with a concise rework request before executing.

**Trigger signals:**
- Multiple independent tasks in one prompt.
- Full logs/files pasted when a small excerpt would suffice.
- Requests mixing implementation + review + architecture redesign.

**Required response pattern:**
1. State: "Rework Prompt Needed (Cost Guardrail)".
2. Ask for one scoped task using one template from §8.3.
3. Request only minimal context (one error, one file, 20-40 log lines).

**Note:** This is an advisory workflow guardrail, not a hard platform block.

---

## 9. QUICK REFERENCE

### Commands

```bash
# Start Unified App (all roles)
cd apps/unified && npx expo start --web --port 8080 --clear

# Start Homepage
cd homepage && npm run dev

# Build Unified App (production web export)
cd apps/unified && npx expo export --platform web

# Deploy Unified App (Platform)
vercel --prod --local-config vercel.json --force

```
# Homepage Redesign — Product & UX Brief

## Mission

Redesign the homepage of **MALLOULIAUTO** to accurately reflect the company's business model and strategic positioning.

This is **not** a cosmetic redesign.

It is a complete repositioning of the homepage from a "vehicle marketplace" or "inspection service" into a **technology-enabled trusted certification platform for used vehicles**.

---

# The Business

Mallouli Auto does **not** sell vehicles.

Mallouli Auto does **not** operate as a traditional inspection garage.

Mallouli Auto is building the trust infrastructure for the used vehicle market.

Its mission is to make buying and selling used vehicles significantly safer through a standardized, technology-enabled certification methodology.

Every certification combines:

- standardized inspection protocols
- electronic diagnostics
- physical measurements
- visual evidence
- expert analysis
- digital reporting
- online verification

The certification is the product.

The vehicle is not.

---

# Core Value Proposition

The homepage must communicate one simple idea:

> We don't tell you what's wrong with a vehicle.
> We help everyone involved understand what that means.

Unlike traditional inspection companies that simply produce a checklist or an expert opinion, Mallouli Auto produces a standardized, verifiable certification that supports better pricing and better purchasing decisions.

The emphasis is on:

- trust
- transparency
- consistency
- evidence
- confidence

not on mechanics.

---

# Positioning

The website should feel closer to:

- Carfax
- Stripe
- Plaid

than to:

- a used car dealership
- a repair garage
- an automotive workshop

We are building trust infrastructure.

---

# Target Audiences

The homepage should clearly speak to multiple audiences.

## Individuals

Someone buying a used vehicle.

Questions:

- Can I trust this vehicle?
- Is the asking price justified?
- How do I avoid hidden problems?

---

## Dealers

Professional sellers wanting to differentiate their inventory through independent certification.

Questions:

- How do I build trust?
- How do I sell faster?
- How do I reduce disputes?

---

## Partners

Future certified inspection partners using Mallouli Auto's technology and methodology.

Questions:

- Why join the ecosystem?
- What standards do I follow?
- What technology do I gain access to?

---

# Homepage Story

The homepage should tell a story.

Every section should naturally lead to the next.

## 1 Hero

Immediately communicate:

Mallouli Auto brings trust and transparency to used vehicle transactions.

Primary CTA:

Request Certification

Secondary CTA:

Learn How It Works

Avoid generic marketing slogans.

---

## 2 The Problem

Explain the reality of today's used vehicle market.

Examples:

- hidden defects
- odometer fraud
- accident repairs
- inconsistent inspections
- difficult pricing decisions
- lack of transparency

Do not use fear-based marketing.

Instead explain why objective information matters.

---

## 3 The Solution

Introduce Mallouli Auto.

Explain that certification combines:

- professional inspection
- technology
- standardized methodology
- digital evidence
- independent reporting

The emphasis is consistency rather than opinion.

---

## 4 How Certification Works

Present a simple visual workflow.

Example:

Book

↓

Inspect

↓

Collect Data

↓

Expert Validation

↓

Digital Report

↓

Online Verification

↓

Confident Transaction

Use diagrams, icons and motion where appropriate.

---

## 5 What Makes Mallouli Auto Different

Focus on differentiators such as:

- standardized methodology
- proprietary technology
- electronic diagnostics
- paint thickness measurement
- multi-source odometer verification
- digital evidence
- online report verification
- continuous quality control

Avoid making claims that cannot be substantiated.

---

## 6 The Digital Report

The certification report is one of the company's strongest assets.

Show it.

Create a realistic report preview.

Explain that every report includes:

- inspection findings
- supporting evidence
- diagnostics
- photographs
- observations
- verification

This section should become one of the visual highlights of the homepage.

---

## 7 Who We Serve

Separate into clear cards.

Individuals

Dealers

Partners

Each should explain the value received.

---

## 8 Technology

Explain the platform without overusing AI marketing language.

The technology enables:

- standardized inspections
- data collection
- consistent reporting
- online verification
- scalable certification

Avoid buzzwords.

Do not claim autonomous AI inspections.

---

## 9 Trust

Include credibility elements.

Examples:

Inspection process

Technology

Partner network

Verification

Quality standards

Future certifications

Do not invent statistics.

---

## 10 Final CTA

End with a clear action.

Examples:

Book a Certification

Become a Partner

Contact Us

---

# Visual Direction

The visual language should communicate:

precision

engineering

transparency

professionalism

technology

trust

Think:

clean

minimal

premium

modern

calm

Avoid:

automotive clichés

aggressive sales language

large blocks of text

busy layouts

cheap gradients

excessive animations

---

# Copywriting

Copy should feel:

professional

credible

precise

clear

human

Avoid:

"best"

"number one"

"revolutionary"

"world class"

"unmatched"

or any unsupported claims.

Every sentence should reinforce trust.

---

# UX Principles

The homepage should answer these questions within the first minute.

What is Mallouli Auto?

Why should I trust it?

How does certification work?

Why is it different?

How do I start?

---

# Technical Requirements

Maintain:

- excellent Lighthouse performance
- semantic HTML
- accessibility (WCAG)
- responsive design
- SEO best practices
- clean component architecture

Avoid unnecessary JavaScript.

---

# Success Criteria

After visiting the homepage for less than 30 seconds, a first-time visitor should understand:

✓ MALLOULIAUTO does not sell vehicles.

✓ MALLOULIAUTO  certifies used vehicles.

✓ Certification is standardized and technology-enabled.

✓ The report helps buyers, sellers and professionals make better decisions.

✓ The company is building trusted infrastructure for the used vehicle ecosystem.

If a visitor leaves believing Mallouli Auto is simply another inspection garage or a used car dealer, the redesign has failed.