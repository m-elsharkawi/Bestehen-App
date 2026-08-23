# ADR-0024: Pinned batch audio and evidence-sensitive playback

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 16 — Listening, Audio, TTS, and Media Delivery
- **Decisions:** ARCH-S16-D01–D10
- **Supersedes:** None

## Context

Listening evidence depends on what audio was heard, how often, at what speed, whether transcript/help was exposed, whether the target sequence remained intact, and whether the media/output path worked. Client-only counters, streaming an unready measured block, hidden transcripts, live TTS, or mutable URLs can create duplicate exposure, unfair misses, unreproducible evidence, rights leakage, and recurring cost.

Bestehen is a low-ops personal responsive-web project. It already selected private EU S3-compatible object storage, immutable content/media manifests, typed idempotent HTTP contracts, a shared five-skill frontend foundation, and capability-local preflight. Product truth fixes H1/H2/H3, exact target playback, batch/cached audio, transcript gating, target-condition preflight, and fault neutrality.

## Decision

1. Content & Forms publishes immutable, final-byte-audited audio revisions. Each carries an App-owned lossless master, one launch MP3 learner rendition, exact digest/length, script/transcript lineage, H-family, target/progression role, authored speed, speaker/voice/model release, pronunciation/acoustic QA, rights, accessibility, approval, and supersession.
2. Session & Attempt issues an immutable ListeningPlan for each attempt. It fixes ordered H1–H3 occurrences, allowed play ordinals, speed/seeking/pause/transcript rules, target blueprint, media candidates, preflight, and timer policy versions.
3. Playback uses idempotent occurrence start/completion/fault facts. Duplicate taps, reconnect, reload, outbox retry, and late callbacks cannot add a playback opportunity or evidence occurrence. A technical failure does not grant a same-content clean replay; it protects the affected scope as not_counted and offers a fresh equivalent.
4. A clean measured block starts only after every required asset is fully fetched, digest/length verified, actually loaded/decoded by the candidate browser, retained for the block, and output-confirmed by the learner. Network loss after this point can be harmless only while playback, clock, response durability, and occurrence logging remain exact.
5. The accepted private EU Cloudflare R2 Standard store remains the launch byte authority. Learner reads are exact, short-lived and controlled. There is no public CDN at launch. Immutable keys preserve cache safety and S3-compatible export.
6. MP3 is the sole required launch rendition; a lossless master enables future formats. Opus/edge caching requires measured byte/latency/request benefit plus complete release/security/QA evidence.
7. Audio is created offline in batches. Amazon Polly Neural in Europe (Frankfurt) is the initial broad TTS candidate behind a provider-neutral adapter; Standard is a cheaper audited lower-rung fallback, Generative is audited-only, and P4 requires target-calibrated human sign-off plus meaningful voice/native variety. No provider call occurs during a learner attempt.
8. Instructional audio has an always-available text equivalent. Answer-bearing target transcripts are separate protected objects and are absent until the authorized reveal phase. Actual transcript/caption/replay/speed/accommodation conditions enter the evidence envelope.
9. Failures and corrections are local, append-only and scoped. The validity set remains exactly valid, partially_valid, pending, interrupted, not_counted. Unaffected units and unrelated skills remain available; no fault becomes learner weakness, score, Readiness risk, or pass probability.

## Alternatives considered

| Alternative | Reason not chosen |
|---|---|
| Browser-only playback counters | Reload, offline retry and multiple devices can duplicate opportunities and cannot produce auditable actual conditions. |
| Per-play online authorization | Makes the network a runtime dependency even after a fully prepared block. Pinned preauthorized ordinals plus idempotent sync are simpler and more resilient. |
| Stream P4 media on demand | A transient fetch can fail after exposure/timing begins and unfairly change the measured condition. |
| Public content-hash URLs and CDN from launch | Hashes do not enforce rights/transcript access; a public R2 custom domain needs extra access-control/cost coupling with no measured launch need. |
| MP3 + Opus/AAC at launch | More renditions multiply QA/browser/cache/rights paths. MP3 is broadly supported and patent-expired; add a format only from measured benefit. |
| Google Cloud TTS as first provider | Credible EU-region fallback, but an additional provider is not needed. The adapter/export contract makes later substitution bounded. |
| Polly Standard only | Cheapest but may not supply adequate P3 naturalness. It remains a lower-rung fallback after audit. |
| Polly Generative by default | Higher price and documented rare cut/hallucination risk increase final-byte review burden. It is an audited candidate, not authority. |
| Human-record every asset | Strong authenticity but unsustainable breadth/review cost for a personal project. Use a small high-value benchmark pool. |
| Synthetic-only P4 | Risks voice/provider-specific success and weak target transfer. Strong P4 requires audited target-calibrated variety. |
| Ship transcripts hidden in the client | Hidden DOM/JSON is answer exposure. Transcripts use separate phase-gated authorization. |
| DRM or device/audio fingerprinting | Disproportionate, privacy-invasive, and cannot guarantee copy prevention or audible output. |

## Consequences

Positive:

- exact evidence conditions are reproducible and auditable;
- measured playback does not depend on live TTS, Corpus, or network after readiness;
- one launch format and no public CDN minimize operations;
- batch generation amortizes TTS cost and supports provider/storage exit;
- accessibility and transcripts remain useful without overstating standard target equivalence;
- faults preserve learner effort and unaffected evidence.

Costs/trade-offs:

- measured blocks wait for full preload and can be unavailable on poor connections;
- final-byte audit and P4 voice/native breadth require operator time;
- MP3 may use more bytes than an optimized Opus rendition;
- short-lived authorized reads reduce edge-cache efficiency;
- occurrence/outbox reconciliation is more work than a local replay counter;
- a system fault requires fresh equivalent inventory rather than a same-content retry.

## Security, privacy, rights, accessibility, and cost

R2 remains private and EU-jurisdictional; server credentials never enter the client. Read authorizations are bearer tokens and must be short-lived/redacted. Transcript, answer, master, and learner rendition objects are separated. Action-level rights control generation, transcode, cache, download, display, attribution, expiry, and takedown. No legal-compliance, DRM, or perfect copy-prevention claim is made.

Instructional text is always available; target transcripts are phase-gated. Native semantic controls, keyboard paths, discrete announcements, German language metadata, 320 px reflow, 200% zoom, and Stage-14 browser/AT evidence remain release gates. Timer ticks are never announced.

Routine playback has zero TTS/AI cost. At the decision date, official list prices show R2 Standard storage/operations with free R2 Internet egress and Polly character-based Standard/Neural/Generative tiers; all prices/regions/voices are rechecked before procurement. Cost cannot weaken validity, accessibility, recovery, or P4 variety.

## Traceability

Primary product: Bestehen-Shaping/app/11-listening-training.md §§3.1–3.8, 4.1, 4.5–4.10, 5, 7; app/08-a1-to-b1-progression.md §8.2; app/16-mock-exams.md §4.7; app/26-platform-accessibility-nonfunctional.md §§3.5–3.10, 3.12–3.15; app/27-end-to-end-scenario-validation.md precedence.

Architecture: Stages 05, 06, 09, 10, 12, 13, 14 and Architecture/16-listening-audio-tts-and-media-delivery.md.

Design: Design/DESIGN-HANDOFF.md §§3.7 and attempt shell; Design System audio/timer/failure controls; Mobile Listening/audio-failed states; Flows D and F.

Current official evidence accessed 2026-08-23: MDN audio codecs; WHATWG HTML media; Cloudflare R2 pricing/data-location/security/presigned-URL/cache/consistency documentation; AWS Polly pricing/voices/regions/privacy/security documentation; official TELC B1 page/model test; WCAG 2.2.

## Review triggers

Review this decision when measured release evidence shows any of:

- MP3 preload/stalls make poor-connectivity P4 materially unavailable and another rendition passes the full matrix;
- preload p95 or R2 request/latency/cost requires an access-controlled edge cache;
- Polly Neural quality/voice breadth or provider change fails gold/target/native comparison;
- P4 audited human/native inventory blocks decision-grade H1–H3 coverage;
- media/pronunciation/duplicate-exposure/false-ready incidents breach Stage-24/25 gates;
- jurisdiction, price, voice, terms, security, rights, browser support, or provider availability materially changes;
- a second client or verified accommodation profile needs a compatible contract.

Exit retains App-owned scripts/SSML, lossless masters, digests, manifests, approvals, gold cases and occurrence semantics. TTS can move to Google Cloud TTS EU/another provider/human recording; storage can move through S3-compatible export; delivery/cache/codec can change without changing semantic IDs or evidence truth.

## Supersession

Supersedes none. Applies ADR-0001, ADR-0002, ADR-0003, ADR-0009, ADR-0011, ADR-0012, ADR-0013, ADR-0016, ADR-0017, ADR-0019, ADR-0020, ADR-0021, ADR-0022, and ADR-0023.
