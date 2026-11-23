# Homepage content & design-system refresh — handoff spec

**Branch:** `feat/homepage-content-refresh` (off `develop`)
**Date:** 20 sept. 2026
**Status:** design phase — content fixes applied directly (low ambiguity, see §1); one item left for implementation (§2)

## Purpose

Bring the homepage certification-flow components (`src/components/home/certification/`) in line with:
1. Content accuracy rules that came out of review this cycle (no fabricated visuals, no banned claims).
2. The MALLOULIAUTO design system's visual language, applied additively (not a site-wide palette rip-out — see §3).

This is a **re-skin in place**, not a port of the standalone mockup. The mockup (`mallouliauto-homepage-v3.html`) was built without visibility into the real codebase and the real homepage already has substantial deliberate content the mockup never captured (audience segmentation, AI-governance disclaimers, 2029 roadmap honesty, partner-channel recruitment). Do not replace real components with mockup markup — only bring the *content corrections* and *visual tokens* across.

### Reference artifacts (claude.ai — visual/content reference only, not implementation targets)
- Design system (tokens + brand book): https://claude.ai/artifact/RyL2Pufixt2oGoa7rQRQCX — copied into this repo at `docs/design-system/` (see §3), which is now the reference for this codebase; keep them in sync manually if the artifact evolves.
- Homepage mockup (visual proof-of-concept, not a source file): https://claude.ai/artifact/LALYMxrSgCToZaAackwyyJ
- Flyer & Social print/social collateral (unrelated to this codebase): https://claude.ai/artifact/QUukbAC81yL75VYA7EnWxx

---

## §1 — Already implemented in this branch

These were unambiguous content-accuracy fixes (either previously agreed, or resolved by explicit answers this session) and were applied directly rather than staged as spec items:

| File | Change |
|---|---|
| `src/index.css` | Added the design-system tokens (see §3) inside the existing `@theme` block, additively. Old `--color-brand-*` tokens/utilities untouched. |
| `index.html` | Added Google Fonts `<link>`s for Montserrat + IBM Plex Mono. |
| `src/components/home/certification/CertificationFlow.jsx` | Stale top comment rewritten. Step 02 duration changed from a single figure ("Environ 50 minutes") to a range ("30 à 60 minutes selon l'état du véhicule") — see note below. Step 03 body rewritten to remove the health-score and per-line-provenance language (`mesuré / observé / estimé`), replaced with what's actually true: gravité + photo per constat, chiffrage, structured report. |
| `src/components/home/certification/UncertaintyDiscount.jsx` | Removed the "200 à 500 dinars" competitor price figure from the lead paragraph; rest of the sentence kept intact. |
| `src/components/home/certification/HeroCertification.jsx` | Removed the `VehicleScanOverlay` import/usage and its stale doc comment (see next row). Hero photo itself (`/images/hero/hero-annotated-car.*`) is untouched. |
| `src/components/home/certification/VehicleScanOverlay.jsx` | **Deleted.** It drew fabricated measurement annotations (fake bumper crack, fake OBD code, fake mileage) over the real hero photo — confirmed via repo-wide grep as its only usage site was `HeroCertification.jsx`. |
| `src/components/home/certification/CertificateVisual.jsx` | Rebuilt from scratch. The old version was an explicitly-labeled fictional mock certificate (fake ref `MA-CERT-•••••`, invented measurement rows). The new version renders real data from the actual MA-2026-SW8ZWJ report (2023 VW Tiguan, 42 000 km, pare-brise fissuré/Modérée/200 TND, peinture 120 µm/Origine, total 1 410 TND, 15 sept. 2026, 6 pages) — same numbers already used in the design system's `CertificateCard` component and the Flyer/Social canvas, per the design system's own rule against inventing plausible-looking figures. Uses the new design-system tokens (`bg-navy`, `text-ink`, `border-rule`, `bg-sev-*`, `font-mono`, etc.) rather than the old `brand-*` classes, since this component was being rebuilt anyway. |

**Duration range caveat:** "30 à 60 minutes" is my best estimate, not a measured figure — the only real data point available is a single sample report timed at 20 min 8 s, and the prior placeholder was "~50 minutes" with no cited source either. **Please confirm/correct this range against actual field timing data** before launch; it's a one-line edit in `CertificationFlow.jsx`.

**Certificate real-name caveat:** the certificate now shows "Opérateur Wassim Mallouli" on the public homepage (previously only used internally in the design system/canvas). If you'd rather not put the founder's name on the live certificate sample, swap in a different real operator/report.

---

## §2 — Pending: `TechnologyTrust.jsx` rework

**Not yet implemented — this is the actual design-phase deliverable for the dev agent.**

### Why

Current copy (`src/components/home/certification/TechnologyTrust.jsx`) does two things that need to change:

1. It dives into implementation-level detail (naming specific instruments, explaining vision-model mechanics) in the homepage's high-level "trust" section. Direction from the founder: **this section should present the platform purely as the integration/orchestration layer that wires the innovation pieces together — camera, instruments, structured capture — not explain how each piece works.** The deep technical dive already has its own home: the section's existing "Voir l'architecture technique" link to `/technology` (which already uses real photos from `public/images/technology/`) is the right place for that detail. Keep that link.
2. The `governance` array's second item, **"La provenance de chaque ligne"** (body: *"Chaque constat indique s'il a été mesuré, observé, calculé ou estimé..."*), is a second live violation of the no-provenance rule (the first, in `CertificationFlow.jsx`, is already fixed in §1). This was found while reading the file for this task and had not been flagged before — **remove this governance item entirely**, don't replace it (2 items in that column is fine).

### What to change

**Left column ("La technologie" → rename kicker to "La plateforme")**

Replace the `stack` array (currently: IA Vision / Instruments de mesure / Corpus mécanique apparié — too mechanism-level) with a shorter, orchestration-framed set. Suggested copy (adapt as needed, keep the closing "corpus" point — it's the real competitive moat and shouldn't get lost):

```
1. "Un protocole, pas une mémoire"
   "L'inspecteur suit une séquence fixe sur tablette. Les 96 points et leur
   classification sont dans le système, pas dans sa tête."

2. "Les instruments, reliés"
   "Scanner de diagnostic, jauge de peinture, jauge de sculpture : leurs
   relevés remontent au protocole en direct, horodatés, sans ressaisie
   manuelle."

3. "Un corpus qui s'enrichit"
   "Chaque inspection alimente un corpus qui apparie relevé d'instrument et
   constat. C'est l'actif que nous construisons, inspection après
   inspection."
```

Suggested new headline + intro (replacing "Trois briques, dont une seule nous appartient..."):

```
H2: "La plateforme relie les pièces ; elle n'en est pas une."
Intro: "Caméra, scanner OBD, jauges : chacune de ces briques existe déjà sur
le marché. Ce que nous construisons, c'est le protocole qui les relie à
chaque inspection — et le corpus qu'elles alimentent au fil du temps."
```

**New visual: real operator-tool screenshot**

A real screenshot of MA-Inspector (the operator's field tool) has been added at `public/images/technology/ma-inspector-gravite-capture.png` (636×857, shows the damage-entry modal for "Voyants du tableau de bord": description field, Gravité segmented control, required photo capture, Supprimer/Terminé). Place it in the left column — between the intro paragraph and the `stack` list reads best, so the real tool grounds the claim before the three bullets elaborate on it. Frame it simply (border, no heavy shadow, per the design system's borders-first rule — `radius-flat`, not a rounded card) and caption it:

```
"Capture d'écran de MA-Inspector, l'outil terrain de nos inspecteurs — saisie
d'un constat sur le tableau de bord. D'autres captures (procédure complète,
instruments) suivront à mesure du déploiement."
```

This is explicitly a "for now" placeholder per the founder — more photos (procedure, tools) are coming later; the caption should say so rather than presenting this one screenshot as the complete picture.

**Right column ("L'auditabilité" / governance)**

Remove the `"La provenance de chaque ligne"` object from the `governance` array entirely. Keep `"L'IA ne décide jamais"` and `"Traçabilité des décisions"` unchanged.

**Token alignment (optional, nice-to-have in the same pass)**

This component still uses the old `brand-*` classes (`text-brand-orange`, `bg-brand-orange/20`, `bg-brand-blue/25`, and a hardcoded `#273F4F` gradient background). Since this file is already being edited, consider swapping to the new tokens for consistency with `CertificateVisual.jsx`: `text-accent-ink` for the eyebrow, `bg-accent/20` / `bg-accent/15` for icon chips, `bg-navy-d` for the section background (the design system explicitly reserves `navy-d` for this section, to distinguish "product/platform" from the hero's `navy`). Not required if time is tight — this is a visual-polish item, not a content-accuracy one.

---

## §3 — Design tokens: additive, not a site-wide migration

`docs/design-system/tokens.json` and `docs/design-system/README.md` in this repo are a copy of the published design system, and are the reference for any new token usage. **Do not delete or rename the existing `--color-brand-*` tokens/utilities in `src/index.css`** — `src/pages/Technology.jsx` and most of the rest of the site still use them, and a full palette migration is a separate, larger, riskier piece of work that shouldn't be bundled into a content-accuracy pass 11 days before launch. The new tokens (`navy`, `navy-d`, `blue`, `ink`/`ink-2`/`ink-3`, `rule`/`rule-2`, `accent`/`accent-ink`, `sev-min`/`sev-mod`/`sev-maj`/`sev-crit`, `ok`, `ground`/`ground-2`/`ground-3`, `slot`, plus `font-display`/`font-mono`) are added alongside the old ones and are currently used only in the certification-flow components touched here. Extend this token set to other pages only as a deliberate, separate follow-up.

## §4 — Flagged: severity vocabulary discrepancy (needs design-system correction)

The published design system documents a **closed 3-value severity vocabulary**: Mineure, Modérée, Majeure. The real MA-Inspector operator tool (per the attached screenshot) exposes **5 values** in its Gravité control: Sans objet, Mineure, Modérée, Majeure, **Critique**.

Resolution applied in this repo (see `docs/design-system/README.md`, "Écart connu"):
- Added a 4th severity token, `--color-sev-crit: #7a1f1e` (placeholder pending real design review — pick something visually more alarming than `maj`'s `#a32b2b`).
- "Sans objet" is treated as an internal data-entry state (not-applicable checkbox), never surfaced as a report severity — a non-applicable point simply doesn't appear on the client-facing report.

**This has not yet been corrected in the published design-system artifact itself** (only in this repo's copy) — worth a follow-up pass on the artifact so the two don't silently drift.

---

## Acceptance criteria

- [ ] No health score / grade / percentage-confidence anywhere in the certification flow.
- [ ] No per-line provenance tagging (mesuré/observé/calculé/estimé) anywhere — including the item removed in §2.
- [ ] No specific competitor price figures.
- [ ] No WhatsApp CTA button (WhatsApp as a contact channel mention is fine).
- [ ] Inspection location never asserted as always-at-the-seller's.
- [ ] Inspection duration phrased as a range, confirmed against real field data before launch.
- [ ] Certificate visual shows only real MA-2026-SW8ZWJ data.
- [ ] `VehicleScanOverlay` (fabricated measurement annotations) fully removed.
- [ ] Technology section frames the platform as an integration/orchestration layer; deep technical detail stays on `/technology`.
- [ ] Real MA-Inspector screenshot used in the Technology section, captioned as partial/more-to-come.
- [ ] `sev-crit` token exists; "Sans objet" never rendered as a report-facing severity.
- [ ] `npm run build` (or the project's lint/build script) passes after all changes.

## Explicitly out of scope for this pass

- Full `--color-brand-*` → new-token migration across the rest of the site (Technology.jsx, nav, forms, etc.).
- Visual restyle of `AccountArchetypes.jsx`, `DecisiveMeasures.jsx`, `Solution.jsx`, `PartnerChannels.jsx`, `CertificationCTA.jsx`, `SectionNav.jsx` — their content is real and deliberate; only a later, separate token/visual pass should touch them.
- Any change to `/technology` page content or its existing real photos.
