# Post-02E staging-readiness checkpoint

Last verified: **2026-08-23**. This checkpoint starts only after independent `02E`
acceptance and merge. It is not part of Stage 02 execution. It may create accounts,
DNS, resources, credentials, and bounded paid calls only with the named owner authority.

### `STAGE-01` — Enter the checkpoint safely

- **Owner:** orchestrator/operations owner.
- **Action:** Record the exact accepted 40-character merge commit; require a clean checkout, green mandatory CI, reviewed current provider terms/data handling, protected positive daily/rolling envelopes, authoritative-DNS access, and owner dashboard access. Run `pnpm check:providers`. Use authenticated connections where available; point the owner to dashboard-only step IDs and request only a redacted result.
- **Expected result:** every prerequisite is `verified` or the checkpoint stops with an exact `owner_pending` gate.
- **How to verify:** compare local/remote/PR/merge commit and validate the local protected receipt without printing it.
- **Evidence:** commit, CI/check URLs, schema version, aggregate statuses, and pending step IDs.
- **Rollback:** no live action begins until all entry gates pass; discard only the synthetic local receipt if invalid.
- **NEVER PASTE HERE:** receipt contents, credential, owner identity/domain, private address/URL, terms/billing detail, or dashboard screenshot.

### `STAGE-02` — Execute provider steps in dependency order

- **Owner:** owner for dashboard/DNS/spend; agent only for already authorized read/create calls.
- **Action:** Run `OPS-01`→`OPS-07`, `NET-01`→`NET-05`, `R2-01`→`R2-07`, `SES-01`→`SES-08`, `AUTH-01`→`AUTH-10`, `AI-01`→`AI-04`, then `AUDIO-01`→`AUDIO-05`. Keep `POLLY-01` represented by `AUDIO-05=not_admitted` unless an accepted benchmark exists.
- **Expected result:** private staging resources, least-privilege credentials, budget/retention controls, denials, cleanup, and redacted readiness states are complete; production access/product behavior remain closed.
- **How to verify:** use each step's exact positive and negative check. A dashboard badge alone is insufficient.
- **Evidence:** one schema-valid resource entry per final provider result, guide step, date, digest/reference, cleanup and rollback.
- **Rollback:** set flags false/select fakes first, then revoke credentials and remove callbacks/CORS/ingress/DNS in reverse dependency order; never delete before export/deletion duties.
- **NEVER PASTE HERE:** any value, private identifier/topology, provider payload, object/message/request ID, email, audio/transcript, prompt, or billing/legal record.

### `STAGE-03` — Deploy fake-first and run bounded resource smokes

- **Owner:** orchestrator/operations owner after owner configuration.
- **Action:** Deploy the exact accepted commit with fake adapters and all external/paid flags false. Verify health/fake contracts. Only then set staging protected configuration for one named resource smoke at a time. Any executable live smoke requires `BESTEHEN_LIVE_SMOKE=1`, `BESTEHEN_APP_ENV=staging`, exact provider/capability, clean 40-character commit, provider and App envelope verification, and the documented maximum one call/create + one verification read + one cleanup. Normal CI never sets this opt-in.
- **Expected result:** fake-first service is healthy; each admitted resource smoke is synthetic, bounded, cleaned, redacted, and returns flags to false.
- **How to verify:** run `pnpm check:providers`, then use the named guide step's exact preflight and bounded resource check. Stage 02 supplies no provider adapter or general live-smoke runner.
- **Evidence:** provider/capability, commit, result class, region/model, bounded usage/latency, cleanup, step ID, and digest—never content or identifiers.
- **Rollback:** cleanup in `finally`, set flags false, select fakes, revoke temporary access, and verify unrelated readiness.
- **NEVER PASTE HERE:** environment, secret, URL/account/object/message/request ID, owner email, audio/transcript/text, provider body, or exact private cost envelope.

### `STAGE-04` — Verify recovery and close the checkpoint

- **Owner:** recovery/security/operations owner.
- **Action:** Verify private PostgreSQL reachability, encrypted synthetic recovery sentinel, backup separation, configuration/readiness schema, secret scan, budgets, cleanup, revoked temporary credentials, and rollback. Do not call a sentinel upload an App/database restore.
- **Expected result:** a schema-valid redacted receipt identifies every `verified`, `owner_pending`, `failed`, or `not_admitted` resource honestly.
- **How to verify:** run `pnpm check`, `pnpm check:advisories`, `pnpm check:providers -- --receipt <protected-local-path>`, health/fake contracts, and negative access tests.
- **Evidence:** exact commit, gate/check IDs, receipt digest/reference, status counts, cleanup/rollback and named later blockers.
- **Rollback:** leave affected provider fake/disabled and block only its later live-dependent stage; unrelated deterministic work may continue.
- **NEVER PASTE HERE:** receipt body/path if sensitive, backup/sentinel/object locator, database details, secrets, identities, provider responses, or logs.

## Later exact-commit recurrence

After each independently accepted `03E`–`09E`, deploy that exact commit to the same
private staging environment and run only its relevant bounded live scope: identity and
authorization (`03E`); hosted-login/ingress accessibility (`04E`); private R2
approved-object flow (`05E`); Gemini/STT/TTS and raw-audio deletion (`06E`);
candidate-to-evidence/outage fallback (`07E`); provider-fault Readiness truth (`08E`);
and session/email/export/deletion/restore suppression (`09E`). Deterministic fakes
remain mandatory CI and a live failure never weakens them.
