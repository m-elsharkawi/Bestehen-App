# ADR-0026: Ephemeral voice evidence and bounded oral evaluation

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 18 — Speaking Audio, STT, Partner, and Evaluation Pipeline
- **Decisions:** ARCH-S18-D01–D12
- **Supersedes:** None

## Context

Speaking is pass-critical direct Oral evidence and requires the learner’s actual voice. A denied or broken microphone, clipped capture, STT error, unfair partner, evaluator outage or deletion failure must never become learner failure. S2/S3 readiness also needs genuine interaction: a monologue, typed response or unrelated scripted reply is insufficient.

Bestehen is a responsive account-optional web application with one shared five-skill attempt/evidence foundation, exactly five validity states, independent Written/Oral truth, deterministic Readiness and bounded AI. PostgreSQL owns semantic facts/jobs; private object storage may hold purpose-bound bytes; the browser observes/captures but cannot decide evidence truth. Product truth fixes contextual permission, turn-based sufficiency, ephemeral raw audio, a provisional transcript, structured oral evaluation, one justified escalation and a seven-day ceiling while Pending.

Specific commercial STT/evaluator/partner providers, models, regions, prices, retention terms and global AI governance belong to Stage 19. The durable decision is the semantic boundary they must satisfy.

## Decision

1. Request microphone access only at a learner-chosen Speaking action, after clear purpose, processor and retention copy. Capture is same-origin/activity-scoped, never an onboarding wall, hidden auto-start or always-listening stream.
2. Admit a capture through separate permission, device selection, short local level/quality sample, learner confirmation, recorder/MIME capability and upload-path facts. Do not persist exact device identifiers or create a fingerprint.
3. Capture explicit learner turns using a versioned server-authored MIME/policy allowlist and runtime capability probe. Preserve actual MIME/settings/digest and ordered chunk manifests. Raw chunks remain in memory until encrypted upload to private opaque objects; raw browser persistence is not the default.
4. Session & Attempt owns immutable attempt/part/partner-turn/learner-turn/chunk identities, actual preparation/timing/support/visibility/device conditions and idempotent ordinals. Productive Evaluation owns processor jobs/candidates. Evidence owns validity/correction/claim scope.
5. Use reviewed fixed partner branches by default for P0–P2, diagnostic, repair and routine drills. Use bounded adaptive turn-based interaction only for P2/P3 S2/S3 and selected target work when previous learner meaning must shape the next turn. S1 normally uses fixed prompts. Full-duplex voice is not a launch dependency.
6. A genuine S2/S3 interaction claim requires cited consecutive cross-turn dependency: uptake, response, negotiation, clarification/repair or convergence. Monologue, text, or unrelated partner output cannot satisfy it. Partner fault narrows the claim, never the learner score.
7. Treat STT as an immutable provisional reference with segment/word uncertainty. After the clean part/block, one learner correction overlay may annotate disputed/uncertain spans without rewriting audio/STT or adding unsaid content. ASR failure alone proves neither pronunciation nor intelligibility and creates no weakness.
8. Run one provider-neutral structured oral evaluation over actual voice, exact scenario/turns/conditions, provisional/corrected transcript, rubric and audio-quality facts. It returns cited part/rubric/coaching dimensions, confidence and cannot-judge scope. Audio-dependent dimensions must use audio.
9. Allow at most one policy-justified stronger evaluation for consequential low confidence, audio-dependent judgment, material disagreement/dispute or governed calibration. Never average/vote. Evidence accepts the better-supported scope or returns Pending/cannot-judge/fresh sample.
10. Minimize, encrypt and pseudonymize raw audio; exclude it from URLs, logs, analytics, session replay, Corpus and every backup. Delete all App/provider raw/intermediate copies immediately after finalized evaluation/correction, and absolutely no later than seven days from capture while Pending. Retain durable deletion-proof metadata.
11. A deadline-expired unresolved evaluation deletes raw audio first, then appends a system-owned not_counted correction/fresh-sample request. Permission, capture, partner, STT, evaluator, network/background and deletion faults use only valid, partially_valid, pending, interrupted or not_counted and preserve unaffected evidence.
12. Typed/captioned/phrase/solo alternatives remain available for learning/accessibility but never substitute for actual-voice Oral or genuine S2/S3 interaction unless a later verified accommodation authority defines a supported equivalent claim.
13. Independently version capture, partner/scenario, STT/transcript/correction, evaluator, rubric, blueprint, quality, evidence and retention/deletion policy. Unknown consequential majors fail closed; corrections append and trigger targeted deterministic recomputation.
14. Stage 19 selects providers/models only behind these contracts. Stage 23 proves threat/privacy/legal/data-rights controls, Stage 24 sets operational thresholds, and Stage 25 supplies release browser/device/AT, quality, fairness and deletion evidence.

## Alternatives considered

| Alternative | Reason not chosen |
|---|---|
| Request microphone during onboarding | Creates a global denial/privacy wall before contextual value is clear. |
| Use browser default input only | Wrong-device failures are common enough to require contextual choice after permission. |
| Persist exact deviceId | Adds stale/fingerprinting data without evidentiary value. |
| Level meter as the only preflight | Cannot prove source choice, recorder/MIME, clipping/background, upload path or learner confirmation. |
| One monolithic session recording | Weak turn recovery and interaction lineage; one failure can destroy the whole block. |
| Continuous always-on/full-duplex streaming | Higher privacy, latency and cost burden; turn-based already tests required interaction. |
| Hard-code one recording MIME | Current browser releases differ; release evidence must establish an allowlisted intersection. |
| Accept any browser format | Makes ingestion/security/quality behavior accidental. |
| Persist raw audio in IndexedDB by default | Enlarges deletion and device-loss exposure; per-turn upload is sufficient. |
| Require live network throughout every ordinary turn | Converts connectivity into learner failure and discards bounded local capture. |
| Fixed partner only | Cannot establish broad meaning-dependent S2/S3 interaction. |
| Unrestricted chatbot partner | Scenario drift, coaching leakage, unfairness and cost make evidence uninterpretable. |
| Treat transcript as truth/score | ASR error can manufacture language/pronunciation weakness and cannot judge audio-dependent dimensions. |
| Fully editable transcript | Lets a learner create words not audibly produced and destroys provenance. |
| No correction path | Leaves known recognizer error unresolved even when intended content matters. |
| Transcript-only evaluator | Cannot judge intelligibility, fluency, timing or disputed wording responsibly. |
| Multi-agent evaluator chain / majority vote | Multiplies cost and disagreement and produces fake precision. |
| Always accept first evaluation | Overstates pass-critical uncertainty. |
| Keep raw recordings as history | Disproportionate privacy/retention burden; structured evidence/transcript is sufficient. |
| Delete raw before evaluation finalizes | Prevents legitimate one-escalation/correction resolution. |
| Count typed/captioned interaction as standard Oral | Violates direct-modality and actual-voice truth. |
| Select a vendor in Stage 18 | Provider/region/price/retention/benchmark governance is explicitly owned by Stage 19. |

## Consequences

Positive:

- microphone access is understandable, least-privilege and local to Speaking;
- exact turn/chunk/condition lineage survives retry without duplicate evidence;
- turn-based interaction remains affordable while genuinely adaptive S2/S3 evidence is possible;
- STT helps navigation/semantics without pretending to hear like a human judge;
- one structured evaluation and one exceptional escalation bound cost and uncertainty;
- technical/partner/evaluator failure cannot lower Oral performance;
- raw audio has an enforceable short life, no backup resurrection path and auditable deletion proof;
- provider/model/codec implementations can change without rewriting evidence history;
- typed/captioned alternatives preserve learning and access honestly.

Costs/trade-offs:

- real-device capture/MIME and assistive-technology validation is mandatory;
- per-turn manifests/uploads and explicit partner dependencies add state;
- audio-aware benchmark/adjudication across accent/audio/device conditions requires human work;
- a processor outage or disagreement may leave Pending or require a fresh sample;
- the design copy “never shared” must be corrected when approved processors receive audio;
- strict deletion may remove the possibility of later re-evaluation, by design;
- raw-audio deletion and provider-copy verification need operational reconciliation.

Cost cannot remove actual-voice evidence, genuine S2/S3 interaction, accessible learning paths, failure neutrality or deletion proof.

## Security, privacy, rights, accessibility, and cost

Capture requires secure-context/same-origin authority, learner initiation, visible state and prompt teardown. Raw objects are encrypted, private, opaque, least privilege and excluded from URLs, cookies, logs, traces, analytics, session replay, notifications, support exports, Corpus and backups. Provider payload includes only pseudonymous request IDs, exact audio and minimum scenario/rubric/turn context. It excludes identity, exam date, profile, Readiness, other attempts, device fingerprint and accommodation/medical inference.

Stage 19/23 procurement must prove processor region/subprocessors, training-use prohibition, retention/deletion behavior, security and exit. Content rights are checked before transfer. No legal-compliance claim is made.

Recording uses word + icon + visible duration + text quality state; reduced motion uses a solid dot. Start/stop is announced once; timer/level ticks are not. Device choice does not require waveform interpretation. Keyboard, screen reader, 320px reflow, 200% zoom and current/current-previous real-device support are release gates. Typed/captioned rehearsal is clearly labelled learning-only, and accessibility need never creates a learner fault.

Routine cost favors fixed reviewed partner assets, deterministic turn/task observables, one completed-turn/block STT pass, one structured evaluator and prompt raw deletion. Adaptive generation is only for meaning-dependent S2/S3. The low-cost fallback preserves fixed voice interaction and learning while leaving unsupported dimensions Pending/not evidenced. Full-duplex voice or premium evaluation needs measured transfer/quality benefit.

## Traceability

Primary product: Bestehen-Shaping/app/13-speaking-coaching.md §§6–17; app/28-bestehen-app-product-specification.md §§3.5, 8, 10, 14; app/07-core-learning-loop.md; app/08-a1-to-b1-progression.md; app/15-telc-readiness.md; app/16-mock-exams.md; app/26-platform-accessibility-nonfunctional.md; app/27-end-to-end-scenario-validation.md.

Design: Design/DESIGN-HANDOFF.md §§3–6; Design/Bestehen-02-Mobile-Screens.dc.html Speaking 3.3/3.4 and mic-denied state; Design System recording/Pending/failure parts; Flows D/F. The exact “never shared” copy is incompatible with cloud processor transfer and must be corrected before release without editing Design in this stage.

Architecture: Stages 05, 06, 08, 09, 11–14, 16 and Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md.

Technical evidence accessed 2026-08-23: W3C Media Capture and Streams; W3C MediaStream Recording; MDN MediaRecorder.isTypeSupported; MDN Permissions-Policy microphone; OWASP Cryptographic Storage and Key Management. Browser APIs remain candidates until release-tested.

## Review triggers

Review when measured evidence shows:

- a supported browser/device has no validated capture MIME or false-ready/capture loss breaches its gate;
- wrong-device, clipping, background, endpoint or chunk-integrity incidents exceed thresholds;
- turn-based/fixed practice materially under-predicts real target interaction;
- adaptive partner latency, drift, unfairness or STT-induced misunderstanding breaches its gate;
- ASR disagreement creates material evaluator/partner error despite uncertainty handling;
- primary/stronger evaluator agreement on human gold labels or accent/audio groups fails;
- one escalation rarely improves decisions relative to cost, or improves enough to justify changing the first tier;
- Pending age or fresh-sample burden becomes unsustainable;
- any raw object/provider copy survives its delete-by time or cannot produce acceptable deletion evidence;
- provider region, retention, training, subprocessor, security, price, support or model behavior changes;
- a verified accommodation authority supports a different equivalent claim;
- target Speaking blueprint/rubric changes.

Exit preserves App-owned policies/contracts, turn/chunk manifests, structured transcripts/corrections/candidates/results, deletion journal and rights-safe benchmark fixtures. Successor adapters/releases do not rewrite historical lineage and do not require retained raw audio.

## Supersession

Supersedes none. Applies ADR-0001, ADR-0002, ADR-0003, ADR-0010, ADR-0011, ADR-0012, ADR-0013, ADR-0015, ADR-0016, ADR-0018, ADR-0019, ADR-0020, ADR-0021, ADR-0022, ADR-0023 and ADR-0024.
