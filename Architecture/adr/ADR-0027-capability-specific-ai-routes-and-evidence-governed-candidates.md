# ADR-0027: Capability-specific AI routes and evidence-governed candidates

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 19 — AI Gateway, Model Governance, Evaluation, and Cost
- **Decisions:** ARCH-S19-D01–D12
- **Supersedes:** None

## Context

Writing and Speaking need bounded model-assisted evaluation; Speaking may need provisional STT, a meaning-dependent partner turn and temporary partner TTS. Models must not decide evidence validity, deterministic objective scores, Readiness, Written/Oral aggregation, daily planning, analytics or routine coach wording. System/provider failure must remain neutral and unrelated work must continue.

Stage 17/18 already fix typed candidate contracts, one justified escalation ceiling, Pending, actual-voice/audio-aware judgment, provisional transcripts and ephemeral raw audio. Stage 19 must select current provider routes without creating a generic AI platform or high-coupling vendor API throughout features.

Current official evidence accessed 2026-08-23 establishes that stable Gemini 3.6 Flash accepts text/audio and supports structured output and thinking levels; paid Gemini content is not used to improve products, while global/transient processing and approved ZDR remain explicit constraints. Its list price is promotional $0.75/M input and $3.75/M output through 2026-12-31, then $1.50/M and $7.50/M; audio uses 32 tokens/second. OpenAI mini Transcribe is $0.003/min and exposes log probabilities, while its transcription endpoint lists no application-state or abuse-log retention. OpenAI mini TTS has a pinned snapshot and costs $0.60/M text input and $12/M audio output tokens. Provider terms, prices, regions and models are mutable release inputs, not stable product truths.

## Decision

1. Use one App-owned in-process gateway coordinator in the existing worker with capability-specific ports, request/response schemas, payload allowlists, benchmark gates and circuits. Do not expose a generic `generate()` contract and do not create a service/microservice.
2. Permit only Writing evaluation, provisional Speaking STT, audio-aware Oral evaluation, bounded meaning-dependent partner turn/TTS and exceptional quarantined content candidates. Routine objective scoring, validity, Readiness, planning, analytics, scheduling and coach templates remain deterministic and make no model call.
3. Start with paid Gemini Developer API `gemini-3.6-flash` as stable structured text/audio candidate producer; `gpt-4o-mini-transcribe-2025-12-15` as provisional STT; and `gpt-4o-mini-tts-2025-12-15` only for approved adaptive partner text. Reviewed fixed assets remain the routine default; no realtime voice agent launches.
4. Pin an immutable `AiCapabilityRelease`: capability, provider/endpoint/model snapshot, thinking/voice, prompt/evaluator/schema/rubric/scenario, payload, deadline/retry/circuit, price catalog, benchmark, effective time and rollback predecessor. Mutable/latest/preview aliases cannot be promoted. Unknown consequential majors fail closed.
5. Deterministically validate input identity/hash/rights/payload before a call and candidate schema/enums/citations/scope/confidence afterward. Productive Evaluation owns immutable candidates; Evidence alone accepts/rejects supported scope and appends corrections. Provider output never directly changes Readiness or learner truth.
6. Make one standard evaluation at the cheapest thinking level proven adequate. Allow at most one stronger registered thinking-level evaluation for policy-defined pass-critical ambiguity, material contradiction/dispute, audio-dependent cannot-judge or governed calibration. A transport retry is the same semantic request, not another evaluation. Never average or vote; unresolved work becomes Pending/cannot-judge/fresh sample.
7. Promote releases only after rights-safe human-gold agreement, critical-error, schema, repeatability, fairness/subgroup, drift, failure/idempotency, privacy/deletion, accessibility, cost/latency and provider-exit gates. Rollback suspends the faulty release and points new work to its recorded predecessor; historical candidates remain immutable.
8. Send only opaque IDs, exact required learner response/audio and minimum approved prompt/rubric/scenario/condition facts. Use paid/no-training configuration, disable logging/dataset sharing, grounding, context caching/session resumption and persistent file features, and keep provider secrets server-only/least-privilege. Learner content never reaches Corpus or training by default. Raw audio is deleted immediately after finalization and no later than seven days while Pending, with proof.
9. Attribute provider usage and list/invoice cost to each capability/release/request. Measure cost per useful accepted productive evidence unit separately for Writing and Oral, split by validity/escalation, plus rejected/wasted cost. Require an owner-configured recoverable spend envelope before enablement; with none, AI is disabled. Do not invent a fixed euro budget.
10. Isolate circuits by capability/provider/release. Timeout, rate limit, outage, refusal, low confidence or open circuit yields durable Pending, deterministic/self-check/fixed fallback and unrelated-work continuity. Optional runtime generation sheds before pass-critical accepted jobs; cost never fabricates a low score.
11. Render accepted candidate data through deterministic semantic templates with language, spans/timestamps, confidence/limits and text alternatives. Provider Markdown/HTML/audio never replaces required structured text or controls focus/live announcements.

## Alternatives considered

| Alternative | Reason not chosen / use as exit |
|---|---|
| No productive AI | Complete privacy/outage fallback but cannot supply the intended Writing/Oral evaluation. |
| Generic multi-provider `generate()` wrapper | Hides capability semantics, schema, payload and failure differences; capability ports are smaller and safer. |
| Separate AI microservice/platform | Adds deployment, auth, observability and consistency burden with no measured isolation need. |
| Gemini for STT as well | Does not provide the selected provisional token-logprob contract; remain a substitute benchmark candidate. |
| Deepgram Nova-3 EU for STT | Credible regional exit, but current self-serve terms require per-request training opt-out and price is higher; promote only with control/retention proof and parity. |
| Vertex AI for Gemini | Stronger cloud governance but added IAM/ops and Gemini 3.6 remains global; upgrade on measured governance/region need. |
| Gemini Flash-Lite first tier | Cheaper non-promotional route, but must prove TELC/audio benchmark parity before promotion. |
| Mutable `latest` or preview Pro model | Silent behavior/lifecycle changes are incompatible with auditable evidence. |
| Multiple specialist agents or model voting | Multiplies cost/disagreement and creates fake precision. |
| Always accept first result | Overstates consequential uncertainty; one governed escalation/Pending is safer. |
| Realtime voice agent | Always-open privacy, latency, cost and scenario-drift burden is unnecessary; bounded turns suffice. |
| Routine runtime content and wording | Increases rights/freshness/cost risk; reviewed cached content and deterministic templates suffice. |
| Retain production prompts/responses for evaluation/training | Conflicts with minimum data and hidden-training prohibition; use rights-safe fixtures instead. |
| Invent a fixed monthly budget | Owner supplied none. A disabled-by-default configurable envelope gives safe behavior without false precision. |

## Consequences

Benefits:

- features cannot bypass evidence ownership or deterministic Readiness/planning;
- two narrow provider adapters cover required multimodal, STT and TTS behavior without a realtime platform;
- immutable release/provenance/usage records make correction, rollback, price review and provider exit auditable;
- one stronger-thinking ceiling bounds cost without hiding uncertainty;
- provider failure is isolated and neutral, with fixed/self-check/Pending continuity;
- minimum paid/no-share payload and short raw-audio lifecycle reduce training/retention exposure;
- cost is connected to useful accepted productive evidence rather than calls or engagement.

Costs and risks:

- two credentials, processors, price catalogs and circuits must be governed;
- human TELC-informed gold labels, accent/device fairness and repeatability testing require sustained work;
- paid Gemini's global/transient processing, approved ZDR and age/use restrictions constrain launch until Stage 23 review;
- a strict candidate validator may increase Pending, by design;
- promotional prices change on 2027-01-01;
- raw-audio deletion can make later re-evaluation impossible;
- model/provider substitution always needs a promoted release, not a configuration flip.

Dependencies: capability registry, gateway/adapters, immutable request/candidate/usage records, price catalog, per-capability circuits, gold/release records, privacy/config/deletion receipts and provider-neutral exit fixtures. Stages 23–28 must preserve candidate-only ownership, deterministic exclusions, five validity/six Readiness states, one escalation, privacy/deletion and measured cost.

## Validation and review triggers

Promotion requires the Stage-19 benchmark/release table: 100% schema/identity/reference fixtures; no known pass-critical false-supported fixture; adjudicated Writing/Oral/STT agreement and cannot-judge behavior; repeated-run variance; tested accent/register/topic/device/audio/access-condition gaps; 429/timeout/refusal/duplicate/deletion paths; semantic accessibility; redacted payload/log scan; cost/latency baseline; and substitute-adapter replay. Stage 24/25 owns calibrated numeric thresholds, control bands and SLOs with provenance and rollback.

Review or suspend when:

- model snapshot, terms, training/retention, processor/subprocessor, region, price, quota, support or deprecation changes;
- the 2026-12-31 promotional price boundary approaches;
- gold agreement, critical error, repeatability, bias/drift or schema gate regresses;
- one escalation rarely changes a supported decision relative to cost, or changes enough to justify a stronger first tier;
- cost per accepted unit, rejection/escalation, Pending age or invoice-estimator variance leaves its registered control band;
- any excess payload/log/training share or raw-audio delete-by miss occurs;
- owner spend envelope is absent/exhausted, or legal/age/region review does not approve the route;
- a cheaper provider/model passes all gates or a regional/self-hosted route becomes operationally justified.

Rollback uses the recorded predecessor release, leaves old lineage intact, stops optional calls, keeps accepted jobs Pending and triggers scoped evidence review/correction where a released model defect affected accepted interpretation. Exit preserves App schemas, candidates, acceptance/corrections, usage/price/deletion records and rights-safe benchmarks; it never requires retained raw audio.

## Traceability

- Product: Shaping `app/28-bestehen-app-product-specification.md` §§3.5, 14, 18–19; `app/07-core-learning-loop.md`; `app/12-writing-coaching.md`; `app/13-speaking-coaching.md`; `app/16-mock-exams.md`; `app/18-coach-personality-and-behavior.md`; `app/21-content-strategy.md`; `app/24-analytics-and-success-metrics.md`; `app/25-business-model-and-product-boundaries.md`; `app/26-platform-accessibility-nonfunctional.md`.
- Design: `Design/DESIGN-HANDOFF.md`; Design System Pending/failure/validity patterns; Flows D/F evaluator branches.
- Architecture: Stages 03, 05, 06, 09, 12, 17 and 18; `Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`.
- Official mutable evidence: Gemini model/structured output/audio/thinking/pricing/deprecation/ZDR/rate-limit documentation; OpenAI transcription/TTS/model/pricing/data-control documentation; Deepgram pricing/EU/terms; accessed 2026-08-23.
- Checklist: all 24 items in Stage 19.

## Supersession

Supersedes none. Applies ADR-0001, ADR-0002, ADR-0003, ADR-0005, ADR-0007, ADR-0010, ADR-0011, ADR-0012, ADR-0013, ADR-0016, ADR-0018, ADR-0019, ADR-0022, ADR-0025 and ADR-0026.
