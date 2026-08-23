# Bestehen / App — Data Ownership, Persistence, and Schema Evolution

> **Stage:** 05 of 28
>
> **Status:** Accepted architecture decision
>
> **Decision owner:** Stage 05
>
> **Repository baseline:** `m-elsharkawi/Bestehen-App@128c97fca6c705089cb3bf862821f2f11c3b5d41`
>
> **Shaping baseline:** `m-elsharkawi/Bestehen-Shaping@9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc`
>
> **Research/access date:** 2026-08-23

## 1. Purpose and scope

This stage fixes where every class of App data lives, who may change its meaning, how facts survive concurrency and correction, how local anonymous work differs from synchronized state, and how schema, backup, restore, export and deletion remain auditable. It refines the Stage 03 PostgreSQL/Kysely/pg-boss/private EU R2/Render baseline and the Stage 04 single-owner domain model; it does not reopen either decision.

This is conceptual architecture, not production DDL. Names below are stable semantic roles and explanatory pseudotypes. Stages 06, 12, 17–23 and 26 own executable schemas, APIs, retention jobs, provider settings and runbooks within these constraints.

## 2. Inputs, authority, and continuity

### 2.1 Current repository evidence

All required files were fetched from current `main` before deciding. The Stage 05 output did not exist. Blob identifiers are Git object SHAs.

| Repository/path | Blob SHA |
|---|---|
| App `Architecture/00-architecture-shaping-plan.md` | `b263c5e7b3bccc0450ddd17aa0cc007432d672b7` |
| App `Bestehen_App_Architecture_Checklist.md` | `2fee5c5a35338c0be6d7662dfa026181724baa51` |
| App `prompts/architecture/05_define_data_ownership_persistence_and_schema_evolution.txt` | `76218977a393f468e7b552d0ab06c88acb394c61` |
| App `Design/DESIGN-HANDOFF.md` | `417a6820037e045e2dd9f29afc42b9f2e94fd638` |
| App `Design/Bestehen-02-Mobile-Screens.dc.html` | `0a9f2d3ea982c3197f399941b57defd9869d2428` |
| App `Architecture/01-architecture-charter-and-quality-attributes.md` | `cc8d28816f43d627861d11cd90e8770c4c96414c` |
| App `Architecture/02-system-context-and-product-boundaries.md` | `046d114bbbc96528bf0b9eae0406c0235f759127` |
| App `Architecture/03-technology-stack-and-repository-strategy.md` | `907b04c57813dc50f92a7ed00e49196ff7d4a924` |
| App `Architecture/04-domain-model-and-bounded-contexts.md` | `ab1a775d7689e47bba00c2544c247ef344c44e70` |
| Shaping `app/28-bestehen-app-product-specification.md` | `18ae80cc2fd63cecd76c297c3e56d44a68367856` |
| Shaping `app/04-learner-model.md` | `f7ae1f4af375ee3302d04c726d8fe8453a9daf80` |
| Shaping `app/05-mistake-memory.md` | `a7c574b08c33418eab44aba8b6e9b7f8ab877109` |
| Shaping `app/15-telc-readiness.md` | `b4456939928493569336bbc565d7e67307e7a3db` |
| Shaping `app/21-content-strategy.md` | `8149d6a268da70e17cad46f774b9d5de77776986` |
| Shaping `app/24-analytics-and-success-metrics.md` | `28d1a5380a7ea9f28efdc95ce0c96987920917e1` |
| Shaping `app/26-platform-accessibility-nonfunctional.md` | `8137091683941b0d55f3d4fb90af3c402b8371e5` |

Required Stages 01–04 exist, are substantive, and their Stage checklist sections were fully checked at this baseline. Stage 03 fixes PostgreSQL 18, Kysely, pg-boss, a private R2 Standard EU-jurisdiction bucket and Render Frankfurt. Stage 04 fixes 11 logical contexts and exactly one command owner for each consequential state.

### 2.2 Authority and source reconciliation

The final product specification is highest authority, detailed shaping retains delegated detail, and Stage 27 precedence applies: validity/fairness → direct evidence → independent Written/Oral risk → uncertainty → repair/retention → progression/coverage → preference. Design §3 and Act 5 are consistent projections of the five evidence-validity states, failure ownership, accessibility and recovery; they do not shorten the shaped weakness lifecycle or change product truth.

No blocking contradiction was found. The design handoff's shorter learner-visible weakness path is a presentation subset; Stage 04's complete lifecycle remains authoritative. The product permits local-first single-device use while Stage 03 makes PostgreSQL authoritative for accepted server state. This stage reconciles them by keeping browser storage authoritative only for unacknowledged local work and cached views; an opaque account-free guest scope can own accepted server facts without requiring identity or cross-device recovery.

### 2.3 Current official evidence

Mutable claims below were checked against official primary sources on 2026-08-23:

- PostgreSQL 18 provides native UUIDv4/UUIDv7 support ([UUID type](https://www.postgresql.org/docs/18/datatype-uuid.html)); its constraints and referential-integrity primitives are documented in [Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html), and its default Read Committed plus Repeatable Read/Serializable behavior is documented in [Transaction Isolation](https://www.postgresql.org/docs/18/transaction-iso.html).
- Kysely's official source documents its migration lock/table and transactional migration behavior in the [Migrator](https://github.com/kysely-org/kysely/blob/master/src/migration/migrator.ts). Migrations remain reviewed, forward-only files as accepted in Stage 03.
- Render currently gives paid PostgreSQL automatic PITR with workspace-dependent retention—3 days on Hobby and 7 days on Pro+—and retains on-demand logical exports for 7 days; deleting the database deletes provider-held recovery material ([Backups, PITR, and deletion safety](https://render.com/tutorials/postgres-on-render/backups-and-pitr), [flexible plans](https://render.com/docs/postgresql-refresh)). These are provider facts, not Bestehen's complete backup plan.
- R2 Standard currently lists 10 GB-month, 1 million Class A and 10 million Class B operations monthly free, then USD 0.015/GB-month, USD 4.50/million A and USD 0.36/million B, with direct R2 egress free ([pricing](https://developers.cloudflare.com/r2/pricing/)). R2 object read/write/delete/list operations are strongly consistent, while same-key concurrent writes are last-completer-wins ([consistency](https://developers.cloudflare.com/r2/reference/consistency/)); PostgreSQL metadata therefore remains semantic authority and object keys are immutable rather than overwrite targets.

Prices, quotas, backup windows and provider terms must be rechecked before provisioning or plan change. Nothing here is a legal-compliance claim or an owner-approved euro budget.

## 3. Decision registry

| ID | Recommended default and criteria | Alternatives considered and rejected | Consequences, fallback, review trigger | ADR |
|---|---|---|---|---|
| `ARCH-S05-D01` | Classify every data set by Stage 04 owner, authority, sensitivity, mutability, retention, export and deletion. Store facts and corrections separately from projections. | A: one mutable learner document is simple but destroys ownership/audit. B: event platform per context retains history but adds disproportionate operations. C chosen: relational append-oriented facts plus ordinary mutable state/projections. | Every field has one semantic writer. Rebuild corrupt projections; never reconstruct facts from analytics. Review only if a required fact cannot be represented without cross-owner writes. | ADR-0012 |
| `ARCH-S05-D02` | One PostgreSQL authority for server facts/state/jobs; private R2 for bytes; IndexedDB for local outbox/checkpoints/cache; browser Cache Storage for approved static responses; no warehouse/time-series/document database. | A: PostgreSQL-only bytes inflate backups and contention. B: document DB makes relational lineage/constraints harder. C: SQLite/local-only cannot coordinate web/worker/sync. D chosen: smallest mixed persistence by data shape. | No new managed service. R2 or browser loss never changes semantic truth. Add a separate store only after measured PostgreSQL/R2/local limits fail. | ADR-0012; refines ADR-0007/0009 |
| `ARCH-S05-D03` | Opaque UUID identifiers, preferably UUIDv7 for new ordered server/client facts; chronology uses explicit clocks and accepted sequence, never UUID ordering. Stable family IDs and immutable revision IDs preserve independence. | A: sequential public IDs leak counts and do not work offline. B: natural composite IDs couple semantics and mutation. C: UUIDv4 only is adequate but has worse append locality. | An identifier is never recycled or rewritten during guest→account link. Review UUID choice only if benchmarked index/storage cost matters; semantics remain opaque. | ADR-0012 |
| `ARCH-S05-D04` | Authoritative observations are append-only in meaning. Corrections append a scoped assertion referencing the original; mutable pointers expose current validity. Projections carry source cut and rule versions and are replaceable. | A: overwrite invalid facts loses audit. B: retain complete event-sourced aggregates for every edit adds replay/version complexity. C chosen: append-oriented evidence/corrections with ordinary mutable workflow state. | Historical evidence is auditable; correction can reduce current contribution without pretending history did not occur. Targeted rebuild is the fallback. | ADR-0012; ADR-0001 |
| `ARCH-S05-D05` | PostgreSQL transactions, constraints, idempotency uniqueness and optimistic versions are the default. Lock only the affected aggregate/source-cut; use Serializable with bounded retry only for invariants that cannot be expressed by a unique/foreign/check constraint. | A: global serial transactions reduce concurrency. B: eventual consistency for learner truth permits double evidence. C: last-write-wins chooses convenient/high score. | Accepted fact + pg-boss job commits atomically. Cross-store bytes use an explicit state machine and reconciliation. Review after contention/serialization metrics, not hypothetical scale. | ADR-0012; ADR-0007 |
| `ARCH-S05-D06` | Independently version physical schema, domain/contract envelopes, content/blueprint/taxonomy, evaluator/rubric and rules/calibration. Use expand/backfill/switch/contract and roll-forward repair. | A: synchronized breaking deploy is brittle for stale tabs/jobs. B: rewrite old facts into new meaning erases lineage. C chosen: compatible additive evolution plus explicit adapters/recomputation. | Unknown consequential major fails closed. Old facts remain interpretable through their version; no destructive down migration is relied upon. | ADR-0012 |
| `ARCH-S05-D07` | Render PITR is near-term recovery, not exit backup. Add nightly encrypted off-Render logical backups, retained 14 daily plus 12 weekly generations; quarterly isolated restore drills. Raw audio is excluded. | A: provider PITR only disappears on instance deletion. B: no backups is unacceptable for historical evidence. C: synchronous multi-region adds excessive cost. | Provider disaster objective: ≤24 h backup RPO and ≤8 h restore-to-validated-service RTO; provider PITR should be tighter but is not treated as a guarantee. Increase frequency after any miss or risk review. | ADR-0012; ADR-0008 |
| `ARCH-S05-D08` | Live deletion revokes access first, removes personal data across owners/providers, and records an auditable operation. A restricted deletion journal is replayed after restore until every containing backup expires; linkable journal data expires after 91 days. | A: delete only primary rows resurrects data from restore. B: immediately destroy all backups compromises other learners and recovery. C chosen: live erasure plus bounded backup expiry and restore suppression. | UI discloses bounded inaccessible backup residual. Exact jurisdictional/legal wording is owned by Stage 23/legal review; no compliance claim. | ADR-0012 |
| `ARCH-S05-D09` | Account-free guest server scope plus local write-ahead checkpoints; server-synchronized scope only after accepted acknowledgment; guest→account attachment preserves IDs. Corpus bundles/content caches/raw media/projections remain separate classes. | A: account wall violates first use. B: client-only learner truth conflicts with authoritative server decisions/recovery. C: silent full sync creates privacy and conflict ambiguity. | Clearing local capability can lose access to an unlinked guest scope and is warned plainly. Stage 20 owns identity/link/conflict UX without changing evidence semantics. | ADR-0012 |
| `ARCH-S05-D10` | Minimize duplicated payloads, store JSON only as bounded versioned envelopes, prune rebuildable generations, and measure bytes/operations/backup/restore. | A: retain every payload/log because storage is cheap creates privacy and backup cost. B: early warehouse/time-series system adds idle ops. | Scale or substitute on measured storage/restore/operation/SLO pressure; exports, SQL and S3-compatible manifests preserve exit. | ADR-0012 |

Cost never removes Writing/Oral evidence, historical auditability, accessibility conditions or recovery. Missing evidence is absence, never zero, and no pass-probability field/event/model exists.

## 4. Data ownership and classification

`Sensitivity` is an architectural handling class, not a legal classification: **H** high personal/voice/identity content; **M** learner-linked structured data; **L** non-learner operational or approved content. Every learner-linked row carries `learner_scope_id`; authorization is always by scope, never by guessing an object key.

| Data class | Semantic owner / purpose | Sensitivity, authority, mutability | Store and retention default | Export / deletion behavior |
|---|---|---|---|---|
| Guest/account link, recovery capability, target/date, preferences | Learner Profile & Goal; identify scope and configure coaching | M/H for recovery secret; mutable history. Identity provider is proof, not authority | PostgreSQL. Secret is stored only as a verifier/digest. Retain until learner deletion; link history remains auditable until deletion | Export learner-owned fields, not credentials. Delete links/profile; revoke guest/account capabilities first |
| Declared access/equipment/accommodation preference | Learner Profile & Goal; accessible experience and evidence equivalence | M; explicit declaration only, never inferred disability/diagnosis; history on consequential change | PostgreSQL plus current local preference cache; until learner deletion | Export plain-language preference/conditions; delete with profile/evidence |
| Local outbox, draft/checkpoint, timer/media counters | Session & Attempt; prevent loss/retry duplication | H/M; device-authoritative only until server acknowledgment; mutable versioned checkpoint | IndexedDB, origin-scoped. Acknowledged copy retained locally at most 24 h for recovery; abandoned drafts 30 days; anonymous accepted history is server truth. Raw-audio buffer follows ≤7-day ceiling and normally clears immediately | Included only after accepted fact, except learner-visible draft export if Stage 20 supports it. Clear on deletion/logout/device reset; browser eviction risk is disclosed |
| Session/attempt/response/condition facts | Session & Attempt; what occurred | M/H (Writing); authoritative append-oriented completion plus mutable in-progress state | PostgreSQL; completed history until learner deletion. Writing text retained with evidence | Export useful history and retained Writing. Delete with learner scope |
| Evidence observations and corrections | Evidence & Capability; direct evidence truth | M; authoritative append-only semantics; correction is a new fact | PostgreSQL relational records; until learner deletion, regardless of staleness | Export observation/condition/validity/correction history. Delete with learner scope |
| Capability/confidence/freshness projections | Evidence & Capability; current explainable state | M; rebuildable, versioned by source cut/rules | PostgreSQL current + previous validated generation; material learner-facing snapshots until deletion; obsolete transient generation pruned after 30 days | Export current state and material history. Delete/rebuild from remaining facts only |
| Mistake/repair/review/progression/plan state | Respective Stage 04 owners; coach and retention | M; facts/state logs plus rebuildable priority/plan | PostgreSQL; history and learner-useful milestones until deletion; ephemeral unused plan candidates 30 days | Export useful lifecycle/obligation/history, not internal rank traces. Delete with learner scope |
| Readiness/mocks/booking-gate snapshots | Measurement; pass-risk explanation and later calibration | M; material immutable snapshots plus rebuildable current state | PostgreSQL; until learner deletion. Written/Oral remain separate | Export estimates/ranges/confidence/gates/history. Delete with learner scope; no probability field |
| Voluntary real-exam outcome | Measurement/Operations calibration; ultimate validation | H/M; learner-reported fact with confidence/correction history | PostgreSQL; until learner deletion or separate withdrawal | Export and delete. Irreversibly de-linked aggregate may remain only after verified unlinking |
| Productive evaluation job/candidate/transcript | Productive Evaluation; bounded asynchronous evaluation | H; mutable job, immutable accepted/rejected candidate lineage | PostgreSQL. Strip minimum-purpose provider payload after terminal acceptance; keep structured result/transcript when useful until deletion; terminal job metadata 90 days | Export retained transcript/evaluation, not vendor internals. Delete local/server/provider copies |
| Raw learner audio | Productive Evaluation; one speech job/escalation | H; purpose-bound ephemeral byte, never evidence authority | Memory/temporary IndexedDB then private R2 opaque object. Delete immediately after finalization; pending hard ceiling 7 days. Never in general logs or backups | Export only if still present during current flow; deletion task removes all copies. No permanent history at launch |
| Content family/revision/form/rubric and approved reusable bytes | Content & Forms; learner-playable material and exact evidence lineage | L unless learner-specific repair text; immutable revisions, mutable eligibility/rights state | Metadata in PostgreSQL; bytes in private R2 or application bundle. Metadata retained while referenced; bytes while rights/role permit. Unique non-regenerable approved assets require second recoverable copy | Learner export references stable ID/description; includes learner-authored/adaptive text only if permitted. Restricted content bytes are excluded; takedown deletes/blocks bytes while minimal audit lineage remains |
| Corpus bundle/intelligence/rights metadata | Corpus Publication ACL; offline import and compatibility | L but rights-sensitive; immutable bundle, mutable active/last-compatible/quarantine pointers | PostgreSQL metadata/approved payload; large eligible bytes R2. Keep active, last-compatible, and any version referenced by evidence; never store raw Corpus sources merely for convenience | Not learner personal export; only evidence-facing identifier/description. Rights withdrawal preserves non-redistributable audit metadata and removes prohibited bytes |
| Idempotency keys, accepted sequence, corrections, deletion orchestration | Owning context / Operations; exactly-once effects and audit | M; append/state machine | PostgreSQL. Idempotency and terminal operation metadata 90 days or longer producer retry horizon; deletion journal as §10 | Export only learner-understandable request/status. Delete or de-link after orchestration and bounded backup window |
| Operational logs, incidents, metrics and cost | Operations & Governance; safety/operability | L/M only if pseudonymous reference needed; never payload authority | Structured logs/metrics outside learner DB only when selected later; 30-day raw operational default, longer aggregate only irreversibly de-linked. No session replay/full response/audio | Not ordinary learner export unless it is needed to explain their operation. Purge learner link on deletion; retain de-linked aggregate counts |
| Database/object manifests and backups | Operations & Governance; disaster recovery | H/M aggregate; immutable encrypted recovery material | Provider PITR per plan; off-Render logical backups 14 daily + 12 weekly. Raw audio excluded. Asset manifests/checksums retained with backup generation | Never ordinary export. Inaccessible except restore role; deletion journal prevents resurrection; containing generations expire by 84 days, plus 7-day verification margin |

Rights status is independent of authenticity/confidence and learner evidence validity. A rights-only takedown blocks serving/exporting bytes but does not rewrite the learner's historical performance; a correctness/fairness defect appends a scoped evidence correction.

## 5. Persistence map and conceptual data model

### 5.1 Physical persistence responsibilities

| Need | Selected persistence | Boundary and reason |
|---|---|---|
| Authoritative server facts, mutable workflows, projections, compatibility metadata | Managed PostgreSQL 18 via Kysely | Relational constraints, transactions, visible SQL, portable logical backup. Normalize stable relational fields; use JSONB only for bounded, validated, versioned foreign/domain envelopes whose shape genuinely varies |
| Durable async jobs | pg-boss in the same PostgreSQL database | Fact + job can commit atomically. Queue state is operational, not learner evidence; handlers remain idempotent |
| Approved media, exact reusable assets, transient raw audio, encrypted logical-backup archives | Private R2 Standard EU-jurisdiction object store through App S3 port | Bytes only. PostgreSQL owns checksum, lifecycle, rights, association and current usability. Keys are immutable/opaque; replacement creates a new object/version |
| Unacknowledged edits, offline outbox, checkpoints, local projections/content manifest | IndexedDB | Structured origin-scoped recovery across reload. It is not a hidden second evidence ledger after server acknowledgment and is subject to user/browser clearing |
| Versioned static shell/approved cacheable response bytes | Browser Cache Storage/HTTP cache | Rebuildable, rights/version gated; never learner truth. Cache key includes content/contract revision and is purged/ignored after withdrawal |
| Very short-lived capture/derived view | Process/browser memory | No durability promise; raw microphone segments should stay here when upload can complete safely |
| Analytics warehouse, time-series DB, search/vector DB, Redis, document DB | None at launch | Structured PostgreSQL aggregates/indexes and provider-neutral logs are sufficient. Add only for a measured query, isolation or retention need with its own ADR |

R2 consistency does not permit semantic last-writer-wins. Upload uses `reserved → uploaded → checksum_verified → eligible` metadata. A retry either proves the same checksum at the immutable key or creates a new key; no client overwrites an eligible object.

### 5.2 Conceptual ER/data map

~~~mermaid
erDiagram
  LEARNER_SCOPE ||--o{ PROFILE_FACT : owns
  LEARNER_SCOPE ||--o{ SESSION : starts
  SESSION ||--o{ ATTEMPT : contains
  ATTEMPT ||--o{ CHECKPOINT : advances
  ATTEMPT ||--|| CONTENT_REVISION : serves
  CONTENT_FAMILY ||--o{ CONTENT_REVISION : versions
  CONTENT_REVISION ||--o{ OBJECT_MANIFEST : references
  ATTEMPT ||--o{ RESPONSE_FACT : records
  ATTEMPT ||--o{ EVIDENCE_OBSERVATION : supports
  EVIDENCE_OBSERVATION ||--o{ CORRECTION : receives
  EVIDENCE_OBSERVATION }o--|| INDEPENDENT_OCCASION : belongs_to
  LEARNER_SCOPE ||--o{ PROJECTION_GENERATION : derives
  PROJECTION_GENERATION }o--o{ EVIDENCE_OBSERVATION : source_cut
  LEARNER_SCOPE ||--o{ WEAKNESS_REVIEW_FACT : owns
  LEARNER_SCOPE ||--o{ READINESS_SNAPSHOT : owns
  ATTEMPT ||--o| EVALUATION_JOB : may_require
  EVALUATION_JOB ||--o{ EVALUATION_CANDIDATE : yields
  EVALUATION_JOB ||--o| OBJECT_MANIFEST : temporary_audio
  CORPUS_BUNDLE ||--o{ CONTENT_REVISION : informs
  LEARNER_SCOPE ||--o{ DATA_RIGHTS_OPERATION : requests
  DATA_RIGHTS_OPERATION ||--o{ DELETION_TASK : orchestrates
~~~

Content family, form, revision and independent occasion are not aliases:

- `content_family_id` groups genuinely equivalent material for exposure/freshness and cannot be changed cosmetically to manufacture independence;
- `content_revision_id` identifies exact served text/media/rubric/version and is immutable;
- `form_id` identifies a controlled mock/section composition;
- `independent_occasion_id` groups correlated attempts/retries in one session/day/repair chain according to Stage 06 rules;
- `episode_id` groups a mistake/repair chain; repeated errors/retries within it do not become independent evidence.

## 6. Identifiers, time, ordering, and clock semantics

### 6.1 Identifier contract

- Use opaque 128-bit UUIDs for learner scope, device installation, command/idempotency operation, session, attempt, checkpoint, response, evidence, correction, independent occasion, projection generation, content family/revision/form, job, object manifest and data-rights operation.
- Prefer UUIDv7 for new facts because PostgreSQL 18 supports it and ordered inserts are useful. A conforming browser-generated ID is allowed for offline work. UUIDv4 remains accepted at imports/adapters. Exact generator/library is Stage 12/21 implementation work.
- UUID timestamp bits are not authority. Clock skew does not reorder facts, prove occurrence time or establish independence.
- External Corpus/provider/identity IDs are stored with namespace and version beside an App ID; they are never App primary keys.
- Guest→account attachment adds a scope-link fact. It never rewrites fact IDs, attempt IDs or evidence lineage. Duplicate scope merge is an explicit Stage 20 operation, not a database cascade or last-write-wins merge.
- Idempotency is `(learner_scope_id, operation_id, command_kind)` uniqueness. A repeated identical payload returns the committed result; a different payload under the same key is a conflict and writes no second fact.

### 6.2 Clock fields

| Field | Meaning / authority |
|---|---|
| `occurred_at` | Client-observed UTC instant for learner action. Retained with `clock_quality`; useful for history but not sole authority for target timing or ordering |
| `recorded_at` | Server transaction timestamp when accepted; authoritative for retention, operational latency and accepted history |
| `learner_sequence` | Monotonic sequence allocated within learner scope at commit; authoritative deterministic order for competing accepted facts/corrections. Global order is unnecessary |
| `monotonic_elapsed_ms` | Device monotonic elapsed duration within one attempt plus checkpoints; protects timers from wall-clock changes. Reload reconstructs from trusted anchors; uncertainty narrows the evidence claim |
| `effective_at` | When a correction, policy, right or blueprint is intended to affect interpretation; never backdates away the correction's `recorded_at` |
| `computed_at` / `source_cut` | Projection time and exact maximum accepted sequence plus rule/content/evaluator versions used |
| `local_date`, `time_zone`, `utc_offset` | Learner-facing schedule context captured as IANA time-zone identifier and contemporaneous offset; changing zone affects future scheduling, never old occurrence truth |

Server and client compare UTC instants; scheduling resolves from IANA zone and explicitly handles daylight-saving gaps/overlaps in Stage 22. Database/server wall clock governs retention and job lease. Client monotonic time governs continuous attempt elapsed time where valid. If anchors disagree materially or cannot be recovered, preserve work and mark only affected timing/continuous-condition scope interrupted/modified; never guess extra target time.

## 7. Transaction, consistency, and concurrency contracts

### 7.1 Transaction table

| Use case | Atomic boundary / isolation | Concurrency and idempotency | Failure behavior |
|---|---|---|---|
| Update goal/preference/workflow | One PostgreSQL transaction; Read Committed with expected aggregate version | Optimistic `expected_version`; append consequential change fact and update current pointer | Conflict returns current version and typed resolution; never silently prefer latest/highest value |
| Checkpoint an attempt | One transaction per accepted checkpoint; mutable latest checkpoint plus immutable submission/navigation markers | Unique operation ID; monotonically increasing checkpoint version; stale checkpoint cannot replace newer | Browser keeps local outbox until ack. Retry returns same accepted checkpoint; save failure is visible |
| Finalize objective attempt | Lock affected attempt; validate expected version/content eligibility; commit terminal response/condition facts, evidence input and pg-boss projection/recompute job together | Unique completion operation and terminal-state constraint; response checksum detects changed retry | Acknowledgment only after commit. Failure leaves attempt retryable; no duplicate evidence |
| Submit productive work | Commit retained response/attempt facts, `pending` observation/job and pg-boss work together after any required object is checksum-verified | Job/request ID and attempt terminal transition unique; external call occurs after commit | Worker outage keeps truthful Pending. Object not verified means submission remains locally recoverable/not acknowledged |
| Accept evaluator result | Validate job/contract/evaluator/rubric; lock job; append candidate acceptance/rejection and affected evidence/correction; enqueue recompute in one transaction | Unique `(job_id, provider_result_id)` and terminal effect; late/duplicate result is audited but cannot apply twice | Unknown version/quarantine/timeout leaves dependent state Pending or rejected; unaffected work continues |
| Activate Corpus/content bundle | Import immutable records and checksums outside active pointer, validate completely, then atomically switch compatible active/last-compatible pointers | Bundle/version uniqueness; readers pin revision at attempt start | Partial import is invisible. Failed activation keeps last compatible. Historical attempt references never retarget |
| Recompute projections | Read immutable facts at a named source cut; write a new generation; validate invariants; atomically switch current-generation pointer | At most one active rebuild per kind/scope; later source cut supersedes, not overwrites | Old valid generation remains visible with stale/rebuilding state. Failure creates operator incident, not learner failure |
| Export | Repeatable Read snapshot anchored to learner sequence and object manifest | One export operation ID; concurrent later writes are outside the declared `as_of` cut | Partial artifact is never published; restricted assets omitted with references/reasons |
| Delete learner data | First transaction changes scope to `deletion_in_progress`, revokes auth/capabilities and emits owner/object/provider tasks | Repeated request resumes same operation. New writes are rejected after tombstone | Live rows/objects/providers are removed asynchronously; status names incomplete scopes; completion waits for live stores, while backup residual is disclosed/bounded |
| Upload/delete R2 object | Not a distributed transaction: PostgreSQL manifest state machine surrounds immutable object operation and checksum/readback | Unique object ID/key; conditional same-checksum retry; no semantic same-key overwrite | Sweeper deletes orphan upload, retries deletion, or marks referenced byte unavailable. Presence alone never makes content/evidence valid |

Read Committed plus constraints is the normal choice. Repeatable Read is used for coherent export/rebuild snapshots. Serializable is reserved for a proven cross-row invariant and retries a bounded number of times with the same idempotency key; it is not applied globally. PostgreSQL constraints express required ownership, foreign-key, terminal-state and uniqueness rules. Application validation supplies cross-record semantic rules that cannot safely be encoded as a row-local check.

### 7.2 Facts, corrections, and projections

Explanatory pseudotypes:

~~~text
FactEnvelope = fact_id + learner_scope_id + owner_context + fact_kind + schema_version
             + operation_id + occurred_at + recorded_at + learner_sequence
             + content/evaluator/blueprint/taxonomy lineage + payload_hash + payload

Correction = correction_id + target_fact_id + affected_scope + reason_code
           + asserted_by_owner + effective_at + recorded_at
           + supersedes_correction_id? + requested_projection_kinds

ProjectionGeneration = projection_id + learner_scope_id + projection_kind
                     + source_cut + rules_version + calibration_version
                     + state + reasons + computed_at + checksum
~~~

“Append-only” is semantic, not permission to retain deleted personal data forever. Until learner deletion, accepted observation payload/history is not edited in place; errors create corrections. A deletion request removes the learner's fact history from live and expiring backup stores under §10. A rights takedown may remove bytes while retaining the least metadata needed to explain historical lineage.

## 8. Schema evolution, compatibility, correction, and rebuild

### 8.1 Version axes

| Axis | Rule |
|---|---|
| Physical PostgreSQL schema | Monotonic migration ID/checksum in version control; one migration runner; CI from empty DB and supported upgrade fixture. Schema version does not imply domain meaning |
| Fact/domain envelope | Each immutable fact has `schema_version`. Additive compatible fields use defaults/absence semantics; incompatible meaning creates a new major/kind plus adapter, never reinterpretation |
| API/job/client contract | Explicit contract major/minor. Additive minor is preferred. Stale incompatible browser receives `upgrade_required` and preserves local outbox/checkpoint; worker rejects/quarantines unknown major |
| Content/form/media/Corpus/target/taxonomy | Immutable referenced IDs/versions; active pointer changes do not retarget history. Material changes generate affected-scope correction/revalidation |
| Rules/calibration/projection | Independent accepted release with provenance, effective date, validation and rollback. Recompute creates new generation from unchanged facts |
| Evaluator/model/prompt/rubric | Candidate carries full release lineage and supported dimensions. Unknown/incompatible result cannot become evidence |

### 8.2 Expand/contract flow

~~~mermaid
flowchart TD
  A[Migration + compatibility plan reviewed] --> B[Verify backup and restore point]
  B --> C[Expand: additive columns/tables/indexes, old behavior still valid]
  C --> D[Deploy readers/writers that tolerate old and new]
  D --> E[Backfill in bounded batches with checksums and resume cursor]
  E --> F{Row counts, invariants, replay and old-client/job fixtures pass?}
  F -- no --> G[Stop switch; roll forward repair or restore isolated copy]
  G --> E
  F -- yes --> H[Switch canonical read/write and projection generation]
  H --> I[Observe one rollback/deploy window]
  I --> J[Contract obsolete representation in later migration]
~~~

Destructive contraction never shares a release with the first new writer. Schema rollback means application rollback while expanded data remains, or a new forward migration; production does not rely on unsafe down migrations. Backfills are idempotent, throttled and resumable, and do not emit learner events or change `occurred_at`.

### 8.3 Historical correction flow

~~~mermaid
sequenceDiagram
  participant R as Report/validation
  participant O as Authoritative owner
  participant L as Evidence ledger
  participant P as Projection owners
  participant U as Learner/operator view
  R->>O: defect/rights/evaluator/blueprint finding + exact version/scope
  O->>O: validate and append correction/quarantine
  O->>L: owner command with affected IDs and effective_at
  L->>L: append scoped correction; retain prior fact and before-state
  L-->>P: recompute request at corrected source cut
  P->>P: build shadow generations and validate invariants
  P-->>U: atomically publish current state + before/after reason
  Note over O,U: rights-only removal blocks bytes; correctness/fairness changes only affected evidence
~~~

Correction discovery is by exact content revision, family, form, evaluator/rubric, blueprint/taxonomy and source fact indexes. A correction cannot mutate unaffected scope or turn a system/content fault into learner failure. Material readiness history records both the historical conclusion under its then-current inputs and the corrected/current conclusion.

## 9. Failure, corruption, retry, and restoration behavior

| Failure | Detection / containment | Recovery and learner truth |
|---|---|---|
| Partial DB command/request retry | Transaction rollback, operation uniqueness, payload hash | No acknowledgment before commit; exact retry returns committed result; conflicting reuse is rejected |
| Constraint/invariant violation | Named constraint, boundary validation, periodic invariant query | Quarantine command/input; do not “repair” by weakening constraints; operator reviews exact scope |
| Projection corruption/code defect | Source-cut/checksum mismatch, golden replay, shadow-generation comparison | Keep last valid generation as stale/rebuilding, rebuild from facts, atomically switch only after validation |
| Content/evaluator defect | Version-indexed incident and affected-scope query | Quarantine version, append correction, targeted recompute; unaffected evidence remains |
| Missing/corrupt approved R2 object | Manifest checksum/read probe, failed preflight | Block affected content/media, restore/recreate from rights-approved second copy, or offer narrower cached activity; no negative evidence |
| Missing/raw-audio object | Pending job and deletion/object lifecycle reconciliation | Retry only within purpose/7-day ceiling. If unavailable, preserve transcript/structured result if responsible or mark affected evaluation unresolved/invalid; never infer poor speaking |
| Orphan object/manifest | Reconciliation scan compares nonterminal manifest and R2 key | Delete unreferenced byte after safety window; retry/complete verified referenced upload; object list is not authority |
| Worker crash/duplicate/late result | pg-boss state plus application idempotency/terminal constraint | Retry bounded job; apply semantic effect once; dead-letter/late result remains operator-visible, dependent evidence Pending |
| PostgreSQL logical corruption/accidental change | Invariant alert, backup/restore drill, PITR point | Restore into isolated new instance, validate, replay deletion journal and migrations, reconcile objects/jobs, then switch; never edit the only production copy in place |
| Provider/region loss | Health/connection failure and off-provider backup inventory | Restore most recent verified logical backup to portable PostgreSQL, replay recoverable local outboxes idempotently, declare any real data gap; no invented evidence |
| Browser storage eviction/cleared guest token | Capability/IndexedDB missing | Server facts remain but an unlinked learner may lose access; explain this risk before it surprises them. Account link/recovery is optional Stage 20 capability |

### 9.1 Restore gate

A restored database is never served immediately. Stage 26's runbook must:

1. create an isolated PostgreSQL 18 recovery instance and verify backup archive signature/checksum and migration manifest;
2. restore, then apply only reviewed forward migrations required by the target application;
3. replay all deletion-journal entries recorded after the backup cut before any learner/operator access;
4. run referential, uniqueness, terminal-state, source-cut, no-pass-probability, independent Written/Oral and correction-scope invariants;
5. reconcile content/object manifests and rights state, treating missing bytes as unavailable rather than valid;
6. reconcile pg-boss jobs against terminal domain effects so no evaluation/evidence is applied twice;
7. test a representative export, correction/rebuild and guest/account authorization fixture;
8. record achieved RPO/RTO and approval, then switch traffic; retain the former database only within the rollback and deletion policy.

Quarterly drills prove both Render PITR and off-Render logical restore on rotation. A backup that has not passed a restore drill is not counted as verified recovery evidence.

## 10. Backup, retention, export, and deletion

### 10.1 Recovery generations

| Material | Backup/recovery rule | Retention / objective |
|---|---|---|
| PostgreSQL live store | Paid Render PITR enabled and monitored | Current official provider window: 3 days Hobby or 7 days Pro+; recheck at provisioning. It is near-term rollback, not provider exit |
| Portable database backup | Nightly `pg_dump`-compatible logical archive, encrypted before upload outside Render, with schema/migration manifest and checksum. Runtime web/worker cannot decrypt it | 14 daily plus 12 weekly generations (maximum normal containing age 84 days). Provider-loss objective RPO ≤24 h, validated-service RTO ≤8 h |
| Pre-migration recovery point | Verified provider restore point plus portable archive before consequential migration | Keep until migration validation and at least the next two verified nightly generations; never longer than the 84-day backup ceiling without recorded incident hold/legal review |
| Approved unique media/content | Manifest/checksum in PostgreSQL; a non-regenerable, rights-eligible P4/gold asset has a tested second recoverable copy outside the active R2 failure domain | While any approved role/evidence reference requires it and rights permit. Retired bytes may be removed only when no required lineage/replay use remains |
| Raw audio | Deliberately excluded from database and media backups | Delete after finalization; pending maximum 7 days. Recovery accepts its absence |
| Local outbox/checkpoint | Device recovery until server ack plus short safety window | Unacknowledged until completed/abandoned; acked 24 h; abandoned draft 30 days; raw audio ≤7 days |

Backup archives are application-encrypted with a recovery-only key; media/runtime credentials cannot decrypt them. The baseline may use a backup-only opaque R2 namespace because it is off Render, but Stage 26 must prove least privilege, key recovery and provider-exit copy. If bucket-level permissions cannot isolate deletion from runtime credentials, move backups to a separate private EU bucket/account without changing application semantics.

### 10.2 Deletion end to end

~~~mermaid
stateDiagram-v2
  [*] --> Requested
  Requested --> AccessRevoked: atomic scope tombstone
  AccessRevoked --> LiveDeletion: owner tasks + provider/object tasks
  LiveDeletion --> Retryable: a target failed
  Retryable --> LiveDeletion: idempotent retry
  LiveDeletion --> LiveComplete: all live/local-reachable/provider targets evidenced
  LiveComplete --> BackupExpiry: journal suppresses restore
  BackupExpiry --> Complete: every containing generation expired + verification margin
  Complete --> [*]
~~~

- `AccessRevoked` prevents new use immediately. Each Stage 04 owner deletes learner-linked facts/projections in dependency-safe order; object/provider adapters return per-target evidence. No cascade is accepted without an inventory test proving scope.
- A restricted deletion journal contains operation ID, opaque learner scope reference, backup cutoff and target receipts. It is unavailable to product analytics and is replayed against any restored copy before serving.
- Normal backup generations that may contain the scope expire within 84 days. Linkable deletion-journal material is retained through that window plus a seven-day verification margin—**91 days maximum**—then destroyed. A non-linkable receipt/status/count may remain. Legal hold or statutory retention is not invented; any future exception requires Stage 23/legal authorization, learner-facing explanation and a superseding retention record.
- Completion language distinguishes `live data removed` from `backup expiry complete`. Old encrypted backups are inaccessible for ordinary operation and never selectively read to recover a deleted learner.
- Export is generated at a declared `as_of` source cut, is human-readable plus structured, contains product versions/explanations, and excludes restricted Corpus/reference bytes. Temporary export artifacts use short-lived authorization and are deleted within 24 hours; learner data in the source remains until separately deleted.

## 11. Security, privacy, rights, and accessibility implications

- Transport to PostgreSQL/R2/provider uses authenticated encryption; selected providers' at-rest encryption and key/region settings must be evidenced in Stage 23/26 before learner data. Off-provider backups are additionally encrypted before upload. Secrets and raw recovery tokens never enter learner tables, logs or backups in plaintext.
- Web and worker use separate least-privilege database/object credentials. The web cannot read backup archives; content serving cannot list raw audio; worker access is limited to the job/object purpose and expires. Operator correction/deletion uses owner commands with audit, not arbitrary table edits.
- Signed object access is short-lived, bearer-sensitive and restricted to one opaque object/purpose. A private bucket, checksum and PostgreSQL authorization are required; cache/public URL presence never grants learner access.
- External evaluator payloads contain only the response/task/rubric context needed for the job and pseudonymous correlation. General analytics/logging receive no raw response/audio. Provider retention/training/deletion terms are Stage 19/23 admission gates.
- Persist only learner-declared access/equipment/explanation preferences and the actual condition relevant to an attempt. Do not infer or store a disability, diagnosis or demographic proxy. Fine-grained accommodation information is exposed only to the evidence/attempt path that needs it.
- Local browser storage is readable to the browser profile and can be cleared/evicted; sensitive payload is minimized, UI provides explicit clear/delete, and shared-device risk is disclosed. Application-level local encryption is not claimed to protect against an already-unlocked compromised browser profile.
- Rights eligibility controls bytes and export separately from evidence correctness. Restricted Corpus sources never enter routine App storage. When exact content must remain referenceable for audit but bytes can no longer be kept, retain stable ID, checksum, version and non-redistributable description only.
- No legal compliance claim is made. Stage 23 and jurisdiction-specific counsel must review controller/processor terms, regional processing, deletion/backup wording, any field-level encryption need and any future public-product retention duty.

## 12. Operations, performance, reliability, and cost

### 12.1 Integrity and operational evidence

Measure and gate:

- accepted commands versus unique operation IDs, duplicate/conflicting retry counts and transaction conflict/serialization retry rate;
- checkpoint acknowledgment age and the Stage 01 ≤5-second Writing recovery fixture;
- nonterminal R2 object manifests, checksum mismatch, raw-audio age and deletion-task age (hard alert before seven days);
- projection source-cut lag, rebuild duration, checksum/golden-fixture divergence and corrected versus unaffected counts;
- migration duration/lock impact, backfill resume evidence and old client/job compatibility fixtures;
- backup age, archive checksum, restore-drill RPO/RTO, deletion-journal replay and object reconciliation;
- database bytes by data class/index, R2 GB-month/Class A/Class B, backup bytes, log bytes and cost per active learner/useful productive evidence unit.

Sampling cannot substitute for hard invariants on duplicate evidence, raw-audio ceiling, no probability, independent Written/Oral gates or deletion targets. Stage 25 owns executable gates; Stage 24 owns monitoring/alert calibration; Stage 26 owns runbooks and release evidence.

### 12.2 Cost and exit

Stage 05 adds no database, queue, document store, warehouse or time-series service. It preserves Stage 03's current approximate paid baseline of USD 20/month plus PostgreSQL storage, R2 overage, tax and later processors—comparison only, not a budget. Primary growth drivers are retained Writing/evidence rows and indexes, transient productive payloads/jobs, logical-backup generations, approved media bytes, object operations and restore/maintenance time. Raw-audio ephemerality and pruning rebuildable/transient payloads constrain both cost and privacy.

| Trigger | Response / cheaper fallback | Exit path |
|---|---|---|
| Forecast reaches 70% of provisioned PostgreSQL storage within 30 days, backup growth exceeds plan, or query/restore SLO misses due to data volume | Remove duplicate payload/log retention, prune superseded rebuildable generations, optimize/index/partition only measured paths, then resize. Never discard authoritative evidence/Writing/Readiness history | Standard SQL/Kysely and logical export restore to another managed PostgreSQL; no generated ORM/provider schema |
| Job tables or rebuilds measurably harm learner transactions for 7 days after ordinary tuning | Shorten operational payload retention, batch/scoped rebuild, isolate worker connections; only then move queue/read workload behind a port | pg-boss job contracts/idempotency survive migration to managed queue; PostgreSQL facts remain authority |
| R2 exceeds free allowance for 3 months, object cost exceeds 25% of monthly infrastructure, or SLO/terms/region fail | Stop persistent raw audio, bundle small rights-approved assets, reduce redundant reads, preserve only rights-required bytes | Enumerate PostgreSQL manifests/checksums and copy via tested S3 subset to S3/B2/MinIO; bounded dual-write and checksum reconciliation before cutover |
| Any backup is older than 24 h, quarterly restore exceeds 8 h, deletion replay fails, or an actual recovery loses more than the objective | Block risky release; repair schedule/key/runbook; increase backup frequency or add justified continuous/off-provider mechanism before adding multi-region | Portable `pg_dump` archive, manifest and restore fixtures; provider PITR is replaceable |
| Browser quota/eviction prevents the ≤5-second Writing recovery fixture | Reduce cached content first, compact checkpoints while retaining latest/durable boundaries, warn/block only clean measured start if persistence inadequate | IndexedDB contract can move to another browser persistence mechanism; server remains accepted truth |

Provider substitution must preserve opaque IDs, version/correction history, deletion journal behavior, raw-audio ceiling, rights blocks, checksums, exact export and restore evidence. A provider feature is rejected if it prevents a tested exit.

## 13. Relationships, dependencies, risks, and validation

### 13.1 Downstream rules to preserve

- **Stages 06–12:** define envelopes and APIs against append-oriented facts, correction records, immutable content lineage, per-learner accepted sequence, idempotency and rebuildable source-cut projections. No feature-local evidence write or hidden pass probability.
- **Stages 16–19:** PostgreSQL owns object/job lifecycle; R2 holds bytes only; raw audio is excluded from backups and deleted after finalization or within seven days; provider result is a candidate until App acceptance.
- **Stage 20:** account-free guest scope is not cross-device identity; guest→account link does not rewrite facts. Export/delete inventories include every owner, local reachable copy, provider and backup residual status.
- **Stages 21–22:** IndexedDB outbox/checkpoints, monotonic attempt time and IANA time-zone/offset snapshots preserve offline/timing truth; retry cannot duplicate evidence.
- **Stages 23–24:** enforce encryption/access/rights/deletion and measure retention, rebuild, backup, object and cost behavior without collecting disability/demographic/session-replay data.
- **Stages 26–28:** migrations and restore are gated releases; provision only verified paid durable PostgreSQL, private EU object storage and encrypted off-provider backup; final audit checks every data class/owner/retention path.

### 13.2 Dependencies introduced or removed

Introduced architectural dependencies: PostgreSQL UUID/constraint/transaction capability; Kysely migration lock; pg-boss same-database transaction; IndexedDB and Cache Storage capability detection; R2 S3 subset/checksum/lifecycle; encrypted off-Render logical-backup target and recovery key. No new production service or package is selected. Removed: any need for a document DB, Redis, analytics warehouse/time-series store, live Corpus storage/search, public object bucket or durable raw-audio archive.

### 13.3 Risks and validation evidence

| Risk/assumption | Required evidence and owner |
|---|---|
| Guest capability loss strands otherwise retained anonymous server facts | Stage 20 usability/privacy test, clear warning, delete/link/recovery fixture; Stage 23 threat model |
| Per-learner sequence/aggregate locks contend under sync/rebuild | Stage 12/24 load test with concurrent devices/worker; change lock granularity only if measured |
| IndexedDB availability/quota differs by browser/private mode | Stage 14/21 capability and crash/eviction matrix; block only affected clean measured path |
| UUIDv7 generator interoperability or clock skew | Stage 12 contract/property tests across client/server; fall back to UUIDv4 without semantic change |
| Correction query misses affected evidence | Stage 06/09/11 version-indexed fixtures proving 100% affected, zero unaffected and reproducible before/after |
| Backup exists but cannot restore or resurrects deletion | Stage 25/26 quarterly isolated restore, deletion-journal replay and job/object reconciliation evidence |
| R2 object/metadata drift or incomplete S3 compatibility | Stage 09/16/18/25 checksum, orphan, immutable-key, signed-access and provider-copy contract tests |
| Provider encryption/retention/region assumptions change | Stage 23/26 provisioning evidence and scheduled primary-source recheck; substitute or narrow capability on failure |
| 14-daily/12-weekly backup retention is insufficient or too costly | Stage 24 storage/incident and restore-point analysis; version retention through a superseding decision without weakening deletion truth |

### 13.4 Intentional implementation deferrals

| Deferred choice | Named owner / fixed boundary |
|---|---|
| Exact table/column/index/partition layout and evidence envelope fields | Stage 06/12; must preserve this ownership, identifier, correction and source-cut contract |
| Guest token/auth provider, account linking, merge/conflict UX | Stage 20; no account wall, ID rewrite or last-write-wins evidence |
| Checkpoint compaction, offline outbox protocol and timer anchor algorithm | Stage 21; ≤5-second Writing loss, monotonic timing and idempotent sync remain fixed |
| Exact raw-audio object TTL sweeper/provider deletion proof | Stages 18/23; delete after finalization and never exceed seven days |
| Field-level encryption/KMS, provider processor terms, legal retention language | Stage 23 plus jurisdiction-specific legal review; provider encryption and backup application encryption are minimum baseline |
| Backup scheduler, key custody, R2 backup namespace versus separate bucket/account, restore automation | Stage 26; 14 daily/12 weekly, quarterly drill, RPO/RTO and runtime credential isolation remain fixed |
| Concrete alert thresholds below architecture hard limits and spend approval | Stages 24/26/owner; no invented euro budget |

There is no unresolved owner question for Stage 05.

## 14. ADRs created or amended

- Created `Architecture/adr/ADR-0012-append-oriented-relational-truth-and-bounded-persistence.md`, **Accepted**, for `ARCH-S05-D01`–`D10`.
- Updated the ADR index only. ADR-0001/0007/0008/0009/0010/0011 remain Accepted and are refined, not superseded.

## 15. Decisions made and handoff

1. PostgreSQL is authoritative for accepted server facts, workflow state, projections, metadata and jobs; R2 stores bytes only; IndexedDB stores unacknowledged local recovery/cache.
2. Data authority follows the 11 Stage 04 owners. Facts/corrections are append-oriented; mutable workflow state is versioned; projections are reproducible generations with source cuts.
3. Opaque UUIDs, immutable content revision/family/form/occasion identities, explicit client/server/monotonic clocks, IANA zone snapshots and per-learner accepted sequence remove hidden ordering assumptions.
4. Constraints, idempotency and scoped optimistic concurrency are default; fact+job is atomic; PostgreSQL↔R2 uses a reconciled state machine.
5. Physical, fact, API/job, content/target/taxonomy, evaluator and rules/calibration versions evolve independently through expand/backfill/switch/contract and forward repair.
6. Historical correction appends exact affected scope and rebuilds projections without modifying unaffected evidence or blaming the learner.
7. Backup combines plan-dependent Render PITR with encrypted nightly off-Render logical archives retained 14 daily/12 weekly; quarterly restore, deletion replay and object/job reconciliation are required.
8. Live delete revokes access first, removes all live/provider/local-reachable copies, prevents restore resurrection and reaches backup expiry within a 91-day maximum journal window. Raw audio is never backed up and remains ≤7 days pending.
9. Anonymous first use uses an opaque guest server scope without an account; local state is write-ahead recovery, and later account attachment preserves IDs/evidence.
10. The launch architecture adds no warehouse, document store, time-series platform, Redis or durable media archive; measured triggers control scaling/provider exit.

## 16. Definition-of-done check

- [x] Required inputs and current repository/blob references are recorded; Stages 01–04 continuity is preserved.
- [x] Authority/Stage 27 precedence and design reconciliation are explicit; shaping/design sources were not modified.
- [x] Data is classified by owner, purpose, sensitivity, authority, mutability, retention, export and deletion.
- [x] Relational/blob/local/cache/job persistence is selected without a premature warehouse/time-series/document platform.
- [x] Stable identifiers, family/occasion identity, locale/time zone, timestamps, ordering and clock semantics are defined.
- [x] Transaction, consistency, concurrency, idempotency, cross-store and append/correction/projection behavior is defined.
- [x] Migration, compatibility, schema versioning, correction, backup/restore and integrity validation are defined.
- [x] Guest/local, synchronized server, Corpus/content cache, raw media and derived projection classes are separated.
- [x] Required ownership matrix, conceptual ER map, transaction table, schema/correction flows, backup/retention summary and alternatives/ADR exist.
- [x] Cost, security/privacy/rights, accessibility, corruption/retry/recovery, operations and provider exits are addressed with current official sources.
- [x] Dependencies, downstream preservation rules, risks/tests, cost triggers, fallbacks and named deferrals are complete.
- [x] No production code, DDL, migration, storage resource or later-stage architecture output was created.

**Stage 05 result:** complete with no owner blocker. The next eligible stage is Stage 06; it must not reinterpret this handoff.
