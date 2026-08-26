# Personal Stage 04 responsive web and design-system execution plan

Date: 2026-08-26, Europe/Berlin

Status: Planning candidate for independent acceptance. This document authorizes no
production implementation, migration, deployment, provider call, DNS change, secret
read, or Stage 05 work.

## 1. Objective and verified baseline

Stage 04 will replace the neutral Stage 01 web page with the smallest complete
responsive-web foundation needed by later personal stages. It will deliver one
server-first Next.js App Router composition, one semantic design system, accessible
shells and components, self-hosted assets, exhaustive UI state fixtures, and
representative end-to-end view slices. It will not implement the later learning,
measurement, data-rights, notification, productive-provider, or offline runtimes.

Repository reality was fetched and verified before this plan was written:

- repository: `https://github.com/m-elsharkawi/Bestehen-App.git`;
- default branch: `main`;
- Planning and Execution branch:
  `implementation/personal-04-responsive-web-design-system`;
- exact local `HEAD`, `origin/main`, and required previous-stage baseline:
  `90c0d9dfcc13115aff3738640303ad280866f709`;
- no local changes, no remote Stage 04 branch, and no open or closed Stage 04 pull
  request existed at Planning start;
- the baseline contains the accepted Stage 03 domain, PostgreSQL, job, Evidence,
  Auth0/OIDC, App-session, authorization, and route contracts. The UI is still the
  deliberately neutral `BaselineShell` and four Chromium browser checks.

Execution starts only after an independent reviewer accepts this exact Planning
commit. Planning and Execution share the named branch and one draft pull request.
Execution must not edit this accepted plan except through a separately reviewed plan
correction.

## 2. Authority and inputs

The authority order is Architecture, the relevant detailed Architecture stages,
`DESIGN_REVIEW_NOTES.md` and the personal profile, then the Design handoffs and
boards. Design owns presentation only where it agrees with Architecture.

The Planning source set is:

- `prompts/implementation/README.md`, `COMMON_STAGE_CONTRACT.md`,
  `DESIGN_REVIEW_NOTES.md`, the personal implementation plan/checklist, and the
  exact `04P` prompt;
- accepted Personal Stage 01, 02, and 03 handoffs;
- `Architecture/28-bestehen-app-architecture-specification.md`;
- Architecture Stages 13, 14, 20, 21, 22, 23, and 25;
- accepted ADR-0020, ADR-0021, and ADR-0022, with the linked identity, offline,
  notification, security, and quality ADRs used where a view exposes their state;
- `Design/DESIGN-IMPLEMENTATION-HANDOFF.md`, `DESIGN-HANDOFF.md`, all six
  `Design/Bestehen-01-*.dc.html` through `Bestehen-06-*.dc.html` boards, and
  `design-05-post-architecture-coverage-audit.md`,
  `design-06-ui-foundation-handoff.md`, and
  `design-07-critical-view-handoff.md`;
- current `apps/web` layout, baseline route, Auth0 routes and server identity
  composition; current `packages/domain`, `packages/contracts`, `packages/application`,
  `packages/design-system`, `packages/test-support`; Playwright, Testing Library,
  Vitest, axe, package-boundary, CI, release-manifest, secret, scope, and documentation
  harnesses.

Design preview scripts and inline `.dc.html` runtime styles are references only. No
production module may import them or copy their remote font requests.

## 3. Scope and non-scope

### In scope for 04E

- The exact 25 semantic color/elevation tokens in light and dark, plus named spacing,
  sizing, density, motion, focus, breakpoint, type, and data-visualization variables
  derived from the accepted Design contract. High contrast uses system colors and
  structural semantics rather than a third independent palette.
- Self-hosted Bricolage Grotesque, IBM Plex Sans, IBM Plex Mono, the B1 Threshold B
  mark, and the exact 20-glyph Lucide subset, with provenance, license, source version,
  SHA-256 digest, subset rules, and build-time verification.
- Server-first root, bare, protected App, focused attempt, result, and mock layouts;
  the four fixed destinations Coach, Readiness, Train, Progress; Account as a utility
  route; deterministic URL, return-path, history, and focus behavior.
- The 43 semantic component contracts and five typed skill-region slots. Later-stage
  behavior is represented by strict synthetic projections in tests, not invented
  domain calculations or provider calls.
- Exhaustive loading, empty, offline, pending, partial, interrupted, not-counted,
  unavailable, access-denied, expired, conflict, export, deletion, and recovery
  presentation contracts.
- A machine-checkable source-anchor manifest covering 41 compact frames, eight large
  exemplars, 43 component families, 20 icon IDs, route/state anchors, Architecture
  behaviors, target files, and test IDs.
- Representative route and component slices proving the reusable composition,
  responsive behavior, semantics, accessibility, visual anchors, and performance
  budgets.

### Out of scope

- No native iOS/Android client, React Native, Flutter, install prompt, web app
  manifest, service worker, broad offline pack, background sync, or other PWA work.
- No Stage 05 content import, task scoring, attempt persistence, learner projection,
  coaching policy, readiness calculation, mock decision, evaluator, audio pipeline,
  export builder, deletion processor, notification delivery, or provider integration.
- No schema or data migration. Stage 04 adds presentation and build artifacts only.
  Any newly discovered persistence need stops for a plan correction; CSS, assets,
  view contracts, and test fixtures do not justify a database revision.
- No live provider, Coolify, Pangolin, Auth0, database, R2, backup, DNS, or production
  action during 04E. The post-acceptance staging checkpoint is a separate owner action
  described in section 16.
- No new global state store, query cache, UI kit, utility CSS framework, animation
  framework, chart library, remote theme service, browser fingerprint, or general
  telemetry SDK.

## 4. Architecture-over-Design resolutions

Execution must encode these decisions in fixtures so stale Design copy cannot return.

1. The personal profile requires Auth0 EU Universal Login with Email OTP and closed
   registration. The old account-optional landing promise is not rendered. Guest and
   account-optional contracts remain behind their existing false flags for later
   commercial restoration. Bestehen never renders a password, OTP, MFA, or provider
   recovery field.
2. Architecture owns five validity values: `valid`, `partially_valid`, `pending`,
   `interrupted`, `not_counted`. `practice-only` is an eligibility projection, never
   a sixth validity value.
3. Architecture owns six Readiness states:
   `evidence_building`, `not_ready`, `borderline`, `safe`, `ready_to_book`, and
   `stale_contradicted`. Absence is not zero, Written and Oral stay independent, Safe
   is not Ready to Book, and no pass-probability field or string may exist.
4. Ready to Book renders all Gates A through F and each failing server reason. The
   obsolete four-row Design list and the `48 % estimated` copy are forbidden.
   Component estimates use the 0 through 100 band scale with the official line at 60
   and the versioned personal margin at 65. Gate totals use raw points.
5. The first diagnostic is a resumable five-skill route with the accepted 18 to 22
   minute planning estimate and hard 30-minute ceiling. A six-minute partial probe is
   useful `evidence_building`, never a placement. The personal planning horizon is
   65 years.
6. Mid-attempt expiry preserves the draft, elapsed time, and observed conditions but
   never promises that work "still counts." The attempt stays recoverable and the
   server later decides validity. Live capture must finalize locally before the bare
   session notice replaces the focused shell.
7. Divergent Writing checkpoints preserve both branches and provide an accessible
   compare, select, and merge recovery composition before submission. Stage 04 owns
   the component contract and fixtures; Stage 06/09 own persistence and commands.
8. Account presentation includes current sessions/devices, revoke-other-sessions,
   recent-auth-required, recent-auth-expired, and revocation outcomes. Stage 04 owns
   the views, while existing Stage 03 server authorization remains authoritative and
   Stage 09 completes the operations.
9. Export presents the architecture source-cut ZIP lifecycle: requested, building,
   ready, expired, and failed. Its accessible summary and manifest cover README,
   profile, attempts, Evidence, learning state, Readiness, Writing/evaluation
   material, content references, activity CSV, deletion/audit data, and checksums.
   Raw audio, secrets, restricted source bytes, and provider internals are excluded.
   Default expiry is 24 hours and the maximum is seven days.
10. Deletion is revoke-first and idempotent. UI states include recent-auth required,
    typed confirmation, revoking, purge running, provider pending/partial, live purge
    complete with restore suppression active, and terminal completion only when the
    authoritative operation says so. Copy may not promise instant backup erasure.
11. Architecture notification reasons, caps, time-zone, and DST behavior replace the
    provisional Design examples. Stage 04 provides generic notification settings
    components only; Stage 09 owns scheduling and delivery.
12. The current Design total is 26 original plus 15 delta compact frames, eight large
    exemplars, 43 component families, and 20 icons. Older Architecture references to
    24/26 frames and 18 icons are stale inventory counts. The 20 are the architectural
    18 plus `lock` and `arrow-up` from Design 05.
13. The Design 01 library index says "41 components" while its prose names many
    subparts and variants. The authoritative later handoff fixes 43 component
    families after adding `SessionNotice` and `UploadStatus`. The manifest therefore
    has exactly 43 stable family IDs. Each named Design subpart maps to a family slot
    or variant; Execution may not turn the prose list into dozens of screen-local
    duplicates.
14. The registered logo export files are absent. Execution extracts the exact
    Threshold B geometry and asset names from the Design master and verifies the
    result against that source. It must not redraw, restyle, or improvise the mark.

## 5. Source-anchor and coverage manifest

04E creates one typed manifest at
`packages/design-system/src/coverage/source-anchors.ts` and an exported generated JSON
copy for CI evidence. Each entry has a stable ID, source path, source anchor, kind,
route/archetype, semantic states and reasons, component/icon dependencies, target
implementation exports, automated test IDs, manual evidence IDs, responsive lanes,
and any `derived`, `corrected`, or `obsolete` resolution. CI validates exact counts,
unique IDs, resolvable anchors and targets, no unaccounted source, and reciprocal test
coverage. Screenshots may attach to entries but can never satisfy semantic coverage.

### 5.0 Six-board anchor coverage

Every board-level anchor gets one manifest row in addition to any frame, exemplar,
component, or icon row below. `accepted` means implementation may follow the visual
contract as written. `corrected` means section 4 or Architecture replaces named copy
or state. `derived` means the board specifies a rule or composition rather than a
separate page. An `obsolete` note identifies the exact part Execution must not copy.

| Board anchor | Target implementation area | Required P04 checks | Status and resolution |
|---|---|---|---|
| Design 01 `s00` Principles | coverage manifest, review rules, prohibited-copy fixtures | `P04-COVERAGE-001`, `P04-SEMANTIC-001` | accepted authority order; Design cannot override Architecture |
| Design 01 `s01` Foundations | tokens, type, brand, icons, theme and responsive scales | `P04-TOKEN-001`, `P04-ASSET-001`, `P04-RSP-001` | accepted, with only the registered 20-icon and exact-asset corrections in section 4 |
| Design 01 `s02` Components | C01-C43 exports, state fixtures, primitive tests | `P04-COVERAGE-001`, `P04-COMPONENT-001`, `P04-A11Y-001` | corrected: the prose count of 41 is obsolete; named subparts map to 43 families below |
| Design 01 `s03` Patterns | semantic fixtures, loop composition, failure ownership, live regions | `P04-SEMANTIC-001`, `P04-A11Y-001` | corrected to five validity values, six Readiness states, and Architecture reason codes |
| Design 02 `a1` Arrival | bare/protected entry, goal/date form, foundation route, initial result | `P04-ROUTE-001`, `P04-SEMANTIC-001`, `P04-VISUAL-001` | corrected: account-optional and six-minute placement promises are obsolete |
| Design 02 `a2` Daily loop | AppShell and shared attempt/result/repair composition | `P04-COMPONENT-001`, `P04-ROUTE-001`, `P04-VISUAL-001` | accepted as one reusable loop, not six page copies |
| Design 02 `a3` Four more skills | Reading, Language Elements, Listening, Writing, Speaking region slots | `P04-COMPONENT-001`, `P04-A11Y-001`, `P04-RSP-001` | accepted as typed regions in the shared shell |
| Design 02 `a4` Readiness and mocks | Readiness evidence, mock preflight/result, Ready to Book | `P04-SEMANTIC-001`, `P04-COMPONENT-001`, `P04-VISUAL-001` | corrected: four-row gate list and probability-like copy are obsolete; use Gates A-F |
| Design 02 `a5` Edges and honesty | system recovery, interruption, stale return, data controls | `P04-SEMANTIC-001`, `P04-A11Y-001`, `P04-SECURITY-001` | corrected: Architecture owns validity, deletion, backup-residual, and expiry truth |
| Design 03 `d1` Desktop shell | AppShell large navigation and Coach 7/5 composition | `P04-RSP-001`, `P04-VISUAL-001` | accepted exemplar `LG-D1` |
| Design 03 `d2` Readiness desktop | 8/4 Readiness plus read-only evidence panel | `P04-RSP-001`, `P04-A11Y-001`, `P04-VISUAL-001` | accepted exemplar `LG-D2`; reasons stay server-owned |
| Design 03 `d3` Writing desktop | Writing 4/8 prompt/editor split | `P04-RSP-001`, `P04-COMPONENT-001`, `P04-VISUAL-001` | accepted exemplar `LG-D3` |
| Design 03 `d4` Mock desktop | focused 720 CSS px mock measure | `P04-RSP-001`, `P04-PERF-001`, `P04-VISUAL-001` | accepted exemplar `LG-D4` |
| Design 03 `d5` Tablet | tablet rail and sheet/dialog equivalence | `P04-RSP-001`, `P04-A11Y-001`, `P04-VISUAL-001` | accepted exemplar `LG-D5` |
| Design 03 `d6` Responsive rules | CSS layout contracts for all shells and regions | `P04-RSP-001`, `P04-A11Y-001` | derived rule board, not a ninth large exemplar |
| Design 04 `f` Flows | representative route compositions and browser-history checks | `P04-ROUTE-001`, `P04-SEMANTIC-001` | derived flow coverage; Architecture-corrected states replace stale flow copy |
| Design 04 `a` Accessibility | semantic, keyboard, focus, announcement, zoom and motion tests | `P04-A11Y-001`, `P04-RSP-001` | accepted baseline, extended by Design 05 `u7` and Architecture truth |
| Design 04 `c` Coverage | source manifest, reciprocal target/test validation | `P04-COVERAGE-001`, `P04-VISUAL-001` | corrected to exact 41/8/43/20 inventory; older totals are obsolete |
| Design 04 `h` Handoff | execution order, evidence ledger, acceptance handoff | `P04-SCOPE-001`, `P04-COMPAT-001` | derived delivery instructions, never a product route |
| Design 05 `u0` Scope | Stage 04 source manifest and anti-fork library boundary | `P04-SCOPE-001`, `P04-COVERAGE-001` | accepted: two families added, three extended, one shell variant |
| Design 05 `u1` Shell anatomy | `AppShell.bare`, shared banner/live-region slots | `P04-COMPONENT-001`, `P04-ROUTE-001`, `P04-RSP-001` | accepted; no second information architecture |
| Design 05 `u2` SessionNotice | C42 and bare identity/session route compositions | `P04-COMPONENT-001`, `P04-A11Y-001`, `P04-SEMANTIC-001` | corrected: mid-attempt copy cannot promise that evidence still counts |
| Design 05 `u3` Capability status | C28 state/reason fixtures and placement rules | `P04-COMPONENT-001`, `P04-SEMANTIC-001`, `P04-A11Y-001` | accepted six-state projection; no provider duration promise |
| Design 05 `u4` Save and transfer | C40 autosave/checkpoint slot and C43 transfer lifecycle | `P04-COMPONENT-001`, `P04-A11Y-001`, `P04-SECURITY-001` | accepted; export/purge reuse state grammar without new families |
| Design 05 `u5` Fault ownership | C29 ownership/consequence/scope/action order | `P04-SEMANTIC-001`, `P04-A11Y-001` | accepted; one scoped recovery action and no learner-blaming color |
| Design 05 `u6` Responsive | bare shell, banner and transfer placement rules | `P04-RSP-001`, `P04-VISUAL-001` | accepted as additions to Design 03 `d6` |
| Design 05 `u7` Accessibility | live-region policy, reduced motion, focus contracts | `P04-A11Y-001`, `P04-RSP-001` | accepted, including assertive timed sign-out; timer ticks stay silent |
| Design 06 `v0` Scope and distinctions | manifest resolutions for later critical families | `P04-SCOPE-001`, `P04-COVERAGE-001` | accepted audit scope; no extra routes or component families |
| Design 06 `v1` Identity | bare auth/session compositions and protected return path | `P04-ROUTE-001`, `P04-A11Y-001`, `P04-SECURITY-001` | corrected to closed Auth0 Email OTP, no password, no account-optional entry |
| Design 06 `v2` Account and data | Account sessions, export, deletion and status compositions | `P04-SEMANTIC-001`, `P04-SECURITY-001`, `P04-COMPAT-001` | corrected to source-cut export and revoke-first deletion with honest residuals |
| Design 06 `v3` Progress | Progress list/detail and weakness lifecycle | `P04-COMPONENT-001`, `P04-RSP-001`, `P04-VISUAL-001` | accepted exemplar `LG-V3`; absence never renders as zero |
| Design 06 `v4` Language Elements | C38 cloze region and result composition | `P04-COMPONENT-001`, `P04-A11Y-001`, `P04-VISUAL-001` | accepted exemplar `LG-V4` |
| Design 06 `v5` Capture and upload | C41 capture plus C43 transfer placement | `P04-COMPONENT-001`, `P04-A11Y-001`, `P04-SECURITY-001` | accepted; provider/storage internals remain absent |
| Design 06 `v6` Capability placement | pending, partial, unavailable and fallback placements | `P04-SEMANTIC-001`, `P04-COMPONENT-001` | corrected to authoritative scope/reasons and no guessed outcomes |
| Design 06 `v7` Gates A-F | C32 gate/evidence composition | `P04-SEMANTIC-001`, `P04-A11Y-001`, `P04-VISUAL-001` | corrected exemplar `LG-V7`; obsolete four-row gate list is forbidden |
| Design 06 `v8` Foundation route | resumable five-skill route and partial result | `P04-ROUTE-001`, `P04-SEMANTIC-001`, `P04-RSP-001` | corrected to 18-22 minute estimate, hard 30-minute ceiling, no placement shortcut |
| Design 06 `v9` Cross-family contracts | shared states, reasons, focus, responsive and security fixtures | `P04-COVERAGE-001`, `P04-SEMANTIC-001`, `P04-COMPAT-001` | derived rules; Architecture resolves every conflict named in section 4 |

### 5.1 Compact frames, exactly 41

| IDs | Source anchors | Implementation destination |
|---|---|---|
| `CF-01-01` to `CF-01-04` | Design 02 `1.1` landing, `1.2` goal/date, `1.3` first probe, `1.4` placement result | bare/protected entry, goal form, foundation route, result shell; `1.1` corrected to closed registration |
| `CF-02-01` to `CF-02-06` | Design 02 `2.1` Coach, `2.2` attempt, `2.3` diagnosis, `2.4` repair, `2.5` fresh check, `2.6` remember | AppShell and one shared attempt/result/repair flow |
| `CF-03-01` to `CF-03-04` | Design 02 `3.1` Listening, `3.2` Writing, `3.3` mic preflight, `3.4` Speaking turn-taking | four typed regions inside the shared shell |
| `CF-04-01` to `CF-04-06` | Design 02 `4.1` Readiness, `4.2` component detail, `4.3` Train, `4.4` mock preflight, `4.5` mock result, `4.6` Ready to Book | protected destinations and focused mock/result shells; `4.6` corrected to Gates A-F |
| `CF-05-01` to `CF-05-06` | Design 02 `5.1` mic denied, `5.2` audio failed, `5.3` offline Writing, `5.4` mock interrupted, `5.5` return after six weeks, `5.6` data/deletion | shared neutral recovery family; `5.6` corrected to architecture lifecycle |
| `CF-06-01` to `CF-06-02` | Design 06 `6.1` signed-out, `6.2` expiry mid-attempt | bare shell and SessionNotice, with honest server-decided validity |
| `CF-06-03` to `CF-06-04` | Design 06 `6.3` account/preferences, `6.4` deletion | Account utility route and architecture data-rights states |
| `CF-06-05` to `CF-06-06` | Design 06 `6.5` Progress, `6.6` weakness detail | Progress list/detail and lifecycle projection |
| `CF-06-07` to `CF-06-08` | Design 06 `6.7` cloze attempt, `6.8` cloze result | Language Elements region and result slot |
| `CF-06-09` to `CF-06-10` | Design 06 `6.9` capture/sending, `6.10` transfer failed | Speaking region plus UploadStatus |
| `CF-06-11` to `CF-06-12` | Design 06 `6.11` partial Writing result, `6.12` pending Readiness | exhaustive capability state fixtures with named affected scope |
| `CF-06-13` | Design 06 `6.13` Gates A-F | authoritative reason fixtures, no client gate calculation |
| `CF-06-14` to `CF-06-15` | Design 06 `6.14` resumed route, `6.15` partial-probe outcome | foundation wrapper/checkpoint and honest evidence-building result |

### 5.2 Large-screen exemplars, exactly eight

| ID | Source anchor | Required behavior |
|---|---|---|
| `LG-D1` | Design 03 D1 | Coach 7/5 at 1024+, one dominant plan action |
| `LG-D2` | Design 03 D2 | Readiness 8/4 at 1280+, read-only evidence panel |
| `LG-D3` | Design 03 D3 | Writing prompt/editor 4/8 split at 768+ |
| `LG-D4` | Design 03 D4 | focused mock stays at 720 CSS px maximum |
| `LG-D5` | Design 03 D5 | tablet top rail and sheet-to-dialog semantic equivalence |
| `LG-V3` | Design 06 V3 | Progress list plus read-only detail at 1280+ |
| `LG-V4` | Design 06 V4 | cloze text/options two-column arrangement at 768+ |
| `LG-V7` | Design 06 V7 | Gates 8/4 plus read-only evidence at 1280+ |

Design 03 D6 is a rule board, not a ninth exemplar. Its prohibitions apply to every
manifest row.

### 5.3 Component-family register, exactly 43

The register groups Design subparts as owned variants and slots. Every name in Design
01 section 2.14 and the Design 05 delta must resolve to one of these IDs.

The input-kind column uses three explicit layers. `UiProjection<T>` is a serializable,
exhaustive union in `packages/contracts/src/ui-projections.ts`; only the server facade
may construct it from domain/application output. `DsContract<T>` is presentation-only
configuration or a typed slot in `packages/design-system/src/contracts.ts`.
`LocalState<T>` is ephemeral browser interaction and cannot create a score, validity,
Readiness band, gate result, authorization result, or reason. In the boundary column,
`server` means a server component renders authoritative projection data; `island`
means the smallest client component owns only the named interaction; `CSS` means no
JavaScript owns responsive behavior.

| ID | Exported family and owned variants/slots | Authoritative input kind | Ownership boundary | Owned semantic and accessibility behavior |
|---|---|---|---|---|
| `C01` | `AppShell`: `protected`, `bare`; `utilityHeader`, `bottomNav`, `sideNav`, `pageTitle`, `backLink`, `sectionCard`, `panel`, `divider`, banner/live-region slots | `UiProjection<AppShellView>` plus `DsContract<ShellSlots>` | server composition; CSS chooses nav form; no shell island | landmark order, one `h1`, four destinations, current-page state, back semantics, bare-shell omissions, skip target |
| `C02` | `AttemptShell`: conditions row, content/result/repair slots, `stickyActionBar` | `UiProjection<AttemptShellView>` plus region slots | server truth; child region/action may be an island; CSS owns stickiness | focus mode, fixed condition labels, one primary action, sticky action never covers content, restored focus target |
| `C03` | `MockShell`: `mockTypeCard`, `mockSetupRules`, `preflight`, `measuredTimer`, `pauseWarning`, `interruptionRecovery`, `countdownBanner` | `UiProjection<MockShellView>` | server state; timer/pause island displays supplied deadlines only | measured-block label, silent ordinary ticks, assertive final-five warning once, pause/interruption ownership, 720 px measure |
| `C04` | `Overlay`: `sheet`, `dialog`, destructive-confirm slot | `DsContract<OverlayView>` plus `LocalState<open>` | island owns open/close/focus only; server supplies content/actions; CSS switches sheet/dialog | labelled dialog, focus trap, inert background, Escape policy, trigger focus return, non-dismissible destructive state |
| `C05` | `Sequence`: `stepper`, ordered-layout variant | `UiProjection<SequenceView>` | server; CSS only for layout | ordered-list semantics, current/completed text, no color-only progress, no invented completion percentage |
| `C06` | `Button`: primary, secondary, quiet, destructive; eight observable states | `DsContract<ActionView>` | native server-rendered control; narrow pending island only when submission requires it | native activation, 44 px target, visible focus, busy/disabled reason, destructive name, no disabled-without-explanation state |
| `C07` | `InlineAction`: `iconButton`, text `link` | `DsContract<ActionView>` | native link/button; no island unless action needs local state | correct link/button element, accessible name, decorative icon, external/new-context announcement where applicable |
| `C08` | `ChoiceNav`: `segmented`, `tabs`, `chip` | `DsContract<ChoiceNavView>` plus URL or `LocalState<selection>` | server sets initial/URL state; island owns roving selection only | tab/list semantics by behavior, arrow-key model, selected text/state, chips never masquerade as buttons |
| `C09` | `BinaryChoice`: `toggle`, `checkbox`, `radio` | `UiProjection<FieldView>` plus `LocalState<value>` | native form controls in a form island; server owns allowed values/errors | explicit group/field labels, checked state, help/error association, keyboard-native behavior, consequence text once |
| `C10` | `Field`: `text`, `select`, `date`, `month`, `schedule` | `UiProjection<FieldView>` plus `LocalState<draft>` | server owns schema, value and errors; island owns draft/parsing, never policy validation | stable label, instructions, required/invalid state, described error, locale-safe date parts, no placeholder-only label |
| `C11` | `AnswerChoice`: single/multiple, selected/correct/incorrect/revealed | `UiProjection<AnswerChoiceView>` plus `LocalState<selection>` | server owns reveal/correctness; island owns pre-submit selection | fieldset/legend, native choice semantics, keyboard reachability, correctness stated in text and announced after submit |
| `C12` | `MatchingPair`: source list, target slots, select-then-place, reset | `UiProjection<MatchingView>` plus `LocalState<placements>` | server supplies items/result; island owns placement gestures | fully operable without drag, numbered instructions, move confirmation, deterministic focus after place/reset |
| `C13` | `ClozeGap`: blank/input, options, result variant | `UiProjection<ClozeGapView>` plus `LocalState<answer>` | server owns accepted/result state; island owns answer entry | gap number and context in accessible name, text-entry fallback, ordered traversal, result not conveyed by color alone |
| `C14` | `ReorderList`: move up/down, position, reset | `UiProjection<ReorderView>` plus `LocalState<order>` | server supplies items/result; island owns reordering | no drag-only operation, position announced after each move, stable keys/focus, result described in reading order |
| `C15` | `FormFeedback`: `formError`, `errorSummary` | `UiProjection<FormErrorView>` | server owns errors; submission island moves focus once | field association, summary heading and links, focus first summary on failed submit, no duplicate live announcements |
| `C16` | `Recommendation`: `recommendationCard`, `whyThisDisclosure` | `UiProjection<RecommendationView>` | server; native `details` or disclosure island owns open state only | one dominant recommendation, duration/consequence text, disclosed server reason, correct expanded relation |
| `C17` | `SessionDurationPicker`: quick/standard/extended choices | `UiProjection<SessionDurationView>` plus `LocalState<selection>` | server owns allowed durations; island owns selection | radiogroup semantics, duration in every name, current choice stated, no compliance or completion framing |
| `C18` | `CoachMessage`: plan, diagnosis, reminder variants | `UiProjection<CoachMessageView>` | server only | message heading/author context, logical reading order, one next action, no chat-role claim when content is static |
| `C19` | `ResultCard`: outcome, `validityResult`, pending/partial slots | `UiProjection<ResultView>` | server only | outcome and validity named separately, no bare score, affected scope stated, heading announced after navigation |
| `C20` | `DecisiveEvidence`: evidence excerpts and conditions | `UiProjection<DecisiveEvidenceView>` | server only | evidence source/condition/time labels, quote semantics only for actual excerpts, text alternative for marks |
| `C21` | `RepairCard`: pattern, worked example, skip action | `UiProjection<RepairView>` | server content; optional answer island | one pattern, five-minute ceiling copy, skip stays neutral, example/result structure readable without styling |
| `C22` | `HintDisclosure`: closed/open/used | `UiProjection<HintView>` plus `LocalState<open>` | server owns consequence; island owns disclosure | expanded relation, help consequence before reveal, usage state visible, no hidden readiness-policy change |
| `C23` | `FreshCheckBanner`: available, unavailable/transfer-pending | `UiProjection<FreshCheckView>` | server only | labels fresh-content authority, no-help condition, neutral missing-content ownership, one next action |
| `C24` | `WhatChangedSummary`: changed, unchanged, returns-due | `UiProjection<ChangeSummaryView>` | server only | before/after terms, no completion percentage, return date/reason in text, heading/list structure |
| `C25` | `EvidenceLabel`: five validity values plus eligibility text | `UiProjection<EvidenceLabelView>` | server only | exact validity word and reason, icon/color redundant, practice-only stays separate, accessible name excludes decoration |
| `C26` | `WeaknessCard`: due, improving, stale, contradicted, empty | `UiProjection<WeaknessView>` | server only | component/state/next review text, absence not zero, one detail link, no rank/level interpretation |
| `C27` | `DueReviewGroup`: due/soon/later/empty groups | `UiProjection<DueReviewGroupView>` | server only | time-group headings and counts, list semantics, empty state names scope, dates use machine-readable values |
| `C28` | `PendingBanner`: processing, slow, pending, partial, unavailable/fallback, retry-fresh | `UiProjection<CapabilityView>` | server transitions; static skeleton CSS; no polling island unless facade supplies state | 15/30-second policy without duration copy, one polite announcement per transition, affected scope, no provider names |
| `C29` | `SystemFailureBanner`: identity, media, capability, transfer, storage faults | `UiProjection<SystemFailureView>` | server owns reason/scope/action; no local retry policy | ownership, consequence, still-working scope, exactly one recovery action, neutral system styling, assertive only for named exceptions |
| `C30` | `ContradictionNotice`: new contradiction, under review, resolved | `UiProjection<ContradictionView>` | server only | names conflicting evidence and affected scope, does not average it away, exposes next action/review state |
| `C31` | `StaleEvidenceNotice`: stale, recheck due, recheck scheduled | `UiProjection<StaleEvidenceView>` | server only | stale reason/date/component, never failure styling, recheck action and readiness consequence in text |
| `C32` | `ReadinessEvidence`: `readinessBand`, `componentCard`, `passLineScale`, range, `confidenceMeter`, `sectionBreakdown`, `blockerCard`, `gapCard`, `readyToBookGate` | `UiProjection<ReadinessView>` | server only; CSS changes arrangement | six exact states, Written/Oral separation, 60 official line and labelled 65 margin, Gates A-F and server reasons, accessible text table |
| `C33` | `ChangeTimeline`: event list and empty state | `UiProjection<ChangeTimelineView>` | server only | chronological list/time elements, cause and evidence links, no decorative chart-only history |
| `C34` | `MilestoneRow`: achieved, current, upcoming, withdrawn | `UiProjection<MilestoneView>` | server only | status in text, date/source, withdrawn reason, no collectible level or badge semantics |
| `C35` | `MockOutcome`: `mockResultCard`, `mockComparison`, `postMockPriorities` | `UiProjection<MockOutcomeView>` | server only; CSS owns comparison layout | raw points and validity separated, comparable conditions labelled, priorities ordered, no probability or merged Readiness claim |
| `C36` | `TextAlternativeTable`: compact/expanded | `UiProjection<TextAlternativeView>` | server only | caption, row/column headers, same facts as graphic, responsive scroll/reflow without clipped focus |
| `C37` | `ReadingRegion`: `readingTextPane`, `questionList` | `UiProjection<ReadingRegionView>` plus region answer state | server supplies text/questions; answer islands stay inside region | article/language structure, question navigation, text scaling/reflow, source and allowed-help labels |
| `C38` | `LanguageElementsRegion`: `clozeTextPane`, gap/options/result slots | `UiProjection<LanguageElementsView>` plus C13 state | server truth; C13 islands own entries | document reading order, numbered gaps, keyboard traversal, no visual-position-only references |
| `C39` | `ListeningRegion`: `audioPlayer`, `replayCounter`, `transcriptPane` | `UiProjection<ListeningRegionView>` plus media `LocalState` | server owns source/limits; media island owns playback only | named audio control, replay limit text, transcript availability, no autoplay, media failure routes to C29 |
| `C40` | `WritingRegion`: `writingEditor`, `contentPointChecklist`, `autosaveStatus`, `correctionLayer`, `revisionDiff` | `UiProjection<WritingRegionView>` plus local draft/checkpoint state | server owns prompt/checkpoints/result; editor island owns text and local save | labelled editor, character/word status without noisy live updates, durable-save wording, accessible diff and conflict compare/select/merge |
| `C41` | `SpeakingRegion`: `speakingPrompt`, `micPreflight`, `recordingIndicator`, `turnTaking`, `partnerTurn`, `transcriptEvaluation` | `UiProjection<SpeakingRegionView>` plus capture `LocalState` | server owns prompt/conditions/result; media island owns permission/capture; C43 owns transfer | explicit permission action, recording status and assertive failure, turn ownership, timer semantics, transcript/evaluation separation |
| `C42` | `SessionNotice`: signed-out, callback-failed, expired-idle, expired-mid-attempt, access-denied | `UiProjection<SessionNoticeView>` | server page in `AppShell.bare`; no credential island | page not dialog, `h1` focus, safe-state/one-forward-action copy, timed expiry assertive once, no provider/credential details |
| `C43` | `UploadStatus`: preparing, sending, queued-offline, retrying, not-sent, sent; export/purge noun variants | `UiProjection<TransferView>` | server owns durable state; transfer island displays supplied progress and retry action only | determinate value plus text, polite queue/completion, assertive live-recording failure, retained-local-artifact truth, no storage internals |

The reciprocal Design 01 section 2.14 mapping is fixed below. Parenthesized text is
the owning slot or variant, not another family.

| Design 01 §2.14 group | Every named item mapped to one family |
|---|---|
| Shell | `AppShell` -> C01; `UtilityHeader` -> C01 (`utilityHeader`); `BottomNav` -> C01 (`bottomNav`); `SideNav` -> C01 (`sideNav`); `PageTitle` -> C01 (`pageTitle`); `BackLink` -> C01 (`backLink`); `AttemptShell` -> C02; `MockShell` -> C03; `StickyActionBar` -> C02 (`stickyActionBar`); `SectionCard` -> C01 (`sectionCard`); `Panel` -> C01 (`panel`); `Divider` -> C01 (`divider`); `Stepper` -> C05 |
| Action and input | `Button` -> C06; `IconButton` -> C07 (`iconButton`); `Link` -> C07 (`link`); `Segmented` -> C08 (`segmented`); `Tabs` -> C08 (`tabs`); `Chip` -> C08 (`chip`); `Toggle` -> C09 (`toggle`); `Checkbox` -> C09 (`checkbox`); `Radio` -> C09 (`radio`); `TextField` -> C10 (`text`); `Select` -> C10 (`select`); `DateField` -> C10 (`date`); `MonthField` -> C10 (`month`); `ScheduleField` -> C10 (`schedule`); `AnswerChoice` -> C11; `MatchingPair` -> C12; `ClozeGap` -> C13; `ReorderList` -> C14; `FormError` -> C15 (`formError`); `ErrorSummary` -> C15 (`errorSummary`) |
| Coaching and evidence | `RecommendationCard` -> C16 (`recommendationCard`); `WhyThisDisclosure` -> C16 (`whyThisDisclosure`); `SessionDurationPicker` -> C17; `CoachMessage` -> C18; `ResultCard` -> C19; `DecisiveEvidence` -> C20; `RepairCard` -> C21; `HintDisclosure` -> C22; `FreshCheckBanner` -> C23; `WhatChangedSummary` -> C24; `EvidenceLabel` -> C25; `WeaknessCard` -> C26; `DueReviewGroup` -> C27; `PendingBanner` -> C28; `SystemFailureBanner` -> C29; `ContradictionNotice` -> C30; `StaleEvidenceNotice` -> C31 |
| Readiness and data | `ReadinessBand` -> C32 (`readinessBand`); `ComponentCard` -> C32 (`componentCard`); `PassLineScale` -> C32 (`passLineScale`); `ConfidenceMeter` -> C32 (`confidenceMeter`); `SectionBreakdown` -> C32 (`sectionBreakdown`); `BlockerCard` -> C32 (`blockerCard`); `GapCard` -> C32 (`gapCard`); `ChangeTimeline` -> C33; `MilestoneRow` -> C34; `MockResultCard` -> C35 (`mockResultCard`); `MockComparison` -> C35 (`mockComparison`); `TextAlternativeTable` -> C36 |
| Skill parts | `ReadingTextPane` -> C37 (`readingTextPane`); `QuestionList` -> C37 (`questionList`); `ClozeTextPane` -> C38 (`clozeTextPane`); `AudioPlayer` -> C39 (`audioPlayer`); `ReplayCounter` -> C39 (`replayCounter`); `TranscriptPane` -> C39 (`transcriptPane`); `WritingEditor` -> C40 (`writingEditor`); `ContentPointChecklist` -> C40 (`contentPointChecklist`); `AutosaveStatus` -> C40 (`autosaveStatus`); `CorrectionLayer` -> C40 (`correctionLayer`); `RevisionDiff` -> C40 (`revisionDiff`); `SpeakingPrompt` -> C41 (`speakingPrompt`); `MicPreflight` -> C41 (`micPreflight`); `RecordingIndicator` -> C41 (`recordingIndicator`); `TurnTaking` -> C41 (`turnTaking`); `PartnerTurn` -> C41 (`partnerTurn`); `TranscriptEvaluation` -> C41 (`transcriptEvaluation`) |
| High-stakes | `MockTypeCard` -> C03 (`mockTypeCard`); `MockSetupRules` -> C03 (`mockSetupRules`); `Preflight` -> C03 (`preflight`); `MeasuredTimer` -> C03 (`measuredTimer`); `PauseWarning` -> C03 (`pauseWarning`); `InterruptionRecovery` -> C03 (`interruptionRecovery`); `ValidityResult` -> C19 (`validityResult`); `PostMockPriorities` -> C35 (`postMockPriorities`); `CountdownBanner` -> C03 (`countdownBanner`); `ReadyToBookGate` -> C32 (`readyToBookGate`) |
| Design 05 delta | `SessionNotice` -> C42; `UploadStatus` -> C43; `AppShell.bare` -> C01 (`bare`); extended `PendingBanner` -> C28; extended `SystemFailureBanner` -> C29; extended `AutosaveStatus` -> C40 (`autosaveStatus`) |

`ReadyToBookGate`, mock setup/preflight, validity-first result, countdown/final-five,
and post-mock priorities compose the shell, readiness, result, banner, form, and timer
families above. They remain named exports where useful but do not become additional
families or divergent semantic owners.

### 5.4 Icon register, exactly 20

`I01 coach/MessageSquareText`, `I02 readiness/Gauge`, `I03 train/Dumbbell`,
`I04 progress/TrendingUp`, `I05 reading/BookOpen`,
`I06 listening/Headphones`, `I07 writing/PenLine`, `I08 speaking/Mic`,
`I09 measured-time/Timer`, `I10 evidence/ClipboardCheck`,
`I11 exam-date/CalendarCheck`, `I12 safe-correct/CircleCheck`,
`I13 borderline/TriangleAlert`, `I14 not-ready/OctagonAlert`,
`I15 evidence-building/CircleDashed`, `I16 stale-recheck/RefreshCw`,
`I17 our-fault/WifiOff`, `I18 transcript/BookOpen` reuse, `I19 lock/Lock`, and
`I20 upload/ArrowUp`.

The checked-in subset uses a 24-unit grid and 1.75-unit stroke. Icons are decorative
inside a control or paired with a visible word. Status cannot depend on glyph or
color alone. No runtime icon package or arbitrary icon-name input ships.

## 6. Token, type, mode, and asset contracts

The exact Architecture Stage 13 color token names and light/dark values remain the
canonical raw-value file. Component CSS may reference variables only. The execution
contract adds named scales without adding new semantic colors:

- spacing: 4, 8, 12, 16, 20, 24, 32, 40, 56, 84 CSS px and safe-area inset;
- sizes: 44 minimum target, 420 bare measure, 520 compact max, 720 German/mock
  measure, 1080 and 1200 app maxima;
- radii and elevation: the existing Design levels only, with shadow reserved for
  sheets/dialogs and a border fallback in dark/forced colors;
- density: comfortable default and compact tables/evidence only;
- motion: 120 ms state, 200 ms content, 260 ms sheet, 600 ms meaningful Readiness
  redraw; reduced motion removes translate/scale, limits opacity to 100 ms, keeps
  skeletons static, and never animates results, mistakes, or milestones;
- focus: 2 CSS px ring at 2 CSS px offset, visible in both modes and forced colors;
- visualization: named pass-line, absent/dashed track, bounded range pattern, and
  status variables. Every chart has a preceding sentence and real table equivalent.

Typography is Bricolage Grotesque for one heading per screen at 22 CSS px or larger,
IBM Plex Sans for body, task text and all numbers, and IBM Plex Mono at 12 CSS px or
larger for metadata/timers. Numbers use tabular forms. German content gets `lang=de`
and `hyphens:auto`; reason and weakness text never truncates. Fallback is Helvetica
Neue, Helvetica, Arial, then system sans.

04E records each asset in `packages/design-system/assets/manifest.json` with logical
ID, upstream repository and immutable release/commit, source filename, subset,
license/SPDX identifier, notice path, original and emitted SHA-256, byte size, and
generation command/version. It checks in the relevant OFL, ISC, and MIT notices.
Fonts ship only required weights and Latin/German WOFF2 subsets through `next/font/local`
or the equivalent local Next mechanism with `font-display: swap`. Icons are compiled
SVG React exports; the B1 mark is an owned local SVG. Browser tests fail any request
to Google Fonts, third-party CDNs, or an unapproved origin. Build tests fail unknown
digests, missing notices, remote `@import`, remote font `src`, data-URI font payloads,
or unmanifested UI assets.

## 7. Route, shell, and browser-state contract

- `/` is the signed-out personal entry and hands the held destination kind to
  `/auth/login`. Return values use an allowlisted same-origin route-kind mapper, not
  raw external URLs or content IDs.
- `/coach`, `/readiness`, `/train`, and `/progress` share the protected App layout in
  that fixed order. Server session resolution guards the layout. Hiding navigation is
  never authorization.
- `/settings` and `/settings/data` are protected utility routes. Account leaves all
  four destination items unselected.
- `/session/[id]`, `/attempt/[id]`, `/attempt/[id]/result`, `/mock/[id]`, and
  `/mock/[id]/result` use focused shells and suppress primary navigation at every
  width. The route is not multiplied per Design frame.
- `loading.tsx`, `error.tsx`, `not-found.tsx`, and scoped boundaries use stable,
  provider-neutral states. They preserve local work and never infer Evidence impact.
- URL state is limited to safe selection/disclosure/filter values. Back closes an
  overlay before leaving its route, restores the trigger, and does not submit,
  restart, clear, or manufacture state. Step transitions place focus on the first new
  meaningful element. A full-page interstitial is not a dialog.
- Pages and layouts are Server Components by default. Narrow client islands own only
  theme, overlay, input interaction, announcements, local status, and representative
  capability controls. No global client store or second query cache is introduced.
- Stage 04 does not implement IndexedDB, outbox, service worker, authoritative timer,
  or provider polling. It defines their view-model seams and uses deterministic
  fixtures. Later stages plug into the same discriminated contracts.

## 8. Semantic state and reason fixtures

`packages/contracts` will expose a versioned UI projection union that carries state,
human text, semantic status, affected scope, safe actions, announcement priority,
focus target, read-only labels, and source lineage. Consequential views accept only
that union. Unknown majors or states fail closed in the nearest feature boundary.

Fixtures cover:

- all five validity states and six Readiness states;
- every current Stage 03 reason-registry category applicable to presentation, plus
  exact synthetic unknown-reason and unknown-major failures;
- `evidence_building` with absent numbers, every discriminated borderline reason,
  Gates A-F failures, independent Written/Oral combinations, stale/contradicted, and
  no-probability negatives;
- processing, slow, pending, partial with named scope, unavailable with deterministic
  fallback, retry with fresh sample, and neutral technical/content/media/access faults;
- session signed out, callback failed, expired idle, expired mid-attempt, access
  denied, active/current device, other device, revoke pending/succeeded/failed, and
  recent-auth required/expired/satisfied;
- export and deletion states described in section 4;
- divergent draft branches, compare/select/merge, mock interruption, offline Writing,
  upload queue/failure, and honest server-decided session-expiry outcome.

Unit tests inspect roles, names, text, read-only state, focus hints, live-region
priority, and available actions. They do not snapshot implementation markup. A
forbidden-vocabulary test rejects provider names, password UI, pass probability,
overall score, unsupported certainty, provider/storage internals, promised evaluator
duration, instant backup erasure, and "still counts" session-expiry copy.

## 9. Responsive and accessibility contract

The same information architecture and semantic projection apply across five ranges:

- up to 479: one column, tested at 320, 360, 390, and 479; bottom navigation,
  sheet overlays, one sticky action;
- 480 through 767: same composition, max 520 and 24 CSS px padding;
- 768 through 1023: eight columns, top rail, dialogs, Readiness two-up, Writing and
  cloze two-column arrangements;
- 1024 through 1279: twelve columns/max 1080, left navigation, Coach 7/5;
- 1280 and larger: twelve columns/max 1200, Readiness/Gates 8/4 and Progress
  list/detail. Focused mocks remain at 720.

Acceptance includes 320 CSS px reflow, 200% text zoom on every representative view,
a 400% reflow spot check, portrait/landscape and resize without state loss, no ordinary
two-dimensional scroll, no clipped sticky action or focus ring, German task text at
720 or narrower, and no extra desktop claim or chart.

Shared primitives enforce native landmarks and controls, one `h1`, labelled groups,
programmatic errors and summary links, logical focus order, focus not obscured,
44 by 44 CSS px targets with 8 CSS px spacing, keyboard completion without shortcuts,
overlay trap/Escape/inert/return, select-then-place alternatives to drag, and visible
word plus icon/shape plus color for status. Pre-mounted polite and assertive live
regions receive explicit transition events. Timer ticks and transfer percentages are
not announced. Final-five, recording failure, and sign-out during timed work are the
only assertive classes.

Forced-colors tests verify system-color borders, text, focus, selected/disabled
states, and patterned ranges. Reduced-motion tests verify no translate/scale, static
skeletons, solid recording state, short opacity only, and no result animation. Manual
scripts cover keyboard and screen-reader reading order, status transitions, chart
table parity, form errors, session expiry, and draft-conflict recovery.

Accessibility support never changes Evidence if the tested capability and conditions
are equivalent. Altering or unverified support remains useful but is labelled with the
narrower server-owned claim. Stage 04 renders these states and does not infer an
accommodation profile.

## 10. Browser support

The release support policy is current stable and immediately previous major at the
release cut for Chrome desktop on Windows/macOS, Edge desktop on Windows, Firefox
desktop on Windows/macOS, Safari on macOS, Safari on iPhone/iPad, and Chrome on
Android. Exact versions, OS/device, test date, suite revision, and limitations belong
in the release `BrowserSupportManifest`; it is QA evidence, not a UA allowlist.

Each change runs Playwright Chromium, Firefox, and WebKit for semantic, keyboard,
responsive, forced-color, reduced-motion, and visual anchors. WebKit is not called
Safari and emulation is not called a physical-device test. Accepted 04E still needs
the bounded private-staging branded browser/device checks in section 16. An old or
restricted browser gets capability-local, best-effort messaging, not a global learner
failure.

## 11. Performance budgets

04E adds a reproducible size report and fails regressions above these initial Stage 04
caps, measured as emitted transfer bytes from a production build:

- root protected shell shared client JavaScript: at most 90 KiB gzip;
- any representative route's additional client island JavaScript: at most 60 KiB
  gzip; server-rendered/static routes should add no island without a named interaction;
- design-system CSS: at most 50 KiB gzip;
- all first-load WOFF2 font assets: at most 300 KiB, with later weights loaded only
  when their route needs them;
- 20 icons plus rendered logo assets: at most 40 KiB gzip;
- no third-party UI/font/icon/chart runtime request and no hydration warning.

On the bounded staging profile, representative public-origin navigation targets p75
LCP at or below 2.5 seconds, INP at or below 200 ms, and CLS at or below 0.1. A route
transition must show its semantic loading state immediately and must not wait for a
productive provider. These are UI regression budgets, not availability promises.
Execution records the measured baseline and may tighten a cap. Raising one requires a
reviewed reason and the same semantic/accessibility result; it cannot be hidden by
compression or test exclusion.

## 12. Visual and semantic regression strategy

Semantic tests are the release authority. They assert contracts, roles, accessible
names, state/reason text, focus, announcements, actions, absence, and disabled
reasons. Testing Library covers every component family and projection state. Playwright
covers complete representative paths, browser history, reflow, zoom, themes,
forced colors, reduced motion, keyboard, and axe.

Visual comparisons use stable synthetic data, local fonts, animation disabled, exact
viewport/device scale, and masked timestamps. Required anchors are 390 light/dark,
320 reflow, 768 tablet, 1024 Coach, and 1280 Readiness/Progress/Gates. Diff tolerances
are low and scoped to raster noise. A screenshot cannot override architecture,
approve stale copy, prove screen-reader behavior, or stand in for a missing state.
Reviewers compare each visual artifact to the manifest's Design anchor and its
documented correction.

Stage 04 check IDs are:

- `P04-SCOPE-001`: exact baseline and changed-path allowlist;
- `P04-COVERAGE-001`: 41/8/43/20 exact manifest counts and reciprocal mappings;
- `P04-TOKEN-001`: exact tokens/modes/scales, no raw values outside contracts;
- `P04-ASSET-001`: local provenance/licenses/digests and no remote font/icon request;
- `P04-COMPONENT-001`: all family/state observable contracts;
- `P04-SEMANTIC-001`: exact state/reason fixtures and prohibited-copy negatives;
- `P04-ROUTE-001`: shell, protection, return path, history, and boundary behavior;
- `P04-RSP-001`: breakpoint, 320, zoom/reflow, resize/orientation behavior;
- `P04-A11Y-001`: semantics, keyboard, focus, live regions, contrast, motion, axe;
- `P04-VISUAL-001`: representative deterministic visual anchors;
- `P04-PERF-001`: emitted asset/hydration/Core Web Vitals budgets;
- `P04-SECURITY-001`: XSS, external request, secret, provider-copy, authz-boundary
  and synthetic-evidence checks;
- `P04-COMPAT-001`: Stage 03 auth/session/contracts and later adapter seams preserved.

CI retains every existing P01-P03 gate and the frozen exact-lock critical audit. GH
Advanced Security will not be enabled; Dependency Graph is enabled. No new dependency
is justified unless native platform semantics cannot satisfy a component. Any addition
needs an exact pin, source/lifecycle/license review, critical audit, measured size,
and a provider-neutral exit.

## 13. Security and privacy

- Server layouts resolve authenticated identity and authorization from the existing
  App session. Client input, a route parameter, visibility, or a hidden control never
  authorizes access.
- Learner/content/reason strings render as text or a closed owned AST. No
  `dangerouslySetInnerHTML`, unsanitized SVG/HTML, remote asset URL, scriptable URL,
  provider payload, or client secret enters the design system.
- CSP-compatible theme bootstrap is fixed first-party code and reads only the
  non-sensitive device theme. Theme cannot carry learner identity or evidence.
- Tests use reserved synthetic IDs and text. Snapshots, screenshots, logs, traces,
  manifests, and PR evidence contain no owner email, issuer/subject, session/cookie,
  OTP, private origin, database URL, provider response, draft, task answer, or raw
  audio.
- Microphone, storage, object transfer, notifications, and full local recovery are
  state fixtures in Stage 04. No permission prompt, capture, upload, provider call,
  or background action is implemented.
- External product/provider flags remain false and unrelated adapters remain fake or
  disabled. The exact-lock audit, secret scan, package boundaries, no-network browser
  assertions, and asset-origin checks block the release candidate.

## 14. File-by-file execution map

Execution should follow existing package ownership and keep related exports together.
It need not create one file per component.

| Path | Planned responsibility |
|---|---|
| `packages/contracts/src/ui-projections.ts`, `index.ts`, tests | exhaustive UI projection/view-state unions and reason fixtures; no domain calculation |
| `packages/design-system/src/contracts.ts` | public component, shell, skill-region, focus and announcement contracts |
| `packages/design-system/src/tokens.css`, `styles.css` | exact tokens, scales, global semantics, mode/forced-color/motion rules |
| `packages/design-system/src/primitives.tsx` | native actions, inputs, overlays, errors, live regions, table/graphic alternatives |
| `packages/design-system/src/shells.tsx` | App/bare/attempt/result/mock compositions and responsive navigation |
| `packages/design-system/src/components.tsx` | the owned semantic component families, state variants and recovery views |
| `packages/design-system/src/skill-regions.tsx` | five typed region slots with no truth-bearing authority |
| `packages/design-system/src/icons.tsx`, `brand.tsx` | closed 20-icon registry and exact B1 assets |
| `packages/design-system/src/coverage/source-anchors.ts` | the exact source manifest described in section 5 |
| `packages/design-system/assets/**`, `THIRD_PARTY_NOTICES.md` | self-hosted files, manifest, digests and licenses |
| `packages/design-system/src/**/*.test.tsx` | observable component/state/a11y/asset/coverage tests |
| `apps/web/src/app/layout.tsx` | metadata, fonts, language baseline, theme bootstrap, global live-region hosts |
| `apps/web/src/app/(bare)/**` and current `auth/failure` | personal signed-out/failure/expiry/access-denied compositions without credential UI |
| `apps/web/src/app/(protected)/**` | protected four-destination and Account layouts plus representative projection pages |
| `apps/web/src/app/(focused)/**` | representative attempt/result/mock shells; no later-stage persistence |
| `apps/web/src/ui/**` | route composition and narrow client controllers only |
| `apps/web/src/server/frontend-data.ts` | server-first facade over existing contracts; deterministic fixture adapter only in test |
| `apps/web/src/app/__test__/ui/**` | synthetic visual harness that returns 404 outside the explicit test environment |
| `apps/web/tests/p04-*.spec.ts` | route, browser, responsive, accessibility, visual and budget checks |
| `scripts/check-design-coverage.mjs`, `check-assets.mjs`, `check-web-budget.mjs` | exact manifest, provenance/origin, and emitted-budget gates |
| `scripts/check-scope.mjs`, `test-scope.mjs` | Stage 04 exact baseline and changed-path allowlist with negative fixtures |
| `package.json`, workspace manifests, Playwright/Vitest/CI/release schemas | only the minimal commands, browser projects, and P04 evidence IDs needed by the gates |
| `Implementation/Personal/04-responsive-web-design-system/handoff.md` and checklist | exact delivery, tests, deferred owner gates, accepted SHA and evidence |

Architecture, Design, prior plans/handoffs, migrations, provider guides, worker code,
and unrelated packages are immutable for 04E unless an independently accepted plan
correction names a necessary compatibility edit.

## 15. Execution order

1. Add Stage 04 scope/coverage check IDs and negative fixtures first. Freeze the exact
   source manifest and architecture corrections before writing UI code.
2. Acquire the three font families and exact Lucide subset from immutable official
   sources, extract the exact B1 geometry, record notices/digests, and make remote
   asset use fail the build.
3. Replace baseline variables with the canonical token/type/mode contract. Prove
   no-script, first-paint, forced-color, reduced-motion, and no-hydration mismatch.
4. Implement native primitives, pre-mounted live regions, forms/errors, overlay
   behavior, and App/bare/focused shells. Keep components server-compatible until a
   real interaction requires a narrow client island.
5. Deliver the first representative vertical slice: personal signed-out entry and
   expiry states, protected Coach shell, one Reading attempt, deterministic
   validity-first result, repair, fresh retry, remember, Progress entry, and
   Readiness `evidence_building`. This proves absence is not zero and faults are not
   learner failure.
6. Add representative Writing and Speaking compositions with divergent draft recovery,
   UploadStatus, all capability states, and honest partial/unavailable behavior. These
   are UI contracts only; no provider or persistence runtime starts.
7. Fill the remaining component and frame manifest through Listening, Language
   Elements, Train/review, Progress/weakness, mock, Gates A-F, foundation route, and
   Account/data-rights fixtures. Reuse shells and slots rather than building
   disconnected screenshots.
8. Run semantic, browser, accessibility, visual, asset, performance, security,
   compatibility, scope, frozen-lock, documentation, and complete existing gates.
   Record failures without retry-to-green or weakened expectations.
9. Write the 04E handoff, update only the 04E checklist row to `[~]`, make focused
   reviewable execution commits after the accepted Planning commit, push the same
   branch, and stop for independent acceptance. Do not merge or start 05P/04E staging.

## 16. Post-acceptance private staging checkpoint and owner actions

Stage 04 Planning and Execution make no live claim. After independent 04E acceptance,
the owner/orchestrator must deploy the exact accepted 04E commit to the existing
private Coolify staging application behind Pangolin. Stage 10 later validates an
already integrated application; it is not the first integration point.

Current honest staging state at this baseline:

- the accepted Stage 03 commit plus scoped runtime and trusted-origin fixes are merged;
- private database roles, migrations/readiness, one-owner bootstrap, the allowed-owner
  Auth0 EU Email OTP/code exchange/App-session/owner-status path, logout/revocation
  cleanup, and return to fake/disabled were owner-verified with redacted results;
- Pangolin protects ingress and the narrow PostgreSQL column grants required by row
  locks are live;
- backup wiring/restore, R2 verification, protected readiness receipt, and later
  provider smokes remain deferred;
- the age private key is protected in 1Password but is not genuinely offline;
- GH Advanced Security remains declined/unavailable. Dependency Graph and the frozen
  exact-lock critical audit remain the repository security path.

The bounded Stage 04 checkpoint is:

1. Record the accepted SHA, matching image/release identity, clean deployment, green
   deterministic CI, and a protected pre-change recovery/rollback reference. Keep all
   external-call, paid, public-object, guest, account-optional, experimental, and
   productive flags false. Keep unrelated providers fake/disabled and every accepted
   spend envelope in force. The orchestrator should use the authenticated Coolify
   connection when it is available. If a dashboard-only action is unavoidable, cite
   only the exact applicable guide step, `OPS-04` or `OPS-05` in
   `docs/setup/personal/02-coolify-two-vm.md` and `AUTH-09` in
   `docs/setup/personal/05-auth0-eu-email-otp.md`, and record only `verified`, `failed`,
   or `rolled_back`. Never request, view, repeat, or validate a secret value.
2. Through the private Pangolin public origin, run responsive checks at 320, 360, 390,
   479/480, 767/768, 1023/1024, 1279/1280, and a large desktop. Check 200% zoom,
   a 400% reflow spot, portrait/landscape/resize, sticky actions, real local fonts,
   no third-party requests, light/dark, forced/high contrast, and reduced motion.
3. Complete keyboard-only navigation, focus entry/return, form error, overlay,
   SessionNotice, Readiness text-table, and draft-conflict scripts. Run the available
   branded current browsers and label any automation evidence honestly. Use only
   synthetic state fixtures and redact the private origin from stored evidence.
4. Run one mandatory, bounded allowed-owner Auth0 Email OTP smoke because Stage 04
   changes entry and session UI. Enable only the already accepted Auth0 adapter and
   external-call flag for this check. Verify the public-origin redirect/callback/App
   session, held safe destination, anonymous denial, logout, revoked-session denial,
   and no password UI. On Auth0-hosted OTP pages, execute guide step `AUTH-09` and
   verify keyboard order, accessible names/instructions/errors, 320 CSS px reflow,
   200% zoom, representative 400% desktop reflow, contrast, reduced-motion behavior,
   wrong/expired-code handling, and focus recovery. Use the synthetic/non-sensitive
   evidence rules below. Do not record the owner email, OTP, issuer, subject, URL
   parameters, cookie, token, or private origin in screenshots or logs.
5. Restore Auth0 and external calls to fake/disabled immediately after the bounded
   smoke. Verify every external/product flag is false, unrelated adapters remain
   fake/disabled, no provider session/token was retained by the App, and rollback
   still selects the predecessor without a data migration.
6. Store only the accepted commit, test/support-manifest versions, synthetic viewport
   classes, redacted result classes, cleanup result, and rollback result in protected
   staging evidence. A screenshot is supplemental and must contain no secret or
   private identifier.

Owner gates that remain honest after repository acceptance are access to the private
staging environment and representative branded browser/device/AT combinations. If an
official font, Lucide, or exact logo source cannot be verified with a compatible
license and digest, the owner must supply or approve the authoritative asset source;
Execution may use the documented system-font or text-mark fallback but may not invent
or remotely load an asset.

## 17. Compatibility and rollback

- No database migration means repository rollback is a focused revert of Stage 04
  app/design-system/test/build changes. Data and Evidence history are untouched.
- Keep the Stage 03 auth endpoints, cookie, origin/CSRF, neutral owner-status response,
  health payload, server authorization, and package dependency direction compatible.
- Roll back a deployed UI by first returning any bounded Auth0/external flag to false,
  then selecting the last accepted image/commit. Immutable hashed assets may remain
  cached because old HTML references old hashes. Do not delete assets still referenced
  by the predecessor.
- Additive UI projection minors render known fields and ignore optional unknowns.
  Unknown major or consequential state fails the smallest feature closed. Rollback
  never rewrites a server fact, Evidence assertion, session, or reason registry.
- Later stages replace deterministic view fixtures through the same server-first
  facade and component contracts. They do not fork shells or preserve a test fixture
  as a second semantic authority.

## 18. Risks and controls

| Risk | Control and exit |
|---|---|
| Forty-nine visual references become disconnected pages | exact reciprocal manifest plus vertical-slice sequencing; frames remain states, not routes |
| The broad Design index produces component sprawl | exact 43 family register, slots/variants, anti-fork tests |
| UI fixtures drift into learner truth | strict synthetic-only adapter, no public production fixture route, server-owned projection unions |
| Stale Design copy overstates identity, evidence, deletion, or timing | architecture correction fixtures and forbidden-copy scan |
| Fonts/logo lack trustworthy provenance | immutable source, licenses/digests/render verification; system-font/text fallback or block, never remote load |
| Server-first composition grows large client bundles | narrow islands and hard emitted-size budgets |
| Screenshot stability hides semantic regressions | semantic tests are authoritative; visuals are supplemental |
| Automation overstates Safari/device/AT support | exact support manifest and separately labelled branded/manual evidence |
| Focus/live-region behavior becomes noisy | shared pre-mounted channels, explicit event fixtures, manual transcript |
| Personal auth presentation erases commercial seams | existing false guest/account-optional flags retained and contract-tested |
| Staging evidence leaks private data | synthetic fixtures, redaction, protected evidence, no private origin/OTP/session screenshots |

## 19. Precise Definition of Done

04E is ready for independent review only when all of the following are true:

- the exact accepted Planning commit is an ancestor and the diff stays inside the
  Stage 04 allowlist;
- one typed reciprocal manifest contains exactly 41 compact frames, eight large
  exemplars, 43 component families, and 20 icon IDs, with every source anchor mapped
  to implementation and tests or a documented corrected/derived/obsolete resolution;
- the 25-token light/dark contract, named layout/motion/focus/data scales, three type
  roles, self-hosted assets, notices, immutable source versions, SHA-256 digests, and
  no-external-font/icon checks pass;
- App/bare/attempt/result/mock shells, four destinations, Account utility route,
  protected routing, URL/back/focus behavior, error/loading/empty/degraded states,
  and representative compact/desktop vertical slices pass without a native/PWA fork;
- all 43 component families and 20 icons pass observable state, semantic ownership,
  keyboard, focus, disabled-reason, and anti-fork tests;
- fixtures cover exact validity, Readiness, reason, capability, auth/session/device,
  recent-auth, export/deletion, draft-conflict, and session-expiry states. Forbidden
  probability, provider, password, instant-backup-erasure, and unsupported-certainty
  strings fail tests;
- 320 CSS px through large desktop, all breakpoint edges, 200% zoom, 400% reflow
  spot, resize/orientation, 44-by-44 targets, 8-pixel spacing, landmarks/names/errors,
  keyboard completion, live-region transcripts, forced colors, reduced motion,
  chart-table parity, and axe checks pass on the representative processes;
- deterministic visual anchors pass in light/dark and representative widths without
  being treated as behavioral truth;
- production build size, hydration, no-third-party-request, frozen-lock critical
  audit, secret, scope, package-boundary, type, lint, unit, integration, process,
  browser, OCI, documentation, release-manifest, and existing P01-P03 checks pass at
  the exact candidate SHA;
- no migration, live provider action, production deploy, native/PWA scope, secret,
  private data, or unrelated provider adapter was introduced;
- the handoff records commits, exact commands/results, asset and browser manifests,
  limitations, rollback, and the still-unperformed post-acceptance owner checkpoint;
- only the 04E checklist row is `[~]`. Independent acceptance alone may set 04E to
  `[x]`, deploy the exact accepted commit, merge the pull request, or begin Stage 05.
