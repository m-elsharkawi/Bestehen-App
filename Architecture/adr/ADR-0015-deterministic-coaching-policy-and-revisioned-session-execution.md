# ADR-0015: Deterministic coaching policy and revisioned session execution

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Architecture Stage 08 — Coaching Engine and Session State Machines
- **Decision IDs:** `ARCH-S08-D01`–`ARCH-S08-D06`
- **Supersedes:** None
- **Superseded by:** None

## Context

Bestehen must recommend one highest-value daily action while protecting evidence validity, independent Written/Oral gates, uncertainty, due repair, local progression, learner choice, accessibility, recovery, privacy, and personal-project cost. Productive evaluation may finish after the learner continues. Learner overrides must change the plan without becoming ability evidence. A mutable plan, weighted opaque score, or free-form planner would make precedence, causality, and late-result behavior hard to audit.

Stages 04, 06, and 07 already establish single state ownership, an immutable evidence envelope, deterministic rebuildable learner projections, exhaustive availability states, and versioned source cuts. Stage 08 must orchestrate them without creating a second source of truth.

## Decision

1. Routine planning is a deterministic versioned policy over current or explicitly safe last-good projections and App-cached rights-approved content. Validity/fairness is a hard eligibility gate. Eligible candidates compare lexicographically: direct evidence; independent Written/Oral pass risk; uncertainty resolution; due repair/retention; progression/coverage; preference. Small ordinal dimensions and stable identifiers break ties. Cost decides only evidence/learning-equivalent choices.
2. `Coach me` and `Just practice X` are distinct planning-request origins. Learner time/context/skill/condition/help/postpone/stop/mock overrides create a new immutable plan revision. Override selection is never learner evidence, recurrence, regression, Readiness, or compliance. Material consequences are explained once with structured reasons.
3. `PlanRevision`, `SessionInstance`, `ActivityOccurrence`, `CoachingEpisode`, and `AttemptOccurrence` are separate identities. Published plan revisions are immutable and source-cut/version/checksum bound. Evidence is preserved at meaningful activity/attempt boundaries; session status itself has no ability meaning.
4. Observe → Attempt → Diagnose → Repair → Retry → Remember remains six semantic states. UI may legally compress or defer states, but Attempt is required for new ability evidence, meaningful shortfalls receive broad/pending Diagnose, Remember preserves every valid fact/uncertainty, retry uses fresh equivalent content, and measured blocks defer coaching.
5. Productive evaluation is attempt-scoped and asynchronous. A pending result blocks only declared dependent dimensions. Late accepted results retain the original attempt conditions/occasion, update affected projections idempotently, and may create a new recommendation only at a safe boundary; they never rewind unrelated active work or mutate the accepted plan/attempt.
6. Plan/replan/explanation/failure copy comes from a versioned structured reason registry and reviewed fact → meaning → next action templates. A model never selects the routine plan, receives full learner history to phrase it, or invents truth. Generated nuanced productive prose is accepted only after structured truth and falls back to reviewed copy on conflict, uncertainty, outage, privacy, or cost.

## Consequences

### Positive

- Every recommendation is replayable, explainable, versioned, and compatible with evidence audit/correction.
- A lower-value preference or cheap activity cannot outvote validity, direct evidence, an independent gate, uncertainty, or due learning.
- Learner autonomy remains real without rewarding compliance or corrupting learner state.
- Partial work, late evaluations, reconnection, correction, and re-planning converge without rewriting history.
- The five skills share one session/attempt/loop foundation while modality extensions keep their exact conditions.
- Routine planning and copy have negligible marginal AI cost; App stays independent from runtime Corpus and model providers.

### Negative / trade-offs

- Policy/reason/template/source-cut versioning and deterministic replay require disciplined contracts and golden/property tests.
- Lexicographic decisions can be less superficially “personal” than a conversational planner and require careful reason templates.
- Immutable revisions create additional relational history and compaction/retention work.
- Late feedback may cause a visible next-plan change rather than immediate in-place adaptation; the UI must explain material changes.

## Alternatives considered

1. **Fixed rotation or learner-only catalog.** Simpler, but it cannot protect independent pass gates, due windows, uncertainty, or decision-relevant direct evidence. Retained only as a narrow fallback compatible pool, not the coach.
2. **Opaque weighted score.** Flexible, but many low-value bonuses can outvote a higher-order invariant and pseudo-precision is hard to explain/calibrate. Rejected.
3. **Per-session LLM planner/free-form coach.** Could sound adaptive, but costs more, needs excessive context, is nondeterministic, and can invent or soften truth. Rejected for routine planning/copy.
4. **Mutable current-plan/session row.** Operationally simple but erases causal source cuts and makes override/late-result races unsafe. Rejected.
5. **Full event-sourcing/workflow/streaming platform.** Strong generic history/orchestration, but disproportionate to a personal modular monolith. Rejected; append facts, immutable plan revisions, PostgreSQL, and existing durable jobs are sufficient.
6. **Block the session until productive evaluation completes.** Simplifies state but creates a global failure domain and wastes available coaching. Rejected; local Pending is required.

## Compatibility, fallback, and exit

- Additive fields are minor-compatible only with exhaustive safe consumer fallback. Changed precedence, state/reason semantics, identity/key shape, or evidence interpretation requires a major version, dual-read/shadow validation, and rollback.
- The permanent fallback is the previous compatible deterministic policy, safe last-good projection, broader approved content, Just practice from the compatible pool, and reviewed copy. A failure never creates negative learner evidence.
- State is portable through standard PostgreSQL logical export/import and ordinary relational jobs. Content/media and evaluator providers remain replaceable through existing versioned adapters; no coaching truth lives in a provider, Corpus runtime, or client cache.

## Validation

Release requires golden and property tests for precedence, independent gates, missing/Pending, overrides, boundaries, canonical-loop compression, no-fresh-retry, partial/resume, and faults; concurrency/idempotency tests for duplicate/out-of-order/late/delete/correction cases; deterministic checksums; accessibility equivalence/local fallback; privacy/rights data-flow tests; and shadow replay with rollback.

## Review triggers

Review after normal query/index/cache/job optimization if plan assembly p95 exceeds the versioned one-second objective or pending/source-cut delay misses decision windows for seven consecutive days; if compatible inventory materially suppresses a pass-critical direct lane; if access-context exclusion is unexplained; or if controlled evidence shows another bounded ranking mechanism materially improves retained transfer/readiness calibration without truth, fairness, privacy, reliability, or cost regression. Hard eligibility and lexicographic product precedence cannot be bypassed by such a review.

## Traceability

- Stage output: `Architecture/08-coaching-engine-and-session-state-machines.md`
- Product authority: `app/28-bestehen-app-product-specification.md` §§3.3, 6, 12, 16, 18–19; `app/06-daily-coaching-engine.md`; `app/07-core-learning-loop.md`; `app/22-user-controls-vs-coach-autonomy.md`
- Prior architecture: Stages 04, 06, and 07
- Downstream: Stages 11–13, 15–22, 24, 25, 27, 28
