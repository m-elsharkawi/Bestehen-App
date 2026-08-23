# Design 07 — Critical View Deltas (Phase 3)

Phase 3 only: implementation-grade mockups for the eight high-risk view families the Phase 1 audit proved ambiguous or missing. No production code, no redesign of the 26 mobile frames or the five responsive exemplars, no new product policy.

**Artifact:** `Bestehen-06-Critical-View-Deltas.dc.html` — a Design Component in the same format as the five existing documents (`.dc.html`, inline styles, one logic class, shared `support.js`, both themes, anchors `#v0 … #v9`).

**Inputs read:** `uploads/00_design_context_packet.md` (v1787483288040444) · `DESIGN-HANDOFF.md` (v1787228153367570) · `design-05-post-architecture-coverage-audit.md` (v1787483519803615) · `design-06-ui-foundation-handoff.md` (v1787484266195220) · `Bestehen-01-Design-System.dc.html` · `Bestehen-02-Mobile-Screens.dc.html` · `Bestehen-03-Desktop-Responsive.dc.html` · `Bestehen-04-Flows-Handoff.dc.html` · `Bestehen-05-UI-Foundation-Delta.dc.html` · `support.js`. All present.

---

## 1. View-family and state inventory

Eight families, exactly the Phase 1 cap. **15 new mobile frames (6.1–6.15), 3 large-screen exemplars, 0 new components.**

| Family | Frames | Compact annotated states |
|---|---|---|
| **F1** Identity & session (`#v1`) | 6.1 signed-out entry · 6.2 session expired mid-attempt | callback failed · expired idle · access denied · Auth0 boundary diagram |
| **F2** Account, preferences & data (`#v2`) | 6.3 account & preferences · 6.4 deletion confirm | export preparing/building/ready/expired/failed · purge running · post-deletion bare shell |
| **F3** Progress destination (`#v3`) | 6.5 Progress home · 6.6 weakness detail · **≥1280 exemplar** | empty (`evidence_building`) · stale/contradicted milestone · loading skeleton · pending entry · 7→5 lifecycle projection table |
| **F4** Language Elements (`#v4`) | 6.7 cloze attempt · 6.8 cloze result · **768 exemplar** | submit with gaps left · seen-before/practice-only · defective gap (`not_counted`) · loading · interrupted-in-mock |
| **F5** Capture & upload (`#v5`) | 6.9 capture + sending · 6.10 transfer failed | preparing · queued offline · retrying · sent · media-deletion confirm · Writing/mock extension table |
| **F6** Capability placement (`#v6`) | 6.11 partial Writing result · 6.12 Readiness with a pending component | placement matrix (result / mock / Coach / Readiness / attempt) · unavailable + deterministic fallback · retry with fresh sample |
| **F7** Gates A–F (`#v7`) | 6.13 Ready to Book, six gates grouped · **≥1280 exemplar with D2 evidence panel** | gate table A–F with failure copy · Safe vs Ready-to-Book comparison · unit convention |
| **F8** Foundation route (`#v8`) | 6.14 resumed route · 6.15 partial-probe outcome | hand-off · stopped mid-part · 30-min ceiling · capability slow · completed route |

Cross-family contracts (`#v9`): focus entry/return and keyboard completion per family · seven new verbatim announcements · assertive set held at three · reduced motion · six test rows · items intentionally left as annotations · owner-decision status.

## 2. Anchor index

`#v0` scope + seven distinctions · `#v1` F1 · `#v2` F2 · `#v3` F3 · `#v4` F4 · `#v5` F5 · `#v6` F6 · `#v7` F7 · `#v8` F8 · `#v9` cross-family contracts. Frame ids `6.1 … 6.15` are used in the frame captions and in every mono footer.

## 3. Reused components and new compositions

**Reused unchanged:** attempt shell + conditions row + sticky action · result/diagnosis card · repair card · evidence label row · Readiness component card, pass-line scale and text alternative · `ReadyToBookGate` · `ChangeTimeline` · `MilestoneRow` · `WeaknessCard` · `DueReviewGroup` · `ClozeGap` / `ClozeTextPane` · `PendingBanner` / `SystemFailureBanner` (six states) · `AutosaveStatus` (four states) · `UploadStatus` (six states) · `SessionNotice` (five states) · `AppShell · bare` · sheet→dialog · overlay contract · `ContradictionNotice` / `StaleEvidenceNotice`.

**New compositions (arrangements, not components):** signed-out route entry with a held destination · account route (nav visible, nothing selected) · Progress destination layout and its ≥1280 list+panel · weakness detail · cloze input region and its 768 two-column arrangement · gate group (three pairs) and its ≥1280 gates-8/panel-4 · foundation-route wrapper with checkpoint.

**Library count unchanged: 43.** Zero new tokens, type steps, icons, breakpoints or destinations.

## 4. Responsive, accessibility and copy rules

- Five breakpoints and the `03 · D6` prohibitions stand; no fourth layout, no per-device IA, no hover-only control, German task text never wider than 720 px.
- Only three surfaces earn a large-screen exemplar, each because layout or available evidence materially changes: Progress ≥1280 (detail becomes a read-only panel), Gates ≥1280 (gates + D2 evidence panel), cloze at 768 (options leave the text flow). Everything else is phone layout, centred.
- Focus moves to the first new element on every step change; overlays keep the existing trap/Esc/inert/return contract; interstitials are pages and get none of it.
- Assertive live regions remain three (final-5, recording failure, sign-out during a timed attempt). Seven new polite strings are listed verbatim at `#v9`. Progress values and timer ticks are never announced.
- Every state carries a word: no colour-only status, no chart-only evidence, no drag-only interaction, no uncontrolled timer. 44 × 44 targets, 320 px reflow, 200 % zoom, keyboard completion throughout.
- Copy is observation → meaning → next action, ≤3 sentences, ≤56 ch, provider-neutral. System faults open with the existing *"This wasn't you."*; ordinary events do not. No duration is ever promised; no probability, percentage-of-passing, rung, streak or celebration appears anywhere.

## 5. Mapping back to Phase 1 gaps

| Gap | Closed by |
|---|---|
| P0-1 identity & session | F1 (`#v1`) — signed-out, callback, idle and mid-attempt expiry, access denied, Auth0 boundary |
| P0-2 AI timing/shape | F6 (`#v6`) — placement matrix, partial with named scope, pending Readiness, unavailable fallback |
| P0-3 Language Elements | F4 (`#v4`) — region, traversal, focus model, key map, result mapping |
| P0-4 Gates A–F | F7 (`#v7`) — six gates grouped, every failing reason with its numbers |
| P0-5 deletion & export truth | F2 (`#v2`) — corrected residual sentence, export and purge states |
| P1-1 / P1-2 Progress + lifecycle | F3 (`#v3`) — destination, detail, 7→5 projection, reopen, stale milestone |
| P1-3 media/upload | F5 (`#v5`) — capture, transfer, failure scope, media deletion |
| P1-4 foundation route | F8 (`#v8`) — resumable five-part route, checkpoint, ceiling, partial probe |
| P1-5 account/preferences | F2 (`#v2`) — control boundary made visible |
| P2-5 unit convention | `#v7` — 0–100 component scale vs raw gate points, settled once |
| P2-2 open decisions 2 and 3 | retired by F8 and F6 respectively |

The seven distinctions the brief required are drawn and named at `#v0` and again at the point of use: absent ≠ zero (`#v3`, `#v6`, `#v8`) · Safe ≠ Ready to Book (`#v7`) · five validity values ≠ practice eligibility (`#v4`, `#v5`) · learning ≠ Readiness evidence (`#v3`) · learner error ≠ system fault (`#v0`, `#v5`, `#v6`) · preserved work ≠ accepted evidence (`#v1`, `#v5`) · credential UI ≠ account/session UI (`#v1`, `#v2`).

## 6. Represented as annotations, not frames

SessionNotice states 3–5 · export/purge states · Writing and mock upload · the six capability states per surface · route ceiling, hand-off and stop-mid-part · every remaining recovery situation from `01 · §3.6` · 480–767 behaviour for all eight families · reduced-motion variants. Each is a strip, matrix or state table with its rule stated; none needed a duplicate screen.

## 7. Remaining blockers

None blocking build. Copy-level only: **D6** export wording and **D7** the ≤91-day residual sentence are drawn as recommended defaults and marked provisional in the 6.4 footer; **D1** safety margin and **D5** speech-confidence floor set numbers behind gates A and B without changing layout; **D2** guest entry affects one path into F1; **D3** and **D4** touch nothing drawn here.

---

## 8. Handoff for Phase 4 (<500 words)

Phase 3 is complete at the cap: **eight families, 15 mobile frames, three large-screen exemplars, zero new components.** Read `Bestehen-06-Critical-View-Deltas.dc.html` as the visual source (`#v0` scope and the seven distinctions · `#v1` identity · `#v2` account and data · `#v3` Progress · `#v4` Language Elements · `#v5` capture and upload · `#v6` capability placement · `#v7` Gates A–F · `#v8` foundation route · `#v9` cross-family contracts). Nothing in `02` or `03` was redrawn; the delta documents extend the system, they do not replace any part of it.

**What is now decided.** A signed-out deep link holds its destination by kind, never by content, and hands off to Universal Login at its own origin — no credential field exists on any Bestehen page. Mid-attempt sign-out preserves draft, elapsed timing and the conditions claim, and says on screen that the attempt still counts. Account is a route, not a fifth destination; its two groups make the control boundary visible, and deletion states the ≤91-day inaccessible residual honestly without naming infrastructure. Progress is a real destination that never renders a band, and the seven-state weakness lifecycle projects to five learner words with nothing deleted. The cloze region defines gap traversal, the `a–d / 1–4` behaviour and the focus model, so its accessibility criteria are testable. Transfer failure costs one turn and names what still works. A partial evaluation shows no number at all and names the unchecked scope. Ready to Book is six gates in three groups with every failing reason and its numbers. The first diagnostic is a resumable five-part route with a checkpoint, a 30-minute ceiling and an honest partial outcome.

**What did not move.** Four destinations, one attempt/result/repair/label foundation, five validity values, six Readiness bands, two independent gates that never compensate, no pass-probability, P0–P4 as a local condition, red reserved for learner wrongness and pass-critical risk, five breakpoints, the D6 prohibitions, 44 × 44, 320 px, 200 %, keyboard completion, text-equivalent charts, controlled timers, reduced motion. Tokens, type and the icon set are untouched.

**Contract changes to review.** The unit convention is now explicit: component estimates on the 0–100 band scale (line 60, our margin 65), gate totals in raw exam points (135/225, 45/75), never a percentage — this corrects the "48 % estimated" string at `02 · 4.6`. Seven polite announcements are added; the assertive set stays at three. Six test rows join the `04 · #a` matrix, whose screen-count string now reads 26 + 15.

**Next action.** Confirm D6 and D7 so F2's two provisional strings can be frozen, and D1/D5 so gates A and B carry final numbers. Then Phase 4 can begin against the full set: `01` foundations, `02` 26 frames, `03` five exemplars, `04` flows and accessibility, `05` foundation delta, `06` critical view deltas. Do not request the repository; nothing in Phase 4's design scope needs it.
