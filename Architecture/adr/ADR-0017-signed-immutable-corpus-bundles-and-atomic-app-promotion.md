# ADR-0017: Signed immutable Corpus bundles and atomic App promotion

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Architecture Stage 10 — Corpus Integration, Compatibility, Cache, and Rights
- **Decision IDs:** `ARCH-S10-D01`–`ARCH-S10-D10`
- **Supersedes:** None
- **Superseded by:** None

## Context

Corpus and App are separate products. Corpus owns provenance, confidence, independence, rights, taxonomy, target and capability eligibility; App owns learner state, original practice, approval, serving, evaluation, evidence and Readiness. Stage 02 already forbids normal learner-runtime Corpus dependence, Stage 05 selects App PostgreSQL/private object storage and immutable imported lineage, and Stage 09 makes App-approved content manifests the only learner inventory. Stage 10 must choose a durable publication transport, compatibility and change path without adding a live service, leaking Corpus tables, or sending learner data.

The contract has six information families—reference content, exam metadata, aggregate intelligence, skill graph, generation blueprints, and demand/relevance signals—each governed independently by confidence, currentness, source breadth/independence, use eligibility, rights/attribution and accessibility. Corpus changes can require urgent stop-use, conservative migration or targeted learner-evidence repair, but rights-only change is not learner failure.

## Decision

1. Corpus publishes private, signed, immutable, capability-scoped logical bundles discovered through a small signed publication index. Launch has no live Corpus query API, shared database, raw-source learner search, or per-click Corpus AI.
2. App fulfils desired-practice requests locally against a named accepted snapshot. The contract rejects learner/profile/session/attempt/evidence fields; Corpus receives no learner state or outcome.
3. Each bundle exposes stable capability pseudotypes for the six families under a common governance envelope, not Corpus storage rows. Restricted/reference expression is absent from ordinary bundles; exact components live in separate operator-only partitions and require action-level eligibility.
4. RFC 8785 canonical bundle/index manifests are signed with Ed25519; every immutable object has a SHA-256 digest and declared size. App pins public keys, rejects replay/unknown keys/critical fields, and treats signatures as publication authenticity—not semantic, rights or App approval.
5. App downloads into isolated staging, verifies integrity/resource limits/compatibility/cross-reference closure/governance/non-reconstructive boundaries, produces a semantic diff, applies Stage 09 review, then transactionally promotes one complete capability pointer and reconciliation outbox. Partial candidates never serve.
6. Contract, packaging, family payloads, taxonomy, target, blueprint, analytics, difficulty/relevance and rights/governance versions are independent. Unknown consequential major or enum quarantines only its declared dependency closure; last-compatible/App-curated inventory remains.
7. Stable IDs never change meaning or get reused. Material change creates a revision/successor and migration. Merge deduplicates; split never clones learner mastery; historical App artifacts keep exact refs.
8. Active, last-compatible and evidence-referenced imported metadata is retained where permitted. Rollback is an audited pointer to a prior still-eligible snapshot, never deletion or “latest” reinterpretation. Browser/runtime caches contain only App-approved learner-safe manifests/assets.
9. Verified rights/takedown impacts immediately deny exact new use and purge affected caches/bytes as required. Corpus supplies impact scope; App Content maps artifacts; Evidence & Capability alone appends validity/rebuilds projections. Rights-only withdrawal does not automatically negate past performance.
10. Corpus outage alone changes no active App approval or learner evidence. Normal practice and previously approved P4 continue from App inventory absent an already-imported revocation or independently reached effective limit. Only new Corpus publication/provenance waits.

## Consequences

### Positive

- Zero Corpus calls, learner-data transfer, Corpus search or Corpus model cost per learner attempt.
- Reproducible imports, atomic promotion, rollback, provider exit and exact historical lineage.
- Corpus can change internal tables/services without forcing App storage coupling.
- Six families, confidence, rights, currentness and accessibility remain independently enforceable.
- Corpus outage, invalid candidate or unsupported major affects new intelligence only; App-approved practice survives.
- Takedown/correctness/taxonomy/target impacts are auditable and scoped rather than global or silently ignored.

### Negative / trade-offs

- Corpus signing/key custody, App validation, key rotation, semantic diff and reviewer discipline add operational work.
- App retains active/last-compatible/reference metadata and may temporarily store duplicate candidate bytes.
- Publication freshness is asynchronous; withdrawal latency depends on the configured import/alert path.
- Bundle partitioning and migration tables require explicit contract stewardship.
- A live provenance drill-down or very large rapidly changing catalogue may later need another transport, but it is not justified at launch.

## Alternatives considered

1. **Shared database or Corpus tables.** Simplest first query, but leaks internal schema/rights-sensitive data, duplicates policy and creates runtime coupling. Rejected.
2. **Manual/mutable files.** Lowest setup, but lacks immutable identity, authentication, compatibility, impact, atomic promotion and dependable rollback. Rejected except fixtures.
3. **Synchronous capability API.** Fresh and flexible, but adds always-on authorization/retry/rate/SLO work and invites learner-runtime/profile coupling. Rejected at launch.
4. **Hybrid API plus bundles.** Supports drill-down and offline replay, but duplicates contracts and incident paths. Deferred until measured bundle/query/operator evidence requires it.
5. **Checksums/TLS only.** Detects some corruption/transport attacks but does not authenticate a publication artifact after storage compromise. Rejected.
6. **Shared HMAC.** Small implementation, but gives App forge capability and complicates custody/forensics. Rejected for asymmetric Ed25519 trust.
7. **Per-record promotion.** Flexible, but can mix incompatible taxonomy/target/rights/blueprint releases. Rejected for atomic capability closure.
8. **Global invalidation on any Corpus change.** Operationally simple, but destroys unaffected learner truth and misclassifies rights-only change. Rejected for typed impacts and targeted repair.

## Compatibility, fallback, and exit

- Patch cannot change behavior; additive minor is accepted only when required capabilities are supported and unknown concepts are explicitly optional/non-consequential. Unknown contract, packaging or family major is quarantined without reinterpretation.
- Last-compatible imported snapshot and App-curated/approved inventory are fallback. No compatible Corpus snapshot is an authoring limitation, not a global learner outage.
- The publication format is portable canonical UTF-8 JSON/JSON Lines plus immutable objects, standard digests and Ed25519 signatures. PostgreSQL and S3-compatible export preserve provider exit.
- A query API or complete-snapshot delta format requires measured bundle transfer/index/query or operator-drill-down failure, a separate threat/compatibility decision, and no learner-runtime/profile coupling.

## Validation

Release tests cover all six families/governance; canonicalization/signature/key rotation/replay/digest/resource attacks; contract/packaging/family majors and critical enums; stable identity and rename/merge/split/retire/target migration; restricted-expression and exact-action rights; attribution/accessibility; atomic promotion/rollback/idempotency; rights/correctness/takedown targeted impacts; cache purge; extended Corpus outage with normal practice and approved P4; and network/schema proof of zero learner data and zero Corpus learner-route calls.

## Review triggers

Review when measured bundle size/import latency/duplicate transfer cannot meet the accepted publication SLO after capability partitioning; provenance drill-down demand justifies an operator-only API; withdrawal-to-App-deny or target-currentness SLOs fail; P4/fresh inventory is blocked by publication lag; key custody/threat findings require stronger signing/transparency; reviewer workload is unsustainable; or retained imported data materially dominates cost. No review may silently introduce learner data, live learner-runtime Corpus dependency, raw-source search, per-click Corpus AI, table coupling, or collapse rights with confidence.

## Traceability

- Stage output: `Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- Product authority: `app/28-bestehen-app-product-specification.md` §14; `app/21-content-strategy.md` §§3–5; `app/22-user-controls-vs-coach-autonomy.md` §10
- Corpus authority: `corpus/12-corpus-app-contract.md` §§3–5; `corpus/17-bestehen-corpus-product-specification.md` §§3–4
- Design: `Design/DESIGN-HANDOFF.md` §§1, 9
- Prior architecture: Stages 02, 05, 09; refines ADR-0004, ADR-0012, ADR-0016
- Standards: RFC 8785, RFC 8032, Node.js 24 crypto documentation, accessed 2026-08-23
- Downstream: Stages 11, 12, 16, 19, 23–28
