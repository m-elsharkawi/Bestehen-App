# Design 05 — Post-Architecture Coverage Audit

Phase 1 audit only. No new mockups, no production code, no redesign of covered screens.
Codes used throughout: **R** ready · **C** copy/state correction only · **D** derivable from an existing archetype + documented variants · **A** ambiguous · **M** missing (needs a design delta).

---

## 1. Executive verdict

**Ready with bounded deltas.**

The visual and interaction contract is implementation-ready for the whole learner loop: tokens, the 41-component library, one shared attempt/result/repair/label foundation, the six Readiness bands, the five evidence-validity values, the recovery family, Flows A–G, five breakpoints and a testable WCAG 2.2 AA contract all exist as human-authored source. Nothing in the completed architecture invalidates them.

The gaps are narrow and all sit at the seams the architecture newly created or newly retimed: **identity/session** (nothing exists — no signed-out, callback-failure, session-expired or access-denied surface), **one of five modality regions** (Language Elements has components but no input region), **one of four destinations** (Progress is in every nav bar and has no frame), **AI timing policy** (the pending banner promises a provider time the new policy forbids), **Gates A–F** (drawn as four conditions), **outbound upload/retry** (R2-backed capture lifecycle is undrawn), **weakness lifecycle** (5 drawn states vs 7 authoritative), and **export/deletion truth** (drawn copy says "no backup"; policy allows a restore-suppressed residual ≤91 days).

Eight view families, capped as required, close all of it. No foundation rework is needed — the deltas extend the existing system rather than replace any part of it.

---

## 2. Source manifest

| Source | Version read | Authority | Used for |
|---|---|---|---|
| `uploads/00_design_context_packet.md` | v1787483288040444 | 1–2 (binding) | Corrections, provider implications, invariants |
| `uploads/28-bestehen-app-product-specification.md` | Stage 28 | product rules | Account-optional, retention, export, deferred items |
| `uploads/01_Bestehen_Product_Overview.md`, `uploads/02_Bestehen_Identity.md` | as uploaded | context | Voice, positioning |
| `DESIGN-HANDOFF.md` | v1787228153367570 | 3 | Token/type/icon rules, domain models, phases, open decisions |
| `Bestehen-01-Design-System.dc.html` | v1787212420429919 | 3 | 25 tokens × 2 modes, §2.1–2.14 (41 components), §3.1–3.6 |
| `Bestehen-02-Mobile-Screens.dc.html` | v1787213036122095 | 3 | **26 frames verified** (4+6+4+6+6), Acts 1–5 |
| `Bestehen-03-Desktop-Responsive.dc.html` | as in project | 3 | D1–D4 desktop, D5 tablet, D6 rules |
| `Bestehen-04-Flows-Handoff.dc.html` | v1787227019690661 | 3 | Flows A–G, 10 a11y surfaces, 8 keys, 6 announcements, 14 coverage rows, 3 phases, 6 open decisions |
| `support.js` | present | runtime | Illustrative only (authority 4) |

Frame count reconciled: **26 mobile frames are authoritative.** The `24` in the 02 footer, in the a11y "Targets and zoom" test row, and in `DESIGN-HANDOFF.md` §0 is stale prose — correct by reference, do not redraw.

---

## 3. Route / view / archetype / state coverage matrix

### 3a. Navigation destinations (4, fixed order, every breakpoint)

| Destination | Mobile | Tablet/Desktop | Status |
|---|---|---|---|
| Coach | 02 · 2.1 | 03 · D1 (7/5 split), D5 rail | **R** |
| Readiness | 02 · 4.1, 4.2 | 03 · D2 (8+4 + read-only evidence panel), D5 2-up | **R** |
| Train (Review + Mocks nested) | 02 · 4.3 | inherits D1 shell | **R** |
| Progress | nav item only (02 2.1/4.1/4.3 bottom nav) | nav item only | **M — no frame at any breakpoint** |

### 3b. Route vs modal/sheet boundaries

| Boundary | Where specified | Status |
|---|---|---|
| App shell → attempt shell (nav hidden, sticky action, conditions row pinned) | 01 §2.12–2.13 · 02 2.2 · handoff §4 | **R** |
| Attempt shell → mock shell (measured timer, final-5 rule) | 01 §2.12 · 02 4.4 · 03 D4 | **R** |
| Sheet ≤767 ⇄ centred dialog ≥768, identical semantics | 03 · D5 | **R** |
| Overlay contract (focus trap, Esc, inert background, trigger refocus) | 04 · a11y "Overlays" | **R** |
| Auth0 Universal Login hand-off + return (external boundary) | nowhere | **M** |
| Deep-link into an attempt while signed out / session expired | nowhere | **M** |

### 3c. Reusable page archetypes (do not fork per skill)

| Archetype | Source | Status |
|---|---|---|
| Attempt shell + swappable input region | 01 §2.12 · 02 2.2 | **R** |
| Result / diagnosis (score → decisive evidence → cause + confidence) | 01 §2.6 · 02 2.3 | **R** |
| Repair card + fresh-check banner | 01 §2.7 · 02 2.4–2.5 | **R** |
| Evidence label row (attempt + result positions) | 01 §2.5 | **R** |
| Readiness component card + pass-line scale + text alternative | 01 §2.8 · 02 4.1–4.2 · 03 D2 | **R** |
| Neutral system/recovery surface (grey + dashed family) | 01 §2.11, §3.6 · 02 Act 5 | **R** |
| Gate checklist (named failing reasons) | 02 · 4.6 | **C** (four → six gates) |
| Data & retention surface | 02 · 5.6 | **C** (deletion truth, export states) |
| Full-page interstitial with no learner state (auth, session) | — | **M** |
| Longitudinal history / lifecycle list + detail | components only (ChangeTimeline, MilestoneRow, WeaknessCard) | **M** as a composition |

### 3d. Modality input regions (five skills, one shell)

| Region | Frame | Components | Status |
|---|---|---|---|
| Reading | 02 · 2.2, 2.5 | ReadingTextPane, QuestionList, AnswerChoice | **R** |
| Listening (1 replay) | 02 · 3.1 | AudioPlayer, ReplayCounter, TranscriptPane | **R** |
| Writing (autosave, content points) | 02 · 3.2 · 03 D3 | WritingEditor, ContentPointChecklist, AutosaveStatus | **R** |
| Speaking (pre-flight, turn-taking) | 02 · 3.3, 3.4 | MicPreflight, RecordingIndicator, TurnTaking, PartnerTurn | **R** |
| **Language Elements (cloze/Sprachbausteine)** | none — appears only as a score row (02 4.5) and a scope row (02 5.4) | ClozeGap (01 §2.3), ClozeTextPane | **M** — region layout, gap traversal and keyboard model undrawn |

### 3e. Domain state variants (annotate, do not duplicate screens)

| Model | Values | Rendered where | Status |
|---|---|---|---|
| Evidence validity | valid · partially_valid · pending · interrupted · not_counted | 01 §3.2 · 02 5.2, 5.4 | **R** (5 values, no drift) |
| `practice-only` | eligibility/condition projection | labels in 01 §2.5, flow D exits | **C** — must be documented explicitly as *not* a 6th validity |
| Readiness bands | 6 incl. evidence_building (absence, dashed, no zero) and stale_contradicted | 01 §3.3 · 02 1.4, 4.1 | **R** |
| Ready to Book | Gates A–F, every failing reason exposed | 02 4.6 shows **4** conditions | **C** |
| Weakness lifecycle | Candidate · Historical/Unconfirmed · Known · Repairing · Stabilizing · Repaired · Resolved + reopen→Known | 01 §2.9, §3.5 and flow B/C carry **5** states | **C** + **M** (no detail/list view to project the subset in) |
| Progression P0–P4 | local task-family condition, never a level/badge | 01 §3.4 · conditions row | **R** (rule) |
| Estimate payload | estimate, range_low/high, confidence, evidence_age, breadth_complete, blueprint_version | 01 §3.3 · 03 D2 panel | **R** |
| Pass-probability | must not exist | absent everywhere | **R** (rule holds) |

### 3f. Breakpoint / accessibility exemplars

| Surface | Coverage | Status |
|---|---|---|
| ≤479 phone (390 primary, 360 validated) | 26 frames | **R** |
| 480–767 deliberately phone-like | 03 · D5 note | **R** |
| 768 tablet (top rail, 2-up Readiness, dialog) | 03 · D5 | **R** |
| 1024 (sidebar, prompt 4/editor 8) | 03 · D3 | **R** |
| ≥1280 (12 col, Readiness 8+4, mock 720 measure) | 03 · D1, D2, D4 | **R** |
| Keyboard completion + 8-key map | 04 a11y + keys | **R** |
| Screen-reader meaning, 6 verbatim announcements, polite/assertive split | 04 | **R** |
| 320 px reflow · 200% zoom · 44×44 | 04 a11y row 9 | **C** (test row says 24 screens; must read 26 + the new families) |
| Reduced motion (pulse → solid dot + word) | handoff §6 · 04 | **R** |
| Text-equivalent charts, drag-free alternatives, controlled timers, focus restoration | 04, four forbidden patterns | **R** |

---

## 4. Post-architecture correction matrix

| # | Binding correction | Existing artifact says | Affected surfaces | Action | Class |
|---|---|---|---|---|---|
| 1 | Diagnostic = resumable five-skill foundation route, 18–22 min, 30 min ceiling; a 6-min partial probe may yield `evidence_building` but cannot claim placement | 02 1.1 "FIRST SESSION · 6 MINUTES"; 1.3 one reading task + one spoken answer; 04 open decision 2 frames 6-vs-12 as unresolved | 02 1.1, 1.3, 1.4; flow A; open decision 2 | Retire open decision 2. New route shape + resume + partial-probe outcome = **new family (F8)**. Reuse 1.4's evidence-building result. | C + M |
| 2 | AI copy reflects measured policy: first useful feedback ~15 s, explicit Pending ~30 s under degradation; no provider time promised | 01 §2.11 "Usually under a minute"; 01 §3.6 "evaluator slow (>30s)"; 04 open decision 3 | PendingBanner, 02 2.3, 3.2, 4.5, mock partial-pending | Retire open decision 3. Replace the promise string; add processing/partial/unavailable/fallback states = **F6**. | C + M |
| 3 | Ready to Book has authoritative Gates A–F; grouping allowed, every failing reason exposed | 02 4.6 "Four conditions have to hold" (3 pass, 1 fails) | 02 4.6, ReadyToBookGate, flow E | Extend to six gates with grouping; keep the existing red-in-list treatment and "you can book anyway" copy verbatim. | C |
| 4 | Weakness lifecycle = 7 states + reopen→Known; learner views may project a subset without deleting truth | 5-state chain in 01 §2.9 and flows B/C | WeaknessCard, DueReviewGroup, 02 2.6, 4.3, Progress | Extend the state contract; declare the learner projection; needs a detail/list host = **F3**. | C + M |
| 5 | Deletion revokes access and purges immediately; encrypted restore-suppressed residual ≤91 days; raw audio excluded (immediate-after-finalization, 7-day ceiling) | 02 5.6 "It cannot be undone and there is no backup"; flow G "typed confirmation, no backup" | 02 5.6, flow G, mic pre-flight promise | Rewrite two strings to state the residual honestly without provider names; add purge-in-progress + post-deletion states = **F2**. | C + M |
| 6 | `practice-only` is an eligibility/condition projection, not a 6th validity value | Implicit; validity set is correctly 5 but "practice only" reads label-like in 01 §2.5 and flow D | 01 §2.5, §3.2, flow D exits | Annotate the label table: derived projection, never stored as validity. | C |
| 7 | Auth0 owns credential entry; app needs signed-out redirect, callback failure, session expired, access denied, account/profile/data — never a custom password form | No auth or account surface exists in any artifact | new | **F1** + **F2**. Explicitly forbid drawing a password field. | M |
| 8 | Closed-registration personal deployment, but app-owned learner ID and future account-optional/guest capability preserved | Spec §15 and 02 1.1 promise "no account wall" | 02 1.1, F1 | Owner decision D6 (§9) — affects one entry path, not the loop. | A |
| 9 | R2 is private infrastructure; learner sees upload/progress/retry/deletion only | 5.1 permission, 5.2 playback failure, 5.3 offline draft — no outbound upload lifecycle | Speaking capture, Writing submit, mock submit | **F5**. | M |
| 10 | AI/STT/TTS are asynchronous replaceable capabilities; no provider routing or model names | No provider leakage present | whole system | **R** — rule already satisfied. | R |
| 11 | 26 mobile frames authoritative | "24" in 02 footer, a11y test row, handoff §0 | prose only | Correct by reference. | C |
| 12 | Safety margin 65 is Bestehen's versioned default, distinct from the official 60 | Already labelled as ours (01 §3.3, 02 4.1) | bands | **R**; value itself remains owner decision D1. | R |

### The 12 recovery situations

| Situation | Drawn | Status |
|---|---|---|
| Network loss mid-Writing | 02 · 5.3 | R |
| Audio load failure | 02 · 5.2 | R |
| Mic denied | 02 · 5.1 (+ 3.3 pre-flight) | R |
| Silent / wrong input device | 01 §3.6 only | **D** from 3.3 + 5.1 |
| Mock paused / backgrounded | 02 · 5.4 | R |
| Evaluator slow | 01 §3.6 (>30 s) + 01 §2.11 | **C** → retime to 15/30 s (F6) |
| Evaluator outage | 01 §3.6 only | **M** → F6 (unavailable + deterministic fallback) |
| Defective item reported | 01 §3.6, flow F | **D** (report entry point exists in-result; recompute-without-penalty notice = ContradictionNotice variant) |
| Fresh P4 content exhausted | 01 §3.6, flow C ("transfer check pending") | **D** |
| Unsupported browser capability | 01 §3.6 only | **D** from 5.1 pattern |
| Return after 6 weeks | 02 · 5.5 | R |
| Blueprint version changed | 01 §3.6, flow G, StaleEvidenceNotice | **D** |
| *(new, provider-derived)* upload failure / retry | — | **M** → F5 |
| *(new, provider-derived)* session expired mid-attempt | — | **M** → F1 (must preserve the attempt and the timing claim) |

---

## 5. Deltas, prioritized

**P0 — blocks a safe build**

| ID | Delta | Why it cannot be derived |
|---|---|---|
| P0-1 | Identity & session family (signed-out entry/redirect, callback failure, session expired **mid-attempt**, access denied) | No archetype exists for a stateless full-page interstitial; and session loss mid-attempt must read as a *system* fault that preserves the draft and the timing claim — the wrong visual family here silently damages evidence. → F1 |
| P0-2 | AI processing / Pending / partial / unavailable / retry-fresh-sample / deterministic fallback | Correction 2 changes both timing and shape; 01 §2.11 has one banner and a false promise string. Four of the six states have never been drawn. → F6 |
| P0-3 | Language Elements input region | Fifth modality; ClozeGap exists as a control, but gap traversal order, focus model, and the `1–4/a–d` key map's behaviour inside a cloze are undefined — an a11y acceptance criterion cannot be tested against it. → F4 |
| P0-4 | Ready to Book Gates A–F | Copy correction with a layout consequence (six named gates, grouped, all failing reasons visible). → C on 02 4.6 |
| P0-5 | Deletion & export truth | Current string ("no backup") is now inaccurate; export has no progress/ready/failed state. → C + F2 |

**P1 — needed before breadth ships**

| ID | Delta | Why |
|---|---|---|
| P1-1 | Progress destination | A nav destination with no frame; three components exist but their composition, empty state and stale/contradicted milestone behaviour are undrawn. → F3 |
| P1-2 | Weakness lifecycle projection + detail | 7 states, reopen behaviour, and "project a subset without deleting truth" need one visible decision. → F3 |
| P1-3 | Media/upload lifecycle | Recording → upload progress → retry → offline queue → provider-neutral failure. → F5 |
| P1-4 | Diagnostic foundation route | Resumable, 18–22 min, five skills, 30-min ceiling, partial-probe outcome. → F8 |
| P1-5 | Account / profile / preferences surface | Explanation language, schedule, notification prefs, theme override — all referenced as learner-controlled (01 §3.5) with no host view. → F2 |

**P2 — annotation, not new pixels**

| ID | Delta |
|---|---|
| P2-1 | Correct 24→26 in the 02 footer, the a11y test row and `DESIGN-HANDOFF.md` §0. |
| P2-2 | Retire open decisions 2 and 3 (settled by corrections 1 and 2); keep 1, 4, 5, 6 live. |
| P2-3 | Annotate `practice-only` as a projection in 01 §2.5. |
| P2-4 | Extend the a11y test matrix to the eight new families (320 px, 200%, keyboard, SR, reduced motion). |
| P2-5 | 02 · 4.6 reads "48% estimated" for Oral while the Oral gate is 45/75 — confirm the unit convention once, then apply consistently. Copy check, not a redesign. |
| P2-6 | Add `evidence_building` and `stale_contradicted` variants of the new Progress views to the state board rather than as extra frames. |

---

## 6. Existing views that must not be recreated

Reference these; do not redraw, restyle or re-copy.

- **All 26 mobile frames**: 1.1–1.4 · 2.1–2.6 · 3.1–3.4 · 4.1–4.6 · 5.1–5.6 (`Bestehen-02-Mobile-Screens.dc.html#a1…#a5`).
- **All responsive exemplars**: D1 Coach 7/5, D2 Readiness 8+4 + evidence panel, D3 Writing 4/8, D4 Mock 720, D5 tablet + sheet→dialog, D6 rules (`#d1…#d6`).
- **Foundations**: 25 semantic tokens × 2 modes, radii scale, elevation scale, focus ring, type triad and its handover rule, 18-glyph Lucide subset (`#s01`).
- **The 41-component library and its variants** (`#s02`, §2.14) — extend in place; adding a skill-specific fork of the attempt shell, result card, repair card or label row is the one architectural mistake the handoff names explicitly.
- **State models**: evidence validity, evidence labels, Readiness bands, P0–P4, control boundary, failure ownership (`#s03`).
- **Flows A–G with their branches and exits**, the 10 a11y surfaces + tests, the 8-key map, the 6 verbatim announcements (`#f`, `#a`).
- **Production-intent copy** throughout — reuse verbatim except where §4 requires a delta.

Duplicate/obsolete to resolve **by reference only**: mic pre-flight (3.3) vs mic denied (5.1) — one archetype, two states; mock interruption (5.4) vs flow D branch — same contract; the "24 screens" strings; open decisions 2 and 3.

---

## 7. Phase 2 foundation / component work

No token, type, grid or elevation work. Component-contract extensions only:

1. `PendingBanner` / `SystemFailureBanner` → state set: `processing (0–15 s)` · `slow (15–30 s)` · `pending (≥30 s)` · `partial` · `unavailable` · `fallback-used`. Remove "Usually under a minute". Keep the neutral grey+dashed family.
2. `ReadyToBookGate` → six gates, grouped, every failing reason named with its numbers.
3. `WeaknessCard` → 7 lifecycle states + reopen→Known; declare the learner-visible projection.
4. `EvidenceLabel` → annotate `practice-only` as a derived condition projection.
5. **New** `UploadStatus` (progress · retry · queued-offline · failed-neutral) — provider-agnostic, reuses AutosaveStatus's mono-label grammar.
6. **New** `SessionNotice` — full-page stateless interstitial (used by F1 only); no password field, ever.
7. **New** `ExportStatus` (requested · building · ready · expired · failed) and `PurgeStatus` (purging · complete + residual statement).
8. `StaleEvidenceNotice` / `ContradictionNotice` → confirm they cover blueprint change and defective-item recompute without a new component.
9. Announcement set: add strings for session expiry, upload retry, evaluation unavailable, export ready — written in the existing verbatim style, polite except recording/final-5.

---

## 8. Phase 3 view families (8 of 8)

| # | Family | Views | Why not derivable |
|---|---|---|---|
| F1 | Identity & session boundary | Signed-out entry, callback failure, session expired (idle + mid-attempt), access denied | No stateless full-page archetype exists; mid-attempt expiry must preserve draft + timing claim and read as system fault |
| F2 | Account, preferences & data control | Profile/preferences, export states, deletion confirm + purge-in-progress + post-deletion | 5.6 covers deletion intent only; its central truth string is now wrong; no host for learner-controlled preferences |
| F3 | Progress destination | History timeline, weakness list, weakness detail (7 states), milestone + stale/contradicted | A named destination with zero frames; lifecycle projection is a visible decision, not a variant |
| F4 | Language Elements input region | Cloze attempt region + its result mapping | Fifth modality; traversal/focus/keyboard model undefined, so a11y criteria are untestable |
| F5 | Capture & upload lifecycle | Upload progress, retry, offline queue, neutral failure, deletion-of-media confirmation | Existing recovery frames cover inbound media and local drafts, never outbound transfer |
| F6 | AI capability & degradation | Processing, slow, Pending, partial result, unavailable + deterministic fallback, retry with fresh sample | Correction 2 changes timing *and* shape; four states never drawn |
| F7 | Gate & evidence audit extension | Gates A–F grouped view + its mobile/desktop reflow | Layout consequence of six named gates exceeds a copy edit; must stay consistent with the D2 evidence panel |
| F8 | Diagnostic foundation route | Route overview, resume, per-skill hand-off, 30-min ceiling, partial-probe outcome | 1.3/1.4 draw a two-skill 6-minute probe; a resumable five-skill route with a ceiling is a different shape |

Everything else — including every remaining recovery situation, band variant, breakpoint and reduced-motion case — is **derivable** and belongs on an annotated state board, not in a new frame.

---

## 9. Owner decisions / escalation-only requests

| ID | Decision | Affected views | Recommended default |
|---|---|---|---|
| D1 | Safety-margin value (still open) | every band boundary, 02 1.4, 4.1, 4.6, D2 | Keep **65**, always labelled as ours, versioned |
| D2 | Is account-optional/guest first use live in the personal deployment, or capability-only? | F1 signed-out entry, 02 1.1 "no account wall" | **Capability-only now**: closed-registration entry, keep the app-owned learner ID and the guest path designed but disabled; do not delete the "no account wall" promise from 1.1 |
| D3 | Notification tone and frequency (still open) | notification copy set | Two drawn examples only; no streaks, no "we miss you", no countdown arithmetic |
| D4 | Rung (P0–P4) visibility (still open) | possible read-only support surface | Never learner-visible; conditions row carries the meaning |
| D5 | Speech-evaluation confidence floor (still open) | Oral band selection | Below floor → `evidence_building`, never a wide range |
| D6 | Export scope and format wording | F2 export states | JSON, same data the D2 evidence panel shows; describe by content, not schema |
| D7 | Exact learner-facing wording for the ≤91-day restore-suppressed residual | 02 5.6, F2 | One neutral sentence: access ends immediately, purge starts immediately, an inaccessible encrypted copy may persist briefly; audio is excluded and stricter |

Escalation-only source requests (do **not** fetch the repository): none required to start Phase 2. If D7's legal wording is contested, request the retention/DPA text alone.

---

## 10. Handoff for the next conversation

**Verdict: ready with bounded deltas.** The Bestehen design system, 26 mobile frames, five breakpoint exemplars, 41 components, Flows A–G and the WCAG 2.2 AA contract are implementation-ready and authoritative. Do not redraw them. Read `DESIGN-HANDOFF.md` and the four `.dc.html` files as source; read `uploads/00_design_context_packet.md` as the binding overlay above them.

**What Phase 2 does (component contracts, no new frames):** extend `PendingBanner`/`SystemFailureBanner` to six AI states on the 15 s/30 s policy and delete "Usually under a minute"; extend `ReadyToBookGate` to Gates A–F; extend `WeaknessCard` to the 7-state lifecycle with reopen→Known and declare the learner projection; annotate `practice-only` as a projection, never a sixth validity; add `UploadStatus`, `SessionNotice`, `ExportStatus`, `PurgeStatus`; add announcement strings for session expiry, upload retry, evaluation unavailable, export ready; fix the stale "24 screens" strings to 26; retire open decisions 2 and 3 (settled by corrections 1 and 2).

**What Phase 3 designs — eight families, no more:** F1 identity & session boundary · F2 account/preferences/data control · F3 Progress destination · F4 Language Elements input region · F5 capture & upload lifecycle · F6 AI capability & degradation · F7 Gates A–F extension · F8 diagnostic foundation route. Everything else is derivable and belongs on an annotated state board.

**Hard rules that do not move:** five evidence-validity values; six Readiness bands with absence rather than zero; two independent gates that never average or compensate; no pass-probability anything; one shared attempt/result/repair/label foundation — never a fork per skill; P0–P4 never a level or badge; system faults neutral, scoped, never a weakness, low score or Readiness decline; no provider names, buckets, keys or model choices in learner UI; no custom password form; tokens only, no raw hex; Bricolage Grotesque ≥22px for titles only, Plex Sans for all numbers, Plex Mono ≥12px for labels; 44×44 targets, 320 px reflow, 200% zoom, keyboard completion, text-equivalent charts, controlled timers, reduced motion.

**Open owner decisions:** safety margin (default 65) · guest/account-optional live or capability-only (default capability-only) · notification tone · rung visibility (default never) · speech confidence floor (default withhold) · export wording · residual-retention sentence.

**Next action:** confirm D2 and D7, then start Phase 2 component extensions. Do not request the repository.
