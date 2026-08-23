# Personal implementation checklist

This is the live, authoritative progress ledger for the personal program. Workers update only their current stage. The orchestrator changes a line to `[x]` only after independent verification.

## Program gates

- [ ] Personal deployment-profile decision is recorded without erasing commercial architecture.
- [ ] No secrets, recordings, private data, or provider credentials are present in Git history or build artifacts.
- [ ] No native mobile application or PWA-installability scope has been introduced.
- [ ] All required owner actions have dated, tested, step-by-step guides and explicit verification checks.
- [ ] Final release manifest and personal operations handoff are accepted.

## 01 — Repository and delivery baseline

- [x] 01P Planning accepted — evidence: `Implementation/Personal/01-repository-delivery-baseline/plan.md`; [PR #1 acceptance comment](https://github.com/m-elsharkawi/Bestehen-App/pull/1#issuecomment-5387482785); Planning commit `233eb0c84e092e5bdda88a1f3692bd41ddc07d3e`; `P01-PLAN`
- [~] 01E Execution pending orchestrator acceptance — evidence: `Implementation/Personal/01-repository-delivery-baseline/handoff.md`; [draft PR #1](https://github.com/m-elsharkawi/Bestehen-App/pull/1); [passing implementation run 32659599740](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32659599740); candidate `58e93774eb62dcd9c5f26c66403fc4292759e689`
- [ ] Approved stack, package boundaries, exact lock/runtime versions, containers, and CI gates are reproducible.
- [ ] Personal deployment-profile decision preserves provider and commercial exit seams.

## 02 — Provider accounts and service setup

- [ ] 02P Planning accepted — evidence: pending
- [ ] 02E Execution accepted — evidence: pending
- [ ] GitHub, Coolify, Pangolin, R2, Auth0, SES, AI/STT/TTS, secrets, budget, backup, and recovery guides are verified.
- [ ] Configuration schemas and fake contracts pass without live accounts; manual gates are named honestly.

## 03 — Domain, data, jobs, identity, and authorization foundation

- [ ] 03P Planning accepted — evidence: pending
- [ ] 03E Execution accepted — evidence: pending
- [ ] Canonical states/reasons, PostgreSQL migrations, pg-boss jobs, evidence ledger, audit, and release registry pass invariant tests.
- [ ] Auth0 owner boundary and server authorization fail closed under malformed and cross-user tests.

## 04 — Responsive web and Design system foundation

- [ ] 04P Planning accepted — evidence: pending
- [ ] 04E Execution accepted — evidence: pending
- [ ] Source-anchor manifest covers 43 components, 20 icons, 41 compact frames, and eight large-screen exemplars.
- [ ] Self-hosted asset provenance and responsive WCAG test evidence are accepted.

## 05 — Content and deterministic learning runtime

- [ ] 05P Planning accepted — evidence: pending
- [ ] 05E Execution accepted — evidence: pending
- [ ] Versioned content publication/withdrawal and shared attempt/evidence recovery pass compatibility tests.
- [ ] Reading, Language Elements, and Listening complete end to end without live Corpus or productive AI.

## 06 — Writing, Speaking, AI, and private-object pipelines

- [ ] 06P Planning accepted — evidence: pending
- [ ] 06E Execution accepted — evidence: pending
- [ ] Writing draft/conflict and Speaking capture/evaluation/recovery flows pass functional and accessibility tests.
- [ ] Private-object authorization, model acceptance, job idempotency, cost receipts, and raw-audio deletion are proven.

## 07 — Learner model, coaching, review, progression, and evidence views

- [ ] 07P Planning accepted — evidence: pending
- [ ] 07E Execution accepted — evidence: pending
- [ ] Evidence-to-fact-to-weakness-to-plan-to-review-to-progression lifecycle is deterministic and auditable.
- [ ] Reasons, overrides, corrections, freshness, and projection rebuild equivalence are proven.

## 08 — Mocks, readiness, and Ready-to-Book

- [ ] 08P Planning accepted — evidence: pending
- [ ] 08E Execution accepted — evidence: pending
- [ ] Written/Oral mocks, P4 qualifiers, six readiness states, and Gates A–F pass versioned oracle tests.
- [ ] No API, copy, chart, telemetry field, or test contract claims a pass probability.

## 09 — Account, data rights, recovery, offline, and notifications

- [ ] 09P Planning accepted — evidence: pending
- [ ] 09E Execution accepted — evidence: pending
- [ ] Session/recent-auth and full source-cut export ZIP/golden/expiry behavior are proven.
- [ ] Revoke-first deletion, provider-pending reconciliation, restore suppression, WAL/conflicts, interruption, and timezone notifications pass drills.

## 10 — Coolify deployment and personal release acceptance

- [ ] 10P Planning accepted — evidence: pending
- [ ] 10E Execution accepted — evidence: pending
- [ ] Exact-commit Coolify/Pangolin release, health, provider configuration, alerts, and rollback pass acceptance.
- [ ] PostgreSQL backup/restore, deletion suppression, cost envelope, and final release manifest/tag are proven.

## Final audit

- [ ] Every `[x]` line links to a merged commit/PR, durable repository evidence, and relevant test/check IDs.
- [ ] Design coverage includes 43 components, 20 icons, 41 compact responsive-web frames, and eight large-screen exemplars or a documented architecture-consistent reason for a derived variant.
- [ ] Auth0 OTP, server authorization, session revocation, export, deletion/restore suppression, audio deletion, draft conflict, and session-expiry acceptance tests pass.
- [ ] Coolify rollback and PostgreSQL restore have been rehearsed without exposing deleted/suppressed data.
- [ ] Live-provider smoke tests and spend limits are verified without storing secrets in evidence.
- [ ] The personal release is tagged from the exact accepted commit.
