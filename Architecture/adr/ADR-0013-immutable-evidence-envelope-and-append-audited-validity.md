# ADR-0013 — Immutable evidence envelope and append-audited validity

> **Status:** Accepted
>
> **Owner:** Stage 06
>
> **Date:** 2026-08-23
>
> **Decision IDs:** ARCH-S06-D01–ARCH-S06-D10
> **Supersedes / superseded by:** None; refines ADR-0001, ADR-0002, ADR-0007, ADR-0010, ADR-0011, and ADR-0012

## Context

Bestehen must distinguish what the learner did from what an evaluator proposed, what Evidence accepted, and what current projections infer. Immediate retries, delayed transfer, retention checks, exposed content, and mock occasions have different evidential meaning. Content, media, access, browser, network, partner, or evaluator faults must never become learner failure. Corrections must preserve history while changing only the affected learner scope.

Stages 04 and 05 establish one Evidence & Capability owner, append-oriented PostgreSQL truth, explicit corrections, immutable content lineage, idempotent facts/jobs, and rebuildable source-cut projections. Stage 06 must make those principles concrete without adding a streaming platform or provider-owned truth.

Current source commits/blob SHAs and full rationale are recorded in Architecture/06-evidence-ledger-validity-versioning-and-audit.md §2.

## Decision

Use one shared versioned evidence envelope with immutable attempt, observation, and validity-assertion identities and explicit session, repair episode, independent occasion, mock occasion, content family, exact revision, and form references. Five skills share this kernel and add typed modality conditions.

Session & Attempt owns occurrence facts. Productive Evaluation emits candidates. Evidence & Capability alone accepts direct observations and validity transitions. Capability, Mistake, Review, Progression, Readiness, mocks, booking, Coaching, and analytics are versioned projections; they never write facts backward.

Preserve exactly valid, partially_valid, pending, interrupted, and not_counted. Each current state is an append-only assertion with affected/unaffected scope, reason, authoritative owner command, actor, evidence, times, and policy/contract lineage. Correctness is orthogonal. Non-learner faults have zero negative learner effect. Pending blocks only dependent conclusions.

Record assistance offered/used, timing, playback, transcript/reference exposure, content-family freshness, independence class, target conditions, accessibility/equivalence, direct modality/lane, evaluator-supported dimensions/confidence, and full blueprint/taxonomy/content/form/rubric/evaluator/prompt/calculation/calibration/contract lineage.

Use App-owned idempotency for attempts, candidates, validity transitions, corrections, and recomputations. Retry/reconnect returns the committed semantic effect. Corrections, invalidations, quarantine, rights takedown, taxonomy/blueprint changes, and evaluator defects append typed impact assertions, select exact indexed scope, and publish only validated shadow projection generations. Historical and unaffected evidence remains.

Learner-facing labels and five validity/six Readiness states are server-derived exhaustive projections. Missing estimate is absence, never zero. No pass-probability field, model, event, copy template, generic carrier, or hidden calculation exists before a separately authorized and independently calibrated product gate.

Use ordinary PostgreSQL transactions and pg-boss targeted jobs. Do not add a streaming platform, warehouse, per-observation AI call, service-per-context, or global rebuild by default.

## Alternatives

1. **One mutable result/status record.** Simpler initially, but conflates occurrence, evaluation, validity, and current interpretation; corrections erase history.
2. **Derive independence from timestamps/sessions and deduplicate later.** Fewer fields, but same-chain retries and one mock inflate confidence while exposed content can masquerade as fresh.
3. **Let each skill/provider/client define its own envelope and labels.** Flexible locally, but directness, Pending, playback, accessibility, and failure semantics drift.
4. **Full event sourcing plus streaming platform/global replay.** Strong generic replay mechanics, but excessive personal-project operations and blast radius when exact scoped relational lineage is sufficient.
5. **Chosen — immutable relational envelope, append validity, targeted projections.** Preserves truth, audit, local failure, provider exit, and low operations.

## Consequences

- A new click, request, tab, revision, session, or elapsed interval does not by itself create independent evidence.
- Immediate retry can prove responsiveness, not delayed transfer or retention. One mock is one correlated confidence occasion.
- A valid wrong result remains learner evidence; a broken apparent wrong result is neutral not_counted. Partial validity is a scope partition, not a discounted whole.
- Provider/candidate, content rights, target mapping, and learner performance stay separate. Provider substitution and rights takedown do not silently rewrite learner history.
- Unknown consequential versions/states/transitions fail closed locally. The learner can continue unaffected work.
- Targeted correction has more modeling/indexing work than destructive edits, but can prove 100% affected and zero unaffected changes.
- Append audit does not override learner deletion; Stage 05 deletion removes personal history across live/provider/backup scopes.
- Future probability would require a new product authorization, ADR, contract major, calibration evidence, and learner-copy review rather than exposing a dormant field.

## Validation and review trigger

Stages 09/11/19/25 must seed content, media, evaluator, rights, taxonomy, and blueprint incidents and prove complete affected selection, zero unaffected mutation, reproducible projection checksums, and preserved historical snapshots. Stages 12/21/25 must prove retry/reconnect/provider redelivery creates one semantic effect. Stage 25 must exhaustively test legal/illegal validity transitions, direct modality, mock/episode/family independence, missing-as-absence, independent Written/Oral gates, and repository/schema/API/event/template/copy prohibition of probability.

Review only when a superseding product decision changes an invariant, exact scoped rebuilds miss an approved SLO for seven consecutive days after ordinary optimization, or a required evidence relationship cannot be represented without loss. A replacement must preserve identities, conditions, directness, five validity states, history, privacy deletion, idempotency, targeted correction, unaffected scope, and the probability prohibition.

## Traceability

- Architecture/06-evidence-ledger-validity-versioning-and-audit.md
- app/28-bestehen-app-product-specification.md §§2.1, 5–11, 15–20
- app/03, app/04, app/05, app/07, app/08, app/14–17, app/21, app/24, app/26, app/27
- Design/DESIGN-HANDOFF.md §3; Design/Bestehen-01-Design-System.dc.html §§2.5, 3.2, 3.3, 3.6
- Architecture/04-domain-model-and-bounded-contexts.md; Architecture/05-data-ownership-persistence-and-schema-evolution.md
- Related ADRs: ADR-0001, ADR-0002, ADR-0007, ADR-0010, ADR-0011, ADR-0012
