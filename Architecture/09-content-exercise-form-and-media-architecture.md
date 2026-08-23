# Bestehen / App — Content, Exercise, Form, and Media Architecture

> **Stage:** 09 of 28  
> **Status:** Accepted architecture decision  
> **Decision date:** 2026-08-23  
> **Scope:** App-owned content identities, approval, QA, publication, serving, freshness, media, rights enforcement, quarantine, and evidence-impact contracts; no production schema, endpoint, authoring UI, provider selection, or application code

## 1. Purpose and scope

This stage defines the smallest sufficient architecture by which Bestehen / App turns asynchronous Corpus intelligence and App authoring into original, reviewed, rights-aware, accessible, version-pinned learner work. It fixes the semantic identities and owner commands an implementation must preserve. It does not design a general CMS, let ordinary attempts query Corpus, or move learner state into content.

The governing invariant is: **the exact instrument seen by the learner remains explainable, and a defect in that instrument never becomes learner failure**. Content class, approval, evidence role, rights eligibility, target currentness, and learner freshness are distinct facts. None implies another.

In scope:

- C0–C4 classes, source/blueprint/brief/task/family/item/form/revision/media identities;
- approval authority and the draft → QA → publish → quarantine/retire lifecycle;
- structured briefs, keys, productive rubrics, content-point obligations, distractor rationales, media and rights envelopes;
- near-duplicate, exposure, fresh-family, form-composition, serving, cache, pinning, takedown, replacement, and evidence-impact rules;
- security, privacy, rights, accessibility, failure, cost, operations, and validation at this boundary.

Out of scope:

- production tables, endpoints, authoring screens, cache TTLs, codecs, TTS/AI vendors, reviewer staffing, and calibrated similarity thresholds;
- learner selection/coaching policy (Stage 08), skill-specific delivery/evaluation (Stages 10–12), Readiness calculation (Stages 15–17), or retention/deletion policy (Stage 24);
- any modification to shaping, Design, or earlier architecture.

## 2. Inputs, authority, and continuity

### 2.1 Pinned source record

GitHub was the source of truth. Shaping was read at immutable commit `9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc`; App was read at accepted commit `952bcaded9132c2dea9d756e296ba75d5be88f10`. Access/reconciliation date: 2026-08-23.

| Authority | Blob SHA |
|---|---|
| `app/28-bestehen-app-product-specification.md` | `18ae80cc2fd63cecd76c297c3e56d44a68367856` |
| `app/07-core-learning-loop.md` | `c313c859f64997972feca87497d70476c4528a20` |
| `app/08-a1-to-b1-progression.md` | `839a01c010cf79777520714d0ab09304a2ba9a06` |
| `app/09-reading-training.md` | `fcc41029a7dfc44a65feca0602b42c4fa40e53cf` |
| `app/10-language-elements-training.md` | `a5aac29a9cb4b84e2951fc64bf0b5f4b0d15e6bf` |
| `app/11-listening-training.md` | `e77948d6722b2ce635886d4b345e2ff9aad476a8` |
| `app/12-writing-coaching.md` | `0a606197ad514e8c8958004188837e37173258be` |
| `app/13-speaking-coaching.md` | `9462c78a1e7cc68249d38aa5a18a287be8aacd9c` |
| `app/16-mock-exams.md` | `8f6c23fa16524bd251cef39d823cfeea73bfcef3` |
| `app/21-content-strategy.md` | `8149d6a268da70e17cad46f774b9d5de77776986` |
| `corpus/12-corpus-app-contract.md` | `7add217f62118e5abe100680d2e8230a93b8c280` |
| `corpus/17-bestehen-corpus-product-specification.md` | `537b5185313097d043748f9dc9f9fdaf432ee71d` |
| `Design/DESIGN-HANDOFF.md` | `417a6820037e045e2dd9f29afc42b9f2e94fd638` |
| `Design/Bestehen-01-Design-System.dc.html` | `d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a` |
| `Design/Bestehen-02-Mobile-Screens.dc.html` | `0a9f2d3ea982c3197f399941b57defd9869d2428` |
| `Architecture/00-architecture-shaping-plan.md` | `b263c5e7b3bccc0450ddd17aa0cc007432d672b7` |
| `Bestehen_App_Architecture_Checklist.md` | `bc2564fe7d1b154fdae97df5da6754b2d87fab49` |
| Stage prompt | `1cbed2c7a1e598ef994158a2ddf41515721af037` |
| `Architecture/02-system-context-and-product-boundaries.md` | `046d114bbbc96528bf0b9eae0406c0235f759127` |
| `Architecture/04-domain-model-and-bounded-contexts.md` | `ab1a775d7689e47bba00c2544c247ef344c44e70` |
| `Architecture/05-data-ownership-persistence-and-schema-evolution.md` | `bb6df811ec9010de556d1719f22e31bb8ca3190e` |
| `Architecture/06-evidence-ledger-validity-versioning-and-audit.md` | `53d34ae65ef4c8fa79c00026f9bd5d7b876ce672` |

The four prerequisite stages are accepted and consistent. Stage 06's closed learner-evidence validity set remains exactly `valid | partially_valid | pending | interrupted | not_counted`; content approval/quarantine never adds an evidence-validity state:

- Stage 02 keeps Corpus asynchronous/non-runtime and sends it no learner profile.
- Stage 04 assigns content/form/media/rights/quarantine to **Content & Forms**, learner occurrence to **Session & Attempt**, and validity to **Evidence & Capability**.
- Stage 05 makes PostgreSQL semantic truth, private object storage the byte store, IndexedDB bounded local continuity, and corrections append-oriented.
- Stage 06 fixes immutable `content_family_id`, `content_revision_id`, `form_id`, `media_revision_id`, the five evidence-validity states, explicit exposure/independence, exact lineage, and targeted recomputation.

### 2.2 Authority reconciliation

The final App specification delegates content detail to `app/21-content-strategy.md`; the skill files add modality rules without conflict. Corpus owns provenance, authenticity/confidence, rights decisions for source material, deduplication, taxonomy, difficulty/relevance, and bundle eligibility; App owns the final learner artifact and its QA. Design requires one shared attempt shell with modality input regions, fixed conditions, accessible transcripts/instructions, no meaning truncation, and neutral local failure.

No contradiction was found. One terminology reconciliation is explicit: product Stage 21's phrase “invalid/excluded” maps to Stage 06's closed validity model as `not_counted` for wholly defective scope or `partially_valid` for an exact unaffected partition; no sixth validity state is introduced. Stage 27 precedence is applied throughout: validity/fairness → direct evidence → independent Written/Oral risk → uncertainty → repair/retention → progression/coverage → preference.

No mutable provider, browser quota, price, or codec is selected here. Therefore no commercial fact is asserted from memory; provider research is deferred until a provider is actually selected.

## 3. Decision registry

| ID | Recommended default and criteria | Alternatives considered and rejection | Consequence, fallback, review trigger | ADR |
|---|---|---|---|---|
| `ARCH-S09-D01` | Content & Forms owns one normalized immutable content graph with separate provenance class, approval, rights, target, and evidence-role dimensions. | A: files plus tags is simpler but cannot pin or repair history. B: one “quality” enum conflates unrelated gates. C chosen: explicit graph and envelopes. | More metadata, but no label silently grants Readiness. Fall back to Draft/non-serving on missing consequential meaning. Review only if a required artifact cannot be represented without state conflation. | ADR-0016 |
| `ARCH-S09-D02` | Preserve exactly C0–C4 as provenance/creation classes, orthogonal to approval and use. | A: collapse to generated/reused loses C2/C4 stakes. B: infer class from author/vendor is unstable. | Unknown class cannot publish. Class change requires a new revision/lineage assertion, never historical relabeling. | ADR-0016 |
| `ARCH-S09-D03` | Append approval decisions from Draft/quarantine through Training, Independent-B1, Readiness/P4, and Gold; freeze a revision on first publication. | A: mutable approved flag loses reviewer basis. B: automatic score alone is cheap but unproven. | Demotion/quarantine is immediate; restoration requires a new decision. Automation may reduce low-stakes review only after gold-set evidence. | ADR-0016 |
| `ARCH-S09-D04` | Use a structured non-reconstructive generation brief and ordered QA gates; routine content is batch-authored/generated, reviewed, cached, reused. | A: imitate one source risks rights/copy defects. B: per-click generation is fresh but unreviewed and costly. | Bank exhaustion yields lower-stakes practice or honest unavailability, never counterfeit fresh Readiness. Review when measured quality/coverage justifies bounded automation. | ADR-0016 |
| `ARCH-S09-D05` | Content family is the conservative semantic independence unit; exposure and form manifests make freshness explicit. | A: item ID/time gap is cheap but rewards cosmetic variants. B: embedding similarity alone is opaque and contestable. | Unresolved near-duplicate joins the same family. Fresh claims wait for a different eligible family. Recalibrate detection thresholds only against reviewed pairs. | ADR-0016; refines ADR-0013 |
| `ARCH-S09-D06` | Objective keys are deterministic, independently validated contracts; productive prompts use versioned semantic/rubric obligations and multiple valid paths. | A: generator key as truth propagates ambiguity. B: one model answer makes productive evaluation imitation. | Disagreement quarantines; dependent evaluation is Pending, never learner failure. | ADR-0016 |
| `ARCH-S09-D07` | Every exact media revision and direct-use asset carries integrity, accessibility, playback, derivation, and rights/attribution metadata. | A: URL-only asset references drift. B: script approval alone misses rendered defects. | Missing/broken required metadata blocks publication; exact faulty media scope is not_counted and replaced. | ADR-0016 |
| `ARCH-S09-D08` | Serve a server-authorized immutable manifest pinned before attempt start; separate learner-safe payload from server-only keys/rubrics and use version-addressed private bytes. | A: latest-on-each-fetch can mix versions. B: embed all keys offline leaks answers. | Existing pinned work can continue when fair; new high-stakes selection fails locally/uses preauthorized fresh package. Provider/cache exit does not change semantic IDs. | ADR-0016 |
| `ARCH-S09-D09` | Quarantine/takedown appends an impact assertion with exact scope, stops new serving, and triggers idempotent targeted evidence/projection recompute. | A: silent edit destroys audit. B: global invalidation penalizes unrelated evidence. | Unknown impact uses the smallest defensible conservative superset. Rights-only withdrawal does not automatically negate learner performance. | ADR-0016; refines ADR-0013 |
| `ARCH-S09-D10` | Low-ops PostgreSQL + durable jobs + private object storage; measure coverage, QA, reports, cache/egress, and impact repair before adding infrastructure or spend. | A: CMS/microservice/event-stream stack adds operations. B: manual files cannot enforce gates. | Batch/TTS/human-review cost is paid per accepted artifact, not per attempt. Upgrade only on measured quality, inventory, latency, or operator-load failure. | ADR-0016 |

## 4. Conceptual content, form, and media model

~~~mermaid
flowchart LR
  C[Corpus bundle<br/>blueprint + governance] --> B[GenerationBrief revision]
  B --> T[TaskDefinition revision]
  T --> FAM[ContentFamily]
  FAM --> CR[ContentRevision]
  CR --> I[Item identities]
  CR --> MM[MediaManifest revisions]
  CR --> RR[Key or productive rubric revision]
  I --> FORM[Immutable Form manifest]
  MM --> FORM
  RR --> FORM
  FORM --> AP[Approval decisions]
  AP --> SM[Serving manifest / attempt pin]
  SM --> E[Exposure + attempt facts]
  E --> EV[Evidence ledger]
  AP --> IMP[Quarantine / impact assertion]
  IMP --> EV
~~~

### 4.1 Identity and ownership

All IDs are opaque stable identifiers; hashes are integrity facts, not semantic identity. Material meaning never changes behind an ID.

| Identity | Exact meaning and version rule | Owner |
|---|---|---|
| `corpus_result_ref` / `blueprint_id@revision` | Versioned, non-reconstructive Corpus intelligence and governance envelope consumed asynchronously. Never contains a learner profile. | Corpus; App stores reference/snapshot |
| `source_component_ref` | Exact Corpus source component only when direct use is eligible; never copied into normal original-generation input merely because it exists. | Corpus |
| `generation_brief_id@revision` | App-owned intent: task family, P0–P4, capabilities, genre/domain, difficulty axes, answer/rubric, media, diversity, source-separation, desired approval. Revision is immutable once used to create a candidate. | Content & Forms |
| `task_definition_id@revision` | Versioned abstract mechanic and response contract shared across candidates; e.g. R2, SB2, H3, Writing, S2. It is not learner content. | Content & Forms, constrained by target/taxonomy |
| `content_family_id` | Conservative semantic exposure family: scenario/information configuration, decisive language realization, and answer/interaction path. Revisions, voices, shuffled options, names/dates, or cosmetic nouns do not create freshness. | Content & Forms |
| `content_revision_id` | Exact immutable learner-visible stimulus/instructions plus bindings to items, rubric, target, rights, and media. A material text/key/prompt/obligation change creates a successor revision. | Content & Forms |
| `item_id` | Exact immutable scorable/respondable unit within one content revision, including response cardinality and key/rubric binding. A material correction creates a successor item, not retargeting. | Content & Forms |
| `form_id` | Exact immutable ordered/clustered composition for a mini, section/component, full mock, or controlled confirmation, including form rules and all pinned family/revision/item/media references. | Content & Forms |
| `form_family_id` | Optional lineage grouping equivalent form designs; never proves freshness. | Content & Forms |
| `asset_id` | Logical asset lineage (audio/image/document) without implying byte equality. | Content & Forms |
| `media_revision_id` | Exact immutable rendered bytes and manifest, identified with digest, object key, rendition role, and accessibility bindings. A new voice/render/trim is a new revision but normally the same content family. | Content & Forms |
| `key_revision_id` / `rubric_revision_id` | Exact immutable objective or productive judgment contract. Evidence lineage records the one actually used. | Content & Forms; Productive Evaluation consumes |
| `approval_decision_id` | Append-only promotion/demotion/quarantine decision: level, allowed roles, scope, reviewer authority, inputs, gate results, time, effective version, reason, superseded decision. | Content & Forms / Operations & Governance |
| `serving_manifest_id` | Server-authorized immutable lease binding one attempt to exact revisions, actual allowed conditions, learner freshness result, and expiry/revocation status. | Session & Attempt requests; Content & Forms authorizes |
| `impact_assertion_id` | Append-only defect/rights/target change scope and disposition passed to Evidence & Capability recomputation. | Content & Forms; Evidence owns validity effect |

### 4.2 Five content classes (closed set)

Class describes where the learner-facing expression came from and its governed role; it does not grant approval.

| Class | Architecture meaning | Normal use and hard boundary |
|---|---|---|
| **C0 — Reference only** | Source/reference expression available to Corpus intelligence but not App learner display. | Only non-reconstructive approved pattern intelligence crosses. No text/audio/image/options/transcript or close recreation enters generation. |
| **C1 — Reusable source content** | Exact source component whose current action-level rights permit the intended use. | Direct use only with exact conditions/attribution. Rights alone never grants correctness, target fit, freshness, or Readiness. |
| **C2 — Curated gold original** | App-original or legally reusable artifact curated to the strongest documented benchmark/calibration role. | Diagnostics, regression, calibration, and high-confidence forms as separately approved. Gold is review status, not “human typed” or P4 difficulty. |
| **C3 — Validated original practice** | Human-authored/model-assisted App-original artifact that passed normal QA. | Main P0–P3 training and reviews; higher evidence only when separately Independent-B1 approved and conditions allow. |
| **C4 — Adaptive/ephemeral interaction** | Learner-response-dependent turn or narrowly tailored repair. | Low-stakes interaction/learning by default. It cannot silently enter a reusable bank or clean Readiness; learner input is not sent to Corpus or reused as training content. |

Unknown or malformed class fails closed to Draft. A class correction is appended and normally creates a successor revision when it changes learner-use meaning.

Class/approval paths are explicit:

| Class | Permitted approval path | Promotion authority |
|---|---|---|
| C0 | Draft/quarantine/reference-only; never learner approval | Corpus may change source eligibility; App Rights Reviewer may import a newly eligible component as C1, never rewrite old C0 history |
| C1 | Training/Independent-B1 only after exact use rights and all QA; exceptional target/reference calibration may be adopted into a separately governed C2 artifact | Rights Reviewer confirms action conditions; the same Content Reviewer/P4/Calibration authorities below grant the use role |
| C2 | Training, Independent-B1, Readiness/P4, and Gold as separately justified | Content Reviewer, Senior Reviewer, P4 Approver, or Calibration Curator for their scoped level |
| C3 | Training and Independent-B1; if selected for curated Gold/P4 use, create a fully reviewed successor C2 artifact rather than silently relabel the published C3 revision | Content Reviewer/Senior Reviewer; C2 successor follows P4/Gold authority |
| C4 | Draft plus explicitly bounded ephemeral learning use; no reusable-bank, Independent-B1, P4, or Gold promotion | Runtime interaction policy authorizes the occurrence; only a new separately reviewed C2/C3 artifact may enter the bank |

### 4.3 Core explanatory contracts

These are logical pseudotypes, not executable code or schema.

~~~text
ContentRevision {
  content_revision_id, predecessor_revision_id?, content_family_id,
  class: C0 | C1 | C2 | C3 | C4,
  generation_brief_ref, task_definition_ref, corpus_bundle_ref?,
  target_blueprint_version, taxonomy_version, capability_refs[],
  progression_profile, intended_evidence_roles[],
  learner_payload_ref, items[], key_or_rubric_ref, media_refs[],
  rights_envelope_ref, accessibility_manifest_ref,
  approval_current_ref, created_at, frozen_at?, digest
}

ServingManifest {
  serving_manifest_id, attempt_id, form_id?, content_revision_ids[],
  item_ids[], media_revision_ids[], key_or_rubric_versions[],
  allowed_conditions, learner_safe_payload_digest,
  freshness_decision: fresh | exposed_review | not_independent | unavailable,
  compared_family_refs[], authorization_version, issued_at, expires_at?,
  revocation_state
}
~~~

## 5. Approval, generation, QA, and publication

### 5.1 Approval levels and promotion authority

Approval is append-only and scoped to an exact revision/form/media set plus allowed evidence roles.

| Level/state | May serve | Required gates | Who may promote/demote |
|---|---|---|---|
| **Draft** | Nothing scored; isolated authoring preview only | Identity, brief, and input provenance exist; unresolved checks explicit | Authoring workflow creates; Content Reviewer may return/revise |
| **Quarantine** | No new learner serving; existing leases are revoked when safe and impact assessed | Credible material defect, incompatible metadata, rights/target concern, or failed gate | Automatic hard gate or authorized Content Quality Operator may quarantine; only a fresh completed review may restore |
| **Training-approved** | P0–P2, repair/review; selected P3 only when target/evidence mapping permits | Rights eligible; structural, independent key/rubric, naturalness, difficulty, anti-copy, media, accessibility, render tests pass | Human Content Reviewer at launch. Later low-stakes automation requires Stage 26 gold-set and incident evidence; Content owner remains accountable |
| **Independent-B1 approved** | Clean P3 B1 and high-stakes practice | Training gates plus independent answer/rubric rationale, verified target mapping, strong naturalness/difficulty/distractor review, low ambiguity | Independent Validator records validation; authorized Senior Content Reviewer promotes. One person may hold roles in a personal project, but cannot replace independent validation with self-confidence |
| **Readiness/P4 approved** | Exact P4, target-condition mocks and confirmations within scoped form | Current blueprint; complete form and final media human sign-off; target-calibrated format/difficulty; family independence; stable versions; no unresolved rights/key/rubric/media/accessibility defect | Authorized P4 Approver signs the complete pinned form/assets. No automated promotion |
| **Gold benchmark** | Regression, diagnostic/evaluator/audio calibration, canonical examples; only separately approved roles serve learners | Documented representative purpose, expected properties, edge cases, review rationale, stable calibration lineage | Calibration Curator plus Content & Forms owner. Gold status does not itself grant P4 |
| **Retired/withdrawn** | No new serving | Supersession, obsolete target, quality, coverage, or rights reason recorded; impact disposition explicit | Content owner or Governance; security/rights takedown can force immediately |

The same owner may perform several duties in a one-person operation, but the audit records distinct author, validator method/result, and approval commands. Generator output cannot validate its own key. Every launch batch gets human review. P4/gold human sign-off remains mandatory until a later ADR backed by Stage 26 evidence changes it.

Publication freezes the revision. Editing creates a successor Draft and reruns all affected gates. An approval may be downgraded without mutating prior decisions. Restoring a quarantined artifact requires new evidence and an explicit decision; it is never automatic because a job retried.

### 5.2 Approval state diagram

~~~mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Quarantine: hard gate fails / unresolved material risk
  Draft --> Training: all training gates + launch human review
  Training --> IndependentB1: independent validation + senior review
  IndependentB1 --> ReadinessP4: complete current form/media human sign-off
  Training --> Gold: curated benchmark decision
  IndependentB1 --> Gold: curated benchmark decision
  ReadinessP4 --> Gold: curated benchmark decision
  Training --> Quarantine: defect / rights / target impact
  IndependentB1 --> Quarantine: defect / rights / target impact
  ReadinessP4 --> Quarantine: defect / rights / target impact
  Gold --> Quarantine: regression defect / rights / target impact
  Draft --> Retired: abandoned/superseded
  Training --> Retired: orderly withdrawal
  IndependentB1 --> Retired: orderly withdrawal
  ReadinessP4 --> Retired: obsolete/superseded
  Gold --> Retired: superseded benchmark
  Quarantine --> Draft: successor revision starts full QA
  Quarantine --> Retired: confirmed withdrawal
~~~

### 5.3 Structured brief and ordered QA gates

The brief is built from approved target/currentness facts, non-reconstructive Corpus blueprints, coverage need, and App task rules—not from an instruction to rewrite one source.

Required brief dimensions:

- task family, target blueprint, P0–P4, intended evidence role, primary/supporting capabilities;
- genre/domain/register, linguistic and reasoning axes, response mechanics, timing/playback/interaction;
- objective answer contract or productive semantic/rubric obligations;
- freshness/diversity need and excluded recent/reference families;
- media, accessible alternatives, rights/action, attribution, and source-separation constraints;
- desired approval, validation plan, and provenance/version tuple.

Ordered gates, each with a recorded result and version:

1. **Eligibility/brief:** current target, Corpus support/limitations, rights-safe inputs, inventory need.
2. **Semantic task design:** information graph, decisive evidence, obligations/valid paths before polished language.
3. **Language/media creation:** natural German; render audio only after script semantic/language pass.
4. **Deterministic structure:** counts, IDs, cardinality, missing/duplicate bindings, SB bank rules, form constraints, target/right/accessibility presence.
5. **Independent key/rubric validation:** solve blind to proposed key; validate productive judgeability and alternatives.
6. **Naturalness/register:** plausible genre/spoken form; reject translated, stuffed, templated, culturally irrelevant, or machine-assembled expression.
7. **Difficulty/target fit:** explicit axes and gold/current target comparison; generator “B1” is never proof.
8. **Anti-copy/near-duplicate/diversity:** exact and semantic comparison, distinctive phrase/configuration review, family assignment.
9. **Final media/render/interaction:** final bytes, pronunciation, cue alignment, accessible metadata, speaker/private-input boundaries, browser render.
10. **Approval/publish:** append scoped approval; freeze revision and form.
11. **Post-publication loop:** reports, validator disagreement, unusual cross-learner patterns, target/rights changes; quarantine and impact.

### 5.4 QA/publication/quarantine sequence

~~~mermaid
sequenceDiagram
  participant O as Coverage/authoring operator
  participant C as Corpus ACL (async)
  participant F as Content & Forms
  participant V as Independent validator
  participant H as Human reviewer
  participant S as Session & Attempt
  participant E as Evidence & Capability

  O->>C: request pattern without learner profile
  C-->>O: versioned blueprint + governance envelope
  O->>F: create brief and candidate revision
  F->>F: deterministic structure, rights, copy, media, accessibility checks
  F->>V: blind key/rubric validation
  V-->>F: result + rationale + validator version
  F->>H: review naturalness, target fit, difficulty, final media/form
  H->>F: signed scoped approval decision
  F-->>S: publish immutable eligible manifest
  S->>F: acquire attempt-pinned serving manifest
  S-->>E: attempt/exposure with exact lineage
  O->>F: defect, takedown, or target-change report
  F->>F: quarantine; stop new serving; append impact scope
  F-->>S: revoke unstarted/unsafe leases; offer replacement
  F-->>E: idempotent impact assertion
  E->>E: append validity correction + targeted projection rebuild
~~~

## 6. Keys, productive rubrics, items, and forms

### 6.1 Objective key contract

Every scored objective item records:

- response cardinality and exactly the permitted keyed answer set;
- concise answer rationale and decisive stimulus span/semantic relationship;
- one rationale per distractor: why plausible, why wrong, and exam-relevant failure family;
- independent blind validator result, disagreement, validator release, and reviewer decision;
- candidate-bank/answer-position constraints where applicable;
- target/task/taxonomy/content/key versions.

The key remains server-only until the product flow intentionally exposes diagnosis. Reordering answers, changing names/dates, or changing only a voice cannot create a family. Multiple defensible answers, reliance on hidden world knowledge, or “what the author probably meant” quarantines the item. Objective scoring is deterministic against the exact pinned key; no runtime AI can vote a learner wrong.

### 6.2 Productive rubric contract

Writing and Speaking have no literal model-answer key. A `rubric_revision_id` records:

- official/current target dimension mapping separately from coaching dimensions;
- each semantic/content-point obligation, acceptable interpretation range, and observable fulfillment states;
- recipient/register/purpose for Writing; role, private/shared information, communicative goal, turn/interaction constraints for Speaking;
- several materially different valid paths and no hidden single plan;
- weak, B1-sufficient, and stronger calibration examples plus edge cases;
- supported dimensions, evaluator confidence requirements, disagreement/escalation behavior, and evaluator/prompt/calibration lineage.

A model response is delayed teaching/calibration material, not the comparison key. Same-prompt revision remains exposed learning evidence; a clean transfer requires a fresh family. If the evaluator cannot support a dimension, it is Pending/absent rather than zero.

### 6.3 Form composition

A form manifest is an exact frozen graph, not a query saved for later. It records sections/blocks, ordered stimuli/items, shared-stimulus clusters, families, media, rules, target version, timing/playback/preparation, approval, and digest.

- Shared questions on one stimulus may share a family and remain one correlated cluster; item count never inflates independence.
- No accidental duplicate family may appear elsewhere in the same form.
- P4 forms use only Readiness/P4-approved exact revisions and final assets.
- Form publication validates whole-form balance, answer-position/candidate-bank constraints, duration, asset completeness, and family independence.
- A learner-specific mock/confirmation manifest excludes every materially exposed family. A compromised form marks revealed families exposed.
- Booking confirmation uses families fresh from the qualifying mock and prior confirmation occasions; Written and Oral confirmations remain independently composed and never compensate for one another.
- Material composition, timing, key, rubric, or asset change creates a new `form_id`; history remains pinned to the old form.

## 7. Freshness, exposure, near-duplicates, and inventory

### 7.1 Conservative family assignment

Exact duplicate checks use canonical normalized text/structure and byte hashes; semantic checks compare scenario, information configuration, decisive relationships, answer path, prompt obligations, interaction constraints, and distinctive source expression. Automation may propose a cluster, but unresolved review is conservative: candidates join the same family or remain ineligible for independence. A calibrated numeric similarity threshold is not invented here; Stage 26 validates it against human-labelled duplicate/independent pairs with false-independent errors weighted highest.

An exposure fact is recorded when learner-visible stimulus, decisive information, key/model/rationale, transcript, or partner-private content is materially revealed. Abandonment does not erase exposure. Review may intentionally serve an exposed family but must label it repetition.

### 7.2 Freshness/independence table

| Use | Family rule | Occasion/evidence consequence | Exhaustion behavior |
|---|---|---|---|
| Initial learning attempt | Eligible family; may be new or intentionally reviewed as declared | Direct evidence only under actual conditions; class/approval do not override assistance | Choose another eligible family or declare content unavailable |
| Immediate retry | Fresh-equivalent family preferred/required for a claimed fresh check; same capability and approximate difficulty, changed semantic configuration | New attempt, same repair episode and normally same independent occasion; proves responsiveness, not recurrence | Exposed practice is allowed but labelled and cannot masquerade as transfer |
| Same-item review | Same family explicitly allowed | `repeated_exposed_practice`; teaching only | Continue review or defer |
| Delayed transfer | Different unexposed eligible family, broader topic/genre variation | New eligible independent occasion if all Stage 06 conditions pass | Defer independent claim; never use a near-duplicate |
| Retention check | Different unexposed family from learning/repair and prior retention occasion | New retention occasion; currentness still separate | Broader natural task or postpone |
| Mini/section mock | Frozen eligible form; learner-unseen families; correlated items clustered | One mock occasion; scope remains mini/section | Honest unavailable/rebuild form |
| Full mock | Whole Readiness/P4-approved current form; unseen independent families | One full-mock occasion even with many items; clean conditions granular | Do not reuse an exposed form as fresh |
| Booking confirmation | New current P4 families independent from qualifying mock and prior confirmation, separately sufficient for Written/Oral claim | Confirms only direct component/scope; no cross-gate compensation | Gate remains waiting for evidence and inventory is prioritized |
| Defect replacement | New eligible revision in a different family unless only byte delivery changed without learner exposure | Original faulty scope is not_counted/partial; replacement is a fair new opportunity, never negative retry history | Postpone affected task without global block |

Coverage projections count eligible **independent families**, not raw items. They index task, P0–P4, capability, topic/genre, register, distractor archetype, difficulty axes, voice/speaker pattern, Writing recipient/purpose, Speaking interaction path, approval, target, and rights state. Refresh is coverage-/exposure-/quality-/target-driven, not a calendar rewrite.

## 8. Media and rights/attribution envelopes

### 8.1 Media manifest

Every final learner-used media revision binds:

- `asset_id`, `media_revision_id`, immutable object key, cryptographic digest, size, MIME/codec/container and rendition role;
- language, duration, channels/speakers/voice identity class, script/transcript revision, cue/question alignment, intended speed and playback rule;
- render/generator/voice release and derivation lineage without exposing restricted source expression;
- pronunciation QA for names, numbers, dates, times, prices, abbreviations, corrections/negations; clipping/silence/volume/artifact results;
- accessible name, alt text or transcript/caption, text instructions, reading order, interaction metadata, and when an answer-bearing transcript may appear;
- rights envelope reference, approval decision, target/use roles, retention/privacy class, supersession/withdrawal state.

Audio approval applies to final bytes, not merely the script. P0–P2 may use reviewed cached batch TTS; P3 may use audited high-naturalness TTS with voice diversity; P4 prefers human/native or premium-generated final assets human-audited against the target. These are quality roles, not provider mandates. Changing a voice alone is never a fresh family.

### 8.2 Rights and attribution envelope

Rights is enforced for the exact action and asset; authenticity/confidence remains separate.

| Field group | Required meaning |
|---|---|
| Identity/currentness | Envelope ID/revision; source/component/revision; current/superseded/withdrawn/takedown state; effective time |
| Separate trust | Local authenticity/confidence and QA references, never collapsed into permission |
| Action eligibility | Display, reproduce, adapt/derive, generate-from, cache, download/offline, transform/transcode, territory/audience limits; `allowed`, `allowed_with_conditions`, `reference_only`, `unknown_review_required`, or `prohibited` |
| Conditions | No-derivatives, placement, modification notice, expiry, attribution, share-alike or other exact obligation; unresolved condition denies that action |
| Exact credit | Author/provider/rightsholder text, title/source, required link/reference, license/notice identifier/text, modification notice, placement/timing rule |
| Component scope | Which text, image, audio, transcript, option, or composite component is covered; mixed envelopes never inherit the most permissive status |
| Provenance | Corpus contract, rights-decision and source revisions; non-reconstructive grounding manifest for original content |
| Incident/disposition | Withdrawal/takedown reason, purge/tombstone constraint, successor, affected App artifact selectors, review owner |

C0/unknown input is isolated from learner-generation expression; only a non-reconstructive blueprint is accepted. C1 is served only when every action condition can be rendered without revealing answers or implying TELC/provider endorsement. Original C2/C3 is labelled Bestehen practice; hidden inspiration is not false learner-facing attribution. If a condition cannot be satisfied, use original App content.

Authoring inputs are untrusted. Intake strips/isolates executable markup, active documents, external URLs and metadata; validates types/digests; scans media where appropriate; sanitizes rendered learner content; and treats embedded prompt instructions as data. Restricted source expression is access-controlled away from ordinary generation. No authoring payload, answer key, private asset URL, or operator credential enters learner logs.

### 8.3 Accessibility publication gate

Publication requires:

- written instructions for audio instructions; transcript/captions and reveal phase for listening/repair;
- meaningful alt text or explicit decorative role for images; no image-only question without an equivalent target-valid path;
- semantic response mechanic and a keyboard/select-then-place path identical in evidence to drag behavior;
- focus/read order, language tag, non-truncated task/content-point/reason text, zoom/reflow suitability, and no color-only state;
- accessible playback/recording labels and controls; no inaccessible alternative silently claimed equivalent—actual support and claim narrowing go to the evidence envelope.

If an accessibility support changes target conditions, the task remains fair practice at actual conditions and the claim narrows; it is never learner failure.

## 9. Serving, caching, pinning, and client contract

### 9.1 Authority and cache strategy

PostgreSQL stores semantic identities, immutable manifests, approvals, rights/accessibility facts, exposure indexes, and impact/audit history. Private EU S3-compatible object storage holds immutable media bytes, as selected in Stage 03; object keys are version-addressed and digest-verified. The web/API serves learner-safe manifests and short-lived authorized byte access. CDN/browser/service-worker/IndexedDB caches are replaceable copies, never authority.

The server chooses from published eligible revisions using desired capability/conditions plus App-owned learner exposure. It does not send a learner profile to Corpus. Selection and scoring do not invoke Corpus or generation AI per click. Keys, answer rationales, hidden partner inputs, and evaluator-only rubric details are segregated server-side until their shaped reveal phase.

Before an attempt starts:

1. validate class, approval role, target/currentness, rights, accessibility, asset integrity, family freshness, and form constraints against a named policy/source cut;
2. allocate `attempt_id` and immutable `serving_manifest_id`;
3. pin exact content/item/form/media/key/rubric revisions and actual permitted conditions;
4. deliver only learner-safe payload and authorized bytes;
5. append exposure as material is revealed; submit/evaluate against the pinned contract even if a newer revision publishes.

An already loaded fair practice task may continue offline using its pinned safe payload; responses/drafts/checkpoints queue under Stage 05 rules. A preauthorized P4 package may continue only if its timer/playback/integrity rules remain provable. Otherwise only the affected target-condition claim becomes interrupted/unavailable. New high-stakes selection requires a current authorized manifest, not stale cache.

### 9.2 Client-visible discriminated states

The client renders server-owned exhaustive states:

- `available`: exact manifest, approval/evidence role and learner-facing conditions;
- `loading_media`: attempt not yet started where media is required;
- `unavailable_no_fresh_family`: honest inventory limitation and alternative/postpone action;
- `unavailable_rights_or_target`: neutral replacement without leaking legal/operator detail;
- `quarantined_after_pin`: stop before response where possible or preserve submitted occurrence and await impact disposition;
- `media_failed_not_counted`: “This wasn't you,” replacement/postpone;
- `replacement_ready`: a fair new manifest, never a forced retry penalty;
- `update_required`: unsupported consequential contract/enum; never silently reinterpret.

Missing, unknown, quarantined, or incompatible content never renders a score, zero, weakness, or pass-probability field.

### 9.3 Boundary commands and events

Logical owner commands:

- `ImportCorpusBundle`, `CreateDraftRevision`, `SubmitForQA`, `RecordGateResult`, `RecordApprovalDecision`, `PublishRevision`;
- `AcquireServingManifest`, `RecordExposure`, `ReportContentProblem`;
- `QuarantineScope`, `WithdrawRightsUse`, `RetireTargetRole`, `PublishReplacement`, `EmitImpactAssertion`.

Every mutation has operation ID, expected version, actor/authority, payload hash, reason, and occurred/effective/recorded time. Conflicting idempotency reuse fails. Outbox events carry identities and scopes, not whole restricted content or learner profiles. No consumer writes Content & Forms tables directly.

## 10. Quarantine, takedown, replacement, and evidence repair

### 10.1 Impact selectors and dispositions

| Incident | Stop/replacement behavior | Evidence disposition |
|---|---|---|
| Wrong/ambiguous key or contradictory stimulus | Quarantine item/revision/family as scoped; replace with new validated family | Affected objective unit `not_counted`; unaffected exact units may be `partially_valid`; remove dependent Mistake/Readiness influence |
| Productive rubric/obligation defect | Stop prompt/form; new rubric cannot be applied as though seen unless a valid compatible correction is proven | Affected rubric dimensions Pending during review, then partial/not_counted; no forced negative evaluation |
| Broken/misaligned media | Stop exact media revision and dependent content/form serving; script may remain for future successor asset | Only media-dependent units/conditions not_counted; unrelated modalities/units survive |
| Accessibility barrier/product defect | Stop inaccessible path; offer equivalent accessible successor or different task | Affected scope not_counted; accommodation may narrow target claim but never penalize |
| Rights-only direct-use withdrawal | Stop display/cache/download immediately; revoke unstarted leases and purge bytes as required | Correctness/performance is not automatically negated. Apply legal/policy disposition; remove current use and preserve only permitted tombstone lineage |
| Restricted-expression similarity incident | Quarantine generated artifact/family; regenerate from broader eligible blueprint | If fairness/correctness unaffected, prior capability need not be negative; current/future eligibility and any legally required disposition are scoped explicitly |
| Target blueprint change | Stop affected old P4/current role; prioritize new forms | Historical direct capability may remain; current target-condition/Readiness eligibility recomputes and may become missing/Pending, never zero |
| Attribution/notice rendering failure | Stop exact direct-use presentation until satisfiable | Rights use invalid; learner performance not automatically wrong unless the content instrument was also defective |
| Takedown/purge | Immediate deny, cache purge and governed deletion/tombstone behavior | Use Corpus impact scope; Evidence applies smallest defensible permitted reconciliation |

Impact assertions name content/item/form/media/rubric/blueprint/family selectors, affected learner-evidence scope, reason class, correctness/fairness/rights/target dimensions, effective interval, confidence, successor, and required purge/tombstone policy. Evidence & Capability alone appends validity assertions and rebuilds projections. Content & Forms never edits learner results.

Recompute jobs are idempotent by impact assertion + projection kind + generation. They rebuild affected capability, Mistake, Review, Progression, Readiness, mock, booking, and learner-copy projections in shadow generations, then atomically publish. If exact scope cannot be proven, quarantine the smallest defensible superset and say why. The last validated unaffected projection remains; dependent conclusions are Pending/rebuilding. A learner gets neutral correction copy and a fresh opportunity.

### 10.2 Serving/cache failure matrix

| Failure | Learner behavior | State/evidence | Recovery/operation |
|---|---|---|---|
| PostgreSQL/content API unavailable before start | Local surface says task unavailable; other cached/local work may continue | No attempt/evidence | Retry locally; no Corpus dependency |
| Private media/object store unavailable before start | Do not start media-dependent attempt | No learner penalty | Retry, alternate eligible asset/task, monitor storage/cache |
| Media fails mid-attempt | Neutral “This wasn't you”; offer replacement/postpone | Media-dependent scope not_counted; unrelated scope preserved | Quarantine if integrity defect; ordinary retry if transient, always new fair attempt |
| Cached digest/version mismatch | Reject cache; never fall back to “latest” | No start or affected scope not_counted | Re-fetch exact revision; alert integrity monitor |
| No fresh eligible family | Explain inventory limitation | Independent claim absent, never repeated-as-fresh | Broader compatible task, low-stakes exposed practice, or defer and prioritize review |
| Unsupported contract major/enum | Update-required/unavailable affected surface | No reinterpretation/zero | Use last compatible published snapshot only if still eligible |
| Key/rubric validator disagreement | Candidate never publishes; post-publication report quarantines | Pending review or not_counted after impact | Human adjudication/new successor revision |
| Target/rights change while loaded | Stop before start when possible; submitted occurrence preserved | Scoped impact process, not client guess | Reconcile lease and evidence through owner commands |
| Quarantine job/event delayed | Eligibility read checks current authoritative status as defense in depth | No new serving from stale projection | Durable retry; alert on reconciliation lag |
| C4 provider/evaluator unavailable | Continue objective/other coaching; productive result Pending or use reviewed non-adaptive fallback | No negative learner evidence | One bounded escalation then uncertainty; no per-click content regeneration |

## 11. Security, privacy, reliability, operations, and cost

### 11.1 Security, privacy, and rights controls

- Least-privilege roles separate authoring, validation, approval, P4/gold curation, rights/takedown, and incident actions; all semantic actions use audited owner commands. One owner may hold roles but history remains explicit.
- Original generation receives only approved brief fields and non-reconstructive grounding. Restricted source blobs, answer keys, private learner data, credentials, and raw operator notes are excluded from prompts.
- Learner payloads are structurally separated from answer/evaluator payloads. Private object access is scoped and short-lived; logs use IDs/digests, not task text, audio, answers, or signed URLs.
- C4 uses only the minimum live response context; it is not published, added to Corpus, or used to train/grow the bank. Raw speaking audio follows the accepted ephemeral policy (delete after evaluation, always within seven days); Stage 24 owns final retention machinery.
- Content reports attach exact revision/attempt scope but expose personal context only to authorized review. Corpus change reconciliation uses content selectors, not learner profiles.
- Attribution/rights are operational policy facts, not a claim of legal compliance. Jurisdiction-specific license, quotation, trademark, accessibility, and takedown procedure review remains required before public launch/direct-source use.

### 11.2 Reliability and operational measures

Monitor with class/role/target/version labels but no learner content:

- eligible independent-family inventory and days/attempts-to-exhaustion by task/P0–P4/component;
- QA pass/disagreement/quarantine rates by template/generator/validator/reviewer release;
- reviewed near-duplicate false-independent/false-duplicate results and diversity coverage;
- reports per served revision/family, severity, time to quarantine, replacement, impact identification and recompute completion;
- P4/gold human-review queue age and complete-form sign-off coverage;
- media render/integrity/pronunciation failures, unavailable bytes, cache hit/miss, storage, egress, and rendition count;
- stale approvals/target/rights envelopes, takedown reconciliation lag, serving-deny defense-in-depth hits;
- serving latency/availability and manifest/key-version mismatch;
- batch generation/TTS/model cost, human review minutes, rejected-candidate waste, storage/egress cost.

Alerts favor correctness: new serving after quarantine/takedown, key exposure, digest mismatch, unsupported contract reinterpretation, or failed impact recompute is high severity. An inventory shortage is visible product capacity, not silently lowered QA.

### 11.3 Cost and sustainability

Default cost shape:

1. reuse versioned Corpus bundles;
2. batch-author/generate candidates;
3. run deterministic checks and cheap duplicate screening;
4. use one independent semantic validator where needed;
5. human-review launch batches and every P4/gold complete form;
6. batch-render TTS/media once, store immutable approved assets, cache and serve many times;
7. generate more only for coverage, exposure, quality, target, or rights triggers.

Primary drivers are high-stakes human review, rejected generation/validation, audio rendering/renditions, immutable media storage, and egress/cache misses. Routine attempt serving/scoring has no AI cost. Cost may choose among equivalent-quality models/media paths, never remove pass-critical Writing/Oral content, evidence truth, accessibility, or repair.

Cheaper fallbacks:

- human-authored templates and smaller reviewed bank instead of broad model generation;
- reviewed batch TTS for lower rungs and a small reusable human/native benchmark bank;
- deterministic/manual near-duplicate review instead of a vector service;
- fewer honest task choices or deferred independent measurement instead of unreviewed runtime generation.

Upgrade triggers:

- measured gold-set QA or incident rates show the cheap generator/validator harms validity/naturalness;
- fresh P4 inventory/reviewer throughput blocks required independent Written/Oral evidence;
- storage/egress/cache misses or media processing breach measured operating targets after ordinary optimization;
- manual duplicate/reconciliation work exceeds sustainable owner capacity;
- turn-based C4 measurably fails interaction validity and a stronger bounded provider improves it.

Provider exit is preserved by App-owned briefs, manifests, rubrics, approvals, media digests, and S3-compatible export. Export original bytes plus manifests and relational metadata; regenerate only replaceable renditions. No provider identity becomes a content semantic ID.

## 12. Validation and release evidence

Before implementation release, test:

| Test family | Required proof |
|---|---|
| Identity/version | Old attempts always resolve exact text/item/key/rubric/media/form; material edits cannot retarget IDs |
| State/authority | Every legal promotion/demotion/quarantine transition; unauthorized/direct writes rejected; no auto-restore |
| Class/approval/use | Matrix tests prove C0 never displays, rights never grants QA, Gold never grants P4, C4 never becomes reusable/readiness by accident |
| Objective/productive | Blind key validation, ambiguity fixtures, distractor rationales, multiple valid Writing/Speaking paths, evaluator disagreement → Pending/quarantine |
| Freshness | Reviewed duplicate/near-duplicate pairs; shuffled/options/voice/names remain same family; fresh retries preserve capability/difficulty; mock/confirmation disjointness |
| Forms | Whole-form constraints, correlated shared-stimulus items, no accidental family reuse, current P4-only composition, immutable digest |
| Media | Script-byte fidelity, pronunciation/cue/clipping/artifact fixtures, digest/cache mismatch, voice diversity, transcript reveal phase |
| Rights/security | Action-level deny/condition/attribution, mixed-component least permission, takedown/cache purge, malicious authoring/prompt/markup/media fixtures, key/URL/log leakage |
| Accessibility | Text instructions/transcripts/alt metadata, keyboard-equivalent mechanics, language/read order/non-truncation, claim narrowing for non-equivalent support |
| Failure/recovery | Storage/network/media/evaluator/target/rights/quarantine-race drills produce no learner penalty and no global block |
| Impact/recompute | Item/media/rubric/form/blueprint/right scopes yield correct partial/not_counted/Pending effects; idempotent retries; no unrelated evidence changes |
| Cost/operations | Inventory, QA, reports, review effort, batch/TTS/storage/egress metrics reconcile to auditable artifacts and trigger rules |

Content release is promoted against a versioned gold/regression set. A generator, validator, rubric, target blueprint, media pipeline, or similarity-policy change runs shadow comparison first; rollback selects the prior approved release and does not mutate already served history.

## 13. ADR

Created:

- `Architecture/adr/ADR-0016-immutable-approved-content-manifests-and-family-independence.md` — **Accepted**. It records immutable published artifact manifests, append-only approval, conservative family independence, version-pinned serving, and scoped quarantine/repair.

No earlier ADR is amended or superseded. ADR-0016 refines ADR-0010 ownership, ADR-0012 persistence, and ADR-0013 evidence lineage/impact.

## 14. Downstream contract

Stages 10–12, 15–19, 23–26, and 28 must preserve:

- exactly C0–C4, with class orthogonal to approval, rights, target, and evidence role;
- original reviewed cached content as the routine default; no objective/per-click generation path;
- immutable exact revision/form/media/key/rubric pinning and server-only answer material;
- content family plus explicit exposure as the freshness unit; fresh Written/Oral evidence remains independent;
- deterministic objective keys and semantic productive rubrics with bounded uncertainty;
- final-byte media QA and accessible alternative metadata before publication;
- exact action-level rights/attribution on every reusable component; Corpus remains asynchronous and receives no learner profile;
- append-only quarantine/impact and targeted Stage 06 validity/projection recomputation; faults have zero learner penalty;
- no overall compensation between Written and Oral, no missing-as-zero, and no pass probability.

Dependencies introduced: stable Corpus bundle/governance compatibility; Content & Forms approval and impact commands; Session & Attempt pinned manifests/exposure; Evidence & Capability impact ingest; private immutable object bytes; durable reconciliation jobs. No new service/provider dependency is introduced.

## 15. Risks, assumptions, deferrals, and review triggers

| Item | Disposition / future owner |
|---|---|
| Human review is the initial throughput bottleneck | Accepted safety trade-off. Measure minutes, queue age, disagreement and incidents; Stage 26 may justify automation for low-stakes Training only |
| Family assignment may over/under-cluster | Conservative default; label benchmark pairs and weight false independence highest. Stage 26 owns calibration evidence |
| P4 inventory may be too small | Honest unavailable/booking gate waiting; do not weaken independence. Product/Content operations owns inventory before launch |
| Direct-source legal interpretation | No owner blocker now because original content is default. Jurisdiction-specific legal review owns actual license/trademark/takedown decisions before use |
| Exact similarity method/index | Deferred implementation choice to Stage 23/26; must satisfy semantic contract and exportability |
| TTS/generation/evaluator provider and voices | Deferred to relevant provider/security/AI stages; batch/cached, no semantic provider ID, measured upgrade/exit contract fixed here |
| Codecs, renditions, signed-access duration, cache quota/prefetch | Deferred to Stage 18/19/23 implementation architecture; exact revision/digest, private access and offline claim rules fixed here |
| Raw-content retention after takedown and learner deletion | Stage 24, subject to immediate serving/cache deny and required purge support fixed here |
| Numeric bank size, similarity threshold, QA automation cutoff, SLO/budget | Versioned calibrated parameters with provenance/effective date/rollback, owned by Stages 23/24/26; no invented number |
| Authoring/review UI and staffing separation | Implementation/operations choice; owner commands, authorities, audit and non-self-validation semantics fixed here |

No owner question blocks Stage 09.

## 16. Definition-of-done check

- [x] Every required source and prerequisite was fetched at recorded GitHub commits/SHAs and authority was reconciled.
- [x] C0–C4, identities, exact asset references, approval levels/promoters, lifecycle, generation/QA/publication, freshness/forms, keys/rubrics, media/rights, serving/cache/pinning, quarantine/replacement/recompute are explicit.
- [x] Alternatives, rationale, consequences, security/privacy/rights, accessibility, failure, cost, operations, compatibility, exit/fallback and triggers are documented.
- [x] The conceptual model, lifecycle state diagram, freshness table, QA sequence, rights envelope, and serving/failure matrix are present.
- [x] ADR-0016 is accepted and downstream preservation, risks, validation, dependencies, deferrals and owner-blocker status are named.
- [x] No production code, provider mandate, Design/Shaping change, pass probability, or compensating gate was introduced.

Stage 09 is architecture-complete with no owner blocker.
