# ADR-0019: Versioned HTTP contracts and durable idempotent asynchronous work

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 12 — API Contracts, Jobs, Events, and Idempotency
- **Decisions:** `ARCH-S12-D01`–`ARCH-S12-D10`
- **Supersedes:** None

## Context

Bestehen must accept resumable browser work, productive evaluations, media/content processing, Corpus publications, projection rebuilds, notifications and deletion without allowing retries, stale tabs, duplicate callbacks, worker failure or late results to corrupt evidence. Domain owners already hold consequential state; Pending is not error or zero; partial validity preserves named unaffected scope; Written and Oral are independent; the client cannot calculate evidence, validity, Mistake, Readiness or booking state.

The Stage-03 stack is a same-origin TypeScript/Next.js/Node modular monolith with PostgreSQL and pg-boss. A second API/runtime/event platform would add cost and distributed failure before a measured need.

## Decision

1. Expose one same-origin resource-oriented JSON/HTTP API with explicit command endpoints and authoritative query projections. Describe it contract-first with OpenAPI 3.1.x and JSON Schema 2020-12, using a path major, additive minors, closed consequential discriminators, cursor pagination and generated documentation/types/tests.
2. Return discriminated domain results for `completed`, `accepted_pending`, `partial`, `conflict`, `unavailable` and `deleted`. Use RFC 9457 only for protocol/request problems. Absence has no numeric value; partial scope is named; no pass-probability contract exists.
3. Represent long work as durable job resources. Browser observation is polling-first with ETag and `Retry-After`; optional push is a lossy invalidation hint. Authenticated provider callbacks are adapter input and candidate results only.
4. Distinguish owner domain events, minimized integration events and future-work jobs. Commit required job/outbox rows in the same PostgreSQL transaction as owner truth, and deduplicate consumers through an inbox. Do not add a general event platform.
5. Give every mutation a client operation ID, semantic identity, canonical payload hash and owner-scoped receipt. Same identity/hash returns the committed outcome; same identity/different hash conflicts. Handlers remain idempotent despite queue/provider retries.
6. Use aggregate ETags/versions and domain-specific merge. Immutable facts union by validated identity; projections rebuild; guest attachment preserves IDs; global last-write-wins is forbidden.
7. Authorize function, object and property at the owner boundary; minimize job/event/provider payload; enforce rights/access/abuse limits; and return semantic accessibility/recovery hints.
8. Late, duplicate, cancelled, deleted, incompatible or superseded results cannot publish unless exact identity/version/current preconditions pass. Technical/content/media/access/browser/network/evaluator failure has zero learner-negative effect.

## Consequences

### Positive

- Lost responses and duplicate/reordered delivery converge to one semantic effect.
- Stale/offline clients receive actionable conflicts instead of overwriting work.
- Pending and partial work remain useful without manufacturing zeros or whole results.
- PostgreSQL supplies one atomic truth/job/outbox boundary and keeps operations small.
- Open standard contracts, fixtures and adapters preserve provider/tool/queue exit.

### Costs and risks

- Operation receipts, outbox/inbox, job state and contract compatibility require disciplined schemas, retention, metrics and fault-injection tests.
- Polling adds bounded requests; backoff/ETag controls them. SSE may be added only after measured need without becoming authority.
- OAS 3.1 is deliberately behind current OAS 3.2; upgrade follows proven toolchain parity, not novelty.
- At-least-once transport means every business handler and external effect needs semantic dedupe.

## Alternatives considered

- **Ad-hoc server actions only:** less initial wiring, but weak durable replay/documentation and framework coupling.
- **GraphQL:** flexible reads, but field authorization, query-cost, cache and partial-error complexity are not justified for one client.
- **Typed RPC:** ergonomic, but couples transport/procedures; generated HTTP clients are sufficient.
- **Separate BFF:** duplicates semantics and deployment for one responsive client.
- **Hold requests open / fire-and-forget:** cannot meet pending/reconnect/recovery requirements.
- **WebSocket/SSE authority:** persistent-connection operations without stronger truth; polling resource remains simpler.
- **Kafka/Redis/general event platform or full event sourcing:** disproportionate operational and semantic complexity.
- **Last-write-wins or exactly-once assumptions:** can discard learner work or duplicate evidence/external effects.

## Traceability

Full rationale, catalogs, taxonomies, diagrams, examples, idempotency/concurrency matrix and source SHAs are in `Architecture/12-api-contracts-jobs-events-and-idempotency.md`. This ADR applies ADR-0007, ADR-0010, ADR-0012, ADR-0013, and ADR-0015 through ADR-0018 without superseding them.

Major downstream consumers are Stages 13–26 and 28.

## Review and exit triggers

Review when measured multi-client query pressure cannot be met by owner projections; PostgreSQL queue/outbox work persistently harms accepted learner SLOs after tuning; polling load or completion delay breaches the later accepted SLO; an independent deploy/security boundary exists; contract tooling cannot preserve exhaustive unions; or provider/queue cost, region, security, support or exit tests fail.

Any replacement must retain semantic idempotency, owner authority, typed uncertainty/partial scope, pinned versions, late-result preconditions, accessibility/recovery behavior, provider/Corpus learner-data minimization and audited history. A reversal creates a superseding ADR; published history is not deleted.
