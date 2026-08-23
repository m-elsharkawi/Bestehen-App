# Bestehen / App — End-to-End Architecture Validation

> **Stage:** 27 of 28  
> **Status:** Validation passed; Stage 28 may consolidate this architecture  
> **Decision owner:** Stage 27 / cross-stage architecture validation  
> **App baseline:** m-elsharkawi/Bestehen-App@d76d3e8f5bca49bd4dd7daa3022ca669570afce5  
> **Shaping baseline (read only):** m-elsharkawi/Bestehen-Shaping@9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc  
> **Validation date:** 2026-08-23  
> **Scope:** architecture proof and reconciliation only; no production code, deployment, migration, Design change, Shaping change, or feature expansion

## 1. Purpose and scope

This report independently tests accepted Architecture Stages 01–26 against the final product authority, the nine shaped end-to-end scenarios, Design Flows A–G, all 26 numbered current mobile design frames, the 12 recovery situations, and the accepted ADR set. Earlier acceptance is an input, not proof. The audit follows each claim through owner, persisted fact, derived projection, contract, failure state, version lineage, release gate, and learner-visible consequence.

The result is **GO for Stage 28**. No consequential ownership conflict, circular dependency, hidden learner-runtime Corpus dependency, new formula, provider-owned truth, or unassigned implementation decision remains. Four groups of source-language mismatch are recorded in §13; accepted product/architecture already resolve them, so no earlier architecture or ADR amendment is justified. Stage 28 must preserve these resolutions rather than reproduce stale Design/planning shorthand.

Validation introduces no new feature, Readiness formula, probability, calibration value, provider, runtime, or release unit.

## 2. Inputs, authority, and continuity

### 2.1 Live repository cut

| Repository | Role | Validated head | Write result |
|---|---|---|---|
| m-elsharkawi/Bestehen-Shaping | Product/Corpus authority; read only | 9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc | No write |
| m-elsharkawi/Bestehen-App | Architecture and Design source | d76d3e8f5bca49bd4dd7daa3022ca669570afce5 | Stage-27 report/checklist only after this cut |

The Stage-27 prompt blob is 1a8f44b1f4bdf16b5b2556f513892bb1adef709b; the shaping plan is b263c5e7b3bccc0450ddd17aa0cc007432d672b7; the pre-write live checklist is 6185d97592675424dbd4700fa43b80df33f142c7. Architecture/27-end-to-end-architecture-validation.md did not exist at the validated cut.

### 2.2 Authority and binding precedence

Conflicts resolve in this order:

1. Shaping app/28-bestehen-app-product-specification.md.
2. Detailed Shaping app/01–27; a final-spec delegation keeps the detailed rule normative.
3. 02_Bestehen_Identity.md.
4. 01_Bestehen_Product_Overview.md.
5. DESIGN-HANDOFF and human-authored design artifacts, only where consistent with product truth.
6. Design runtime/example code is illustrative.

Within the product, the binding Stage-27 priority is:

**validity and fairness → direct evidence in the claimed modality → independent Written/Oral pass risk → uncertainty resolution → due repair and retention → progression and coverage → learner preference.**

Exam urgency and an override may change plan priority. They never change evidence truth, target rules, validity, conditions, or Readiness.

### 2.3 Immutable semantic invariants

- Evidence validity is exactly: valid, partially_valid, pending, interrupted, not_counted.
- Readiness is exactly: evidence_building, not_ready, borderline, safe, ready_to_book, stale_contradicted.
- Learning evidence and Readiness evidence are different. Missing is absence, never zero.
- Written and Oral are independent aggregates and pass gates. Overall uses the weaker eligible component and cannot compensate.
- Safe is not Ready to Book. Official 60 and Bestehen's versioned Safe default 65 remain distinct.
- The current system has no pass-probability field, model, event, template, generic carrier, or hidden calculation.
- P0–P4 are local family/lane condition profiles, never a global course level or learner badge.
- All five skills extend one session/attempt/result/repair/evidence foundation and one Observe → Attempt → Diagnose → Repair → Retry → Remember loop.
- Corpus is asynchronous, rights-aware intelligence. Ordinary attempts use App-approved immutable versions; Corpus receives no learner profile and is not a live runtime/search/AI dependency.
- A technical, content, media, accessibility, browser, network, evaluator, provider, storage, notification, identity, or deployment fault never becomes learner failure.
- Historical observations and published conclusions retain original lineage. A new content/model/evaluator/blueprint/calibration release causes targeted current revalidation, not historical reinterpretation.
- Launch is responsive web, account-optional at first use, WCAG 2.2 AA for complete processes, with ephemeral raw audio and end-to-end export/deletion.
- Cost chooses among equivalent-quality paths. It cannot remove pass-critical Writing/Oral evidence, truth, access, rights, privacy, or recovery.

### 2.4 Complete source manifest

All listed files were fetched as complete current contents before deciding. Duplicate uploads, thumbnails, support scripts, and archival snapshots were excluded as instructed.

#### Shaping App 01–28

| Path | Blob SHA |
|---|---:|
| app/01-product-thesis.md | 6bbb074dc6a262cb66cebad960dd248d1010f21f |
| app/02-complete-learner-journey.md | 3c536176154a8239aeafc0697acd947280130142 |
| app/03-initial-diagnostic.md | 038ab89b0be23464eedf1408111dd1936320f57a |
| app/04-learner-model.md | f7ae1f4af375ee3302d04c726d8fe8453a9daf80 |
| app/05-mistake-memory.md | a7c574b08c33418eab44aba8b6e9b7f8ab877109 |
| app/06-daily-coaching-engine.md | 3cd869cd337dd3a878c27f35e1e8b5dad0c4c7bb |
| app/07-core-learning-loop.md | c313c859f64997972feca87497d70476c4528a20 |
| app/08-a1-to-b1-progression.md | 839a01c010cf79777520714d0ab09304a2ba9a06 |
| app/09-reading-training.md | fcc41029a7dfc44a65feca0602b42c4fa40e53cf |
| app/10-language-elements-training.md | a5aac29a9cb4b84e2951fc64bf0b5f4b0d15e6bf |
| app/11-listening-training.md | e77948d6722b2ce635886d4b345e2ff9aad476a8 |
| app/12-writing-coaching.md | 0a606197ad514e8c8958004188837e37173258be |
| app/13-speaking-coaching.md | 9462c78a1e7cc68249d38aa5a18a287be8aacd9c |
| app/14-review-and-spaced-repetition.md | fa9b65e92cd1511e00e106a199eb6fbc06273a69 |
| app/15-telc-readiness.md | b4456939928493569336bbc565d7e67307e7a3db |
| app/16-mock-exams.md | 8f6c23fa16524bd251cef39d823cfeea73bfcef3 |
| app/17-ready-to-book-logic.md | 9e3e8b24faefe885d5b10409725619d0d0d84e6d |
| app/18-coach-personality-and-behavior.md | 7bc3c2ee918264911a9550fe20e53dc565f986dd |
| app/19-information-architecture-and-core-screens.md | 615ba3ce97fb25f974b6ba3a020cf254ddd0065f |
| app/20-progress-and-motivation.md | fd8d002dbb79fd66dca3fdfa8f6771318f76cbe4 |
| app/21-content-strategy.md | 8149d6a268da70e17cad46f774b9d5de77776986 |
| app/22-user-controls-vs-coach-autonomy.md | 27f33cd56a09df27952e15bb3dfd0e077b89633c |
| app/23-exam-date-and-urgency.md | 5942ed811bcbaa5baaf1dd55079b8971d34b1d01 |
| app/24-analytics-and-success-metrics.md | 28d1a5380a7ea9f28efdc95ce0c96987920917e1 |
| app/25-business-model-and-product-boundaries.md | 904ae20e8cb3f9f354d6505513821e86f609622b |
| app/26-platform-accessibility-nonfunctional.md | 8137091683941b0d55f3d4fb90af3c402b8371e5 |
| app/27-end-to-end-scenario-validation.md | 5da3b0a27ba516770210773399f0415cfb1f5460 |
| app/28-bestehen-app-product-specification.md | 18ae80cc2fd63cecd76c297c3e56d44a68367856 |

#### Other shaping authorities

| Path | Blob SHA |
|---|---:|
| 01_Bestehen_Product_Overview.md | 42f15da945e03f1d8e32dfe010f95aae6b87daa3 |
| 02_Bestehen_Identity.md | f8799407f7b4a5a657f8c81439425d5a004f4e1c |
| corpus/12-corpus-app-contract.md | 7add217f62118e5abe100680d2e8230a93b8c280 |
| corpus/17-bestehen-corpus-product-specification.md | 537b5185313097d043748f9dc9f9fdaf432ee71d |

#### Human-authored Design sources

| Path | Blob SHA |
|---|---:|
| Design/Bestehen Logo/Bestehen Logo System.dc.html | 5eb296da8a83531306195c9d91dd30cbeed8c608 |
| Design/Bestehen-01-Design-System.dc.html | d4e371aacee32c85ddc53cf9cf3abaaff4e86e7a |
| Design/Bestehen-02-Mobile-Screens.dc.html | 0a9f2d3ea982c3197f399941b57defd9869d2428 |
| Design/Bestehen-03-Desktop-Responsive.dc.html | 94056db181b45298a759ff727ad5cfeac2f2a469 |
| Design/Bestehen-04-Flows-Handoff.dc.html | 7120b05a2272c31e5896e4313a7007935f5d0aed |
| Design/Bestehen-Type-Options.dc.html | 7b51302ad1943c2676a5bb28d54aa7ead28b8dcd |
| Design/DESIGN-HANDOFF.md | 417a6820037e045e2dd9f29afc42b9f2e94fd638 |

No new mutable technology or commercial choice is made here. Current official-source links, access date 2026-08-23, quotas/region/price/browser/security evidence and exit triggers in accepted Stages 03, 14, 16, and 19–26 were audited for internal use; this validation does not duplicate or broaden those time-sensitive claims. A changed provider fact invalidates its named release evidence before promotion.

The current numbered Mobile Screens source contains 26 frames: 1.1–1.4, 2.1–2.6, 3.1–3.4, 4.1–4.6, and 5.1–5.6. DESIGN-HANDOFF, the flow handoff, the master plan, and the Stage-27 prompt still say 24. Stage 13's semantic-ID/frame map and Stage 25's corrected complete-process matrix are the current architecture truth. Validation covers all 26.

#### Accepted Architecture 01–26

| Stage output | Blob SHA |
|---|---:|
| Architecture/01-architecture-charter-and-quality-attributes.md | cc8d28816f43d627861d11cd90e8770c4c96414c |
| Architecture/02-system-context-and-product-boundaries.md | 046d114bbbc96528bf0b9eae0406c0235f759127 |
| Architecture/03-technology-stack-and-repository-strategy.md | 907b04c57813dc50f92a7ed00e49196ff7d4a924 |
| Architecture/04-domain-model-and-bounded-contexts.md | ab1a775d7689e47bba00c2544c247ef344c44e70 |
| Architecture/05-data-ownership-persistence-and-schema-evolution.md | bb6df811ec9010de556d1719f22e31bb8ca3190e |
| Architecture/06-evidence-ledger-validity-versioning-and-audit.md | 53d34ae65ef4c8fa79c00026f9bd5d7b876ce672 |
| Architecture/07-learner-model-mistake-memory-progression-and-review.md | ad58238aee48e41a0d4bd30bd21ac5a17707656f |
| Architecture/08-coaching-engine-and-session-state-machines.md | 02c5e1ee5967bad976eda49ab4813a768eda5bd3 |
| Architecture/09-content-exercise-form-and-media-architecture.md | e6fb121ab1b10c6cbcf692bc88acaf98f2e45e7a |
| Architecture/10-corpus-integration-compatibility-cache-and-rights.md | d4e1ab25e359dcfcc506ee29462760a41647138d |
| Architecture/11-readiness-scoring-mocks-and-ready-to-book.md | 7c327cd770460b94107f2756e2b7d8f29c56b909 |
| Architecture/12-api-contracts-jobs-events-and-idempotency.md | c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528 |
| Architecture/13-frontend-application-and-design-system-architecture.md | 7da94f122fa86412b0d1a12b84c123645693efb4 |
| Architecture/14-responsive-accessibility-browser-and-device-architecture.md | 362068924a6942eb955dcc132fb4c94da122597b |
| Architecture/15-reading-and-language-elements-runtime.md | ef7f4228f9f48fe0c9f8bd8e1e7494177c6be667 |
| Architecture/16-listening-audio-tts-and-media-delivery.md | 6bb60e2d6048a39035107ff427a0c4fd305c1ba6 |
| Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md | c2c3de417f1d3bcd8c53e1bf40fbb49522c34529 |
| Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md | 2f118f817a99b76dc1e0c38c0aedaa1e0662268e |
| Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md | 60aef66f8443e747935b2cfb479dd7f4dd4d5c23 |
| Architecture/20-account-local-first-profile-sync-export-and-deletion.md | 9a1aa2d5fea31ff0bdccfc4561806bb870511ab6 |
| Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md | 1216f98f5489119b4d8114804ac87936bc78ddd4 |
| Architecture/22-notifications-scheduling-and-time-zones.md | 6e0e8a761b9cf83a75931e815f447e148e3a20d0 |
| Architecture/23-security-privacy-rights-retention-and-threat-model.md | abc1a300d5b0fd659d28f768669dd73afbb90887 |
| Architecture/24-analytics-calibration-observability-performance-reliability-and-cost.md | c588f48790e2fc06b9ba656fddace222d73e554a |
| Architecture/25-testing-evaluation-and-quality-gates.md | 83f4f481fb681bf09666032a4e06e7c77289e883 |
| Architecture/26-environments-ci-cd-release-and-operations.md | c81412c46aa3b2a77ac9fcb4a0840e1b63af8bd4 |

#### ADR register

The ADR index blob is 41fd35cfb2e2933f05ee5d8a8719ad025c4c862f. ADR-0001 through ADR-0034 were each read in full and remain Accepted; no supersession or amendment is required.

| ADR | Blob SHA | Status |
|---|---:|---|
| Architecture/adr/ADR-0001-evidence-truth-and-explicit-uncertainty.md | 8408ce1ab28c43c070d87c2dbea9160c899af60f | Accepted |
| Architecture/adr/ADR-0002-modular-low-ops-deterministic-first-posture.md | bc55348b30ce9570ecaef29c75477d527ac0bd97 | Accepted |
| Architecture/adr/ADR-0003-quality-attributes-are-release-gates.md | 010437c072277d6d0aed39a53d76b5cb56e363c7 | Accepted |
| Architecture/adr/ADR-0004-app-runtime-independent-from-corpus.md | 6e3d72f9bfec47919cb6c4e02b3dad7114179f42 | Accepted |
| Architecture/adr/ADR-0005-app-semantic-authority-across-processors.md | ba04a79d848dc19f328fd0f28c474de55ec5df5e | Accepted |
| Architecture/adr/ADR-0006-typescript-nextjs-modular-monorepo.md | 05a728f5f545125c60bc775353aff32329af51a9 | Accepted |
| Architecture/adr/ADR-0007-postgresql-authority-and-durable-jobs.md | 025f38e0b834acab7542f6f6a41575decb524b5e | Accepted |
| Architecture/adr/ADR-0008-render-single-region-managed-deployment.md | a5266a2734faadeeeca1ef350942bb8a3b51ef38 | Accepted |
| Architecture/adr/ADR-0009-private-eu-s3-compatible-object-storage.md | 2260badfb4953459898174d334db1d3f5b2d65c9 | Accepted |
| Architecture/adr/ADR-0010-bounded-contexts-and-single-state-ownership.md | 2fd22d071d30ad38445e33544be11d8641fb2e68 | Accepted |
| Architecture/adr/ADR-0011-shared-five-skill-foundation-with-modality-extensions.md | 64b5180c99de2da6ff50dcf3be4fbc1bf23361e2 | Accepted |
| Architecture/adr/ADR-0012-append-oriented-relational-truth-and-bounded-persistence.md | 2e2ae7220a03f30e2f1a564fecd93bdb76347b03 | Accepted |
| Architecture/adr/ADR-0013-immutable-evidence-envelope-and-append-audited-validity.md | c51602d9e68e1b9857c2de75caa9d87e5dca58a3 | Accepted |
| Architecture/adr/ADR-0014-deterministic-learner-projections-and-capability-obligations.md | 31272ae27f8a1a43b5f16880f0e34ed9eee07746 | Accepted |
| Architecture/adr/ADR-0015-deterministic-coaching-policy-and-revisioned-session-execution.md | 2e5a02c9e5be05c6e872ca9f10320b5666db0ab7 | Accepted |
| Architecture/adr/ADR-0016-immutable-approved-content-manifests-and-family-independence.md | 8ccd9ea0937c676ab48d863c1658fa9b79eb20db | Accepted |
| Architecture/adr/ADR-0017-signed-immutable-corpus-bundles-and-atomic-app-promotion.md | 844a471b91181fa7bd943ae7de4c5d4565ba0734 | Accepted |
| Architecture/adr/ADR-0018-deterministic-versioned-readiness-and-reversible-booking-gate.md | 5425ad8f273fc968fd692ccb3188c9fcea954d33 | Accepted |
| Architecture/adr/ADR-0019-versioned-http-contracts-and-durable-idempotent-asynchronous-work.md | 3239c98511979ef49a50773e736ce8b0b0e76f9e | Accepted |
| Architecture/adr/ADR-0020-server-first-frontend-composition-and-bounded-browser-state.md | 154d1f7e1d0cd2d5d72a8b55717098d5679da17a | Accepted |
| Architecture/adr/ADR-0021-single-semantic-design-system-and-shared-five-skill-extension-contract.md | 144057917dedbdc91e8ea0c2a32826c7476625c1 | Accepted |
| Architecture/adr/ADR-0022-capability-gated-responsive-web-and-evidence-aware-accessibility.md | dd0d19e408898e232629b350aa927615a7174dda | Accepted |
| Architecture/adr/ADR-0023-deterministic-objective-task-runtime-and-immutable-outcomes.md | 15f6220d2be7b287513dd18d2c823907fbac3461 | Accepted |
| Architecture/adr/ADR-0024-pinned-batch-audio-and-evidence-sensitive-playback.md | f792a0f48a4f70625c9cca8cb41bb8a68c59fec6 | Accepted |
| Architecture/adr/ADR-0025-durable-writing-drafts-and-bounded-versioned-evaluation.md | ac7b1594971f450cab08c7f34ca7bb0c395057cc | Accepted |
| Architecture/adr/ADR-0026-ephemeral-voice-evidence-and-bounded-oral-evaluation.md | 7a787a6d1117eaf4783022cdbfb84b024b7e03fe | Accepted |
| Architecture/adr/ADR-0027-capability-specific-ai-routes-and-evidence-governed-candidates.md | c4e526178ce14addec5da22bda6241919ac312ac | Accepted |
| Architecture/adr/ADR-0028-provider-portable-account-identity-and-id-preserving-local-first-lifecycle.md | b7c4981174d8e7b92ccbf0bb4639b0464f35848c | Accepted |
| Architecture/adr/ADR-0029-bounded-local-write-ahead-continuity-and-conservative-timer-reconstruction.md | 9506e8569cc68860d9f7fe9d2f487d4be9f03233 | Accepted |
| Architecture/adr/ADR-0030-deterministic-local-calendar-scheduling-and-replaceable-standards-web-push.md | 7a7a93a661ecc72ef02e723b24c7030e37d53918 | Accepted |
| Architecture/adr/ADR-0031-minimized-authoritative-trust-boundaries-and-bounded-retention.md | 9ddfd6e31cc55cf095c1d002abb907aa32d770d2 | Accepted |
| Architecture/adr/ADR-0032-lean-evidence-derived-telemetry-frozen-calibration-and-measured-operating-gates.md | 54ae839749fe66f8809080466a97f6cde5a917e7 | Accepted |
| Architecture/adr/ADR-0033-claim-based-risk-gates-and-immutable-release-evidence.md | 6cf0903e5e9ef72f121c0234f8e0f3494b5a4500 | Accepted |
| Architecture/adr/ADR-0034-digest-bound-independent-release-units-and-conservative-promotion.md | 4ca9f8cf6edb65a423d803ae3ae4cb4c733ac574 | Accepted |

## 3. Validation decisions and rationale

| ID | Binding validation decision | Credible alternatives and rejection | Consequences / exit |
|---|---|---|---|
| ARCH-S27-D01 | Keep one semantic owner for every consequential state; browser, provider, worker, cache, analytics and operations expose or transport typed projections only. | Do nothing and let each feature interpret state is simpler locally but creates duplicate truth. A separate service per owner adds unsupported operational coupling. | Preserve the Stage-04 bounded-context map inside the modular monolith. Split a module only after measured contention or a distinct security/deploy boundary, with the same contract and owner. |
| ARCH-S27-D02 | Treat the fixed precedence and exact state vocabularies as release-blocking invariants, not tunable configuration. | A weighted planner can blur priority and truth. A generic status string is flexible but hides Pending/partial scope. Both are rejected. | CI/quality evidence scans schemas, events, templates and fixtures. Unknown consequential major fails only the affected surface closed. |
| ARCH-S27-D03 | Validate claims through nine product scenarios plus Flows A–G, 12 recovery cases and all 26 current frames; no happy-path-only acceptance. | Page-count or coverage-percentage validation is cheaper but cannot prove process truth. Manual narrative alone is not replayable. | Stage 25 claim gates and Stage 26 release evidence must carry scenario/flow/process receipts. |
| ARCH-S27-D04 | A fault changes only the affected capability/claim and yields neutral Pending, interrupted, not_counted, partial, unavailable or practice-only conditions as owned; it never produces poor performance, weakness, zero, or readiness regression. | Fail the whole session is operationally simple but violates local degradation. Silently retrying can change conditions. | Preserve facts, exact affected scope, idempotency and safe alternatives; escalate or substitute only within versioned caps. |
| ARCH-S27-D05 | Bind every consequential result to an explicit compatibility vector: API/contract, target blueprint, content/form/media, evaluator/model/prompt/schema, calibration/policy, reason/template/tzdb and activation releases as applicable. | One global app version is simple but cannot target revalidation. Mutable latest is cheaper but unauditable. | Historical records keep their original vector. Incompatibility holds only dependent new/current claims. ADR-0034 remains the release-unit authority. |
| ARCH-S27-D06 | Publish incrementally by complete claim-bearing vertical slices; keep Readiness numbers, mocks and booking gates closed until their complete evidence, accessibility, deletion, restore, content and model prerequisites pass. | Ship all-or-nothing delays useful low-risk practice. Ship UI first with placeholder/partial truth misleads. | Stage 26 activation records govern availability/routing only and cannot alter semantics. Roll back or disable exact capability; never reinterpret evidence. |
| ARCH-S27-D07 | Data rights are an idempotent cross-owner workflow: revoke access first, cancel/neutralize late work, purge live/provider/cache state, replay deletion journals before restore, and report bounded inaccessible backup residual honestly. | UI-only deletion and instant-backup-erasure claims are false. No backups violates recovery. | Product data disappears from access immediately; backup residual is inaccessible and suppressed on restore, with the accepted maximum 91-day journal/residual lifecycle. Raw audio is excluded from backups and final/≤7-day Pending rules remain stricter. |
| ARCH-S27-D08 | WCAG 2.2 AA is complete-process equivalence across the seven flows, all 26 frames, every skill input, Readiness text audit, account/data controls and recovery—not an isolated-page score. | Automated scanning only misses semantics and AT behavior. A separate accessible practice path risks unequal evidence. | Preserve identical evidence where interaction is equivalent; otherwise record the actual accommodation/condition and narrow only the claim. Real browser/device/AT evidence gates supported release. |
| ARCH-S27-D09 | Keep objective work deterministic and zero-runtime-AI; productive AI is a provider-neutral candidate pipeline with minimum payload, one justified escalation, accepted-result authority in Evidence, cost receipts and honest Pending. | Per-click generation/voting is expensive and unreviewed. Removing productive evaluation destroys pass-critical evidence. | Circuit-open fallback is objective/repair work, fixed partner practice, queued evaluation or narrower claim. Provider substitution uses benchmark/compatibility gates and never rewrites accepted history. |
| ARCH-S27-D10 | Stage 28 is permitted only because this report finds no unresolved consequential gap. Any future contradiction touching truth, direct modality, component gates, rights, deletion, accessibility or version compatibility reopens validation and blocks consolidation/release at exact scope. | Treating Stage 27 as a prose summary would allow implementation invention. Reopening all accepted ADRs without evidence would erase durable history. | This report records source mismatches without editing them; a future durable reversal requires a superseding ADR and targeted impact evidence. |

## 4. System context and dependency proof

~~~mermaid
flowchart LR
  Learner["Learner / guest or account"] --> Browser["Responsive web projection + local WAL/cache"]
  Browser --> API["App modular monolith / typed HTTP contracts"]
  API --> Profile["Profile & Goal"]
  API --> Attempt["Session & Attempt"]
  API --> Content["Content & Forms"]
  API --> Evidence["Evidence & Capability"]
  API --> Measure["Readiness & Mocks"]
  API --> DataRights["Data Rights / operations"]
  Attempt --> Eval["Bounded Productive Evaluation"]
  Evidence --> Mistake["Mistake Memory & Review"]
  Evidence --> Progress["Progression"]
  Evidence --> Measure
  Mistake --> Coach["Coaching & Planning"]
  Progress --> Coach
  Measure --> Coach
  Content --> Attempt
  Corpus["Corpus publication bundles"] -->|async signed import; no learner data| ACL["Corpus Publication ACL"]
  ACL --> Content
  Eval -->|candidate only| Evidence
  API --> PG[("PostgreSQL authority")]
  Browser --> IDB[("IndexedDB local continuity")]
  Content --> R2[("Private immutable media/content")]
  DataRights --> PG
  DataRights --> R2
~~~

No arrow returns learner data to Corpus. No provider, browser cache, analytics row, job or UI component owns learner truth.

## 5. Ownership, state, contract, and version audit

### 5.1 Single-owner matrix

| Consequential truth | Authority | Persisted fact / projection | Contract and forbidden duplicate |
|---|---|---|---|
| Guest/account scope, goal/date, preferences, declared access needs | Learner Profile & Goal | facts and history | Identity provider proves sign-in only; date never changes readiness |
| Plan priority/revision and recommendation reasons | Coaching & Planning | rebuildable versioned plan | GET /plans/current and POST /plans:assemble; browser never ranks |
| Session, attempt, response/checkpoint, timer, help, playback, exposure, interruption | Session & Attempt | facts/history | Expected version + operation ID; evaluator cannot overwrite |
| Five validity states, conditions, directness, accepted evidence, corrections | Evidence & Capability | append-audited facts + projection | Candidate provider output cannot set evidence; fault cannot become learner failure |
| Capability/confidence/freshness/stability/trend | Evidence & Capability | deterministic source-cut projection | Missing absent; cross-skill signal may schedule a probe, never prove |
| Weakness and review obligation | Mistake Memory & Review | episode facts + lifecycle projection | Same-chain retry is not independent retention |
| Local family/lane P0–P4 | Progression | deterministic projection | Never global learner level or UI collectible |
| Approved content/form/media/right/family identity | Content & Forms | immutable revision and lifecycle | Corpus supplies intelligence; App alone serves/approves learner content |
| Corpus bundle compatibility/activation | Corpus Publication ACL | signed import/activation state | No route-time Corpus search or learner payload |
| Evaluation job, candidate, confidence, disagreement, deletion obligation | Productive Evaluation | bounded job/candidate state | Evidence accepts; provider is replaceable |
| Mock verdict, Written/Oral estimates, six Readiness states, Gates A–F | Measurement: Readiness & Mocks | immutable measured facts + deterministic projection | No merged compensation, no probability, no client calculation |
| Export/delete lifecycle and proof | Profile request + Operations orchestration + each domain owner | request, task receipts, deletion journal/proof | Immediate revoke; no restored resurrection; proof stores no learner payload |
| Incidents, cost, release/calibration health | Operations & Governance | minimized operational facts | May disable adapter/capability, never edit learner truth |

### 5.2 Client-visible discriminated state contract

A semantic response uses Stage 12's completed, accepted_pending, partial, conflict, unavailable, and deleted outcomes with exact scope, reasons, lineage, safe actions, and contract metadata. HTTP failure is not a domain learner result. Unknown consequential discriminator/major renders a neutral update-required/unavailable state for only the affected surface.

Practice-only is a condition/eligibility projection, not a sixth evidence-validity value. Mock verdicts such as clean target-condition, valid but modified, partially valid, invalid/excluded, and pending evaluation map explicitly to the exact five evidence states and actual conditions. Learner-facing words may be simpler, but the API and audit retain canonical values.

### 5.3 Compatibility and correction sequence

~~~mermaid
sequenceDiagram
  participant O as Observation owner
  participant E as Evidence
  participant D as Derived owner
  participant U as UI
  participant R as Release registry
  O->>E: immutable fact + full version vector + operation ID
  E->>E: validate scope, condition, directness, validity
  E->>D: accepted receipt + source cut
  D->>U: discriminated projection + reasons + lineage
  R-->>D: compatible successor activated
  D->>D: targeted rebuild for affected claims only
  D->>U: current state plus historical published version
  Note over O,U: no fact or historical conclusion is rewritten as if produced by successor
~~~

The compatibility vector is explicit and independently versioned. A changed target blueprint suspends affected current target claims; a changed evaluator requires benchmark and targeted productive revalidation; a rights withdrawal blocks serving immediately and changes learner evidence only when an explicit correctness/policy impact requires it.

## 6. Nine-scenario architecture walkthrough

Source trace: m-elsharkawi/Bestehen-Shaping/app/27-end-to-end-scenario-validation.md §§5.1–5.9, with final authority in app/28-bestehen-app-product-specification.md §§4–15. Each row also exercises the Design flow/frame cited in §7.

| Product scenario | Concrete component/state/data/API path | Failure, privacy, timing and cost proof | Required validation evidence |
|---|---|---|---|
| A — A1 Day-1 | Guest scope → partial/resumable five-skill diagnostic → immutable attempts/conditions → direct per-skill evidence → evidence_building with absent numeric estimate → first plan. POST attempt checkpoint/submit is idempotent. | Mic decline creates no Oral observation; written work continues. Minimum productive payload only if the learner chooses the sample; no account wall, Corpus call or probability. | Resume/abandon fixtures, guest isolation, keyboard/AT completion, missing-as-absence and no-probability schema/copy scan. |
| B — A2 midpoint | GET current plan → deterministic Stage-27-priority candidate selection → shared loop → objective scoring or bounded productive evaluation → Mistake/Progression/Review projections → Remember receipt. | Help/exposure/timing remain explicit. Provider Pending blocks only dependent Writing/Oral claim; local objective work continues. Cost circuit may defer, never score negatively. | Deterministic plan checksum; override/freshness/retention properties; late/duplicate evaluator tests. |
| C — strong Reading, weak Speaking | Independent component risk causes a direct Speaking action despite comfortable Reading preference; mic preflight → fixed/bounded turns → STT hypothesis/correction → structured oral candidate → accepted direct Oral evidence. | No transcript-as-score, no text inference into Oral. Denied/silent mic yields local alternative labelled learning-only; raw audio finalizes/deletes or expires ≤7 days Pending. | Real-device mic/AT cases, audio deletion proof, direct-modality and component-bottleneck invariants. |
| D — 30-day deadline | Goal/date projection changes planning urgency and milestones; plan protects weakest independent gate, due repair and decision-relevant mock without changing validity/Readiness formula. Notifications derive reviewed reasons, caps and local-calendar resolution. | Time zone/DST, late/duplicate/disabled push never create missed-day debt or evidence change. In-app parity remains. | Frozen-clock/tzdb fixtures, cap/dedupe/no-post-delete-send, overload plan fallback and no date-to-truth mutation. |
| E — return after break | Historical evidence stays; current freshness becomes stale/historical-only; Readiness may become stale_contradicted; smallest direct recheck rebuilds only affected current claims and plan. | Offline/local history restores through WAL/sync. No backlog, guilt, automatic weakness, zero or historical deletion. | Six-week, blueprint-change, device-conflict and no-resurrection restore scenarios. |
| F — failed full mock | Measured block pins blueprint/form/timing/playback/evaluator versions; block verdict and scoped evidence publish immutably; exactly two priorities feed Coaching. Written and Oral remain separate. | Background/interruption affects exact block; productive Pending leaves mock partial. A technical/content fault is not failure. Timing replay uses trusted receipts and conservative reconstruction. | Full/partial/interrupted mock model tests, final-5 behavior, no cross-component compensation, immutable result/correction. |
| G — Speaking coaching | Shared loop with speaking input extension, contextual permission, level preflight, fixed partner first, turn receipts, one bounded evaluation/escalation, repair then fresh/independent follow-up. | Realtime premium voice is absent. STT is provisional; mic/browser/provider faults remain neutral. Audio encrypted/private and excluded from backups. | Turn-order/idempotency, device removal, transcription correction, benchmark slices, payload/minimization and retention drill. |
| H — Writing repair | Durable local draft + server checkpoints → immutable original response → deterministic prechecks → one structured evaluator candidate → Evidence acceptance → limited feedback/repair → fresh response identity. | Offline edits remain usable; conflicting revisions require explicit merge choice. Provider outage leaves Pending and unrelated work available. Learner text never enters Corpus. | Autosave loss budget, offline/reconnect/conflict, original-vs-revision, evaluator/gold and complete editor accessibility tests. |
| I — Ready-to-Book transition | Measurement consumes current compatible direct evidence and mock facts; calculates Written/Oral independently; Safe plus Gates A–F produces ready_to_book. UI renders both gates, reasons, evidence table and reversible milestone. | Missing/Pending keeps only dependent gate open; new contradiction/blueprint change reverses current guidance without erasing milestone. No probability or model-generated claim. | Gate truth table, weaker-component property, six-state exhaustive rendering, stale/contradicted reversal and text-equivalent AT review. |

### 6.1 Full lifecycle paths outside the nine shaped scenarios

| Journey | End-to-end proof |
|---|---|
| Guest → account | Guest App ID remains canonical; hosted OTP proves identity; adoption command merges by semantic IDs, explicit conflicts and tombstone precedence. No evidence is duplicated or provider-owned. |
| Multi-device/offline/recovery | IndexedDB WAL/checkpoints preserve bounded local work; foreground replay uses operation IDs/expected versions; server accepted sequence owns account convergence; conflicts remain explicit. |
| Export | Source-cut export collects human-readable and machine-readable goal/evidence/Readiness/weakness/review/attempt/mock/preferences/evaluation data; rights-restricted Corpus assets and secrets are excluded; artifact expires ≤24 h. |
| Delete/restore | Revoke first, cancel/neutralize jobs and callbacks, purge live/provider/object/cache state, retain only minimized bounded proof/tombstone, replay journal before any restored database is served. |
| Notification permission/failure | Contextual per-browser opt-in; denied/revoked/unsupported keeps in-app scheduling. Delivery failure changes no plan/evidence/Readiness fact and creates no debt. |
| Rights withdrawal/content defect | Deny new serve immediately; distinguish rights-only from correctness impact; quarantine exact revision; issue scoped evidence correction only when impact says so; unaffected history remains. |

## 7. Flows A–G, 26-frame and accessibility validation

Source trace: Design/Bestehen-04-Flows-Handoff.dc.html (Flows A–G and accessibility/coverage arrays), Design/Bestehen-02-Mobile-Screens.dc.html (numbered frames 1.1–5.6), DESIGN-HANDOFF.md §§1–7, and shaping app/26-platform-accessibility-nonfunctional.md §§3–10.

| Design flow | Complete architecture path | Equal completion/evidence and recovery proof |
|---|---|---|
| A First session | Frames 1.1–1.4; guest goal/date and resumable five-skill diagnostic | Skip date/mic/abandon remain honest, resumable and evidence_building; not a six-minute complete placement claim |
| B Daily coaching | 2.1–2.6 plus desktop D1; one shared loop and explicit override | Focus order, non-drag inputs, help/timing labels, stop/replan and Remember work with keyboard/AT |
| C Repair/retention | 2.4–2.6, 4.3; weakness/review owners and fresh/delayed checks | Same-session retry cannot claim retention; absent fresh content leaves transfer Pending, never learner failure |
| D Mock | 4.4–4.5, 5.4 and desktop mock; measured contract and scoped verdict | Timer hide does not change timing; interruption choices and productive Pending preserve unaffected sections |
| E Readiness | 4.1–4.2, 4.6 and desktop evidence panel | DOM sentence precedes graphics, real evidence table, separate Written/Oral gates, six states and Gates A–F |
| F Failure | 5.1–5.4 and Design recovery family | Detect → name system owner → protect record → repair/alternative → resume/defer; no local fault becomes learner failure |
| G Absence/data | 5.5–5.6; freshness/recheck plus export/delete | Neutral return; historical lineage; accessible confirmation/status; truthful backup residual rather than instant-erasure copy |

The architecture tests all 26 current numbered frames, not the stale “24 mobile screens” narrative count. Complete-process gates include 320 px reflow, 200% text zoom, keyboard-only completion, screen-reader/live-region semantics, reduced motion, non-color meaning, 44×44 targets, German language annotation, focus restoration, equivalent select-then-place interaction and actual supported browser/device/AT evidence. An accessibility mechanism that changes the measured condition is recorded; it never silently penalizes the learner.

### 7.1 The 12 recovery situations

Network lost mid-Writing; audio load failure; microphone denied; silent/wrong input; mock paused/backgrounded; evaluator slow; evaluator outage; defective item; fresh P4 content exhausted; unsupported browser capability; return after six weeks; and target blueprint change each map to an owner and exact affected scope in §8. This closes Design's complete recovery catalog.

## 8. Cross-stage failure and recovery matrix

| Failure | Owner / detected state | Learner-visible and evidence consequence | Recovery, test and operational signal |
|---|---|---|---|
| AI route/model/cost circuit | AI Gateway + Productive Evaluation | Exact capability Pending/unavailable; no guessed result, weakness or Readiness change | One bounded retry/escalation; validated substitute or deterministic/queued fallback; benchmark/cost/queue-age gate |
| Listening audio/CDN/decode | Media + Attempt | not_counted/our fault for affected task; Listening record unchanged | Retry immutable rendition, alternate audited asset/task; byte/hash/decode/preflight test |
| Microphone denied/silent/removed | Browser capability + Attempt | Attempt does not start or exact turn interrupted; no Oral evidence; other skills work | Contextual retry/device switch/equivalent learning-only rehearsal; real-device/AT test |
| Network/offline | Browser WAL + API owner | Local draft/checkpoint state explicit; no duplicate or false clean timing | Foreground replay with semantic operation ID and expected version; disconnect/reorder/conflict test |
| Unsupported browser/storage/accessibility capability | Capability contract | Only incompatible high-stakes activity blocked/practice-only; no global App block | Safe alternate device/input/task/export; current support manifest and complete-process test |
| Content defect/rights withdrawal/fresh inventory gap | Content & Forms | Exact revision unavailable/quarantined; correctness impact alone drives scoped correction; no learner blame | Last eligible independent alternative, lower-claim practice, takedown/cache purge, inventory/rights test |
| Evaluator timeout/low confidence/disagreement | Productive Evaluation | pending for dependent dimension; original response remains; objective/unrelated work usable | One justified escalation or fresh sample; SLA/benchmark/late-result/idempotency test |
| Corpus outage/incompatible bundle | Corpus Publication ACL | No effect on already approved compatible App inventory; import state is not evidence state | Continue last-compatible; quarantine candidate; signed digest/compatibility/rollback drill |
| Identity/OTP/session/provider outage | Identity adapter + Profile | Guest/local work and export remain; account-only sync unavailable, never learner failure | Provider-portable subject mapping, session revoke/retry, anonymous adoption fixtures |
| Push/notification/tzdb job failure | Scheduling/Notifications | In-app parity; no debt, penalty, evidence or Readiness effect | Deduplicate/cancel stale jobs, external-send kill switch, frozen time/tzdb/cap tests |
| IndexedDB/PostgreSQL/R2/storage failure | Local persistence / Data owner / Operations | Durability/preflight state explicit; do not begin unprovable measured work; unaffected cached/online paths remain | Checkpoint, backup/PITR/off-provider restore, object substitution, loss-budget and no-resurrection drill |
| Deploy/schema/job incompatibility | Release registry + Operations | New capability/traffic held at exact unit; predecessor remains active; no mixed-version claim | Expand/contract, compatibility manifest, roll forward default, rollback/disable exact route, candidate/restore evidence |

~~~mermaid
stateDiagram-v2
  [*] --> Usable
  Usable --> AffectedPending: provider/evaluator delayed
  Usable --> AffectedUnavailable: capability/content/rights failure
  Usable --> Interrupted: in-progress boundary lost
  AffectedPending --> Usable: compatible late result accepted idempotently
  AffectedPending --> NotCounted: deadline/deletion/candidate rejection
  AffectedUnavailable --> Usable: safe alternative or predecessor
  Interrupted --> PartiallyValid: unaffected scope proven
  Interrupted --> NotCounted: no claimable scope
  NotCounted --> [*]
  PartiallyValid --> [*]
  note right of Usable
    Other skills and unrelated claims remain available.
    No transition means learner failure.
  end note
~~~

## 9. Threat, privacy, rights, retention, latency, timing, cost and operability walks

| Surface | End-to-end validation | Gate / bounded fallback |
|---|---|---|
| Guest/account and authorization | Object/action/field authorization uses App owner scope; Auth provider subject is not learner identity authority; CSRF/origin/session fixation/revocation and rate abuse are tested. | Guest remains useful; account sync pauses locally; no cross-learner adoption/merge. |
| Productive text/audio | Minimum purpose-specific pseudonymous payload; allowlisted schemas; no unrelated history/raw logs/provider training contribution; one escalation. | Circuit opens to Pending/queued/fresh sample. Audio final deletion and ≤7-day Pending ceiling are release blocking. |
| Content/Corpus/rights | Signed immutable bundle, independent authenticity/confidence/rights, App approval and serving manifest, takedown/cache purge. | Last compatible rights-eligible App inventory; no raw-source redistribution/export or learner data to Corpus. |
| Export/delete/backups | Exact inventory, idempotent tasks, revoke-first/no-late-write, private expiring export, deletion proof, restore journal. | Immediate access denial; truthful inaccessible residual ≤91 days; no backup resurrection; legal review before public launch, no compliance claim. |
| Accessibility/security controls | OTP, consent, microphone, delete, notification and error flows meet complete-process WCAG; secure controls do not create an inaccessible core route. | Equivalent interaction or honest narrower condition; critical supported-flow issue blocks release. |
| Timing/replay/idempotency | Monotonic checkpoint/occurrence facts, trusted server/monotonic timing, conservative post-restart reconstruction, exact playback/exposure receipts, semantic operation IDs. | Ambiguous measured scope becomes interrupted/partial/not_counted, never clean or poor. Duplicate/late work produces one effect. |
| Latency/reliability | Objective scoring/local editing stay immediate; productive work crosses structured Pending threshold; local failure budgets L0–L3 are measured; provider/queue/circuit states are explicit. | Unaffected scope stays useful. Missed accepted budget blocks/narrows capability, not truth. |
| Variable cost | Usage receipts and price catalog by AI/STT/TTS/media/push/storage; batch/cache/pre-generate objective/media; one productive request plus capped escalation. | Cheaper validated adapter, fixed partner, queued/lower-claim path, in-app notification, lower-frequency Corpus publication; no fixed owner budget invented. |
| Operations/release | Minimal managed modular deployment, immutable artifacts, signed/digest-bound quality evidence, independent release units, restore/delete drills and named runbooks. | Predecessor/last-compatible, targeted disable/roll-forward; no Kubernetes, warehouse, stream platform, multi-region or always-on staging requirement. |

### 9.1 Data and processor retention result

Structured learner evidence is retained for the active goal/history until learner deletion, under the accepted bounded class policy. Writing/transcripts/evaluations follow their purpose-bound retention. Raw speaking audio is ephemeral, excluded from generic analytics/session replay/backups, deleted after finalization, and retained no longer than seven days only while unresolved processing may still responsibly complete. Exports expire within 24 hours. Linkable deletion journal/restore suppression has the accepted maximum 91-day lifecycle. Provider copies and late callbacks are part of deletion proof.

These are architecture launch defaults, not a legal-compliance claim. Jurisdiction-specific legal/trademark/processor review remains a public/commercial-launch prerequisite owned by Operations/legal review, not an unresolved Stage-27 product decision.

## 10. Product claim → owner → implementation gate traceability

| Product claim and exact authority | Authoritative architecture owner(s) | Evidence that proves implementation may publish it |
|---|---|---|
| Useful account-optional first action — app/02 §§3–6; app/03 §§3–8; final §§4.1, 15 | Profile, Session & Attempt, Frontend | Guest isolation/adoption, resumable diagnostic, five-skill direct-signal and complete-flow WCAG receipts |
| One highest-value action with agency — app/06 §§3–6; app/22 §§3–7; app/27 §4 | Coaching; learner choice in Attempt | Deterministic precedence checksum, plan reasons, override consequence, no-truth-mutation tests |
| Honest skill learning and Mistake Memory — app/04 §§3–8; app/05 §§3–9; app/07 §§3–8 | Evidence; Mistake/Review; Progression | Five-state validity, directness/conditions, episode independence, repair/retention property suites |
| Objective Reading/Language Elements — app/09–10 §§3–8; final §8 | Content; Attempt; Evidence | Immutable key/form, deterministic outcome, interaction equivalence, zero-runtime-AI/Corpus tests |
| Listening evidence — app/11 §§3–9; final §8.3 | Media; Attempt; Evidence | Audited immutable audio, playback/exposure receipts, H1–H3/timing/replay and fault-neutrality tests |
| Writing evidence — app/12 §§3–10; final §8.4 | Writing/Attempt; Evaluation candidate; Evidence acceptance | Autosave/recovery, original/revision, benchmark/confidence/Pending, minimum-payload and provider-exit gates |
| Speaking evidence — app/13 §§3–10; final §8.5 | Speaking/Attempt; Evaluation candidate; Evidence acceptance | Mic/device/turn/STT correction, benchmark/direct-modality, audio deletion and fixed-partner fallback gates |
| Readiness and mocks — app/15–16; app/27 §4; final §§10–11 | Measurement: Readiness & Mocks | Separate Written/Oral, weaker bottleneck, exact six states, Gates A–F, current blueprint/content/evaluator/calibration and no-probability scans |
| Ready to Book — app/17 §§3–8; final §11 | Measurement | Both Safe plus all six gates, recent clean mock/independence/confidence, reversible stale/contradiction fixtures |
| Rights/privacy/export/delete — app/21 §9; app/24 §9; final §§14–15; Design Flow G | Content, Profile/Data Rights, Operations | Serving/takedown, processor/payload, export parity, revoke/purge/provider/restore/no-resurrection evidence |
| Accessible responsive product — app/26 §§3–10; DESIGN-HANDOFF §§1–7; Design Flows A–G | Frontend/Capability plus every domain owner | All 26 frames and complete seven-flow/skill/account/recovery processes on supported browser/device/AT |
| Reliable affordable operation — app/25 §§3–8; app/26 §§7–10; final §§3.5–3.6 | Operations plus capability owners | Claim-impact CI, compatibility/promotion, backup/restore, cost/queue/circuit/incident and runbook evidence |

## 11. Release and phased-implementation safety

A phase is releasable only when the vertical slice is complete for the claim it exposes. A shell may ship with no learner claim. Objective practice may ship after content, deterministic scoring, recovery and accessibility gates. Productive practice may ship in learning-only/Pending-safe form until evaluator, minimum payload, retention and benchmark gates pass. Readiness remains evidence_building without a number until all direct evidence and projection prerequisites pass. Mocks remain unavailable or explicitly lower-scope until measured timing/content/evaluator/recovery gates pass. Ready to Book and external reminders are last; their authoritative prerequisites and in-app parity must already exist.

Flags choose availability, routing or exposure only. They never change validity, scoring, official pass line, safety margin, component independence, P0–P4 meaning, Readiness states/formula, rights, retention, deletion, accessibility or cost gates. A partial rollout cannot publish a placeholder number, infer Oral from text, reuse a stale blueprint silently, or call a modified activity exam-equivalent.

## 12. Cross-stage consistency and architecture-completeness audit

| Audit question | Evidence and result |
|---|---|
| Is every design state owned by domain/API state? | Yes. Stage 04 single-owner matrix, Stage 12 discriminated contracts and Stages 13–14 projection-only UI cover all flows/frames. Client guesswork is forbidden. |
| Are facts, projections and corrections distinguishable? | Yes. Append-oriented facts/corrections, source cuts and immutable historical snapshots; current projection rebuild is targeted and versioned. |
| Do all five skills share foundations without erasing modality? | Yes. One session/attempt/result/repair/evidence shell; objective key/media, Writing draft/evaluator and Speaking capture/STT/turn extensions remain typed. |
| Can ordinary practice survive Corpus downtime? | Yes. Signed asynchronous import and last-compatible App-owned inventory; zero learner-runtime Corpus request/profile transfer. |
| Can AI/provider faults lie about a learner? | No. Candidate-only productive evaluation, confidence/Pending, one escalation, circuit and local neutral degradation. |
| Are Written and Oral independent end to end? | Yes. Direct-lane evidence, separate projections/pass gates/mock scope and booking gates; no compensation or probability. |
| Are offline/replay/timing conditions auditable? | Yes. WAL, monotonic sequences, timing/playback/exposure receipts, conservative reconstruction and scoped interruption. |
| Do content/media/rights versions preserve history? | Yes. Immutable revisions/manifests, rights overlays, targeted correction, historical served lineage and separate release axes. |
| Are export/deletion/restores coherent? | Yes. Source-cut export; revoke-first purge; provider/cache tasks; journal before restore; raw audio excluded; no resurrection. |
| Is accessibility feature completeness? | Yes. Seven complete flows, 26 frames, five modalities, Readiness evidence table, data/permission/recovery controls and real AT/device gates. |
| Are cost and operations proportionate? | Yes. Modular managed baseline, deterministic/batch/cache defaults, bounded productive calls, provider exits, backups/runbooks; no enterprise platform without measured trigger. |
| Can implementation proceed without inventing product truth? | Yes. Owners, commands/results, state vocabularies, compatibility vectors, failure consequences, gates, fallbacks and named reversible implementation details are explicit. |
| Does validation add scope/formula? | No. It only binds and tests accepted architecture. |

All 34 accepted ADRs align with these answers. There is no duplicate authoritative Readiness, evidence, content, identity or release state, and no circular write dependency: facts flow from Profile/Attempt/Content/Evaluation candidates into Evidence; derived contexts consume published source cuts; Coaching consumes derived views last and writes only plans.

## 13. Contradictions, amendment log and resolution

### 13.1 Exact source mismatches

| ID | Exact source mismatch | Binding resolution and effect |
|---|---|---|
| S27-C01 | DESIGN-HANDOFF, Flows Handoff, shaping plan and Stage-27 prompt say 24 mobile screens; Design/Bestehen-02-Mobile-Screens.dc.html contains 26 numbered frames. | Stage 13's semantic map and Stage 25 correction use the current source: 26. Tests and Stage 28 resolve the mapping, never a stale narrative count. No source file is edited. |
| S27-C02 | Design Flow A assumes a six-minute first session; product diagnostic specifies a resumable five-skill foundation route, normally 18–22 minutes with a hard 30-minute ceiling. | Short completion may remain a useful partial probe/evidence_building, but cannot claim complete placement. Product authority wins. |
| S27-C03 | Design pending copy says usually under a minute and one recovery row uses >30 s; product/accepted architecture models first-useful ≤15 s, connected degradation ≤30 s, then explicit Pending based on measured SLA state. | Copy is a reviewed projection of current policy/measurement, never a provider promise hard-coded from Design. |
| S27-C04 | Design calls Ready to Book a four-condition checklist and shortens weakness lifecycle. | Domain returns Gates A–F and the full Candidate/Historical-Unconfirmed/Known/Repairing/Stabilizing/Repaired/Resolved/Reopened model. UI may group/project without deleting truth. |
| S27-C05 | Design Flow G says deletion is immediate, total, irreversible and has no backup. | Immediate means access revoked and live purge starts. Accepted architecture truthfully retains inaccessible bounded backup residual and restore-suppression journal ≤91 days; raw audio remains stricter/excluded. UI must not claim instant physical backup erasure. |
| S27-C06 | Design uses practice-only and mock narrative verdicts alongside canonical validity labels. | They are eligibility/conditions or mapped mock verdicts, never additional evidence-validity states. Canonical storage/API remains exactly five values. |

### 13.2 Amendment log

| Artifact | Change in Stage 27 | Reason |
|---|---|---|
| Architecture/27-end-to-end-architecture-validation.md | Created | Records validation, reconciliations, proof and handoff |
| Bestehen_App_Architecture_Checklist.md — Stage 27 only | 24 owned checks changed from open to complete | Each check is evidenced by this report |
| Architecture 01–26 | None | Accepted architecture already resolves every mismatch |
| ADR-0001–0034 and ADR index | None | No durable decision reversal or supersession |
| Design and Shaping | None | Read-only authority/contract; mismatches are recorded, not silently edited |
| Stage 28 | None | Must consume this accepted validation later |

No product/design contradiction requires owner judgment. This report does not paper over a gap: it identifies the stale or simplified source language, cites the higher authority/current mapping, and states the implementation consequence.

## 14. Residual risk register

| Risk | Current posture | Evidence/test and trigger | Owner / fallback |
|---|---|---|---|
| Productive evaluator quality/fairness drift | No probability; structured candidate and conservative Pending | Frozen independent benchmark slices, disagreement/false-safe/drift; release regression | Evaluation + Evidence; rollback model release, fresh sample or narrower claim |
| Fresh independent P4 inventory insufficient | Cannot manufacture transfer/Readiness | Family/independence/rights coverage and exhausted-content rate | Content; lower-claim practice and content-production obligation |
| Browser/device/AT support gap | Complete-process evidence required per support manifest | Current/current-previous engines and owned/available real device/AT; repeated escape | Frontend/Operations; exact capability closed, equivalent alternative |
| Restore/deletion residual or no-resurrection failure | Critical no-waiver gate | Quarterly isolated restore, deletion canary, journal replay, provider copy audit | Data Rights/Operations; block restored service/risky release |
| Official target/blueprint changes | Current target claims may stale | Official-source revalidation, compatibility impact and fresh forms | Measurement/Content; stale_contradicted and smallest recheck |
| Provider price/terms/region/config change | Capability evidence invalidates, not learner evidence | Current price/config/processor receipts and threshold alerts | Operations/AI/Media/Identity; validated adapter or local/queued fallback |
| Single-region/provider outage | Accepted personal-project trade-off | RPO/RTO/loss budget and repeated miss | Operations; predecessor, off-provider encrypted restore, provider exit |
| Public/legal/trademark obligations | No compliance claim | Before public/commercial launch: jurisdiction, processor, retention, consumer and mark review | Owner/legal review; remain private if unresolved |
| Current source says 24 while mapping is 26 | Implementation may omit two frames if it trusts prose | Claim manifest and all-26 frame list gate | Frontend/Test; fail build/release evidence until mapping complete |

No residual risk is an owner blocker for Stage 27 or Stage 28. Public launch remains separately gated on the named evidence/review.

## 15. Operations, monitoring, cost triggers and exits

Monitor claim-impact quality gates, invalid/Pending age and source scope, projection checksum/rebuild, duplicate semantic IDs, checkpoint loss, audio deletion overdue count, deletion overdue/no-resurrection, content/rights inventory, queue/provider circuit state, supported-device escapes, latency L0–L3, backup age/restore result, release compatibility, and cost per accepted useful productive unit. Metrics/logs contain no raw learner response/audio and do not become truth.

Upgrade only after measured repeated misses that cannot be solved by ordinary indexing/batching/caching, validated provider substitution or a narrower isolated capability. Examples: sustained queue age beyond accepted Pending window; false-safe/benchmark regression; restore/RPO/RTO miss; content exhaustion blocking direct evidence; device/support escapes; provider cost/terms/region invalidation; single-region loss exceeding accepted recovery. Even then, preserve provider-neutral contracts and standard PostgreSQL/S3-compatible/structured-result exports.

Cheaper fallbacks are deterministic objective/repair work; authored/fixed partner turns; batched audited media; queued or honest Pending productive evaluation; last-compatible Corpus/content release; in-app notifications; reduced publication frequency; predecessor artifact; and off-provider encrypted restore. None changes learner truth.

## 16. Relationship to earlier/later stages and handoff

Stages 01–26 remain accepted and unmodified. Their authoritative ownership, storage, evidence, learner, coaching, content, Corpus, Readiness, API, frontend, accessibility, modality, AI, account, offline, notification, security, observability, test and operations contracts compose without contradiction after the explicit reconciliations in §13.

Stage 28 must:

- preserve every invariant and reconciliation in §§2–3 and 13;
- use the current 26-frame mapping;
- publish one implementation-facing owner/contract/version registry without duplicating truth;
- keep validity and Readiness enums exact, Written/Oral independent, probability structurally absent, and history unreinterpreted;
- preserve async Corpus/no learner data, App-owned approved content and separate content/model/blueprint/calibration axes;
- preserve neutral local failure, account-optional first use, raw-audio/deletion truth and complete-process WCAG;
- order implementation phases by complete claim-bearing slices, keeping misleading partial Readiness closed;
- carry the residual gates, provider exits and named legal/public-launch prerequisites without turning them into product blockers.

**New dependencies:** none. This stage only binds accepted contracts.  
**Removed dependencies:** any implementation reliance on stale 24-screen counts, instant-backup-erasure copy, six-minute complete placement, four-gate domain logic, shortened weakness truth, or practice-only as a sixth validity state.  
**ADRs created/amended:** none; ADR-0001–0034 remain Accepted.  
**Unresolved owner questions:** None.  
**Intentionally deferred implementation choices:** exact syntax/tool configuration, procurement/account setup, final reviewed copy within semantic reason contracts, calibrated numeric thresholds as governed releases, and jurisdiction-specific public-launch legal/trademark review. Their owners and fixed boundaries are Stages 19–26; no feature implementer may alter semantics.

## 17. Go/no-go definition-of-done result

| Stage-27 completion gate | Evidence | Result |
|---|---|---|
| Complete current inputs and SHAs | §2 manifest; all source bodies read at immutable heads | PASS |
| Authority and Stage-27 precedence | §§2.2–2.3, D02 | PASS |
| Nine scenarios and Flows A–G | §§6–7 | PASS |
| Failure/recovery matrix | §8, all 12 required failure families and 12 Design recoveries | PASS |
| Threat/privacy/rights/retention/accessibility/cost/latency/timing/idempotency/operations | §9 | PASS |
| Ownership/duplicate truth/circular dependency/version/live dependency/invention | §§4–5, 10, 12 | PASS |
| Exact states and evidence/Readiness truth | §§2.3, 5.2, 6, 10 | PASS |
| Complete five skills, guest/account/offline/export/delete/notification | §§6–7 | PASS |
| Current 26-frame accessibility mapping | §7 and S27-C01 | PASS |
| Amendment log and residual risk | §§13–14 | PASS |
| Consequential ADR currency | §2.4; no reversal required | PASS |
| No owner blocker or unresolved gap | §§13–16 | PASS |
| Exact-scope repository handoff | Stage-27 output and Stage-27 checklist only | PASS after atomic write/re-fetch |

**Decision: GO.** Stage 28 may begin only after the parent independently re-fetches and accepts this Stage-27 commit. The architecture is complete enough for consolidation without leaving a consequential product rule, state owner, failure consequence, compatibility rule, provider coupling, or release gate for a feature implementer to invent.
