# Personal implementation program

## Target profile

Deliver a production-quality private release for one owner, while retaining clean seams for later commercialization.

- One responsive Next.js web application and one background worker.
- Coolify controls deployment to the connected application VM; PostgreSQL and persistent services remain private on the LAN.
- Pangolin provides external ingress/resource routing. Do not assume Cloudflare manages authoritative DNS merely because R2 is used.
- Cloudflare R2 stores private objects through presigned application flows.
- Auth0 EU Universal Login with email OTP is mandatory; registration is closed to the owner's allowlisted identity.
- Commercial AI APIs provide model, speech-to-text, and text-to-speech capabilities through replaceable adapters.
- GitHub is the delivery system of record.
- No native mobile application and no PWA-installability project.

Record this as a deployment-profile implementation decision. Preserve provider-neutral ports, app-owned IDs, data portability, and guest/account-optional contracts behind disabled flags so the commercial pack can migrate without a rewrite.

## Sequential stages

1. **Repository and delivery baseline** — pin the approved stack, scaffold the monorepo, CI, quality gates, local fake environment, and personal-profile decision record.
2. **Provider accounts and service setup** — produce verified owner guides and configuration contracts for GitHub, Coolify, Pangolin, R2, Auth0, SES/email, AI/speech providers, backups, budgets, and secrets.
3. **Domain, data, jobs, identity, and authorization foundation** — implement exact contracts, PostgreSQL/Kysely migrations, pg-boss, release registry, owner authorization, sessions, audit, and idempotency.
4. **Responsive web and Design system foundation** — implement tokens, self-hosted assets, accessible shells, route/state anchors, 43 components, 20 icons, and representative compact/large layouts.
5. **Content and deterministic learning runtime** — implement approved content ingestion, attempts, objective scoring, Reading, Language Elements, Listening, evidence capture, and foundation navigation.
6. **Writing, Speaking, AI, and private-object pipelines** — implement durable editors/capture, R2 upload/download, asynchronous STT/evaluation/TTS, governance, deletion, fallback, and cost receipts.
7. **Learner model, coaching, review, progression, and evidence views** — implement the weakness lifecycle, planning/override reasons, review scheduling, progression, Progress, and transparent recommendations.
8. **Mocks, readiness, and Ready-to-Book** — implement P4 inventory qualifiers, written/oral mocks, six readiness states, Gates A–F, calibration versions, and evidence panels without pass probabilities.
9. **Account, data rights, recovery, offline, and notifications** — implement sessions, recent auth, export, deletion, restore suppression, WAL/checkpoints/conflict recovery, and timezone-safe notifications.
10. **Coolify deployment and personal release acceptance** — deploy the compatible web/worker/database topology, connect Pangolin and providers, prove health/backups/restore/observability, and run the final acceptance suite.

For each number, run `NNP` to acceptance before `NNE`. Do not run stages concurrently.

## Completion definition

The personal program is complete only when all ten Execution rows are independently verified, the application is reproducibly deployable on the documented Coolify topology, all non-secret owner setup steps are documented, required owner gates are truthfully marked, and a final release manifest maps the shipped commit to schema, content, prompt/model, Design, and operations versions.
