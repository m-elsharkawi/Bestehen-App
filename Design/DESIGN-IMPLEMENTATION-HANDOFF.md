# Bestehen — Design Implementation Handoff

**What this is.** The single design contract an implementation agent needs to build any Bestehen view without reading the design history or reopening a product decision. It consolidates the original handoff, the Phase 1 audit and the Phase 2–3 deltas. It is not a specification: it links to the drawn source by filename and anchor instead of restating it.

**How to use it.** Find your surface in §3. Open the anchors it names. Apply §5 composition, §6 state projection, §7 responsive/a11y, §8 copy. Ship against §11.

**Never:** fork a component per skill · invent a state word · render a fault as a score · promise a duration · name a provider · draw a password field · display a pass probability.

---

## 1. Authority and source manifest

### 1.1 Authority order (when sources disagree)

| Rank | Source | Note |
|---|---|---|
| 1 | Final product rules in `uploads/00_design_context_packet.md` | binding |
| 2 | Post-architecture corrections in the same file (§"Binding post-architecture corrections") | binding; **wins over stale design prose** |
| 3 | Accepted phase outputs: `design-05…md`, `design-06…md`, `design-07…md` and the delta artifacts `Bestehen-05`, `Bestehen-06` | resolve within these in phase order, later wins |
| 4 | `DESIGN-HANDOFF.md` and `Bestehen-01…04` `.dc.html` | original design source; correct by reference, do not redraw |
| 5 | `support.js` and renderer behaviour | illustrative only, never authority |

Upstream of all of it: Stage 28 Final Product Specification (`uploads/28-bestehen-app-product-specification.md`). If design and spec disagree, the spec wins and the design is the bug.

### 1.2 Sources

| File | Version read | Role here |
|---|---|---|
| `uploads/00_design_context_packet.md` | v1787483288040444 | binding corrections, invariants, provider implications |
| `uploads/28-bestehen-app-product-specification.md` | Stage 28 | product rules |
| `uploads/01_Bestehen_Product_Overview.md`, `uploads/02_Bestehen_Identity.md` | as uploaded | voice, positioning |
| `DESIGN-HANDOFF.md` | v1787228153367570 | tokens, type, icons, domain models, prohibitions |
| `Bestehen-01-Design-System.dc.html` | v1787212420429919 | 25 tokens × 2 modes, component library, state models |
| `Bestehen-02-Mobile-Screens.dc.html` | v1787213036122095 | **26** mobile frames (the "24" in older prose is stale) |
| `Bestehen-03-Desktop-Responsive.dc.html` | as in project | D1–D4 desktop, D5 tablet, D6 rules |
| `Bestehen-04-Flows-Handoff.dc.html` | v1787227019690661 | Flows A–G, a11y surfaces, key map, announcements, coverage |
| `design-05-post-architecture-coverage-audit.md` | v1787483519803615 | Phase 1 audit, correction matrix, owner decisions |
| `design-06-ui-foundation-handoff.md` | v1787484266195220 | Phase 2 foundation contracts |
| `Bestehen-05-UI-Foundation-Delta.dc.html` | as in project | `#u0…#u7` shell, SessionNotice, capability, upload, faults |
| `design-07-critical-view-handoff.md` | v1787501338167770 | Phase 3 family summary |
| `Bestehen-06-Critical-View-Deltas.dc.html` | v1787501279807534 | `#v0…#v9`, frames 6.1–6.15, 3 large-screen exemplars |

### 1.3 Totals implementation should expect

41 mobile frames (26 + 15) · 8 large-screen exemplars (5 + 3) · **43 components** · 25 semantic tokens × 2 modes · 20 Lucide glyphs · 5 breakpoints · 4 destinations · 5 evidence-validity values · 6 Readiness bands · 6 gates · 7 stored weakness states → 5 shown words · 3 assertive live regions.

---

## 2. Product / UI invariants

Enforce in the domain layer, not in review.

**Structure.** Four destinations, fixed order on every device: **Coach · Readiness · Train · Progress**. Review and Mocks live inside Train and never become a fifth destination; Account is a route, not a destination. One shared loop: Observe → Attempt → Diagnose → Repair → Retry → Remember (`01 §3.1`).

**Foundation.** Five skills share **one** attempt shell, **one** result/diagnosis card, **one** repair card, **one** evidence-label row. Modality regions extend that shell; they never fork it. This is the single most likely architectural mistake — `DESIGN-HANDOFF §4`.

**Gates.** Written ≥135/225 and Oral ≥45/75 are independent. They never average, never merge, never compensate. Model as two aggregates.

**Numbers that may not exist.** No pass probability, likelihood, percentage-of-passing, overall score, rung number, streak, badge or celebration — no API field, no computed value, no template string. If it exists in the model, someone renders it.

**Absence ≠ zero.** `evidence_building` returns absence, never 0, never a grey fill. Dashed track, pass line still drawn.

**Safe ≠ Ready to Book.** `safe` is a band; `ready_to_book` is a six-gate checklist over both bands and the evidence. Neither ever borrows the other's shape (`06 #v7`).

**Fault ≠ learner wrongness.** Every system/content/media/network/device/evaluator/identity/storage fault is neutral (grey + dashed, `01 §3.6`), scoped, and can never become a weakness, a low score, a zero or a Readiness decline. Red is reserved for learner-visible wrongness and pass-critical risk.

**Unit convention** (settled at `06 #v7`, corrects the "48 % estimated" string at `02 · 4.6`): component estimates render on the **0–100 band scale** (official line 60, our margin 65); gate totals render in **raw exam points** (135/225, 45/75). Never a percentage anywhere.

**Control boundary** (`01 §3.5`). Learner-controlled: session length, schedule, skill choice, easier/harder, help in ordinary practice, postpone, stop mid-task, start a mock early, request exam conditions early, notification preferences, explanation language, theme. System-owned and rendered as read-only text with an optional *Why?*: blueprint and pass rules, scoring, evidence validity and strength, assistance/timing labels, Readiness interpretation, mistake history, mock validity, freshness. A material consequence is stated **once**, in one factual sentence; no confirm dialog, no second warning.

**P0–P4** is a local task-family condition. Never a level, badge, number or global value; surfaces only in the conditions row and weakness detail.

**Prohibited surfaces:** mascots, confetti, trophies, gems, lives, leaderboards, dominant streaks, AI chat as the product, TELC accreditation styling, Corpus tooling, billing, social, enterprise admin, coach-obedience score, shame/countdown copy.

**Foundations are frozen.** Zero new tokens, type steps, radii, elevation levels, breakpoints or destinations were added in Phase 2–3. Components reference tokens only, never raw hex. `text.primary` and `surface.ink` stay distinct variables. `outline:none` is a defect (`DESIGN-HANDOFF §2`).

---

## 3. Route / view / archetype / state manifest

Route keys below are a **build convention** for identifying surfaces; only the destination set and the frames are authoritative. Every row resolves to a source anchor, a delta anchor, or an archetype + state contract.

Archetype codes: **BARE** stateless full-page shell · **APP** authenticated shell (nav + learner state) · **ATT** attempt shell (nav hidden, conditions row pinned, sticky action) · **MOCK** measured attempt shell · **RES** result/diagnosis · **REP** repair/fresh-check · **LIST** list + detail · **STATE** neutral system/recovery surface · **OVL** sheet ≤767 / centred dialog ≥768.

### 3.1 Identity and session (F1)

| Route key | View | Archetype | Anchor | States |
|---|---|---|---|---|
| `auth.entry` | Signed-out entry, deep link held | BARE | `06 #v1` 6.1 · `05 #u1 #u2` | `signed-out` |
| `auth.callback-failed` | Return from Universal Login failed | BARE | `05 #u2` · `06 #v1` | `callback-failed` (fault family) |
| `auth.expired-idle` | Session expired while idle | BARE | `05 #u2` · `06 #v1` | `expired-idle` (not a fault) |
| `auth.expired-attempt` | Session expired mid-attempt | BARE | `06 #v1` 6.2 · `05 §3.2` | `expired-mid-attempt` — draft, elapsed time and conditions claim preserved; attempt stays *in progress* |
| `auth.denied` | Access denied (closed registration) | BARE | `05 #u2` · `06 #v1` | `access-denied` — no retry loop, no waitlist copy |
| `auth.post-deletion` | Bare shell after purge | BARE | `06 #v2` | terminal; no route into a protected surface |

Rules: no credential field on any Bestehen page, ever — Auth0 Universal Login owns entry at its own origin. Return lands on the **held destination by kind**, never on Coach, never carrying content. BARE renders no destinations, no exam date, no Readiness, no counts; one heading, one explanation, one primary action, at most one secondary; theme preference still applies.

### 3.2 Arrival and the foundation route (F8)

| Route key | View | Archetype | Anchor | States |
|---|---|---|---|---|
| `arrival.landing` | Landing, no account wall | APP | `02 · 1.1` (`#a1`) | default |
| `arrival.goal` | Goal & date, planning only | APP | `02 · 1.2` | default |
| `route.foundation` | Five-part route wrapper, resumable | APP + ATT per part | `06 #v8` 6.14 | not-started · in-part · resumed · handed-off · stopped-mid-part · ceiling-reached · completed |
| `route.foundation.part` | One skill part inside the route | ATT | `02 · 1.3` + `06 #v8` | reuses ATT; checkpoint via `AutosaveStatus · CHECKPOINT` |
| `route.foundation.partial` | Partial-probe outcome | RES | `06 #v8` 6.15 | useful `evidence_building`, explicitly **not** a placement |
| `route.foundation.result` | Placement result | RES | `02 · 1.4` | `evidence_building` — dashed tracks, no number |

Route facts: normally 18–22 minutes, hard **30-minute ceiling**; at the ceiling the route ends honestly rather than truncating silently. A 6-minute partial probe may yield useful `evidence_building` and may never claim complete placement. A completed route is still `evidence_building` until decision-grade breadth exists.

### 3.3 Coach and the daily loop

| Route key | View | Archetype | Anchor | States |
|---|---|---|---|---|
| `coach.home` | Today's plan | APP | `02 · 2.1` · `03 · D1` (7/5) · `03 · D5` rail | plan present · plan empty/evidence_building · capability degraded (banner only) |
| `attempt` | Attempt, any skill | ATT | `02 · 2.2` · `01 §2.12` | in-progress · saving · offline · interrupted · submitted |
| `result` | Diagnosis | RES | `02 · 2.3` · `01 §2.6` | valid · partially_valid · pending · interrupted · not_counted · partial (capability) · unavailable+fallback |
| `repair` | One pattern, skippable | REP | `02 · 2.4` · `01 §2.7` | offered · skipped · done |
| `retry` | Fresh check, no help | ATT | `02 · 2.5` | fresh only; no help affordance exists on this screen |
| `remember` | What changed | APP | `02 · 2.6` | change recorded · nothing to record |

ATT contract: nav hidden · conditions row fixed under the title, never scrolls away · timer docked top with `Hide timer` that never changes timing · one task per screen · sticky primary action (84px + `env(safe-area-inset-bottom)`) · autosave as a mono label, never a modal.

RES contract: score → **decisive evidence** (the exact quote or marked span that decided it) → likely cause + confidence. Never a bare score. Never advice before evidence. Validity is stated **before** any score.

### 3.4 The five modality regions (one shell, swappable region)

| Skill | Region anchor | Result mapping | Extension states |
|---|---|---|---|
| Reading | `02 · 2.2, 2.5` | `02 · 2.3` | — |
| Listening | `02 · 3.1` | `02 · 2.3` | one replay enforced; audio load failure → `02 · 5.2` |
| Writing | `02 · 3.2` · `03 · D3` (4/8 split) | `02 · 2.3`, partial at `06 #v6` 6.11 | autosave, content points, offline `02 · 5.3`, submit transfer `06 #v5` |
| Speaking | `02 · 3.3` pre-flight, `3.4` turn-taking | `02 · 4.2` detail | mic denied `02 · 5.1`; capture + transfer `06 #v5` 6.9/6.10 |
| Language Elements | `06 #v4` 6.7 + 768 exemplar | `06 #v4` 6.8 | gap traversal, `a–d / 1–4` in-cloze behaviour, submit-with-gaps-left, defective gap → `not_counted`, seen-before → practice-only |

Region rule: the region swaps; the shell, conditions row, label row, sticky action, result card and repair card do not. A skill-specific fork of any of those four is a defect.

### 3.5 Readiness

| Route key | View | Archetype | Anchor | States |
|---|---|---|---|---|
| `readiness.home` | Both gates | APP | `02 · 4.1` · `03 · D2` (8+4 panel) · `03 · D5` (2-up) | the six bands, per component |
| `readiness.component` | Component detail + text alternative | APP + OVL | `02 · 4.2` | expanded · text-alternative table open |
| `readiness.pending` | One component pending | APP | `06 #v6` 6.12 | absence stated, no number, unrelated coaching intact |
| `readiness.gates` | Ready to Book | APP | `02 · 4.6` **corrected by** `06 #v7` 6.13 + ≥1280 exemplar | gates A–F each pass/fail with its own numbers |

Readiness evidence panel (≥1280, `03 · D2`) is read-only: inspect every input, edit none. It is the only genuinely new desktop affordance in the system.

### 3.6 Train (Review + Mocks nested)

| Route key | View | Archetype | Anchor | States |
|---|---|---|---|---|
| `train.hub` | Sessions, review, mocks | APP | `02 · 4.3` | — |
| `train.review` | Due-review groups | LIST | `01 §2.10` `DueReviewGroup` · `02 · 4.3` | due · overdue (**days**, never a count or debt total) · none due |
| `train.mock.preflight` | Consequences first | APP | `02 · 4.4` | — |
| `train.mock.run` | Measured mock | MOCK | `01 §2.12` · `03 · D4` (720 measure) | running · final-5 (assertive) · paused/backgrounded · block checkpoint |
| `train.mock.interrupted` | Resume choice | STATE | `02 · 5.4` | resume · abandon → `interrupted`, practice only |
| `train.mock.result` | Validity, then priorities | RES | `02 · 4.5` | validity first, then **exactly two** priorities |

### 3.7 Progress (F3)

| Route key | View | Archetype | Anchor | States |
|---|---|---|---|---|
| `progress.home` | History + weaknesses | LIST | `06 #v3` 6.5 + ≥1280 exemplar (7/5, read-only panel) | populated · empty (`evidence_building`) · loading skeleton · entry pending |
| `progress.weakness` | Weakness detail | LIST detail | `06 #v3` 6.6 | 5 shown words (§6.7) · reopened · obligations listed |
| `progress.milestone` | Milestone row | in-list | `01 §2.9` `MilestoneRow` · `06 #v3` | held · stale/contradicted (milestone stays true and visible) |

Progress **never renders a band** — Readiness lives on its own page. At 768 the ≥1280 two-up becomes list-then-detail in one column; no third layout.

### 3.8 Account, preferences and data (F2)

| Route key | View | Archetype | Anchor | States |
|---|---|---|---|---|
| `account.home` | Account & preferences | APP (nav visible, nothing selected) | `06 #v2` 6.3 | two groups: learner-controlled vs system-owned |
| `account.export` | Download everything | inline status | `06 #v2` (UploadStatus grammar) | preparing · building · ready · expired · failed |
| `account.delete` | Deletion confirm | OVL → confirm | `02 · 5.6` **corrected by** `06 #v2` 6.4 | typed confirmation · purge running · complete + residual statement |

### 3.9 Recovery and system surfaces

| Situation | Anchor | Class |
|---|---|---|
| Mic denied | `02 · 5.1` | drawn |
| Audio load failure | `02 · 5.2` | drawn |
| Network loss mid-Writing | `02 · 5.3` | drawn |
| Mock paused / backgrounded | `02 · 5.4` | drawn |
| Return after 6 weeks | `02 · 5.5` | drawn |
| Data & deletion | `02 · 5.6` + `06 #v2` | drawn + corrected |
| Upload / transfer failure | `06 #v5` 6.10 · `05 #u4` | drawn |
| Session expiry mid-attempt | `06 #v1` 6.2 | drawn |
| Evaluator slow / outage | `05 #u3` · `06 #v6` | drawn as states |
| Silent or wrong input device | derive from `02 · 3.3` + `5.1` | STATE + pre-flight copy |
| Defective item reported | derive: report entry point in-result + `ContradictionNotice`; recompute **without penalty** | STATE |
| Fresh P4 content exhausted | derive from `01 §3.6`, flow C | STATE |
| Unsupported browser capability | derive from the `5.1` pattern | STATE |
| Blueprint version changed | derive: `StaleEvidenceNotice` | STATE |

Derived surfaces get no new component and no new copy family: neutral grey + dashed, ownership → consequence → **scope** → one action.

---

## 4. Design artifact anchor index

| File | Anchors | Contains |
|---|---|---|
| `Bestehen-01-Design-System.dc.html` | `#s00` intro · `#s01` foundations (§1.3 tokens, §1.9 icons) · `#s02` components §2.1–2.14 (§2.5 labels, §2.6 result, §2.7 repair, §2.8 Readiness, §2.9 weakness, §2.11 banners, §2.12 attempt/mock/autosave, §2.13 shell/overlays/nav, §2.14 library index) · `#s03` state models (§3.1 loop, §3.2 validity, §3.3 bands, §3.4 P0–P4, §3.5 control, §3.6 failure ownership) | foundations, 43-component library, state machines |
| `Bestehen-02-Mobile-Screens.dc.html` | `#a1` 1.1–1.4 · `#a2` 2.1–2.6 · `#a3` 3.1–3.4 · `#a4` 4.1–4.6 · `#a5` 5.1–5.6 | 26 frames, production-intent copy |
| `Bestehen-03-Desktop-Responsive.dc.html` | `#d1` Coach 7/5 · `#d2` Readiness 8+4 + evidence panel · `#d3` Writing 4/8 · `#d4` mock 720 measure · `#d5` tablet rail + sheet→dialog · `#d6` prohibitions | breakpoints |
| `Bestehen-04-Flows-Handoff.dc.html` | `#f` Flows A–G · `#a` 10 a11y surfaces, key map, announcements · `#c` coverage matrix · `#h` phases + open decisions | flows, a11y acceptance, sequencing |
| `Bestehen-05-UI-Foundation-Delta.dc.html` | `#u0` scope · `#u1` shell anatomy · `#u2` SessionNotice · `#u3` capability status · `#u4` save & transfer · `#u5` fault ownership · `#u6` responsive · `#u7` a11y + announcements | Phase 2 foundation |
| `Bestehen-06-Critical-View-Deltas.dc.html` | `#v0` scope + 7 distinctions · `#v1` F1 · `#v2` F2 · `#v3` F3 · `#v4` F4 · `#v5` F5 · `#v6` F6 · `#v7` F7 · `#v8` F8 · `#v9` cross-family contracts; frames 6.1–6.15 | Phase 3 families |

Structured data (tokens, breakpoints, flows, coverage rows, a11y rows) is in each document's logic class `renderVals()` — lift the arrays rather than retyping them.

---

## 5. Shared component composition contracts

### 5.1 The anti-fork rule

One attempt shell, one result card, one repair card, one label row, one Readiness card, one banner family. If a skill, a route or a breakpoint appears to need its own version, the difference belongs in a **state or a slot**, not a new component. Rejected in Phase 2 for exactly this reason: `TransferFailureBanner`, `AuthShell`, a `ProgressBar` primitive, `ExportStatus`, `PurgeStatus` (`06 §2`).

### 5.2 Shell composition

| Shell | Composition | Rule |
|---|---|---|
| `AppShell` | nav (bottom ≤767 / top rail 768–1023 / sidebar ≥1024) + title + banner slot + content + optional sticky action | `01 §2.13`, `03 · D1/D5` |
| `AppShell · bare` | heading + explanation + one primary + at most one secondary; 420 px centred measure at **every** width | variant, not a second component. No nav, no learner data, no credential field, no link into an unreachable protected route, no second interstitial as a destination |
| `AttemptShell` | title + conditions row (pinned) + region slot + sticky action | nav hidden; region is the only variable part |
| `MockShell` | AttemptShell + measured timer + block checkpoint | final-5 rule assertive; 720 measure at ≥768 |

**Banner slot** (both shells): below the page title, above content, inside the content column at every width. In an attempt shell it sits below the conditions row, which still never scrolls away. Never in a sidebar, never inside a Readiness card, never inside the D2 evidence panel, never over the sticky action, never a toast carrying information that matters.

**Stacking:** at most **one capability banner and one system banner** per screen. If both would appear, the fault wins and the wait folds into its scope line.

### 5.3 Status primitives — who owns what

| Component | Owns | States | Anchor |
|---|---|---|---|
| `AutosaveStatus` | local durability | `SAVED hh:mm` · `SAVING…` · `OFFLINE · SAVED ON THIS DEVICE` · `CHECKPOINT · <block> DONE hh:mm` | `01 §2.12` + `05 #u4` |
| `UploadStatus` | outbound delivery of a finalised artefact | `preparing` · `sending <n>%` · `queued · offline` · `retrying` · `not sent` · `sent hh:mm` | `05 #u4` |
| `PendingBanner` | capability (AI / STT / TTS) progress | `processing` · `slow` · `pending` · `partial` · `unavailable + fallback` · `retry with fresh sample` | `05 #u3` |
| `SystemFailureBanner` | faults | four parts in order: ownership → consequence → **scope** → one action | `05 #u5` · `01 §3.6` |
| `SessionNotice` | no-learner-state moments | `signed-out` · `callback-failed` · `expired-idle` · `expired-mid-attempt` · `access-denied` | `05 #u2` |

Autosave never promises arrival; UploadStatus never promises durability. Export and purge reuse the **UploadStatus state set with different nouns** — they are not components.

### 5.4 Evidence label row

Ten read-only strings (`01 §2.5`), derived server-side, never editable, never overridden. Rendered in a fixed row directly under the task title (attempt) and directly under the score (result). Max three visible; the rest behind *Conditions*. `Seen before · practice only` is an **eligibility projection**, not a sixth validity value.

### 5.5 Overlays

Sheet ≤767 ⇄ centred dialog ≥768, identical semantics (`03 · D5`). Overlays trap focus, `Esc` closes, background inert, trigger regains focus. **Interstitials (BARE) are pages, not dialogs** — no trap, no Esc, no inert background.

### 5.6 Local state invention — forbidden

An implementation agent may not introduce: a sixth validity value, a seventh band, a sixth shown weakness word, a second save grammar, a second fault visual family, a second evidence layout, a per-device information architecture, a hover-only control, a client-computed Readiness number, a client-side gate evaluation, or an editable label. Every state word in the UI comes from the server projection in §6.

---

## 6. Domain-state → UI projection matrix

### 6.1 Identity / session / account

| Domain state | Shell | Component state | Learner sees | Evidence effect |
|---|---|---|---|---|
| no session, protected route requested | BARE | `signed-out` | destination held **by kind**; one action to sign in | none |
| callback error | BARE | `callback-failed` | fault family; opens *"This wasn't you."* | none |
| session expired, idle | BARE | `expired-idle` | ordinary event; **not** a fault, no "This wasn't you." | none |
| session expired during an attempt | BARE | `expired-mid-attempt` | draft preserved, elapsed time and conditions claim stated; "the attempt still counts" | attempt stays **in progress** — never `interrupted`, never `not_counted` |
| authenticated, not permitted | BARE | `access-denied` | one sentence, no retry loop, no waitlist copy | none |
| deletion complete | BARE | post-deletion | terminal shell | record gone |

Mid-attempt rule: live capture is finalised and **queued by `UploadStatus` before** the interstitial replaces the shell; one action only — a learner is never asked to choose between their draft and signing in; return re-enters the same attempt at the same item, conditions row first. For a measured mock the affected block follows the existing pause contract (`02 · 5.4`).

### 6.2 Plan → attempt → result → repair → retry → remember

| Domain state | Surface | Projection |
|---|---|---|
| plan generated | `coach.home` | one active plan card (the only `e1` elevation in the system) |
| no evidence yet | `coach.home`, `readiness.home` | `evidence_building` empty states; dashed track, pass line drawn, **no number** |
| attempt in progress | ATT | conditions row + autosave label |
| attempt submitted, deterministic | RES | validity → score → decisive evidence → cause + confidence |
| attempt submitted, judged | RES | capability state from §6.4 until resolved |
| weakness identified | REP | one pattern, skippable, one repair task |
| fresh check due | `retry` | no help affordance rendered at all |
| change recorded | `remember`, `progress.home` | one change entry; never animated, never celebratory |

### 6.3 Modality extensions

| Extension state | Surface | Projection |
|---|---|---|
| Listening replay used | `02 · 3.1` | replay counter; second replay unavailable, stated as a word |
| Writing content points | `02 · 3.2` | checklist, read-only derivation |
| Speaking turn n of m | `02 · 3.4` | turn-taking indicator + recording indicator (solid dot + word *Recording* under reduced motion) |
| Cloze gap focused | `06 #v4` 6.7 | gap index stated (`gap 3 of 8`); `a–d / 1–4` selects within the focused gap only |
| Cloze submitted with gaps left | `06 #v4` | stated once, factually; submission is not blocked |
| Cloze gap defective | `06 #v4`, `06 #v6` | that gap → `not_counted`, recomputed without penalty; the rest of the attempt stands |
| Seen-before content | any region | `Seen before · practice only`; result renders, estimate does not move |

### 6.4 Writing / Speaking / STT / TTS processing and Pending

Policy (never shown as numbers, never expressed as a duration): **0–15 s** static skeleton, no words · **15–30 s** `slow`, amber, in place, learner may leave · **≥30 s** explicit `pending`.

| Capability state | Colour family | Validity | Learner sees | Never |
|---|---|---|---|---|
| `processing` | none (skeleton) | in progress | static skeleton | spinner past 15 s |
| `slow` | amber | in progress | one line, learner may leave | a countdown or ETA |
| `pending` | amber | `pending` | attempt released; arrival announced later (polite) | a blocking modal |
| `partial` | amber | `partially_valid` | the unchecked **scope named**, no number over a partial basis | a score for the unjudged part |
| `unavailable + deterministic fallback` | neutral fault | scoped | deterministic part shown, judged part **withheld** | a guessed judgement |
| `retry with a fresh sample` | neutral fault | `not_counted` | smallest re-do offered; stays visible in history | rendering as a low result |

Audio keeps the stricter 7-day ceiling; at the ceiling the outcome is stated as **unresolved**, not left pending. One capability banner per screen. Never a provider name, model name, queue position, retry counter or percentage. A local capability failure never blocks unrelated coaching.

### 6.5 Evidence validity (exactly five)

| Value | Moves an estimate | Visual family | Rendering rule |
|---|---|---|---|
| `valid` | yes | normal | full result |
| `partially_valid` | unaffected scope only | normal + neutral note | the scope is **named** |
| `pending` | no | neutral | blocks only dependent conclusions |
| `interrupted` | no | neutral | useful as practice; cannot hold a clean exam-conditions claim |
| `not_counted` | no | neutral | copy opens **"This wasn't you."**; never red, never scored, never a low result in history — but **stays visible** in history |

`practice-only` is a derived eligibility/condition projection, never stored as validity.

### 6.6 Readiness bands (exactly six) and Gates A–F

| Band | Trigger | Rendering |
|---|---|---|
| `evidence_building` | insufficient evidence | absence: dashed track, pass line drawn, **no index, no component number, no zero** |
| `not_ready` | below 55 with sufficient evidence, or repeated exam-conditions evidence under the line | band word + reason |
| `borderline` | 55–64.9 **or** range crossing 60 **or** ≥65 without decision-grade breadth **or** a live contradiction | copy must name **which** — the reason is a discriminated field, not a bool |
| `safe` | ≥65, lower bound ≥60, medium+ confidence, complete breadth, current blueprint | never rendered as a step toward Ready to Book |
| `ready_to_book` | all six gates hold | a checklist result, never a higher band |
| `stale_contradicted` | staleness or contradiction | historical milestone stays true and visible; current status reverts with the reason and the smallest recheck that resolves it |

Every component estimate carries and renders: `estimate`, `range_low`, `range_high`, `confidence`, `evidence_age`, `breadth_complete`, `blueprint_version`. None is optional.

| Gate | Condition | On failure the learner is told | Group |
|---|---|---|---|
| A | Written total ≥135/225 with the safety margin applied per component | the total, and which component sits under the margin | 1 · Both gates |
| B | Oral total ≥45/75, lower range bound above the official line | the total, the range, and that the range still crosses 45 | 1 |
| C | Breadth: all five skills carry decision-grade evidence | which skill is thin, how thin, the smallest thing that would settle it | 2 · Decision-grade |
| D | At least one complete, uninterrupted mock under exam conditions | that none exists, or the last was interrupted — with its date | 2 |
| E | Currency: evidence in the age window and on the current blueprint | what went stale, when, the smallest recheck | 3 · Current & stable |
| F | Stability: no live contradiction, no pass-critical weakness reopened | which weakness reopened, on what date, that it hasn't held since | 3 |

Grouping is presentation; the set is authoritative and **every failing reason with its numbers is exposed**. A grouped view saying "two of these fail" without naming both is worse than the four-row version it replaces. Closing copy is unchanged: *you can book anyway — it's your exam*.

### 6.7 History, weakness, review, progress

Seven stored states → five shown words, nothing deleted (`06 #v3`):

| Stored | Shown | Why |
|---|---|---|
| Candidate | **Watching** | one observation is not a claim |
| Historical / Unconfirmed | **Watching · from before** | old evidence, no current check; cannot read as live |
| Known | **Working on** | the learner needs the obligation, not the label |
| Repairing | **Working on** | same action; the difference is ours to track |
| Stabilizing | **Checking it held** | names the gap between "fixed in session" and "retained" |
| Repaired | **Held** | a clean delayed check on unseen content, still spot-checked |
| Resolved | **Closed** | no further obligation; stays readable in history |
| reopen → Known | **Working on · reopened** | reopen date + contradicting evidence both shown; never deletes the earlier *Held* |

Projection rule: the **stored** value governs scheduling and evidence; the **shown** word governs what the learner is asked to do. A view may never invent a sixth word. An export contains the stored value.

Review obligations are intervals, never decks, card counts or debt totals; overdue shows **days**. "Repaired in session" ≠ retained — only a delayed clean check on fresh, unseen content upgrades it (7-day / 21-day obligations).

### 6.8 Checkpoint / upload / offline / conflict / recovery

| Domain state | Component | Projection |
|---|---|---|
| draft saved locally | `AutosaveStatus · SAVED hh:mm` | ~5 s maximum loss bound |
| offline while writing | `AutosaveStatus · OFFLINE · SAVED ON THIS DEVICE` + `02 · 5.3` | timing claim is **kept** when offline |
| mock block finished | `AutosaveStatus · CHECKPOINT · <block> DONE hh:mm` | one save grammar shared by mocks and Writing |
| artefact finalised | `UploadStatus · preparing → sending <n>%` | determinate track with a visible percentage, never an indeterminate sweep |
| offline at send time | `UploadStatus · queued · offline` | polite announcement |
| transient transfer error | `UploadStatus · retrying` | retry is automatic and **silent** — no attempt count, no error code |
| transfer failed | `UploadStatus · not sent` (fault family) | scoped to one turn/artefact; names what still works; smallest re-do first (*send again*, then *re-record*); local artefact kept |
| delivered | `UploadStatus · sent hh:mm` | polite |
| mock interrupted | `02 · 5.4` | resume or abandon → `interrupted`, practice only |
| returning after a long gap | `02 · 5.5` | evidence age stated, no shame copy |
| blueprint changed | `StaleEvidenceNotice` | what went stale + smallest recheck |
| defective item | `ContradictionNotice` | quarantined, affected published evidence **recomputed without penalty** |

Storage is invisible: progress, retry and outcome only — never a bucket, key, region or storage control.

**Multi-device conflict on the same draft is not a drawn surface.** The binding constraints are: the learner is never asked to choose between drafts, no work is silently discarded, and the attempt's validity does not change. If the owner wants a learner-visible resolution UI, that is a new surface — see Q-3 in §12.

### 6.9 Export, deletion and bounded backup truth

| Domain state | Projection |
|---|---|
| export requested | `preparing` → `building` → `ready` → (`expired` \| `failed`), UploadStatus grammar with export nouns |
| export content | the same data the D2 evidence panel shows, described **by content, not schema**; contains stored values (e.g. all seven weakness states) |
| deletion confirmed | typed confirmation; access revoked immediately; live purge starts immediately |
| purge running | `purge running` state; nothing pretends to be instantaneous |
| purge complete | post-deletion bare shell |
| residual truth | one neutral sentence: access ends immediately, purge starts immediately, an inaccessible encrypted copy under restore suppression may persist **at most 91 days**; raw learner audio is excluded and stricter (immediate after finalisation, 7-day absolute ceiling). **No provider or infrastructure name.** |

The original string *"It cannot be undone and there is no backup"* (`02 · 5.6`) is **retired** — it is now inaccurate. Final wording is provisional pending D6/D7 (§12).

---

## 7. Responsive and accessibility contracts

### 7.1 Responsive by archetype (not by screen)

| Breakpoint | Rule |
|---|---|
| ≤479 phone | 1 column, 390 primary / 360 validated, bottom nav, sheets, sticky single action |
| 480–767 | **deliberately identical to phone**, 24 px padding, 520 centred measure. No fourth layout |
| 768–1023 tablet | 8 cols, nav → top rail, Readiness 2-up, Writing prompt+editor side by side, sheets → centred dialogs |
| 1024–1279 | 12 cols, max 1080, persistent left sidebar, Coach = plan 7 / context 5 |
| ≥1280 | 12 cols, max 1200, Readiness 8+4 with read-only evidence panel, mocks keep a centred 720 measure |

| Archetype | Behaviour across all five |
|---|---|
| BARE | one 420 px centred measure at every width; no rail at 768, no sidebar at ≥1024, vertically centred, nothing stretches. This also satisfies 320 px reflow without a second rule |
| APP list/detail | phone = list → detail route; ≥1280 = list + **read-only** panel (Progress `06 #v3`); 768 = list-then-detail in one column |
| ATT / MOCK | phone layout centred at every width; German task text never wider than 720 px |
| Writing region | 4/8 prompt/editor at ≥1024 (`03 · D3`) |
| Readiness | 2-up at 768, 8+4 + audit panel at ≥1280 (`03 · D2`) |
| Cloze region | phone: options in flow; **768: options leave the text flow** (`06 #v4`) — the only region that changes shape |
| Gates | phone: three groups stacked; ≥1280: gates 8 + evidence panel 4 (`06 #v7`) |
| Banners / status | content column only, at every width |

**Never at any width:** a card stretched to fill a row · extra charts because there is space · German task text wider than 720 px · a hover-only control · a different IA per device · a denser Readiness graphic on desktop. Only three surfaces earn a large-screen exemplar in the deltas (Progress ≥1280, Gates ≥1280, cloze 768); everything else is the phone layout, centred.

### 7.2 Accessibility acceptance tests

WCAG 2.2 AA is a release criterion. Each row is a test, not an aspiration.

| # | Test | Pass condition |
|---|---|---|
| A1 | Focus order | conditions → task → question → options → action, on every attempt surface and every modality region |
| A2 | Focus on step change | moves to the **first new element**, never the top of the document; on BARE, to the notice `h1` |
| A3 | Focus return | overlay trigger regains focus on close; BARE return lands on the held destination |
| A4 | Keyboard completion | every task, every gate view, every cloze gap, all five SessionNotice states, completable with keyboard alone |
| A5 | Key map | `1–4 / a–d` select, `Enter` submit, `Space` play/pause, `R` replay, `Esc` close overlay, `T` toggle timer, `?` shortcuts. In a cloze, `a–d / 1–4` acts on the focused gap only. No shortcut is required to complete a task; none overrides a browser or AT binding |
| A6 | Live regions | polite everywhere except exactly three assertive: final-5-minutes, recording failure, sign-out during a timed attempt. Timer ticks and progress values are **never** announced |
| A7 | Announcement strings | implemented **verbatim** from `04 #a` (6) + `05 #u7` (8) + `06 #v9` (7) = 21 strings. One announcement per transition; `slow → pending` announces once, at pending |
| A8 | Text alternatives | every scale ships a sentence in the DOM **before** the graphic (`role="img"` with that sentence as label) and a real `<table>` behind *Show evidence as text* |
| A9 | Non-colour meaning | every band, label, status and answer state carries word + named icon + hue; status SVGs are `aria-hidden` |
| A10 | Drag-free | matching/ordering have a select-then-place keyboard path producing **identical evidence** |
| A11 | Timers | hideable without changing timing; practice timing extendable; only mocks enforce exam timing |
| A12 | 320 px reflow | all 41 frames and the 8 exemplars, no horizontal scroll, no loss |
| A13 | 200 % zoom | no loss of content or function |
| A14 | Target size | 44 × 44 with 8 px spacing, including any action introduced by a banner (must be Tab-reachable from the banner text) |
| A15 | Reduced motion | no translate/scale; opacity ≤100 ms; recording pulse → solid dot + word *Recording*; timers still update numerically; skeletons static in both settings |
| A16 | Never animated | results appearing, mistakes, milestones, arrivals, recoveries — anything readable as celebration |
| A17 | Overlays vs pages | overlays trap focus + Esc + inert background; interstitials do none of these |
| A18 | Language | German task content `lang="de"` + `hyphens:auto`, never `overflow-wrap:anywhere`; weakness names, content points and coach reasons must not truncate |

Motion budget: 120 ms state change, 200 ms content enter, 260 ms sheet, 600 ms Readiness re-draw only when meaningful.

Test matrix: the 10 a11y surfaces in `04 #a` plus 5 rows from Phase 2 and 6 from Phase 3. The screen-count string in that matrix reads **26 + 15**, not 24.

---

## 8. Copy and fault-ownership rules

### 8.1 Three classes of string

| Class | Source | Rule |
|---|---|---|
| **Fixed production-intent copy** | the drawn frames in `02` and `06`; the 21 announcement strings; the fault opener *"This wasn't you."*; the band and label words; the five shown weakness words; the Ready-to-Book closing sentence | reuse **verbatim**. Not lorem, not a suggestion. Changing one changes meaning in fifty places |
| **Structured server-owned reasons** | the ten evidence labels · validity values · band selection and its discriminated `borderline` reason · each gate's failing reason with its numbers · weakness stored state · staleness/contradiction reason · fault scope line | derived server-side, rendered read-only. The client never composes, edits or infers one |
| **May vary without changing meaning** | headings and section titles, plan-card phrasing, empty-state second sentences, button labels within the drawn intent, help text | must still obey the anatomy below |

### 8.2 Coach message anatomy

One sentence of fact (observation) → one of meaning → one of next action. **Max three sentences, max 56 ch measure.** No avatar, no first person, no mascot voice. Praise attaches to the observation that earned it, never free-floating.

### 8.3 Fault ownership

`SystemFailureBanner` requires four parts **in this order**: ownership → consequence → **scope (what still works)** → exactly one action. No fault may be felt as global.

- System faults open with *"This wasn't you."*; **ordinary events do not** — an ordinary sign-in or an idle expiry did not fail.
- No duration is ever promised ("Usually under a minute" is retired at `01 §2.11` line 586).
- No provider name, model name, bucket, key, region, error code, queue position or retry counter appears in learner copy.
- A material consequence is stated once, factually — e.g. *"Help stays available here, so this attempt won't count toward your Reading Readiness."* — then the learner proceeds.
- Twelve original recovery situations plus four architecture-created ones (identity, transfer, capability, storage) live in the single `01 §3.6` table shape. Do not start a second table.

### 8.4 Forbidden copy

Pass probability or likelihood · percentage of passing · overall score · rung/level/badge · streak or countdown arithmetic · "we miss you" or shame framing · celebration language on results, mistakes or milestones · TELC accreditation claims · anything that presents 65 as TELC's line (it is **ours**, versioned, always labelled as ours).

---

## 9. Auth / storage / AI capability-state rules

Providers are implementation facts. The learner UI expresses **capability states**, never providers.

| Provider fact | Learner-visible consequence | Explicitly forbidden in UI |
|---|---|---|
| Auth0 Universal Login (personal phase onward) | signed-out redirect, callback failure, session expired (idle + mid-attempt), access denied, account/profile/data surfaces | any credential, password, MFA or recovery form on a Bestehen page; a provider name in copy; a link into a protected route the shell cannot reach |
| Closed-registration personal deployment | `access-denied` state, no self-registration path | waitlist copy, retry loop, invitation marketing |
| App-owned learner ID; guest/account-optional preserved but not live | the "no account wall" promise at `02 · 1.1` **stays**; the guest entry path is designed and disabled | deleting the promise, or shipping a guest path before D2 is confirmed |
| Cloudflare R2 private object storage | upload progress, retry, queue, failure, deletion behaviour | bucket, key, region, URL, storage control, or any storage word in a fault sentence |
| Commercial AI for Writing/Speaking evaluation | the six capability states of §6.4 | provider routing, model choice, model name, token/queue telemetry |
| Commercial STT | Speaking transcript appears under the same capability states; transcript borrows the Reading glyph | a second banner family, a confidence number |
| Commercial TTS | Listening audio under the same states; failure → `02 · 5.2` | naming synthesis, offering voice selection |
| Off-server encrypted backups | the ≤91-day restore-suppressed residual sentence (§6.9) | infrastructure names, restore offers, retention dashboards |

Capability-state rule of thumb: if the learner could infer *which vendor is slow*, the copy is wrong. If a capability is down, the deterministic part of the product keeps working and says so.

---

## 10. Vertical-slice implementation sequence

Build one truthful path end-to-end before breadth. Each slice ships only when its §11 checklist passes.

**Slice 1 — the honest vertical (authenticated entry → Readiness projection).**
`auth.entry` + `auth.expired-attempt` (BARE + SessionNotice, 5 states) → `coach.home` → one attempt in **Reading** (ATT + region) → deterministic result (RES) **or** `pending` via `PendingBanner` → `repair` → `retry` (fresh check, no help) → `remember` → `progress.home` entry + `readiness.home` in `evidence_building`.
Includes: 25 tokens × 2 modes, both shells, banner slot, conditions row, evidence label row, five validity values, `AutosaveStatus`, focus/announcement contract for those surfaces.
Proves: absence ≠ zero · fault ≠ learner error · a session boundary does not damage evidence.

**Slice 2 — truthful judged skills.** Writing region (`03 · D3`) and Speaking capture (`06 #v5`) with `UploadStatus`, the full six capability states, `partial` with named scope, `unavailable + deterministic fallback`, `retry with a fresh sample`. **Do not present the product as complete before this slice ships** — a build that only shows deterministic skills overstates what it can evaluate.

**Slice 3 — breadth.** Listening region, Language Elements region (`06 #v4`, incl. the 768 arrangement), `train.hub`, due-review groups, weakness lifecycle projection, `progress.weakness`.

**Slice 4 — the decision.** Mock pre-flight, MOCK shell, interruption recovery, mock result with validity-first and exactly two priorities, Readiness component detail + text alternative, Gates A–F (`06 #v7`), ≥1280 evidence panel.

**Slice 5 — the route and the record.** Foundation route (`06 #v8`) with resume, checkpoint, ceiling and partial-probe outcome; `account.home`, export states, deletion + purge + post-deletion shell.

**Cross-cutting, every slice:** desktop shell and the 7/5 Coach split arrive with Slice 1's Coach; the a11y tests in §7.2 are per-slice gates, not a final phase.

---

## 11. Per-view design QA checklist

Apply to every pull request that adds or changes a view. Twelve checks, all binary.

1. **Anchor.** The PR names the source or delta anchor it implements (or the archetype + state contract from §3).
2. **No fork.** No new shell, result, repair or label component. Differences are states or slots.
3. **State coverage.** Every state in the view's §3 row renders, including empty, loading, degraded and fault.
4. **Absence.** Nothing renders a 0, a grey fill, an average or a percentage where the domain says absence.
5. **Validity first.** Any score is preceded by its validity and its evidence labels; diagnosis shows decisive evidence before advice.
6. **Fault family.** Faults are neutral grey + dashed with ownership → consequence → scope → one action; red appears only for learner wrongness or pass-critical risk.
7. **Copy class.** Fixed strings are verbatim; server reasons are rendered, not composed; new strings obey ≤3 sentences / ≤56 ch / no first person / no promised duration / no provider name.
8. **Tokens.** No raw hex, no new token, no `outline:none`; both themes checked; `text.primary` and `surface.ink` not collapsed.
9. **Type & icons.** Bricolage ≥22 px, titles only, once per screen; Plex Sans for **all** numbers with `tabular-nums`; Plex Mono ≥12 px for labels; every icon depicts its noun and is paired with its word.
10. **Responsive.** Correct behaviour at 390, 480, 768, 1024, 1280 per §7.1; no stretched card, no extra chart, no hover-only control, no German task text over 720 px.
11. **A11y.** Focus order and step-change focus, keyboard completion, correct politeness, 44 × 44, 320 px, 200 %, reduced motion, text alternative if any graphic carries evidence.
12. **Prohibitions.** No probability, badge, streak, celebration, provider name, credential field, storage control or learner-editable label.

---

## 12. Corrections resolved, questions still open, out of scope

### 12.1 Resolved — do not reopen

| # | Correction | Status |
|---|---|---|
| 1 | First diagnostic is a resumable five-skill route, 18–22 min, 30-min ceiling; 6-min partial probe = useful `evidence_building`, never a placement | drawn `06 #v8`; original open decision 2 **retired** |
| 2 | AI copy reflects measured policy (~15 s / ~30 s); no duration promised; "Usually under a minute" retired | drawn `05 #u3`, `06 #v6`; open decision 3 **retired** |
| 3 | Ready to Book = Gates A–F, grouped, every failing reason exposed | drawn `06 #v7`; supersedes the four-condition list at `02 · 4.6` |
| 4 | Weakness lifecycle = 7 states + reopen→Known; learner projection = 5 words, nothing deleted | drawn `06 #v3` |
| 5 | Deletion: immediate revoke + immediate purge; ≤91-day inaccessible encrypted residual; audio excluded and stricter | drawn `06 #v2`; "no backup" string retired |
| 6 | `practice-only` is a projection, not a sixth validity value | annotated |
| 7 | Auth0 owns credential entry; app owns session/account surfaces | drawn `05 #u2`, `06 #v1` |
| 8 | Unit convention: 0–100 band scale for component estimates, raw points for gates, never a percentage | settled `06 #v7`; corrects "48 % estimated" |
| 9 | 26 mobile frames authoritative (not 24); now 26 + 15 | corrected by reference |
| 10 | Assertive live regions = 3 (final-5, recording failure, sign-out during a timed attempt) | `05 #u7` |
| 11 | Export/purge reuse `UploadStatus`; no `ExportStatus`/`PurgeStatus` components | `06 §2` |
| 12 | Library count 41 → 43; icons 18 → 20; zero new tokens, type steps, grid or breakpoints | `05 §2` |

### 12.2 Open — owner decisions, none blocking a build

| ID | Question | Design default in place | Blocks |
|---|---|---|---|
| D1 | Safety-margin value | **65**, always labelled as ours, versioned | final numbers behind Gate A; no layout change |
| D2 | Guest / account-optional live, or capability-only? | **capability-only**: closed-registration entry, guest path designed and disabled, "no account wall" promise retained | one entry path into F1 |
| D3 | Notification tone and frequency | two drawn examples only; no streaks, no "we miss you", no countdown | notification copy set (out of scope here) |
| D4 | Rung (P0–P4) visibility | **never learner-visible**; conditions row carries the meaning | nothing drawn |
| D5 | Speech-evaluation confidence floor | below floor → `evidence_building`, never a wide range | final numbers behind Gate B; no layout change |
| D6 | Export scope and format wording | JSON, same data as the D2 evidence panel, described by content not schema | freezes one provisional string at 6.3/6.4 |
| D7 | Exact wording of the ≤91-day residual sentence | one neutral sentence (§6.9) | freezes the second provisional string at 6.4 |

Both provisional strings are marked in the 6.4 footer. Ship them as drawn and swap on confirmation; no layout depends on either.

### 12.3 True remaining design questions

| ID | Question | Constraint that already applies |
|---|---|---|
| Q-1 | Does the personal deployment need a support-facing read-only rung surface? | If yes it is one read-only surface, never a badge (D4) |
| Q-2 | Does a completed foundation route ever exit `evidence_building` before a mock exists? | Gate C/D govern; the UI must not imply placement |
| Q-3 | Multi-device draft conflict: is a learner-visible resolution needed? | Not drawn. Constraints: never ask the learner to choose between drafts; never silently discard work; validity unchanged. A chooser would be a new surface and needs an owner decision |
| Q-4 | Notification surfaces beyond the two drawn examples | Out of scope until D3 |

### 12.4 Explicitly out of scope — building a surface implies a commitment the product has not made

Corpus authoring and provenance tooling · evaluator dashboards · billing and subscription · account recovery flows · marketing site · notification copy beyond the two examples · any B2 or Goethe variant · teacher/enterprise administration · social features · a provider or infrastructure status page · any pass-probability surface in any form.

---

*Compiled from the sources in §1.2. No new visual artifact was produced for this document; every visual decision it references is drawn in `Bestehen-01` … `Bestehen-06`.*
