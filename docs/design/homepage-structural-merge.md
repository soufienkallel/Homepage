# Homepage structural merge — mockup + real site, full scope for launch

**Branch:** `feat/homepage-content-refresh`
**Date:** 20 sept. 2026
**Status:** design phase — full spec for a dev agent to implement. Supersedes the narrower scope of `docs/design/homepage-content-refresh.md` (that doc's content is still valid and unchanged; this doc adds structure on top of it).

## Decision

Do not port the mockup wholesale, and do not just re-skin the real site either. **Merge them.** They are not competing designs — they are complementary drafts of the same product:

- The mockup (`mallouliauto-homepage-v3.html`) has entire sections the real site is missing outright: **FAQ**, an interactive **certificate verification** block, **Partenaires**/**Témoignages** (the real site shows *no* social proof at all, not even placeholders), a document-first **"Le rapport"** showcase, and a concrete **"Couverture"** checklist (96 points by family + named tools).
- The real site has content the mockup never wrote and that must survive: `Solution.jsx`'s "what the report never claims" list, `DecisiveMeasures.jsx`'s decisive-vs-commodity framing + the 2029 roadmap honesty callout, `AccountArchetypes.jsx`'s three audience segments, `PartnerChannels.jsx`'s partner recruitment (wired to a real `/contact` route), and `SectionNav.jsx`'s working scroll-spy nav.

Both already share the same tokens, the same real numbers (MA-2026-SW8ZWJ, 96 points, 1 410 TND), and the same content rules — this is why the merge is low-risk rather than a rewrite.

## Global directives for this pass

1. **Simple and professional. No AI-specific language.** Describe the platform in terms of outcomes (guided capture, connected instruments, a structured protocol) not AI/ML mechanics. Concretely:
   - Rename any card/heading that leads with "IA" or "vision par ordinateur" as a hook — e.g. mockup's "Vision par ordinateur" platform card → retitle **"Capture guidée"**, and change "L'inspecteur valide ; le modèle accélère et uniformise." → **"L'inspecteur valide chaque photo avant qu'elle n'entre au rapport."** (same claim, no model/AI attribution needed).
   - This reinforces (doesn't replace) the `TechnologyTrust.jsx` rework already spec'd in `docs/design/homepage-content-refresh.md` §2 — that section's whole point is to *not* dive into AI mechanics.
   - Also update `src/pages/Home.jsx`'s SEO description, which currently says "inspection guidée par IA" — drop that phrase (e.g. "Plateforme de certification de véhicules d'occasion : mesure mécanique par instruments et certificat vérifiable en ligne, transférable.").
   - Governance copy that exists specifically to reassure ("l'IA ne décide jamais") is the one place AI is named on purpose — that's a trust statement, not a hook, and stays.
2. **Text must be visibly legible.** Audit every low-opacity white-on-dark text utility (`text-white/50`, `/60`, `/70` used throughout the certification components for body copy on navy backgrounds) and raise anything under `/80` used for body text. Prefer the design system's dedicated neutral tokens over opacity hacks where a component is being touched anyway (e.g. `rgba(255,255,255,.8)` is fine as a deliberate secondary-text value; `/50`–`/60` is not, that's the range that reads as low-contrast).
3. **Easy to navigate.** Keep `SectionNav.jsx` exactly as-is — 5 tabs, same anchors (`pourquoi-certifier`, `pourquoi-confiance`, `comment-ca-marche`, `qui-beneficie`, `comment-demarrer`). Do **not** add a tab per new section (would clutter the rail) — new sections nest into the existing 5 conceptual buckets by position (see page order below). Add one small nav affordance from the mockup that's genuinely useful: a "Vérifier un certificat" quick-link in the main site header (`.nav-verify` in the mockup), separate from `SectionNav`.
4. New components (this doc) should use the **new design-system tokens directly** (`bg-navy`, `text-ink`, `border-rule`, `bg-accent`, `text-accent-ink`, `font-mono`, `.slot`, `.ph-note`, etc. — `.slot`/`.ph-note` are already added to `src/index.css`) rather than the old `brand-*` classes. Unlike existing components (additive-only, see the other spec doc §3), these have no legacy to preserve, so build them clean.
5. Every new section keeps the same `motion.div` fade-in-on-scroll pattern already used across `src/components/home/certification/*.jsx` (`initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}`), for visual consistency with the rest of the page.

## Final page order

`src/pages/Home.jsx`'s render order, top to bottom (● = new component to build, ✓ = keep as-is content-wise + restyle, ~ = merge/simplify):

| # | Section | Status | Anchor | Notes |
|---|---|---|---|---|
| 1 | `HeroCertification` | ~ merge | — | See "Hero merge" below |
| 2 | `SectionNav` | ✓ keep | — | Unchanged |
| 3 | `ReportShowcase` ("Le rapport") | ● new | `rapport` | Leads with the real certificate — strongest proof point, moved up from buried step 4 |
| 4 | `UncertaintyDiscount` | ✓ keep | `pourquoi-certifier` | Already fixed (§1 of the other spec doc) |
| 5 | `Solution` | ✓ keep | `la-solution` | Restyle only |
| 6 | `CertificationFlow` | ~ simplify | `comment-ca-marche` | 4 steps → 3, drop embedded certificate (now owned by `ReportShowcase`) |
| 7 | `CoverageChecklist` ("Couverture") | ● new | — | Nests under the "comment ça marche" bucket, no separate nav tab |
| 8 | `DecisiveMeasures` | ✓ keep | `pourquoi-confiance` | Restyle only |
| 9 | `AccountArchetypes` | ✓ keep | `qui-beneficie` | Restyle only |
| 10 | `TechnologyTrust` | ~ rework | — | Per the other spec doc §2 (already written) |
| 11 | `CertificateVerification` ("Vérifier un certificat") | ● new | `verifier` | |
| 12 | `PartnerLogos` ("Partenaires pilotes") | ● new | — | Slots — real site currently shows none |
| 13 | `Testimonials` ("Témoignages") | ● new | — | Slots — real site currently shows none |
| 14 | `PartnerChannels` | ✓ keep | `comment-demarrer` | Restyle only |
| 15 | `FAQ` | ● new | `faq` | Real site currently has none at all |
| 16 | `CertificationCTA` | ~ trivial | — | Headline already matches mockup's Close verbatim ("Commencez par un véhicule.") — no content change needed |

---

## Hero merge

Keep the real hero's photo (`/images/hero/hero-annotated-car.*` — it exists, is real, already correctly abstracts location). Do **not** adopt the mockup's video concept — no video has been produced, and blocking the hero on one 11 days from launch is the wrong trade.

Adopt from the mockup:
- Tighter headline: **"N'achetez pas sur parole."** (mockup) is punchier than the real "La preuve de l'état réel d'un véhicule d'occasion" — recommend switching, but this is a brand-voice call, flag it rather than assume.
- The **stats strip** under the CTA row (mockup `.hero-strip`): `96` points contrôlés · `10` instruments de mesure · `5` familles d'inspection · `QR` certificat vérifiable en ligne. Real hero has no equivalent — add this row using `font-mono` for the numbers, matching the certificate's data-value style.
- A second CTA: **"Voir un rapport complet"**, linking to the new `#rapport` anchor (`ReportShowcase`, item 3 above) — this now has somewhere real to point.

Keep from the real hero: the three `proofPoints` (État mécanique mesuré / Opérateur indépendant / Certificat vérifiable) — mockup has no equivalent, and they're good, specific claims. Keep both CTA buttons currently there ("Demander une certification", "Devenir partenaire") alongside or instead of the mockup's — reconcile to at most 2 primary + 1 secondary CTA so the hero doesn't get crowded; recommend: **"Demander une certification"** (primary), **"Voir un rapport complet"** (secondary, new), drop "Devenir partenaire" from the hero (it already has its own CTA in `PartnerChannels` further down).

---

## §A — NEW: `ReportShowcase` ("Le rapport")

Placed right after the hero. This is the mockup's "Voici le document. Avant tout le reste." section, and it should **reuse `CertificateVisual.jsx`** (already rebuilt this session with real MA-2026-SW8ZWJ data) rather than re-implementing the certificate — pass it a size-appropriate `className` if needed (it currently renders at `max-w-sm`; this section may want it larger/full detail — check whether `CertificateVisual` needs a "full" variant prop that shows all 7 measurement rows instead of the current condensed 2, to match the mockup's fuller `.mrows` list. If not, it's fine to keep the condensed version here too — simplicity over completeness).

**Copy (verbatim from mockup, already clean — no AI language, nothing to change):**

```
Eyebrow: "Le rapport"
H2: "Voici le document. Avant tout le reste."
Lead: "Nos concurrents vendent un rapport de vingt à quarante pages sans jamais
en montrer une seule. Voici le nôtre, tel qu'il sort de la plateforme — un
véhicule réellement inspecté, des mesures réelles, un chiffrage réel."
```

**Structure:** 2-column layout (certificate visual left, a 6-item annotated list right — mirrors the mockup's `.anno` `<dl>`, adapted to a simple list of `{number, title, body}`):

```
01 — Un compteur de constats par famille
     Cinq familles, chacune avec son nombre de constats. Deux à zéro ici :
     c'est une information, pas un vide.
02 — Un chiffrage, pas seulement une liste
     Chaque constat porte son coût estimé, et le rapport en donne le total.
     C'est ce qui rend la négociation possible.
03 — Une gravité par constat
     Mineure, modérée, majeure — la même échelle d'un véhicule au suivant,
     quel que soit l'inspecteur.
04 — Des mesures avec leurs unités
     218 µm, 12 mm, 10 °C, un écart kilométrique en km. Une valeur mesurée
     ne dépend pas de qui tient l'appareil.
05 — Ce qui a été contrôlé et jugé conforme
     Le rapport liste nommément chaque élément vérifié sans constat. Un
     « rien à signaler » vérifiable vaut mieux qu'un silence.
06 — Une traçabilité complète
     Opérateur, lieu, date, durée, matériel utilisé, référence et QR de
     vérification.
```

Numbers in `font-mono`, styled like the `d3`/eyebrow pattern already used elsewhere (`text-accent-ink`, tabular-nums).

---

## §B — NEW: `CoverageChecklist` ("Couverture")

**Copy (verbatim from mockup):**

```
Eyebrow: "Ce que couvre l'inspection"
H2: "96 points contrôlés, et la liste est publiée."
Lead: "Un nombre ne vaut que si l'on peut le vérifier. Chaque rapport nomme
les éléments contrôlés, y compris ceux jugés conformes et ceux dont le
véhicule n'est pas équipé."
```

**Structure:** 2-column (desktop) grid of 6 labeled checklists (family name as heading, 3 bullet items each — bold the specific measurement named in each, matching the mockup's `<b>` emphasis):

1. **Diagnostic électronique** — Lecture des **codes défaut** sur les calculateurs moteur, freinage et sécurité / **Cohérence kilométrique** comparée entre plusieurs calculateurs / Voyants du tableau de bord, câblage, gestion électronique
2. **Enveloppe extérieure** — **Épaisseur de peinture** relevée panneau par panneau, écart à la valeur d'origine / Carrosserie, vitrage, longerons, passages de roue, points de levage / Dessous de caisse au pont élévateur — corrosion, fuites, traces de choc
3. **Motopropulseur** — Moteur, boîte, transmission, freinage, direction, suspension / **Profondeur de sculpture** sur les quatre pneus et la roue de secours / Fuites, bruits et jeux au stéthoscope mécanique
4. **Niveaux, liquides et batterie** — Huile moteur, liquide de refroidissement, lave-glace, liquide de frein / **Testeur de liquide de frein** — niveau et humidité / Batterie et système de charge sous testeur dédié
5. **Confort et sécurité** — Airbags, ceintures, éclairage, essuie-glaces, rétroviseurs / Climatisation mesurée au thermomètre — température de soufflage / Sièges, panneaux de porte, multimédia, équipements de bord
6. **Identité et historique** — **Numéro de série vérifié** et photographié / Cohérence des documents, propriétaires précédents / Véhicule déclaré volé ou accidenté, kilométrage trafiqué

Below the grid, a "tools used" strip (eyebrow: "Matériel utilisé, nommé dans chaque rapport"), rendered as small bordered chips (`.tool` pattern — `border border-rule-2 px-3 py-2 text-sm`):

Lecteur de défauts · Pont élévateur · Caméra d'inspection · Jauge de profondeur de sculpture · Testeur de batterie et de charge · Testeur de liquide de frein · Stéthoscope mécanique · Multimètre · Tablette · Connexion internet

Background: `bg-ground-2` (alternating fill, matches mockup's `.sec.fill`).

---

## §C — `CertificationFlow` simplification (4 steps → 3)

The mockup's process is 3 customer-facing steps; the real component currently has 4, with the certificate visual embedded in step 4 — which is now redundant with `ReportShowcase` (§A) sitting right after the hero. Simplify to a plain 3-card grid (drop the special "highlighted step 4 + `CertificateVisual`" layout entirely):

```
01 — Vous réservez
     Vous nous indiquez le véhicule et le lieu, par WhatsApp ou par
     téléphone. Nous fixons ensemble le rendez-vous — chez vous, chez le
     vendeur, ou dans nos locaux.
02 — L'inspecteur mesure
     Il suit le même protocole dans le même ordre, avec son matériel. Sans
     démontage, sur place, en 30 à 60 minutes selon l'état du véhicule.
03 — Vous recevez le rapport
     Constats chiffrés, mesures, total estimé des réparations, et un
     certificat horodaté, vérifiable en ligne par un tiers.
```

(Step 02's duration already matches the range fixed in the other spec doc's §1 — keep it consistent. Step 03 folds in the real step 4's "transférable, vérifiable en ligne par un tiers" language rather than keeping it as a separate card.)

**Confirm with the founder:** is 3 steps operationally accurate, or does "certificate issued" genuinely happen as a distinct, separate event from report delivery (e.g. a delay between the two)? Defaulted to 3 here because the mockup states it this way and the two appear to ship together in practice — this is a one-array-shorter edit if wrong, not a big change.

---

## §D — NEW: `CertificateVerification` ("Vérifiez un certificat")

**Copy (verbatim from mockup):**

```
Eyebrow: "Vérification"
H2: "Vérifiez un certificat."
Lead: "Un certificat qu'on ne peut pas vérifier ne vaut rien. Saisissez la
référence, ou scannez le QR du rapport."
```

**Structure:** a bordered input box (label "Référence du certificat", monospace input pre-filled with `MA-2026-SW8ZWJ` as a live example, "Vérifier" button). **Functional scope for launch:** there is no verification backend referenced anywhere in this codebase or the design system. Build this as a real, submittable form that either (a) links to a genuine verification page/route if one exists elsewhere in the monorepo (check `apps/packages/certification/` — flagged in the design-system README as the source of the taxonomy/schema, may already have a lookup endpoint), or (b) if no backend exists yet, make the button honest about that — e.g. route to `/contact?type=verification` or show an inline note rather than a fake "verified ✓" result. **Do not fabricate a verification result client-side** — that would be the exact kind of fake-authenticity content the design system's own rules forbid.

---

## §E — NEW: `PartnerLogos` ("Partenaires pilotes")

**Copy (verbatim from mockup — note the label discipline, don't deviate):**

```
Eyebrow: "Partenaires pilotes"
[.ph-note badge]: "Emplacements — logos et accords à confirmer"
```

4 `.slot` placeholders in a responsive grid (`aspect-ratio: 5/2` each — a small `Slot` component, see below), each labeled "Logo partenaire N". Caption below: *"Intitulé « Partenaires pilotes » et non « Ils nous font confiance » : la première formulation est exacte au lancement, la seconde ne l'est pas encore."* — this caption is itself a good, honest line; keep it verbatim, it demonstrates the same rigor the rest of the site has.

## §F — NEW: `Testimonials` ("Témoignages")

**Copy (verbatim from mockup):**

```
Eyebrow: "Témoignages"
[.ph-note badge]: "Emplacements — à remplacer par de vrais avis après les
premières inspections"
```

3 `.slot`-styled quote cards (border, no fake stars filled in — mockup uses `★★★★★` in a muted `rule-2` color, which reads as a placeholder rating shape, not a claimed 5-star review; keep that muted styling, don't darken the stars to look like a real rating), each with placeholder copy naming what a *real* testimonial should eventually say (buyer / seller / partner professional) rather than an invented quote:

1. *"Emplacement témoignage — environ 200 à 300 caractères, en français, mentionnant un constat précis plutôt qu'une satisfaction générale."* — Acheteur particulier
2. *"Emplacement témoignage — idéalement un vendeur qui a utilisé le certificat comme argument de vente, pas seulement un acheteur."* — Vendeur particulier
3. *"Emplacement témoignage — un professionnel ou un expert d'inspection partenaire, pour couvrir le canal marque blanche."* — Professionnel

### Shared: `Slot` component (new, small, reused by §E and §F)

```jsx
// src/components/home/certification/Slot.jsx
export default function Slot({ children, dark = false, className = '' }) {
  return (
    <div className={`slot ${dark ? 'dark' : ''} ${className}`}>
      <span>{children}</span>
    </div>
  );
}
```

Relies on the `.slot` / `.slot.dark` CSS already added to `src/index.css`. The `.ph-note` badge is plain markup: `<span className="ph-note">…</span>`.

---

## §G — NEW: `FAQ`

Real site has no FAQ at all — this is a real conversion gap for a page asking people to book a paid inspection. Use a native `<details>/<summary>` accordion (matches the mockup exactly, is accessible by default, needs no extra state management). Content verbatim from the mockup — it's specific, honest, and already avoids AI language entirely:

```
Eyebrow: "Questions fréquentes"
H2: "Ce qu'il faut savoir avant de réserver."
```

1. **En quoi est-ce différent de la visite technique ?** — La visite technique vérifie qu'un véhicule est en état de circuler. Elle ne dit rien de son historique de réparation, de la cohérence de son kilométrage, de l'épaisseur de sa peinture ni du coût des remises en état à prévoir. Notre rapport ne la remplace pas : il documente ce qu'elle ne couvre pas.
2. **Que contient exactement le rapport ?** — Six pages : identification et photos du véhicule, contexte de l'inspection, matériel utilisé, constats par famille avec photo, gravité et coût estimé, tableaux de mesures (épaisseur de peinture par panneau, profondeur de sculpture par pneu, niveaux, températures), cohérence kilométrique multi-calculateurs, codes défaut, synthèse de l'inspecteur et total estimé des réparations.
3. **Combien de temps dure l'inspection ?** — 30 à 60 minutes sur place selon l'état du véhicule, sans démontage. La durée exacte est enregistrée et figure dans la traçabilité du rapport. *(adjusted from the mockup's "moins d'une heure" to match the range fixed elsewhere — keep these two consistent.)*
4. **Où se déroule l'inspection ?** — Là où vous le souhaitez : chez vous, chez le vendeur, ou dans nos locaux. Sur place, l'inspecteur se déplace avec son matériel, y compris le nécessaire pour contrôler le dessous de caisse.
5. **Que veut dire « certificat vérifiable en ligne » ?** — Chaque rapport porte une référence unique et un QR code renvoyant vers une page permanente. N'importe qui — l'acheteur, un banquier, un douanier — peut confirmer que le document est authentique, à quelle date il a été émis et par quel inspecteur, sans avoir à nous contacter.
6. **Le rapport me dit-il si je dois acheter ?** — Oui. L'inspecteur donne un avis global et une position claire, appuyés sur les constats et leur chiffrage. La décision reste la vôtre, mais elle est prise sur des éléments mesurés.
7. **Que ne couvre pas l'inspection ?** — Une inspection sans démontage ne voit pas l'usure interne d'un moteur ou d'une boîte, ni une panne intermittente qui ne se manifeste pas le jour du contrôle. Les éléments hors périmètre ou dont le véhicule n'est pas équipé sont nommés dans le rapport plutôt que passés sous silence.
8. **Je suis vendeur — quel est mon intérêt ?** — Un vendeur honnête n'a aujourd'hui aucun moyen de se distinguer d'un vendeur qui ne l'est pas. Un rapport indépendant, remis spontanément et vérifiable par l'acheteur, est cet argument — et il réduit la négociation à la baisse fondée sur le doute.
9. **Je suis expert d'inspection — puis-je travailler avec vous ?** — Oui. Nous ouvrons notre réseau à des experts qui produisent, avec notre protocole et nos outils, un rapport sous leur propre marque. Les conditions se discutent au cas par cas.

Optional (matches mockup behavior, cheap to add): keep only one `<details>` open at a time on wide screens via a `toggle` listener — see the mockup's inline script for the exact 8-line pattern; trivial to port to a `useEffect`.

---

## Assets needed

- Hero: none new (reusing existing real photo).
- `ReportShowcase`: none new (reuses `CertificateVisual.jsx`).
- `PartnerLogos` / `Testimonials`: none — these are intentionally `.slot` placeholders until real logos/quotes exist. Do not source stock content to fill them.
- `CertificateVerification`: confirm whether a real verification endpoint exists in `apps/packages/certification/` before building the form's submit behavior.

## Acceptance criteria (in addition to the other spec doc's list)

- [ ] No section leads with "IA"/AI as a selling point; SEO description updated.
- [ ] No body text on a dark background below `white/80` opacity.
- [ ] `SectionNav` still has exactly 5 tabs; no new nav clutter.
- [ ] FAQ, Vérifier un certificat, Partenaires, Témoignages, Le rapport, Couverture all present on `/`.
- [ ] `CertificationFlow` shows 3 steps, no duplicate certificate rendering (only `ReportShowcase` renders `CertificateVisual`).
- [ ] Partner/testimonial placeholders use `.slot`, never invented names/quotes/logos.
- [ ] Certificate verification either links to a real check or is honest that it's not live yet — never fakes a "verified" result.
