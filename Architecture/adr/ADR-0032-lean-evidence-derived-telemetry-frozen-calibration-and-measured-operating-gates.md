# ADR-0032 — Lean evidence-derived telemetry, frozen calibration, and measured operating gates

> **Status:** Accepted  
> **Owner:** Stage 24  
> **Date:** 2026-08-23  
> **Decision IDs:** `ARCH-S24-D01`–`ARCH-S24-D12`  
> **Supersedes / superseded by:** None

## Context

Bestehen must measure whether it creates decision-grade TELC B1 readiness, validate the instruments behind that claim, detect system/provider/content/evaluator failure, operate within a personal-project cost posture, and support later calibration against independent mocks and voluntary real outcomes. It must do so without creating a second learner model, circularly validating a prediction against the evidence that produced it, or turning engagement telemetry into product truth.

The accepted implementation baseline is one Next.js/Node modular application and worker over PostgreSQL 18, pg-boss, private R2 EU storage and Render Frankfurt. Authoritative learner facts, corrections, material projections, retention/deletion, jobs and cost receipts already belong to App domain owners. A warehouse, event-stream platform, product-analytics SDK, time-series store, external observability vendor, multi-region topology and session replay would add cost, privacy exposure and operational failure domains before a measured need.

Binding inputs at the accepted base `9bdb088eb4cc52c2fd308e63df57559ba5447501` include:

- `Architecture/01-architecture-charter-and-quality-attributes.md` (`cc8d28816f43d627861d11cd90e8770c4c96414c`);
- `Architecture/03-technology-stack-and-repository-strategy.md` (`907b04c57813dc50f92a7ed00e49196ff7d4a924`);
- `Architecture/05-data-ownership-persistence-and-schema-evolution.md` (`bb6df811ec9010de556d1719f22e31bb8ca3190e`);
- `Architecture/06-evidence-ledger-validity-versioning-and-audit.md` (`53d34ae65ef4c8fa79c00026f9bd5d7b876ce672`);
- `Architecture/11-readiness-scoring-mocks-and-ready-to-book.md` (`7c327cd770460b94107f2756e2b7d8f29c56b909`);
- `Architecture/12-api-contracts-jobs-events-and-idempotency.md` (`c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528`);
- Stages 16–23 for media, productive evaluation, AI cost, local-first continuity, notifications and security;
- `app/28-bestehen-app-product-specification.md` (`18ae80cc2fd63cecd76c297c3e56d44a68367856`) and `app/24-analytics-and-success-metrics.md` (`28d1a5380a7ea9f28efdc95ce0c96987920917e1`) at Shaping `9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc`.

Mutable provider/standard evidence was rechecked on 2026-08-23 in official [Render logging](https://render.com/docs/logging), [Render service metrics](https://render.com/docs/service-metrics), [Render metrics streams](https://render.com/docs/metrics-streams), [OpenTelemetry JavaScript status](https://opentelemetry.io/docs/languages/js/), [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/), [W3C Trace Context](https://www.w3.org/TR/trace-context/), [PostgreSQL `pg_stat_statements`](https://www.postgresql.org/docs/current/pgstatstatements.html), [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/) and [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds).

The exact evidence-validity values remain `valid`, `partially_valid`, `pending`, `interrupted` and `not_counted`. The exact Readiness states remain `evidence_building`, `not_ready`, `borderline`, `safe`, `ready_to_book` and `stale_contradicted`. Written and Oral remain independent. Missing is absence. Safe is not Ready to Book. Probability is structurally forbidden in the current product.

## Decision

### 1. Evidence-derived semantic measurement

Use one closed, versioned, purpose-bound semantic event catalog projected transactionally with, or reproducibly from, existing authoritative facts. It includes only material evidence/correction, Readiness snapshot, weakness transfer/review, session summary, mock summary, quality incident, evaluator-release result, provider usage receipt, voluntary real outcome, data-rights state and security/rights incident families.

Semantic records are complete and idempotent rather than sampled. They retain the domain fact/source cut and exact release lineage needed for audit. Analytics owns event definitions, manifests and aggregates; it cannot author evidence, score, validity, Readiness, plan, deletion completion, rights clearance or provider acceptance.

There is no raw clickstream, global third-party analytics identity, engagement score, heatmap, DOM replay, screen/audio replay, key capture, warehouse, time-series database, event stream or always-on AI analytics.

### 2. Frozen independent calibration

Persist immutable material Readiness/Ready-to-Book snapshots before an independent validating P4/mock/real outcome enters the source cut. A later correction creates current truth and a successor snapshot; it does not rewrite the historical prediction the learner saw.

Every calibration run uses an immutable dataset manifest with purpose, hypothesis, source cut, inclusion/exclusion, independence unit, learner/form-family/time split, total and slice counts, missingness, invalidation, self-report confidence/selection bias, rights/consent/deletion status, applicable releases, method/uncertainty, sample-adequacy justification, result and rollback.

Use rights-safe human gold/sentinel fixtures for productive evaluator release. Use forward independent clean P4 and voluntary real outcomes for readiness calibration. Validate separately by Written and Oral. Report signed/absolute error, range coverage, pass-gate agreement, confidence ordering, false-ready cases and sample counts; correlation alone is insufficient.

Do not guess a universal sample count. If the preregistered precision/power and outcome prevalence do not justify inference, publish `insufficient_data` and keep the predecessor.

### 3. Probability activation is a separate future decision

Current schema/event/model/copy/dashboard/export registries reject probability-like artifacts. Frozen snapshots and outcomes validate deterministic target-performance Readiness; they do not calculate a hidden probability.

A future probability capability requires a new explicit product decision and superseding ADR, adequate independent matched real outcomes including failures and relevant ranges, learner/form/time-separated out-of-sample calibration stable across periods, component-specific calibration/discrimination/harm/fairness disclosure, privacy/legal approval, learner comprehension evidence, and an operated recalibration/rollback contract. Until that commit exists, no probability calculation occurs.

### 4. Lean vendor-neutral observability

At launch:

- emit allowlisted structured stdout logs and use Render’s current native seven-day log/metric views;
- retain critical authoritative audit/incident facts and bounded low-cardinality hourly/daily operating/calibration aggregates in PostgreSQL;
- use W3C trace correlation and OpenTelemetry-compatible server/worker instrumentation/export ports;
- use an explicit sampled browser RUM schema for critical journey timing and Core Web Vitals only;
- do not use experimental broad browser auto-instrumentation, session replay or a new observability provider.

Logs, metrics and traces exclude learner response, Writing, transcript, audio, prompt/rubric/content body, profile, name/email, exact exam date, auth/secrets, full URL/query, raw SQL values, IP/fingerprint, Readiness numbers and probability. Trace baggage is empty by default. Redaction occurs before serialization, with central scrubber/canary scans as defense in depth.

Operational telemetry is best effort and never makes a product fact true. Security/deletion proof is PostgreSQL-authoritative, not stdout-authoritative.

### 5. Internal learner-truth operating gates

Use internal SLO-style objectives for:

- 100% evidence integrity, acknowledged-fact durability and zero system-fault learner-negative effects;
- at least 99.5% correct eligible critical-command outcomes over a rolling 28-day window when traffic makes the ratio meaningful, accompanied by raw counts and synthetic journeys;
- L0 approximately 100 ms, Web Vitals p75 baselines, L1 p95 ≤1 s/progress ~2 s, L2 normally ≤15 s/Pending after ~30 s, L3 start ~≤2 s/fallback after repeated >~5 s;
- Writing recoverable loss normally ≤5 seconds;
- exact high-stakes media preflight/playback identity;
- backup RPO ≤24 h, validated service RTO ≤8 h and quarterly restore;
- raw audio zero after finalization and never beyond seven days Pending;
- truthful export/delete state, zero restore resurrection and linkable journal ≤91 days;
- WCAG 2.2 AA/equivalent-path release gates;
- registered price/usage/envelope/fallback for every paid operation.

These are not a public SLA or permission for multi-region. At low traffic, first-event integrity/privacy alerts, absolute counts and synthetic critical journeys prevent meaningless ratio paging.

### 6. Measured capacity and cost

Record immutable provider usage receipts and dated price catalogs, reconcile estimator/list cost to invoices, and attribute standard/retry/escalation/STT/TTS cost to each accepted productive capability unit. Report Writing and Oral separately; `valid` and `partially_valid` separately; Pending/zero denominator explicitly.

The owner configures paid-route daily and rolling envelopes. With no envelope, AI is disabled. Initial policy signals at 50%, warns/sheds optional work at 80%, and circuits new paid dispatch at 100%, while accepted productive work remains durable Pending. No currency amount is invented.

Tune/query/index/cache/batch/prune rebuildable state first. Resize or split only after the accepted sustained CPU/memory, job-age, PostgreSQL storage/query/restore, R2 cost/operation, observability retention, availability or security trigger. A warehouse, managed sink, queue service, read replica, second region or SIEM requires its own measured need and, where consequential, a superseding/new ADR.

### 7. Dashboards and alert ownership

Operate six bounded internal views: truth/data integrity; critical journeys; outcome/learning; content/evaluator/calibration; AI/media/data-rights/security; and capacity/reliability/cost. Each declares owner, source/query hash, freshness, metric release, sample count, access/retention and runbook.

Page immediately on the first confirmed truth/durability/cross-scope/privacy/rights/audio/deletion/probability breach. Page fast on repeated independent synthetic journey failure or deadline/cost circuit risk. Create working-time tickets for sustained latency/capacity/drift/retention misses. Learner outcome trends never page or drive manipulative engagement.

## Alternatives

| Alternative | Benefit | Rejected reason / retained role |
|---|---|---|
| No analytics; manual notes and provider dashboards | minimum implementation | Cannot reproduce learner outcome/calibration or cross-provider cost; provider retention is not product authority. Provider views remain one operational input. |
| Commercial product-analytics SDK with clickstream/funnels/heatmaps/replay | quick funnels and UI diagnosis | Duplicates learner state, creates surveillance/cardinality/data-processing cost and rewards engagement. Rejected. |
| Managed observability vendor from launch | longer retention, alert tooling | A new processor and recurring cost before a demonstrated incident need. Retained as trigger-based exit through OTel-compatible ports. |
| Self-hosted OTel collector/Grafana stack | provider control | Creates infrastructure/on-call/storage burden for one owner. Retained only if a managed sink cannot meet an approved security/exit need. |
| Warehouse/streaming platform | scalable analysis | Duplicates PG truth, complicates deletion/source cuts and has idle ops cost. Add only after measured isolation/query need and a new ADR. |
| Current projection compared with evidence already included | easy “accuracy” metric | Circular validation and hindsight bias. Rejected. |
| Pass probability now / hidden research model | seemingly actionable output | Sparse/selective outcomes, independent pass gates and calibration/communication risk make it false precision. Structurally forbidden. |
| Uptime-only SLO / public 99.99% SLA | simple status / strong promise | Uptime can hide incorrect learner truth; enterprise redundancy/on-call is disproportionate. Use critical-command correctness and local degradation. |
| Invoice total only / no cost controls | little metering work | Cannot attribute waste/value and permits surprise spend. Rejected; owner envelope plus receipts is smallest safe baseline. |

## Consequences

### Positive

- Product outcome and operating evidence reuse the same authoritative facts without creating a shadow learner authority.
- Frozen snapshots and independent splits make future mock/real validation reproducible and non-circular.
- Exact release/source-cut lineage supports correction, drift investigation and rollback without rewriting history.
- Structured redaction and no replay minimize learner/audio/Writing exposure.
- Internal SLOs prioritize evidence truth, data durability, accessibility, deletion and local degradation over vanity uptime.
- Capability receipts and unit economics expose cost without biasing coaching toward cheap objective work.
- Render/PG baseline adds no launch managed service; W3C/OTel/SQL/S3 contracts preserve exits.

### Costs and risks

- Event/metric registry, snapshot manifests, redaction tests, gold adjudication, calibration review, dashboards and runbooks require disciplined owner time.
- PostgreSQL rollups must be scheduled/indexed to avoid contention.
- Seven-day native signal retention may be insufficient for a later incident; the trigger-based managed-sink path must then be exercised.
- Sparse voluntary real outcomes may keep calibration conclusions unavailable for a long time. The honest output is insufficient data, not lowered standards.
- Critical first-event alerting is correct for privacy/truth but requires automated safe circuits when the solo owner is unavailable.
- Fixed retention and rollup windows need periodic purpose/legal/cost review without retaining everything.

### Failure, fallback and exit

Telemetry exporter/dashboard failure has no learner/evidence effect. Rebuild semantic aggregates from facts. Use Render/PG direct views during sink outage. When AI/media/provider/cost circuits open, fixed reviewed/deterministic work and durable Pending remain. Do not discard or score accepted work negatively.

Provider/format exit uses PostgreSQL logical export, ordinary JSON/CSV metric definitions/results, W3C Trace Context, OpenTelemetry-compatible server signals, S3 manifests/checksums and provider-neutral capability adapters. No provider ID/dashboard/trace backend is authority.

Affected downstream stages: 25 turns contracts into executable gates, 26 provisions signals/alerts/backups/runbooks, 27 walks end-to-end scenarios, and 28 consolidates the final specification and risk/roadmap.

## Validation and review trigger

Stage 25 must prove:

- semantic event source/idempotency/correction and no-shadow-authority properties;
- exact five validity/six Readiness states and absence of probability across schema/API/event/copy/dashboard/export;
- metric numerator/denominator, invalid exclusion, independent Written/Oral, zero-denominator and episode/freshness deduplication;
- frozen source-cut non-circularity, learner/form/time split and immutable history;
- rights-safe gold/sentinel, pass-critical zero-regression, sample disclosure, drift/non-inferiority, rollback;
- redaction/canary scans across browser/log/trace/metric/crash/provider/backup and no replay;
- L0–L3, Web Vitals, checkpoint loss, media, provider/PG/R2 outage and local degradation;
- authorization, raw-audio, export/delete/restore/rights/security and reserved critical queue paths;
- usage/invoice reconciliation, envelope/circuit, zero denominator and provider exit.

Review/supersede when a measured trigger in `Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md` `11.5 fires, a provider/price/terms/standard changes, a critical incident shows missing signal, calibration drift breaches a gate, or a future product decision makes probability eligible. Promotion is atomic and rollback uses the predecessor release. Historical snapshots/receipts/results remain labelled with original definitions.

## Traceability

- Product/design sources: `app/28-bestehen-app-product-specification.md` ``16–18, `app/24-analytics-and-success-metrics.md`, `app/26-platform-accessibility-nonfunctional.md`, `Design/DESIGN-HANDOFF.md` ``3.1–3.7, `Design/Bestehen-03-Desktop-Responsive.dc.html` D2, `Design/Bestehen-04-Flows-Handoff.dc.html` recovery/accessibility.
- Owning stage output: `Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md`.
- Checklist items: all 24 decisions/checks in Stage 24.
- Related ADRs: ADR-0001, ADR-0003, ADR-0007, ADR-0008, ADR-0009, ADR-0012, ADR-0013, ADR-0018, ADR-0019, ADR-0024–ADR-0031.
