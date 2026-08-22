# ADR-0002 — Modular low-ops deterministic-first posture

> **Status:** Accepted  
> **Owner:** Stage 01  
> **Date:** 2026-08-22  
> **Decision IDs:** `ARCH-S01-D02`, `ARCH-S01-D09`, `ARCH-S01-D10`  
> **Supersedes / superseded by:** None

## Context

Bestehen begins as a private, personal, responsive-web project maintained by one person, yet its complete promise spans five skills, recovery, Readiness, mocks and productive evaluation. Five separate products would drift; microservices and always-on premium AI would impose cost before evidence of need.

Traceability: `app/28-bestehen-app-product-specification.md` §§8, 18, 20; `app/25-business-model-and-product-boundaries.md` §§3, 5, 13; `app/26-platform-accessibility-nonfunctional.md` §§3, 7–8; design system §§3.1 and 4; Stage 01 §§3, 4 and 9.

## Decision

Use one shared logical session/attempt/result/repair/evidence/recovery foundation with explicit modality extensions. Keep the initial deployable architecture modular and low-ops. Prefer deterministic/versioned scoring, planning, review and Readiness; pre-generated/reviewed/cached content/audio; structured fallback copy; and one bounded productive evaluation with at most one justified escalation. Provider outage or price pressure yields less richness, Pending/lower confidence or a smaller valid activity, never false certainty.

This ADR does not choose a framework, database, provider or physical topology; Stage 03 and later stages must research and select them within this boundary.

## Alternatives

1. **Five vertical applications.** Speeds isolated prototypes but duplicates state, accessibility, failure and evidence semantics.
2. **Microservice/domain service per concern plus event platform.** Offers independent scaling but creates solo deployment, consistency and on-call burden without measured need.
3. **AI-first coach for every interaction.** Appears flexible but creates nondeterminism, latency, variable cost and provider lock-in.
4. **No productive AI.** Cheapest, but cannot responsibly satisfy bounded Writing/Speaking evaluation.

## Consequences

Module boundaries and contracts remain explicit even in one deployable system. Technology/provider adapters need portable structured input/output, benchmark fixtures, deletion/export and fallback. A later split is allowed only for sustained independent scaling, a security boundary, material failure isolation or deployment benefit that exceeds operational cost.

## Validation and review trigger

Stage 24 measures idle/variable cost, latency, failure and maintenance; Stage 25 verifies shared-contract parity across five skills and zero routine model calls for objective/scoring/planning paths. Review when measured module capacity, isolation, security or deploy cadence crosses the Stage 01 §9.1 trigger.

