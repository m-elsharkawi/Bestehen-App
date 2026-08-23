# ADR-0012 — Append-oriented relational truth and bounded persistence

> **Status:** Accepted
>
> **Owner:** Stage 05
>
> **Date:** 2026-08-23
>
> **Decision IDs:** `ARCH-S05-D01`–`ARCH-S05-D10`
>
> **Supersedes / superseded by:** None; refines ADR-0001, ADR-0007, ADR-0008, ADR-0009, ADR-0010 and ADR-0011

## Context

Bestehen must keep exact learner attempts and evidence auditable while allowing correction, recalculation, local checkpoint recovery, account-optional first use, ephemeral raw audio, rights-aware content and full export/deletion. Stage 03 selected PostgreSQL/Kysely/pg-boss, private EU R2 and Render; Stage 04 assigned each state one semantic owner. A mutable learner document would erase lineage, while a streaming/event-sourced platform or database per context would impose personal-project operations without a measured need.

Current inputs and blob SHAs are recorded in `Architecture/05-data-ownership-persistence-and-schema-evolution.md` §2 at App `main@128c97fca6c705089cb3bf862821f2f11c3b5d41`. Official PostgreSQL, Render, Cloudflare and Kysely sources were checked on 2026-08-23 and are linked there.

## Decision

Use PostgreSQL as authority for accepted server facts, mutable workflows, versioned projections, object/content metadata and pg-boss jobs. Authoritative attempt/evidence observations are append-oriented in meaning; a correction is a new owner-scoped fact. Current capability, mistake, progression, coaching and Readiness views are replaceable projection generations carrying exact source cuts and rule/calibration versions.

Use private R2 for immutable approved bytes and purpose-bound raw audio only; PostgreSQL owns association, rights, checksum and lifecycle. Use IndexedDB for unacknowledged outbox/checkpoints and rebuildable local caches, not as a second accepted ledger. Account-free use has an opaque guest server scope; account attachment preserves fact IDs. Use opaque UUIDs (prefer UUIDv7), explicit occurred/recorded/effective/monotonic clocks and a per-learner accepted sequence; never infer chronology from an ID or use last-write-wins for evidence.

Use database constraints, idempotency uniqueness, optimistic versions and scoped locks. Fact plus durable job commits atomically; PostgreSQL↔R2 work uses an explicit reconciled lifecycle. Evolve physical schema, contracts/facts, content/target/taxonomy, evaluator/rubric and rules/calibration independently through expand/backfill/switch/contract and roll-forward repair.

Render PITR is near-term recovery only. Produce encrypted nightly off-Render logical backups retained as 14 daily plus 12 weekly generations and prove quarterly isolated restore. Raw audio is excluded and deleted after finalization or within the seven-day pending ceiling. Live deletion revokes access, deletes owner/provider/object copies and uses a restricted restore-suppression journal until containing backups expire; linkable journal data expires within 91 days. No warehouse, time-series database, Redis, document database or durable audio archive exists at launch.

## Alternatives

1. **One mutable learner document/database record.** Initially quick, but creates shared ownership, weak relational constraints, destructive corrections and no reliable affected-scope audit.
2. **Full event sourcing plus streaming platform/database per context.** Strong historical mechanics and physical isolation, but excessive schema/replay/distributed transaction/operations cost for one deployable personal project.
3. **PostgreSQL-only, including media bytes and browser-free state.** Transactionally simple, but bloats evidence backups, mixes large/ephemeral media with truth and cannot meet reload/offline checkpoint recovery well.
4. **Client-only anonymous state with later last-write-wins sync.** Avoids guest data server-side, but conflicts with server-authoritative scoring/jobs, risks loss and can duplicate or select convenient evidence.
5. **Chosen bounded combination.** Relational append-oriented truth plus ordinary mutable state/projections, private object bytes and local recovery gives audit, transactions and low operations without speculative infrastructure.

## Consequences

- Historical evidence can be reinterpreted without being overwritten; learner deletion remains a deliberate exception that removes personal history across bounded live/backup stores.
- Server facts, R2 bytes and local recovery have explicit authority; object presence, browser cache, provider result or analytics never becomes learner truth.
- Jobs/results/retries are exactly-once in domain effect through application idempotency, not provider marketing. Partial cross-store work is detectable and repairable.
- Backups cost storage and operator time, and deleted data may remain only in inaccessible expiring recovery generations; product copy must disclose live deletion versus backup expiry without claiming legal compliance.
- Current R2 Standard prices/allowances are mutable; PostgreSQL evidence/index/backup growth and object operations are measured. Scale, partition, isolate or substitute only on Stage 05's storage/restore/SLO/cost triggers.
- PostgreSQL exit uses standard logical export/restore; R2 exit enumerates App manifests/checksums through the tested S3 subset; guest/account/content/provider identifiers remain App-owned.
- Stages 06/12/20/21/23/26 must supply concrete schemas, APIs, sync, privacy and runbooks without weakening the identifiers, correction, retention or restore/deletion contract.

## Validation and review trigger

Stages 06/09/11/25 must prove correction discovers 100% affected facts and changes zero unaffected facts; replay yields identical projections; duplicates do not create evidence; and no probability/missing-as-zero field exists. Stages 17/18/21/25 must prove ≤5-second Writing recovery, monotonic timer truth and raw-audio deletion. Stages 20/23/25 must rehearse export/delete across every data class. Stage 26 must quarterly restore both PITR and logical backup, replay deletion suppression, reconcile objects/jobs and meet the ≤24-hour backup RPO / ≤8-hour validated-service RTO objectives.

Review or supersede when measured contention, PostgreSQL storage/query/restore load, browser persistence failure, provider terms/region/SLO, R2 cost, recovery failure or a new legal requirement makes the selected boundary insufficient. A replacement must preserve fact/version lineage, independent Written/Oral truth, deletion/export, raw-audio ceiling, rights state, checksums and tested portable exit.

## Traceability

- Product/design sources: `app/28-bestehen-app-product-specification.md` §§5, 10–17, 19–20; `app/04-learner-model.md`; `app/05-mistake-memory.md`; `app/15-telc-readiness.md`; `app/21-content-strategy.md`; `app/24-analytics-and-success-metrics.md` §§8–10; `app/26-platform-accessibility-nonfunctional.md` §§3.9–3.16; `Design/DESIGN-HANDOFF.md` §3; mobile design Act 5
- Owning stage output: `Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- Checklist items: all Stage 05 decisions/checks
- Related ADRs: ADR-0001, ADR-0003, ADR-0004, ADR-0005, ADR-0007, ADR-0008, ADR-0009, ADR-0010, ADR-0011
