# Bestehen / App — Design Handoff for the Architect Agent

**Purpose of this file.** You are about to define the application architecture. This document tells you what
the design system already decided, where each decision lives, which decisions are *product rules* (must be
enforced in the domain layer, not just the UI), and which are still open. Read this file first, then open the
four design documents in order.

**Read the design source, not screenshots.** Every artefact is a Design Component (`.dc.html`): plain HTML +
inline styles + a small logic class. Open them in a browser, and read the markup when you need exact values.

---

## 0. The four documents

| File | What it is | Read it for |
|---|---|---|
| `Bestehen-01-Design-System.dc.html` | Foundations, tokens, 41 components, product state models | Tokens, component contracts, state machines, iconography rule |
| `Bestehen-02-Mobile-Screens.dc.html` | 24 mobile screens, 5 acts, 390×844 | Screen inventory, real copy, edge/failure states |
| `Bestehen-03-Desktop-Responsive.dc.html` | 4 desktop layouts, 1 tablet, responsive rules | Breakpoint behaviour, desktop-only affordances |
| `Bestehen-04-Flows-Handoff.dc.html` | Flows A–G, accessibility contract, coverage matrix, build phases, open decisions | Flow states/exits, a11y acceptance criteria, sequencing |

Supporting: `Bestehen-Type-Options.dc.html` (type exploration; option **A** was chosen — historical only).

Source-of-truth order for behaviour: **Stage 28 Final Product Specification → Identity → Product Overview →
this design system.** If design and spec ever disagree, the spec wins and the design is the bug.

Anchors you can link to: `#s00 #s01 #s02 #s03` (01), `#a1 … #a5` (02), `#d1 … #d6` (03), `#f #a #c #h` (04).

---

## 1. The product in one page

- TELC B1 exam coach. Turns roughly-A1 German into a defensible pass decision.
- **Two independent gates**: Written ≥135/225 **and** Oral ≥45/75. They never merge, never average, and
  strong Written can never compensate for weak Oral. Model them as two separate aggregates.
- **Four destinations**, same order on every device: **Coach · Readiness · Train · Progress**.
  Review and Mocks live *inside* Train and must not become a fifth destination.
- **Canonical loop**: Observe → Attempt → Diagnose → Repair → Retry → Remember. This is the core state
  machine of a session (01 §3.1; screens in 02 Act 2).
- Every screen answers: *Where am I? What is holding me back? What should I do next? Who owns this outcome?*

### Hard prohibitions (enforce in code, not just in review)
No pass probability or likelihood percentage. No mascot/named character. No confetti, gems, hearts, lives,
currency, leaderboards, or dominant streaks. No AI-chat as the product. No TELC logos or accreditation
styling. No Corpus browser or provenance dashboard. No shame/"we miss you"/arithmetic countdown copy. No
coach-control percentage or obedience score. No billing, social, or enterprise-admin surfaces.

Practical consequence: there should be **no API field, no computed value and no template string** anywhere in
the system that expresses "probability of passing". If such a number exists in the model, someone will render it.

---

## 2. Design tokens → implementation

Tokens are defined as CSS custom properties in the `<helmet><style>` block of every document, under
`:root,[data-theme="light"]` and `[data-theme="dark"]`. **25 semantic tokens × 2 modes.** Full table with both
hex values: 01 §1.3.

Rules that matter architecturally:

1. **Components reference tokens only, never raw hex.** The mode swap must cost nothing.
2. `text.primary` and `surface.ink` are *different tokens that share a light value* (`#14213D`). In dark they
   diverge completely (`#E9EEF5` vs `#070C15`). Never collapse them into one variable.
3. **Status = graphic token + text token.** `status.risk.graphic #B64B4B` draws bars and dots;
   `status.risk.text #A83F3F` writes words. Same split for amber. Using the graphic hue as text fails AA.
4. Dark mode is **not** an inversion: surfaces get lighter as they rise (paper → raised → mist). Status hues
   keep their identity and gain lightness.
5. Theme default follows `prefers-color-scheme`, with a manual per-device override. The documents implement
   this in the logic class (`get theme()` + `syncBody()`) — mirror that behaviour, including painting the
   document background so overscroll matches.
6. Radii: **4** control, **6** input, **7** card, **9** panel/table, **12** sheet/dialog, **999** chip.
   Nothing above 12. Device bezels in mocks (22px) are not UI.
7. Spacing is a 4-base scale; card padding 20 mobile / 24 desktop; sticky action areas reserve 84px +
   `env(safe-area-inset-bottom)`.
8. Elevation is scarce: `e0` border only, `e1` 1px/6% for the single active plan card, `e2` 8px/12% for
   sheets, dialogs and sticky footers on scroll. Nothing else casts a shadow.
9. Focus: 2px ring at 2px offset, `focus.ring` token (`#1D6F50` light / `#4CC492` dark). `outline:none` is a
   defect.

### Type
- **Bricolage Grotesque** — screen titles and section headings only. Never below 22px, never a paragraph,
  never a number, never twice on one screen. Below 22px it hands over to Plex Sans 600.
- **IBM Plex Sans** — everything readable, **including all numbers** (`font-variant-numeric: tabular-nums`
  on every score, index and timer).
- **IBM Plex Mono** — labels, timers, evidence metadata, mono eyebrows. ≥12px only.
- All three SIL OFL, self-hostable. Fallback: Helvetica Neue, Helvetica, Arial.
- German task content: `lang="de"` + `hyphens:auto`. Never `overflow-wrap:anywhere`.
  Weakness names, content points and coach reasons **must not truncate**.

### Icons
18-glyph Lucide subset (ISC), 1.75px stroke on a 24 grid. Sizes 15 (chip) / 20 (inline) / 24 (nav), 44px
minimum target. **Rule: an icon depicts the noun or verb it stands for.** A square, diamond, triangle or bar
is a bullet, not an icon; a concept with no honest picture gets a word. One icon per meaning — no synonyms
(Listening is always headphones; a transcript borrows the Reading glyph). Nothing celebratory: no trophies,
medals, stars, flames, sparkles. Status icons are always accompanied by their word; the SVG is `aria-hidden`.

---

## 3. Domain models the UI assumes

These are the contracts the front end is drawn against. They belong in the domain layer; the UI must not be
able to invent or edit them.

### 3.1 Evidence validity — 5 states (01 §3.2)
`valid` · `partially_valid` · `pending` · `interrupted` · `not_counted`

- Only `valid` can move a component estimate. `partially_valid` counts for the unaffected scope only
  (name the scope — used after a mid-mock interruption).
- `pending` blocks only the conclusions that depend on it; unrelated coaching stays available.
- `interrupted` is useful as practice but cannot hold a clean exam-conditions claim.
- `not_counted` = content/media/evaluator fault. Copy begins **"This wasn't you."** Never red, never scored,
  never rendered in history as a low result — but it *stays visible* in history so the record is complete.
- The invalid family (`interrupted`, `not_counted`, `pending`) uses the neutral/system visual family
  (grey + dashed). Red is reserved for learner-visible wrongness and pass-critical risk.

### 3.2 Evidence labels — read-only, learner-facing (01 §2.5)
`With help` · `On your own` · `Open timing` · `Practice timing` · `Exam conditions` · `Fresh task` ·
`Seen before · practice only` · `Waiting for evaluation` · `Interrupted · practice only` ·
`Not counted · our fault`

A learner can **never** edit a label and no override changes one. They render in a fixed row directly under
the task title (attempt) and directly under the score (result). Max three visible; the rest behind
*Conditions*. These strings are API-visible semantics, not UI decoration — derive them server-side.

### 3.3 Readiness bands — 6 states (01 §3.3)
`evidence_building` · `not_ready` · `borderline` · `safe` · `ready_to_book` · `stale_contradicted`

- `evidence_building`: **no index and no component number**. Dashed empty track with the pass line still
  drawn. Never a 0, never a grey fill. The API should return *absence*, not zero.
- `not_ready`: below 55 with sufficient evidence, or repeated exam-conditions evidence under the line.
- `borderline`: 55–64.9, **or** a range crossing 60, **or** ≥65 without decision-grade breadth, **or** a live
  contradiction. The copy must name *which* of those it is — so the reason is a discriminated field, not a bool.
- `safe`: ≥65, lower range bound ≥60, medium+ confidence, complete breadth, current blueprint.
- `ready_to_book` is a **gate over Readiness, not a higher score** — a four-condition checklist; failing
  gates are named exactly (02 · 4.6).
- `stale_contradicted`: historical milestone stays true and visible; current status reverts with the reason
  and the smallest recheck that would resolve it.
- The official pass line is **60**. **65 is Bestehen's own safety margin** and must always be labelled as ours,
  never as TELC's line. (This value is an open decision — §7.)

Every component estimate carries: `estimate`, `range_low`, `range_high`, `confidence`, `evidence_age`,
`breadth_complete`, `blueprint_version`. The UI renders all of them; none is optional.

### 3.4 Progression P0–P4 (01 §3.4)
A condition, not a course level: `P0` supported foundation, `P1` guided A2, `P2` A2/B1 bridge,
`P3` independent B1, `P4` target conditions. **Never displayed as a level, badge or number.** It surfaces only
as the conditions row on a task and inside weakness detail. A learner may be P4 in Reading and P1 in Speaking
simultaneously — nothing averages them.

### 3.5 Weakness lifecycle
`candidate → known → repairing → stabilising → repaired`, with confidence and a delayed-check schedule
(7-day / 21-day obligations). "Repaired in session" ≠ "retained": only a **delayed clean check on fresh,
unseen content** upgrades it. Due items are *obligations with intervals*, never decks, card counts or debt
totals; overdue shows **days**, never an accumulated count.

### 3.6 Control boundary (01 §3.5) — enforce server-side
**Learner-controlled:** session length · time of day and days per week · which skill · easier/harder ·
request help in ordinary practice · postpone · stop mid-task · start a mock early · request exam conditions
early · notification preferences · explanation language.

**System-owned (rendered as text with an optional *Why?*, never as a control):** target blueprint and pass
rules · scoring · evidence validity and strength · assistance and timing labels · Readiness interpretation
and bands · mistake history · mock validity · what counts as fresh.

A material consequence is stated **once**, factually, in one sentence — e.g. *"Help stays available here, so
this attempt won't count toward your Reading Readiness."* Then the learner proceeds. No confirmation dialog,
no second warning, no tone change. There is no coach-control percentage and no compliance score anywhere.

### 3.7 Failure ownership (01 §3.6, 02 Act 5)
Twelve situations are specified with learner copy **and** the evidence consequence: network loss mid-Writing,
audio load failure, mic denied, silent/wrong input device, mock paused/backgrounded, evaluator slow (>30s),
evaluator outage, defective item reported, fresh P4 content exhausted, unsupported browser capability, return
after 6 weeks, blueprint version changed. Read that table before designing error handling — the required
behaviour (what is preserved, what claim is lost, what is offered next) is already decided for each.

Key invariants: a local failure never causes a global block; audio is deleted after evaluation and within
7 days maximum; a defective item is quarantined and affected published evidence is **recomputed without
penalty**; drafts survive with a ~5s loss bound and the timing claim is kept when offline.

---

## 4. Screen inventory (02) — build reference

| Act | Screens | Notes |
|---|---|---|
| 1 · Arrival | Landing · Goal & date · First probe (with help) · Placement result | No account wall. Placement ends in `evidence_building` — dashed tracks, no number. |
| 2 · Daily loop | Coach home · Attempt · Diagnose · Repair · Fresh check · Remember | The core. Attempt shell hides navigation entirely. |
| 3 · Four more skills | Listening (1 replay) · Writing (autosave + content points) · Mic pre-flight · Recording turn-taking | Same shell; only the input region changes. |
| 4 · Readiness & mocks | Readiness (both gates) · Oral detail + text alternative · Train hub · Mock pre-flight · Mock result · Ready to Book | Validity stated before any score. Exactly two post-mock priorities. |
| 5 · Edges | Mic denied · Audio failed · Offline writing · Mock interrupted · Return after 6 weeks · Data & deletion | Neutral system family throughout. |

Componentwise: five skills share **one** attempt shell, **one** result card, **one** repair card and **one**
label row. Do not fork a component per skill — that is the single most likely architectural mistake here.

### Attempt shell contract
Nav hidden · conditions row fixed under the title (never scrolls away) · timer docked top, `Hide timer`
available and never changing the timing · sticky primary action · one task per screen · no help affordance on
a fresh check · autosave status as a mono label, never a modal.

### Diagnosis contract
Score → **decisive evidence** (the exact quote/marked span that decided it) → likely cause + confidence.
Never a bare score, never advice before evidence. Praise is attached to the observation that earned it.

---

## 5. Responsive contract (03)

| Breakpoint | Behaviour |
|---|---|
| ≤479 phone | 1 column, 390 primary / 360 validated, bottom nav, sheets, sticky single action |
| 480–767 | **Deliberately identical** to phone, 24px padding, 520 centred measure. No fourth layout. |
| 768–1023 tablet | 8 cols. Nav → top rail. Readiness 2-up. Writing prompt + editor side by side. Sheets → centred dialogs. |
| 1024–1279 | 12 cols, max 1080. Persistent left sidebar. Coach = plan 7 / context 5. |
| ≥1280 | 12 cols, max 1200. Readiness 8+4 with the read-only evidence panel. Mocks keep a centred 720 measure. |

Never at any width: a card stretched to fill a row · extra charts because there is space · German task text
wider than 720px · a hover-only control · a different IA per device · a denser Readiness graphic on desktop.

Desktop adds exactly one genuinely new thing: **claim + audit trail visible together** (Readiness evidence
panel). It is read-only — inspect every input, edit none.

---

## 6. Accessibility acceptance criteria (04 · `#a`)

Treat these as test cases, not aspirations. Ten surfaces are specified with their commitment *and* how it is
tested; the four forbidden patterns are:

1. **Colour-only status** — every band, label and answer state carries word + named icon + hue.
2. **Chart-only evidence** — every scale ships a sentence in the DOM *before* the graphic (`role="img"` with
   that sentence as label) and a real `<table>` behind *Show evidence as text*.
3. **Drag-only interaction** — matching/ordering always have a select-then-place keyboard path producing
   **identical evidence**.
4. **Time pressure without control** — timers hideable, practice timing extendable; only mocks enforce
   exam timing.

Live regions: `polite` everywhere except the final-5-minutes warning and recording-failure, which are
`assertive`. **Timer ticks are never announced.** Announcement strings are listed in 04 — implement them
verbatim. Keyboard map (desktop): `1–4/a–d` select, `Enter` submit, `Space` play/pause, `R` replay,
`Esc` close overlay, `T` toggle timer, `?` shortcuts. No shortcut is required to complete a task and none
overrides a browser or screen-reader binding.

Also required: 44×44 targets with 8px spacing · reflow at 320px · 200% text zoom without loss · focus order
that follows conditions → task → question → options → action · focus moves to the first new element on step
change (never to the top of the page) · overlays trap focus, `Esc` closes, background inert, trigger regains
focus.

Motion: 120ms state change, 200ms content enter, 260ms sheet, 600ms Readiness re-draw *only when meaningful*.
Reduced motion: no translate/scale, opacity ≤100ms, the recording pulse becomes a solid dot with the word
*Recording*, timers still update numerically. **Never animated:** results appearing, mistakes, milestones —
anything a learner could read as celebration.

---

## 7. Open decisions — get answers before finalising the domain model

These are product decisions the design deliberately did not make. Each has a design assumption in place; each
changes data or copy if answered differently (04 · `#h`).

1. **Safety-margin value** — assumed 65, labelled as ours. Changes every band boundary.
2. **First-session length** — assumed 6 minutes, ending in an honest "we can't estimate yet".
3. **Evaluator SLA** — the pending banner promises "usually under a minute". If real p95 is 10 minutes, the
   flow shape changes. Audio retention ceiling: 7 days.
4. **Notification tone and frequency** — only two examples are drawn. No streak reminders, no "we miss you",
   no arithmetic countdowns.
5. **Rung visibility** — assumed never learner-visible. If support/teachers need P0–P4, it needs one
   read-only surface, not a badge.
6. **Speech-evaluation confidence floor** — below it, Oral shows `evidence_building` rather than a wide range.

---

## 8. Suggested build order (04 · `#h`)

- **Phase 1 (wks 1–6) — the loop, one skill.** Tokens (both modes) + 12 shell components · attempt shell with
  the Reading input region · result/diagnosis/repair/fresh-check · evidence labels and validity states ·
  the `evidence_building` band and its empty states. Ship the honest core before breadth.
- **Phase 2 (wks 7–14) — five skills and Readiness.** Listening player · Writing editor · Speaking pre-flight
  and turn-taking · both gates + component detail + text-alternative table · due-review groups and weakness
  lifecycle · recovery family · desktop sidebar shell and the 7/5 Coach split.
- **Phase 3 (wks 15–20) — mocks and the decision.** Measured timer + mock shell + interruption recovery ·
  validity verdict and post-mock priorities · Ready-to-Book gate and taper · desktop evidence panel and print
  of the text alternative · absence, staleness, export, deletion.

---

## 9. Explicitly out of scope

Corpus authoring and provenance tooling · evaluator dashboards · billing and subscription surfaces · account
recovery · marketing site · notification copy beyond the two examples shown · any B2 or Goethe variant.
Each is out of scope in the specification; building a surface for it implies a commitment the product has not
made.

---

## 10. Ten-minute review path

1. **02 · 2.1, 2.3, 2.6** — the plan, the diagnosis, the retention screen. If those three are right, the loop
   is right.
2. **02 · Act 5** and the evidence-building band at **02 · 1.4** — where a coaching product usually starts lying.
3. **01 · §2.5 evidence labels** — get a label wrong here and it is wrong in fifty places downstream.
4. **04 · open decisions** — the only things blocking a build-ready spec.

---

## 11. Working with these files

- `.dc.html` files open directly in a browser; each is self-contained apart from Google Fonts and the shared
  `support.js` runtime in this folder.
- Content lives in the template (markup) and in the logic class's `renderVals()` (tables and repeated data —
  tokens, breakpoints, flows, coverage matrix, accessibility rows). If you want the coverage matrix or the
  a11y contract as structured data, lift the arrays from `Bestehen-04-Flows-Handoff.dc.html`'s logic class.
- Real copy in the screens is production-intent, not lorem. Reuse it; where you need new strings, follow the
  coach-message anatomy: one sentence of fact, one of meaning, one of next action — max three sentences,
  max 56ch measure, no avatar, no first person.
