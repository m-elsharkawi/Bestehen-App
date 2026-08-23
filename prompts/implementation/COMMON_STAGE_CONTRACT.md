# Common contract for every implementation worker

The orchestrator must prepend or provide this contract to every Planning and Execution subagent. A stage prompt may add stricter constraints but may not weaken these rules.

## Work autonomously

Do not ask the owner ordinary implementation, naming, layout, library, or architecture questions. Inspect the repository and authoritative files, select the best safe default, record the decision and alternatives in the stage artifact, and continue. Ask only when new authority is legally or operationally indispensable and no reversible path remains.

Do not claim that a manual action, paid account, DNS change, legal review, accessibility audit, backup restore, provider benchmark, or production cutover happened unless repository evidence proves it. Convert missing owner actions into precise guides and checklist gates.

## Start from GitHub reality

1. Fetch the remote and inspect the default branch, open pull requests, checks, releases, and the active implementation checklist.
2. Confirm the expected previous-stage merge commit. If work already exists, verify it and resume; do not duplicate it.
3. Create or reuse only the branch named by the orchestrator for this numbered stage.
4. Read this contract, the stage prompt, the final architecture, relevant architecture stages/ADRs, Design review notes, and the previous stage handoff before proposing changes.
5. Record exact source paths and commit IDs in the stage plan/handoff.

Do not overwrite unrelated user changes. Do not rewrite default-branch history. Do not merge your own pull request or start a later stage.

## Source authority and decisions

Architecture owns behavior, states, security, data, audit, export, deletion, accessibility, and operations. Design owns presentation and interaction where it does not contradict architecture. The active pack owns its deployment profile.

If sources conflict:

- apply the authority order in `prompts/implementation/README.md`;
- choose a provider-neutral, reversible implementation;
- record the conflict and resolution in the plan and handoff;
- add a regression test when the conflict could recur;
- do not ask the owner to arbitrate a resolved architectural question.

Use dated official provider documentation for provider setup and mutable product behavior. Link it in guides, record the date checked, and avoid copying volatile console screenshots as the sole instruction.

## Planning worker boundary

A Planning worker must not change production source code, infrastructure, live provider configuration, DNS, databases, or secrets. It may add or update only:

- its stage plan under `Implementation/<Profile>/<NN>-<slug>/plan.md`;
- the active checklist's Planning lines;
- small decision records or interface sketches explicitly required to make the plan executable;
- documentation inventory entries.

The plan must contain: objective; verified baseline; authoritative inputs; scope and non-scope; decisions; file-by-file work map; contracts and migrations; security/privacy/accessibility implications; test/evidence matrix; rollback/compatibility strategy; manual owner actions; risks; execution order; and a precise Definition of Done. It must make Execution possible without reopening product questions.

## Execution worker boundary

An Execution worker implements only the accepted plan for its numbered stage. If repository reality invalidates the plan, choose the smallest safe correction, document it, and continue when reversible. If it would materially expand scope or damage compatibility, stop the stage and report the exact evidence to the orchestrator.

Execution must:

- implement production code, migrations, infrastructure descriptors, tests, and guides in small reviewable commits;
- maintain backward/forward compatibility at deployment boundaries;
- use app-owned identifiers and provider adapters; never expose provider IDs as domain IDs;
- use exact state unions and reason codes, not ambiguous booleans;
- keep secrets out of code, fixtures, logs, telemetry, and artifacts;
- add deterministic local/fake paths for paid or unavailable providers;
- run the plan's relevant tests and record commands plus outcomes;
- update the checklist with links to durable evidence;
- write `Implementation/<Profile>/<NN>-<slug>/handoff.md` with delivered scope, commits, tests, migrations, operations, owner gates, known limitations, and next-stage inputs.

## Cross-cutting product invariants

- Readiness is evidence-backed and state-based. Never display a pass probability or unsupported certainty.
- Preserve the canonical evidence ledger, learning-state derivations, version pins, reason codes, audit trail, and release manifest.
- Keep current and historical validity separate; provider/model/content changes cannot silently rewrite history.
- Every retryable mutation/job is idempotent. Every asynchronous state has explicit pending, retry, failure, and recovery behavior.
- Auth0 Universal Login uses email OTP for this program; do not add or describe a password fallback.
- Authorization is enforced server-side. UI hiding is not authorization.
- Export and deletion follow architecture, not simplified Design copy. Deletion is revoke-first, idempotent, restore-suppressed, and honest about provider-pending or inaccessible backup residuals.
- Preserve both branches of divergent writing drafts and provide an accessible compare/select/merge path before submission.
- Mid-attempt session expiry preserves recoverable draft, elapsed time, and conditions; only the server determines final validity.
- Use provider-neutral user copy. Never expose raw model, queue, storage, or infrastructure jargon as the product contract.
- Self-host fonts, icons, and logos with license and digest provenance. Do not ship external Google Fonts imports from Design boards.
- Target WCAG 2.2 AA, keyboard-only use, 200% zoom, reduced motion, high contrast, screen-reader state announcements, and 320 CSS-pixel reflow.
- Build one responsive web app. No native mobile app and no PWA-installability scope.

## Verification and evidence

Claims require evidence appropriate to risk: unit/contract/integration/end-to-end tests; migration rehearsal; accessibility automation plus manual keyboard/screen-reader scripts; performance/cost measurements; backup restore or deletion drills; golden export fixtures; screenshots only as supplemental UI evidence.

Do not weaken tests to make checks pass. Do not use placeholder tests as completion evidence. A skipped provider test must have a deterministic fake contract test and an explicit live-validation owner gate.

## Checklist syntax

Use only these states in the active checklist:

- `[ ]` not started
- `[~]` in progress
- `[x]` independently verified
- `[!]` blocked by a named external gate

Every `[x]` line includes a relative evidence path, pull request or commit, and test/check identifier where applicable. Planning completion never implies Execution completion.
