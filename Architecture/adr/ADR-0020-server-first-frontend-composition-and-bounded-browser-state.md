# ADR-0020: Server-first frontend composition and bounded browser state

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 13 — Frontend Application and Design-System Architecture
- **Decisions:** ARCH-S13-D01–D05, ARCH-S13-D10
- **Supersedes:** None

## Context

Bestehen has one responsive web client, a same-origin Next.js/Node modular monolith, authoritative server domain owners, one versioned JSON/HTTP contract, resumable anonymous work, active attempt/media behavior, and locally recoverable drafts. The browser must be interactive without becoming a second learner model. Evidence validity, Mistake Memory, progression, Readiness, mocks, booking, rights, and coaching priority cannot be calculated or guessed client-side. Pending, absence, partial affected scope and failures need local, recoverable presentation.

A client-only SPA/global store would duplicate server truth and ship more framework/runtime code. A server-only composition cannot satisfy active drafts, timers, media, capability checks and reconnect. A route per design frame would turn examples into permanent navigation.

## Decision

1. Use one Next.js App Router composition. Expose four stable destination roots—Coach, Readiness, Train, Progress—plus utility routes and focused session/attempt/mock route groups. Design frames are states, not routes or services.
2. Make pages/layouts server-first. Route composition obtains authoritative projections through one frontend-data facade. Narrow client islands own only interaction, browser capabilities, local persistence, polling and active-flow behavior.
3. Give frontend-data two adapters over the same contract mappers and handlers: in-process for server composition and /api/v1 HTTP for the browser. The optimization cannot create a second semantic API.
4. Add no general global client state store or second query cache at launch. Server projections are truth; route/prefetch caches are disposable; feature controllers own ephemeral UI; IndexedDB owns bounded drafts/checkpoints/outbox.
5. Use named semantic invalidation after accepted command receipts, then refetch the projection. Durable jobs remain polling-first with ETag/Retry-After; optional push may only invalidate.
6. Permit optimistic updates only for reversible local interaction, draft status and device theme. Do not optimistically update evidence, validity, evaluation, Readiness, mock verdict, booking, rights or deletion. Resolve unknown mutation outcomes through the operation receipt.
7. Contain errors at document, destination, feature panel, focused shell and capability/input boundaries. A boundary recovers local work and asks the authoritative owner to interpret facts; it never assigns evidence consequences.

## Consequences

### Positive

- One route system and one data boundary preserve the Stage-03/12 low-ops stack.
- Server rendering minimizes client code and keeps secrets/server modules out of the browser.
- Active attempts remain capable and recoverable without a second domain model.
- Cache and optimistic behavior cannot manufacture scores, labels, booking or deletion success.
- Local faults preserve unaffected navigation and learner work.

### Costs and risks

- The in-process and HTTP adapters require contract parity tests.
- Feature controllers may repeat orchestration before a library is justified.
- Server/client boundaries and theme bootstrap require hydration/focus/CSP tests.
- IndexedDB capability and quota failure need explicit degraded recovery.
- Nested boundaries require disciplined correlation IDs and redacted telemetry.

## Alternatives considered

- **Single catch-all server page:** few routes, but poor deep links, resume and error isolation.
- **Route per frame:** easy screenshot mapping, but duplicates state and destabilizes navigation.
- **Client SPA + global store/query cache:** familiar, but duplicates truth, increases JS and exposes coupling.
- **Server Components only:** lean, but cannot meet drafts/media/timers/offline checkpoint needs.
- **WebSocket/SSE as authority:** more operations without stronger truth; polling remains sufficient.
- **Optimistic domain projections:** responsive-looking but can show false learner claims.

## Traceability

Full route/state tables, dependency and recovery diagrams, invalidation/optimism rules, design-frame mapping, source SHAs and tests are in Architecture/13-frontend-application-and-design-system-architecture.md.

This ADR applies ADR-0001, ADR-0002, ADR-0003, ADR-0006, ADR-0010, ADR-0012, ADR-0015, ADR-0018 and ADR-0019 without superseding them. Major downstream consumers are Stages 14–22 and 25–28.

## Review and exit triggers

Review when a second client/deploy boundary is real; route/client bundle or latency evidence contradicts the boundary; the same controller/invalidation logic repeats across at least three features; IndexedDB recovery cannot meet the accepted loss bound; polling load/completion delay exceeds later SLO after backoff; or boundary incidents show a narrower safe design.

Any replacement must retain authoritative server owners, operation idempotency, absence/Pending/partial scope, no optimistic learner truth, local failure containment, recoverable drafts, exact four-destination IA, focused shells, accessibility semantics and no live Corpus. A reversal creates a superseding ADR; published history remains.
