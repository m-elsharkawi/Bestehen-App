# ADR-0010 — Bounded contexts and single state ownership

- **Status:** Accepted
- **Date:** 2026-08-23
- **Decision owner:** Stage 04 — Domain Model and Bounded Contexts
- **Supersedes:** None
- **Refines:** ADR-0001, ADR-0004, ADR-0005

## Context

Bestehen must preserve exact learner evidence, complete Mistake Memory, local progression, independent Written/Oral Readiness, App-approved content and bounded processor/Corpus inputs without microservice operations for a personal project. A shared mutable learner record makes ownership/correction/authorization ambiguous; microservice-per-domain adds distributed failure and cost before a measured need.

## Decision

Use the 11 logical bounded contexts defined in Architecture/04-domain-model-and-bounded-contexts.md inside the accepted modular monolith. Every consequential fact/state has exactly one command owner. Other contexts consume immutable facts or versioned, rebuildable projections through named ports; they do not share semantic writes.

Evidence observations are append-oriented logical facts. Corrections are explicit and auditable. Capability, Mistake Memory, Progression, Readiness, and Coaching remain separate deterministic policy owners. UI, Corpus, and processor schemas cross anti-corruption layers and never become App authority. Operations invokes owner commands rather than patching truth.

## Alternatives

1. **Undifferentiated shared learner record:** fewer initial modules, but feature-local scoring, dual ownership, destructive correction, and authorization drift.
2. **Microservice/database per context:** stronger physical isolation, but distributed consistency, network failure, deployment, and solo-operations cost without evidence.
3. **Chosen — explicit in-process contexts with one owner:** preserves seams, transactions, low operations, and a measured split path.

## Consequences

- Stage 05 assigns every persisted state to one context and retains correction/projection lineage.
- Dependencies are acyclic and owner-routed; derived contexts never write evidence backward.
- Unknown/incompatible external states quarantine only dependent input; missing/Pending remains explicit.
- Corpus outage uses last compatible approved data; provider failure uses deterministic/cached/fixed work or Pending; projection failure rebuilds from facts.
- Security and data-rights authorization follow App learner scope and owners, including anonymous first use.
- Physical split requires sustained independent scale, isolation/security, ownership/release-cadence, or SLO evidence exceeding operational cost.

## Validation and review trigger

Validate with dependency/ownership tests, exhaustive state fixtures, correction/rebuild tests, owner authorization tests, and Corpus/provider/UI substitution contracts. Review when a legal use case requires a dependency cycle, a rebuild misses its SLO after ordinary optimization, or a measured Stage-04 split trigger fires. Supersede rather than erase history.

## Traceability

- ARCH-S04-D01, D02, D04–D08, D10
- Architecture/04-domain-model-and-bounded-contexts.md §§4–7, 9–14
- Final specification §§5–7, 10–16, 19–20; app/04, app/05, app/15–17, app/21–22
- Architecture 01 §§3–5; Architecture 02 §§3–8; ADR-0001, ADR-0004, ADR-0005
