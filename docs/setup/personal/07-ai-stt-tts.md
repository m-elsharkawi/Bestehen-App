# AI, STT, and TTS staging providers

Last verified: **2026-08-23**. Official references: Gemini
[models](https://ai.google.dev/gemini-api/docs/models),
[changelog](https://ai.google.dev/gemini-api/docs/changelog),
[pricing](https://ai.google.dev/gemini-api/docs/pricing),
[ZDR](https://ai.google.dev/gemini-api/docs/zdr), and
[logs/datasets](https://ai.google.dev/gemini-api/docs/logs-datasets); OpenAI
[audio API](https://platform.openai.com/docs/api-reference/audio) and
[data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint);
Amazon Polly [voices](https://docs.aws.amazon.com/polly/latest/dg/available-voices.html),
[security](https://docs.aws.amazon.com/polly/latest/dg/security-best-practices.html), and
[pricing](https://aws.amazon.com/polly/pricing/).

Provider availability never promotes a model. Later releases bind provider, endpoint,
exact model, prompt/schema/voice, benchmark, price catalog, deadline/circuit, effective
time, and rollback predecessor. Stage 02 makes no real call.

### `AI-01` — Create the paid Gemini staging project

- **Owner:** Google AI billing/project owner after accepted/merged `02E`.
- **Action:** Create a staging-only paid Gemini Developer API project, accept current terms after owner review, restrict its key to the Gemini API and available deployment restrictions, and select exact stable `gemini-3.6-flash`. Do not substitute 3.7/`latest` without a later benchmark release.
- **Expected result:** the project exposes exact model access; key scope excludes unrelated APIs.
- **How to verify:** dashboard model/key restriction state and one later bounded synthetic schema smoke.
- **Evidence:** provider/capability, exact model, paid-tier/restriction result, date, and no project/key ID.
- **Rollback:** disable the AI adapter, revoke/delete key, close billing route after export/duties, and keep deterministic/Pending fallback.
- **NEVER PASTE HERE:** API key, project/account/billing ID, request/response, prompt/schema body, owner contact, or console URL.

### `AI-02` — Disable Gemini retention-expanding features

- **Owner:** Google AI project owner.
- **Action:** Use GenerateContent with inline payloads only. Keep project logging disabled; create no dataset; enable no feedback sharing, Files, grounding, explicit context cache, session resumption, or training contribution. Record ZDR only if the dashboard/account proves it—paid/no-training is not the same claim.
- **Expected result:** no stored developer logs/datasets/files exist; current provider retention/processing fact is documented honestly.
- **How to verify:** read Logs/Datasets and project data-control settings before each promotion.
- **Evidence:** feature booleans, retention/ZDR category, checked date, and result.
- **Rollback:** circuit the route and delete controllable logs/datasets/files if any appeared; rotate the key.
- **NEVER PASTE HERE:** stored interaction, payload, project/key ID, provider response/log, dataset export, or learner data.

### `AI-03` — Configure budgets and bounded Gemini smoke

- **Owner:** billing owner for thresholds; agent may run only after explicit opt-in at the later checkpoint.
- **Action:** Configure provider-side alerts and positive App daily/rolling envelopes in the protected ledger. The one-call smoke uses a fixed synthetic German sentence, tiny strict JSON schema, `thinking_level=low`, ≤128 output tokens, no tool/grounding/file/cache, one attempt, and no escalation.
- **Expected result:** exact model/schema/usage are observable within the approved envelope; productive flags return false afterward.
- **How to verify:** use the [staging readiness](./09-staging-readiness.md) live-smoke preflight and a redacted receipt; do not inspect content in shared evidence.
- **Evidence:** exact model, bounded usage/latency, result class, envelope-verified date, cleanup/rollback; no content/cost amount if private.
- **Rollback:** set paid/external flags false, circuit the route, revoke key if needed, and retain Pending/deterministic behavior.
- **NEVER PASTE HERE:** key, prompt/response/schema body, billing/envelope value, project ID, provider request ID, or debug log.

### `AI-04` — Preserve Gemini exit

- **Owner:** AI governance owner.
- **Action:** Replay the rights-safe provider-neutral fake/benchmark contract through a candidate substitute only in a later release. Require schema, quality/fairness, privacy, retention, region, cost, failure, accessibility, and rollback parity.
- **Expected result:** changing provider configuration does not change App-owned candidate/evidence semantics.
- **How to verify:** deterministic fake contract plus frozen benchmark and predecessor rollback.
- **Evidence:** benchmark/config release digests, result, predecessor, and date.
- **Rollback:** restore the promoted predecessor; historical candidates retain original lineage.
- **NEVER PASTE HERE:** production samples, learner text/audio, prompts, credentials, raw provider output, or adjudicator identity.

### `AUDIO-01` — Create separate OpenAI STT/TTS staging credentials

- **Owner:** OpenAI project/billing owner.
- **Action:** Create one staging project and separate restricted keys: STT only for `/v1/audio/transcriptions`, TTS only for `/v1/audio/speech`. Admit exact `gpt-4o-mini-transcribe-2025-12-15` and `gpt-4o-mini-tts-2025-12-15`. Set project/provider limits and protected recipients.
- **Expected result:** each key succeeds only on its capability endpoint; unrelated endpoints/projects are denied.
- **How to verify:** provider permission view and later one bounded allowed/one denied synthetic request per key.
- **Evidence:** endpoint/model classes, allowed/denied result, budget-alert state, and date.
- **Rollback:** set audio routes false, replace/verify, revoke old keys, and verify denial.
- **NEVER PASTE HERE:** API/project/account/key IDs, keys, billing/contact details, request/response, or audio/text.

### `AUDIO-02` — Verify OpenAI data controls

- **Owner:** OpenAI organization/project owner.
- **Action:** Keep training sharing off. Record current endpoint-specific abuse/application-state retention. Do not claim EU regional processing or ZDR unless approved and the required regional endpoint/project control is actually used.
- **Expected result:** STT/TTS route evidence names the real data-control category without overstating it.
- **How to verify:** read project Data Controls and the current official endpoint table at each promotion.
- **Evidence:** endpoint, retention/ZDR/region category, checked date, and result only.
- **Rollback:** disable the route if current terms/settings exceed the reviewed purpose; use fixed/Pending fallback.
- **NEVER PASTE HERE:** organization/project IDs, approval/support correspondence, key, payload, audio/transcript, or provider logs.

### `AUDIO-03` — Run the bounded STT smoke later

- **Owner:** agent only through explicit staging opt-in after owner configuration.
- **Action:** Send one generated/committed rights-safe sub-five-second German fixture with `language=de`, JSON+logprobs, exact STT snapshot, one request, strict timeout, and no semantic retry. Delete the local temporary input in `finally`.
- **Expected result:** nonempty transcript/log-probability shape is observed; no transcript enters output/evidence.
- **How to verify:** validate exact model, fixture digest, byte/duration bounds, usage/latency category, and cleanup.
- **Evidence:** digest, byte/duration bounds, result, latency/usage, cleanup, and date.
- **Rollback:** disable/circuit STT, revoke credential if needed, and retain audio-aware/Pending behavior.
- **NEVER PASTE HERE:** audio, transcript/token logprobs, key, request ID/body, learner sample, or temporary path.

### `AUDIO-04` — Run the bounded TTS smoke later

- **Owner:** agent only through explicit staging opt-in after owner configuration.
- **Action:** Send one fixed non-personal German sentence to the exact TTS snapshot and one benchmark-candidate built-in voice; enforce a short input/output bound and one request. Verify decodable audio and delete output bytes in `finally`.
- **Expected result:** bounded audio metadata is valid; neither text nor audio remains in evidence.
- **How to verify:** input digest, media format/duration/bytes, exact model/voice ID category, usage/latency, and cleanup.
- **Evidence:** digest and metadata/result only.
- **Rollback:** disable/circuit TTS and return to fixed reviewed audio/text-only accessible practice.
- **NEVER PASTE HERE:** input text, output audio, key, voice custom data, request/provider ID, or response headers/body.

### `AUDIO-05` — Keep Polly conditional

- **Owner:** content/media governance owner.
- **Action:** Record Polly as `not_admitted`; create no credential during this checkpoint. Only after an accepted content/media benchmark admits it, create a distinct Frankfurt principal limited to `polly:SynthesizeSpeech`, audit current German Neural voices, and use it for offline batch generation. Standard and Generative are separate audited candidates, never silent substitutes.
- **Expected result:** no Stage 02 Polly runtime credential exists; a future admitted route is Frankfurt, least privilege, offline, and final-byte reviewed.
- **How to verify:** readiness receipt says `not_admitted` unless it references an accepted benchmark release; later verify denied unrelated AWS actions and transient-byte cleanup.
- **Evidence:** admission state, region/engine, benchmark digest if any, result, and date.
- **Rollback:** revoke the synthesis principal and return to reviewed predecessor media; learner attempts never depend on live Polly.
- **NEVER PASTE HERE:** IAM identity/credential, script/SSML, generated audio, AWS account ID, voice sample, or benchmark content.
