# Bestehen / App — Frontend Application and Design-System Architecture

> **Stage:** 13 of 28  
> **Status:** Accepted architecture decision and implementation handoff  
> **Decision owner:** Responsive web composition, frontend state, shared components, and design assets  
> **Baseline:** m-elsharkawi/Bestehen-App@c6b3b0d5131710fd93c7f7dece9ee0698927c495; m-elsharkawi/Bestehen-Shaping@9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc  
> **Scope:** Architecture and contracts only; no route, component, style, asset, endpoint, configuration, or other production implementation

## 1. Purpose and scope

This stage defines one responsive, phone-first web composition for Bestehen / App. It turns the accepted product, domain, session, measurement, API, and design contracts into a frontend architecture that preserves learner truth. It settles route and shell composition, feature boundaries, dependency direction, server/client/local/form state, cache and invalidation, draft recovery, optimistic limits, the shared five-skill component foundation, semantic tokens, typography, icon and Threshold B assets, component state contracts, error isolation, and screen-to-module/API traceability.

The browser is a projection and interaction surface. It never owns evidence validity, learner capability, Mistake Memory, progression, Readiness, mock validity, Ready-to-Book, content rights, or the coaching priority. A technical, content, media, accessibility, browser, network, or evaluator fault cannot become learner failure. Missing evidence is absence, never zero. Written and Oral remain independent. Safe is not Ready to Book. No frontend field, calculation, chart, cache entry, copy template, or telemetry event represents pass probability.

This stage does not implement the application, select authentication/evaluation/media vendors, define the final browser matrix, create the absent logo export files, or choose later deployment/security/analytics controls. Stages 14–26 own those mechanisms while preserving the contracts here.

## 2. Inputs, authority, and continuity

### 2.1 Reproducible source snapshot

All required sources were fetched from GitHub main on 2026-08-23. The design source was read as behavior and layout specification, not copied as runtime code.

| Repository / path | Blob SHA | Use |
|---|---|---|
| Bestehen-App prompts/architecture/13_define_frontend_application_and_design_system_architecture.txt | 03d9e871f8ac282236861e7eef49a152393cc154 | Binding Stage 13 contract |
| Bestehen-Shaping app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 | Highest product authority |
| Bestehen-Shaping 02_Bestehen_Identity.md | f8799407f7b4a5a657f8c81439425d5a004f4e1c | Identity, voice, palette |
| Bestehen-Shaping app/18-coach-personality-and-behavior.md | 7bc3c2ee918264911a9550fe20e53dc565f986dd | Fact → meaning → next action |
| Bestehen-Shaping app/19-information-architecture-and-core-screens.md | 615ba3ce97fb25f974b6ba3a020cf254ddd0065f | Four destinations and screen responsibilities |
| Bestehen-Shaping app/20-progress-and-motivation.md | fd8d002dbb79fd66dca3fdfa8f6771318f76cbe4 | Evidence-backed progress, no game layer |
| Bestehen-Shaping app/22-user-controls-vs-coach-autonomy.md | 27f33cd56a09df27952e15bb3dfd0e077b89633c | Learner/system control boundary |
| Bestehen-Shaping app/26-platform-accessibility-nonfunctional.md | 8137091683941b0d55f3d4fb90af3c402b8371e5 | Responsive web, accessibility, latency, recovery |
| Bestehen-App Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 | Consolidated design contract |
| Bestehen-App Design/Bestehen-01-Design-System.dc.html | d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a | Tokens, components, states, icons |
| Bestehen-App Design/Bestehen-02-Mobile-Screens.dc.html | 0a9f2d3ea982c3197f399941b57defd9869d2428 | Current numbered mobile frames |
| Bestehen-App Design/Bestehen-03-Desktop-Responsive.dc.html | 94056db181b45298a759ff727ad5cfeac2f2a469 | Tablet/desktop composition |
| Bestehen-App Design/Bestehen-04-Flows-Handoff.dc.html | 7120b05a2272c31e5896e4313a7007935f5d0aed | Flows A–G, accessibility and recovery |
| Bestehen-App Design/Bestehen-Type-Options.dc.html | 7b51302ad1943c2676a5bb28d54aa7ead28b8dcd | Final type-role evidence |
| Bestehen-App Design/Bestehen Logo/Bestehen Logo System.dc.html | 5eb296da8a83531306195c9d91dd30cbeed8c608 | Threshold B B1 geometry and asset register |
| Bestehen-App Architecture/00-architecture-shaping-plan.md | b263c5e7b3bccc0450ddd17aa0cc007432d672b7 | Stage routing and downstream owners |
| Bestehen-App Bestehen_App_Architecture_Checklist.md | e1c489fc98f8c2e73b7305b23a6b9879744e1bd6 | 24 Stage 13 checks initially open |
| Bestehen-App Architecture/01-architecture-charter-and-quality-attributes.md | cc8d28816f43d627861d11cd90e8770c4c96414c | Truth, local degradation, quality gates |
| Bestehen-App Architecture/02-system-context-and-product-boundaries.md | 046d114bbbc96528bf0b9eae0406c0235f759127 | Browser/App/Corpus and capability boundaries |
| Bestehen-App Architecture/03-technology-stack-and-repository-strategy.md | 907b04c57813dc50f92a7ed00e49196ff7d4a924 | Next.js 16, Node 24, TypeScript 5.9 monorepo |
| Bestehen-App Architecture/04-domain-model-and-bounded-contexts.md | ab1a775d7689e47bba00c2544c247ef344c44e70 | Owners and shared five-skill kernel |
| Bestehen-App Architecture/08-coaching-engine-and-session-state-machines.md | 02c5e1ee5967bad976eda49ab4813a768eda5bd3 | Deterministic plan/session/attempt orchestration |
| Bestehen-App Architecture/11-readiness-scoring-mocks-and-ready-to-book.md | 7c327cd770460b94107f2756e2b7d8f29c56b909 | Six states and independent gates |
| Bestehen-App Architecture/12-api-contracts-jobs-events-and-idempotency.md | c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528 | One versioned API, jobs, results, ETags |

Required Stages 01, 02, 03, 04, 08, 11, and 12 are present, accepted, and mutually consistent. No prerequisite requires correction.

### 2.2 Authority reconciliation and source issues

Stage 27 precedence remains: validity/fairness → direct evidence → independent Written/Oral risk → uncertainty resolution → due repair/retention → progression/coverage → preference. The UI may change priority presentation; it may not change truth.

Two design-source facts require explicit reconciliation:

1. The design narrative describes “24 mobile screens,” while the current numbered Design/Bestehen-02-Mobile-Screens.dc.html contains 26 frames: 1.1–1.4, 2.1–2.6, 3.1–3.4, 4.1–4.6, and 5.1–5.6. This document maps all 26 current frames. It does not manufacture 26 routes; frames are state/layout examples.
2. The logo system says vector masters are written to the project, but the current Design/Bestehen Logo directory contains the design document and support script, not the twelve registered SVG exports. The B1 geometry and asset names are authoritative; producing and verifying exports is a release dependency, not an architecture blocker and not permission to redraw the mark.

The logo wordmark exploration refers to outlined Instrument Sans, while application typography is Bricolage Grotesque, IBM Plex Sans, and IBM Plex Mono. There is no conflict: the outlined logo is an immutable image asset, not application text.

### 2.3 Current primary technical references

Accessed 2026-08-23:

- [Next.js App Router](https://nextjs.org/docs/app) and [layouts/pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) define the selected file-system router and persistent layouts.
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) makes pages/layouts server-first and recommends narrow client boundaries for interaction/browser APIs; server-only imports prevent environment poisoning.
- [Next.js font optimization](https://nextjs.org/docs/app/getting-started/fonts) supports self-hosted font delivery without browser requests to Google.
- [Next.js CSP guidance](https://nextjs.org/docs/app/guides/content-security-policy) and [React DOM guidance](https://react.dev/reference/react-dom/components/common) support strict script policy and forbid unsanitized HTML injection.
- [WCAG 2.2 understanding documents](https://www.w3.org/WAI/WCAG22/understanding/) cover focus, target size, reflow, status messages, timing, semantics, and alternatives.
- [CSS Color Adjustment Level 1](https://www.w3.org/TR/css-color-adjust-1/) defines color-scheme behavior with user preferences.
- [Lucide license](https://github.com/lucide-icons/lucide/blob/main/LICENSE) is ISC with some identified Feather-derived glyphs under MIT; notices ship with the subset.

These references justify framework use, not product semantics.

## 3. Architecture decisions

| ID | Decision | Alternatives and rejection | Consequence / review trigger | ADR |
|---|---|---|---|---|
| ARCH-S13-D01 | One Next.js App Router web composition with four destination roots, utility routes, and separate focused session/attempt/mock route groups. Frames are view states, not routes or services. | A single client SPA router duplicates the accepted stack and increases shipped JS. A route per frame leaks design artifacts into navigation. One catch-all screen hides deep-link/resume semantics. | Stable URLs and shared layouts; review only if a second client or independent deploy boundary is proven. | ADR-0020 |
| ARCH-S13-D02 | Server-first route composition; authoritative owner projections enter through one frontend data facade. Client islands are restricted to interaction, browser capability, local persistence, polling, and live attempt behavior. | All-client is simple mentally but exposes more code/secrets and duplicates truth. Server-only pages cannot support drafts/media. Direct feature-to-database access violates ownership. | No client domain calculations; contract mappers are shared between in-process server and HTTP client adapters. | ADR-0020 |
| ARCH-S13-D03 | No global client state store and no second general query cache at launch. Server projections are authoritative; route cache is disposable; feature controllers own ephemeral state; IndexedDB owns bounded drafts/checkpoints/outbox. | Redux/Zustand plus query library is familiar but creates another source of truth. Browser-only state is insufficient for recovery. RSC-only state cannot handle active attempts. | Add a library only after measured duplicated orchestration or cache defects, behind the same ownership contract. | ADR-0020 |
| ARCH-S13-D04 | Personalized projections are not shared-cache data. Commands use operation ID + ETag/version; completed mutations invalidate named projection keys and refresh the route. Pending jobs poll by ETag/Retry-After. | Time-to-live alone can show stale truth. Invalidate everything wastes work. WebSocket authority adds operations and does not improve truth. | Deterministic invalidation; push may later be a lossy invalidation hint only. | ADR-0020 |
| ARCH-S13-D05 | Optimism is limited to reversible local interaction, draft/checkpoint acknowledgement, and the device theme. Evidence, validity, evaluation, Readiness, mock verdicts, booking gates, rights, and deletion never update optimistically. | Optimistic scores feel fast but manufacture truth. No optimism at all makes harmless local actions sluggish. | Unknown command outcome queries its receipt before retry; UI can say “Saving” or “Waiting,” never guess. | ADR-0020 |
| ARCH-S13-D06 | One repository-owned UI/design-system package uses semantic CSS custom properties + CSS Modules and native semantics. No copied design runtime, utility-token fork, or full third-party UI kit. | Copying inline design HTML is quickest but inaccessible/unmaintainable. A full UI kit brings conflicting tokens/behavior. Screen-local styles drift. | A headless helper may sit behind a primitive after dependency/a11y review; it cannot define product state. | ADR-0021 |
| ARCH-S13-D07 | One AttemptShell/Result/Repair/Evidence foundation with five typed input-region extensions: Reading, Language Elements, Listening, Writing, Speaking. Extensions capture modality interaction only. | Five vertical component stacks drift. A universal free-form engine erases media/productive semantics. | Shell owns truth-bearing presentation and recovery; review if a modality needs unsafe casts or repeated shell conditionals. | ADR-0021 |
| ARCH-S13-D08 | Canonicalize the exact 25 semantic tokens, two modes, three type roles, 18 semantic icon IDs, and B1 Threshold B asset manifest as a versioned build-time design contract. | Raw hex/font/icon choices per component drift. Runtime theme/asset service adds failure. Embedding remote fonts/assets leaks requests and rights. | Static, content-hashed, self-hosted assets; token/asset contract major for semantic breaking change. | ADR-0021 |
| ARCH-S13-D09 | Consequential component state is an exhaustive discriminated view model derived from API results. Every state has text, semantic status, focus/announcement, safe actions, and affected scope; system-owned labels are read-only. | Booleans/null/color heuristics are ambiguous. Free-form server HTML risks injection and inaccessible behavior. | Unknown major/state fails closed in the smallest boundary with update/retry/export, never a default score. | ADR-0021 |
| ARCH-S13-D10 | Error containment is nested: document, destination, feature panel, focused shell, and capability/input region. Recovery preserves work before claims; local failures do not crash unrelated destinations. | One root boundary is simple but turns local faults global. Boundary per leaf creates noise and inconsistent recovery. | Correlation IDs and redacted telemetry; attempt/mock boundary consults server state before any claim. | ADR-0020, ADR-0021 |
| ARCH-S13-D11 | Render approved content from a closed rich-content AST/component map; escape learner text; prohibit unsanitized HTML/SVG; secrets remain server-only. | Trusted raw HTML is convenient but unsafe. Plain text only cannot represent all accessible task structures. | Publication and render validation are both required; rejected nodes make exact content unavailable/not counted, never guessed. | ADR-0021 |

## 4. Frontend composition, routes, modules, and dependencies

### 4.1 Route and shell ownership

Route names are product-stable URLs, not a mandate for folder spelling. Parentheses show non-URL route groups.

| URL / group | Shell | Server projection owner | Client/local owner | Main operations | Degradation |
|---|---|---|---|---|---|
| / | Arrival shell | Profile/Goal and capability | Small goal/date form; guest bootstrap | guest scope, placement plan | No account wall; written-only placement if mic unavailable |
| /coach | AppShell; Coach is active | Coaching current plan/reasons | duration/alternative sheet only | GET /plans/current; POST /plans:assemble | Last accepted plan with staleness, or honest pending/empty |
| /readiness | AppShell | Measurement current projection | disclosure/text-alternative view | readiness/booking queries | Missing fields absent; affected claim pending only |
| /readiness/written, /readiness/oral | AppShell detail | Measurement | disclosure | component evidence query | Other component remains available |
| /train | AppShell | Coaching + Review + Content availability | learner deliberate selection | plan alternatives, review/mock catalogs | Do not fall back to giant unranked library |
| /progress | AppShell | Evidence/Mistake/Measurement histories | filters/disclosures; no calculation | cursor histories | Empty history names next evidence-producing action |
| /goal | Utility shell | Profile & Goal | date/schedule form | versioned goal command | Date never changes Readiness by itself |
| /settings and /settings/data | Utility shell | Profile/Operations | stable preferences, export/delete intent | preference, export, deletion commands | Deletion pending is explicit; no optimistic disappearance |
| /session/{id} | Focused SessionShell; primary nav suppressed | Session & Attempt | current step focus and local checkpoint | create/start/resume/stop session | Resume conflict offers current/take-over/new-safe options |
| /attempt/{id} | AttemptShell; nav hidden | Session/Attempt + pinned manifest | extension input, timer display, checkpoint/draft | acquire manifest, checkpoint, exposure, submit | Local failure preserves draft; server decides validity |
| /attempt/{id}/result | Focused ResultShell | Evidence/Evaluation | disclosures only | evidence/evaluation query/job | Pending does not block unrelated work |
| /review and /weakness/{id} | AppShell or session context | Mistake & Review | selection/disclosure | review/weakness query; assemble work | Same weakness identity from every entry point |
| /mocks | AppShell within Train | Measurement | type selection/preflight form | mock catalog/start | Unsupported capability blocks exact mock, not training |
| /mock/{id} | MockShell; navigation suppressed | Measurement + Session/Attempt | checkpoint/timer/visibility/capability observations | block checkpoint/finalize | Preserve responses; smallest scope partial/interrupted |
| /mock/{id}/result | Focused ResultShell | Measurement | text alternative/disclosure | immutable mock result/job query | Validity precedes score; pending scope is named |

Coach/Home always has one dominant action: start or continue the current best plan. Adjust/Why/Train are secondary or tertiary. Train is never promoted by layout or color to a competing dominant action.

### 4.2 Responsive composition

| Width | Composition contract |
|---|---|
| ≤479 px | One column; validated at 360 and primary at 390; bottom navigation; sheets; one sticky action |
| 480–767 px | Same phone composition, centered max measure 520 and 24 px padding; no fourth layout |
| 768–1023 px | Eight columns; top rail; Readiness two-up; Writing prompt/editor side-by-side; dialogs replace sheets |
| 1024–1279 px | Twelve columns/max 1080; persistent left navigation; Coach plan 7/context 5 |
| ≥1280 px | Twelve columns/max 1200; Readiness 8+4 claim/audit; mocks remain centered at 720 |

Large screens add simultaneous context, not extra claims or charts. German task text never exceeds 720 px. Primary IA/order and evidence semantics do not change by device. Focused attempt/mock shells suppress primary navigation at every size.

### 4.3 Module boundaries and dependency direction

The logical package shape is:

- apps/web/app: route layouts, loading/error boundaries, metadata, composition only.
- features/coach, readiness, train, progress, goal-settings: destination presenters/controllers.
- features/session-attempt: SessionShell, AttemptShell, Result, Repair, recovery controller.
- features/skill-inputs: Reading, Language Elements, Listening, Writing, Speaking extensions.
- features/mock: preflight, measured shell integration, validity/result presentation.
- frontend-data: contract facade, server adapter, browser HTTP adapter, invalidation, job observer.
- local-work: IndexedDB draft/checkpoint/outbox repository, schema migration, device theme preference.
- ui: primitives, shared domain-facing components, tokens, icons, brand assets, accessibility behavior.
- contracts: generated API DTOs/discriminators and stable frontend view-model contracts.
- server application/domain modules: authoritative owners from Stages 04/08/11/12.

~~~mermaid
flowchart TB
  Routes["Next App Router layouts/pages"] --> Features["Destination and focused-flow feature modules"]
  Features --> Attempt["Shared session/attempt/result/repair foundation"]
  Attempt --> SkillPort["SkillInputRegion contract"]
  SkillPort --> R["Reading"]
  SkillPort --> LE["Language Elements"]
  SkillPort --> L["Listening"]
  SkillPort --> W["Writing"]
  SkillPort --> S["Speaking"]
  Features --> Data["Frontend data facade"]
  Attempt --> Data
  Data --> HTTP["Browser /api/v1 adapter"]
  Data --> InProc["Server in-process contract adapter"]
  HTTP --> Owners["Application commands/queries"]
  InProc --> Owners
  Features --> UI["Shared UI/design-system package"]
  Attempt --> UI
  R --> UI
  LE --> UI
  L --> UI
  W --> UI
  S --> UI
  HTTP --> Contracts["Generated contract DTOs"]
  InProc --> Contracts
  UI --> ViewContracts["Semantic view-model contracts"]
  Features --> ViewContracts
  Local["IndexedDB local-work repository"] --> Attempt
~~~

Dependency rules:

1. Routes import feature public entry points; no domain calculation occurs in a page/layout.
2. Feature modules may import frontend-data, contracts, local-work, and ui. They do not import another feature’s internals.
3. UI imports semantic view models and tokens only; it never imports API clients, database code, domain owners, learner identity, or feature modules.
4. Skill extensions import the shared SkillInputRegion contract and primitives; they never import, fork, or override AttemptShell, ResultCard, RepairCard, EvidenceLabel, validity, or Readiness.
5. Browser modules cannot import server-only code. Server adapters cannot import browser APIs. Build/lint boundary checks enforce both graphs.
6. The in-process server adapter and /api/v1 adapter share the same command/query handlers and contract mapper; the server-rendering optimization cannot create a second semantic API.
7. Corpus has no browser module, route, learner payload, or runtime call.

### 4.4 Alternatives and exit

| Option | Benefit | Rejection / use |
|---|---|---|
| One client-rendered SPA | One mental model | More JS, weaker server secret boundary, redundant router/data boot; rejected |
| Server-only RSC | Minimal client state | Cannot safely support media, drafts, offline checkpointing, timers; rejected |
| Route per design frame | Direct screenshot mapping | Duplicates state and makes flow revisions URL breaking; rejected |
| One catch-all route | Few files | Weak deep links, resume and error isolation; rejected |
| Selected hybrid | Server-first projections + narrow live client controllers | Chosen |
| Future second client | Native/offline demand | Consume the same API/view contracts; do not move truth client-side |

## 5. State, data, cache, drafts, and optimistic behavior

### 5.1 Ownership matrix

| State class | Authoritative owner | Browser representation | Persistence / lifetime | Mutation rule |
|---|---|---|---|---|
| Evidence, validity, labels | Evidence & Capability | Read-only discriminated projection | Server facts/projections | Never edited/derived client-side |
| Readiness, mock, booking | Measurement | Read-only discriminated projection | Server facts/projections | Never calculated or optimistic |
| Plan/session/attempt | Coaching or Session/Attempt | Pinned resource + ETag/version | Server; local receipt/checkpoint mirror | Commands require operation ID/version |
| Approved content/rights | Content & Forms | Pinned learner-safe serving manifest | Server/R2; current attempt memory | No arbitrary persistence; revocation obeyed |
| Productive evaluation | Productive Evaluation/Evidence | Job resource + pending/accepted view | Durable server job | Poll; candidate is not truth |
| Form input | Active feature controller | Current values, dirty/touched/errors | Memory until checkpoint | Client validation assists; server decides acceptance |
| Writing draft/checkpoint | Session/Attempt | IndexedDB recoverable copy | Bounded by attempt/status/deletion | Monotonic sequence/hash; conflict preserves both |
| Offline command outbox | Session/Attempt command intent | IndexedDB operation envelope | Until receipt/expiry/deletion | Same semantic ID/hash only |
| Raw audio | Capture adapter | Ephemeral in-memory/blob lease | Until upload/evaluation; ≤7-day server maximum | Never general cache/telemetry |
| UI disclosure/focus | UI component | Local state | Memory/URL where non-sensitive | No effect on truth |
| Theme | Device | light/dark/system preference | Per-device local preference | Optimistic and reversible |
| Goal/preferences | Profile & Goal | Form + server current version | Server; form draft memory | Explicit save/conflict resolution |

### 5.2 Query and cache policy

- Personalized learner projections use private/no-store semantics. Framework route and prefetch caches are performance hints only and are discardable.
- Immutable, public build assets are content-hashed and long-cacheable. Approved learner content follows the serving manifest’s rights/cache policy and is never made public by the frontend.
- Frontend-data defines named projection keys such as plan-current, session-{id}, readiness-current, weakness-{id}, history-{snapshot-cut}, and job-{id}. Keys include learner/guest scope and contract major; scope is never inferred from a URL alone.
- A successful mutation receipt returns affected projection keys or semantic invalidation categories. The controller invalidates those keys and refreshes the relevant server route. It does not mutate a cached Readiness number.
- Historical cursors remain bound to snapshot_cut. New facts start a new traversal; the client does not splice pages and claim completeness.
- Durable jobs use conditional polling with ETag and Retry-After, stop on terminal/deleted/cancelled, pause when the relevant view is hidden, and resume without creating another job. Push/SSE may later say “refetch job X”; it never supplies authoritative result content.
- A contract/design-state major mismatch fails only the affected feature. The fallback gives stable status text, correlation/reference, update/retry/export/continue-safe actions.

### 5.3 Command and optimism matrix

| Interaction | Optimistic? | Recovery |
|---|---:|---|
| Answer selection, disclosure, timer visibility | Yes, local only | Restore from controller/checkpoint |
| Theme toggle | Yes | Revert to OS mode if local storage/bootstrap fails |
| Draft typing | Yes, labelled local/saving | IndexedDB checkpoint then server receipt |
| Session length/skill form before save | Yes as form state | Conflict shows current/submitted choice |
| Mark server preference saved | No until receipt | Retry same operation ID |
| Submit attempt/mock | No | Query receipt on timeout; never duplicate |
| Evaluation completed | No | Poll/refetch accepted evidence |
| Evidence label/validity | Never | Render server state read-only |
| Readiness/Ready-to-Book | Never | Refetch authoritative projection |
| Delete all data | Never | Access revocation and durable deletion receipt govern |
| Rights/content eligibility | Never | Exact scope unavailable/replaced |

An unknown command outcome never becomes success or failure locally. The browser queries the operation receipt before retrying. Same operation identity with a different payload is a visible conflict/security condition.

### 5.4 Draft, reconnect, and conflict contract

A local-work record contains learner/guest scope, session_id, attempt_id, manifest revision, checkpoint sequence, response/draft reference or encrypted-at-rest browser representation where supported, canonical hash, updated wall/monotonic observations, local schema major, operation ID, and server base version. It excludes evaluator output, accepted evidence, Readiness, secrets, raw Corpus data, and general history.

- IndexedDB is the accepted local store; localStorage is limited to non-sensitive theme/bootstrap flags.
- Each meaningful answer transition checkpoints; Writing meets the shaped approximately-five-second loss bound. Autosave is a non-modal mono status.
- Reconnect sends monotonic checkpoints. An older duplicate returns the receipt. Same sequence/base with divergent payload preserves both branches and requires explicit resolution before submit.
- A stale tab may continue an already-pinned fair manifest when server preconditions allow. Active rights/safety revocation stops the exact scope.
- Guest-to-account attachment preserves semantic IDs; local facts are not summed with server projections.
- Export/delete and scope revocation purge local-work records through a deletion journal; late outbox work is rejected. Stage 20/23 supplies exact identity and encryption controls.
- Full offline parity and a general service-worker content cache are not launch scope. Already-loaded low-risk work and active drafts recover; online-dependent work says so before start.

## 6. Shared shell and five-skill extension contract

### 6.1 Shared ownership

The shared foundation owns:

- route/shell, title, fixed conditions row, timer placement/hide behavior, one dominant action;
- pinned plan/session/attempt/manifest identities and ETags;
- help/replay/exposure policy supplied by server semantics;
- checkpoint, submission, pending, conflict, resume and interruption flows;
- EvidenceLabel, ResultCard, DecisiveEvidence, RepairCard, FreshCheckBanner, WhatChangedSummary;
- validity/readiness/failure rendering; focus and live-region protocol;
- learner-safe analytics/telemetry events with no raw content;
- one semantic flow from Observe → Attempt → Diagnose → Repair → Retry → Remember.

A skill extension owns only the modality input region and capture mechanics.

### 6.2 Non-production explanatory contract

~~~text
SkillInputRegionContract {
  contract_major
  skill: reading | language_elements | listening | writing | speaking
  manifest_kind
  initial_response_projection
  capability_requirements[]
  render_task_content(closed_safe_ast)
  capture_response() -> local_response_delta
  checkpoint_payload(delta, sequence, canonical_hash)
  local_validation() -> accessibility_mapped_field_issues[]
  exposure_observations[]       // reveal/play/help facts, not validity
  capability_observations[]     // actual device behavior, not ability
  restore(local_checkpoint)
  dispose_ephemeral_media()
}

Forbidden extension outputs:
  evidence_state, readiness_state, score_interpretation, pass/risk claim,
  evidence_label text, coaching priority, validity override, rights override,
  timer rule, result/repair shell, arbitrary HTML, provider secret.
~~~

| Extension | Own input region | Required capability/recovery | Must reuse |
|---|---|---|---|
| Reading | text pane, question/choice/matching | keyboard select-then-place equivalent; content measure | AttemptShell, labels, result, repair |
| Language Elements | connected text, cloze/reorder | labelled 48 px gaps; keep text in view; keyboard path | Same foundation and Reading text primitive |
| Listening | audio player, replay counter | preflight, text instructions, replay fact, audio-failure not counted | Same shell/timer/result; transcript only after attempt |
| Writing | editor, content-point checklist, correction/revision view | ~5 s local draft, offline status, conflict branches | Same shell/labels/evaluation pending/result |
| Speaking | mic preflight, recording, turns/partner | permission/device/silence checks, ephemeral media, typed rehearsal with narrower claim | Same shell/labels/evaluation pending/result |

### 6.3 Preventing forks

- One component has semantic variants; a variant is not a copy. Skill names are inputs, not directory-level UI systems.
- The shell passes a slot for the input region and optional capability affordances; extensions cannot replace header, action bar, conditions, pending, result, repair, or evidence panels.
- Every new extension must pass contract fixtures for all five validity states, partial affected scope, conflict, content/media/access failure, no-JS/server fallback where applicable, keyboard/reflow/zoom, and draft/resume.
- Fork trigger: the same skill-specific branch appears in three shared components or a modality requires unsafe generic fields. Response is to extend the contract deliberately, not copy the shell.
- Removal/exit: an extension can be replaced without rewriting facts/API; stored response/observation contracts and manifests remain provider/framework neutral.

## 7. Design-system, theme, type, icons, and assets

### 7.1 Package and styling architecture

One repository-owned ui package contains primitives, semantic components, tokens, icons, brand manifest, and accessibility tests. CSS custom properties are the runtime token boundary; CSS Modules compose components. Raw hex values occur only in the canonical token contract and controlled asset source, never in feature CSS/JS. No Tailwind/theme object, full UI kit, or copied inline .dc.html runtime creates a parallel semantic system.

The design contract has independent axes:

- design_contract_version: component semantics and view-model major/minor;
- token_set_version: exact names and light/dark values;
- icon_set_version: exact semantic IDs, geometry/import mapping, license;
- brand_asset_version: Threshold B asset manifest and digests;
- font_asset_version: family/weight/subset/license digests.

Breaking a token name/meaning, component discriminator, or icon semantic ID requires a major. Value tuning or an additive token may be minor after both-mode contrast, forced-colors, screenshot and accessibility gates. Rollback moves the build manifest pointer; it never changes learner facts.

### 7.2 Exact 25 semantic tokens

| Token | Light | Dark | Contract use |
|---|---|---|---|
| surface.paper | #F1F4F8 | #0F1621 | App background, study surfaces, focused attempt shell |
| surface.raised | #FFFFFF | #17202D | Cards, sheets, inputs, active plan |
| surface.sunken | #E8ECF3 | #131C28 | Section headers, quoted task text, secondary panels |
| surface.mist | #E2E8F0 | #1E2834 | Data tracks, neutral/system states, disabled fills |
| surface.ink | #14213D | #070C15 | Measured timer, mock header, toast, desktop sidebar |
| text.primary | #14213D | #E9EEF5 | Headings, body, numbers, pass-line rules |
| text.body | #2C3A5C | #CBD5E2 | German task content and quoted evidence |
| text.secondary | #4A5670 | #A7B3C4 | Supporting sentences and metadata |
| text.muted | #68738A | #8A97AB | Mono labels ≥12 px; never body |
| text.onInk | #EDF1F7 | #E7EDF5 | Text on surface.ink |
| border.default | #D6DCE6 | #2A3542 | Card/divider rules |
| border.strong | #B8C2D1 | #3E4A5C | Inputs, selectable rows, dashed empty tracks |
| accent.base | #2A9D6F | #33B183 | Brand rule, selected fills, estimate markers; graphics only |
| accent.text | #1D6F50 | #54C698 | Links, tertiary actions, earned-progress wording |
| accent.tint | #E3F1EA | #112620 | Fresh check, correct answer, Safe chip |
| status.attention.graphic | #D99A2B | #DDA749 | Final-five rule, borderline marker |
| status.attention.text | #8A6113 | #E8C079 | Borderline/pending/uncertainty words |
| status.attention.tint | #FBF1DC | #241C0E | Pending evaluation/countdown alert |
| status.risk.graphic | #B64B4B | #C95F5F | Below-line marker, recording dot |
| status.risk.text | #A83F3F | #F0908F | Not ready, wrong answer, destructive text |
| status.risk.tint | #F8E9E9 | #2A1618 | Incorrect row/pass-critical banner |
| status.system | #8790A3 | #6E7C90 | Invalid/interrupted/our-fault dashed family |
| data.range | #C6D0DF | #303E4F | Planning-range pattern |
| focus.ring | #1D6F50 | #4CC492 | 2 px outline at 2 px offset |
| elevation.shadow | rgba(20,33,61,.12) | rgba(0,0,0,.55) | e2 sheets/dialogs only |

text.primary and surface.ink deliberately share a light value but diverge in dark mode; they are never collapsed. Graphic and text status tokens remain separate. Status always adds a word, semantic shape/icon, and fixed context.

### 7.3 Theme contract

- Default follows prefers-color-scheme; a manual light/dark/system override is stored per device.
- CSS supports both color schemes and paints the document/root background so native controls and overscroll agree.
- A minimal reviewed, nonce-authorized first-party bootstrap reads the non-sensitive device override before paint and sets data-theme. It interpolates no user/content data. If blocked or corrupt, CSS uses OS preference; the App remains usable.
- The client ThemeController owns only the preference; components consume tokens and never branch on theme.
- Theme changes do not refetch content or alter evidence. Forced-colors and reduced-motion remain user-agent/accessibility concerns, not theme variants.
- Both modes, OS changes, manual override, no-script fallback, hydration, and first-paint mismatch are release tests.

### 7.4 Typography roles and delivery

| Role | Family | Rules |
|---|---|---|
| Display/section heading | Bricolage Grotesque | Once per screen; ≥22 px; never paragraph or number |
| Reading/body/number | IBM Plex Sans | All readable text and all numbers; tabular numerals for score/index/timer |
| Metadata/timer/label | IBM Plex Mono | ≥12 px; evidence metadata and mono eyebrow only |

Fonts are self-hosted at build/deploy using the selected Next font mechanism or equivalent local WOFF2 delivery. Browser requests never go to Google. Only used weights/subsets ship; German diacritics and language metadata are tested. Fallback is Helvetica Neue, Helvetica, Arial. Task content has lang=de and hyphens:auto; weakness/content/reason text never truncates and overflow-wrap:anywhere is prohibited. OFL notices and source/version digests ship.

### 7.5 Exact 18-icon semantic subset

| Semantic ID | Canonical Lucide glyph | Use |
|---|---|---|
| coach | MessageSquareText geometry | Coach destination |
| readiness | Gauge | Readiness destination |
| train | Dumbbell | Train destination |
| progress | TrendingUp | Progress destination |
| reading | BookOpen | Reading and transcript |
| listening | Headphones | Listening only |
| writing | PenLine | Writing |
| speaking | Mic | Speaking |
| measured-time | Timer | Timed work |
| evidence | ClipboardCheck | Evidence/audit |
| exam-date | CalendarCheck | Goal/date |
| safe-correct | CircleCheck | Safe/correct with words |
| borderline | TriangleAlert | Borderline with words |
| not-ready | OctagonAlert | Pass-critical risk with words |
| evidence-building | CircleDashed | Absence/insufficient evidence |
| stale-recheck | RefreshCw | Stale/contradicted/recheck |
| our-fault | WifiOff | System/media/evaluator fault |
| transcript | BookOpen reuse | Transcript is reading material; no extra glyph |

The checked-in subset uses the design’s exact paths, a 24 grid, 1.75 px stroke, and semantic wrapper IDs; aliases cannot introduce synonyms. Glyph sizes are 15/20/24 px inside ≥44 px targets. Status icons are aria-hidden beside visible status words. License notices cover Lucide ISC and Feather-derived MIT glyphs. No trophy, medal, star, flame, sparkle, mascot, celebratory or vendor logo enters the set.

### 7.6 Threshold B asset manifest and delivery

Concept B, B1 Threshold B is fixed. The full mark uses stroke 11 on a 100 grid with the rule x6→x94 at the vertical midpoint. The optical micro-mark uses stroke 16 and rule x12→x88 below 20 px. The mark appears at most once per screen, never beside a Readiness number or inside cards.

| Registered asset | Intended use | Minimum / rule |
|---|---|---|
| bestehen-symbol-primary.svg | B1 master symbol, ink + green | 20 px |
| bestehen-symbol-micro.svg | favicon/dense UI | 16 px; mandatory below 20 |
| bestehen-symbol-ink.svg | one-color documents | 20 px |
| bestehen-symbol-white.svg | dark surfaces | 20 px |
| bestehen-logo-primary-light.svg | primary full lockup | 96 px wide |
| bestehen-logo-primary-dark.svg | reversed lockup | 96 px wide |
| bestehen-wordmark-ink.svg | wordmark only | 88 px |
| bestehen-app-lockup-horizontal.svg | Bestehen / App | 120 px |
| bestehen-corpus-lockup-horizontal.svg | Bestehen / Corpus | not used as App learner brand |
| bestehen-app-icon-512.svg | web-app icon source | 512 square |
| bestehen-favicon-32.svg | light favicon | 32 square; dark sibling generated |
| bestehen-maskable-icon.svg | adaptive/maskable source | safe circle 0.80 |

Assets are produced from the authoritative design geometry, expanded/outlined, visually compared at 16/20/24/32/48/180/192/512 sizes, hashed into a brand manifest, and served as same-origin immutable static files. SVG is build input/static image or audited component generated from the master; runtime arbitrary SVG injection is forbidden. App icons/favicons include light/dark/one-color fallbacks. Clear space is 2× stroke width measured from rule ends. Trademark clearance and the design’s remaining export/outline steps are Stage 23/25 release dependencies; absence blocks brand release, not learner truth.

## 8. Exhaustive component and state contracts

### 8.1 View-model rule

A shared component receives an exhaustive semantic view model from an owner projection. It must not infer state from numeric thresholds, token/color, route, loading duration, local assistance, or copy. Each consequential variant includes:

- kind/discriminator and contract major;
- stable learner-facing label and structured fact/meaning/next-action;
- affected and unaffected scope;
- provenance/source cut/version tuple;
- safe actions with consequence;
- announcement priority and semantic focus target;
- read-only evidence conditions;
- retryability/staleness/availability where applicable.

Unknown consequential kinds fail closed in the nearest boundary. Copy may refine tone, but structured state wins.

### 8.2 Evidence validity component

| kind | Visual/semantic contract | Evidence consequence | Action |
|---|---|---|---|
| valid | solid neutral/positive structure plus “Valid” conditions | Exact named scope may count | Continue/result |
| partially_valid | solid structure; valid and affected scope both named | Unaffected scope only | Inspect/retry affected scope |
| pending | attention information, not score/error | Dependent conclusions wait | Continue unrelated work; view job |
| interrupted | system/mist dashed; practice-only | Cannot claim uninterrupted conditions | Resume/new attempt/options |
| not_counted | system/mist dashed; “This wasn’t you” | Zero learner-negative effect; remains visible | Replacement/report/continue |

Red is not used for pending/interrupted/not_counted. Partially valid is never displayed as whole. History preserves the attempt and exact scope.

### 8.3 Readiness component

| kind | Required rendering | Forbidden |
|---|---|---|
| evidence_building | dashed empty track, pass line, missing direct scope, action; no estimate/index | zero/grey fill |
| not_ready | exact independent component/blocker/range/reason; single risk emphasis | overall compensation |
| borderline | reason discriminator: value band, range crossing, breadth gap, or contradiction | generic amber bool |
| safe | estimate/range/confidence/breadth/currentness; label 65 as Bestehen margin | Ready-to-Book implication |
| ready_to_book | current Safe plus explicit Gates A–F/checklist | higher score/band |
| stale_contradicted | historical milestone + current reason + smallest clarifier | erasing history or scoring down |

Written and Oral cards are peers and never merge. ReadinessBand and PassLineScale always have a DOM sentence before the graphic and Show evidence as text table. No probability terminology is allowed.

### 8.4 API result, failure, empty, and pending components

| Result/state | Shared component behavior |
|---|---|
| completed | Render committed projection/receipt and invalidate named keys |
| accepted_pending | PendingBanner + durable job link, unaffected actions, polite announcement |
| partial | Valid/pending/unavailable scope table; never generic “partial success” |
| conflict | Current/submitted versions and safe reload/merge/branch/take-over actions; preserve drafts |
| unavailable | Name capability/right/technical scope neutrally and equivalent/narrower alternatives |
| deleted | Access revoked/deletion progress/terminal receipt; reject resurrection |
| absent | EmptyState naming missing evidence/history/content and the smallest producing action; never zero |
| validation problem | ErrorSummary, labelled fields, focus first invalid; raw detail not parsed |
| dependency/internal problem | SystemFailureBanner with correlation ID, retry rule and unaffected navigation |
| initial loading | Static shape skeleton only; no animated spinner |
| L2 delay around shaped threshold | Replace skeleton with explicit Pending copy and continue options |
| stale projection | Show last generation with computed_at/source cut/staleness and refresh/rebuild state |

Pending is productive content. It blocks only dependent conclusions. Timer ticks are never live-announced; final-five and recording failure are the only assertive cases from design.

### 8.5 Progressive disclosure and read-only evidence

- The first view answers where am I, what blocks me, and what next. Detailed evidence follows through native disclosure.
- Conditions show at most three labels inline; the rest open behind Conditions. Labels come from API semantics and are not inputs.
- Why this today? reveals accepted reason codes, source cut and consequence; it cannot change priority.
- Readiness graphics expose Show evidence as text with a real table. Desktop may show claim and audit together.
- Decisive evidence precedes likely cause and advice. Result before repair; validity before score.
- Critical blockers, uncertainty, destructive consequence, affected scope, and rights/access limitation are never hidden behind disclosure.

## 9. Screen, flow, component, module, and API traceability

### 9.1 Current numbered frames

| Design frames | Route/view state | Feature/module | Shared components | Main API/resource |
|---|---|---|---|---|
| 1.1 Landing; 1.2 Goal/date | / and /goal | arrival, goal-settings | PageTitle, DateField, CoachMessage | guest/profile goal commands |
| 1.3 First probe; 1.4 placement result | /session/{id}, /attempt/{id}/result | session-attempt | AttemptShell, EvidenceLabel, ReadinessBand evidence-building | plan/session/attempt/evidence |
| 2.1 Coach home | /coach | coach | RecommendationCard, WhyThis, DurationPicker | GET plans/current; assemble |
| 2.2 Attempt | /attempt/{id} | session-attempt + extension | AttemptShell, StickyAction, conditions | manifest/checkpoint/submit |
| 2.3 Diagnose | /attempt/{id}/result | session-attempt | ResultCard, DecisiveEvidence | evidence/evaluation |
| 2.4 Repair; 2.5 Retry; 2.6 Remember | same session route states | session-attempt | RepairCard, FreshCheckBanner, WhatChanged | plan/session/attempt/review |
| 3.1 Listening H2 | attempt extension | listening | AudioPlayer, ReplayCounter | exposure/checkpoint/submit |
| 3.2 Writing SB3 | attempt extension | writing | WritingEditor, ContentPoints, Autosave | checkpoint/submission/job |
| 3.3 Mic preflight; 3.4 Speaking S2 | attempt extension | speaking | MicPreflight, Recording, TurnTaking | media lease/checkpoint/job |
| 4.1 Readiness; 4.2 Oral detail | /readiness[/oral] | readiness | ComponentCard, PassLineScale, TextTable | readiness/current |
| 4.3 Train | /train, /review, /mocks | train/review/mock | alternatives, DueReview, MockType | plan/review/mock catalogs |
| 4.4 mock preflight; 4.5 result | /mock/{id}, /mock/{id}/result | mock + attempt foundation | Preflight, MockShell, ValidityResult | start/finalize/job/result |
| 4.6 Ready to Book | /readiness | readiness | ReadyToBookGate | booking projection |
| 5.1 mic denied | local capability state in Speaking | speaking | SystemFailureBanner, alternatives | capability/unavailable |
| 5.2 audio failed | attempt failure state | listening | SystemFailureBanner, EvidenceLabel | not-counted result |
| 5.3 offline Writing | active attempt state | writing/local-work | AutosaveStatus, PendingBanner | local outbox/checkpoint |
| 5.4 mock interrupted | active mock recovery | mock | InterruptionRecovery | finalize/resume conflict |
| 5.5 return after six weeks | /coach and /readiness | coach/readiness | StaleNotice, Recommendation | current plan/readiness |
| 5.6 data/deletion | /settings/data | goal-settings/data | Export, typed Confirm | export/deletion jobs |

The table intentionally maps all 26 current numbered frames despite the narrative “24” count. None becomes a backend service.

### 9.2 Flows A–G

| Flow | Route/module path | Required invariant/API consequence |
|---|---|---|
| A First session | arrival → session/attempt → result | no account wall; written-only remains valid when Oral unknown; no index |
| B Daily loop | coach → session → attempt/result/repair | plan reason preserved; override changes conditions/priority, not truth |
| C Repair/retention | train/review or session | one weakness obligation; fresh/delayed evidence only upgrades |
| D Mock | train/mocks → focused MockShell → result | preflight; validity before score; exactly two priorities |
| E Readiness inspection | readiness → component/audit | independent gates; absent evidence; text/table equivalent |
| F Interruption/failure | nearest capability/feature boundary | owner named, record protected, alternative offered, local scope only |
| G Absence/staleness/data | coach/readiness/settings-data | stale not deleted/scored down; export parity; deletion irreversible |

### 9.3 Component-to-owner rule

RecommendationCard maps Coaching projection, AttemptShell maps Session/Attempt, EvidenceLabel/ResultCard map Evidence, WeaknessCard/DueReview map Mistake & Review, Readiness components map Measurement, content/input regions map pinned Content manifest, and pending productive evaluation maps job + accepted Evidence projection. Components never join owner tables or reproduce policies.

## 10. Error boundaries and degradation

### 10.1 Boundary plan

| Boundary | Contains | On failure | Work/truth handling |
|---|---|---|---|
| Document/root | HTML, theme, App bootstrap | static fatal page with reload/export/support reference | No mutation; server truth untouched |
| Destination AppShell | coach/readiness/train/progress | destination-specific retry + other nav | Other destinations remain usable |
| Feature panel | readiness audit/history/card | replace exact panel with SystemFailureBanner | Parent route and unaffected projection remain |
| Session/AttemptShell | active flow controller | restore local checkpoint; query current session/receipt | Never guess submission/validity |
| MockShell | measured block controller | preserve responses/conditions; query server; exact resume/partial/interrupted options | Claim follows recorded conditions |
| Skill input/capability | audio/mic/editor/matching | extension-specific alternative or unavailable | System failure not negative; other skills available |
| Overlay/dialog | sheet/dialog | close/reopen; trigger focus restored | No state loss |

A React render exception is a technical fault, not evidence. Boundaries never locally mark an attempt not-counted; they recover state and ask the server owner to interpret recorded facts.

### 10.2 Recovery sequence

~~~mermaid
sequenceDiagram
  participant L as Learner
  participant UI as Local feature boundary
  participant DB as IndexedDB local-work
  participant API as /api/v1 owner contract
  participant O as Authoritative owner

  L->>UI: response / submit
  UI->>DB: checkpoint sequence + hash
  UI->>API: command(operation_id, expected_version)
  alt completed
    API->>O: accept transaction
    API-->>UI: receipt + invalidation keys
    UI->>API: refetch authoritative projection
  else timeout / crash
    UI-->>L: work preserved; outcome unknown
    UI->>API: query operation receipt
    alt receipt exists
      API-->>UI: same committed result
    else no receipt
      UI->>API: retry same identity and hash
    end
  else conflict
    API-->>UI: current + submitted + safe actions
    UI-->>L: preserve both; explicit resolution
  end
~~~

### 10.3 Twelve shaped recovery situations

Network loss in Writing, audio load failure, mic denied, silent/wrong input device, paused/backgrounded mock, slow evaluation, evaluator outage, defective item, exhausted fresh P4 content, unsupported browser capability, six-week return, and blueprint change each map to a named state/action. They use the system family unless a true learner answer/pass-critical risk is present. Defective content is quarantined and affected evidence recomputed without penalty. Slow/outage evaluation becomes Pending. No capability failure produces an ability inference.

## 11. Security, privacy, rights, and accessibility

### 11.1 XSS, content, and secrets

- Learner text and ordinary strings render through framework escaping. dangerouslySetInnerHTML is prohibited for learner/provider/content data.
- Approved rich task content is a closed versioned AST: paragraphs, headings, lists, emphasis, quoted span, table with headers, safe audio reference, and explicitly reviewed task structures. Unknown node/attribute/URL schemes fail the exact content closed.
- Publication validates the AST; rendering maps nodes to owned components and validates again. No event attributes, script/style/iframe/object/embed, arbitrary SVG, remote font, CSS, data URL, or untrusted target=_blank.
- CSP and Trusted Types are Stage 23 release controls. The theme bootstrap is fixed reviewed first-party code under nonce/hash policy; no unsafe inline exception is an architecture dependency.
- server-only boundaries contain database/provider/R2/signing/auth secrets. Client bundles contain only public contract/version/asset identifiers. Secret scan and bundle inspection are release gates.
- API errors, telemetry and error boundaries exclude raw response text, audio, restricted content, guest capabilities, tokens, full identifiers, stack/SQL/provider payload, and pass prediction.

### 11.2 Privacy and rights

- Browser storage is purpose-specific and visible through data controls; it is not an analytics lake. Local records expire/purge with terminal attempts, attachment, deletion and policy.
- Raw audio is explicit, ephemeral, not replay history, and deleted after evaluation with the seven-day unresolved maximum.
- Serving manifests pin content/rights versions. Restricted bytes use authorized URLs and rights-aware caching. A route/cache cannot turn private content public.
- Corpus is never called by the browser and receives no learner profile.
- No third-party font/CDN/icon/analytics request is required in a core flow. Stage 23 performs jurisdiction-specific privacy/legal/trademark review; this document does not claim compliance.

### 11.3 Accessibility built into primitives

Shared primitives own:

- semantic HTML, labelled controls, landmarks/headings, error summary, required/invalid descriptions;
- 44×44 targets with 8 px spacing; 320 px reflow and 200% zoom;
- focus order conditions → task → question → options → action;
- focus to first newly introduced element on step change; overlay trap/inert/Escape/restore;
- 2 px focus ring at 2 px offset; no outline suppression;
- visible word + semantic icon/shape + color for status;
- DOM sentence and real table alternative for every chart/scale;
- select-then-place keyboard alternatives with identical evidence to drag;
- polite status regions; assertive only for final-five and recording failure; no timer-tick announcements;
- hideable timers and practice extensions without changing recorded condition facts;
- reduced motion: no translate/scale, opacity ≤100 ms, solid Recording indicator, no result/mistake/milestone celebration;
- lang=de for task content and explanation-language boundaries;
- equivalent path vs narrower-claim disclosure from API semantics.

Accessibility changes actual attempt conditions where relevant and are recorded by the owner; the UI cannot relabel them.

## 12. Performance, reliability, operations, and cost

### 12.1 Performance and reliability posture

- Server components keep static shell/content-heavy projections out of the client bundle. Client islands are limited to active interaction/capability/recovery.
- Route segments and feature panels stream with meaningful static skeletons; no indefinite spinner. L0 acknowledgement is local, L1 deterministic result is server, L2 productive evaluation moves to explicit Pending around the shaped threshold.
- Focused shells preload only the pinned manifest/assets needed for the next safe block; they do not prefetch premium evaluation or raw Corpus.
- Writing checkpoint and attempt command receipts are observed separately. Web vitals cannot substitute for checkpoint-loss, resume, conflict and semantic-state measures.
- Static tokens/fonts/icons/logo are build-time and content-hashed. Personalized projections and restricted content do not use public ISR/CDN caches.

### 12.2 Measures and release evidence

Measure with minimal first-party, structured, no-content events:

- route/segment rendering and client bundle by route;
- L0/L1/L2 transition time and time spent pending;
- checkpoint age/loss bound, resume success, conflict/branch and unknown-receipt rate;
- job polling volume/304 rate and stale projection age;
- boundary faults by boundary/capability and successful recovery;
- accessibility automated/manual results, focus regressions, live-region counts;
- light/dark/forced-color contrast and visual regression;
- token/raw-hex/icon/asset/font contract drift;
- learner-safe action completion, never keystroke/raw response/audio/pass prediction.

Release tests: exhaustive view-model compile fixtures; schema/unknown-major; route/deep-link/resume; five extensions against the shared contract; duplicate/reorder/offline/crash; visual regression at each breakpoint/theme/zoom; keyboard/screen reader/contrast/forced color/reduced motion; CSP/XSS fixtures; restricted-content and deletion purge; logo/icon size/digest/license; no secrets/client domain calculation.

### 12.3 Cost and sustainability

Launch uses one web client, one shared ui package, accepted server/database/worker/object storage, static same-origin assets, and no required client analytics/chat/theme/icon/font service. Routine route views use deterministic cached server projections and no model call.

| Cost pressure | Default | Cheaper fallback | Upgrade trigger / exit |
|---|---|---|---|
| Client JS/maintenance | server-first + narrow islands | simplify/delete client feature | route budget or field defect shows benefit |
| State/query library | none general at launch | feature controller + route refresh | repeated orchestration across ≥3 features or measured cache defects |
| UI/headless dependency | native semantics/owned wrapper | remove adapter | only admitted after a11y/maintenance/security evidence |
| Job updates | ETag polling | slower backoff/manual refresh | observed load/completion delay breaches Stage 24 SLO; add lossy push |
| Fonts/icons/assets | self-hosted subset | system font/one-color mark under outage | license/support/weight/performance failure; replace assets without semantic change |
| Error telemetry | minimal first-party/redacted | server logs + correlation reference | incident diagnosis cannot meet accepted SLO |
| Second client/native | none | responsive web | sustained capability/offline demand justifies API consumer |

Cost cannot remove Writing/Speaking evidence, recovery, accessibility, truth, or independent gates.

## 13. Alternatives, risks, and review triggers

| Decision area | Simpler/do-nothing | Other credible option | Chosen / exit |
|---|---|---|---|
| Routing | one route | frame-per-route | semantic App Router routes; add route only for deep link/resume/ownership |
| Rendering | all server | all client SPA | server-first hybrid; alter boundary after bundle/latency/capability evidence |
| State | component state only | global store + query cache | feature controllers + local-work; add one tool only on measured repetition |
| Styling | copy design inline styles | Tailwind/full UI kit | semantic properties + CSS Modules |
| Components | five forks | generic workflow engine | shared shell + typed input extension |
| Theme | light only | runtime theme service | two static modes + device override |
| Assets | remote CDN/fonts | inline arbitrary SVG | self-hosted, hashed, manifest-controlled |
| Errors | root fallback | boundary every leaf | semantic nested boundaries |
| Rich content | raw HTML | plain text only | closed AST/component map |
| Updates | optimistic everything | pessimistic everything | local-only optimism; server truth pessimistic |

Risks and validation:

1. Server-first/client-island composition could introduce hydration/focus defects. Validate no-mismatch theme, streamed focus, assistive technology and route transitions.
2. No general query library could cause duplicated controllers. Track repeated invalidation/polling code; admit one behind frontend-data only after evidence.
3. IndexedDB can fail in private/low-storage modes. Capability preflight and explicit local-only/no-durable warning must preserve access and narrow only recovery claims.
4. The current SVG export files are absent. Stage 25 release requires design-source export, digest, size, dark/light, trademark/license and visual comparison evidence.
5. Closed content AST may initially omit a valid task structure. Stage 16 must add a reviewed node/version rather than bypass sanitation.
6. Browser theme boot/CSP could flash or block. Stage 23/25 tests exact Next.js production build headers, nonce propagation and no-script fallback.
7. Shared components may become over-general. Contract telemetry/code review watches unsafe casts, extension branches and accessibility divergence.
8. Design narrative/frame count drift can confuse acceptance. Tests use stable semantic frame IDs and the current 26-row mapping, not a numeric claim.

Review triggers never authorize client-side truth or probability. A reversal creates a superseding ADR.

## 14. ADRs

- ADR-0020 — Accepted: server-first App Router composition, frontend state ownership, cache/invalidation, optimism and error isolation.
- ADR-0021 — Accepted: single semantic design system and shared five-skill extension contract.

They apply ADR-0001 through ADR-0019 and supersede none.

## 15. Relationship to earlier and later stages

### 15.1 Decisions downstream must preserve

Stages 14–22 and 25–28 must preserve:

- exactly four destination roots in the same order: Coach, Readiness, Train, Progress; utilities are secondary;
- Coach one dominant action; Train secondary; focused attempt/mock shells suppress navigation;
- server-authoritative domain projections and one frontend data facade; no client scoring/validity/readiness/coaching rules;
- no general global state/query duplicate without a measured review trigger;
- local IndexedDB only for bounded draft/checkpoint/outbox, not learner truth or raw history;
- no optimistic evidence, validity, evaluation, Readiness, mock, booking, rights, or deletion;
- one shared Attempt/Result/Repair/Evidence foundation with five typed input extensions;
- exact token/type/icon/Threshold B semantics and build-time, same-origin asset delivery;
- exhaustive five validity and six Readiness states, affected scope, absence, Pending and read-only evidence labels;
- nested local recovery and zero learner-negative effect from system faults;
- closed content AST, server-only secrets, no unsanitized HTML/SVG, no Corpus browser/runtime call;
- accessibility semantics and equivalent paths in primitives.

### 15.2 Dependencies introduced or removed

Introduced logical dependencies: frontend-data facade, local-work repository, versioned ui/design contract, SkillInputRegion contract, brand/icon/font manifests, and semantic boundary fixtures. These are modules/contracts in the accepted monorepo, not new services.

Removed/rejected dependencies: separate SPA router/BFF, global client domain store, second general query cache, per-skill shell libraries, full UI kit/theme service, external font/icon/CDN, client analytics SDK requirement, live Corpus, and authoritative push channel.

### 15.3 Intentionally deferred implementation choices

| Choice | Future owner | Fixed boundary |
|---|---|---|
| Exact supported browser/device/AT matrix and polyfills | Stage 14/25 | capability-local degradation, semantic web, no global learner block |
| Exact headless dialog/focus helper, if any | Stage 14/25 + dependency governance | owned primitive API, no product semantics |
| Generated-client/validation tool | Stage 14/25 | Stage 12 OpenAPI/JSON Schema and exhaustive unions |
| CSP/Trusted Types/header mechanism | Stage 23/25 | no unsanitized HTML, no unsafe-inline dependency, fixed theme bootstrap |
| Identity/session/guest token mechanism | Stage 20/23 | same frontend scope/attachment/recovery semantics |
| Asset export production and trademark/legal clearance | Stage 23/25 | fixed B1 geometry, names, sizes, manifest/digests |
| Precise route/bundle/performance SLO thresholds | Stage 24/25 | measures and local degradation defined here |
| Optional SSE invalidation | Stage 24/26 after evidence | polling resource remains authority |
| Local draft encryption/key mechanism | Stage 20/23 | purpose limitation, purge, no secrets/evidence truth |
| Copy localization tooling | Stage 21/25 | structured state and exact semantic labels outrank prose |

These are mechanism choices; no feature implementer may redefine owned architecture while waiting.

No owner question remains.

## 16. Decisions made

ARCH-S13-D01 through ARCH-S13-D11 are Accepted. Mutable visual/accessibility calibration values are versioned with provenance, effective date, validation, monitor and rollback. Stable product semantics are not configuration.

## 17. Definition-of-done check

- [x] All required current GitHub sources and SHAs recorded; prerequisite continuity accepted.
- [x] Authority conflicts/discrepancies named without changing shaping or design.
- [x] Responsive composition, routes, four destinations, focused shells, modules and dependencies decided.
- [x] Server/client/local/form ownership, cache, invalidation, drafts, conflicts and optimistic limits decided.
- [x] Shared five-skill foundation and extension contract prevent shell/result/repair/evidence forks.
- [x] Exact 25 tokens, two modes, type roles, 18 icons, Threshold B manifest and delivery decided.
- [x] Five validity, six Readiness, failure, empty, Pending, progressive disclosure and read-only labels are exhaustive.
- [x] All current design frames and flows map to modules/components/API without route/service multiplication.
- [x] Frontend dependency and recovery diagrams plus exact ownership/mapping tables included.
- [x] Security/privacy/rights, accessibility, failure, performance, operations, cost, exits and tests addressed.
- [x] ADR-0020 and ADR-0021 are Accepted and indexed.
- [x] Downstream invariants, dependencies, risks, validation and deferrals are explicit.

Stage 13 is complete with no owner blocker and no modification to product/design/production code.
