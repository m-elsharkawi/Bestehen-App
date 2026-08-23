# Bestehen / App — Authoritative Architecture Specification and Implementation Roadmap

> **Stage:** 28 of 28  
> **Status:** Architecture consolidated; implementation remains unstarted  
> **Decision owner:** Stage 28 / final architecture handoff  
> **App source cut:** `m-elsharkawi/Bestehen-App@59ba1e2a8adf5a602357fb7ac659ebdfc84840f7`  
> **Shaping source cut (read only):** `m-elsharkawi/Bestehen-Shaping@9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc`  
> **Specification date:** 2026-08-23  
> **Scope:** architecture specification and implementation roadmap only; no application code, deployment, migration, Design edit, or Shaping edit

## 1. Purpose, authority, and how to use this specification

This is the authoritative implementation-facing index and composition of accepted Architecture Stages 01–27. It settles the cross-cutting owner, contract, compatibility, failure, release, security, accessibility and phasing rules an implementation agent must preserve. It does **not** erase the detailed rationale or silently replace a narrower stage contract: when this document points to an earlier stage or Accepted ADR, that source remains normative detail. A change to an accepted durable decision requires a superseding ADR; a feature branch cannot reinterpret it.

Authority is applied in this order:

1. `m-elsharkawi/Bestehen-Shaping/app/28-bestehen-app-product-specification.md`.
2. Detailed Shaping `app/01-*` through `app/27-*`; a final-spec delegation keeps the detailed rule normative.
3. `02_Bestehen_Identity.md`.
4. `01_Bestehen_Product_Overview.md`.
5. `Design/DESIGN-HANDOFF.md` and human-authored `.dc.html`, only where consistent with product truth.
6. Design runtime/example code, which is illustrative.

Within an otherwise valid product choice, precedence is fixed: **validity and fairness → direct evidence in the claimed modality → independent Written/Oral pass risk → uncertainty resolution → due repair and retention → progression and coverage → learner preference**. Urgency and learner override may change plan priority, never truth.

Implementation uses this specification as the registry, the referenced stage for detailed contract, the linked ADR for durable rationale, and the release evidence bundle for proof. If they appear inconsistent, stop the affected claim, apply the authority rule, and open an architecture review; do not guess.

### 1.1 Complete-product boundary

Bestehen / App is an account-optional, responsive German exam coach for TELC Deutsch B1. It owns learner state, approved practice, coaching, evaluation acceptance, evidence interpretation, deterministic Readiness, mocks, data rights and UX. Bestehen / Corpus is a separate asynchronous rights-aware intelligence product. It owns source provenance, trust/confidence, rights metadata, taxonomy, difficulty/relevance and publication eligibility; it receives no learner profile and is never a routine learner-runtime search or AI dependency.

The learner loop is **Observe → Attempt → Diagnose → Repair → Retry → Remember** across Reading, Language Elements, Listening, Writing and Speaking. P0–P4 are local condition profiles per task family/direct lane, never a global learner level. Writing and Oral evidence are pass-critical from the first truthful learner-facing slice; an objective-only shell may exist internally but may not be presented as the complete product.

## 2. Reproducible input cut and continuity

The App head was independently re-fetched before drafting. It is the accepted Stage-27 commit, whose parent is `d76d3e8f5bca49bd4dd7daa3022ca669570afce5`. The Shaping head remains read-only. The Stage-28 output did not exist. The pre-write checklist blob is `35be476229fb4c4e171b1e234fbb7e6b52a8c665`; the Stage-28 prompt blob is `19a7d78d225550efa8557d0ac9d931703a86a6fe`; the shaping plan blob is `b263c5e7b3bccc0450ddd17aa0cc007432d672b7`; and the ADR index blob is `41fd35cfb2e2933f05ee5d8a8719ad025c4c862f`.

All bodies in the manifests below were fetched in full at these immutable cuts before deciding. `support.js` was read only as renderer context. Archival `.docx`, thumbnails and duplicate upload snapshots were not treated as separate authorities.

### 2.1 Shaping authority manifest

| Path | Blob SHA | Read scope |
|---|---:|---|
| `01_Bestehen_Product_Overview.md` | `42f15da945e03f1d8e32dfe010f95aae6b87daa3` | complete current body |
| `02_Bestehen_Identity.md` | `f8799407f7b4a5a657f8c81439425d5a004f4e1c` | complete current body |
| `Bestehen_App_Product_Shaping_Checklist.md` | `f73ad7b50f2ebb9309b16ba5ab98e070a40008bb` | complete current body |
| `Bestehen_Corpus_Product_Shaping_Checklist.md` | `d7ff5c2f957e8157f6ef84fc3e027b7c02828981` | complete current body |
| `app/01-product-thesis.md` | `6bbb074dc6a262cb66cebad960dd248d1010f21f` | complete current body |
| `app/02-complete-learner-journey.md` | `3c536176154a8239aeafc0697acd947280130142` | complete current body |
| `app/03-initial-diagnostic.md` | `038ab89b0be23464eedf1408111dd1936320f57a` | complete current body |
| `app/04-learner-model.md` | `f7ae1f4af375ee3302d04c726d8fe8453a9daf80` | complete current body |
| `app/05-mistake-memory.md` | `a7c574b08c33418eab44aba8b6e9b7f8ab877109` | complete current body |
| `app/06-daily-coaching-engine.md` | `3cd869cd337dd3a878c27f35e1e8b5dad0c4c7bb` | complete current body |
| `app/07-core-learning-loop.md` | `c313c859f64997972feca87497d70476c4528a20` | complete current body |
| `app/08-a1-to-b1-progression.md` | `839a01c010cf79777520714d0ab09304a2ba9a06` | complete current body |
| `app/09-reading-training.md` | `fcc41029a7dfc44a65feca0602b42c4fa40e53cf` | complete current body |
| `app/10-language-elements-training.md` | `a5aac29a9cb4b84e2951fc64bf0b5f4b0d15e6bf` | complete current body |
| `app/11-listening-training.md` | `e77948d6722b2ce635886d4b345e2ff9aad476a8` | complete current body |
| `app/12-writing-coaching.md` | `0a606197ad514e8c8958004188837e37173258be` | complete current body |
| `app/13-speaking-coaching.md` | `9462c78a1e7cc68249d38aa5a18a287be8aacd9c` | complete current body |
| `app/14-review-and-spaced-repetition.md` | `fa9b65e92cd1511e00e106a199eb6fbc06273a69` | complete current body |
| `app/15-telc-readiness.md` | `b4456939928493569336bbc565d7e67307e7a3db` | complete current body |
| `app/16-mock-exams.md` | `8f6c23fa16524bd251cef39d823cfeea73bfcef3` | complete current body |
| `app/17-ready-to-book-logic.md` | `9e3e8b24faefe885d5b10409725619d0d0d84e6d` | complete current body |
| `app/18-coach-personality-and-behavior.md` | `7bc3c2ee918264911a9550fe20e53dc565f986dd` | complete current body |
| `app/19-information-architecture-and-core-screens.md` | `615ba3ce97fb25f974b6ba3a020cf254ddd0065f` | complete current body |
| `app/20-progress-and-motivation.md` | `fd8d002dbb79fd66dca3fdfa8f6771318f76cbe4` | complete current body |
| `app/21-content-strategy.md` | `8149d6a268da70e17cad46f774b9d5de77776986` | complete current body |
| `app/22-user-controls-vs-coach-autonomy.md` | `27f33cd56a09df27952e15bb3dfd0e077b89633c` | complete current body |
| `app/23-exam-date-and-urgency.md` | `5942ed811bcbaa5baaf1dd55079b8971d34b1d01` | complete current body |
| `app/24-analytics-and-success-metrics.md` | `28d1a5380a7ea9f28efdc95ce0c96987920917e1` | complete current body |
| `app/25-business-model-and-product-boundaries.md` | `904ae20e8cb3f9f354d6505513821e86f609622b` | complete current body |
| `app/26-platform-accessibility-nonfunctional.md` | `8137091683941b0d55f3d4fb90af3c402b8371e5` | complete current body |
| `app/27-end-to-end-scenario-validation.md` | `5da3b0a27ba516770210773399f0415cfb1f5460` | complete current body |
| `app/28-bestehen-app-product-specification.md` | `18ae80cc2fd63cecd76c297c3e56d44a68367856` | complete current body |
| `corpus/12-corpus-app-contract.md` | `7add217f62118e5abe100680d2e8230a93b8c280` | complete current body |
| `corpus/17-bestehen-corpus-product-specification.md` | `537b5185313097d043748f9dc9f9fdaf432ee71d` | complete current body |

### 2.2 Design source manifest

| Path | Blob SHA | Authority use |
|---|---:|---|
| `Design/Bestehen Logo/Bestehen Logo System.dc.html` | `5eb296da8a83531306195c9d91dd30cbeed8c608` | human-authored behavior/layout source |
| `Design/Bestehen-01-Design-System.dc.html` | `d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a` | human-authored behavior/layout source |
| `Design/Bestehen-02-Mobile-Screens.dc.html` | `0a9f2d3ea982c3197f399941b57defd9869d2428` | human-authored behavior/layout source |
| `Design/Bestehen-03-Desktop-Responsive.dc.html` | `94056db181b45298a759ff727ad5cfeac2f2a469` | human-authored behavior/layout source |
| `Design/Bestehen-04-Flows-Handoff.dc.html` | `7120b05a2272c31e5896e4313a7007935f5d0aed` | human-authored behavior/layout source |
| `Design/Bestehen-Type-Options.dc.html` | `7b51302ad1943c2676a5bb28d54aa7ead28b8dcd` | human-authored behavior/layout source |
| `Design/DESIGN-HANDOFF.md` | `417a6820037e045e2dd9f29afc42b9f2e94fd638` | human-authored behavior/layout source |
| `Design/support.js` | `cb009b69ec6b5e00f48c6287a587fe7e0c6c421b` | renderer context only |

### 2.3 Accepted architecture continuity

| Path | Blob SHA | Continuity status |
|---|---:|---|
| [00-architecture-shaping-plan.md](./00-architecture-shaping-plan.md) | `b263c5e7b3bccc0450ddd17aa0cc007432d672b7` | plan |
| [01-architecture-charter-and-quality-attributes.md](./01-architecture-charter-and-quality-attributes.md) | `cc8d28816f43d627861d11cd90e8770c4c96414c` | accepted |
| [02-system-context-and-product-boundaries.md](./02-system-context-and-product-boundaries.md) | `046d114bbbc96528bf0b9eae0406c0235f759127` | accepted |
| [03-technology-stack-and-repository-strategy.md](./03-technology-stack-and-repository-strategy.md) | `907b04c57813dc50f92a7ed00e49196ff7d4a924` | accepted |
| [04-domain-model-and-bounded-contexts.md](./04-domain-model-and-bounded-contexts.md) | `ab1a775d7689e47bba00c2544c247ef344c44e70` | accepted |
| [05-data-ownership-persistence-and-schema-evolution.md](./05-data-ownership-persistence-and-schema-evolution.md) | `bb6df811ec9010de556d1719f22e31bb8ca3190e` | accepted |
| [06-evidence-ledger-validity-versioning-and-audit.md](./06-evidence-ledger-validity-versioning-and-audit.md) | `53d34ae65ef4c8fa79c00026f9bd5d7b876ce672` | accepted |
| [07-learner-model-mistake-memory-progression-and-review.md](./07-learner-model-mistake-memory-progression-and-review.md) | `ad58238aee48e41a0d4bd30bd21ac5a17707656f` | accepted |
| [08-coaching-engine-and-session-state-machines.md](./08-coaching-engine-and-session-state-machines.md) | `02c5e1ee5967bad976eda49ab4813a768eda5bd3` | accepted |
| [09-content-exercise-form-and-media-architecture.md](./09-content-exercise-form-and-media-architecture.md) | `e6fb121ab1b10c6cbcf692bc88acaf98f2e45e7a` | accepted |
| [10-corpus-integration-compatibility-cache-and-rights.md](./10-corpus-integration-compatibility-cache-and-rights.md) | `d4e1ab25e359dcfcc506ee29462760a41647138d` | accepted |
| [11-readiness-scoring-mocks-and-ready-to-book.md](./11-readiness-scoring-mocks-and-ready-to-book.md) | `7c327cd770460b94107f2756e2b7d8f29c56b909` | accepted |
| [12-api-contracts-jobs-events-and-idempotency.md](./12-api-contracts-jobs-events-and-idempotency.md) | `c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528` | accepted |
| [13-frontend-application-and-design-system-architecture.md](./13-frontend-application-and-design-system-architecture.md) | `7da94f122fa86412b0d1a12b84c123645693efb4` | accepted |
| [14-responsive-accessibility-browser-and-device-architecture.md](./14-responsive-accessibility-browser-and-device-architecture.md) | `362068924a6942eb955dcc132fb4c94da122597b` | accepted |
| [15-reading-and-language-elements-runtime.md](./15-reading-and-language-elements-runtime.md) | `ef7f4228f9f48fe0c9f8bd8e1e7494177c6be667` | accepted |
| [16-listening-audio-tts-and-media-delivery.md](./16-listening-audio-tts-and-media-delivery.md) | `6bb60e2d6048a39035107ff427a0c4fd305c1ba6` | accepted |
| [17-writing-editor-autosave-and-evaluation-pipeline.md](./17-writing-editor-autosave-and-evaluation-pipeline.md) | `c2c3de417f1d3bcd8c53e1bf40fbb49522c34529` | accepted |
| [18-speaking-audio-stt-partner-and-evaluation-pipeline.md](./18-speaking-audio-stt-partner-and-evaluation-pipeline.md) | `2f118f817a99b76dc1e0c38c0aedaa1e0662268e` | accepted |
| [19-ai-gateway-model-governance-evaluation-and-cost.md](./19-ai-gateway-model-governance-evaluation-and-cost.md) | `60aef66f8443e747935b2cfb479dd7f4dd4d5c23` | accepted |
| [20-account-local-first-profile-sync-export-and-deletion.md](./20-account-local-first-profile-sync-export-and-deletion.md) | `9a1aa2d5fea31ff0bdccfc4561806bb870511ab6` | accepted |
| [21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md](./21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md) | `1216f98f5489119b4d8114804ac87936bc78ddd4` | accepted |
| [22-notifications-scheduling-and-time-zones.md](./22-notifications-scheduling-and-time-zones.md) | `6e0e8a761b9cf83a75931e815f447e148e3a20d0` | accepted |
| [23-security-privacy-rights-retention-and-threat-model.md](./23-security-privacy-rights-retention-and-threat-model.md) | `abc1a300d5b0fd659d28f768669dd73afbb90887` | accepted |
| [24-analytics-calibration-observability-performance-reliability-and-cost.md](./24-analytics-calibration-observability-performance-reliability-and-cost.md) | `c588f48790e2fc06b9ba656fddace222d73e554a` | accepted |
| [25-testing-evaluation-and-quality-gates.md](./25-testing-evaluation-and-quality-gates.md) | `83f4f481fb681bf09666032a4e06e7c77289e883` | accepted |
| [26-environments-ci-cd-release-and-operations.md](./26-environments-ci-cd-release-and-operations.md) | `c81412c46aa3b2a77ac9fcb4a0840e1b63af8bd4` | accepted |
| [27-end-to-end-architecture-validation.md](./27-end-to-end-architecture-validation.md) | `f3b08eafd99700d97540fbaabb061cee4b3b5af0` | accepted |

### 2.4 Exact reconciliations inherited from Stage 27

| ID | Lower-authority mismatch | Binding implementation consequence |
|---|---|---|
| `S28-R01` | `DESIGN-HANDOFF`, Flow Handoff, plan and prompts say 24 mobile screens; current `Design/Bestehen-02-Mobile-Screens.dc.html` has 26 numbered frames. | The Stage-13 semantic frame map and Stage-25 corrected acceptance matrix cover all 26. A stale count cannot omit a frame or create a route-per-frame. |
| `S28-R02` | Design Flow A implies a six-minute first session; product specifies a resumable five-skill foundation diagnostic, normally 18–22 minutes with a hard 30-minute ceiling. | Six minutes may yield useful partial evidence and `evidence_building`; it cannot claim complete placement. |
| `S28-R03` | Design Pending copy says usually under a minute and one recovery row uses >30 seconds; product/architecture distinguish first useful feedback, connected degradation and explicit Pending. | Copy projects the current measured policy/SLA and never hard-codes a provider promise. Productive work is ordinarily useful within about 15 seconds and explicitly Pending at about 30 seconds under the accepted baseline. |
| `S28-R04` | Design groups Ready to Book into four rows and shortens weakness lifecycle. | API/domain preserves Gates A–F and Candidate/Historical-Unconfirmed/Known/Repairing/Stabilizing/Repaired/Resolved plus reopen-to-known. UI may group without deleting states/reasons. |
| `S28-R05` | Design says deletion is immediate, total, irreversible and has no backup. | Access revocation and live purge start immediately; inaccessible bounded backup residual and restore suppression remain truthful for at most 91 days. Raw audio is excluded and stricter. |
| `S28-R06` | Design uses `practice-only` and mock verdict labels beside validity. | They are conditions/eligibility or mock projections. Stored/API validity remains exactly five values. |

No item above requires a Design/Shaping edit or owner decision. Stage 27 found no consequential unresolved ownership conflict, circular dependency, hidden Corpus runtime dependency, new formula, provider-owned truth or unassigned architecture choice.

## 3. Immutable semantic contract

- Evidence validity is exactly `valid`, `partially_valid`, `pending`, `interrupted`, `not_counted`. Partial and Pending always carry affected scope and reason.
- Readiness is exactly `evidence_building`, `not_ready`, `borderline`, `safe`, `ready_to_book`, `stale_contradicted`.
- Learning evidence and Readiness evidence differ. Missing estimate is absence, never zero.
- Written and Oral are independently eligible, calculated and gated. Overall target performance is bottlenecked by the weaker eligible component; one cannot compensate for failure in the other.
- Official target pass line 60 and Bestehen's versioned Safe default 65 are distinct. Safe is not Ready to Book; Ready requires all Gates A–F and is reversible.
- The current system has no pass-probability field, model, event, copy template, generic carrier or hidden calculation. Future activation needs a separate product decision, empirical/fairness/privacy/legal/copy evidence, contract major and superseding ADR.
- All five skills share session, attempt, result, repair and evidence foundations. Modality-specific facts—objective key, listening occurrence, Writing draft/evaluator and Speaking capture/STT/turns—remain typed.
- Historical observations and conclusions retain the compatibility vector active at occurrence. A new content/model/evaluator/blueprint/calibration release targets current revalidation; it never rewrites history.
- Technical, content, media, accessibility, browser, network, evaluator, identity, storage, notification or deployment fault is system-owned and neutral. It cannot become poor performance, a weakness, zero or Readiness decline.

Unknown consequential states, versions or release axes fail closed only for the smallest dependent claim. Unaffected learning remains useful.

## 4. Final decision registry

| ID | Recommended decision and criteria | Credible alternatives rejected | Data/API/version and cross-cutting consequence | Consumers, fallback, review trigger / ADR |
|---|---|---|---|---|
| `ARCH-S28-D01` | Use this document as the authoritative cross-stage registry while keeping Stages 01–27 and ADRs normative detail. Criteria: traceability, no silent supersession, implementability. | **Do nothing:** implement from 27 long reports, risking drift. **Rewrite everything here:** loses rationale and creates duplicate truth. | Every consequential rule links one owner/stage/ADR. Conflict fails the affected claim and opens review. | All implementers. Fallback is referenced detail. Review on a proven ambiguity or superseding product decision. ADR-0001–0034. |
| `ARCH-S28-D02` | Implement a private pnpm modular monorepo: Next.js 16/Node 24 LTS/TypeScript 5.9, PostgreSQL 18 + explicit SQL/Kysely, pg-boss worker, private EU R2, Render Frankfurt. Criteria: smallest low-ops portable topology that meets truth/recovery. | **Single client-only app:** cannot own durable truth/jobs. **Microservices/Kubernetes/event platform:** unsupported solo operations. | Same-origin HTTP, one database authority, logical contexts and provider ports; immutable object bytes. Exact releases are pinned and revalidated before promotion. | Platform/Operations. Standard Node/SQL/S3 export; split only on measured security, independent scale/deploy or availability need. ADR-0002, 0006–0009. |
| `ARCH-S28-D03` | Give every consequential state one command owner; persist occurrence/correction facts append-oriented and rebuild versioned projections from explicit source cuts. Criteria: audit, correction, idempotency, deletion. | **Mutable learner document:** overwrites lineage. **Full event-stream platform:** unnecessary operations. | Provider/UI/cache/analytics carry projections only. Corrections append and targeted shadow generations publish atomically. | All contexts. Last validated projection may be stale/rebuilding; full replay is bounded fallback. ADR-0010, 0012–0014. |
| `ARCH-S28-D04` | Share one five-skill attempt/evidence shell with closed modality extensions and local P0–P4 profiles. Criteria: semantic consistency without erasing modality. | **Five separate products:** drift. **Generic arbitrary workflow engine:** hides directness/media/productive meaning. | One kernel contract and typed extension majors; no cross-lane negative transfer or global rung. | Skills/frontend/testing. Add extension only through contract review; split when unsafe casts/conditional spread prove the seam wrong. ADR-0011, 0021, 0023–0026. |
| `ARCH-S28-D05` | Keep scoring, validity, planning, learner projections, Readiness and booking deterministic, versioned and App-owned. Criteria: reproducibility, independent gates, explainability. | **Model-generated final truth:** nondeterministic and costly. **Client-local formula:** divergent. | Exact five/six states, reason registry, independent Written/Oral, absent missing values, probability structurally absent. | Evidence/Measurement/Coaching/API/UI. Smallest clarifier or Pending is fallback. Review only via validated calibration or superseding product decision. ADR-0001, 0013–0015, 0018. |
| `ARCH-S28-D06` | Consume signed immutable Corpus capability bundles asynchronously; App separately approves serving/evidence and resolves learner needs locally. Criteria: privacy, rights, outage independence. | **Live Corpus API/search per click:** runtime coupling and learner-data risk. **Manual mutable files:** weak compatibility/withdrawal. | No learner fields cross the ACL; exact bundle/family/rights releases and last-compatible pointer. | Content/Measurement/Operations. Curated App seed/last-compatible inventory; review only on measured publication/size/drill-down failure. ADR-0004, 0016–0017. |
| `ARCH-S28-D07` | Use capability-specific in-process AI ports: deterministic precheck, one structured candidate, at most one policy-justified escalation, App acceptance and neutral Pending. Criteria: pass-critical quality, privacy, cost, provider exit. | **No productive AI:** omits Writing/Oral evidence. **Generic/per-click/realtime AI:** semantic coupling, variable cost and false authority. | Registry pins provider/model/prompt/schema/rubric/benchmark/price release. Current candidates are Gemini 3.6 Flash, OpenAI mini Transcribe/TTS and batch-audited Polly media; aliases never silently change release. | Writing/Speaking/Media/Evidence. Fixed/deterministic/queued/narrower-claim fallback; switch on benchmark, fairness, privacy, region, terms, latency, availability or unit-cost trigger. ADR-0024–0027. |
| `ARCH-S28-D08` | Account-optional guest first use with App-owned IDs, explicit adoption/merge, foreground-first WAL sync, source-cut export and revoke-first deletion. Criteria: low friction, portability, no duplication/resurrection. | **Mandatory account:** violates first use. **Client-only forever:** loses server recovery/evaluation. **Global LWW/CRDT:** cannot decide evidence/deletion truth. | Auth0 EU email OTP + SES Frankfurt is replaceable identity proof; IDs persist. Tombstones dominate stale work; raw audio never syncs. | Profile/Data Rights/Offline. Local guest is honestly unrecoverable after device loss; Better Auth + App PG/SES is cheaper exit. ADR-0028–0029. |
| `ARCH-S28-D09` | Gate capability at the smallest activity using actual probes and complete-process WCAG 2.2 AA; fail locally and neutrally. Criteria: equal access and evidence honesty. | **Global browser/device block:** exclusionary. **Pretend alternatives are equivalent:** false claim. | Capability observation and server eligibility are versioned; support is `equivalent`, `altering` or `unverified` for the claim. | Frontend/all domains/Test. Equivalent route or learning-only/narrower claim; review from supported-device/AT escapes. ADR-0003, 0022. |
| `ARCH-S28-D10` | Bind every artifact/result to independent release axes and activate only a tested compatibility manifest; preserve predecessor and targeted recovery. Criteria: audit, rollback, no historical reinterpretation. | **One global version:** over-invalidates. **Mutable latest:** unauditable. | API/schema/content/media/blueprint/evaluator/model/prompt/calibration/reason/tzdb/activation releases remain independent; unknown major closes dependent surface. | CI/Operations/all readers. Predecessor/last-compatible/roll-forward/targeted disable; review if matrix burden is measured to exceed its historical/audit value. ADR-0019, 0033–0034. |
| `ARCH-S28-D11` | Enforce minimized trust zones, object authorization, purpose-bound retention, rights execution gates, processor exits, source-cut export and deletion proof. Criteria: least privilege, legal honesty, recoverability. | **Keep all data:** privacy/cost. **Claim instant physical erasure/compliance:** false. **Remove all history quickly:** breaks coaching/audit. | Closed data classes, expiry/delete commands and proofs; envelope encryption for raw audio/push secrets; no invented compliance claim. | Security/Data Rights/Content/Operations. Disable exact processor/capability; jurisdiction-specific legal/trademark/processor review before public/commercial launch. ADR-0031. |
| `ARCH-S28-D12` | Implement dependency-aware vertical claim slices; no learner-facing slice until five-skill foundations include direct Writing/Oral paths and neutral productive fallbacks. Keep Readiness/P4/complete-product claims default-closed until their evidence gates pass. | **Objective-only public MVP:** misleading completeness. **Big-bang complete build:** delays risk evidence. | Flags govern availability/routing only; never semantics. Each slice has immutable claim-impact and quality evidence. | Implementation/Release. Internal shell is allowed; truthful learning-only/evidence-building exposure is fallback. Review when all five-skill/productive/P4 evidence qualifies. ADR-0003, 0033–0034. |
| `ARCH-S28-D13` | Operate with one solo-owner release path, existing provider signals, PostgreSQL aggregates, action-linked alerts/runbooks and measured cost per useful accepted unit. Criteria: sustainability and actionable evidence. | **No operations targets:** invisible failure. **Warehouse/APM/CAB/multi-region now:** idle burden. | Internal L0–L3/loss/restore/deletion budgets and usage receipts are release inputs; no owner euro budget is invented. | Operations. Tune/index/cache/batch first; add topology/tooling only after repeated measured miss. ADR-0032–0034. |

No new ADR is created. These decisions compose accepted ADR-0001–0034 and do not reverse a durable choice.

## 5. C4 views

### 5.1 System context

~~~mermaid
flowchart LR
  Learner["Learner"] -->|practice, productive work, evidence review, data rights| App["Bestehen / App"]
  Owner["Owner / operator"] -->|review, release, incident and rights commands| App
  Corpus["Bestehen / Corpus"] -->|signed immutable capability publications; no learner data| App
  App -->|minimum-purpose identity proof| Identity["Auth0 EU + SES"]
  App -->|candidate evaluation / STT / bounded TTS| Processors["Replaceable AI, STT and TTS processors"]
  App -->|optional encrypted push| Push["Browser-selected Web Push services"]
  Official["Official TELC / target sources"] -->|reviewed blueprint governance| Corpus
  Official -->|target revalidation| App
  App -.->|no runtime learner query| Corpus
~~~

The App alone owns learner meaning. External systems prove identity, publish task intelligence, transport a payload or produce an untrusted candidate.

### 5.2 Container view

~~~mermaid
flowchart TB
  B["Supported browser\nNext.js UI + client islands\nIndexedDB WAL/checkpoints + narrow service worker"]
  W["Same-origin Next.js web/server\nHTTP/API + domain/application modules"]
  J["Node worker\npg-boss jobs + provider adapters"]
  P[("PostgreSQL 18\nlearner facts, projections, jobs, release registry")]
  O[("Private EU R2\napproved media, ephemeral encrypted audio, short export")]
  C["Signed Corpus bundle transport"]
  X["Identity / AI / speech / push processors"]
  B -->|versioned JSON/HTTP commands and projections| W
  W --> P
  W -->|transactional job/outbox| P
  J -->|claim + complete jobs idempotently| P
  W -->|authorized immutable reads / scoped upload| O
  J --> O
  C -->|private import, verify, candidate, activate| J
  J -->|minimum-purpose adapter calls| X
  B -->|hosted login or browser push protocol only| X
~~~

### 5.3 Component/dependency view

~~~mermaid
flowchart LR
  Profile["Profile & Goal"] --> Coach["Coaching & Planning"]
  CorpusACL["Corpus Publication ACL"] --> Content["Content & Forms"]
  Content --> Attempt["Session & Attempt"]
  Content --> Coach
  Profile --> Attempt
  Attempt --> Eval["Productive Evaluation"]
  Attempt --> Evidence["Evidence & Capability"]
  Eval -->|candidate only| Evidence
  Evidence --> Mistake["Mistake Memory & Review"]
  Evidence --> Progression["Progression"]
  Evidence --> Measurement["Measurement: Readiness & Mocks"]
  Mistake --> Coach
  Progression --> Coach
  Measurement --> Coach
  Ops["Operations & Governance"] -. observes / invokes owner commands .-> Profile
  Ops -.-> Content
  Ops -.-> Evidence
  Ops -.-> Measurement
~~~

Arrows are published facts/views, never shared mutable-table permission. Derived contexts never write backward; Coaching consumes last and writes plans only.

### 5.4 Deployment view

~~~mermaid
flowchart TB
  subgraph Device["Learner device trust zone"]
    Browser["Browser\nHTTPS + semantic UI"]
    IDB[("IndexedDB WAL / checkpoints")]
    Cache[("Versioned admitted shell/assets")]
  end
  subgraph Render["Render Frankfurt production boundary"]
    Web["Web service\nNext.js / Node 24"]
    Worker["Worker\nNode 24 + pg-boss"]
    PG[("Managed PostgreSQL 18\nPITR")]
  end
  subgraph CF["Cloudflare private EU storage"]
    R2[("R2 Standard\nseparate media/audio/export prefixes")]
  end
  subgraph Ext["External processor zone"]
    Auth["Auth0 EU / SES"]
    AI["Gemini / OpenAI / Polly"]
    Push["Web Push service"]
  end
  subgraph Recovery["Off-provider recovery"]
    Backup[("Encrypted nightly logical backup\n14 daily + 12 weekly")]
  end
  Browser <--> IDB
  Browser <--> Cache
  Browser -->|TLS same origin| Web
  Web <--> PG
  Worker <--> PG
  Web <--> R2
  Worker <--> R2
  Web --> Auth
  Worker --> AI
  Web --> Push
  PG -->|nightly export| Backup
~~~

| Deployment boundary | Runtime/data owner | Isolation and promotion responsibility | Recovery/exit |
|---|---|---|---|
| Browser/device | Frontend + owning domain projection; local WAL is continuity, not post-ACK authority | support-manifest/capability gate; no production secret; bounded cache lifecycle | foreground replay, local export/reset, equivalent device/path |
| Render web | Platform + domain modules | same-origin edge/API, environment-scoped web credential, manual exact-manifest activation | predecessor artifact or standard Node host migration |
| Render worker | Operations + job's semantic owner | least-privilege worker credential, capability bulkheads, old/new job compatibility | disable/replay exact route; standard Node + PostgreSQL job port |
| PostgreSQL | each domain owns its tables semantically; Operations owns physical service | private network, per-purpose roles, expand/contract single migrator | PITR or encrypted logical restore after deletion-journal replay |
| Private R2 | Content/Media/Data Rights own object purpose; Operations owns storage config | private EU prefixes/credentials, digest and short authorization, no public `r2.dev` | S3-compatible export, exact deny/purge, predecessor media |
| External processors | App capability owner; provider owns transport processing only | separate environment/capability keys, payload allowlist, benchmark/config evidence | circuit, validated adapter, fixed/deterministic/Pending fallback |
| CI/recovery stores | Operations/Release | no learner runtime authority; digest-bound artifact/quality evidence; encrypted backup | verified local build, off-provider restore, portable manifests |

Logical local, CI/dev, disposable preview, on-demand staging and isolated production classes use separate data/secrets. There is no multi-region availability promise. Production promotion is manual and serialized from an exact digest-bound manifest.

## 6. Module and ownership maps

### 6.1 Domain/module ownership

| Module | Authoritative writes | Published views / commands | Forbidden ownership |
|---|---|---|---|
| Learner Profile & Goal | learner scope; target/date; preferences; declared access; principal bindings; data-rights request | goal/access/preferences, adopt/merge, request export/delete | evidence, Readiness, provider subject as learner ID |
| Session & Attempt | plan acceptance, sessions, loop state, response/checkpoints, timer/playback/help/exposure/interruption facts, submission identity | start/resume/checkpoint/exposure/submit/stop and attempt receipts | evidence interpretation, weakness, Readiness |
| Evidence & Capability | observations, corrections, exact validity/scope, conditions, direct lane, capability/confidence/freshness/stability projections | accept candidate/correct/recompute; evidence/capability/label views | provider output as truth; coaching priority |
| Coaching & Planning | deterministic candidate ranking, plan revisions, reason codes, override consequence | assemble/current/replace/shorten/postpone | mutation of evidence/progression/Readiness |
| Mistake Memory & Review | events/episodes/patterns, weakness lifecycle, cause confidence, review obligations | observe/diagnose/repair/transfer/postpone; weakness/due view | attempt facts, global mastery/pass status |
| Progression | P0–P4 per family/direct lane, one-axis probes, confirmation/regression/support fading | propose/record/confirm/adapt; working profile | global level, content approval, Readiness |
| Content & Forms | App-approved immutable family/revision/form/media, role, key/rubric, rights/quality/freshness eligibility, quarantine impact | acquire pinned learner-safe manifest; approve/retire/quarantine/reserve | Corpus source truth, learner mastery, object-store authority |
| Corpus Publication ACL | signed receipt, compatibility closure, candidate/active/last-compatible pointer, translated task-side intelligence | import/accept/promote/reconcile | learner data, live personalization/search, Corpus provenance edits |
| Measurement: Readiness & Mocks | immutable mock definition/result/verdict, Written/Oral projections, exact six states, Gates A–F, milestones | start/finalize mock; recompute; current readiness/booking blockers | attempt capture, provider authority, probability |
| Productive Evaluation | bounded job/candidate, minimum payload, processor lineage, confidence/disagreement/escalation, raw-audio deletion proof | request/cancel/retry/escalate/delete; candidate/Pending/cost | accepted evidence, final Readiness |
| Operations & Governance | incident/capability/cost/release health, calibration admission, release evidence, export/delete orchestration proof | publish/rollback/disable/replay and owner-routed correction/delete commands | direct edits to learner/content/evidence truth |

### 6.2 Frontend ownership and current 26-frame process map

The frontend is a projection layer: server-first route composition, bounded client interaction islands, no global client domain store, no personalized shared cache, and no optimistic validity/evidence/Readiness/rights/deletion claim. The current mapping is:

| Frames | Process owner/view | Required projection |
|---|---|---|
| 1.1–1.4 | arrival, goal and resumable diagnostic | guest scope, five-skill direct signals, honest `evidence_building` |
| 2.1–2.6 | Coach and canonical learning loop | plan reason, attempt/result/repair/fresh retry/Remember receipts |
| 3.1–3.4 | Listening, Writing and Speaking extensions | playback occurrence; durable draft/evaluation; mic/turn/STT/evaluation |
| 4.1–4.6 | Readiness, Train, mocks, Ready to Book | separate Written/Oral, text-equivalent evidence, immutable mock, Gates A–F |
| 5.1–5.6 | mic/media/offline/mock/absence/data recoveries | exact neutral affected scope, resume/alternative/export/delete |

Flows A–G are complete processes: first session; daily coaching; repair/retention; mock; Readiness; failure; absence/data. A frame is a state/layout example, not a route, service or product state.

## 7. Data, state and version ownership

### 7.1 Authoritative data map

| Data class | Authority / persistence | Fact or projection | Correction, export and deletion |
|---|---|---|---|
| Learner/principal/goal/preference | Profile in PostgreSQL; bounded device cache | facts/history | append binding changes; export useful values; revoke/purge by scope |
| Attempt/response/condition/exposure/timing | Attempt in PostgreSQL; pre-ACK WAL in IndexedDB | immutable facts plus mutable pre-final checkpoint | duplicate by semantic ID/hash; export; purge; never infer from analytics |
| Evidence/validity/corrections | Evidence ledger in PostgreSQL | immutable observation/assertion facts + current pointer | scoped appended correction; rebuild consumers; export lineage; purge |
| Capability/Mistake/Progression/Readiness/Coaching | named owner, PostgreSQL generations | deterministic projections; material milestone facts separate | target rebuild from source cut; export current/material history; purge/rebuild only from remaining facts |
| Content/forms/media metadata | Content PostgreSQL; private bytes in R2 | immutable revisions and approval/deny overlays | successor/quarantine/takedown; personal export references only; rights purge bytes |
| Productive jobs/candidates | Productive Evaluation + pg-boss/PostgreSQL; transient raw audio R2 | job/candidate facts, never accepted meaning | Evidence acceptance/correction separate; provider-neutral export; bounded purge |
| Corpus bundles | ACL/Content metadata + immutable private packages | candidate/active/last-compatible publication | roll pointer; purge prohibited bytes; no learner export/profile |
| Release/quality/calibration/operations | Operations PostgreSQL + immutable artifacts | governance/operational facts | supersede, do not rewrite; personal identifiers minimized/de-linked |

### 7.2 Compatibility vector

Every consequential record carries the applicable subset of:

`api_contract`, `schema`, `evidence_contract`, `validity_rules`, `content_family/revision/form/media`, `target_blueprint`, `taxonomy`, `rubric`, `evaluator_contract/model/prompt/transcript`, `calculation/calibration/policy`, `reason/template`, `capture/playback/preflight`, `sync/checkpoint/timer`, `identity/session`, `tzdb/notification`, `rights/approval`, `quality_evidence`, and `activation_manifest` releases.

| Change | Compatibility behavior | Recovery |
|---|---|---|
| Additive compatible minor | old reader ignores only declared optional meaning; exhaustive fallback remains truthful | deploy reader before writer; keep predecessor evidence |
| Consequential/unknown major | exact consumer/capability fails closed; no default success/failure/zero | dual-read/shadow or adapter; promote only with quality evidence |
| Content/media/evaluator correction | historical occurrence retains original lineage; current affected projection is targeted | deny/quarantine exact revision; append correction; shadow recompute |
| Blueprint/calibration change | prior facts remain; current target projection may become `stale_contradicted` or absent | revalidate exact affected units and activate compatible pair |
| Schema migration | expand → dual-compatible backfill → switch → verify → contract | roll forward by default; restore only with deletion journal replay |

### 7.3 Canonical state boundaries

~~~mermaid
stateDiagram-v2
  [*] --> Occurred
  Occurred --> Pending: candidate or required scope unresolved
  Occurred --> Valid: complete supported scope
  Occurred --> PartiallyValid: only named scope supported
  Occurred --> Interrupted: continuity lost
  Occurred --> NotCounted: system/content/fairness fault
  Pending --> Valid: supported candidate accepted
  Pending --> PartiallyValid: subset accepted
  Pending --> NotCounted: deadline/deletion/rejection
  Valid --> PartiallyValid: appended scoped correction
  Valid --> NotCounted: appended full-scope correction
  note right of Pending
    API value: pending
    dependent conclusions only are blocked
  end note
~~~

Mock verdict, evaluation job status, eligibility/practice-only and UI recovery are separate typed projections; none adds a sixth validity value.

~~~mermaid
stateDiagram-v2
  [*] --> evidence_building
  evidence_building --> not_ready: sufficient current estimate below target
  evidence_building --> borderline: sufficient current estimate near target
  not_ready --> borderline: current direct evidence improves
  borderline --> safe: both independent components satisfy Safe rules
  safe --> ready_to_book: Gates A through F all true
  safe --> stale_contradicted: freshness or contradiction invalidates current guidance
  ready_to_book --> stale_contradicted: any current gate regresses
  stale_contradicted --> evidence_building: estimate no longer supported
  stale_contradicted --> not_ready: fresh evidence supports this result
  stale_contradicted --> borderline: fresh evidence supports this result
  stale_contradicted --> safe: fresh evidence restores Safe only
~~~

There is no numeric transition when a component is missing; its estimate is absent.

## 8. API, contracts, jobs and events

The launch boundary is same-origin resource-oriented JSON/HTTP under path-major `/api/v1`, described by OpenAPI 3.1.x and JSON Schema 2020-12. Commands carry client operation ID, canonical payload hash, expected version/ETag and semantic identity. Same identity/hash returns the committed result; changed payload conflicts. Queries return server-owned discriminated projections with contract version, source cut, computed time and staleness. RFC 9457 is for protocol/request failure; domain results distinguish completed, accepted-pending, partial, conflict, unavailable and deleted.

| Contract family | Owner / representative command or query | Binding result/failure rule |
|---|---|---|
| Plan/session | Coaching `GET /plans/current`, assemble; Attempt start/resume/stop | immutable plan/reason; stale resume returns current resource and safe actions |
| Content/attempt | acquire exact manifest; create occurrence; checkpoint/exposure/submit | pinned learner-safe revision; immutable original; duplicate one effect; no fresh inventory is unavailable, not zero |
| Evaluation/evidence | request/cancel/query job; accept candidate/correct; evidence/capability query | candidate never writes Readiness; Pending/partial names scope; one justified escalation |
| Learner projections | capability/Mistake/Review/Progression/Readiness/mock/booking queries | server-owned exhaustive states; Written/Oral independent; probability absent |
| Corpus/content operations | import/accept/promote bundle; approve/quarantine/retire revision | signed immutable candidate; atomic pointer; last-compatible active; exact deny overlay |
| Identity/data rights | adopt/merge; export; delete | App IDs preserved; explicit conflicts; source-cut export; revoke first and reject late writes |
| Media/notification | scoped upload/read; create intent/update preference | opaque authorized byte; raw-audio deadline; delivery is transport acceptance only |
| Operations | health, replay, disable, release/calibration publish | may invoke owner command but cannot edit semantic truth |

### 8.1 Durable job ownership

| Job | Owner | Semantic identity / terminal proof | Neutral fallback |
|---|---|---|---|
| Productive Writing/Oral evaluation | Productive Evaluation | attempt + purpose + release + payload hash; accepted/rejected/Pending/deletion proof | deterministic precheck/feedback, queued Pending, fresh sample |
| STT / adaptive partner | Speaking/Productive Evaluation | turn/chunk ordinal + model release; provisional transcript lineage | fixed partner, learning-only typed route, no Oral claim |
| Projection rebuild | target projection owner | source cut + rule release + impact selector | last validated generation marked stale/rebuilding |
| Corpus import/promotion | Corpus ACL | publication sequence + signature/digests + compatibility closure | active last-compatible snapshot |
| Content/media correction | Content/Evidence | revision + impact assertion + recompute generation | deny exact revision and use eligible alternative |
| Export/delete/provider cleanup | Profile/Data Rights + Operations | request source cut or deletion operation/tombstone and per-owner proof | durable status; retry failed step; access remains revoked |
| Notification occurrence/send | Scheduling/Notifications | reason group + semantic occurrence + policy generation | in-App parity; stale/duplicate send cancelled |
| Backup/restore/retention | Operations + data owner | artifact digest/generation or expiry selector + drill receipt | predecessor/isolated restore; never serve before journal replay |

Domain events describe committed owner facts; integration events cross a port; jobs request idempotent work. Required outbox/job records commit with owner truth in PostgreSQL. There is no Kafka/Redis/general event platform.

## 9. End-to-end evidence and main flow

~~~mermaid
sequenceDiagram
  participant U as Learner
  participant C as Coaching
  participant A as Session/Attempt
  participant F as Content/Forms
  participant P as Productive Evaluation
  participant E as Evidence
  participant D as Derived owners
  U->>C: choose Coach me or deliberate override
  C-->>U: plan revision + reason + alternatives
  A->>F: acquire exact approved manifest
  F-->>A: pinned learner-safe revision
  U->>A: attempt/checkpoint/submit with actual conditions
  alt deterministic objective/media-supported outcome
    A->>E: immutable occurrence + supported outcome
  else Writing or Speaking
    A->>P: minimum-purpose versioned job
    P-->>E: structured candidate or Pending
  end
  E->>E: accept/narrow/reject with exact validity and lineage
  E-->>D: immutable observation source cut
  D-->>C: Mistake, Progression, Review, Readiness views
  C-->>U: Diagnose → Repair → fresh Retry → Remember
~~~

Decisive evidence precedes likely cause and advice. Immediate retry is responsiveness, not retention. Delayed independent transfer uses a fresh eligible family/occasion. Productive same-prompt revision remains in the original episode. No per-view AI or Corpus call enters the chain.

### 9.1 Nine product scenarios and Flows A–G

Release evidence must replay: A1 day one; A2 midpoint; strong Reading/weak Speaking; 30-day deadline; return after break; failed full mock; Speaking coaching; Writing repair; Ready-to-Book transition. Together they cover guest adoption, direct modality, urgency-without-truth-mutation, stale history, interruption, productive evaluation, independent components and reversible booking.

Design Flows A–G and all 26 frames are tested as complete processes. The 12 required recoveries are: network lost mid-Writing; audio load failure; microphone denied; silent/wrong input; mock paused/backgrounded; evaluator slow; evaluator outage; defective item; fresh P4 inventory exhausted; unsupported capability; return after six weeks; target blueprint change.

## 10. Failure, recovery and uncertainty

| Failure family | Exact owner/state | Learner/evidence consequence | Recovery/runbook |
|---|---|---|---|
| AI/evaluator route, low confidence, cost circuit | Productive Evaluation `pending`/unavailable/cannot-judge | original work remains; only dependent dimension absent; no weakness/low score | bounded retry or one justified escalation; validated substitute/fresh sample; circuit and queue-age runbook |
| Listening byte/decode/output | Media + Attempt fault | affected task `not_counted` or interrupted; other units survive | retry exact immutable rendition, audited alternative/fresh task; media-integrity runbook |
| Microphone silent/denied/removed | capability + Attempt | Speaking does not start or exact turn interrupted; no Oral evidence | device switch/retest; fixed/typed learning-only alternative; capture runbook |
| Network/browser storage | local WAL + API owner | local draft/checkpoint explicit; no duplicate or false clean timing | foreground replay by semantic ID/version; conflict branch; local-persistence runbook |
| Unsupported browser/AT/capability | capability eligibility | exact high-stakes activity unavailable/altering/unverified; no global block | equivalent input/device/task or learning-only route; support-manifest runbook |
| Content defect/rights/fresh inventory | Content & Forms | exact revision denied/quarantined; correction only for proven correctness/fairness impact | eligible alternative, lower-claim practice, cache purge and impact rebuild |
| Corpus outage/incompatible bundle | Corpus ACL | no effect on active approved inventory; new import held | continue last-compatible; publication reconciliation runbook |
| Identity/OTP/session | Identity/Profile | account sync unavailable; guest/local work and truth unchanged | retry/revoke/rebind; provider exit/adoption runbook |
| Push/tzdb | Scheduling/Notifications | in-App plan remains; no debt, penalty or evidence effect | cancel stale jobs/dedupe/disable external send; schedule runbook |
| PostgreSQL/R2/deploy/schema/job | data owner + Operations | measured admission closes exact capability; unaffected cached/local paths remain | predecessor, expand/contract roll-forward, off-provider restore, scoped disable |

Recovery order is: detect → identify non-learner owner and exact scope → preserve work/facts → expose neutral state and safe action → reconcile idempotently → append correction if required → rebuild only affected projection → verify release/incident evidence. Pending blocks only dependent conclusions. A late compatible result applies once and cannot rewind an active session.

Timer truth uses in-context monotonic facts, persisted anchors and trusted server-clock samples. Background/sleep does not pause P4. If elapsed continuity cannot be supported, preserve the response and narrow the measured claim to interrupted/modified/not-counted as appropriate.

## 11. Security, privacy, rights, retention, export and deletion

### 11.1 Trust and authorization map

| Zone | Allowed authority | Boundary control |
|---|---|---|
| Browser/device | current learner interaction, pre-ACK WAL, capability observation | secure same-origin cookie; no bearer/local token; closed schemas; CSP; untrusted input |
| Public edge/App server | authenticate principal, authorize object/action, invoke owner commands | object + purpose authorization; CSRF/origin/Fetch Metadata; rate/size limits |
| Learner truth/worker | owner transactions, projections and jobs | distinct least-privilege DB/job roles; transactional outbox; no provider authority |
| Private object/media | immutable approved bytes, ephemeral encrypted raw audio, short export | private prefixes/credentials, opaque IDs, short authorized reads, digest and lifecycle proof |
| External processors/transports | minimum-purpose identity/candidate/transport | per-capability keys/adapters, deny fields, circuit, retention/deletion and cost receipts |
| Operator/offline publication | reviewed release, rights, calibration, incident commands | separate identity/MFA hardening, attributable audit, signed Corpus packages, no direct row editing |

HTTPS, staged HSTS, strict nonce/hash CSP, `__Host-` Secure HttpOnly SameSite cookies, restrictive permissions/referrer/cache headers, allowlisted redirects/callbacks and no arbitrary third-party script are release-tested. Learner text/audio, model output, Corpus packages, callbacks and filenames are untrusted. There is no general file upload, provider tool/URL access, session replay, advertising, learner data sale or hidden training opt-in.

### 11.2 Retention and rights matrix

| Class | Current architecture default / ceiling | Export and deletion truth |
|---|---|---|
| Profile, goals, attempts, responses, evidence, corrections and useful learner history | until learner deletion while purpose remains | useful human + machine source-cut export; revoke/purge by owner; no analytics reconstruction |
| Rebuildable projection generations | current/material history; obsolete transient generation 30 days | export current/material history; rebuild only from authorized facts |
| Writing originals/revisions/accepted structured evaluation | retained with useful history until deletion; local abandoned draft 30 days, acknowledged local copy 24 hours | export text/lineage/evaluation; purge App/local/provider-controllable copies |
| Speaking transcript/structured accepted result | retained with useful evidence until deletion | export provider-neutral transcript/result; purge with scope |
| Raw learner audio | delete immediately after terminal finalization; unresolved absolute maximum seven days from capture | never asynchronous export, backup, sync, analytics, logs, Corpus or TTS; purge local/R2/provider copies first |
| AI transient payload | stripped after terminal acceptance; accepted provider-neutral lineage retained; terminal job metadata 90 days | export useful accepted result/release, not hidden prompt/vendor trace; request provider cleanup where controllable |
| Push delivery detail / dedupe | raw 30 days; content-free dedupe/idempotency 90 days | export settings/status, never secret; revoke first and tombstone late jobs |
| Operational logs / high-risk audit | raw minimized logs 30 days; high-risk audit 90 days | no response/transcript/audio/token/secret; delete or de-link learner scope |
| Export artifact | current release policy expires no later than 24 hours; frozen source cut and checksum | private single-purpose download; delete immediately on scope deletion |
| Deletion proof/journal | operational proof up to 90 days; linkable restore suppression hard ceiling 91 days | understandable status/deadline; self-expire after last containing backup and by day 91 |
| Backups | nightly encrypted off-provider, 14 daily + 12 weekly; provider PITR per current plan | inaccessible residual disclosed; raw audio excluded; restore replays journal before service |

Rights are an execution gate: exact revision, action, audience, effective time, attribution and accessibility must pass before serve. Verified takedown denies future/private access and purges required bytes/caches immediately. Rights-only withdrawal does not automatically negate learning; correctness/fairness impact alone drives scoped evidence correction. Uncertain public reuse requires qualified legal review, not a feature-local guess.

Deletion is a state machine: revoke sessions/serving first; tombstone the scope; cancel/neutralize jobs and callbacks; command every owner/provider/cache/object purge; verify each proof; retain only minimized bounded operation/journal data; replay the journal into any restore; report truthful inaccessible backup residual until expiry. “Complete” is not returned while any required live/provider step is partial. There is no legal-compliance claim. Jurisdiction-specific privacy, consumer, accessibility, processor, retention, trademark and content-rights review is required before public/commercial launch.

## 12. Accessibility, responsive, browser and device acceptance

The UI uses the accepted semantic token system in light/dark, Bricolage Grotesque + IBM Plex Sans + IBM Plex Mono, 18 semantic icon IDs and the Concept B / B1 Threshold B asset contract. Runtime implementation must not copy illustrative design HTML.

| Obligation | Implementation contract | Release proof owner |
|---|---|---|
| Responsive layout | fixed five ranges: ≤479, 480–767, 768–1023, 1024–1279, ≥1280; one IA and reading order; phone-first with stronger Writing/Readiness/mock large-screen layouts | Frontend + Accessibility; breakpoint/reflow fixtures |
| Reflow/zoom | ordinary content at 320 CSS px without 2D scroll; 200% text zoom without loss; representative 400% reflow; sticky controls never obscure focus | complete-process manual + automated evidence |
| Keyboard/pointer/switch | no drag-only or gesture-only path; select-then-place produces the same response facts; 44×44 target and 8 px separation design target | component/domain operation hash equality |
| Screen reader/focus/status | semantic HTML, German language, text-before-chart/table equivalence, stable focus transitions, sparse polite/assertive channels, no timer-tick announcements | manual supported AT transcripts across full flows |
| Motion/color/theme | reduced motion; forced colors; non-color meaning; light/dark contrast and visible focus | per-change and release candidate evidence |
| Capability and accommodation | actual probe + server eligibility; support classified equivalent/altering/unverified; declared need is not diagnosis | domain condition envelope + real device/AT evidence |
| Browser/device window | current and immediately previous desktop Chrome/Edge/Firefox/Safari, iOS/iPadOS Safari and Android Chrome, resolved into exact release manifest | branded/physical evidence; Playwright/emulation labelled supplementary |
| Complete process | onboarding/guest, every skill, mock, Readiness/text evidence, review, OTP/account, export/delete, recovery, notification settings across all 26 current frames and Flows A–G | Stage-25 claim gate; partial page pass cannot release flow |

An accessibility adaptation is always available for learning. If it changes the tested capability and equivalence is unverified, the learner receives the useful path and an honest narrower evidence claim—never a penalty or access denial to the whole product.

## 13. Performance, reliability, operations and cost

| Class | Accepted operating target | Degradation/measurement |
|---|---|---|
| L0 local acknowledgement | approximately 100 ms | selection/editor/timer path has no network/model dependency |
| Browser experience | p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 | coarse delivery strata only; never ability inference |
| L1 deterministic result/current state/plan | p95 ≤1 s; visible progress after about 2 s | local/cached or neutral retry; no AI/Corpus call |
| L2 productive evaluation | ordinarily ≤15 s; explicit Pending after about 30 s | one durable identity; late result applies once |
| L3 adaptive partner | start around ≤2 s, tolerate ≤4 s, fallback after repeated >about 5 s | system wait excluded; fixed partner/narrower claim |
| Writing durability | recoverable loss ordinarily ≤5 s | crash/reload/background/device matrix gates high-stakes admission |
| Media/measured preflight | required content/byte/digest/decode/output/checkpoint/timer proof before clean start | exact local unavailability, not hidden buffering |
| Backup/recovery | nightly off-provider, quarterly isolated restore; accepted ≤24 h backup RPO and ≤8 h validated-service RTO | raw audio excluded; deletion journal before serve |

These are internal release objectives, not a public SLA. Stage 24/26 own versioned refinements and receipts. Alert classes cover immediate truth/security/deletion/rights/data-loss incidents; actionable service/queue/backup/cost degradation; and review trends. Runbooks cover provider circuit, media/capture, content/rights impact, queue/replay, migration/deploy, backup/restore, export/delete/no-resurrection, secrets/security incident, Corpus import and browser/access escape. An alert without an actionable response is a report, not a page.

Cost is measured by fixed Render/PG/worker/storage/backup/domain/email operating cost plus variable AI/STT/TTS/media/push/storage/egress and human review. Every billable productive request has a usage/price-release receipt; primary unit is cost per useful **accepted** productive evidence unit, with rejected/Pending/escalation shown separately. No euro budget is invented. Paid AI stays disabled without an owner-configured envelope. Quality-equivalent fallback order is deterministic/cached work, fixed/reviewed media or partner, queued Pending, validated cheaper adapter, lower-claim practice, in-App-only notification and lower-frequency Corpus publication. Cost cannot remove Writing/Oral evidence, truth, accessibility, recovery, rights, privacy or security gates.

Scale only after sustained measured miss survives ordinary query/index/cache/batch/retention tuning. PostgreSQL, JSON/OpenAPI, S3-compatible objects, W3C/OTel-compatible signals and provider-neutral fixtures preserve exit. No analytics warehouse, always-on staging, external queue, multi-region, service mesh or Kubernetes is admitted without its named evidence.

## 14. Release, compatibility and recovery ownership

### 14.1 Independent release units

| Unit | Owner / compatibility | Promotion evidence | Rollback/exit |
|---|---|---|---|
| App source/artifact + API/schema | Platform/domain owners; additive reader-before-writer | source/lock/SBOM/contract/migration/claim gates and artifact digest | predecessor artifact; roll-forward schema; standard Node/SQL |
| Content/form/media | Content; exact role/rights/blueprint/accessibility compatibility | human/golden QA, family independence, P4 higher bar, digest | deny overlay, predecessor eligible revision, private S3 export |
| Corpus publication | ACL; contract/family/key/signature closure | signature/digest/sequence/rights/compatibility and atomic activation | last-compatible pointer; independent Corpus downtime |
| Evaluator/model/prompt/STT/TTS | Productive Evaluation/Media; capability registry | frozen benchmark, slice/fairness/confidence, privacy/region, cost/latency | predecessor route, adapter switch, fixed/Pending fallback |
| Blueprint/taxonomy/calibration/policy | Measurement/domain owner + Operations governance | provenance/effective date/independent validation/backtest/no circularity | pointer rollback and targeted revalidation, no history rewrite |
| Reason/template/design/support manifest | semantic owner/Frontend/Accessibility | exhaustive states, reviewed copy, 26-frame/complete-process browser/device/AT | predecessor template/manifest; unknown state neutral closed |

### 14.2 Promotion flow

~~~mermaid
flowchart LR
  S["Exact source + locks + release candidates"] --> I["Claim-impact map"]
  I --> Q["Deterministic, contract, migration, security, rights, a11y and benchmark gates"]
  Q --> B["Digest-bound QualityEvidenceBundle"]
  B --> P["Disposable preview / on-demand staging"]
  P --> R["Restore, delete, provider and scenario drills as impacted"]
  R --> M["Manual serialized production promotion of exact manifest"]
  M --> V["Post-deploy verification + immutable activation receipt"]
  V -->|failure| X["Disable exact capability / predecessor / roll forward"]
~~~

Configuration is typed and environment-scoped; secrets never live in source/artifacts and use least-privilege credentials. Actions/tools are pinned, untrusted forks receive no deploy secret, and promotion requires exact digest/provenance. A flake cannot retry to green: one diagnostic retry may classify it, but the original remains and a sole blocking oracle cannot be quarantined.

## 15. Dependency-aware implementation roadmap

### 15.1 Safe slices

| Slice | Dependency-complete outcome | Truthful learner exposure and required gate | Default-closed claims |
|---|---|---|---|
| 0 — contracts and no-claim scaffold | repository/toolchain; module boundaries; schema/API/state unions; authz/session shell; release registry; local WAL; semantic primitives; synthetic CI/restore/delete harness | internal/owner-only shell; no learner product claim | all practice, P4, Readiness, complete-product copy |
| 1 — five-skill evidence foundation | guest scope; approved original content; shared session/attempt/evidence; deterministic objective scoring; audited Listening occurrences; durable Writing original + structured candidate/Pending; contextual Speaking capture/fixed turns/STT/evaluation/Pending; all-fault neutrality; export/delete; complete-process WCAG | first permissible learner slice is explicitly learning/evidence-building and includes direct paths for **all five skills**, especially Writing and Oral. A processor outage yields Pending/fixed practice, not omission. | numeric Readiness, Safe/Ready, P4/exam-equivalent and complete-coach claim |
| 2 — complete daily coaching | deterministic planning/reasons/override; full loop; Mistake lifecycle; Review obligations; local P0–P4 progression mechanics below unsupported claims; fresh retry/retention; account adoption/sync/conflicts; operational cost/circuit evidence | may claim complete five-skill daily coaching only after benchmark, recovery, privacy and 26-frame/process gates | P4 target claims, mocks, Readiness/booking |
| 3 — target evidence and decisions | independently approved fresh P4 inventory; blueprint/calibration; measured timing/media; full/section/mini mocks; independent Written/Oral Readiness; exact six states; Gates A–F; stale/contradicted behavior; rights/currentness | expose numeric Readiness only when direct eligible source cuts exist; otherwise `evidence_building` without number. P4/mock labels only for qualified manifests | pass probability; unsupported booking/provider/public guarantees |
| 4 — resilience and optional reach | production backup/restore/delete drills; account recovery; notification/date/tzdb; expanded content; outcome calibration; public-launch hardening/legal review | Ready-to-Book and reminders only with in-App parity, current gates and public-launch evidence | pass probability until separate empirical gate; deferred native/payment/community features |

No public phase may be called a complete TELC B1 coach while Writing/Oral direct evidence is absent. Objective components may be implemented earlier behind owner/testing access, but are not a standalone product promise. Flags control availability/routing/exposure only and cannot alter validity, scoring, pass line, Safe margin meaning, Written/Oral independence, P0–P4 semantics, rights, retention, deletion, accessibility or cost gates.

### 15.2 Critical path

~~~mermaid
flowchart LR
  A["Semantic contracts + authority + exact states"] --> B["PostgreSQL facts, idempotency, WAL, authz"]
  B --> C["Content/Corpus import, rights, immutable manifests"]
  B --> D["Frontend semantic primitives + capability/WCAG"]
  C --> E["Shared Session/Attempt + objective/listening"]
  D --> E
  E --> F["Writing durable original + evaluation candidate"]
  E --> G["Speaking capture/turn/STT + oral candidate + audio deletion"]
  F --> H["Evidence acceptance + five-skill direct foundation"]
  G --> H
  H --> I["Mistake/Review/Progression + deterministic Coaching"]
  I --> J["Fresh P4 inventory + mocks + independent Readiness"]
  J --> K["Ready to Book + notification/date + calibration"]
  A --> L["CI quality/release/restore/delete/security evidence"]
  L --> H
  L --> J
  L --> K
~~~

The first exposed claim-bearing milestone is H, not E. Database/API/frontend/content work may proceed in parallel during implementation, but no release bypasses the dependency/gate edges.

### 15.3 Slice acceptance artifacts

Each slice produces: exact source/release manifest; claim-impact map; contract/state/property results; content/evaluator/media benchmark receipts; security/privacy/rights/deletion evidence; 26-frame/complete-process accessibility and supported-device record; failure/recovery replay; performance/loss/cost receipts; migration/rollback/restore proof as impacted; deferrals/flags with expiry; and a digest-bound `QualityEvidenceBundle`.

## 16. Risk register and validation/upgrade triggers

| Risk | Required evidence / trigger | Owner and safe response |
|---|---|---|
| Productive evaluator quality, fairness or drift | frozen independent benchmark slices; disagreement/false-safe/drift, model/config change | Evaluation + Evidence; rollback model, narrower accepted dimensions or fresh sample |
| Insufficient fresh independent P4 inventory | family/rights/blueprint coverage and exhausted-content rate | Content; lower-claim practice and publication obligation, never manufactured transfer |
| Browser/device/AT support escape | current/current-previous real evidence; repeated pass-critical escape or inaccessible combination | Frontend/Accessibility; close exact capability, equivalent route, grid/audit after trigger |
| Deletion/raw-audio/restore resurrection | continuous expiry/deletion canary and quarterly isolated restore/journal replay | Data Rights/Operations; block restored service/release until proof |
| Official target/blueprint change | official-source review and compatibility impact | Measurement/Content; `stale_contradicted`, smallest recheck, new release pair |
| Provider price/terms/region/privacy/support change | current config/processor/price receipt at promotion; envelope/circuit threshold | Operations/capability owner; validated adapter, fixed/queued/in-App fallback |
| Single-region/provider loss | RPO/RTO and repeated outage/loss beyond accepted objective | Operations; off-provider encrypted restore or standard provider exit; no speculative multi-region |
| Queue/database/object contention | sustained L1/L2/oldest-job/restore miss after tuning | Platform; index/cache/batch/retention then split exact port if still proven |
| Public legal/trademark/processor duties | qualified jurisdiction-specific review before public/commercial launch | Owner/legal review; remain private or disable affected use if unresolved |
| Stale 24-frame prose | claim manifest must enumerate current semantic map | Frontend/Test; fail promotion until all 26 are reconciled |

Calibration triggers—Safe margin, recency/ranges, progression/review windows, evaluator thresholds, notification caps, support manifests and operating thresholds—publish a new version with provenance, effective date, independent evidence, monitor and rollback. Stable semantic rules are not calibration knobs.

## 17. Intentionally deferred choices, questions and prohibited shortcuts

| Deferred choice | Future owner / boundary / trigger |
|---|---|
| Exact source layout, SQL names, component syntax, test runner configuration | implementation owner, inside fixed modules/contracts and claim gates |
| Exact dependency patch versions and provider model snapshots/prices | release owner at each candidate cut; official evidence and benchmark required |
| Procurement/account/domain setup and optional device farm/formal audit | owner/Operations after access gap, usage, repeated escape or legal/procurement trigger |
| Mutable numeric calibration and operating envelopes | named semantic owner + Operations governance; never silently change stable meaning |
| Final reviewed copy within reason/state contracts | Product/Design/Accessibility; must project complete reason/gate truth |
| Managed KMS/HSM, separate queue/store/service, multi-region or second observability sink | Security/Operations only after named incident, audit, scale, evidence-retention or recovery miss |
| Jurisdiction-specific legal/privacy/consumer/accessibility/trademark/rights wording and processor terms | qualified owner/legal review before public/commercial launch; architecture makes no compliance claim |
| Deferred product scope (native apps, full offline packs, full-duplex voice, payments, social/community, extra exams/providers, broad demographic profiling) | future product shaping and, if durable/coupled, new ADR |

**Unresolved owner questions:** none. No missing preference, budget or legal-risk tolerance blocks implementation of the private complete architecture. Public/commercial launch remains gated by the review above and an owner-configured spend envelope; those are launch controls, not permission for feature implementers to invent semantics.

Prohibited shortcuts include objective-only “complete” launch; probability placeholder; compensating Written with Oral or vice versa; missing-as-zero; `safe` as booking; live Corpus learner query; provider output as truth; content/media mutation in place; per-click objective AI; transcript-only oral score; raw-audio backup/sync/history; retry-to-green; client-computed Readiness; unreviewed rights/content; global device block; inaccessible alternate flow; instant-backup-erasure copy; mutable latest release; and cost waiver of truth/access/security/recovery.

## 18. Accepted ADR index

The current ADR index and every ADR body were read. ADR-0001 through ADR-0034 are **Accepted**; none is Superseded and Stage 28 creates or amends none.

| ADR | Decision | Status | Blob SHA |
|---|---|---|---:|
| [ADR-0001](./adr/ADR-0001-evidence-truth-and-explicit-uncertainty.md) | ADR-0001 — Evidence truth and explicit uncertainty | Accepted | `8408ce1ab28c43c070d87c2dbea9160c899af60f` |
| [ADR-0002](./adr/ADR-0002-modular-low-ops-deterministic-first-posture.md) | ADR-0002 — Modular low-ops deterministic-first posture | Accepted | `bc55348b30ce9570ecaef29c75477d527ac0bd97` |
| [ADR-0003](./adr/ADR-0003-quality-attributes-are-release-gates.md) | ADR-0003 — Quality attributes are release gates | Accepted | `010437c072277d6d0aed39a53d76b5cb56e363c7` |
| [ADR-0004](./adr/ADR-0004-app-runtime-independent-from-corpus.md) | ADR-0004 — App runtime independent from Corpus | Accepted | `6e3d72f9bfec47919cb6c4e02b3dad7114179f42` |
| [ADR-0005](./adr/ADR-0005-app-semantic-authority-across-processors.md) | ADR-0005 — App semantic authority across processors | Accepted | `ba04a79d848dc19f328fd0f28c474de55ec5df5e` |
| [ADR-0006](./adr/ADR-0006-typescript-nextjs-modular-monorepo.md) | ADR-0006 — TypeScript Next.js modular monorepo | Accepted | `05a728f5f545125c60bc775353aff32329af51a9` |
| [ADR-0007](./adr/ADR-0007-postgresql-authority-and-durable-jobs.md) | ADR-0007 — PostgreSQL authority and durable jobs | Accepted | `025f38e0b834acab7542f6f6a41575decb524b5e` |
| [ADR-0008](./adr/ADR-0008-render-single-region-managed-deployment.md) | ADR-0008 — Render single-region managed deployment | Accepted | `a5266a2734faadeeeca1ef350942bb8a3b51ef38` |
| [ADR-0009](./adr/ADR-0009-private-eu-s3-compatible-object-storage.md) | ADR-0009 — Private EU S3-compatible object storage | Accepted | `2260badfb4953459898174d334db1d3f5b2d65c9` |
| [ADR-0010](./adr/ADR-0010-bounded-contexts-and-single-state-ownership.md) | ADR-0010 — Bounded contexts and single state ownership | Accepted | `2fd22d071d30ad38445e33544be11d8641fb2e68` |
| [ADR-0011](./adr/ADR-0011-shared-five-skill-foundation-with-modality-extensions.md) | ADR-0011 — Shared five-skill foundation with modality extensions | Accepted | `64b5180c99de2da6ff50dcf3be4fbc1bf23361e2` |
| [ADR-0012](./adr/ADR-0012-append-oriented-relational-truth-and-bounded-persistence.md) | ADR-0012 — Append-oriented relational truth and bounded persistence | Accepted | `2e2ae7220a03f30e2f1a564fecd93bdb76347b03` |
| [ADR-0013](./adr/ADR-0013-immutable-evidence-envelope-and-append-audited-validity.md) | ADR-0013 — Immutable evidence envelope and append-audited validity | Accepted | `c51602d9e68e1b9857c2de75caa9d87e5dca58a3` |
| [ADR-0014](./adr/ADR-0014-deterministic-learner-projections-and-capability-obligations.md) | ADR-0014 — Deterministic learner projections and capability obligations | Accepted | `31272ae27f8a1a43b5f16880f0e34ed9eee07746` |
| [ADR-0015](./adr/ADR-0015-deterministic-coaching-policy-and-revisioned-session-execution.md) | Deterministic coaching policy and revisioned session execution | Accepted | `2e5a02c9e5be05c6e872ca9f10320b5666db0ab7` |
| [ADR-0016](./adr/ADR-0016-immutable-approved-content-manifests-and-family-independence.md) | Immutable approved content manifests and family independence | Accepted | `8ccd9ea0937c676ab48d863c1658fa9b79eb20db` |
| [ADR-0017](./adr/ADR-0017-signed-immutable-corpus-bundles-and-atomic-app-promotion.md) | Signed immutable Corpus bundles and atomic App promotion | Accepted | `844a471b91181fa7bd943ae7de4c5d4565ba0734` |
| [ADR-0018](./adr/ADR-0018-deterministic-versioned-readiness-and-reversible-booking-gate.md) | Deterministic versioned Readiness and reversible booking gate | Accepted | `5425ad8f273fc968fd692ccb3188c9fcea954d33` |
| [ADR-0019](./adr/ADR-0019-versioned-http-contracts-and-durable-idempotent-asynchronous-work.md) | Versioned HTTP contracts and durable idempotent asynchronous work | Accepted | `3239c98511979ef49a50773e736ce8b0b0e76f9e` |
| [ADR-0020](./adr/ADR-0020-server-first-frontend-composition-and-bounded-browser-state.md) | Server-first frontend composition and bounded browser state | Accepted | `154d1f7e1d0cd2d5d72a8b55717098d5679da17a` |
| [ADR-0021](./adr/ADR-0021-single-semantic-design-system-and-shared-five-skill-extension-contract.md) | Single semantic design system and shared five-skill extension contract | Accepted | `144057917dedbdc91e8ea0c2a32826c7476625c1` |
| [ADR-0022](./adr/ADR-0022-capability-gated-responsive-web-and-evidence-aware-accessibility.md) | Capability-gated responsive web and evidence-aware accessibility | Accepted | `dd0d19e408898e232629b350aa927615a7174dda` |
| [ADR-0023](./adr/ADR-0023-deterministic-objective-task-runtime-and-immutable-outcomes.md) | Deterministic objective task runtime and immutable outcomes | Accepted | `15f6220d2be7b287513dd18d2c823907fbac3461` |
| [ADR-0024](./adr/ADR-0024-pinned-batch-audio-and-evidence-sensitive-playback.md) | Pinned batch audio and evidence-sensitive playback | Accepted | `f792a0f48a4f70625c9cca8cb41bb8a68c59fec6` |
| [ADR-0025](./adr/ADR-0025-durable-writing-drafts-and-bounded-versioned-evaluation.md) | Durable Writing drafts and bounded versioned evaluation | Accepted | `ac7b1594971f450cab08c7f34ca7bb0c395057cc` |
| [ADR-0026](./adr/ADR-0026-ephemeral-voice-evidence-and-bounded-oral-evaluation.md) | Ephemeral voice evidence and bounded oral evaluation | Accepted | `7a787a6d1117eaf4783022cdbfb84b024b7e03fe` |
| [ADR-0027](./adr/ADR-0027-capability-specific-ai-routes-and-evidence-governed-candidates.md) | Capability-specific AI routes and evidence-governed candidates | Accepted | `c4e526178ce14addec5da22bda6241919ac312ac` |
| [ADR-0028](./adr/ADR-0028-provider-portable-account-identity-and-id-preserving-local-first-lifecycle.md) | ADR-0028 — Provider-portable account identity and id-preserving local-first lifecycle | Accepted | `b7c4981174d8e7b92ccbf0bb4639b0464f35848c` |
| [ADR-0029](./adr/ADR-0029-bounded-local-write-ahead-continuity-and-conservative-timer-reconstruction.md) | ADR-0029 — Bounded local write-ahead continuity and conservative timer reconstruction | Accepted | `9506e8569cc68860d9f7fe9d2f487d4be9f03233` |
| [ADR-0030](./adr/ADR-0030-deterministic-local-calendar-scheduling-and-replaceable-standards-web-push.md) | Deterministic local-calendar scheduling and replaceable standards Web Push | Accepted | `7a7a93a661ecc72ef02e723b24c7030e37d53918` |
| [ADR-0031](./adr/ADR-0031-minimized-authoritative-trust-boundaries-and-bounded-retention.md) | ADR-0031 — Minimized Authoritative Trust Boundaries and Bounded Retention | Accepted | `9ddfd6e31cc55cf095c1d002abb907aa32d770d2` |
| [ADR-0032](./adr/ADR-0032-lean-evidence-derived-telemetry-frozen-calibration-and-measured-operating-gates.md) | ADR-0032 — Lean evidence-derived telemetry, frozen calibration, and measured operating gates | Accepted | `54ae839749fe66f8809080466a97f6cde5a917e7` |
| [ADR-0033](./adr/ADR-0033-claim-based-risk-gates-and-immutable-release-evidence.md) | ADR-0033 — Claim-based risk gates and immutable release evidence | Accepted | `6cf0903e5e9ef72f121c0234f8e0f3494b5a4500` |
| [ADR-0034](./adr/ADR-0034-digest-bound-independent-release-units-and-conservative-promotion.md) | Digest-bound independent release units and conservative promotion | Accepted | `4ca9f8cf6edb65a423d803ae3ae4cb4c733ac574` |

## 19. Product → design → architecture → implementation traceability

| Product claim / authority | Design process/frame | Architecture owner/detail | Implementation proof |
|---|---|---|---|
| Account-optional useful first action; `app/02`, `app/03`, final §§4/15 | Flow A, 1.1–1.4 | Profile/Attempt; Stages 08, 20, 21 | guest isolation/adoption, resumable five-skill diagnostic, complete WCAG process |
| Highest-value action with agency; `app/06`, `app/22`, `app/27` | Flow B, 2.1–2.6 | Coaching; Stages 07–08 | precedence checksum, plan reasons, override changes priority not truth |
| Mistake Memory/local progression; `app/04–08`, `app/14` | Flows B/C, 2.3–2.6, 4.3 | Evidence/Mistake/Progression; Stages 06–08 | state/property/fresh-transfer/retention tests |
| Objective Reading/Language Elements; `app/09–10` | Attempt/result/repair states | Content/Attempt/Evidence; Stages 09, 15 | immutable key/form, deterministic result, no runtime AI/Corpus, equal input operations |
| Listening; `app/11` | 3.1 and failure 5.2 | Media/Attempt/Evidence; Stage 16 | audited immutable audio, occurrence/replay/timing/preflight/fault neutrality |
| Writing; `app/12` | 3.2, 5.3 | Writing/Attempt/Evaluation/Evidence; Stage 17 | loss bound, original/revision, structured benchmark/Pending/provider exit |
| Speaking; `app/13` | 3.3–3.4, 5.1 | Speaking/Attempt/Evaluation/Evidence; Stage 18 | mic/turn/STT correction, audio-direct benchmark, raw-audio deletion/fixed partner |
| Readiness/mocks/Ready; `app/15–17`, final §§10–11 | Flow D/E, 4.1–4.6, 5.4–5.5 | Measurement; Stage 11 | independent gates, exact six states, Gates A–F, current compatibility, no probability |
| Rights/privacy/export/delete; `app/21`, `app/24`, final §§14–15 | Flow G, 5.6 | Content/Profile/Data Rights/Ops; Stages 20, 23 | serving/takedown, export parity, revoke/purge/provider/restore/no-resurrection |
| Accessible responsive product; `app/26` | Flows A–G, all 26 frames, desktop equivalents | Frontend/Capability + every owner; Stages 13–14/25 | 320/200%, keyboard/AT, real browser/device, media/mic and recovery evidence |
| Reliable sustainable operation; `app/25–26` | every Pending/failure/data surface | Operations + owners; Stages 19, 23–26 | claim gates, compatibility, restore/delete, cost/queue/circuit/runbooks |

## 20. Definition-of-done proof and handoff

| Complete-architecture requirement | Evidence in this specification | Result |
|---|---|---|
| One owner per product/design state | §§5–8 module/data/API/state maps | PASS |
| Versioned, explainable evidence and failure semantics | §§3, 7–10 compatibility/state/job/recovery | PASS |
| Independent Written/Oral, absence not zero, no probability | §§3, 7.3, 15 | PASS |
| Safe/Ready/stale distinct; Gates A–F | §§3, 7.3, 19 | PASS |
| Shared five-skill foundations with modality differences | §§1.1, 4/D04, 6, 9 | PASS |
| Mistake lifecycle, P0–P4, review/transfer/retention | §§3, 6, 9, 19 | PASS |
| Corpus outage/no learner data/rights-confidence split | §§1.1, 4/D06, 5, 10 | PASS |
| Deterministic objective and bounded productive AI | §§4/D05/D07, 8–9, 13 | PASS |
| Guest/adoption/sync/export/delete/raw-audio | §§4/D08, 7, 11 | PASS |
| WCAG/responsive/browser/device complete processes | §§6.2, 12 | PASS |
| Offline/checkpoint/timer/idempotency/recovery | §§7–10 | PASS |
| Security/privacy/rights/abuse/dependency/incident/legal boundary | §§11, 14, 16–17 | PASS |
| Non-circular analytics/performance/reliability/cost/ops | §13 | PASS |
| Claim tests and quality gates | §§14–15 | PASS |
| Contracts/releases/backups/rollback through downtime/version change | §§7–10, 14 | PASS |
| Nine scenarios and Flows A–G walkthrough coverage | §§9.1, 19 | PASS |
| Safe phasing without misleading Readiness/P4/objective-only product | §15 | PASS |
| Final views/index/traceability/roadmap/risks/no ad hoc major choice | §§2–19 | PASS |

### 20.1 Decisions downstream implementation must preserve

Preserve the exact five validity and six Readiness states; direct and independent Written/Oral; absence-not-zero; Safe distinct from Ready; probability structurally absent; deterministic final truth/planning; shared five-skill foundations with typed modality extensions; local P0–P4 and full Mistake lifecycle; asynchronous Corpus with no learner data/live dependency; all-fault neutrality; immutable version lineage and targeted revalidation; account-optional first use; raw-audio/deletion/backup truth; complete-process WCAG across all 26 current frames; independent release units; and vertical-slice exposure gates.

**ADRs created/amended:** none; ADR-0001–0034 remain Accepted.  
**Dependencies introduced:** implementation-time source/release and claim-impact manifests, typed contracts, frozen rights-safe benchmark sets, support manifest, digest-bound quality evidence and the accepted low-ops provider/storage topology.  
**Dependencies removed:** any reliance on stale 24-frame prose, six-minute complete placement, four-gate domain booking, shortened weakness truth, `practice-only` as validity, instant backup erasure, live Corpus learner access, provider-owned meaning or objective-only completeness.  
**Cost-sensitive exits:** standard Node/SQL/S3/JSON/OpenAPI/OTel-compatible exports; provider-neutral capability fixtures; deterministic/fixed/queued/in-App fallbacks; predecessor/last-compatible release.  
**Owner questions:** none.  
**Deferred choices:** §17, with owner and fixed boundary.  
**Changed architecture paths for Stage 28:** this specification and the Stage-28 plus complete-architecture checklist blocks only.

Stage 28 has no downstream shaping stage. Implementation planning begins from Slice 0 and may expose a learner claim only at the safe boundaries in §15.
