# ADR-0031 — Minimized Authoritative Trust Boundaries and Bounded Retention

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 23 — Security, Privacy, Rights, Retention, and Threat Model
- **Decision IDs:** `ARCH-S23-D01`–`ARCH-S23-D12`
- **Supersedes:** none
- **Superseded by:** —
- **Full rationale:** [Stage 23](../23-security-privacy-rights-retention-and-threat-model.md)

## Context

Bestehen / App is a phone-first responsive web exam coach with account-optional first use, durable learner evidence, Writing, ephemeral Speaking audio, approved rights-aware content, optional sync, bounded productive AI/speech processing, direct Web Push and asynchronous Corpus intelligence. Learner truth must survive external outage without allowing a provider, browser, operator, model or content source to become semantic authority.

The accepted topology is intentionally small: a same-origin Next.js/Node modular application on Render Frankfurt, PostgreSQL and pg-boss, private R2 EU object storage, IndexedDB continuity, Auth0 EU with SES for optional identity, and capability-specific AI/STT/TTS adapters. Physical microservices, a SIEM, general upload service, WAF/bot vendor, warehouse, multi-region deployment and dedicated KMS are not justified at private/personal scale. However, simplicity cannot erase object authorization, retention, raw-audio deletion, rights/takedown, accessible account/data controls, auditability or incident containment.

Existing durable constraints include:

- exactly five evidence-validity values: `valid`, `partially_valid`, `pending`, `interrupted`, `not_counted`;
- exactly six Readiness states: `evidence_building`, `not_ready`, `borderline`, `safe`, `ready_to_book`, `stale_contradicted`;
- deterministic evidence/Readiness/planning, no pass-probability representation, Written/Oral independence, absence not zero and Safe not Ready;
- Corpus is asynchronous and receives no learner data;
- raw audio deletes immediately after finalization or at the absolute seven-day Pending ceiling, never enters backup/sync/analytics/log/export/Corpus;
- learner deletion revokes access and purges live/provider/local-reachable data while a minimum restore-suppression journal truthfully persists no longer than 91 days;
- WCAG 2.2 AA, account-optional first use, export/delete, minimum AI payload, no advertising/data sale/session replay/hidden training contribution, and neutral technical faults.

Design Act 5 says deletion leaves “no backup,” which conflicts with the accepted recoverable-backup and ≤91-day restore-suppression contract. Design mic copy says audio is “never shared,” while accepted productive processing sends minimum-purpose audio to processors. Product/architecture truth requires precise residual/processor disclosure; Design is not edited by this ADR.

Current official sources, accessed 2026-08-23, establish the verification baseline: [OWASP ASVS 5.0.0](https://owasp.org/www-project-application-security-verification-standard/), OWASP [session](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [secrets](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) and [CSP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) guidance; [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html); current [OpenAI API data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint), [Gemini ZDR](https://ai.google.dev/gemini-api/docs/zdr), [Amazon Polly privacy](https://docs.aws.amazon.com/ai/responsible-ai/amazon-polly/overview.html), [R2 data security](https://developers.cloudflare.com/r2/reference/data-security/), [Auth0 regions](https://auth0.com/docs/get-started/auth0-overview/create-tenants), and GitHub’s [supply-chain hardening](https://docs.github.com/en/code-security/tutorials/secure-your-organization/protect-against-threats). Provider facts are mutable release gates, not permanent assurances or legal claims.

## Decision

### 1. Authoritative trust boundaries

Use one versioned data-flow/threat register across six enforceable logical zones:

1. untrusted learner browser/device and origin-scoped continuity;
2. public edge and same-origin App session/API;
3. private learner-truth PostgreSQL/domain/worker;
4. private object/media storage;
5. external identity, email, AI/speech and push processors;
6. separate owner/operator, CI/deployment and offline Corpus publication plane.

Modules exchange allowlisted versioned contracts under separate least-privilege credentials. Logical isolation is mandatory; physical services are added only for measured security/isolation, scale, availability, ownership or release-cadence need.

The App alone authenticates a principal into an App-owned binding and authorizes every object/action/purpose. Provider subject, email, URL, object key, opaque identifier, browser state and model output never confer authority. Guest/account sessions are opaque server-issued same-origin cookies. Operator is a separate elevated role/plane, not a learner flag.

### 2. Purpose minimization and processor authority

Every boundary flow has a named purpose, allowlisted fields, retention class, deletion behavior, failure state and exit path. AI/STT/TTS receives pseudonymous job IDs and only the task evidence needed. No learner profile, Corpus learner path, general model conversation/file/grounding/cache feature, hidden training opt-in, advertising, data sale or session replay is allowed.

Provider output is an untrusted candidate. App schema/fairness/evaluator gates decide acceptance; Evidence owns validity and Measurement owns Readiness. Provider outage, privacy/region/terms drift or budget circuit opens only the affected capability and uses fixed/manual/Pending fallback.

### 3. Bounded retention and deletion truth

Use a versioned retention registry by data class and purpose:

- authoritative learner facts useful for explainability remain until learner deletion;
- rebuildable/transient projections, checkpoints, payloads, jobs, exports, notification detail and operational logs expire at the Stage-23 matrix ceilings;
- raw learner audio purges immediately after terminal finalization or at the absolute seven-day Pending deadline, never enters general backup;
- general raw operational logs expire at 30 days; minimized high-risk App audit events at 90 days; no response/transcript/audio/prompt/token/secret/full sensitive URL appears;
- learner deletion revokes access first, rejects late writes, purges live/local/provider-controllable copies and replays a minimum restore-suppression journal after restore; linkable journal data expires no later than day 91;
- UI never claims deletion complete while a required live/provider task remains and truthfully discloses inaccessible backup residual.

A provider whose unavoidable retention exceeds the reviewed purpose must be disclosed and approved before use or the capability stays disabled. No jurisdiction-specific legal conclusion is inferred.

### 4. Rights-aware serving and takedown

Serve only an exact App-approved immutable revision whose action, audience, permission, attribution, accessibility and effective-time gates pass. Corpus publication eligibility is necessary input, never learner-playable authority.

A credible verified impact creates an immediate exact-action deny overlay. Stop new sessions, signed access, offline cache lease and derivative generation; then clear, condition with a new immutable successor, or withdraw/purge required bytes and source-expression caches. Preserve only permitted non-reconstructive lineage/tombstones. Rights-only withdrawal does not change past learner performance. Correctness/fairness defects append the smallest defensible validity correction and trigger deterministic scoped recomputation with neutral copy.

Anti-copy is bounded private access, short authorization, no indexing/public bucket, permission-aware cache/offline/export and source-expression leakage review—not a claim of DRM.

### 5. Sessions, browser controls, secrets and encryption

The versioned browser/session baseline requires HTTPS; Secure HttpOnly `__Host-` SameSite cookies; rotation at authentication/privilege/risk; server revocation; origin/Fetch Metadata/CSRF protection on unsafe actions; strict allowlisted nonce/hash CSP without arbitrary third-party script, object or framing; staged HSTS; `nosniff`; restrictive referrer/permissions/cache policy; PKCE/state/nonce and allowlisted redirects/routes. Session tokens never appear in URL, localStorage, logs or exports.

Inventory every secret/key by environment, owner, capability, version, active/retiring/revoked state and dependents. Store only in platform/provider secret boundaries; least privilege; never log; support overlap/revocation and incident/event cryptoperiod rotation. Use standard reviewed authenticated encryption—not custom cryptography. Raw learner audio and Web Push subscription secrets use application-layer envelope encryption in addition to provider at-rest encryption, with per-object/record data keys and versioned server-only wrapping key. Rotate by rewrapping keys. Add managed KMS/HSM when public exposure, a second operator, required key-use audit or drill failure justifies it.

### 6. Untrusted input, abuse and supply chain

All learner text/audio, Corpus packages, provider callbacks/results, model output, filenames, metadata and log fields are untrusted. Launch accepts only the bounded audio upload already shaped; no general learner upload/import. Validate actual media signature/decoder/size/duration privately, never serve/execute quarantined bytes or active learner/model HTML. AI has no tools, URL fetch, secrets, authority or direct publication path.

Layer rate/cost defense by network, guest capability, learner scope, endpoint, operation and provider budget. Use idempotency, request/body/duration/concurrency limits, progressive backoff, circuit breakers and kill switches. Do not use invasive fingerprinting or CAPTCHA-only core access; provider/abuse failure remains neutral.

Supply-chain release trust uses exact tool/lock pins, dependency admission and license/provenance review, SBOM and vulnerability/license/secret scanning, full-SHA Actions, minimum workflow permission, protected deployment environment, short-lived OIDC where supported, artifact digest/attestation, staged rollback and an emergency patch policy. Provenance improves traceability but never substitutes for code review/testing.

### 7. Audit, incident response and public hardening

Separate authoritative learner corrections/deletion/rights facts from minimized security/operational events. Security events may contain actor scope, target class/hash, action, outcome, reason, release/key version, request/trace ID and server time, but no learner response, transcript, raw audio, prompt, token, secret or sensitive URL. Provider audit is supplemental and may retain less than App policy; it is not authority.

Incident lifecycle is `detected → triaged → contained → scoped → eradicated → recovering → verified → closed_learned`. Contain the smallest affected capability; preserve minimum bounded evidence; rotate/revoke; recover from verified artifacts; correct learner facts only through append-only domain paths; use reviewed communication. The architecture makes no legal notification timing claim.

Before public exposure require at least operator MFA, protected deployment, applicable ASVS/WCAG evidence, external attack-surface scan, auth/delete/audio/rights/key monitors and kill switches, vulnerability/rights contacts, current provider/configuration review, and exercised incident/takedown/delete/restore/key runbooks. Before commercial public use require professional trademark/font/content-license and jurisdiction-specific legal/processor review.

## Consequences

### Positive

- One authority and one threat/retention register make cross-boundary behavior testable without microservice sprawl.
- External compromise/outage cannot silently rewrite evidence or Readiness.
- Raw audio, deletion residual, processor transfer and rights withdrawal have honest bounded states rather than absolute promises the topology cannot prove.
- Provider and identity exit preserves App-owned IDs, structured results, SQL, S3 manifests and in-App fallbacks.
- Security controls remain accessible and local failures stay neutral.
- Public hardening is triggered by exposure/risk evidence rather than installed speculatively.

### Costs and risks

- The owner must maintain policy/key/processor/retention inventories, redaction schemas, envelope-encryption rotation and runbooks.
- Logical isolation is weaker than physical isolation if module/credential boundaries are poorly implemented; Stage 25 authorization/adversarial tests and Stage 26 deployment proof are mandatory.
- Application-layer encryption can cause data loss if keys are mishandled. Lost-key/rewrap/revoke drills and an explicit managed-KMS trigger are required.
- Provider terms, regions, logs, deletion and model behavior remain mutable and need release-time evidence.
- Thirty-/ninety-day logs may be inadequate after a late-discovered incident; longer retention requires a necessity/access/deletion/legal/cost review rather than silent expansion.
- Browser clients can capture displayed content; anti-copy controls reduce exposure but cannot guarantee prevention.
- Public/commercial launch has explicit legal/trademark/license gates that this ADR cannot close.

### Failure and accessibility

Unknown consequential policy/key/processor/rights major fails the smallest action closed; unrelated approved learning continues. Authentication, recent-auth, export, deletion and security confirmation support keyboard, screen reader, copy/paste, reflow and a non-CAPTCHA/non-memory-test path. Security timeouts preserve drafts/checkpoints and describe what remains. No security/provider/content fault changes the five validity or six Readiness state sets or becomes learner failure.

### Cost, fallback and exit

Launch adds no always-on service. Existing PostgreSQL/pg-boss/R2/Render/provider controls plus application policy/encryption/testing are the default. Cheaper fallbacks are in-App-only notification, fixed/prerecorded/manual productive processing, App-curated content, no new upload, and documented manual incident response. Higher-cost Render audit tier, managed KMS, WAF/bot/scanner/SIEM requires a trigger and exit review. Standard Node/SQL/S3/provider adapter/App-owned identity contracts preserve migration.

## Alternatives considered

1. **Do nothing / trust the monolith and provider defaults.** Lowest initial work, rejected because object authorization, retention, rights and deletion become implicit and provider logs/terms become hidden authority.
2. **Physical microservice per zone.** Strong isolation, rejected at launch because separate deployment/identity/telemetry/on-call paths increase solo risk and cost without measured need.
3. **Enterprise control suite immediately: WAF/bot, SIEM, KMS/HSM, DLP, scanner, warehouse, multi-region.** Rejected as speculative. Named public/incident/operator/upload triggers can add specific controls.
4. **Local-only, no account/processors/notifications.** Private and cheap but omits optional sync and pass-critical productive evaluation. Retained only as per-capability fallback.
5. **Keep everything for investigation/calibration.** Rejected because it amplifies breach, rights, deletion and cost exposure.
6. **Delete all history quickly.** Rejected because it destroys learner explainability, correction and export.
7. **Provider encryption only.** Retained for ordinary structured/static data, rejected for the highest-sensitivity raw-audio and push-secret classes because storage/admin compromise remains broad.
8. **Dedicated managed KMS immediately.** Stronger key custody, deferred until public/operator/audit/drill trigger to avoid a new critical service before need.
9. **General upload plus antivirus.** Rejected; no launch requirement and scanner does not solve parsing, rights, retention or serving risk.
10. **Provider badges/terms as compliance proof.** Rejected. Current contract/configuration verification and later jurisdiction-specific legal review remain required.

## Validation

Stage 25 must record applicable ASVS 5.0.0 evidence and test:

- authentication/session fixation/rotation/logout/revocation; object/field/action authorization; CSRF/origin/callback/replay;
- strict CSP/headers/cache/referrer/routes across authenticated, error, export and media responses;
- malicious audio/import/Corpus/model/prompt/log fixtures and resource ceilings;
- cross-scope/raw-audio/delete/restore/takedown/cache/provider-callback races;
- no-probability/no-sensitive-log/no-learner-to-Corpus/no-audio-backup/export static and restored-environment scans;
- dependency/SBOM/license/provenance/Action pin/workflow permission/reproducibility;
- keyboard/screen-reader/reflow/copy-paste authentication/recent-auth/export/delete/takedown controls.

Stage 26 must prove deployed network roles, private storage/database, secret/key versions, rotation/revocation, provider settings/terms, backup restore, journal replay, monitoring, kill switches and runbooks. Stage 24 sets measured alert/SLO/cost values; Stage 27 verifies truth precedence; Stage 28 consolidates.

## Traceability

Primary sources:

- `app/28-bestehen-app-product-specification.md`
- `app/01-product-thesis.md`
- `app/04-learner-model.md`
- `app/05-mistake-memory.md`
- `app/12-writing-coaching.md`
- `app/13-speaking-coaching.md`
- `app/15-telc-readiness.md`
- `app/16-mock-exams.md`
- `app/21-content-strategy.md`
- `app/22-user-controls-vs-coach-autonomy.md`
- `app/24-analytics-and-success-metrics.md`
- `app/25-business-model-and-product-boundaries.md`
- `app/26-platform-accessibility-nonfunctional.md`
- `corpus/12-corpus-app-contract.md`
- `corpus/17-bestehen-corpus-product-specification.md`
- `Design/DESIGN-HANDOFF.md` §§3.6–3.7
- `Design/Bestehen-02-Mobile-Screens.dc.html` Act 5
- `Design/Bestehen Logo/Bestehen Logo System.dc.html` licensing/trademark notes
- `Architecture/02-system-context-and-product-boundaries.md`
- `Architecture/03-technology-stack-and-repository-strategy.md`
- `Architecture/04-domain-model-and-bounded-contexts.md`
- `Architecture/05-data-ownership-persistence-and-schema-evolution.md`
- `Architecture/06-evidence-ledger-validity-versioning-and-audit.md`
- `Architecture/09-content-exercise-form-and-media-architecture.md`
- `Architecture/10-corpus-integration-compatibility-cache-and-rights.md`
- `Architecture/12-api-contracts-jobs-events-and-idempotency.md`
- `Architecture/16-listening-audio-tts-and-media-delivery.md`
- `Architecture/17-writing-editor-autosave-and-evaluation-pipeline.md`
- `Architecture/18-speaking-audio-stt-partner-and-evaluation-pipeline.md`
- `Architecture/19-ai-gateway-model-governance-evaluation-and-cost.md`
- `Architecture/20-account-local-first-profile-sync-export-and-deletion.md`
- `Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md`
- `Architecture/22-notifications-scheduling-and-time-zones.md`

## Review triggers

Review or supersede when any of the following occurs:

- public or commercial exposure, a second write-capable operator, general file upload/import, social/research sharing, billing or a new learner-data processor;
- cross-learner/operator compromise, raw-audio deadline breach, deletion resurrection, source-expression leak, credential/build compromise or high-severity incident;
- current provider region/retention/training/delete terms no longer meet the route;
- envelope encryption/key drill fails or key-use audit requires managed KMS/HSM;
- sustained abuse/cost/reliability evidence justifies WAF/bot/scanner/SIEM/physical split;
- ASVS/WCAG/browser/provider/dependency major changes invalidate the pinned release evidence;
- product authority changes any account, raw-audio, rights, export/delete, Corpus isolation or evidence-truth invariant.

A reversal creates a new ADR and marks this record superseded; history is never deleted.
