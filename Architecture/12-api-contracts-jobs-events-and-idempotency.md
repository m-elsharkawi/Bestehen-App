# Bestehen / App — API Contracts, Jobs, Events, and Idempotency

> **Stage:** 12 of 28  
> **Status:** Accepted architecture decision and implementation handoff  
> **Decision owner:** Platform contracts and asynchronous execution  
> **Baseline:** `m-elsharkawi/Bestehen-App@1de26aa8250746025f36b4188c0198fa43d89bb2`; `m-elsharkawi/Bestehen-Shaping@9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc`  
> **Scope:** Logical HTTP, command/query, job, event, idempotency, and concurrency contracts; no production endpoint, schema, queue, provider, or application code

## 1. Purpose and scope

This stage defines how the responsive web client, the modular server, the worker, bounded external processors, and the asynchronous Corpus publication boundary exchange facts without allowing transport behavior to rewrite learner truth. It selects the smallest contract surface that preserves accepted ownership: one same-origin JSON/HTTP API, explicit commands and queries, PostgreSQL-backed durable work, and a transactional outbox/inbox only for asynchronous consequences that must survive process failure.

The contract makes `Pending`, partial validity, absence, conflict, capability limitation, rights limitation, and retryability explicit. A timeout, duplicate, stale tab, evaluator fault, media fault, or callback arriving late cannot become a wrong answer, a weakness, a zero, a readiness regression, or a duplicate evidence episode. Written and Oral remain independent. No API field, event, job, log, or example represents pass probability.

This stage does not choose route/component implementation, validation/code-generation libraries, identity mechanisms, model/media vendors, notification providers, or numerical SLO alert thresholds not already shaped. Stages 13–26 own those choices while preserving the semantic contracts here.

## 2. Inputs, authority, and continuity

### 2.1 Reproducible source snapshot

All required sources were read from GitHub `main` on 2026-08-23. The output did not rely on a local checkout.

| Repository / path | Blob SHA | Use |
|---|---|---|
| Bestehen-App `prompts/architecture/12_define_api_contracts_jobs_events_and_idempotency.txt` | `ec7252ca4c52c6bdd3c46cef0d0aba1df9c581c2` | Binding stage contract |
| Bestehen-Shaping `app/28-bestehen-app-product-specification.md` | `18ae80cc2fd63cecd76c297c3e56d44a68367856` | Highest product authority |
| Bestehen-Shaping `app/03-initial-diagnostic.md` | `038ab89b0be23464eedf1408111dd1936320f57a` | Resumable diagnostic and productive pending |
| Bestehen-Shaping `app/06-daily-coaching-engine.md` | `3cd869cd337dd3a878c27f35e1e8b5dad0c4c7bb` | Plan/session behavior and late evaluation |
| Bestehen-Shaping `app/07-core-learning-loop.md` | `c313c859f64997972feca87497d70476c4528a20` | Attempt, checkpoint, submission, repair semantics |
| Bestehen-Shaping `app/15-telc-readiness.md` | `b4456939928493569336bbc565d7e67307e7a3db` | Evidence eligibility and independent gates |
| Bestehen-Shaping `app/16-mock-exams.md` | `8f6c23fa16524bd251cef39d823cfeea73bfcef3` | Measured-block integrity and partial results |
| Bestehen-Shaping `app/17-ready-to-book-logic.md` | `9e3e8b24faefe885d5b10409725619d0d0d84e6d` | Reversible booking gate and pending blockers |
| Bestehen-Shaping `app/21-content-strategy.md` | `8149d6a268da70e17cad46f774b9d5de77776986` | Batch content, approval, freshness and correction |
| Bestehen-Shaping `app/22-user-controls-vs-coach-autonomy.md` | `27f33cd56a09df27952e15bb3dfd0e077b89633c` | Overrides, deliberate choice and immutable truth |
| Bestehen-Shaping `app/26-platform-accessibility-nonfunctional.md` | `8137091683941b0d55f3d4fb90af3c402b8371e5` | Latency classes, checkpointing and access behavior |
| Bestehen-Shaping `corpus/12-corpus-app-contract.md` | `7add217f62118e5abe100680d2e8230a93b8c280` | Asynchronous Corpus/App contract |
| Bestehen-Shaping `corpus/17-bestehen-corpus-product-specification.md` | `537b5185313097d043748f9dc9f9fdaf432ee71d` | Signed publication and data separation |
| Bestehen-App `Design/DESIGN-HANDOFF.md` | `417a6820037e045e2dd9f29afc42b9f2e94fd638` | §3 state, recovery and accessibility contract |
| Bestehen-App `Design/Bestehen-04-Flows-Handoff.dc.html` | `7120b05a2272c31e5896e4313a7007935f5d0aed` | Flows B–F |
| Bestehen-App `Architecture/00-architecture-shaping-plan.md` | `b263c5e7b3bccc0450ddd17aa0cc007432d672b7` | Routing and downstream owners |
| Bestehen-App `Bestehen_App_Architecture_Checklist.md` | `4633c13b88cda29968441e9c02cdad6aed86e30f` | 24 Stage-12 checks initially open |
| Bestehen-App `Architecture/03-technology-stack-and-repository-strategy.md` | `907b04c57813dc50f92a7ed00e49196ff7d4a924` | Same-origin Next.js/Node, PostgreSQL, pg-boss |
| Bestehen-App `Architecture/04-domain-model-and-bounded-contexts.md` | `ab1a775d7689e47bba00c2544c247ef344c44e70` | Single writers and context contracts |
| Bestehen-App `Architecture/05-data-ownership-persistence-and-schema-evolution.md` | `bb6df811ec9010de556d1719f22e31bb8ca3190e` | Transactions, local outbox, optimistic versions |
| Bestehen-App `Architecture/06-evidence-ledger-validity-versioning-and-audit.md` | `53d34ae65ef4c8fa79c00026f9bd5d7b876ce672` | Evidence envelope, five validity states, audit |
| Bestehen-App `Architecture/08-coaching-engine-and-session-state-machines.md` | `02c5e1ee5967bad976eda49ab4813a768eda5bd3` | Plan/session/attempt/evaluation identities |
| Bestehen-App `Architecture/09-content-exercise-form-and-media-architecture.md` | `e6fb121ab1b10c6cbcf692bc88acaf98f2e45e7a` | Serving manifest, exposure and content impacts |
| Bestehen-App `Architecture/10-corpus-integration-compatibility-cache-and-rights.md` | `d4e1ab25e359dcfcc506ee29462760a41647138d` | Signed bundles, atomic promotion and impacts |
| Bestehen-App `Architecture/11-readiness-scoring-mocks-and-ready-to-book.md` | `7c327cd770460b94107f2756e2b7d8f29c56b909` | Six client states and deterministic projections |

### 2.2 Authority reconciliation

No prerequisite is missing or contradicted. Stage 03 already selected the runtime and durable job mechanism; Stage 05 requires transactionally accepted facts and jobs; Stage 06 requires semantic idempotency and append-only correction; Stages 08–11 define the domain meanings that transport must carry. This stage specifies their shared boundary and does not replace them.

The sources use “event” for both a recorded domain fact and an asynchronous delivery signal. This document resolves the ambiguity without editing the sources: a **domain event** is an immutable owner fact; an **integration event** is a minimized, versioned delivery envelope derived from committed truth; an **internal job** is a command to perform work and is not evidence. Stage 27 precedence remains validity/fairness → direct evidence → independent Written/Oral risk → uncertainty → due repair/retention → progression/coverage → preference.

### 2.3 Current primary technical references

Accessed 2026-08-23:

- [OpenAPI 3.2.0](https://spec.openapis.org/oas/v3.2.0.html) is the current official specification. Bestehen deliberately publishes the launch description in the 3.1 feature family, currently 3.1.2, because it aligns with JSON Schema 2020-12 and must pass the selected implementation toolchain before a 3.2 upgrade.
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12) supplies the contract-validation dialect.
- [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) supplies machine-readable HTTP problem details; domain `pending` and partial success are not problems.
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) defines HTTP idempotency, validators, conditional requests, and `Retry-After` semantics.
- [PostgreSQL 18 concurrency control](https://www.postgresql.org/docs/current/mvcc.html) is the accepted transaction/concurrency substrate.
- [pg-boss job documentation](https://github.com/timgit/pg-boss/blob/master/docs/readme.md) explicitly warns that retries can process work more than once even with delivery guarantees; handlers remain semantically idempotent.
- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x03-introduction/) informs object/function/property authorization, resource consumption and sensitive-flow abuse controls. It is guidance, not a compliance claim.

## 3. Architecture decisions

| ID | Decision | Credible alternatives and rejection | Consequence / review trigger | ADR |
|---|---|---|---|---|
| `ARCH-S12-D01` | Use one same-origin, resource-oriented JSON/HTTP API with explicit command endpoints and query projections. No GraphQL, RPC framework, separate BFF, or client-side domain rules at launch. | A single ad-hoc server-action surface is simple but undocumented and hard to replay. GraphQL optimizes flexible reads but adds authorization/cache/error complexity. General RPC couples clients to procedures. Separate BFF duplicates a one-client boundary. | Ordinary HTTP and generated contracts are portable. Revisit only for measured multi-client shape pressure that cannot be solved with projections or for an independent security/deploy boundary. | ADR-0019 |
| `ARCH-S12-D02` | Publish contract-first OpenAPI 3.1.x + JSON Schema 2020-12; path-major `/api/v1`, additive minor evolution, exact discriminators, generated types/docs/tests, and cursor pagination. | Handwritten types/docs drift. URL-per-minor creates needless churn. “Always latest” silently reinterprets stale tabs. OAS 3.2 is current but launch tooling support must be proven first. | Unknown consequential major/state fails closed locally. Upgrade OAS after generator/validator/security tests prove parity; domain contract version remains independent of OAS version. | ADR-0019 |
| `ARCH-S12-D03` | Return discriminated domain result unions for completed, accepted-pending, partial, conflict, unavailable and deleted outcomes; reserve RFC 9457 for protocol/request failures. | HTTP status only cannot carry affected scope. `200 + null` conflates absence/failure. Exceptions/strings are non-exhaustive. Treating Pending as 500 or zero violates truth. | Client renders server semantics and reviewed copy. New consequential variants require a contract major or a proven exhaustive fallback. | ADR-0019 |
| `ARCH-S12-D04` | Represent long work as durable job resources with explicit state, versioned deadlines, cancellation intent and polling-first observation. Browser push is an optional invalidation hint; provider callback is an authenticated adapter input, never the authoritative learner result. | Hold requests open is simple but fails L2 degradation/reconnect. WebSocket/SSE-first adds connection operations. Client callback/webhook is unsuitable for a browser. Fire-and-forget loses work. | `202 Accepted + Location` returns a stable job. Poll with ETag and `Retry-After`; continue unrelated work. Add SSE only if measured polling load/feedback delay exceeds the later SLO. | ADR-0019 |
| `ARCH-S12-D05` | Distinguish domain events, integration events and jobs. Commit required job/outbox records in the same PostgreSQL transaction as owner truth; consumers use inbox/dedup. Do not add Kafka, Redis or a general event platform. | In-process emit-after-commit can lose signals. Database polling without an outbox can miss semantic transitions. Full event sourcing/streaming is disproportionate. | At-least-once effects converge idempotently. Split transport only after sustained queue contention/SLO or isolation requirements survive ordinary indexing/batching/tuning. | ADR-0019 |
| `ARCH-S12-D06` | Give every mutation a client operation ID, semantic identity, canonical payload hash and owner-scoped dedupe record. Same identity/same hash returns the committed result; same identity/different hash is a conflict/security signal. | Retry blindly duplicates evidence. Payload hash alone conflates distinct intents. Server-only random IDs cannot reconnect an unknown outcome. “Exactly once” marketing does not cover handler side effects. | Attempts, checkpoints, submissions, evaluations, notifications, Corpus import and deletion have explicit boundaries. Retention of dedupe receipts lasts at least as long as the fact/late-retry horizon. | ADR-0019 |
| `ARCH-S12-D07` | Use optimistic aggregate versions/ETags and domain-specific merge, never global last-write-wins. Immutable facts union by identity; mutable preferences merge per field; sessions/plans/drafts expose conflicts; guest attachment preserves every ID. | Global locks harm offline/reconnect. Last-write-wins can discard work or choose a convenient score. Automatic CRDTs cannot decide semantic validity. | Conflicts are actionable states, not learner failures. Add narrower locking only after measured conflict rate or an invariant cannot be expressed transactionally. | ADR-0019 |
| `ARCH-S12-D08` | Authorize every operation by learner/guest/operator/service scope and object ownership; validate closed schemas and quotas; minimize evaluator/event/job payloads; return semantic accessibility hints. | Route-level authentication alone permits object/function leaks. Passing full learner history to workers/providers is convenient but unnecessary and costly. Generic free text hides access behavior. | No Corpus learner data; no restricted content/keys in events; no raw response/audio in logs. Stage 20/23 choose mechanisms and legal wording without weakening boundaries. | ADR-0019 |
| `ARCH-S12-D09` | Use shaped latency transitions and versioned job policy, bounded exponential retry with jitter, dead-letter/quarantine plus operator replay, and scoped circuit breaking. Late/duplicate work publishes only through current preconditions. | Infinite retries hide failure/cost. One global circuit breaker blocks unrelated skills. Deleting failures loses audit. Hard-coded provider timeouts couple semantics. | L2 becomes Pending at ~30 s; raw audio has a seven-day maximum unresolved horizon. Other numerical retry/deadline values are approved policy records with owner, evidence, cost and rollback. | ADR-0019 |
| `ARCH-S12-D10` | Validate contracts with schema, state-machine, property, concurrency, duplicate/reorder, compatibility, accessibility, privacy and recovery tests; release majors with dual-read/shadow where necessary. | Happy-path endpoint tests miss truth corruption. Big-bang major migration strands stale tabs/jobs. Permanent compatibility layers accumulate unsafe meaning. | Old pinned facts remain readable; incompatible new work fails closed. Remove old readers only after observed client/job age plus retention and rollback windows are satisfied. | ADR-0019 |

No owner question remains.

## 4. API style alternative and decision table

| Style | Strength | Cost/risk for Bestehen | Decision |
|---|---|---|---|
| Same-origin JSON/HTTP resources + commands + projections | Browser-native, cache/ETag support, inspectable, portable, generated description, simple authorization boundary | Requires discipline around commands and result unions | **Chosen** |
| Framework server actions only | Minimal wiring for one web app | Transport coupling, weak durable replay/idempotency documentation, difficult non-browser/worker use | Rejected as sole public contract; may implement an adapter behind the contract later |
| GraphQL | Flexible aggregate reads, schema/introspection | Field authorization, cache, partial-error and query-cost complexity; encourages client-shaped domain joins | Rejected until measured multi-client query pressure |
| Typed RPC | Strong same-language ergonomics | Procedure/client coupling and weaker standards/tooling portability | Rejected; generated TS clients provide sufficient ergonomics |
| Separate BFF + domain API | Client-specific aggregation/isolation | Second deployment and duplicated semantics for one responsive client | Rejected; add only with a real independent client/security owner |
| General event API / event streaming | Replay and broad fan-out | Operational burden and risk of local formulas over events | Rejected; transactional outbox is sufficient |

### 4.1 Boundary rules

- **Resources** are addressable current representations or immutable receipts: attempt, job, session, plan revision, serving manifest, readiness projection, mock result, deletion operation.
- **Commands** request a semantic transition and use `POST /resource/{id}:verb` or collection creation. A command never accepts a derived score/state/validity/readiness/mistake field from the client.
- **Queries** are side-effect-free `GET` projections assembled by the authoritative owner. Query composition cannot create cross-owner writes.
- **Internal ports** between modules use the same discriminated domain contracts without pretending every in-process call is HTTP.
- **Worker/provider adapters** accept minimal job input references, fetch authorized data at execution time, and return candidate observations. Evidence/Measurement owners decide meaning.

## 5. Resource, command, and query catalog

This is a logical catalog, not executable route code. Stage 13 may group routes without changing operation identity, owner or outcome.

| Area / owner | Kind and representative operation | Input/precondition | Success representation | Failure/pending rule |
|---|---|---|---|---|
| Coaching | Query `GET /plans/current`; command `POST /plans:assemble` | Learner/guest scope, context, requested origin, source-cut hint, operation ID | Immutable `PlanRevision` with reasons/alternatives | Updating projection returns pending/partial; client never ranks locally |
| Session & Attempt | Command create/start/resume/stop session | Exact plan revision, expected session version, context, operation ID | `SessionInstance` + ETag | Stale resume returns conflict/current resource and safe actions |
| Content & Forms | Command acquire serving manifest; query exact manifest | Intended role/conditions, exclusions, source cut | Learner-safe immutable pinned manifest | No fresh/right/access capability is named unavailable, never zero |
| Attempt | Command create occurrence | Session/activity, pinned manifest, declared conditions, operation ID | Immutable attempt identity | Duplicate returns same identity; conflicting hash rejected |
| Checkpoint | Command `POST /attempts/{id}:checkpoint` | Expected attempt version, checkpoint sequence, response/draft reference/hash | Accepted checkpoint receipt | Older duplicate ignored/returned; divergent same sequence conflicts |
| Exposure | Command record exposure | Attempt/manifest/component, reveal kind/time, operation ID | Exposure fact receipt | Must succeed or be reconciled before independent-fresh claim |
| Submission | Command `POST /attempts/{id}:submit` | Expected version, immutable response refs/hash, actual conditions | Submission receipt + objective result and/or evaluation job | Same attempt cannot silently accept divergent submissions |
| Productive evaluation | Command request/cancel; query evaluation/job | Attempt, purpose, rubric/evaluator contract refs, supported scope | Pending job or accepted structured candidate result | Candidate never directly sets Evidence/Readiness; one justified escalation only |
| Evidence | Query observations/claims; internal command accept interpretation/correction | Exact occurrence, conditions, lineage, current assertion version | Five-state scoped validity and accepted evidence receipts | Partial names unaffected/affected scope; fault never negative |
| Learner projections | Queries for capability, Mistake, Review, Progression | Source cut, projection contract major | Server-built discriminated projection | Missing absent; rebuild pending only blocks dependent conclusions |
| Readiness & Mocks | Queries for current readiness/mock/booking; command start/finalize measured blocks | Exact blueprint/calibration/form, conditions, expected version | Six-state readiness, immutable mock result, granular gates/reasons | Written/Oral independent; no probability; partial mock never whole |
| Content operations | Commands draft/QA/approve/publish/quarantine/replace | Operator authority, expected revision, payload hash | Approval/impact receipts | Unknown rights/access/correctness holds exact scope |
| Corpus integration | Internal command import/accept/promote/reconcile bundle | Signed manifest/digests, snapshot pointer version | Immutable candidate/accepted snapshot and atomic active pointer | No learner data; incompatible closure held; active last-compatible remains |
| Notifications | Internal command create intent; user query/update preferences | Semantic reason/obligation, current preference version | Intent/delivery receipts | Delivery failure never changes evidence or coaching truth |
| Identity/data | Command attach guest scope; queries export; command request deletion | Guest capability + authenticated account, expected scope versions, operation ID | Merge/deletion/export job and audit receipt | Conflicts explicit; deletion revokes first and rejects late personal work |
| Media | Command allocate upload/capture completion; query authorized asset | Attempt/job purpose, MIME/size/digest, short lease | Opaque media ref, not public bytes | Failed processing narrows affected scope; raw audio ≤7 days unresolved |
| Operations | Internal job/query health, replay and quarantine | Service/operator authority, job/event revision | Minimal status/audit | Operations cannot edit learner truth; replay uses original semantic ID |

### 5.1 Query pagination and filtering

- Singular current projections are not paginated and carry `ETag`, `contract_version`, `source_cut`, `computed_at`, `staleness`, and owner-defined state.
- Histories use opaque, server-signed or unguessable cursors over a stable order `(recorded_at, opaque_id)`. Request: `limit`, `after`, and an allow-listed filter. Response: `items`, `next_cursor?`, `snapshot_cut`, `has_more`.
- Default/max limits are versioned operational policy. A client cannot request unbounded history or sort by arbitrary columns. Cursor scope includes learner/guest owner and filters; reuse outside that scope is invalid.
- A page is a historical snapshot, not live completeness. Inserts after `snapshot_cut` appear in a new traversal. Deletion/takedown may remove inaccessible entries and return a neutral tombstone where permitted.
- Partial domain scope is expressed in the result envelope, not HTTP `206 Partial Content`.

## 6. Contract envelope, validation, documentation, and versioning

The following are explanatory pseudotypes, not production TypeScript or a schema implementation.

~~~text
ContractMeta {
  operation_id, request_id, contract_version: { major, minor },
  owner_context, recorded_at, server_time,
  source_cut?, resource_version?, etag?,
  reason_registry_version?, content_or_policy_lineage?
}

CommandRequest<T> {
  client_operation_id,
  expected_resource_version?,
  payload: T
}

DomainResult<T> =
  | { kind: "completed", data: T, meta: ContractMeta }
  | { kind: "accepted_pending", receipt, job, dependent_scope[],
      unaffected_data?, safe_actions[], meta }
  | { kind: "partial", data: T, valid_scope[], pending_scope[],
      unavailable_scope[], reasons[], safe_actions[], meta }
  | { kind: "conflict", conflict_code, current_resource?, current_version,
      submitted_version?, merge_options[], safe_actions[], meta }
  | { kind: "unavailable", capability, affected_scope[], reasons[],
      retryability, alternatives[], accessibility, meta }
  | { kind: "deleted", operation_ref, terminal: true, meta }
~~~

### 6.1 Validation layers

1. Reject unsupported method/media type/body size before parsing.
2. Parse strict JSON with bounded depth/count/string/number sizes and reject duplicate ambiguous keys.
3. Validate the exact OpenAPI/JSON Schema request variant; unknown consequential fields are rejected for commands rather than silently accepted.
4. Authenticate caller, then authorize function, object/scope and field/property.
5. Enforce semantic constraints, expected versions, rights/capability and state-machine transition.
6. Canonicalize the semantic payload for hash/idempotency only after validation; secrets, volatile headers and presentation strings are excluded according to the operation specification.
7. Execute owner transaction and persist the receipt/outbox/job before responding.

### 6.2 Version policy

| Change | Version/evolution rule | Stale consumer behavior |
|---|---|---|
| Optional non-consequential response field | Additive contract minor; consumer ignores only when schema marks safe | Continue with tested fallback |
| New reason code with reviewed generic template | Minor only if reason family and fallback consequence are unchanged | Render fact/meaning/action generic template and log compatibility |
| New result/state/validity/gate/official unit or changed meaning | Contract major | Fail affected surface closed; show neutral update/unavailable; never guess |
| Command request field needed for correctness | Major or dual-write transition with server default proven semantically equivalent | Old command rejected when equivalence cannot be proven |
| New endpoint/command | Additive minor when existing behavior unchanged | No effect |
| Policy/calibration/template number | New immutable domain release with provenance/effective date/validation/rollback; not necessarily API major | Response pins exact release |
| Content/evaluator/blueprint/taxonomy revision | Independent version axis | Historical refs remain; new incompatible work held locally |
| OAS document format 3.1→3.2 | Documentation/tooling release, separate from domain API major | No runtime semantic change permitted |

The canonical repository description generates human documentation, schemas, fixtures and client/server compile-time types. Runtime validation remains required. CI fails on undocumented route/schema drift, incompatible diff without a major, undocumented problem type, unhandled discriminator, examples that do not validate, or generated artifacts that are not reproducible. External `$ref` resolution is pinned and allow-listed; rendered documentation is sanitized and does not expose internal/operator endpoints or secrets.

## 7. Error and result taxonomy

### 7.1 Domain outcomes (not protocol errors)

| Kind | Typical HTTP | Required semantics | Forbidden interpretation |
|---|---:|---|---|
| `completed` | 200/201 | Exact committed resource/receipt and lineage | “Latest” without pinned versions |
| `accepted_pending` | 202 + `Location` | Durable receipt/job, supported dependent scope, unaffected result/actions | Error, failure, zero, whole-App block |
| `partial` | 200 | Named valid, pending and unavailable scopes; exact reasons | Whole result or HTTP byte-range partial |
| `conflict` | 409 for command; 200 as queried resource state | Current version, submitted version, safe merge/reload/branch options | Last-write-wins or learner fault |
| `unavailable` | 200 for domain capability; 403 only for caller authorization | Capability/right/access/technical scope, neutral reason, alternatives, retryability | Ability inference or existence leak |
| `deleted` | 200/202 receipt then terminal query | Access revoked, deletion operation and no resurrection | Recreating late result/profile |
| missing estimate/claim | Field absent or explicit `{kind:"absent", reasons}` | No accepted evidence for exact scope | Numeric zero |

### 7.2 RFC 9457 protocol/request problems

Every problem has `type`, stable `code`, `title`, HTTP `status`, safe `detail`, `instance`, `request_id`, `retryable`, `retry_after?`, `field_issues?`, and `safe_actions?`. `detail` is never parsed for logic. It contains no stack, SQL, provider payload, restricted-content reason, account-existence signal, response/audio, secret or pass prediction.

| Problem family | HTTP | Retryability / client action |
|---|---:|---|
| `MALFORMED_REQUEST`, `UNSUPPORTED_MEDIA` | 400/415 | Fix request; never automatic blind retry |
| `UNAUTHENTICATED`, `NOT_AUTHORIZED`, `OBJECT_NOT_AVAILABLE` | 401/403/404 | Re-authenticate or stop; use 404 where existence must be hidden |
| `VALIDATION_FAILED` | 422 | Field/pointer issues and accessible summary; focus first invalid field |
| `PRECONDITION_REQUIRED`, `PRECONDITION_FAILED` | 428/412 | Fetch current ETag/version, then explicit user/domain resolution |
| `IDEMPOTENCY_CONFLICT`, `STATE_CONFLICT` | 409 | Do not replay with changed payload; inspect committed receipt/current resource |
| `PAYLOAD_TOO_LARGE` | 413 | Choose supported upload path/compress; do not truncate semantic payload |
| `RATE_LIMITED` | 429 | Respect `Retry-After`; preserve local work; never submit duplicate |
| `DEPENDENCY_UNAVAILABLE` | 503 | Bounded retry when operation is idempotent; show scoped fallback |
| `INTERNAL_FAILURE` | 500 | Unknown outcome resolved by operation receipt query before retry |

Evaluator disagreement, low confidence, content-rights ineligibility, no fresh family, a stale projection and a capability mismatch are normally typed domain states, not generic 500s.

### 7.3 Accessibility semantics in responses

State-bearing responses include a stable semantic label, fact/meaning/next-action reason data, `announcement_priority` (`none | polite | assertive`), `focus_target` token only when focus should move after the triggering action, alternatives with equivalent/different-claim disclosure, and non-color status text. These are semantic hints, not DOM selectors. Progress responses identify determinate/indeterminate state without countdown spam. A validation problem supplies a summary plus JSON Pointers that the UI maps to labelled controls.

## 8. Durable job model

### 8.1 Job resource

~~~text
JobResource {
  job_id, job_kind, semantic_identity, state, state_revision,
  owner_scope, actor_scope, input_refs[], input_contract_versions,
  created_at, not_before?, service_target_at, hard_deadline_at,
  result_accept_until?, attempt_count, retry_policy_version,
  cancellation: { allowed, requested_at?, effective_at?, reason? },
  dependent_scope[], unaffected_scope[], progress?,
  result_ref?, failure_class?, safe_actions[],
  payload_minimization_class, expires_or_tombstones_at?,
  lineage, etag
}
~~~

Job payloads normally contain opaque references and exact versions, not a learner profile or content body. A worker authorizes and resolves the minimum data at execution time. Provider adapters receive the minimum task/rubric/response/media needed for the bounded purpose. Raw response/audio is never placed in queue names, logs, metrics, outbox payloads or browser push messages.

### 8.2 Job state diagram

~~~mermaid
stateDiagram-v2
    [*] --> Accepted
    Accepted --> Scheduled: not_before / retry delay
    Accepted --> Running: worker claims
    Scheduled --> Running: eligible claim
    Running --> SucceededCandidate: processor returns
    SucceededCandidate --> Published: owner validates + commits
    SucceededCandidate --> Quarantined: identity/version/scope invalid
    Running --> RetryScheduled: retryable bounded fault
    RetryScheduled --> Running
    Running --> FailedTerminal: nonretryable / budget exhausted
    Accepted --> CancelRequested: caller cancels
    Scheduled --> CancelRequested
    Running --> CancelRequested
    CancelRequested --> Cancelled: no publishable work
    CancelRequested --> SucceededCandidate: result raced cancellation
    Running --> Expired: hard deadline
    SucceededCandidate --> Superseded: late/stale precondition
    Published --> [*]
    Cancelled --> [*]
    FailedTerminal --> [*]
    Expired --> [*]
    Quarantined --> [*]
    Superseded --> [*]
~~~

`SucceededCandidate` is not learner truth. The authoritative owner validates identity, exact versions, evaluator confidence, affected scope, deletion status and current publish preconditions. A cancel request is intent: work already sent to a provider may complete, but a result publishes only if still allowed. Terminal job failure changes dependent conclusions to Pending/unavailable or uses a shaped fallback; it never creates negative evidence.

### 8.3 Job classes, deadlines, and late results

| Class | Service/deadline contract | Cancellation | Late result |
|---|---|---|---|
| Standard productive evaluation | L2 normally useful ≤15 s; connected wait becomes `accepted_pending` at ~30 s. `hard_deadline_at` and one-escalation policy are immutable job-policy values. | Allowed before owner publication; original submitted attempt remains | May publish to original occasion if identity/versions/deletion/current contract pass; never rewinds active work |
| Speaking turn/partner | Next useful response target ~2 s, ordinary degradation ≤4 s; sustained ~5 s degradation uses fixed/prerecorded fallback and narrower claim | Stop immediately on learner cancel/leave; no new capture | Response after fallback is not inserted as if timely interaction; quarantine/audit or use only where exact interaction policy permits |
| Content generation/QA | Operator/batch deadline and spend ceiling in versioned policy; never a learner request prerequisite unless a preapproved retry job was accepted | Allowed until immutable revision promotion | Creates candidate only; never replaces pinned attempt or bypasses QA |
| Media transcode/TTS | Batch policy; serving requires complete verified asset, alternative and rights metadata | Allowed before publication; uploaded raw/intermediate purged per policy | Candidate may join a future revision, never mutate the pinned one |
| Corpus import/promotion | Asynchronous digest-resumable import; emergency stop-new-use impact is prioritized separately | Candidate import cancellable; verified restrictive impact remains actionable | Older publication sequence cannot roll back active pointer; compatible future promotion is explicit |
| Projection recompute | Scoped, coalesced by source cut/generation; publish atomically after validation | Superseded by a newer requested generation | Older generation becomes `superseded`, never overwrites newer truth |
| Notification delivery | Must respect semantic due window, current preferences, quiet hours and caps at send time | Intent cancellable/supersedable | Expired action is dropped, not delivered late as urgency |
| Deletion/export | Deletion revokes access synchronously, then durable purge/journal work continues. Export has an authenticated expiry. | Deletion is not cancelled after revocation without a new explicit owner-approved flow | Late personal work/result is rejected and purged; restore journal suppresses resurrection |

The shaped seven-day ceiling for unresolved raw Speaking audio is absolute: the bytes are deleted by then and the evaluation resolves from permitted derivatives or remains unresolved/invalid. No retry policy extends it.

### 8.4 Polling, push, and callbacks

1. A command creating long work returns `202`, a stable receipt, `Location: /api/v1/jobs/{id}`, current representation and bounded `Retry-After` guidance.
2. The browser polls the job resource with `If-None-Match`; `304` avoids payload. Poll cadence backs off, stops in background/offline, and resumes from the same job ID.
3. The app may later use same-origin SSE only as a lossy “resource changed” hint. It carries job/resource IDs and revisions, not personal/result payload; polling/query remains authoritative.
4. WebSocket is not selected at launch. Adaptive Speaking transport is a later provider/runtime choice and cannot change evidence semantics.
5. Provider callbacks terminate at a dedicated authenticated adapter: verify signature/key, timestamp/replay window, body digest, provider event ID, request identity and size; store/dedupe raw minimum callback evidence under bounded retention; return quickly; enqueue validation. Callback order is not truth order.
6. When callback is unavailable, the worker may poll the provider behind the same adapter. The domain never knows which observation mechanism was used.

### 8.5 Evaluation sequence

~~~mermaid
sequenceDiagram
    actor L as Learner
    participant C as Web client
    participant A as API / Session & Attempt
    participant Q as PostgreSQL job + outbox
    participant W as Worker / evaluator adapter
    participant E as Evidence owner
    participant P as Projection owners

    L->>C: Submit productive attempt
    C->>A: Submit(operation id, expected version, payload hash)
    A->>Q: TX: immutable submission + evaluation job + outbox
    A-->>C: 202 accepted_pending; objective/unaffected data; Location
    C-->>L: Saved; evaluation pending; continue unrelated work
    W->>Q: Claim semantic job
    W->>W: Minimal validated provider request
    W-->>E: Candidate result with exact request/version/scope
    E->>E: Validate identity, confidence, validity, deletion, current preconditions
    alt accepted
      E->>Q: TX: append observation/assertion + projection jobs + outbox
      P->>P: Rebuild affected source cut; publish atomic generation
      C->>A: GET job/projection with ETag
      A-->>C: Completed or partial exact scope
    else late, duplicate, incompatible or cancelled
      E->>Q: Deduplicate, supersede or quarantine; no truth overwrite
      A-->>C: Existing committed receipt / safe terminal state
    end
~~~

## 9. Domain events, integration events, internal jobs, and outbox

### 9.1 Category boundary

| Category | Meaning/owner | Persistence and delivery | May contain | Must not do |
|---|---|---|---|---|
| Domain event/fact | Past-tense immutable fact owned by the aggregate/context, e.g. `AttemptSubmitted`, `ValidityAssertionAppended`, `ReadinessProjectionPublished` | Stored with owner truth/audit; not necessarily broadcast | Semantic IDs, exact versions, occurred/effective/recorded time, affected scope | Command another owner, claim transport delivery, carry hidden formulas |
| Integration event | Minimized versioned notification that committed owner truth changed | Transactional outbox; at-least-once dispatch; consumer inbox by event ID + handler major | Event ID/type/version, source aggregate/revision, scope selectors, correlation/causation, safe reason class | Carry raw response/audio, restricted bytes/key/rubric, full learner profile; instruct local recalculation |
| Internal job | Future work request, e.g. evaluate, recompute, reconcile, notify, delete | Transactionally enqueued pg-boss job or outbox→job; retries/deadlines/cancel state | Semantic job ID, input refs, exact versions, policy, scope | Become evidence/result simply because it completed |
| Operational signal | Metric/log/alert about processing | Telemetry with minimized labels and bounded logs | Counts, age, latency, cost class, reason/failure code, opaque IDs | Edit truth or expose personal/content payload |

Representative integration events include `EvaluationCandidateRecorded`, `EvidenceInterpretationChanged`, `ContentImpactAsserted`, `CorpusSnapshotPromoted`, `ProjectionGenerationPublished`, `BookingGateProjectionChanged`, `DeletionRequested`, and `NotificationIntentCreated`. “Changed” means “query the named owner resource/revision”; consumers never reimplement the owner formula from an event.

### 9.2 Transactional publication

~~~mermaid
flowchart LR
    A[Owner command] --> T[(One PostgreSQL transaction)]
    T --> F[Owner fact/state + operation receipt]
    T --> O[Outbox or durable job row]
    O --> D[Dispatcher / pg-boss worker]
    D --> I[Consumer inbox / handler-major dedupe]
    I --> C[Consumer-owned command or rebuild]
    C --> R[New owner fact/projection]
    D -->|retry/duplicate| I
    I -->|already handled| X[Return stored effect]
~~~

Use a direct in-process call inside one owner transaction where no asynchronous failure boundary exists. Use a durable job when work can be delayed/retried and has one work owner. Use an outbox integration event when another owner must learn a committed fact and loss would leave truth inconsistent. Best-effort telemetry, UI invalidation hints and cache warming do not enter the truth outbox.

Ordering is per aggregate/source revision, not global. Consumers reject gaps only when their invariant needs order, then refetch the authoritative resource. Events may be coalesced for rebuild requests, but facts and material audit snapshots are not discarded. Poison messages quarantine after bounded retries; operator replay retains original event/job identity.

## 10. Idempotency and concurrency matrix

| Operation | Semantic identity / dedupe scope | Same retry | Changed payload / out-of-order | Concurrency and retained truth |
|---|---|---|---|---|
| Create attempt | learner/guest scope + activity occurrence + client operation ID; canonical request hash | Return same `attempt_id` and representation | `IDEMPOTENCY_CONFLICT`; never create a second attempt under reused ID | Attempt immutable; chronology uses accepted sequence/time, not UUID order |
| Checkpoint draft/answers | attempt ID + checkpoint stream + client op ID; monotonic checkpoint sequence and hash | Return stored receipt | Lower sequence is stale; same sequence/different hash conflicts; later sequence may advance only expected attempt version | Checkpoint is recoverable workflow state, not evidence. Server ACK defines synchronized cut; local outbox retains unacked changes |
| Record exposure | attempt + manifest component + exposure semantic kind + operation ID | Return same exposure fact | Divergent reveal time/kind is audited conflict; conservative exposure may be appended by reconciliation | Exposure fact never removed to regain freshness |
| Submit attempt | attempt ID + submission ordinal/purpose; operation ID + response/conditions hash | Return same immutable submission/objective result/evaluation receipt | Divergent response after committed submit conflicts; edit requires new attempt where allowed | One authoritative accepted submission; fault/missing remains explicit, not wrong |
| Evaluation request | `attempt_id + purpose + evaluator_contract_major + rubric_version`; escalation has distinct justified tier | Return existing job/result | Changed purpose/version is a new semantic request; reused identity/different input quarantined | At most one normal evaluation and one policy-justified escalation; retries do not add evidence |
| Evaluation result/callback | provider event ID plus request ID/result revision; candidate digest | Duplicate converges to same candidate/accepted interpretation | Conflicting bytes under same identity are provider/security incident; older/superseded result cannot publish | Evidence owner appends accepted interpretation/correction at original occasion |
| Projection recompute | impact/source-cut + projection kind + requested generation/policy version | Coalesce/return job | Older generation can finish but becomes superseded; only compare-and-publish current requested generation | Shadow build then atomic pointer; unaffected last-valid projection remains |
| Notification intent/delivery | semantic notification intent ID (obligation/horizon + presentation revision); delivery ID per channel/recipient | Same intent does not create another notification | Changed reason/window is successor intent; send rechecks preferences/caps/current truth | Provider retry may redeliver only under provider dedupe; expired intent drops. Delivery never changes mastery |
| Corpus publication/import | bundle ID + revision + manifest digest; publication sequence; import operation ID | Resume/return candidate or accepted snapshot | Same bundle/revision with different digest is incident; older sequence cannot roll back | Atomic capability pointer; pinned attempts/history retain exact snapshot |
| Content publish/quarantine | content revision + approval/impact revision + operation ID | Return same approval/impact | Mutating frozen revision rejected; successor required | Impact causes smallest-scope idempotent rebuild |
| Guest→account attach | guest scope ID + destination account + attach operation ID + guest capability version | Return same mapping/result | Different destination under same operation conflicts; already attached to another account requires explicit recovery | Preserve all IDs/facts; append ownership mapping; no double evidence |
| Export | learner scope + export request ID + source cut/format version | Return existing in-window artifact/job | Newer cut is a new export operation | Authenticated expiring download; restricted content excluded |
| Deletion | learner scope + deletion operation ID; terminal operation receipt | Resume every purge/journal step; return same status | Any late write/result sees deletion tombstone and is rejected/purged; changed scope needs new explicit request where meaningful | Revoke access first; replay deletion after restore; journal bounded per Stage 05 |
| Outbox/inbox | stable event ID; consumer ID + handler contract major | Return recorded dispatch/effect | Same ID/different digest quarantined; new handler major may replay only with explicit migration | At-least-once transport, effectively-once semantic effect |

### 10.1 Receipt contract and retry algorithm

The server persists `{scope, client_operation_id, operation_kind, canonical_payload_hash, status, resource/result_ref, first_recorded_at, last_seen_at}` within the owner transaction. On retry:

1. no record → validate/authorize and attempt transaction;
2. same kind/scope/hash → return committed or pending receipt, even if the original response was lost;
3. same key with a different hash/kind/scope → 409 and security telemetry;
4. receipt exists but execution outcome is uncertain → query/reconcile owner state, never execute blindly;
5. expired receipt is removable only after no legitimate offline retry, provider callback, retained job, fact or deletion replay can refer to it. Immutable business identity constraints remain after receipt compaction.

Do not hash raw secrets into a reversible/global identifier. Use a server-keyed digest where equality itself is sensitive. Canonicalization has a version and cannot normalize away semantically meaningful differences.

## 11. Optimistic concurrency and conflict behavior

### 11.1 General contract

Mutable aggregate resources carry an opaque strong `ETag` and monotonic `resource_version`. Commands include `If-Match` and/or `expected_resource_version`; the operation definition names which is required. A missing required precondition returns 428; a mismatch returns a typed conflict with the safe current representation or a non-leaking refetch action. PostgreSQL constraints/transactions decide acceptance. Serializable retry is reserved for invariants Stage 05 cannot express otherwise.

Immutable facts do not conflict by “latest wins”: they union by semantic ID after ownership/duplication validation. Derived projections are never merged; owners rebuild from a named source cut.

### 11.2 Anonymous-to-account attachment

1. Guest scope uses an unguessable server capability and local recovery warning; attachment requires current guest capability plus authenticated destination account.
2. Freeze only the attachment mapping transaction, not all learning. Append ownership/link facts and preserve attempt/evidence/session IDs and original occasion/times.
3. Facts with distinct semantic identities union. Exact duplicates dedupe by identity/hash. Same identity/different payload quarantines instead of picking the higher/better result.
4. Preferences merge per field using explicit learner choice/current version; no global timestamp last-write-wins. Date/schedule conflicts are presented.
5. In-progress sessions remain distinct unless they are the same session identity. Same-attempt checkpoint divergence returns branch/resolution options; submitted attempts are immutable.
6. Projection owners rebuild the attached scope once. Readiness/Mistake/Capability are not added together and the client cannot merge them.
7. Replaying attach returns the same mapping. Concurrent attach to another account is a security/recovery conflict, never silent reassignment.

### 11.3 Multiple devices, offline outbox, and session resume

| Situation | Server decision | Client-safe action | Evidence effect |
|---|---|---|---|
| Device B updates a preference after A | Field-level expected version; non-overlapping fields may merge, overlapping field conflicts | Show current/submitted value and choose | None |
| Two devices resume same session | First accepted resume advances session version and activity lease; second gets current state/conflict | Join current read-only/current activity, explicitly take over if allowed, or start a new session | Never duplicate activity/attempt automatically |
| Offline checkpoint reconnect | Apply monotonic accepted sequence per attempt; divergent same base creates conflict/branch | Keep both recoverable drafts; learner selects/combines before submit | Draft is not evidence |
| Offline attempt operation retry | Operation receipt returns same attempt/submission | Continue from committed resource | No duplicate episode/evidence |
| Plan source cut changed before start | Old immutable plan remains historical; start command returns `replanned`/conflict with new revision | Accept new revision or deliberate supported alternative | No learner penalty |
| Version changes during attempt | Pinned manifest/rubric/contract continues if fair/compatible; active rights/safety revocation stops exact scope | Continue pinned, replace affected activity, or update client | No silent reinterpretation; scoped impact after submit |
| Client contract major unsupported | Server rejects consequential action or client shows update-required affected surface | Preserve local work/export/refetch after update | Never submit under guessed schema |

Timers use the accepted Stage 05 clock semantics and record pause/visibility/connectivity facts. A client-reported clock is an observation, not authority. Resume cannot hide an interruption as continuous target-condition work.

## 12. Representative non-production contract examples

### 12.1 Productive submission accepted while evaluation is pending

~~~json
{
  "kind": "accepted_pending",
  "receipt": { "submission_id": "sub_opaque", "attempt_id": "att_opaque" },
  "job": {
    "job_id": "job_opaque",
    "state": "accepted",
    "poll": "/api/v1/jobs/job_opaque"
  },
  "dependent_scope": ["writing.rubric.task_fulfilment", "writing.rubric.language"],
  "unaffected_data": { "response_saved": true },
  "safe_actions": ["continue_unrelated_work", "view_saved_response"],
  "accessibility": {
    "semantic_label": "Response saved; evaluation pending",
    "announcement_priority": "polite",
    "focus_target": null
  },
  "meta": {
    "operation_id": "op_opaque",
    "contract_version": { "major": 1, "minor": 0 },
    "owner_context": "SessionAndAttempt"
  }
}
~~~

There is no score, weakness or readiness change. The saved attempt retains its original conditions and occasion when the late result arrives.

### 12.2 Partially valid mock result

~~~json
{
  "kind": "partial",
  "data": {
    "mock_id": "mock_opaque",
    "written": { "kind": "accepted_units", "unit_refs": ["read_a", "language_a"] },
    "oral": { "kind": "absent", "reasons": ["MEDIA.CAPTURE_FAILED"] },
    "whole_mock_claim": "not_available"
  },
  "valid_scope": ["written.reading.unit_a", "written.language_elements.unit_a"],
  "pending_scope": [],
  "unavailable_scope": ["oral.speaking"],
  "reasons": [
    { "code": "TECHNICAL.MEDIA_CAPTURE", "learner_fault": false,
      "fact": "The recording was not usable", "next_action": "fresh_oral_replacement" }
  ],
  "safe_actions": ["keep_valid_written_units", "start_fresh_oral_replacement"]
}
~~~

The result cannot be relabelled a full mock and missing Oral is not zero.

### 12.3 Idempotency conflict

~~~json
{
  "type": "https://app.bestehen.invalid/problems/idempotency-conflict",
  "code": "IDEMPOTENCY_CONFLICT",
  "title": "This operation identifier already has a different request",
  "status": 409,
  "detail": "Use the committed receipt or create a new operation for a genuinely new action.",
  "instance": "/api/v1/problems/prb_opaque",
  "request_id": "req_opaque",
  "retryable": false,
  "safe_actions": ["fetch_operation_receipt", "review_current_attempt"]
}
~~~

The URI is illustrative. Production owns a stable controlled problem-type namespace.

### 12.4 Stale session resume

~~~text
POST /api/v1/sessions/ses_opaque:resume
If-Match: "session-v7"
Idempotency-Key: op_opaque

409 DomainResult.conflict {
  conflict_code: "SESSION_REVISION_ADVANCED",
  current_version: 9,
  merge_options: ["join_current_activity", "start_new_session", "explicit_takeover_if_allowed"],
  safe_actions: ["fetch_current_session"]
}
~~~

No automatic takeover or duplicate attempt occurs.

## 13. Security, privacy, rights, abuse, and accessibility

### 13.1 Authentication and authorization matrix

| Caller | Permitted scope | Required checks | Explicitly excluded |
|---|---|---|---|
| Guest client | One unguessable guest learner scope and learner-safe content/jobs | Guest capability, CSRF/origin for cookie state, object ownership, operation limits | Other scopes, operator data, Corpus bundles, keys/rubrics, raw provenance |
| Authenticated learner | Own linked learner scopes, preferences, attempts, projections, export/delete | Session authentication, CSRF/origin, recent auth for sensitive export/delete/link as Stage 20 decides, object/property authorization | Direct derived-state writes, another learner, operator internals |
| App worker | Named job kind and minimal owner/service capability | Workload identity/secret, job lease, input scope/version, egress allow-list | Broad interactive user session, unrelated learner history |
| Operator/content reviewer | Explicit content/import/impact roles | Strong authentication, function/object authorization, reason + audit, separation where rights/security requires | Learner response/history unless separately authorized for support/quality purpose |
| Provider callback | One adapter endpoint/request identity | Signature/key, body digest, replay window, provider event ID, size/rate/source policy | Domain writes, learner queries, arbitrary URLs |
| Corpus publisher/import | Signed immutable bundle channel | Ed25519 keyring, digest, monotonic sequence, schema/governance/rights gates | Learner IDs/profile/response/exposure/readiness |

Authorization occurs inside the owner/application boundary, not only middleware. Queries filter at source; response schemas/serializers allow-list properties to prevent excessive data exposure. IDs are opaque and never sufficient authority.

### 13.2 Abuse and resource controls

- Per caller, guest capability, IP risk band, learner scope, operation kind and provider cost class: bounded request size/rate/concurrency and daily spend/work ceilings. Exact values are versioned Stage-23/26 operational policy based on measured legitimate use.
- Stricter limits cover guest creation, audio upload, evaluation, content/report submission, export/delete, login/link, notification scheduling and Corpus import. Limits return recoverable states and preserve checkpoints.
- One normal productive evaluation plus at most one policy-justified escalation is enforced transactionally, not by UI convention.
- Media uses declared MIME, sniffed type, digest/size/duration bounds, private storage, short-lived purpose-bound access and no user-controlled object key/egress URL.
- No arbitrary callback, fetch URL, template key, reason code, sort field, schema `$ref`, event type, job kind or model/provider option is accepted from an untrusted caller.
- Rate limits/system overload never create learner-negative evidence. Clean target-condition work does not start if durable capture/media prerequisites cannot be guaranteed.

### 13.3 Minimum payload and secret boundaries

AI/evaluator requests include the exact task/prompt obligations, relevant response or ephemeral media/transcript, declared conditions, supported evaluation dimensions and rubric/evaluator versions—never full profile, Mistake Memory, Readiness, exam date, notification/contact data, unrelated attempts or raw Corpus. A provider response is a candidate structured observation with confidence/limitations; generated prose is presentation and cannot override state.

Browser bundles never receive answer keys before reveal, hidden partner inputs, evaluator secrets, operator rights reasons, signed Corpus material, service credentials or unrestricted object URLs. Outbox/job/notification payloads reference encrypted/authorized data rather than copying it. Logs and metrics use opaque IDs, versions, state/reason/failure codes, latency, count, byte and cost class only.

Rights-only unavailability stops the exact prohibited action/bytes but does not automatically negate learner performance. Correctness/fairness impacts alone can cause Evidence to append a scoped validity assertion. Takedown wins over caches and jobs through an authoritative current eligibility check before serving/publication.

### 13.4 Accessibility and recovery contract

- Every command is operable without relying on repeated rapid action; duplicate activation returns the same receipt.
- A job/pending state has text, semantic label, useful progress, cancel availability, alternatives and non-noisy live-region guidance. No spinner-only state.
- Validation returns a summary plus labelled-field pointers; focus moves only after the triggering action and remains stable during background polling.
- Capability differences are local. No mic/audio/access alternative may silently claim oral/listening equivalence; the response names the changed claim.
- A technical/access/browser/network failure returns `learner_fault:false` for the exact affected scope and preserves valid work.
- Reduced motion, large text, screen-reader use or keyboard path do not alter server evidence unless the actual adaptation changes tested capability; actual conditions remain explicit.

## 14. Failure, recovery, and uncertainty

| Failure | Contract behavior | Recovery | Never allowed |
|---|---|---|---|
| Response lost after command commit | Operation receipt query/retry returns same committed result | Retry same ID/hash; local outbox waits for ACK | New attempt/evidence by guess |
| API unavailable before attempt | No clean attempt starts; cached eligible low-risk work only where already authorized | Bounded retry/alternative | Infer inability or consume fresh form without manifest |
| Network loss during draft | Local checkpoint/outbox and monotonic server ACK | Reconnect/merge conflict explicitly; normally ≤~5 s recoverable Writing loss target | Silent overwrite/truncate/submit |
| Worker crash/lease expiry | Job returns to bounded retry; handler checks semantic receipt | Resume exact job | Claim exactly-once business effect without dedupe |
| Evaluator timeout/disagreement | Exact dimensions pending/limited; unrelated objective data publishes | One justified escalation or fresh evidence | Fabricated score/cause, repeated paid loop |
| Provider callback duplicated/reordered | Adapter inbox dedupes; owner validates revision/current preconditions | Return acknowledgement; quarantine conflicting identity | Callback order overwrites newer interpretation |
| Projection rebuild fails | Last validated unaffected projection with stale/rebuilding provenance; dependent claims pending | Retry scoped then full replay fallback | Partial generation pointer or client recompute |
| Content/media/rights/access defect | Stop exact scope; append impact and target rebuild | Fair replacement; purge restricted bytes | Learner-negative evidence from product fault |
| Corpus down/incompatible | Active compatible App snapshot/bank continues; new import capability unavailable | Resume digest import later | Live learner call or global block |
| Concurrent plan/session change | Typed conflict/new immutable revision | Fetch current, join/branch/replan | Mutate published revision in place |
| Delete races job/result | Deletion tombstone/revocation precondition rejects and purges late personal output | Continue deletion journal/replay | Resurrect profile/evidence after restore |
| Unsupported contract/state/reason | Fail affected surface closed with reviewed generic copy | Upgrade/dual-read/last compatible pinned view when safe | Default to success/zero/latest |

Pending blocks only conclusions named in `dependent_scope`. Partial validity retains the named unaffected scope. Missing remains absence. Neither a system failure nor an unavailable estimate can lower Written/Oral as though observed.

## 15. Performance, reliability, operations, and cost

### 15.1 Service behavior

- L0 local interactions target roughly 100 ms acknowledgement. L1 deterministic server work targets p95 ≤1 s and exposes explicit progress after roughly 2 s. These are launch targets to measure, not guarantees.
- L2 productive evaluation normally returns useful output within 15 s, permits connected wait to ~30 s, then becomes durable Pending. Unrelated work proceeds.
- L3 partner response targets ~2 s, ordinarily tolerates up to ~4 s, and sustained ~5 s degradation invokes a fixed/prerecorded fallback with honest claim scope.
- Endpoint budgets include database/query count, response bytes and serialization. Queries are owner-shaped, bounded and paginated; no client arbitrary graph/query language.
- Background work uses per-kind concurrency, retry, timeout and spend policy. Learner truth transactions remain short; provider calls occur outside them.

### 15.2 Measures and alerts

Measure by operation/job/event kind without personal payload:

- request rate, p50/p95/p99, body/response bytes, validation/auth/conflict/rate-limit counts;
- idempotency replay/conflicting-key/unknown-outcome reconciliation counts;
- checkpoint ACK age, reconnect divergence and recoverable-loss tests;
- job queue depth/oldest age, attempts, lease expiry, retry/terminal/quarantine/cancel/late/superseded counts;
- outbox undispatched age, inbox duplicate/gap/poison/replay counts;
- evaluation latency, confidence/disagreement/escalation/provider cost by approved class;
- projection requested→published lag and generation rejection;
- Corpus import bytes/digest/resume/promotion/withdrawal lag;
- notification intent→delivery/drop/duplicate and preference/cap recheck;
- deletion age, late-write rejection, backup-restore suppression and raw-audio deletion horizon;
- contract-major/client/job age, unknown discriminator/reason, schema-drift and fallback-copy use;
- accessibility recovery tests and product-fault-to-negative-evidence invariant violations (target zero).

Alerts route to the owning context/operation. Operations may retry/quarantine/replay with the same semantic ID; it cannot edit evidence, readiness, mistake or learner score.

### 15.3 Cost and sustainability

Launch reuses the Stage-03 web process, worker, PostgreSQL/pg-boss and private object storage. No Redis, Kafka, API gateway product, schema registry service, WebSocket fleet, workflow orchestrator, warehouse or provider callback broker is added. OpenAPI/JSON Schema artifacts are repository/build outputs, not a paid control plane.

Recurring cost is the existing web/worker/database/storage baseline. Variable cost comes from productive evaluation/transcription, rare generation/media processing, bytes/egress, notification delivery and worker/database time. Minimized payload, one default evaluation, one justified escalation maximum, polling backoff, batched content/media, projection coalescing and cached deterministic query results bound it.

Fallbacks and exits:

- evaluator/provider → deterministic objective results + Pending/reviewed fallback; replace behind adapter while preserving request/result contract;
- pg-boss → another durable job adapter using exported PostgreSQL job/receipt/outbox data; business handlers remain idempotent;
- PostgreSQL queue pressure → tune indexes/retention/batching and isolate worker pool first; move only job transport after sustained learner DB SLO breach or isolation need;
- polling → add SSE invalidation hints after measured poll load or learner-visible completion delay, without changing job resource authority;
- OAS/codegen tool → canonical OpenAPI/JSON Schema and conformance fixtures allow replacement; generated output is not source truth;
- notification provider → intent/delivery adapter and semantic dedupe survive migration;
- Corpus transport/storage → signed immutable standard files/manifests and digest-resumable import remain portable.

Commercial/provider changes require Stage 26 measured recurring/variable/egress/storage/maintenance costs, security/region/terms review, export test and rollback. Cost may choose among equivalent options but cannot remove Writing/Oral evidence, truthful Pending/partial states, accessibility or deletion.

## 16. Validation, release, and upgrade evidence

| Evidence suite | Required assertions |
|---|---|
| Contract schema/examples | Every request/result/problem/example validates; all discriminators and problem codes documented; no probability field/event/job/log |
| Consumer exhaustiveness | Client handles every result, validity and six Readiness states; unknown consequential major fails closed with reviewed copy |
| State-machine/model tests | Only authorized session/attempt/job/validity transitions; cancel/result and deletion/result races converge safely |
| Idempotency properties | Duplicate/reordered/lost responses for every matrix operation yield one semantic fact/effect; changed hash conflicts |
| Concurrency tests | Multi-device resume/checkpoint/submit, guest attach and version activation never lose or double evidence; no last-write-wins derived truth |
| Queue/outbox fault injection | Crash before/after commit, lease expiry, poison message, dispatch duplicate/gap and replay preserve owner truth |
| Late-result tests | Old evaluator/projection/Corpus/notification result cannot overwrite newer/deleted/superseded truth |
| Compatibility tests | Current and oldest-supported client/job/provider fixtures; additive minor and breaking-major diff policy; pinned historical reads |
| Security/privacy/rights | Object/function/property auth, CSRF/origin, payload/URL/schema limits, callback replay/signature, content-key separation, log/event/job payload scans |
| Accessibility | Semantic labels/reasons/alternatives/focus/live behavior and validation recovery work across keyboard/screen reader/reflow/reduced motion |
| Recovery/DR | Local outbox reconciliation, restore + deletion journal, job/outbox/inbox restore, raw-audio expiry and provider exit fixture |
| Cost/load | Bounded cursor queries, request/job concurrency, queue age, polling load, evaluation spend and database contention against accepted SLOs |

Release an additive minor only when schema diff and consumer contract tests prove fallback safety. A breaking major uses expand/dual-read or translate/shadow, records producer and consumer adoption, and retains rollback. It never rewrites old fact meaning. Contract readers are removed only when browser/job/offline/provider callback age, dedupe retention and historical interpretation windows all prove they are no longer required.

## 17. ADR

Created [ADR-0019 — Versioned HTTP contracts and durable idempotent asynchronous work](adr/ADR-0019-versioned-http-contracts-and-durable-idempotent-asynchronous-work.md), status **Accepted**, covering `ARCH-S12-D01`–`ARCH-S12-D10`. It does not supersede another ADR; it applies ADR-0007/0010/0012/0013/0015–0018 at the transport boundary.

## 18. Relationship to earlier and later stages

### 18.1 Decisions downstream stages must preserve

Stages 13–26 and 28 must preserve:

1. one same-origin versioned JSON/HTTP semantic boundary; no client-owned consequential calculation;
2. domain `Pending`, partial, missing, unavailable and conflict states are typed and not generic errors/zeros;
3. server/domain owners alone set validity, evidence, Mistake, Progression, scoring, six Readiness states and Ready-to-Book;
4. Written and Oral remain independent; no probability field/event/job/log before the empirical/product major gate;
5. every mutation is semantically idempotent; retries, callbacks and queue delivery may duplicate;
6. durable jobs/outbox are transactionally tied to owner truth where loss matters; no general event platform;
7. results are candidates until their semantic owner validates exact identity, versions, confidence, affected scope, deletion/current preconditions;
8. late/duplicate/older generations cannot overwrite newer truth; pinned attempts and history never use “latest”;
9. optimistic versions and domain merge replace global last-write-wins; guest attachment preserves IDs and does not sum projections;
10. Corpus remains asynchronous and learner-free; events/jobs/logs/providers carry minimum payload; restricted content/key/rubric and raw audio stay bounded;
11. polling is authoritative; push/callback is a hint/adapter; cancellation is intent and races are explicit;
12. technical/content/media/accessibility/browser/network/evaluator failures have zero learner-negative effect and preserve named unaffected scope.

### 18.2 Dependencies introduced or removed

Introduced logical dependencies: canonical OpenAPI 3.1.x/JSON Schema 2020-12 contract artifact; RFC-9457-compatible problem registry; operation receipt/dedupe store; job resource and versioned job policy; transactional outbox/inbox; aggregate ETag/version; provider callback verification adapter; conformance/fault-injection fixtures. These fit the accepted PostgreSQL/pg-boss modular monolith and do not add a managed runtime service.

Removed as launch dependencies: GraphQL/RPC/event-streaming platform, Redis, WebSocket/SSE authority, BFF, live Corpus API, client callbacks, per-feature queue semantics, provider-defined learner state, client-side derived truth and “exactly once” assumptions.

### 18.3 Risks, assumptions, and validation needs

| Risk/assumption | Evidence/test | Trigger/action |
|---|---|---|
| OAS 3.1 tooling handles exhaustive unions without drift | Generator/validator/documentation conformance matrix | Replace tool or adopt OAS 3.2 after parity; never weaken discriminator |
| PostgreSQL queue/outbox does not harm learner transactions | DB wait/CPU/IO/queue-age and restore drills | Tune/partition/archive, isolate worker; migrate transport only after sustained breach |
| Polling is cheap and responsive enough | Requests/job, background-tab behavior, completion visibility delay | Add SSE invalidation hints behind same resource contract |
| Evaluation retry/escalation is bounded and useful | agreement, latency, learner impact and cost per accepted dimension | Recalibrate versioned policy; keep honest Pending fallback |
| Dedupe retention covers offline/provider/deletion horizons | late retry/callback distribution and restore tests | Extend receipts or permanent semantic uniqueness |
| Field-level preference merge is understandable | conflict rate/usability tests | Narrow merge or require explicit choice; never global LWW |
| Accessibility hints map consistently to UI | assistive-tech task tests and reviewed copy registry | Amend additive hint where safe or major if meaning changes |
| Minimum provider payload is sufficient | evaluator quality/fairness and privacy review | Add only justified field under contract/threat review |

### 18.4 Intentionally deferred implementation choices

These are bounded choices, not missing architecture:

- Stage 13: route grouping, server adapter/library, generated client integration and UI data-fetch/cache mechanics.
- Stage 16/18/19: evaluator, speech/media providers, callback versus provider polling, exact model/media protocol and deterministic fallback implementation.
- Stage 20: account/session authentication, guest capability recovery and explicit merge/takeover UX.
- Stage 21: browser offline/service-worker/checkpoint mechanics and supported-browser details.
- Stage 23: notification channel/provider, preference scheduling and delivery UX while using semantic intent dedupe.
- Stage 24/25/26: monitoring implementation, numerical queue/API alert thresholds, abuse limits, runbooks, contract/fault/load/security gates and provider cost substitutions.
- Stage 26/legal review: jurisdiction-specific retention/export/deletion/rights wording; no compliance claim is made here.

## 19. Decisions made and owner questions

`ARCH-S12-D01` through `ARCH-S12-D10` are Accepted. No unresolved owner question exists. Mutable latency/retry/limit values are shaped behaviors represented as versioned policy with provenance, effective date, validation evidence and rollback; stable truth rules are not calibration knobs.

## 20. Definition-of-done check

- [x] All required GitHub inputs and accepted prerequisite stages were read and SHA-pinned.
- [x] Source authority and Stage-27 precedence are applied without modifying shaping/design.
- [x] API style, command/query/resource boundaries, validation, pagination, concurrency, versioning and generated documentation are decided.
- [x] Exhaustive domain result and protocol error taxonomies preserve validity, Pending, partial scope, conflicts, capability, rights and retryability.
- [x] Productive/content/media/import/recompute/notification/deletion job states, deadlines, cancellation, polling/push/callback and late results are specified.
- [x] Domain events, integration events, jobs, outbox/inbox and no-general-event-platform boundary are explicit.
- [x] Attempts, checkpoints, submissions, evaluation, notifications, Corpus, export and deletion have idempotency boundaries.
- [x] Guest attachment, multi-device, session resume, offline and version-change conflicts have safe optimistic behavior.
- [x] Required tables, diagrams, matrix and non-production examples are present.
- [x] Security/privacy/rights/accessibility/failure/cost/operations/tests/exits and downstream handoff are complete.
- [x] ADR-0019 is Accepted and indexed with this decision.
- [x] No production code/configuration, Design file, Shaping file, earlier output or later-stage artifact is changed.
