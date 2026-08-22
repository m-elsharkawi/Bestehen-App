# ADR-0005 — App semantic authority across processors

> **Status:** Accepted
>
> **Owner:** Stage 02
>
> **Date:** 2026-08-22
>
> **Decision IDs:** `ARCH-S02-D03`, `ARCH-S02-D04`, `ARCH-S02-D08`, `ARCH-S02-D09`, `ARCH-S02-D10`
>
> **Supersedes / superseded by:** None

## Context

Bestehen needs optional authentication, hosting/data services, notification delivery and bounded Writing/Speaking/media processors. Those services may process sensitive learner text/audio or identity claims, change price/terms/availability, and return uncertain results. Letting provider schemas or prose directly own learner state would create semantic lock-in and allow technical/provider failure to become learner failure.

Current traceability: `app/28-bestehen-app-product-specification.md` §§3.5, 15–16, 18–19; `app/25-business-model-and-product-boundaries.md` §§5–7; `app/26-platform-accessibility-nonfunctional.md` §§3.3–3.16; `Design/DESIGN-HANDOFF.md` §§3.7, 6; Stage 01 ADR-0001/ADR-0003; Stage 02 §§3–12. Source commits/SHAs are recorded in Stage 02 §2.1.

## Decision

App retains learner-semantic authority across all external processor and infrastructure boundaries. Each integration is purpose-specific, minimum-data, least-privilege and replaceable. Provider output is a versioned candidate result that App validates and records exactly once before deriving evidence or Readiness. Unknown consequential versions, mismatch, timeout or failure produces a scoped Pending/incompatible/unavailable state, never a guessed result.

Raw audio is sent only for the chosen speech job, excluded from general logs/analytics, and kept under the shaped ephemeral retention ceiling. Identity proves authentication only; App owns anonymous use, learner mapping, authorization, sync/export/delete. Notification transport delivers an App-selected minimum-sensitive message only; in-App truth and preferences remain authoritative.

Logical trust zones are learner device, App learner runtime/data, App operator control plane, Corpus publication, third-party processors/infrastructure, and untrusted raw sources. They do not mandate microservices; Stage 03/23 select physical controls proportionate to risk.

## Alternatives

1. **Direct vendor SDK/schema in every feature.** Fastest first implementation, but duplicates privacy/retry logic and makes provider data the de facto domain model.
2. **No third parties/account/notifications/productive processing.** Cheapest and private, but permanently removes sync/recovery or pass-critical productive evidence; notifications themselves may still be omitted.
3. **Separate service for every trust zone immediately.** Strong isolation, but disproportionate solo operations without measured failure/security need.

## Consequences

Stages 12 and 19 must define provider-neutral structured jobs/results, idempotency, evaluation releases, benchmark fixtures, deletion and circuit/fallback behavior. Stage 20 keeps an App-owned learner identity. Stage 22 treats transport as optional. Stage 23 threat-models payloads, credentials, processor terms, retention and deletion. The App may initially deploy logical zones together where controls remain testable.

Provider failure blocks only dependent conclusions: objective work and unrelated skills continue; identity outage preserves anonymous/local use; notification outage has no evidence effect. Exits use provider-independent domain IDs, portable input/result fixtures, exportable account links/data/assets and documented deletion/revocation. A cheaper fallback is Pending, deterministic/cached feedback, a fixed partner, no notification or a later fresh sample.

## Validation and review trigger

Stages 12/19/20/22/23/25 must test schema/version rejection, duplicate/late results, minimum payload, raw-log absence, retention/deletion, identity linking, notification data classification and per-capability outage behavior. Substitute a provider when benchmark quality, privacy/training terms, unit cost, latency, deletion or availability fails the owning stage's gate. Physically split a zone only when security/isolation, independent scaling, availability or deploy-cadence evidence exceeds the operational cost.

## Traceability

- Product/design sources: Stage 02 §2.1 and paths above
- Owning stage output: `Architecture/02-system-context-and-product-boundaries.md`
- Checklist items: actors/systems, trust boundaries, dependency/failure inventory, data/API/state ownership, security/privacy/accessibility and cost/provider exit
- Related ADRs: ADR-0001, ADR-0002, ADR-0003, ADR-0004
