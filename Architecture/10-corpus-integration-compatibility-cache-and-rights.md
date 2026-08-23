# Bestehen / App — Corpus Integration, Compatibility, Cache, and Rights

> **Status:** Accepted architecture handoff for Stage 10  
> **Date:** 2026-08-23  
> **Scope:** Asynchronous Corpus publication into App-owned, approved runtime inventory; no production implementation

## 1. Purpose and scope

This stage defines the only permitted architecture boundary between Bestehen / Corpus and Bestehen / App. Corpus publishes provenance-preserving, rights-aware, confidence-qualified exam intelligence. App imports it asynchronously, makes its own content and serving decisions, and remains the sole owner of learner state, coaching, evidence, Readiness, and UX.

The selected launch contract is **bundle-first asynchronous pull**: Corpus publishes signed, immutable, capability-scoped bundles over a private object/file channel and a small signed publication index; an App import worker validates and promotes compatible snapshots. Normal learner runtime queries only App-owned PostgreSQL/object/cache state. It never queries Corpus, searches raw sources, invokes Corpus AI, or sends a learner profile. Previously App-approved practice—including P4 forms—continues during a Corpus outage unless an already-imported, independently effective App withdrawal or target-currentness rule says otherwise.

In scope are bundle/request pseudotypes, six information families, governance envelopes, publication and promotion, compatibility, stable identity and migration, cache and rollback, rights/takedown/reclassification, downtime, security, accessibility, cost, operations, and validation. Corpus internals, its authoring UI, App production endpoints/schema, provider selection, and learner-facing component implementation remain outside this stage.

## 2. Inputs, authority, and continuity

### 2.1 Pinned source record

All required inputs were read from GitHub `main` before deciding. App source head was `f3f1e721eb0dd89a963282486c358e5092a26990`; Shaping source head was `9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc`.

| Repository | Path | Blob SHA | Use |
|---|---|---|---|
| Bestehen-App | `prompts/architecture/10_define_corpus_integration_compatibility_cache_and_rights.txt` | `455a69482efc1c6fc380541116077e873faf3df3` | Binding Stage 10 contract |
| Bestehen-App | `Architecture/00-architecture-shaping-plan.md` | `b263c5e7b3bccc0450ddd17aa0cc007432d672b7` | Workflow, invariants, routing |
| Bestehen-App | `Bestehen_App_Architecture_Checklist.md` | `6717945eff11cc3bba8ce6a31166176d1de6605b` | 24 open Stage 10 checks at start |
| Bestehen-App | `Design/DESIGN-HANDOFF.md` | `417a6820037e045e2dd9f29afc42b9f2e94fd638` | Learner boundary, hard prohibitions, no Corpus UI |
| Bestehen-App | `Architecture/02-system-context-and-product-boundaries.md` | `046d114bbbc96528bf0b9eae0406c0235f759127` | Async boundary, last-compatible snapshot, no learner data |
| Bestehen-App | `Architecture/05-data-ownership-persistence-and-schema-evolution.md` | `bb6df811ec9010de556d1719f22e31bb8ca3190e` | PostgreSQL/R2 ownership, immutable imports, version axes |
| Bestehen-App | `Architecture/09-content-exercise-form-and-media-architecture.md` | `e6fb121ab1b10c6cbcf692bc88acaf98f2e45e7a` | App approval, content manifests, rights/accessibility, targeted repair |
| Bestehen-App | `Architecture/adr/README.md` | `a5597f0b77739a7dc9fda9ce51435e7ad8e6938e` | ADR convention and next number |
| Bestehen-Shaping | `app/28-bestehen-app-product-specification.md` | `18ae80cc2fd63cecd76c297c3e56d44a68367856` | Consolidated product authority, especially §14 |
| Bestehen-Shaping | `01_Bestehen_Product_Overview.md` | `42f15da945e03f1d8e32dfe010f95aae6b87daa3` | Corpus/App boundary and independent rights/confidence |
| Bestehen-Shaping | `app/21-content-strategy.md` | `8149d6a268da70e17cad46f774b9d5de77776986` | C0–C4, generation, QA, attribution and correction |
| Bestehen-Shaping | `app/22-user-controls-vs-coach-autonomy.md` | `27f33cd56a09df27952e15bb3dfd0e077b89633c` | Pattern request fields and choice/truth boundary |
| Bestehen-Shaping | `corpus/12-corpus-app-contract.md` | `7add217f62118e5abe100680d2e8230a93b8c280` | Six families, governance, migrations and impacts |
| Bestehen-Shaping | `corpus/17-bestehen-corpus-product-specification.md` | `537b5185313097d043748f9dc9f9fdaf432ee71d` | Corpus publication, trust, rights and operations authority |

Required Stages 02, 05, and 09 were present and complete; their live checklist sections were 23/23, 24/24, and 24/24 respectively. Their accepted decisions and ADR-0004, ADR-0012, and ADR-0016 remain unchanged.

### 2.2 Authority and source reconciliation

No source contradiction requires an owner decision. The final App specification §14 and detailed Corpus contract agree that Corpus supplies pattern-first intelligence and use eligibility while App owns learner-facing original practice. Design §1 prohibits a Corpus browser/provenance dashboard and §9 keeps Corpus authoring tooling behind the learner experience; this architecture therefore exposes no learner-facing Corpus surface. Stage 02 already fixes asynchronous App runtime independence, Stage 05 fixes App persistence, and Stage 09 fixes App approval and immutable serving manifests. Stage 10 supplies the missing transport, compatibility, promotion, cache, and change contract without reopening any of them.

The binding precedence remains: validity/fairness → direct evidence → independent Written/Oral risk → uncertainty resolution → due repair/retention → progression/coverage → preference. Rights and confidence remain separate; neither can be inferred from the other. Corpus facts are priors and constraints, never learner mastery, weakness, Readiness, or pass probability.

### 2.3 Current primary technical evidence

| Evidence (accessed 2026-08-23) | Architecture use |
|---|---|
| [RFC 8785 — JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785.html), including verified errata | Canonical, deterministic manifest bytes before signature verification; implementations must reject duplicate keys, invalid Unicode/number forms, and negative zero per verified errata rather than normalizing ambiguous input |
| [RFC 8032 — EdDSA / Ed25519](https://www.rfc-editor.org/info/rfc8032/) | Portable asymmetric publication signature with test vectors; Corpus holds the private signer, App pins public keys |
| [Node.js 24 crypto documentation](https://nodejs.org/download/release/v24.18.0/docs/api/crypto.html) | Confirms the Stage 03 Node 24 runtime can verify signatures without selecting an external signing SDK or service |

These standards do not select a commercial provider. Existing Stage 03 PostgreSQL, private S3-compatible object storage, worker, and hosting decisions remain the complete runtime/provider set.

## 3. Architecture decisions and alternatives

### 3.1 Decision registry

| ID | Decision and recommended default | Alternatives and rejection | Consequences, fallback, review trigger | Downstream / ADR |
|---|---|---|---|---|
| `ARCH-S10-D01` | Use signed immutable capability bundles over private object/file transport, discovered through a small signed publication index. No live Corpus query API at launch. | Manual files are simpler but unaudited and mutable. A synchronous API is fresher but creates runtime availability/privacy/cost coupling. API + bundles duplicates surfaces before need. | Zero Corpus calls per learner attempt; publication is portable and replayable. Last-compatible App snapshot is fallback. Revisit only if measured bundle size, authoring latency, or provenance drill-down cannot meet an accepted SLO. | 11, 12, 16, 19, 23–28; ADR-0017 |
| `ARCH-S10-D02` | Publish six explicit capability payload families, each inside a common governance envelope; never export Corpus tables or reconstructive restricted expression by default. | A database dump leaks internals and rights-sensitive columns. One generic JSON blob makes compatibility and eligibility ambiguous. | App consumes stable meanings, not storage layout. Unknown consequential family/schema fails its capability closure. Corpus may change internals without App migration. | 11, 12, 16, 19, 23, 25, 28; ADR-0017 |
| `ARCH-S10-D03` | Validate in private staging, accept as an immutable candidate, and atomically promote one complete capability snapshot. Existing attempts and App artifacts retain pinned revisions; rollback moves only the active pointer. | Per-record live promotion can mix taxonomy, target, rights and blueprint releases. Stop-the-world replacement increases outage and destroys history. | More retained metadata, but no mixed semantic release. Last-compatible and evidence-referenced identities remain. Review if retained bundle storage dominates cost after safe compaction. | 12, 23–26; ADR-0017 |
| `ARCH-S10-D04` | Version contract, bundle packaging, each family payload, taxonomy, target profile, blueprint, analytics, difficulty/relevance model, rights decision and governance decision independently. | One global version is simple but forces unrelated breaking upgrades and hides semantic change. | Unknown consequential major is quarantined; additive minor is safe only when explicit eligibility remains and required App capabilities are satisfied. | 11, 12, 24–28; ADR-0017 |
| `ARCH-S10-D05` | Stable opaque IDs never change meaning or get reused. Material change creates an immutable revision or successor. Corpus publishes rename/reparent/merge/split/retire/target migrations; App preserves historical references and projects forward conservatively. | Relabel in place silently rewrites history. Clone evidence across a split manufactures mastery. | Merge deduplicates shared evidence; split lowers certainty and requires new direct evidence. Unsupported migrations hold only the affected capability. | 11, 12, 23–25, 27, 28; ADR-0017 |
| `ARCH-S10-D06` | Keep confidence, currentness, source breadth, analytical independence, capability/use eligibility, exact-action rights, attribution and accessibility as separate fields and gates. | A composite quality score is easy to rank but cannot explain or enforce legal/fairness limits. App-side re-derivation duplicates Corpus policy. | A high-confidence item may still be prohibited; a reusable asset may still be unfit. Missing required meaning denies only that use and yields an explicit fallback. | 11, 16, 19, 23–25, 28; ADR-0017 |
| `ARCH-S10-D07` | Resolve `DesiredPracticeSpec` locally against the active imported snapshot. The boundary has a deny-by-schema list for learner/session/profile fields; Corpus receives no learner state, response, exposure, mistake, Readiness, date, preference, fatigue, or identifier. | Remote personalization would reduce App code but violate ownership and cacheability. Sending pseudonymous learner IDs still creates learner data processing. | App combines Corpus task-side priors with private learner state locally. A future async export request may contain only generic target/use constraints and needs a new compatibility/security review. | 11, 12, 19, 20, 23–25; ADR-0017 |
| `ARCH-S10-D08` | Import signed material-change/impact manifests. Rights/takedown blocks exact use and cache access immediately after verified import; correctness/fairness, trust, taxonomy and target changes follow distinct App impact paths and targeted recomputation. | Treating every change as global invalidation destroys valid evidence. Treating rights-only withdrawal as learner failure is false. | App Content & Forms stops serving; Evidence & Capability alone changes learner validity. Smallest defensible scope, idempotent rebuild, neutral learner copy. | 11, 12, 23–28; ADR-0017 |
| `ARCH-S10-D09` | Corpus outage alone does not invalidate an active App-approved snapshot or P4 inventory. App bank, coaching, attempts, mocks and Readiness continue; only new intelligence/import and already-known expired/withdrawn capability is unavailable. | Fail closed globally is safe-looking but unnecessary learner harm. Treat stale as current forever can misstate target conditions. | Outage uses active snapshot and curated App seeds. P4 remains eligible absent an imported revocation or independently reached effective limit. Recovery imports forward; no retroactive guess. | 11, 16, 21, 24–28; ADR-0017 |
| `ARCH-S10-D10` | Sign canonical manifests with Ed25519, digest every immutable payload/object with SHA-256, use private authenticated transport and least privilege, enforce accessibility metadata, and measure bytes/age/promotion/withdrawal rather than add services. | TLS/checksum alone cannot prove Corpus publication identity after storage compromise. Shared HMAC makes App able to forge and complicates custody. A transparency/event platform is disproportionate at launch. | One signer/keyring rotation runbook is operational work. Unknown/revoked key fails closed. Add stronger key custody/logging only after threat review or incident evidence. | 12, 23–26, 28; ADR-0017 |

### 3.2 Contract-style comparison

| Style | Runtime coupling | Audit/rollback | Rights/currentness response | Cost/maintenance | Decision |
|---|---|---|---|---|---|
| Shared Corpus database/tables | High and semantic | Weak across internal migrations | App must reconstruct rules | Low first query, highest coupling | Rejected |
| Mutable/manual files | None | Weak; drift and overwrite likely | Slow/manual and hard to prove | Lowest setup | Rejected except one-time fixtures |
| Live capability API | Corpus availability per use unless separately cached | Possible, but responses need snapshot capture | Freshest | Always-on auth, rate, retries and provider surface | Rejected at launch |
| Hybrid live API + bundles | Optional runtime API plus replayable bundles | Strong | Strong | Two contracts and two incident paths | Deferred until a measured need |
| **Signed immutable bundles + signed index** | **None in learner runtime** | **Deterministic replay, pointer rollback** | **Async verified impacts; App defense in depth** | **One batch path, near-zero per attempt** | **Selected** |

### 3.3 Integrity alternative

Checksums detect transfer corruption but do not authenticate the publisher. A shared HMAC authenticates but gives both products signing power and complicates investigation. Ed25519 gives small portable signatures, asymmetric authority, standard test vectors, and public-key verification in the selected Node runtime. The App verifies the RFC 8785 canonical manifest, its Ed25519 signature, then every listed SHA-256 object digest and byte size. Signature validity never substitutes for semantic, rights, accessibility, or App approval gates.

## 4. Components, state, and responsibility ownership

| Component / state | Owner | Responsibility and hard boundary |
|---|---|---|
| Corpus capability publisher | Corpus | Resolve Corpus-internal evidence into six contract families; assign stable IDs/revisions, eligibility, governance and impact; never accept learner profiles |
| Corpus signer and publication store | Corpus / Corpus Operations | Canonicalize and sign index/manifests; publish immutable digest-addressed objects; protect private signing key and transport credential |
| App discovery/import worker | App Corpus Publication ACL | Pull index/bundles asynchronously, prevent replay, stage privately, verify cryptographic and structural integrity; no learner-runtime call path |
| Compatibility and semantic validator | App Corpus Publication ACL | Enforce supported versions/capabilities, closed enums, cross-reference closure, migrations, non-reconstructive boundary and required governance |
| App review/promotion coordinator | App Content & Forms / Operations | Apply Stage 09 App QA and role authorities, record acceptance/rejection, atomically switch active capability pointer, issue durable impacts |
| Imported Corpus snapshot | Corpus origin; App stored copy | Immutable accepted facts/reference. Corpus owns original meaning; App owns which accepted snapshot is active |
| Local Corpus catalogue port | App Content & Forms | Resolve generic `DesiredPracticeSpec` against an explicit active snapshot; returns priors/blueprints, never learner conclusions |
| App generation/content bank | App Content & Forms | Create and approve original C2/C3 or bounded C4 material; exact C1 only after rights/accessibility/App QA; runtime inventory authority |
| Rights/change reconciler | App Content & Forms + Operations | Stop future use/cache, map affected App artifacts, emit Stage 09 impact assertions and purge/tombstone actions |
| Evidence repair | App Evidence & Capability | Append one of the five validity states and rebuild only affected learner projections; Corpus/Content never edits learner results |
| Learner runtime/browser | App Session & Attempt | Receives only App-approved learner-safe serving manifests and assets; never receives raw Corpus bundles, source lineage, keys, or operator material |

Candidate/import states are operational and do not become evidence states:

~~~mermaid
stateDiagram-v2
  [*] --> Discovered
  Discovered --> Staging: pull immutable objects
  Staging --> Verifying: complete candidate
  Verifying --> Quarantined: signature/digest/schema/rights failure
  Verifying --> Incompatible: unsupported consequential version
  Verifying --> AcceptedCandidate: all automated gates pass
  AcceptedCandidate --> AwaitingReview: material App consequence
  AcceptedCandidate --> Promoted: non-semantic safe patch policy
  AwaitingReview --> Promoted: scoped authority approves
  AwaitingReview --> Quarantined: rejected
  Promoted --> Superseded: successor promoted
  Promoted --> Withdrawn: verified impact forbids current use
  Superseded --> Promoted: explicit rollback if still eligible
~~~

No candidate state is visible as learner ability. A technical/content/media/accessibility/browser/network/import failure has zero learner penalty.

## 5. App-consumable contract and bundle model

The following are architecture pseudotypes, not executable TypeScript, endpoint definitions, or database schemas.

### 5.1 Generic App-side request

~~~text
DesiredPracticeSpec {
  target_profile_ref,
  capability: target_profile | pattern | blueprint | structured_reference |
              reference_eligibility | aggregate_prior | skill_graph |
              difficulty_envelope | provenance_drilldown | reconciliation,
  task_family?, progression_profile: P0 | P1 | P2 | P3 | P4,
  taxonomy_node_refs[], difficulty_envelope?, topic_include_exclude?,
  modality_and_delivery_constraints?, desired_realism?,
  freshness_family_exclusions[],
  minimum_confidence?, minimum_source_breadth?, independence_requirement?,
  exact_reference_requested: boolean,
  requested_actions?: display | reproduce | adapt | generate_from |
                      cache | offline | transform,
  supported_contract_major, supported_family_majors,
  snapshot_ref
}
~~~

This value is created after App uses private learner state, then resolved locally. Its schema has no extension bag and explicitly rejects `learner_id`, `learner_scope_id`, account/device/session/attempt IDs, responses, exposure history, Mistake Memory, capability/mastery, Readiness, exam date, preferences, fatigue, accessibility declaration, or free text. `freshness_family_exclusions` are App content-family IDs used only locally; they are not transmitted to Corpus. A future generic authoring export request may reuse a strict subset, but cannot be enabled without a new cross-boundary data-flow and threat review.

### 5.2 Publication index and logical bundle

~~~text
PublicationIndex {
  index_schema, publisher_id, publication_sequence,
  generated_at, signing_key_id,
  entries: [{ bundle_id, bundle_revision, contract_version,
              capability_scope, manifest_digest, immutable_location,
              published_at, effective_at, supersedes[], impact_class? }],
  signature
}

CorpusBundleManifest {
  bundle_id, bundle_revision, packaging_schema,
  contract_version: { major, minor, patch },
  capability_scope, published_at, effective_at,
  supersedes[], state: current | superseded | withdrawn,
  required_app_capabilities[],
  taxonomy_release, target_profile_release,
  analytics_release?, difficulty_relevance_release?,
  family_partitions: [{ family, payload_schema, object_digest,
                        byte_size, record_count }],
  exact_asset_partitions?: [{ object_digest, byte_size, rights_scope }],
  migrations_ref?, impact_manifest_ref?, limitations[],
  signing_key_id, signature
}

BundleObject {
  immutable_digest_address, declared_media_type, declared_size,
  records_or_bytes, sha256
}
~~~

The signed index is a discovery aid, never authority for bundle contents. `publication_sequence` must advance; an older index cannot roll App back. A rollback is a new signed entry naming the prior still-eligible bundle. The manifest is canonicalized with RFC 8785 before Ed25519 verification. Every object is immutable and verified against its manifest digest and size. Bundles are logical manifests plus UTF-8 JSON/JSON Lines partitions and separately addressed exact assets; database dumps, executable documents and absolute filesystem paths are forbidden.

### 5.3 Governance envelope

~~~text
ResultEnvelope<T> {
  result_id, result_revision, family, payload_schema,
  payload: T,
  lifecycle: current | superseded | withdrawn,
  use_eligibility: eligible | eligible_with_limits | anchor_only |
                   exploratory | insufficient | ineligible,
  confidence: { dimensions, tier, local_scope, decision_revision },
  currentness: { target_profile_ref, status, effective_from,
                 effective_until?, last_recomputed_at, limitations[] },
  evidence_support: { sufficiency, source_breadth, independent_support,
                      provider_concentration, source_family_concentration,
                      analytical_independence_rule, limitations[] },
  versions: { contract, taxonomy, target_profile, analytics?,
              difficulty_relevance?, rights_decision?, blueprint? },
  rights?: RightsEnvelope,
  accessibility?: AccessibilityEnvelope,
  provenance_summary, successor_refs[], impact_ref?
}

RightsEnvelope {
  decision_id, decision_revision, component_scope,
  authenticity_confidence_ref,
  action_status: [{ action, allowed | allowed_with_conditions |
                    reference_only | unknown_review_required | prohibited }],
  conditions[], exact_attribution?, territory_audience_limits?,
  expiry?, takedown_state, purge_or_tombstone_policy?, successor?
}

AccessibilityEnvelope {
  modalities, required_alternatives[], alternative_equivalence,
  language_and_semantics, keyboard_path, reveal_constraints,
  tested_capability_effect, qa_decision_ref
}
~~~

`confidence` cannot grant permission; `rights` cannot prove accuracy, target fit, accessibility, or evidence role. Unknown/missing consequential fields deny only the claimed use. The governance envelope is the complete App input; App never reaches into Corpus tables to infer eligibility.

### 5.4 Six information families

| Family / payload | Contract meaning | App materialization/use | Hard gate and fallback |
|---|---|---|---|
| 1. `ReferencePackage` | Exact source components, provider-native constraints and lineage only for an expressly requested action | Separate operator-only partition; may seed C1 after App rights, QA, accessibility and attribution approval | Any component restriction denies composite exact use. Fall back to non-reconstructive blueprint/original App content. Raw/reference expression is absent from normal bundles. |
| 2. `ExamStructureRelease` | Stable exam/section/part/task/item semantics, provider labels, mechanics, timing/playback/reference facts, completeness/correctness readiness | Target/form authoring and canonical task mapping | Unknown currentness or correctness cannot define current P4/key. Use verified target anchor or App seed. |
| 3. `AggregatePriorRelease` | Prevalence/distributions with counting unit, denominator/coverage, breadth, independent support, concentration, sufficiency and allowed role | App content coverage/priority prior; never learner evidence | Exploratory/insufficient cannot drive learner priority or Readiness. Broaden scope or use curated prior. |
| 4. `SkillGraphRelease` | Stable nodes, hierarchy and typed curated/empirical relationships plus aliases and migration table | Shared coordinate system for App content and learner projection | Co-occurrence is never prerequisite; split never clones mastery. Last compatible graph plus conservative mapping. |
| 5. `GenerationBlueprintRelease` | Non-reconstructive task mechanics, tested capability, content/difficulty/distractor/delivery constraints and grounding manifest | App structured generation brief and QA input | Reconstructive or restricted expression quarantines. Broader multi-source blueprint or App-curated original. |
| 6. `DemandSignalRelease` | Separate CEFR, L/R/T/A/P demand and GB1/TELC relevance with uncertainty/model/currentness | Task-side selection envelope only | Never converted to learner failure/pass likelihood. Missing fine estimate uses broader supported band. |

Every record has one stable identity and immutable revision. Payload families are capability contracts, not mirrored Corpus rows. The App may denormalize accepted data into its own query projections, but imported record identity, revision and governance remain resolvable.

### 5.5 Change/impact contract

~~~text
ImpactManifest {
  impact_id, impact_revision, class,
  effective_at, discovery_at, reason_code, confidence,
  affected_corpus_refs[], affected_bundle_refs[],
  affected_capability_scopes[], affected_app_selector_hints[],
  dimensions: { rights, correctness_fairness, trust_authenticity,
                taxonomy, target_currentness, accessibility, attribution },
  required_actions: { stop_new_use, purge_exact_bytes, revalidate,
                      recompute, notify_operator, learner_copy_class? },
  successor_refs[], tombstone_or_purge_policy,
  idempotency_identity
}
~~~

Corpus supplies authoritative Corpus scope and change class; it cannot set learner validity. App maps imported Corpus refs to App content revisions/forms/media and emits Stage 09 impact assertions. Evidence & Capability then applies Stage 06's closed five-state vocabulary and targeted rebuild.

## 6. Publication, acceptance, promotion, cache, and rollback

### 6.1 Publication and acceptance sequence

~~~mermaid
sequenceDiagram
  participant C as Corpus publisher/signer
  participant P as Private publication channel
  participant I as App import worker
  participant V as Compatibility/governance validator
  participant O as App scoped reviewer
  participant S as App accepted snapshot store
  participant B as App approved content bank
  participant R as Learner runtime

  C->>C: Resolve six families + governance + impacts
  C->>C: Canonicalize manifest; sign; digest objects
  C->>P: Publish immutable bundle, then signed index entry
  I->>P: Pull index since highest accepted sequence
  I->>I: Verify index key/signature/anti-replay
  I->>P: Pull candidate manifest and listed objects
  I->>V: Candidate in isolated staging
  V->>V: Verify signature/digests/schema/closure/versions/rights/a11y
  alt invalid or unsupported consequential major
    V-->>I: Quarantine exact scope and reason
    I-->>S: Keep active/last-compatible pointers unchanged
  else compatible candidate
    V-->>O: Semantic diff, impact, limitations, App QA obligations
    O->>S: Accept immutable snapshot and approval record
    S->>S: Transactionally switch capability pointer + outbox
    S-->>B: Rebuild/review only affected App content projections
    B-->>R: New attempts use App-approved manifests only
  end
  Note over C,R: No learner state travels to Corpus; running attempts retain pinned App manifests
~~~

Publishing objects before the signed index prevents discovery of an incomplete bundle. Import is resumable by digest and idempotent by `bundle_id + bundle_revision + manifest_digest`. Reusing that identity with different bytes is a security incident, not an update.

### 6.2 Ordered validation and promotion gates

1. Authenticate the private transport and verify the publication index signature/key/monotonic sequence.
2. Verify the canonical bundle manifest signature, publisher, digest-addressed object list, declared sizes and media types.
3. Parse with bounded size/depth/record limits; reject duplicate JSON keys, ambiguous number/Unicode forms, archive traversal, links, executable/active documents and undeclared objects.
4. Enforce supported contract/packaging/family majors, required App capabilities, closed consequential enums and cross-reference closure.
5. Prove stable identity/revision uniqueness, predecessor/successor and migration consistency, and target/taxonomy/model lineage.
6. Validate governance completeness, non-reconstructive boundary, confidence/currentness/sufficiency/independence and capability eligibility.
7. For exact components, validate every action-level rights condition, attribution renderability, accessibility alternative and component composition. Unknown denies direct use.
8. Produce a deterministic semantic diff and affected App selector set; apply verified stop-new-use impacts before slower revalidation.
9. Run Stage 09 App QA and scoped reviewer authority. Safe non-semantic corrections may follow a pre-approved auto-promotion policy; pattern/model/target/rights/exact-asset changes require explicit review.
10. In one PostgreSQL transaction, append acceptance, switch the complete capability pointer, and enqueue reconciliation. Failure leaves the prior pointer active.

Promotion is atomic per complete capability closure, not necessarily for every unrelated bundle. A Skill Graph + dependent blueprint release that declares itself one closure moves together; an unrelated provenance drill-down bundle can fail without blocking normal patterns.

### 6.3 Cache layout and authority

| Layer | Contents / key | Authority and retention | Withdrawal/rollback |
|---|---|---|---|
| Corpus publication store | Signed immutable manifest and digest-addressed objects | Corpus publication authority; private transport | New signed impact/index entry; never overwrite object |
| App staging | Untrusted candidate bytes keyed by manifest digest | No semantic authority; isolated, bounded, non-runtime; rejected material retained only for bounded incident evidence then purged | Delete/quarantine; cannot become fallback |
| App accepted snapshot | Normalized semantic records in PostgreSQL; eligible large/exact bytes in private R2; keyed by bundle/result revision | Immutable imported authority. Keep active, last compatible, and metadata referenced by App/evidence; exact bytes only while allowed | Active pointer switch; metadata history/tombstone retained where permitted; prohibited bytes purged |
| App content bank | Generation briefs, content/media/form revisions, approvals, impact assertions | Sole learner-playable authority (Stage 09) | App quarantine/replacement; historical pinned refs retained |
| Server process/query cache | Snapshot/revision-addressed derived lookup | Replaceable; never decides rights independently | Version miss/revocation bypass; evict affected keys |
| Browser HTTP/Cache Storage/IndexedDB | Only App-approved learner-safe manifests/assets and checkpoints | Never Corpus authority or learner truth; key includes App content/serving revision and digest | App revocation/lease rules and cache purge; cache absence is local degradation |

The App never copies raw Corpus sources “for convenience.” Exact reusable assets use an isolated partition and separate access policy. Learner routes cannot enumerate bundle IDs, provenance lineage, restricted bytes, answer keys, or internal rights reasons.

Rollback is a new audited App promotion decision pointing to a prior snapshot that still passes current rights, target, compatibility and accessibility gates. It never deletes the failed/newer release and never retargets historical artifacts. If no compatible snapshot is still eligible, App-curated content remains; only the missing Corpus-derived capability becomes unavailable.

## 7. Compatibility, identity, migration, and deprecation

### 7.1 Compatibility matrix

| Axis / received state | Compatible behavior | Rejection/hold behavior | Historical behavior |
|---|---|---|---|
| Contract patch, same major/minor | Accept after digest/governance checks; no behavior change permitted | If semantics changed under patch, quarantine as publisher defect | Existing refs unchanged |
| Contract additive minor within supported major | Accept only when all `required_app_capabilities` are supported and unknown fields/statuses are explicitly optional/non-consequential | Unknown consequential enum, changed eligibility meaning or new required behavior quarantines capability closure | Prior active remains |
| Unsupported contract major | Never parse into domain meaning or promote | `incompatible`; alert; retain last compatible or App fallback | No silent reinterpretation/zero |
| Packaging schema major | Reader must explicitly support it before staging objects | Reject candidate before semantic parse | Accepted old packages remain readable/exportable |
| Family payload major | Capability-specific reader required | Reject whole declared dependency closure, not unrelated bundles | App artifact keeps exact old family revision |
| Taxonomy rename/reparent, same meaning | Preserve node ID; refresh label/edges | Hold if mapping changes meaning despite same ID | Evidence stays on ID |
| Taxonomy merge | Apply declared successors; deduplicate same source evidence | Hold ambiguous many-to-one mapping | No double counting |
| Taxonomy split | Import predecessor→children mapping; require conservative fresh child evidence | Never clone mastery to all children | Old observation remains historical predecessor evidence |
| Blueprint revision | New immutable revision; shadow/diff App briefs/content before future use | Reconstructive/rights/currentness regression quarantines | Served content retains original blueprint ref |
| Target profile revision | New P4/current selection uses verified current revision after App revalidation | Unsupported/uncertain target change blocks only affected new P4 claim | Old attempts remain historical; current coverage may become absent/Pending |
| Analytics/difficulty model revision | New priors only after compatible semantics and validation | Hold incompatible axes/meaning | Does not recalculate learner fact by itself |
| Rights/governance revision | Apply exact effective action/component state | Unknown or more restrictive state denies new direct use | Past performance remains unless correctness/fairness also affected |

### 7.2 Stable IDs and revision rules

- Stable result, pattern, taxonomy node, target profile and source-component IDs are opaque and never reused.
- Label, description or provenance clarification with unchanged meaning appends a revision and may preserve identity.
- Changed task mechanism, capability meaning or semantic node creates a successor identity/revision according to its family rule.
- Every App generation brief, content revision, form and serving manifest pins the exact Corpus bundle/result/taxonomy/target/rights revisions used.
- A digest proves bytes, not semantic identity. Identical bytes can have distinct governed roles; changed bytes cannot hide behind the same revision.
- Retired identities remain non-content tombstones with reason/successor/impact where policy permits. Stronger legal/security purge is represented explicitly.

### 7.3 Deprecation and unsupported-major behavior

Normal deprecation publishes a successor, limitations, first-supported App capability, and an effective end condition with at least one accepted overlap/rollback opportunity. Emergency correctness, rights or security withdrawal may have no grace. App alerts before an accepted dependency becomes unsupported, validates the successor in shadow, and moves the pointer only after gates pass. An unsupported major never triggers an urgent learner-client upgrade to obtain routine practice: the import is held while the App uses its last compatible snapshot and approved bank.

No “latest” lookup is allowed in historical resolution. Every lookup names an active snapshot for new authoring or a pinned snapshot for history.

## 8. Governance, rights, reclassification, and affected evidence

### 8.1 Independent governance dimensions

| Dimension | Owner question answered | App enforcement |
|---|---|---|
| Authenticity/confidence | How trustworthy is this exact fact/material at its local scope? | Consume Corpus decision; do not infer from source brand or bundle signature |
| Currentness | Does it describe the current target/use window? | P4/current target use requires eligible current profile; ordinary historical practice may be labelled accordingly |
| Source breadth | How broadly is the pattern supported? | Narrow/one-source support can be anchor-only, never invented prevalence |
| Analytical independence | Were mirrors/derivatives/provider clusters discounted? | Consume effective support; do not recount URLs or bundle records |
| Capability/use eligibility | May this result support the requested role? | Enforce exact role; exploratory cannot drive learner priority/Readiness |
| Exact-action rights | May this component be displayed, reproduced, adapted, generated from, cached/offlined or transformed? | Check each action and component; most restrictive required component controls composite use |
| Attribution/conditions | What exact notice/placement/modification rule must App satisfy? | Compile against the intended App surface; inability to render denies direct use |
| Accessibility | Does the learner task have required alternatives and honest evidence equivalence? | Missing required alternative blocks publication/use; altered conditions narrow evidence honestly |

TELC relevance is not permission. Reusable rights are not correctness. High confidence is not P4 currentness. A bundle signature is only publication authenticity.

### 8.2 Rights and change impact matrix

| Imported change class | Immediate serving/cache action | App artifact action | Learner evidence / projection action |
|---|---|---|---|
| Metadata-only/non-semantic | None after verified import | Refresh labels/provenance | None; no recomputation |
| Pattern/intelligence changed | Keep current approved artifacts unless impact names them; stop generating from superseded result | Rebuild/review affected generation briefs and future selection | No learner change merely from a new prior; re-evaluate current coverage only when shaped rule says so |
| Correctness/structure invalidated | Stop affected item/form/media use immediately | Quarantine exact App selectors; validated replacement | Stage 09/06 scoped `not_counted`, `partially_valid`, or `pending`; no learner penalty; rebuild dependent projections |
| Trust/authenticity downgraded | Stop new decision-grade use when eligibility falls | Recompute affected blueprints/analytics lineage; review artifacts | Change evidence only if measuring instrument/fairness is affected, not because source reputation changed alone |
| Rights/direct-use revoked or conditioned | Deny exact display/cache/offline/transform as of effective time; purge affected bytes as required | Retire C1/direct component or fix attribution/condition; original non-reconstructive C2/C3 may remain after review | Past performance is not automatically invalid; no negative evidence from rights-only change |
| Takedown/prohibited/purge | Immediate deny overlay after verified impact; purge caches/bytes under disposition | Quarantine/purge exact or close-derivative scope; preserve only permitted tombstone | Smallest defensible legal/fairness impact; history remains only as permitted non-content audit |
| Taxonomy migration | Stop new assignment to retired meaning | Apply rename/reparent/merge/split successor mapping | Preserve facts; merge without duplicate; split lowers certainty and requires fresh direct child evidence |
| Target-currentness change | Stop old revision for new current P4 selection | Revalidate P4/forms/coverage and publish successors | Historical attempt remains; current target coverage/Readiness may become missing/Pending, never zero |
| Accessibility/attribution defect | Stop affected presentation | Provide equivalent successor or correct notice; re-run App QA | Affected barrier/fault is `not_counted` or narrower claim; never learner failure |

Verified `stop_new_use` is deliberately faster than full evidence repair: the App writes an authoritative deny/impact record first, and every serving authorization reads current App eligibility as defense in depth. Purge, replacement and targeted rebuild then run idempotently. If an impact is ambiguous, quarantine the smallest defensible conservative superset and record why; do not globally erase unrelated work.

### 8.3 No-match, sparse evidence, and exact-content behavior

- An exact decision-grade miss falls back in order to a stronger broader parent pattern, relaxed non-essential topic constraint, verified target anchor without prevalence, explicitly permitted generic-B1 pattern, then App-curated seed. It never fabricates precision.
- `insufficient` and `anchor_only` are valid Corpus eligibility outcomes, not zeros or learner states.
- Reference-only/unknown/prohibited expression does not enter ordinary blueprint or App generation payloads. If a pattern cannot be made non-reconstructive, Corpus withholds it or broadens the abstraction.
- Exact C1 use requires every component action, attribution, accessibility, target and App QA gate. Otherwise App creates original practice from eligible pattern intelligence.

No legal-compliance claim is made. Jurisdiction-, license-, moral-rights-, trademark-, retention-, and takedown-language review remains required in Stage 23 with qualified counsel where needed.

## 9. Runtime independence, cache/fallback states, and Corpus downtime

### 9.1 Cache/fallback state table

| Import/cache state | New App authoring/selection | Learner runtime and P4 | Operator/recovery action |
|---|---|---|---|
| Active compatible snapshot | Local catalogue supplies eligible priors/blueprints | App-approved practice/P4 normal; no Corpus call | Poll index asynchronously; measure age |
| Corpus discovery/pull outage | Use active snapshot or curated App seed; label known limitations | **All approved practice and previously approved P4 continue**; outage alone changes no evidence | Backoff with jitter; alert on policy age; resume idempotently |
| Active snapshot older than preferred refresh SLO but no known expiry/withdrawal | Ordinary authoring may continue with explicit currentness/sufficiency; avoid inventing new precision | Existing approved practice/P4 continue because age alone is not revocation | Prioritize refresh; operator reviews material target risk |
| Known effective target/rights limit reached | Do not create/use affected current/direct capability | Only affected new P4/direct asset is unavailable or downgraded; unrelated practice continues | Use compatible successor or curated replacement |
| Unsupported major candidate | Ignore/quarantine candidate | Active compatible App inventory continues | Upgrade importer in controlled release or wait for compatible export |
| No active compatible snapshot | Use App-curated seed/original bank only | Existing App-approved inventory that does not require an expired/withdrawn Corpus capability continues | Restore last validated snapshot or import compatible candidate |
| No exact match / sparse evidence | Broaden safely or use curated seed | Honest lower-confidence/generic practice; no fake P4/frequency claim | Record coverage gap and publication need |
| Verified revoked exact asset | Immediate deny and purge/cache invalidation | Neutral replacement; past result not automatically wrong | Reconcile App selectors and exact action disposition |
| Digest/cache mismatch | Reject exact bytes; never fetch “latest” | Do not start affected task; replacement/unaffected skills continue | Re-fetch exact immutable object; security alert if repeated |
| Snapshot semantic projection rebuilding | Keep last validated unaffected projection | Dependent conclusion is Pending/rebuilding only; history/unaffected work visible | Shadow validate then atomic publish |

### 9.2 Corpus-downtime walkthrough

1. Before the outage, App has active compatible Corpus snapshot `S`, App-approved P0–P4 content/form/media revisions, and serving policy `A`. A P4 form pins current target, blueprint, rights, approval and asset revisions.
2. Corpus becomes unreachable. The App import worker records an operational outage and stops publication work. It does not modify `S`, `A`, content approvals, learner evidence, or Readiness.
3. A learner chooses `Coach me` or a skill. App computes capability, due repair, freshness and preference from its private learner state. It sends nothing to Corpus.
4. App resolves desired task properties against its local accepted catalogue and App-approved content bank. Normal practice receives a server-authorized Stage 09 serving manifest from cached/versioned App inventory.
5. A previously approved P4 form remains selectable because Corpus unavailability is not a rights, target, content or accessibility defect. Its preflight, timer, playback, freshness and form integrity still run in App. If an independently known effective limit already passed, only that new P4 claim is withheld.
6. The attempt, response, evaluation and evidence flow only among browser, App runtime, App database/object storage and any separately selected App evaluator. No Corpus endpoint, raw source, AI, learner ID or profile participates.
7. New Corpus-derived intelligence, exact provenance drill-down and publication promotion wait. App original/curated authoring may continue against `S` with stated limitations.
8. On recovery, the worker requests only the publication index since the highest seen sequence, verifies and imports new immutable changes, then applies targeted App revalidation. It never guesses missed changes or rewrites attempts made during the outage.

Boundary proof is testable: normal learner routes have no Corpus network credential/client; egress policy denies the Corpus publication host from the learner web process; only the import worker can read it. Contract serialization fails on forbidden learner/profile fields, and integration fixtures assert zero Corpus calls and zero learner-data bytes for practice, P4, mocks and Readiness.

## 10. Failure, recovery, and uncertainty behavior

| Failure | Scope and state | Safe behavior | Recovery/evidence consequence |
|---|---|---|---|
| Index unavailable/timeout | Import operation only | Active snapshot remains | Retry bounded/backoff; no learner effect |
| Invalid index/bundle signature or revoked/unknown key | Candidate quarantined, security incident | Never parse/promote as trusted | Rotate/reconcile key through governed App release; active snapshot remains |
| Replay/sequence regression | Candidate rejected | Never roll back via an old index | Require a new signed explicit rollback entry |
| Partial download/object missing | Staging only | Resume by digest; no partial promotion | Delete corrupt partial; no learner effect |
| Digest/declared size/media mismatch | Candidate or exact asset quarantined | No “latest” substitution | Republish a new immutable revision; affected App task unavailable if already impacted |
| Schema/enum/required capability unsupported | Capability closure `incompatible` | Last compatible/App-curated fallback | Controlled importer upgrade; never coerce/guess |
| No match/sparse support | Corpus result `insufficient`/broader | Broaden or use curated seed | Fine claim absent, never zero or P4 inflation |
| Stale/currentness uncertain | Limitation on result | Ordinary labelled use only where allowed; current P4 waits if the governing fact is no longer supported | Import verified target release; no learner blame |
| Rights/attribution revoked | Exact action denied | Stop display/cache/offline and replace | Rights-only change does not create negative evidence |
| Correctness/fairness defect | App impact Pending/rebuilding, then Stage 06 validity | Stop exact use, preserve unaffected units/history | Targeted idempotent correction; fresh fair opportunity |
| Accessibility metadata/alternative missing | Candidate/content ineligible | Do not publish/start inaccessible task | Add equivalent reviewed successor; altered condition labelled honestly |
| Operator unavailable | Material candidate awaits review | Runtime uses active snapshot | Queue without auto-expanding authority |
| Corpus change during a pinned attempt | App serving manifest remains the occurrence reference; verified emergency stop can narrow safely | Preserve response/effort; no client guess | Apply impact after submission at exact scope; never punish learner |

Pending blocks only the dependent conclusion. Missing remains absent, not zero. The only learner-evidence validity vocabulary remains `valid`, `partially_valid`, `pending`, `interrupted`, and `not_counted`; import/cache states are operational and never masquerade as those states. Written and Oral remain independent, Safe remains distinct from Ready to Book, and no probability field or calculation is introduced.

## 11. Security, privacy, rights, and accessibility implications

### 11.1 Security and access controls

- Separate Corpus publisher/signing and App importer identities. The Corpus private signing key never enters App; App stores an allowlisted public-key ring with activation/revocation metadata and overlapping rotation.
- Private authenticated transport uses least-privilege read-only machine credentials held only by the import worker. Learner web/runtime and browser bundles contain neither transport credentials nor Corpus client code.
- Verify index before following locations; allowlist publication origin/path; disallow redirects to untrusted origins, active documents, executable payloads, path traversal, symbolic links and undeclared network references.
- Enforce declared and configured byte/record/depth/count limits before allocation/decompression. Parse isolated staging; sanitize exact content again under Stage 09 before learner rendering.
- Canonicalize and verify the manifest, then verify every object. Reject identity/digest reuse, duplicate JSON keys, unsupported algorithms and unknown critical fields. Do not log raw/reference expression, exact answer material, credentials, signatures/private URLs, or learner payloads.
- Key rotation uses a pre-trusted new public key or an App-governed trust update, overlapping verification, a signed test fixture and rollback. A bundle cannot introduce its own trusted key. Compromise triggers key revocation, candidate quarantine and revalidation of affected accepted bundles; it does not automatically invalidate learner evidence.
- Outbox/import operations use idempotency identity and accepted sequence. Operators authenticate separately, supply reason, and cannot edit imported facts or learner evidence directly.

### 11.2 Privacy and data minimization

Corpus receives no learner data. Publication is one-way Corpus → App. The discovery request contains only highest publication sequence/supported contract metadata and ordinary transport metadata; no learner/session/profile value. The App does not return attempt outcomes or analytics to Corpus in this stage. Any future privacy-safe aggregate calibration flow requires independent product authorization, aggregation/de-identification proof, purpose/retention contract and Stage 23/24 review; it cannot reuse this import credential silently.

Raw/reference source material is internal rights-sensitive data, not learner data, but is still minimized. Normal bundles contain non-reconstructive summaries. Exact source partitions are capability-specific, operator-only and imported only when a real direct-use/audit need and action eligibility exist.

### 11.3 Rights and accessibility publication gates

For exact components, the App must be able to render every required author/provider/rightsholder credit, source/title/link, license/notice, modification statement and placement/timing condition without exposing answers or implying provider endorsement. Mixed-rights components do not inherit the permissive component. Offline/cache/transcode are separate actions; display permission does not imply them.

Every learner-playable task must carry the Stage 09 accessibility manifest: semantic interaction, keyboard/select alternative, language and reading order, meaningful alt/decorative role, written instructions, transcript/caption/reveal rule, accessible playback/recording controls, zoom/reflow suitability and honest evidence-equivalence effect. Corpus metadata assists App QA; it never delegates App accessibility approval back to Corpus. Missing required alternatives fails closed to a different eligible task, not a learner penalty.

## 12. Performance, reliability, operations, cost, and exit

### 12.1 Performance and reliability posture

- Learner-attempt Corpus request count: **0**. Learner-runtime Corpus transfer and model/search cost: **0**.
- Import work is asynchronous, resumable by digest, bounded and lower priority than learner runtime. A promotion never requires restarting or synchronously invalidating an in-progress attempt.
- Capability-scoped partitions allow a small target/rights impact without downloading every raw/reference asset. Exact assets are separately digest-addressed and fetched only when the capability and App review need them.
- Active and last-compatible pointers, immutable accepted snapshots, App-owned approved inventory and transactional outbox provide rollback/reconciliation without multi-region, event streaming, Redis, Kubernetes or a new database.

### 12.2 Cost model and measurement

No fixed euro budget or new commercial service is invented. Existing PostgreSQL, worker and private S3-compatible object storage are reused. The operational quantities are:

~~~text
discovery_transfer_per_period = publication_index_bytes × successful_poll_count
import_transfer_per_period = sum(new_manifest_and_object_bytes) + bounded_retry_bytes
accepted_storage = active_snapshot_bytes + last_compatible_bytes
                   + evidence_referenced_metadata + eligible_exact_asset_bytes
invalidated_work = affected_app_revisions + affected_cache_keys
                   + affected_projection_generations
runtime_corpus_calls_per_attempt = 0
runtime_corpus_model_cost_per_attempt = 0
~~~

Measure index and bundle bytes, delta/duplicate ratio, import transfer/retry, object and PostgreSQL storage, active/last-compatible/reference generations, cache purge bytes/time, semantic diff size, impacted App revisions, reconciliation jobs, reviewer minutes and failed promotions. Poll cadence, bundle size caps and preferred freshness SLO are versioned operational parameters with owner, provenance, effective date, evidence and rollback; Stage 23/24/26 set numeric alert thresholds from rights/target risk and observed publication behavior.

Cheapest safe fallback is lower-frequency batch publication plus App-curated content, never live per-click Corpus access or weakened P4/accessibility/rights gates. Compact only rebuildable query projections and unreferenced rejected/staging bytes. Retain immutable metadata needed to explain accepted App artifacts; prohibited exact bytes follow the stronger purge rule.

### 12.3 Operational measures and alerts

Monitor publication index age/sequence, import success and duration, active compatible snapshot by capability, signature/key/replay/digest/schema failures, candidates awaiting review, target/rights effective deadlines, snapshot and exact-asset bytes, currentness/sufficiency distribution, withdrawal-to-App-deny latency, cache purge completion, impact-to-rebuild completion, App content coverage/fresh-family/P4 gaps, and operator review load.

Alert when there is no eligible active/last-compatible capability, a signed stop-use impact misses its risk-class SLO, a target/currentness deadline approaches without a validated successor, repeated integrity/replay failures occur, a candidate is stuck past its review SLO, P4/fresh inventory is constrained, or storage/transfer/reviewer load exceeds its accepted envelope. Corpus outage itself is operational degradation, not a learner incident while App inventory remains healthy.

### 12.4 Provider and architecture exit

The contract is portable UTF-8 canonical JSON/JSON Lines plus ordinary immutable objects/digests/signatures. App can export accepted manifests, records, migrations, governance and permitted bytes; PostgreSQL and S3-compatible storage remain the provider exit paths selected earlier. Transport location and object provider can change without changing bundle/result IDs. Signing implementation can change behind the same Ed25519 verification contract; an algorithm change is a new packaging major and ADR.

Consider a query API only when measured bundle transfer/index/query latency or operator drill-down demand cannot be met through partitioning and local indexes. Consider delta bundles only when duplicate transfer remains material after capability partitioning; every delta must still resolve to a complete immutable snapshot before promotion. Add stronger signer custody/transparency only after Stage 23 threat findings, another write-capable Corpus operator, or an integrity incident. No upgrade may introduce learner data, live learner-runtime Corpus dependency, raw-source search, or per-click Corpus AI without a superseding product decision and ADR.

## 13. Validation and release evidence

| Validation suite | Required proof / exit condition |
|---|---|
| Source/continuity | Required blobs and predecessor decisions pinned; no earlier output/design/shaping mutation |
| Contract fixtures | Golden bundle for all six families/governance; no Corpus storage/table names required by consumer |
| Cryptographic | RFC 8785 canonicalization/errata cases, RFC 8032 vectors, altered manifest/object, wrong/revoked/rotated key, replay and identity/digest collision all fail correctly |
| Structural/resource safety | Duplicate keys, negative zero/invalid Unicode, unknown critical field, oversize/depth/count, path traversal, executable/undeclared object and partial download quarantine without runtime effect |
| Compatibility | Patch, safe minor, unknown consequential enum, family closure, packaging/family/contract unsupported major and old-worker fixtures |
| Identity/migration | Rename/reparent/merge/split/retire/target successor fixtures preserve facts, deduplicate merges and do not clone split mastery |
| Six-family semantics | Reference, structure, aggregate, graph, blueprint and demand records map to App capability types; task demand never becomes learner difficulty/readiness |
| Non-reconstructive/rights | Restricted-expression leak/similarity fixtures, mixed-component rights, action-specific cache/offline/transform, attribution rendering and purge/tombstone |
| Accessibility | Missing alternative blocks publication; equivalent keyboard/media/text paths; altered target conditions narrow evidence rather than penalize |
| Privacy boundary | Forbidden learner-field property tests, network egress test and request/telemetry audit prove zero learner data and zero learner-route Corpus calls |
| Promotion/rollback | Incomplete bundle cannot promote; capability closure switches transactionally; job retry idempotent; rollback uses still-eligible prior snapshot; pinned attempts never retarget |
| Change/evidence repair | Every impact class stops exact new use, maps App selectors and rebuilds only affected projections; rights-only change never creates negative evidence |
| Downtime/P4 | Extended Corpus outage fixture proves normal App practice, coaching, approved P4, attempts, mocks and Readiness continue without Corpus; known effective limit blocks only affected use |
| Cache/failure | Active, last compatible, no match, sparse, incompatible, revoked, digest mismatch, purge and rebuilding states match §9 and preserve unaffected work |
| Operations/cost | Import/storage/transfer/cache purge/reviewer metrics emitted; per-attempt Corpus calls/model cost remain exactly zero; restore/export fixture proves provider exit |

Release promotion requires all mandatory suites, a signed candidate, complete governance, semantic diff, scoped authority, rollback target, App content/accessibility/rights gates, and evidence that no unsupported field is ignored. Gold fixtures are versioned; validator/signing/import changes run shadow against the active and malicious corpus before promotion.

## 14. ADR created

- [ADR-0017 — Signed immutable Corpus bundles and atomic App promotion](adr/ADR-0017-signed-immutable-corpus-bundles-and-atomic-app-promotion.md) — **Accepted**. It records `ARCH-S10-D01`–`ARCH-S10-D10`, the bundle-first boundary, compatibility/promotion/cache posture, and review triggers.

No earlier ADR is amended or superseded. ADR-0017 refines ADR-0004, ADR-0012, and ADR-0016.

## 15. Earlier/later relationships and handoff

### 15.1 Downstream decisions that must be preserved

- Stage 11 consumes only App-imported eligible versions and App direct evidence; Corpus priors never create Readiness, probability, mastery or cross-compensation.
- Stage 12 defines commands/jobs/events around `ImportCorpusBundle`, candidate validation, promotion, impact and local catalogue contracts; it must keep import off learner request paths and preserve atomic/idempotent capability closure.
- Stage 16 serves only App-approved media. Exact Corpus assets require action rights, attribution, accessibility and immutable digest; routine media stays batch/cached.
- Stage 19 cannot use Corpus AI/search for learner runtime and cannot send learner text/audio/profile to Corpus. Corpus blueprint selection is local and deterministic.
- Stage 23 threat-models publisher key custody, import credentials, untrusted bundle parsing, exact-source isolation, rights/legal review, purge/tombstone and incident response without weakening this boundary.
- Stage 24 measures publication age, integrity, rights/impact SLOs, coverage, review load and cost; any aggregate feedback to Corpus is a separate, product-authorized privacy contract.
- Stage 25 includes every §13 fixture as release gates, especially zero learner egress, downtime/P4, compatibility, accessibility and targeted repair.
- Stage 26 owns environment credentials, key-rotation runbook, polling/alert values, promotion/release/rollback and restore/export operations using the chosen portable format.
- Stages 27–28 validate and consolidate the six-family/governance/compatibility/rights/downtime trace without reopening pattern-first, App-approved runtime inventory, separate rights/confidence, or zero learner data.

### 15.2 Dependencies introduced or removed

Introduced: one asynchronous private Corpus publication channel, Corpus Ed25519 signer, App public-key ring/import credential, bundle validator, accepted-snapshot catalogue and rights/change reconciliation jobs—all inside the already selected App worker/PostgreSQL/object-storage topology. Removed: any need for live Corpus API/search/AI, shared database, learner-runtime Corpus credential, or per-attempt Corpus availability.

### 15.3 Risks, assumptions, and required evidence

| Risk/assumption | Validation / mitigation |
|---|---|
| Corpus signer/key custody is adequate for high-impact rights/currentness publications | Stage 23 threat review; Stage 26 rotation/revocation drill; signature/replay incident fixtures |
| Capability partitioning keeps bundles economical | Measure bytes, duplicate ratio, import time and review diffs; add complete-snapshot delta format only after threshold evidence |
| Polling latency is acceptable for withdrawal/currentness risk | Risk-class withdrawal-to-deny/currentness SLO and drill; operator emergency import path; never learner-runtime polling |
| Corpus migrations are complete enough for App history | Gold rename/merge/split/retire fixtures and unresolved-mapping quarantine |
| Non-reconstructive summaries do not leak restricted expression | Human rights review plus similarity/leak regression; broader abstraction/withhold fallback |
| Imported accessibility metadata is accurate | App independently validates final learner artifact; missing/failed gate blocks publication |
| Active P4 remains supportable through ordinary outage | Downtime exercise using only App runtime/data/object stores and pinned form lineage |

### 15.4 Intentionally deferred implementation choices

- Exact object path convention, JSON Lines chunk/compression framing and configured byte/count limits: Stage 12/26, while immutable manifest/digest/complete-snapshot semantics are fixed here.
- Physical signer key storage, credential manager, rotation cadence and emergency access mechanics: Stage 23/26; Ed25519, pinned public trust and no bundle-introduced trust are fixed.
- Numeric polling, freshness preference, withdrawal/purge and review alert SLOs: Stage 23/24/26 based on rights/target risk and measurements; asynchronous pull, outage behavior and effective-limit semantics are fixed.
- Operator review UI and exact approval workflow presentation: Stage 13/23/26; scoped authority, audit, material-change review and immediate verified deny are fixed.
- Query API/delta bundle: not launch dependencies; future architecture decision only after §12.4 measured triggers and never on the learner runtime path by default.

No unresolved owner question remains. Budget/provider/legal-risk preferences are not needed for the selected portable low-ops default; jurisdiction-specific legal interpretation remains explicitly deferred to Stage 23/legal review rather than guessed.

## 16. Definition-of-done check

- [x] Required live inputs, commits/blobs and predecessor continuity recorded.
- [x] Bundle/API/file/hybrid alternatives compared; signed immutable bundle-first pull selected.
- [x] Six families and governance envelopes mapped without Corpus table leakage.
- [x] Async publication, staged validation, atomic promotion, cache, rollback and offline fallback defined.
- [x] Contract/payload/model/taxonomy/target/rights versions, stable IDs, migrations, deprecation and unsupported major defined.
- [x] Confidence/currentness/breadth/independence/eligibility/rights/attribution/accessibility kept separate and actionable.
- [x] Normal practice and approved P4 Corpus-downtime walkthrough proves zero learner data and zero Corpus runtime calls.
- [x] Required pseudotypes, sequence, compatibility matrix, cache/fallback table and rights/change impact matrix included.
- [x] Security, privacy, rights, accessibility, failure/recovery, cost, operations, tests, fallbacks, exits and downstream preservation included.
- [x] Consequential ADR-0017 created; no owner blocker or implementer-owned consequential product rule remains.
