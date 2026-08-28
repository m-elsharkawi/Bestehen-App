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
- [x] 01E Execution accepted — evidence: `Implementation/Personal/01-repository-delivery-baseline/handoff.md`; [PR #1 acceptance comment](https://github.com/m-elsharkawi/Bestehen-App/pull/1#issuecomment-5388049241); reviewed head `b38129a4ff01c23a6484adf05f2c682bd8b3076c`; final [PR run 32661191970](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32661191970) and [push run 32661190079](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32661190079); `P01-BASE-001`, `P01-SCOPE-001`, `P01-DEPS-001`, `P01-BOUNDARY-001`, `P01-TYPE-001`, `P01-STYLE-001`, `P01-UNIT-001`, `P01-CONFIG-001`, `P01-SECRET-001`, `P01-PG-001`, `P01-JOB-001`, `P01-HTTP-001`, `P01-A11Y-001`, `P01-OCI-WEB-001`, `P01-OCI-WORKER-001`, `P01-RELEASE-001`, `P01-DOC-001`
- [ ] Approved stack, package boundaries, exact lock/runtime versions, containers, and CI gates are reproducible.
- [ ] Personal deployment-profile decision preserves provider and commercial exit seams.

## 02 — Provider accounts and service setup

- [x] 02P Planning accepted — evidence: `Implementation/Personal/02-provider-service-setup/plan.md`; [PR #3 acceptance comment](https://github.com/m-elsharkawi/Bestehen-App/pull/3#issuecomment-5388249271); reviewed Planning head `b62d8b98869a7cd4dcd23ee0206575d3952afd20`; [CI run 32663751573](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32663751573); `P02-PLAN`
- [x] 02E Execution accepted independently — evidence: `Implementation/Personal/02-provider-service-setup/handoff.md`; [acceptance comment](https://github.com/m-elsharkawi/Bestehen-App/pull/3#issuecomment-5388485710); [draft PR #3](https://github.com/m-elsharkawi/Bestehen-App/pull/3); accepted candidate `241b8a2828680a40b399c0be7f2863a76fa097f5`; [push CI 32666424947](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32666424947); [PR CI 32666427818](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32666427818); `P02-SCOPE-001`, `P02-DOC-001`, `P02-CONFIG-001`, `P02-FAKE-001`, `P02-SECRET-001`, `P02-READINESS-001`, `P02-DEPS-001`, `P02-COMPAT-001`
- [ ] GitHub, Coolify, Pangolin, R2, Auth0, SES, AI/STT/TTS, secrets, budget, backup, and recovery guides are verified.
- [ ] Configuration schemas and fake contracts pass without live accounts; manual gates are named honestly.

## 03 — Domain, data, jobs, identity, and authorization foundation

- [x] 03P Planning accepted independently — evidence: `Implementation/Personal/03-domain-data-jobs-auth/plan.md`; [acceptance comment](https://github.com/m-elsharkawi/Bestehen-App/pull/6#issuecomment-5415174964); [draft PR #6](https://github.com/m-elsharkawi/Bestehen-App/pull/6); accepted candidate `f9ecffbcab50d3bfb56bad5ac5e77c92433ee36c`; [PR CI 32885875771](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32885875771); `P03-PLAN`
- [x] 03E Execution accepted independently — evidence: `Implementation/Personal/03-domain-data-jobs-auth/handoff.md`; [acceptance comment](https://github.com/m-elsharkawi/Bestehen-App/pull/6#issuecomment-5416194745); [draft PR #6](https://github.com/m-elsharkawi/Bestehen-App/pull/6); accepted candidate `94143635cf0cb43f78cccbe591254ea8c34eb938`; [PR CI 32894038906](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/32894038906); `P03-DOMAIN-001`, `P03-SCHEMA-001`, `P03-IDEMPOTENCY-001`, `P03-JOB-001`, `P03-EVIDENCE-001`, `P03-IDENTITY-001`, `P03-SESSION-001`, `P03-AUTHZ-001`, `P03-CONTRACT-001`, `P03-AUDIT-001`, `P03-COMPAT-001`, `P03-SCOPE-001`
- [ ] Canonical states/reasons, PostgreSQL migrations, pg-boss jobs, evidence ledger, audit, and release registry pass invariant tests.
- [ ] Auth0 owner boundary and server authorization fail closed under malformed and cross-user tests.

## 04 — Responsive web and Design system foundation

- [x] 04P Planning accepted — evidence: `Implementation/Personal/04-responsive-web-design-system/plan.md`; Planning candidate `75b7eb7b9d1384636f6682288d75db154ecaaf77`; [independent acceptance](https://github.com/m-elsharkawi/Bestehen-App/pull/10#issuecomment-5430499424); exact-head CI run `33008044569`; `P04-PLAN`, 43 component-family rows, 37 board-anchor rows, `git diff --check`, `pnpm format:check`, `pnpm check:scope`, `pnpm check:secrets`, `pnpm check:docs`
- [x] 04E Execution accepted — evidence: `Implementation/Personal/04-responsive-web-design-system/handoff.md`; [PR #11](https://github.com/m-elsharkawi/Bestehen-App/pull/11); accepted code candidate `8b955c077546513dfc21bacc5b379c97b54b297c`; [independent acceptance](https://github.com/m-elsharkawi/Bestehen-App/pull/11#issuecomment-5444442768); exact-head runs [`33109916283`](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/33109916283) and [`33109918908`](https://github.com/m-elsharkawi/Bestehen-App/actions/runs/33109918908); `P04-TOKEN-001`, `P04-ASSET-001`, `P04-COVERAGE-001`, `P04-COMPONENT-001`, `P04-SEMANTIC-001`, `P04-ROUTE-001`, `P04-A11Y-001`, `P04-RSP-001`, `P04-VISUAL-001`, `P04-SECURITY-001`, `P04-PERF-001`, `P04-COMPAT-001`, `P04-SCOPE-001`; 183 unit tests and 55 browser checks passed with two expected visual-only skips; private Coolify web, worker, and migrator deployments used the exact accepted code commit; the bounded Auth0 callback passed; cleanup visibly restored the web Auth adapter to fake and external-provider calls to false before the final successful redeployment; no secret or private endpoint was recorded
- [x] Source-anchor manifest covers 43 components, 20 icons, 41 compact frames, and eight large-screen exemplars.
- [x] Self-hosted asset provenance and automated responsive WCAG test evidence are accepted; live viewport/zoom and branded assistive-technology runs remain explicitly unclaimed because the connector could not exercise them.

## 05 — Content and deterministic learning runtime

- [x] 05P Planning accepted independently — evidence: `Implementation/Personal/05-content-deterministic-runtime/plan.md`; Planning commit `d56adbe4da38040454362aeb7fdcdf3bfd6f15c0`; baseline `009d2c62fbc45b4084d8778716705ce57d54f442` on local `main`, which is ahead of a stale `origin/main` `c966c4b4d143150c5396d57f41fe9d803f0689bf` and carries the Stage 04 follow-up corrections; `P05-PLAN`. Orchestrator verification re-derived the plan's four repository findings from source (`check-design-coverage-ids.mjs:1` hardcodes `P04-`; `checkSchemaCompatibility` skips checksum verification off `foundationRevision`; `migrationChecksums` omits the `seed` callback; `assertSemanticUnionParity` is order-sensitive) and rejected a first submission for four defects since corrected: the `app.attempts` state reconciliation undercounted six new states and left `not_counted` without a data disposition; D06 overclaimed fidelity to the sixteen-state `Architecture/15` diagram while implementing eleven; the Corpus boundary proof omitted the outbound serialization guard and the zero-bytes fixture that `Architecture/10-…:430` specifies, now `P05-BOUNDARY-001`; and the proposed parallel execution waves were replaced by a serial order. No pull request was opened and `main` was not pushed, because the owner is holding GitHub Actions spend
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
