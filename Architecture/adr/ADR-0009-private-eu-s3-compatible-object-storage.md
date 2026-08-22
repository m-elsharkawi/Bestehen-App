# ADR-0009 — Private EU S3-compatible object storage

> **Status:** Accepted
> **Owner:** Stage 03
> **Date:** 2026-08-23
> **Decision IDs:** `ARCH-S03-D04`
> **Supersedes / superseded by:** None

## Context

Bestehen needs rights-approved static/listening media and short-lived productive processor inputs without making raw audio durable learner truth. Process filesystems are ephemeral and database byte storage would mix large objects with evidence transactions/backups. Object metadata, rights/lifecycle state and checksums must remain App-owned and portable.

Current inputs are App `main@b8924677b0750e6507f9e50467dbd69465c94a64`, final product blob `18ae80cc2fd63cecd76c297c3e56d44a68367856`, business-boundary blob `904ae20e8cb3f9f354d6505513821e86f609622b`, nonfunctional blob `8137091683941b0d55f3d4fb90af3c402b8371e5` and Stage 02 blob `046d114bbbc96528bf0b9eae0406c0235f759127`.

Cloudflare's official [R2 pricing](https://developers.cloudflare.com/r2/pricing/) lists the Standard free allowance and usage rates; [data-location guidance](https://developers.cloudflare.com/r2/reference/data-location/) provides immutable EU jurisdiction buckets; the [S3 API](https://developers.cloudflare.com/r2/api/s3/api/) lists its compatibility subset; buckets are [private by default](https://developers.cloudflare.com/r2/buckets/public-buckets/); and [presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls) are bearer capabilities. Sources were accessed 2026-08-23.

## Decision

Use one private Cloudflare R2 Standard bucket created with EU jurisdiction, accessed only through an App-owned minimal S3-compatible port. PostgreSQL owns object metadata, learner/content association, rights status, lifecycle/deletion state and checksums. Use opaque/versioned keys, scoped server credentials, short-lived signed URLs and the tested common S3 subset. No public bucket, bucket event or object presence is semantic truth.

Approved content media may be content-addressed and retained while rights/version policy permits. Raw learner audio is purpose-bound and ephemeral: store only for the deliberate processor job, exclude from logs/general backups, then delete after accepted result or terminal failure window. Stages 18/23 set the exact TTL and prove deletion/access behavior.

## Alternatives

- **Bundle all media with application:** cheapest and simple for small rights-approved static assets, and retained as a fallback, but unsuitable for short-lived uploads or independently revised media.
- **Render persistent disk:** provider-coupled, single-service attached and not a durable multi-process object interface.
- **AWS S3:** mature and portable target but currently less attractive for the tiny baseline because R2 lists a useful free allowance and no R2 egress fee.
- **Store bytes in PostgreSQL:** transactional, but inflates evidence backups and database load without a product need.

## Consequences

The current R2 Standard allowance is 10 GB-month, 1 million Class A and 10 million Class B operations monthly; listed overage is USD 0.015/GB-month, USD 4.50/million Class A and USD 0.36/million Class B. These mutable USD prices are not a budget and are rechecked before provisioning.

R2 S3 compatibility is incomplete, so contract tests forbid unsupported features. EU jurisdiction is a deployment configuration claim, not a legal-compliance claim. Object storage does not replace backup; approved originals must be reproducible/backed up under rights rules, and ephemeral learner audio intentionally may not be.

Exit enumerates PostgreSQL manifests/checksums and copies objects via the port to AWS S3, Backblaze B2 or MinIO-compatible storage. Dual-write only during a bounded migration and reconcile checksums before switching reads. At tiny scale, avoid persistent raw media and bundle small approved static assets. Review if storage/operations exceed the free allowance for three months, object cost exceeds 25% of monthly infrastructure, region/terms/security/SLO fails, or portable contract tests fail.

## Validation and review trigger

Stages 09/10 own content/rights/manifests; Stages 16–19 own media/job behavior; Stage 23 owns scoped credentials, signed-URL threat model and raw-audio TTL/deletion; Stage 25 owns storage-port contract tests; Stage 26 owns lifecycle, inventory/checksum, backup and provider-copy drill.

Supersession must preserve immutable content lineage, rights blocks, object/checksum reconciliation and deletion evidence. A provider feature may not be adopted if it prevents the tested exit without a new ADR.

## Traceability

- Product/design sources: `app/28-bestehen-app-product-specification.md`; `app/25-business-model-and-product-boundaries.md`; `app/26-platform-accessibility-nonfunctional.md`; `Architecture/02-system-context-and-product-boundaries.md`
- Owning stage output: `Architecture/03-technology-stack-and-repository-strategy.md` §§4.4, 6, 8–11
- Checklist items: Stage 03 items 3, 7–10, 11, 13–14, 18–21
- Related ADRs: ADR-0002, ADR-0004, ADR-0005, ADR-0008
