# Secrets, rotation, recovery, and offboarding

Last verified: **2026-08-23**. Follow current provider secret-management guidance
linked from each preceding guide. Repository configuration defines names and
relationships only; values live in provider stores, Coolify locked runtime variables,
the owner password manager, or offline recovery custody.

### `SEC-01` — Build the protected custody inventory

- **Owner:** security/operations owner.
- **Action:** Complete the [resource and secret custody template](./README.md#resources-and-secret-custody) in the protected ledger for controller/admin recovery, VM SSH, GitHub App, Auth0 App/session/Action, Auth0 SMTP, R2 runtime/backup, SES App, Gemini, OpenAI STT/TTS, and conditional Polly. Name one consumer and one revocation proof for each.
- **Expected result:** every active/retiring/revoked credential has owner, purpose, environment, consumer, version, dependents, and recovery/rotation state.
- **How to verify:** compare variable/credential names against [configuration](../../configuration.md) and each dashboard without viewing values.
- **Evidence:** inventory digest/reference, class counts, gaps, checked date, and redacted result.
- **Rollback:** disable any unowned/over-scoped credential and return its consumer to fake/closed operation.
- **NEVER PASTE HERE:** ledger content, secret/key/token, email, private address/URL, recovery code, account/resource ID, or environment export.

### `SEC-02` — Inject without disclosure

- **Owner:** account owner in the consuming provider/Coolify dashboard.
- **Action:** Enter each value directly in its one consumer. Coolify secrets are locked runtime-only and never build variables. Auth0 SMTP stays in Auth0; backup decrypt key stays offline; conditional Polly stays in the offline batch runner. Do not place runtime secrets in GitHub.
- **Expected result:** strict startup identifies missing variable names only; images, browser bundles, logs, and evidence contain no value.
- **How to verify:** run `pnpm check:secrets`, OCI inspection, configuration negatives, and a redaction canary without printing environment.
- **Evidence:** variable names/classes, custodian, runtime/build/locked booleans, check IDs, and date.
- **Rollback:** disable affected adapter/flag, remove variable, rotate/revoke, redeploy fakes, and verify old access fails.
- **NEVER PASTE HERE:** actual values, `.env`, dashboard export/screenshot, command-line secret, process environment, image config/history, or provider response.

### `SEC-03` — Rotate and revoke

- **Owner:** credential owner.
- **Action:** On suspected exposure, offboarding, material role/provider change, provider requirement, at least annually, and before final launch: create new → inject without printing → deploy/verify → revoke old → prove old fails → store redacted receipt. Use current+previous overlap only where required (for example, JWKS/session transitions).
- **Expected result:** the new version serves its one purpose and the predecessor cannot authenticate after the bounded overlap.
- **How to verify:** one allowed synthetic action with new version, one denied action with old version, and unrelated-action denial.
- **Evidence:** credential class/version labels, dates, allowed/denied results, dependents, and rollback state.
- **Rollback:** during overlap restore the verified predecessor; after revocation keep the route disabled until a new verified credential exists.
- **NEVER PASTE HERE:** either credential, token/session, key fingerprint tied to account, recovery material, raw access log, owner identity, or full provider error.

### `SEC-04` — Respond to suspected disclosure

- **Owner:** security owner using the provider-specific recovery contact.
- **Action:** Set affected external/paid/productive flag false, select fake/fixed/Pending fallback, revoke/rotate, review bounded provider/App access evidence, scope affected data/purpose, clean stored artifacts, and record an incident without payload. Preserve unrelated work.
- **Expected result:** smallest capability is contained; no technical fault becomes learner evidence; leaked credential fails.
- **How to verify:** old credential denial, current secret scan, no unexpected provider usage, and clean exact-commit deploy.
- **Evidence:** incident state/category, capability, key version, dates, proof digest, and closure/remaining gate.
- **Rollback:** never reactivate a suspected value; use a newly verified credential or keep the capability closed.
- **NEVER PASTE HERE:** leaked value, log/request body, learner/provider content, owner contact, IP/private URL, or unredacted incident attachment.

### `SEC-05` — Verify recovery custody

- **Owner:** owner with offline recovery authority.
- **Action:** Inventory MFA/recovery codes, Coolify `APP_KEY`, controller backup, VM access recovery, R2 backup credential, encryption public key online/private key offline, provider recovery contacts, and successor access. Rehearse only synthetic/isolated recovery at the approved checkpoint.
- **Expected result:** loss of a VM/provider credential does not require a value from Git/chat; no one falsely claims a database backup restored before the isolated drill.
- **How to verify:** quarterly two-person-equivalent owner checklist, synthetic decrypt/restore sample, deletion-journal replay, and old-access denial.
- **Evidence:** inventory/restore receipt digest, date, RPO/RTO result, gaps, and no material.
- **Rollback:** stop restored service, preserve source archive, correct custody/configuration, and repeat in isolation.
- **NEVER PASTE HERE:** `APP_KEY`, backup/archive/dump, private decrypt/SSH key, recovery code/contact, database URL, or restored data.

### `SEC-06` — Offboard or exit a provider

- **Owner:** provider/data-rights/operations owner.
- **Action:** Follow the [offboarding checklist](./README.md#offboardingexport-checklist), provider-specific export/exit step, and dependency-reverse cleanup. Check deletion, rights, retention, inaccessible backup residual, and pending callbacks before account/resource deletion.
- **Expected result:** App-owned IDs/contracts remain; old access fails; required data is verified at the successor; unresolved provider deletion remains `owner_pending`/`failed`, not complete.
- **How to verify:** manifest/count/digest comparison, substitute fake/contract suite, revoked-access test, and provider closure state.
- **Evidence:** scope, provider-neutral manifest digest, result/cleanup/rollback, remaining retention, and date.
- **Rollback:** restore the verified predecessor only before destructive closure and only if rights/security/deletion controls permit it.
- **NEVER PASTE HERE:** export contents, identities, objects, credentials, account IDs, provider messages, private URLs, or deletion receipt with personal data.
