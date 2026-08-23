# Design 06 — UI Foundation & Shell Delta (Phase 2)

Phase 2 only: foundation-level component contracts and shell states. No new frames, no production code, no redesign of covered screens, no product policy.

**Artifact:** `Bestehen-05-UI-Foundation-Delta.dc.html` — a Design Component in the same format as the existing four documents (`.dc.html`, inline styles + one logic class, shares `support.js`, both themes, anchors `#u0 … #u7`). A visual delta was necessary: five shell states, two new primitives and six previously undrawn capability states cannot be specified in prose without an implementation agent inventing their treatment.

**Inputs read:** `uploads/00_design_context_packet.md` (v1787483288040444) · `design-05-post-architecture-coverage-audit.md` (v1787483519803615) · `DESIGN-HANDOFF.md` (v1787228153367570) · `Bestehen-01-Design-System.dc.html` (v1787212420429919) · `Bestehen-03-Desktop-Responsive.dc.html` (v1787213378430414) · `support.js`. All present.

---

## 1. Validated Phase 1 findings

Each P0/P1 was checked against the design-system source and classified **foundation** (in this phase) or **family** (Phase 3, unchanged scope).

| Finding | Verified against source | Verdict |
|---|---|---|
| P0-1 Identity & session | Confirmed. No auth/session surface exists in 01, 02 or 03. `01 §2.13` has toast / persistent alert / confirm, all of which assume a shell with learner state; there is no stateless full-page archetype. Mid-attempt expiry has no visual family, and the neutral-vs-red boundary (`01 §3.6`, P5) makes the wrong choice actively harmful. | **Foundation. Valid.** → U1, U2 |
| P0-2 AI processing / Pending / partial / unavailable / fallback | Confirmed. `01 §2.11` line 586 carries the literal string "Usually under a minute", and `01 §2.12` hands the skeleton to Pending "after 30 seconds" — the old shape, one banner, one promise. Four of six states undrawn. | **Foundation. Valid.** → U3 |
| P0-3 Language Elements region | Confirmed missing, but region layout + gap traversal is a modality view family, not a foundation primitive. `ClozeGap` and `ClozeTextPane` already exist in the `01 §2.14` index. | **Family. Deferred to F4 unchanged.** |
| P0-4 Gates A–F | Confirmed as a copy correction with a layout consequence on `02 · 4.6`. No new primitive; `ReadyToBookGate` exists. | **Family. Deferred to F7 unchanged.** |
| P0-5 Deletion & export truth | Confirmed: `01 §2.13` confirm card still reads "there is no backup". Correcting it needs owner decisions D6/D7 wording, not new UI. Its status states reuse the U4 grammar. | **Family. Deferred to F2, minus one primitive.** |
| P1-1 / P1-2 Progress destination, weakness lifecycle | Confirmed: nav destination with no frame; `01 §2.9` draws 5 of 7 states. Both are composition and content-state decisions. | **Family. F3 unchanged.** |
| P1-3 Media/upload lifecycle | Confirmed. `01 §2.12` AutosaveStatus covers local durability only; nothing expresses outbound transfer. Shared by Speaking, Writing and mock submit, so the contract must be foundation. | **Foundation (contract). Valid.** → U4 |
| P1-4 Diagnostic foundation route | Confirmed route-shape change; no foundation content. | **Family. F8 unchanged.** |
| P1-5 Account / preferences | Confirmed no host view. Once the bare shell and SessionNotice exist, this is a normal authenticated destination-level surface. | **Family. F2 unchanged.** |

Two Phase 1 statements were corrected in the process, both narrowing scope:

- The audit's Phase 2 list included `ExportStatus` and `PurgeStatus` as new components. They are **not** new: the six `UploadStatus` states express them with different nouns. Phase 3 F2 needs copy + D6/D7, not primitives.
- The audit assigned `SessionNotice` to "F1 only". It is also the correct host for access-denied and callback-failure, which are not learner-session events — same component, five states, one shell variant.

Also confirmed: nothing in the delta required a token. All 25 semantic tokens (`01 §1.3`) express these meanings accessibly — the neutral system family (`status.system` dashed on `surface.mist`), the attention pair (graphic/text split), and `data.range` for the transfer track. **Zero new tokens, zero new type steps, zero grid changes.** Two Lucide glyphs are added (*lock*, *arrow-up*), 18 → 20, each depicting its noun per the `DESIGN-HANDOFF §2` icon rule; every other new state is carried by a word.

---

## 2. Reused vs new component decisions

| Decision | Component | Rationale |
|---|---|---|
| **New** | `SessionNotice` (U2) | Distinct responsibility: a full-page surface that renders when no learner state exists. No existing component can render without a shell that has destinations. One component, five states, because all five answer the same three questions (what happened / what is safe / one way forward). |
| **New** | `UploadStatus` (U4) | Distinct responsibility: outbound delivery of a finalised artefact. `AutosaveStatus` promises local durability; it cannot promise arrival, and the two have different owners, different failures and different recoveries. Borrows AutosaveStatus's mono-label grammar rather than inventing a second one. |
| **Variant, not new** | `AppShell · bare` (U1) | Same shell component with nav, learner state and sticky action absent. A second shell component would legitimise a second information architecture. |
| **Extend** | `PendingBanner` (U3) | Six states on the 15 s / 30 s policy; "Usually under a minute" retired. Same component serves AI evaluation, STT and TTS — a learner never learns which capability is which. |
| **Extend** | `SystemFailureBanner` (U5) | Gains a required **scope line** ("what is still working") and exactly one recovery action. Four new architecture-created fault sources (identity, transfer, capability, storage) are absorbed as rows in the existing `01 §3.6` table shape, not a second table. |
| **Extend** | `AutosaveStatus` (U4) | One added state, `CHECKPOINT · <block> DONE <time>`, so a resumed mock and a resumed Writing draft share one save grammar instead of two. |
| **Rejected** | A separate `TransferFailureBanner`, an `AuthShell`, a `ProgressBar` primitive, an `ExportStatus` | Each was a different screen context for a responsibility an existing or above component already holds. |

Library count: **41 → 43.**

---

## 3. State, interaction and accessibility contracts

### 3.1 Shell states (U1)

Five states, two shells. Authenticated → shell A (unchanged, `01 §2.13`, `03 · D1`). Signed-out, callback-failed, session-expired (idle and mid-attempt) and access-denied → shell B (bare).

Shell B rules: no destinations, no exam date, no Readiness, no counts; one heading, one explanation, one primary action, at most one secondary; theme preference still applies; **never a credential field of any kind** (Auth0 Universal Login owns entry at its own origin); never a link into a protected route it cannot reach; never a second interstitial as a destination. Return lands on the surface the learner asked for, not on Coach.

Banner slot (both shells): below the page title, above content, inside the content column at every width; in an attempt shell, below the conditions row, which still never scrolls away.

### 3.2 SessionNotice (U2)

States: `signed-out` · `callback-failed` · `expired-idle` · `expired-mid-attempt` · `access-denied`. Visual family: neutral grey on mist with a dashed edge (`01 §3.6`) — never red, never amber, never a score-like treatment.

Copy: max three sentences, 56 ch, no first person. "This wasn't you." opens only genuine faults (callback failure, mid-attempt expiry); an ordinary sign-in or an idle expiry does not, because nothing failed. No provider name, no technical code in the sentence.

`expired-mid-attempt` contract — the one state that can damage evidence:

- validity untouched: the attempt stays in progress; it does **not** become `interrupted`, `not_counted` or a low result — a session boundary is not an interruption of the task;
- draft preserved to the existing ~5 s bound; elapsed time and the conditions claim stated on the page and restored on return;
- for a measured mock, the affected block follows the existing pause contract at `02 · 5.4`; nothing is re-decided here;
- one action only — a learner is never asked to choose between their draft and signing in;
- live capture is finalised and queued by `UploadStatus` **before** the interstitial replaces the shell, so a spoken turn is never dropped by a token expiry;
- return re-enters the same attempt at the same item, conditions row first.

Accessibility: it is a page, not a dialog — no focus trap, no Esc, no inert background. Focus moves to the notice heading (the `h1`, the first new element, never the top of the document). Tab order heading → body → primary → secondary. Announcement is **assertive** for mid-attempt sign-out (see 3.5).

### 3.3 Capability status (U3)

Policy: 0–15 s static skeleton, no words · 15–30 s `slow` (amber, in place, learner may leave) · ≥30 s explicit `pending` (validity `pending`, attempt released, arrival announced later). The two thresholds are policy, never shown as numbers, and no copy anywhere states an expected duration. Audio keeps the stricter 7-day ceiling (`01 §3.6`); at the ceiling the outcome is stated as unresolved rather than left pending.

Six states: `processing` · `slow` · `pending` · `partial` · `unavailable + deterministic fallback` · `retry with a fresh sample`. States 2–4 are amber (the system is working as designed, the learner waits); states 5–6 are the neutral fault family. Red never appears in this family. `partial` names the unchecked scope and never renders a number over a partial basis. `unavailable` shows the deterministic part of the result and withholds the judged part rather than guessing it. `retry` resolves to `not_counted`, stays visible in history, never renders as a low result.

Invariants: one capability banner per screen; never a modal, blocking overlay or spinner past 15 s; never a provider name, model name, queue position, retry counter or percentage; a local capability failure never blocks unrelated coaching.

Accessibility: status lines never steal focus; one announcement per transition (slow → pending announces once, at pending); progress values are excluded from live announcement exactly as timer ticks are; every state carries a visible word, never colour or a track alone.

### 3.4 Save and transfer (U4)

`AutosaveStatus`: `SAVED hh:mm` · `SAVING…` · `OFFLINE · SAVED ON THIS DEVICE` · **new** `CHECKPOINT · <block> DONE hh:mm`.

`UploadStatus`: `preparing` · `sending <n>%` · `queued · offline` · `retrying` · `not sent` · `sent hh:mm`. Determinate track with a visible percentage — never an indeterminate sweep. Retry is automatic and silent (no attempt count, no error code). `not sent` uses the fault family, resolves to `not_counted`, keeps the local artefact, and offers the smallest re-do first (send again, then re-record). Learner-facing surface shows progress, retry and outcome only — never a bucket, key, region or storage control.

Placement: inline in the region that owns the artefact; above the sticky action on phones, never inside or over it; never the page's only message; never a toast carrying information that matters.

Accessibility: transfer failure of a live recording inherits the existing **assertive** recording-failure exception; queueing and completion are polite; the action added by a failure is Tab-reachable from the banner text and is a 44×44 target.

### 3.5 Announcements (U7)

Eight strings, verbatim, in the existing style. Politeness: polite except two existing exceptions (final-5 minutes, recording failure) plus **one added — sign-out during a timed attempt**, on the grounds that the learner is producing evidence against a clock and cannot be told late. This is the only change to the `04 · #a` announcement contract; the assertive set becomes three.

### 3.6 Reduced motion (U7)

Nothing in the delta animates beyond the existing 120 ms state change. Skeletons stay static in both settings. The determinate upload track needs no reduced-motion substitute, only its numeric label. No result, arrival or recovery animates — a capability banner may not fade in as if something had been won.

---

## 4. Responsive behaviour

The five breakpoints and the D6 prohibitions (`03 · D6`) stand unchanged; the delta adds no sixth layout.

- **Bare shell:** one centred 420 px measure at every width — which also satisfies 320 px reflow without a second rule. ≤479 full-width action, 20 margin; 480–767 identical at 24 padding; 768–1023 centred, **no top rail** (nothing to navigate); ≥1024 centred, **no sidebar**, vertically centred, nothing stretches. Signing in restores the sidebar and the destination.
- **Capability banner:** content column only at every width — never in the sidebar, never inside the read-only Readiness evidence panel (`03 · D2`), never inside a single Readiness card at 768.
- **UploadStatus:** stays with its region at all widths; the 720 px mock measure (`03 · D4`) and the D3 prompt/editor split are unchanged.
- **Stacking:** at most one capability banner and one system banner per screen; if both would appear, the fault wins and the wait folds into its scope line. Neither may cover the sticky action or become a hover-only affordance.

---

## 5. Design anchors referenced

Extended in place: `Bestehen-01-Design-System.dc.html#s02` §2.11 (PendingBanner / SystemFailureBanner — line 586 string retired), §2.12 (AutosaveStatus, skeleton, recording), §2.13 (shell, overlays, nav), §2.14 (library index 41 → 43); `#s03` §3.2 validity, §3.6 failure ownership (four rows added in the existing shape); `#s01` §1.3 tokens (unchanged), §1.9 icons (18 → 20).

Referenced, not redrawn: `Bestehen-02-Mobile-Screens.dc.html#a5` 5.1–5.4 recovery states and 5.6 data/deletion; `#a1` 1.1 no-account-wall promise; `Bestehen-03-Desktop-Responsive.dc.html#d1` sidebar + 7/5, `#d2` 8+4 evidence panel, `#d3` 4/8 Writing, `#d4` 720 mock measure, `#d5` tablet rail + dialog, `#d6` rules; `Bestehen-04-Flows-Handoff.dc.html#f` Flows A–G, `#a` ten a11y surfaces, key map, announcement set.

New anchors: `Bestehen-05-UI-Foundation-Delta.dc.html#u0 … #u7`.

---

## 6. Effect on Phase 3 scope

The eight-family cap holds. Scope moves **down**, never up.

- **F1 Identity & session** → composition only; draws no new component. It assembles the bare shell + SessionNotice's five states into route-level views.
- **F5 Capture & upload** → composition only; the lifecycle contract is settled, so F5 draws the capture screens that host it plus media-deletion confirmation.
- **F6 AI capability & degradation** → reduced to placement: the six states and their timing policy are specified, so F6 covers where each appears in the result, mock-partial and coach contexts.
- **F2 Account, preferences & data control** → **loses a primitive.** Export delivery and purge reuse the `UploadStatus` state set with different nouns. What remains is copy plus owner decisions D6 (export wording) and D7 (the ≤91-day residual sentence).
- **F3, F4, F7, F8** → untouched. None was foundation.
- **Test matrix:** add five rows (bare shell at 320 px / 200 %; keyboard-only completion of all five SessionNotice states; screen-reader pass over the six capability states in sequence; UploadStatus retry-to-failure without a focus jump; the assertive sign-out announcement during a measured mock). The stale "24 screens" count in that row reads **26**.
- **Still blocking, unchanged:** owner decisions D1 (safety margin 65), D2 (guest/account-optional live or capability-only — the bare shell is drawn for closed registration and needs no change if guest arrives), D3, D4, D5, D6, D7.

---

## 7. Handoff (< 500 words)

Phase 2 is complete and deliberately small: **two new components, one shell variant, three extended contracts, zero new tokens.** The library goes 41 → 43. Everything else in the Phase 1 audit was confirmed as a Phase 3 view family and left alone.

Read `Bestehen-05-UI-Foundation-Delta.dc.html` as the visual source (`#u0` scope · `#u1` shell anatomy · `#u2` SessionNotice · `#u3` capability status · `#u4` save and transfer · `#u5` fault ownership · `#u6` responsive · `#u7` accessibility). It is a state board, not a screen set — no frame in `02` or `03` was redrawn or restyled.

**What is now decided.** A second shell exists — `AppShell · bare` — for the five moments with no learner state, and it may never show navigation, learner data or a credential field. `SessionNotice` carries all five of those states in the neutral system family; its mid-attempt variant preserves the draft, the elapsed timing and the conditions claim, keeps the attempt *in progress* rather than interrupted, and finalises live capture before it replaces the shell. `PendingBanner` becomes six capability states on a 15 s / 30 s policy shared by AI, STT and TTS; the string "Usually under a minute" is retired and no copy anywhere promises a duration. `SystemFailureBanner` now requires four parts in order — ownership, consequence, **scope**, one action — so no fault can be felt as global. `UploadStatus` is the one genuinely new status primitive: six states from *preparing* to *not sent*, resolving to `not_counted` on failure, never exposing a bucket, key or provider. `AutosaveStatus` gains a checkpoint state so mocks and Writing share one save grammar.

**What did not move.** Four destinations, one attempt/result/repair/label foundation, five validity values, six Readiness bands, two independent gates, no pass-probability, P0–P4 as a local condition, red reserved for learner wrongness and pass-critical risk, five breakpoints, the D6 prohibitions, 44×44, 320 px, 200 %, keyboard completion, text-equivalent charts, controlled timers, reduced motion. Type triad and token set untouched.

**The one contract change to review.** The assertive live-region set grows from two to three: sign-out during a timed attempt joins final-5-minutes and recording failure. Rationale is in `#u7`. If the owner rejects it, the announcement becomes polite and the interstitial's focus move carries the urgency instead.

**Next action.** Confirm D2 and D7, then start Phase 3 with F1 and F5 — both are now pure composition. F2 should be scheduled after D6/D7 land, since its remaining work is wording. Do not request the repository; nothing in Phase 3 needs it.
