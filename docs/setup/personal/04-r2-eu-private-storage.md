# Cloudflare R2 private EU storage

Last verified: **2026-08-23**. Official references: R2
[data location](https://developers.cloudflare.com/r2/reference/data-location/),
[API tokens](https://developers.cloudflare.com/r2/api/tokens/),
[S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/),
[CORS](https://developers.cloudflare.com/r2/buckets/cors/),
[presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/),
[lifecycle](https://developers.cloudflare.com/r2/buckets/object-lifecycles/),
[security](https://developers.cloudflare.com/r2/reference/data-security/),
[pricing](https://developers.cloudflare.com/r2/pricing/), and
[budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/).

An R2 location hint is best effort. Only the immutable jurisdiction selection `eu`
guarantees the required boundary. Its S3 endpoint is
`https://<account-id>.eu.r2.cloudflarestorage.com` and SDK region is `auto`.

### `R2-01` — Create the EU runtime bucket

- **Owner:** Cloudflare account owner after accepted/merged `02E`.
- **Action:** Open **R2 Object Storage → Overview → Create bucket**. Name it `bestehen-staging-runtime`, choose Standard storage, select **Specify jurisdiction → European Union (`eu`)**, and keep public development URL/custom domain disabled.
- **Expected result:** the bucket details show jurisdiction `eu`, Standard, and no public access.
- **How to verify:** inspect bucket details and use the jurisdiction endpoint with a read-only bucket-head/list operation. A default endpoint must not be accepted as EU proof.
- **Evidence:** resource class, `jurisdiction=eu`, `storage=Standard`, `public=false`, date, and redacted result.
- **Rollback:** while empty, delete and recreate on a wrong immutable jurisdiction; once data exists, freeze writes, export/verify/delete duties, then remove.
- **NEVER PASTE HERE:** account ID, endpoint with account ID, bucket token, access key, secret, object name, owner identity, or dashboard export.

### `R2-02` — Create the EU backup bucket

- **Owner:** Cloudflare account owner.
- **Action:** Repeat the exact jurisdiction/storage selection for `bestehen-staging-backup`. Keep it private and configure no browser CORS or runtime credential.
- **Expected result:** a separate EU Standard bucket exists and cannot be reached by the runtime identity.
- **How to verify:** read bucket details; later require runtime cross-bucket access to fail.
- **Evidence:** resource class, jurisdiction/storage/public state, separation result, and date.
- **Rollback:** delete only while empty or after verified archive retention/export permits it; do not remove recovery evidence casually.
- **NEVER PASTE HERE:** account/bucket IDs, archive/object locator, credentials, encrypted archive, or private key.

### `R2-03` — Create bucket-scoped credentials

- **Owner:** Cloudflare account owner in **R2 → Manage API Tokens**.
- **Action:** Create distinct Object Read & Write credentials limited to the runtime bucket and backup bucket. Use a temporary administrative path only if the dashboard cannot create the required configuration, then revoke it. Create read-only exit/audit access only for a bounded export drill and revoke it afterward.
- **Expected result:** each credential can list/read/write only its assigned bucket; it cannot administer buckets or cross the boundary.
- **How to verify:** synthetic put/head/get/delete in the allowed bucket, denied list/head in the other bucket, and revoked-credential denial.
- **Evidence:** credential class, allowed/denied operation classes, checked date, and redacted result. Record no credential or account identifier.
- **Rollback:** disable the adapter, create/verify a replacement, revoke the old credential, and verify failure.
- **NEVER PASTE HERE:** token, access key ID, secret access key, account ID, signed URL, object key, request/response body, or CLI history.

### `R2-04` — Configure prefixes, CORS, and presigning

- **Owner:** Cloudflare owner plus App operations owner.
- **Action:** Reserve runtime prefixes `media/approved/`, `audio/raw/`, `exports/`, and `tmp/`; backup prefixes `postgres/daily/`, `postgres/weekly/`, and `recovery-sentinel/`. Configure runtime CORS for exactly `https://staging.<owner-domain>`, methods `GET`, `HEAD`, `PUT`, required content/checksum headers, and exposed `ETag`. Configure no wildcard, browser `DELETE`, credentialed other origin, or backup CORS.
- **Expected result:** allowed-origin presigned operations work; an unlisted origin and browser delete fail. Object names are opaque IDs/digests.
- **How to verify:** one synthetic CORS preflight/put/head/get/delete using a ≤5-minute URL and one unlisted-origin negative preflight. Never log the URL.
- **Evidence:** method/header/origin classes, expiry bound, result, cleanup state, and fixture digest.
- **Rollback:** remove the CORS rule and revoke outstanding signing access; wait for issued URLs to expire before treating access as closed.
- **NEVER PASTE HERE:** owner origin/domain, presigned URL/query, object key, headers carrying signatures, token, or uploaded bytes.

### `R2-05` — Configure lifecycle and deletion boundaries

- **Owner:** Cloudflare owner.
- **Action:** Add lifecycle backstops: incomplete multipart and `tmp/` after one day, `exports/` after one day, and `audio/raw/` after seven days. Keep immediate application deletion as the primary raw-audio/export behavior. Do not enable Object Lock for delete-sensitive data and do not claim S3 bucket versioning—R2 does not provide that API.
- **Expected result:** rules show the exact prefix/age policy; immutable key+digest+manifest supplies application versioning.
- **How to verify:** inspect lifecycle configuration and, at the later checkpoint, use a synthetic aged fixture/absence check within the provider's documented execution window.
- **Evidence:** prefix/age classes, rule state, absence result, checked date, and no object locator.
- **Rollback:** remove a wrong rule before data use; a corrective rule never substitutes for restoring incorrectly deleted data.
- **NEVER PASTE HERE:** object names/content, account/bucket identifiers, deletion request IDs, raw audio, transcript, or export.

### `R2-06` — Configure budget and backup separation

- **Owner:** billing/recovery owner.
- **Action:** Set owner-chosen Cloudflare billing alerts and protected recipients. Give the later backup uploader only the backup-bucket credential and encryption public key; keep the decryption private key offline. Web/worker must have no backup-bucket list/read permission.
- **Expected result:** alerts exist; runtime cross-bucket access fails; one encrypted synthetic recovery sentinel can be uploaded and cleaned up.
- **How to verify:** dashboard alert state, negative access tests, and a later sentinel put/head/delete with no plaintext or object locator in evidence.
- **Evidence:** `budget_alert=verified`, recipient owner role, cross-bucket denial, sentinel digest, cleanup, and date.
- **Rollback:** disable uploader, revoke its credential, and preserve policy-required encrypted archives; rotate if exposure is suspected.
- **NEVER PASTE HERE:** thresholds if owner treats them as private, billing/contact detail, key material, archive, sentinel bytes/key, or object URL.

### `R2-07` — Verify exit and cleanup

- **Owner:** operations owner.
- **Action:** With a temporary read-only credential, freeze the scoped prefix, inventory count/size/digests, copy to a validated S3-compatible target, verify totals/sample, repoint the provider-neutral adapter, then revoke the temporary token. Preserve deletion/rights overlays.
- **Expected result:** provider change affects configuration only; semantic App IDs and manifest digests do not change.
- **How to verify:** compare count/digest summaries and prove the revoked token fails. Do not use a public bucket as an export shortcut.
- **Evidence:** aggregate count/size, manifest digest, result, cleanup/revocation state, and date.
- **Rollback:** return the adapter to the verified predecessor while both copies remain protected; delete neither until duties are checked.
- **NEVER PASTE HERE:** key list, object/body sample, credential, account ID, target URL, learner identifier, or source expression.
