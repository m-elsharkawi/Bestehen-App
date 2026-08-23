# ADR-0028 — Provider-portable account identity and id-preserving local-first lifecycle

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Stage 20 — Account, Local-First Use, Profile, Sync, Export, and Deletion
- **Decisions:** `ARCH-S20-D01`–`ARCH-S20-D12`
- **Supersession:** None

## Context

Bestehen must support meaningful first use without an account while retaining authoritative learner facts, optional cross-device recovery/sync, export and complete deletion. Provider identity, profile edits, retries, concurrent devices and deletion must never rewrite or duplicate Evidence, merge Written/Oral truth, turn missing into zero, or create a probability. The accepted persistence architecture already fixes an account-free guest server scope, App-owned stable IDs, IndexedDB as local write-ahead replica, PostgreSQL as accepted-fact authority, idempotent operations, bounded backups and restore-suppression deletion journal.

A launch identity choice must be current, accessible, low-maintenance, region-appropriate, portable and sustainable for a personal project. Account/provider failure must not block unrelated local work.

## Decision

1. Core first use uses an opaque App guest principal/learner scope and protected guest capability. A random local device-installation ID namespaces checkpoints but is not authority or a fingerprint. Losing the unlinked capability is honestly unrecoverable.
2. `LearnerScopeId` and `AccountPrincipalId` are App-owned permanent semantic identities. Guest capabilities, device IDs and identity-provider `issuer+subject` values are replaceable principal bindings. Email is a mutable verified credential/contact, never a learner key.
3. Launch authentication uses Auth0 Public Cloud in the EU, hosted New Universal Login and email OTP, with Amazon SES in Frankfurt for production delivery. OIDC Authorization Code + PKCE terminates at the App. The App issues its own opaque same-origin Secure/HttpOnly/SameSite session and maintains independent revocation. No launch password, SMS, social-login matrix or security question exists.
4. Email OTP is bootstrap and recovery. Sensitive adoption, credential changes, export, deletion and session revocation require recent auth under versioned `session-policy/v1`. No valid App session plus no email access has no automated recovery.
5. Guest adoption appends ownership bindings and preserves every fact ID. Existing-account merge unions immutable facts by semantic ID/hash, quarantines divergent reuse, explicitly resolves mutable owner fields and discards/rebuilds derived projections. It never copies/re-IDs facts, sums projections, chooses the highest score or performs global last-write-wins.
6. Multi-device sync uses server-owned opaque cursors, stable operation IDs/hashes, owner ETags/versions and deletion tombstones. Raw audio never syncs. Stage 21 implements local queue/checkpoint/conflict mechanics without changing these semantics.
7. Export is `bestehen-export/v1`: a checksummed ZIP at a frozen source cut with accessible `README.txt`/`summary.html` plus JSON/NDJSON/CSV. It includes user-owned/profile/goal/evidence/history/Readiness/Writing/transcript/evaluation data and lineage, while excluding raw audio, secrets and restricted Corpus assets.
8. Deletion revokes access first, durably purges all live owner rows, jobs/outbox/inbox, caches, provider identities/data, temporary exports and remaining raw media, rejects late writes and proves every step. Inaccessible shared-backup residual is disclosed with latest expiry; restore replays the restricted deletion journal. Linkable journal data remains bounded by accepted Stage-05 maximum 91 days.
9. Better Auth on existing PostgreSQL + SES is the cheaper-license/provider-exit fallback after security/maintenance evidence. Another OIDC provider is replaceable through dual verified binding/re-verification; learner facts and IDs do not migrate with the identity provider.
10. Configured sign-in/recovery/export/delete flows require WCAG 2.2 AA keyboard, screen-reader, zoom/reflow and error-recovery evidence. Abuse controls do not make an inaccessible CAPTCHA the only route to core first use.

The full rationale, contracts, provider evidence, diagrams, matrices, failure states, cost triggers and handoff are in `Architecture/20-account-local-first-profile-sync-export-and-deletion.md`.

## Alternatives considered

- **Account wall:** simpler authorization but directly violates account-optional first use.
- **Client-only learner truth:** avoids anonymous server identity but cannot support accepted evaluation, durable evidence, cross-device recovery or complete provider deletion.
- **Provider subject/email as learner key:** convenient, but couples domain data to mutable/provider-specific credentials and makes migration/adoption rewrite facts.
- **Clerk:** strong UI/export and current 50,000-MRU free tier, but no selectable regional data residency; not the launch regional fit.
- **Supabase Auth:** open and Frankfurt-capable, but introduces a second managed Postgres/project beside the accepted Render authority.
- **Better Auth now:** strongest self-host portability and no per-user licence, but raises authentication security, abuse, patching, recovery and on-call burden for one maintainer.
- **Passwords, SMS, social matrix or magic-link-only:** add credential/recovery/privacy complexity or cross-device/scanner ambiguity without launch need.
- **Whole-profile last-write-wins/CRDT:** cannot decide evidence validity, draft submission, deletion or planning truth.
- **Immediate destruction of shared backups:** could damage other learners and disaster recovery. Live erasure plus inaccessible bounded expiry and restore suppression is truthful and complete.
- **Primary-row/soft delete only:** leaves providers, jobs, objects, devices and restores able to resurrect personal data.

## Consequences

### Positive

- First value is available without personal identity or account coercion.
- App-owned stable IDs make adoption, provider migration, export and deletion independent of Auth0.
- Hosted EU passwordless identity minimizes credential and solo-maintainer burden while SES keeps delivery region/cost explicit.
- Retry, concurrent device and deletion races cannot duplicate evidence or silently choose a better/newer projection.
- Human and machine export remain portable and accessible; deletion is operationally provable rather than a UI flag.
- Identity/provider outages remain local failures with zero learner-negative evidence effect.

### Costs and trade-offs

- Email possession is the launch recovery factor and email compromise is an account-takeover risk; step-up/session revocation/notifications mitigate but do not eliminate it.
- An unlinked guest who loses browser capability cannot recover the server scope.
- Auth0 and SES are commercial dependencies with mutable prices, regions, quotas and terms; provisioning and scheduled rechecks are required.
- Shared backup residual cannot vanish at click time. UI must disclose the latest bounded expiry, contradicting lower-authority “no backup” design copy.
- Sync/merge/deletion require operation receipts, cursors, tombstones, durable jobs and restore drills, though no new infrastructure service is added.
- Permanently offline/lost devices and learner-controlled exports/email cannot be remotely erased.

## Security, privacy, rights and accessibility

Provider tokens never enter localStorage; App sessions are opaque same-origin cookies with rotation, expiry, CSRF/origin controls, object/property authorization, recent-auth sensitive commands and App-owned revocation. Auth0/SES receive no learning profile, response, evidence, Readiness, raw audio or Corpus data. Guest capabilities are cryptographically random and hashed server-side; no fingerprint is built. Raw audio is neither synced, exported nor backed up and is absent after finalization/deletion.

Export/delete are available to guest and account learners. Deletion is idempotent and retryable with access revoked first; late provider/job writes are purged. Only irreversibly de-linked aggregates may remain. Exact legal wording and DPA/retention verification remain Stage 23/legal review without weakening the mechanism.

Hosted login and all App-owned account/data-control states must pass configured real keyboard, screen-reader and reflow testing. OTP/confirmation retains visible labels/instructions/errors; deletion phrase stays visible and pasteable; no memory test or CAPTCHA-only core wall is allowed.

## Operations, cost and exits

Track MAU, OTP delivery/failure/429, plan/transport cost, auth incidents/maintainer time, sync bytes/conflicts/dedup, export generation/expiry, deletion age/provider proof and restore suppression without PII. Recheck official provider facts before provisioning, plan change and each release.

Substitute Auth0 when projected tier/cost, region/processor terms, security/accessibility, export portability or measured availability no longer meets the contract after ordinary fixes. Better Auth is the cheaper-license fallback only after patch/key/abuse/recovery/exit runbooks prove solo-maintainer readiness. Provider exit binds a newly verified credential to existing App principals and then revokes/deletes the old provider; it never rewrites learner facts.

## Validation and review triggers

Review or supersede this ADR when:

- product authority changes account optionality or recovery assurance;
- configured Auth0/SES region, terms, price, quotas, accessibility or export behavior changes materially;
- auth/account loss, takeover, challenge-block or deliverability evidence fails release criteria;
- adoption/sync property tests reveal duplicate/lost evidence or tombstone resurrection;
- a deletion/restore drill cannot prove complete purge and suppression within the 91-day maximum;
- measured provider total cost exceeds a security-reviewed self-host/managed alternative for three consecutive months;
- a passkey or additional recovery method passes current/current-previous browser/AT and recovery evidence;
- dedicated sync infrastructure is justified by sustained SLO failure after ordinary PostgreSQL/index/batch/cursor tuning.

Any reversal creates a superseding ADR. Account optionality, export/delete rights, App-owned evidence truth, raw-audio ephemerality and the five/six state invariants are not reopened here.

## Traceability and downstream handoff

Primary sources: `app/28-bestehen-app-product-specification.md` `15–18; `app/02-complete-learner-journey.md`; `app/04-learner-model.md`; `app/19-information-architecture-and-core-screens.md`; `app/22-user-controls-vs-coach-autonomy.md`; `app/24-analytics-and-success-metrics.md`; `app/25-business-model-and-product-boundaries.md`; `app/26-platform-accessibility-nonfunctional.md`; Design landing/Data & deletion and Flow G; Architecture Stages 03, 04, 05, 06, 12, 13 and 14.

Stages 21–26 and 28 must preserve stable App IDs, guest loss truth, ID/hash adoption, owner-specific merge, no derived-state sync writes, raw-audio exclusion, human+machine export, access-first deletion with restore suppression, provider portability, capability-local outage and WCAG release evidence.
