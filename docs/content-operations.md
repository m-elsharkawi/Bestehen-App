# Content seed operations

The Stage 05 seed tool validates and applies the typed C3 draft corpus without importing the content
package into infrastructure. `packages/content/src/seed/release.json` is the package-neutral handoff.
It contains the complete family, revision, learner payload, item, server-only key, rights,
accessibility, recorded-gate and audio-fixture graph. The CLI validates the nested graph before it
plans or writes anything.

No seed in this release has completed independent key validation or launch human review. The
sixteen authored candidates therefore remain `draft`/database `candidate` rows and are not eligible
for Training selection. The release records no approval command. Structural derivation proves
associations and cardinalities; it is not a reviewer.

Use the pinned repository toolchain for every command:

```sh
export PATH=/Users/sharkawi/Developer/Bestehen/.toolchains/node-v24.19.0-darwin-arm64/bin:$PATH
```

Do not place credentials, learner data, copied source material, or private object URLs in release,
state, or report files.

## Regenerate and verify the release document

Run this only after reviewing a typed seed change:

```sh
pnpm exec tsx packages/content/src/seed/generate-release.ts
pnpm exec vitest run packages/content/src/seed/index.test.ts packages/infrastructure/src/content/seed-cli.test.ts
```

The test compares `release.json` with the assembled TypeScript release. A manual edit to the JSON
does not pass.

## Dry run

Use a repository-ignored local directory for state and reports:

```sh
mkdir -p .local/content-seed
pnpm exec tsx packages/infrastructure/src/content/seed-cli.ts \
  --dry-run \
  --state .local/content-seed/catalogue.json \
  --report .local/content-seed/dry-run-report.json \
  --operation-id seed-review-20260901 \
  --occurred-at 2026-09-01T12:00:00.000Z
```

A missing state file means an empty catalogue. `--dry-run` never creates or changes the state file.
The command exits with status 1 when `summary.hardFailures` is non-zero.

The report schema is `bestehen-seed-validation-report/v1`. It contains:

- command, dry-run flag, operation ID, and recorded time
- release ID, release identity, canonical document digest, and prior active release ID
- one identity-keyed revision result with digest, predecessor, class, requested approval, action,
  rights evaluations, accessibility result, and all ordered publication gates
- counts for created, superseded, unchanged, withdrawn, quarantined, rolled back, and hard failures
- failures with a stable code, exact identity, and detail

## Apply to PostgreSQL

Use the migrator database credential convention. The URL may be passed explicitly or supplied as
`BESTEHEN_MIGRATOR_DATABASE_URL` (with `DATABASE_URL` as a local fallback):

```sh
pnpm exec tsx packages/infrastructure/src/content/seed-cli.ts \
  --database-url "$BESTEHEN_MIGRATOR_DATABASE_URL" \
  --report .local/content-seed/apply-report.json \
  --operation-id seed-apply-20260901 \
  --occurred-at 2026-09-01T12:05:00.000Z
```

The PostgreSQL adapter uses one transaction and parameterized statements to write rights envelopes,
accessibility manifests, content families and revisions, items, key revisions, recorded gate
results, the candidate release, and its entries. It does not write audio-provider rows; T5 owns the
media schema adapter and playback path. A database apply requires the Stage 05 migrations.

The adapter records an immutable operation receipt. Repeating the same operation ID with the same
canonical command returns the original committed report without another mutation. Reusing it with
a different release, selector, reason, or recorded time returns `idempotency_conflict` and changes
nothing. Keep operation IDs stable across transport retries.

## Apply and replay locally

Remove `--dry-run` to commit a successful plan to the catalogue state file:

```sh
pnpm exec tsx packages/infrastructure/src/content/seed-cli.ts \
  --state .local/content-seed/catalogue.json \
  --report .local/content-seed/apply-report.json \
  --operation-id seed-apply-20260901 \
  --occurred-at 2026-09-01T12:05:00.000Z
```

The state-file adapter exists for deterministic local and CI tests. It has the same operation-receipt
rules as PostgreSQL. Repeating the exact command with the same operation ID returns the first
committed report; a new operation ID produces the current-state plan (normally 16 unchanged).

## Change a published artifact

Never edit meaning behind an existing revision ID. For a material seed change:

1. Give the successor a new `seedKey`.
2. Set `predecessorSeedKey` to the prior seed key in the artifact builder.
3. Bump `seedReleaseVersion` in `builders.ts` so the new document receives a new immutable release
   ID.
4. Regenerate `release.json`.
5. Run a dry run against the current catalogue.
6. Confirm that the exact family reports `supersede` and names the active revision in
   `currentRevisionId`.

Reusing an existing revision ID with a different digest fails with
`immutable_revision_changed`. Publishing a different digest behind an existing release ID fails
with `immutable_release_changed`. A new family revision that omits the active predecessor fails with
`successor_predecessor_missing`.

## Withdraw or quarantine

Both commands require an exact active family, revision, or seed-key selector and a reason. The
selector must resolve to one active revision. Replace `--state ...` with `--database-url ...` to
operate on PostgreSQL.

```sh
pnpm exec tsx packages/infrastructure/src/content/seed-cli.ts \
  --state .local/content-seed/catalogue.json \
  --withdraw r1-family-id-from-the-report \
  --reason "rights use withdrawn by recorded decision" \
  --operation-id seed-withdraw-20260901 \
  --occurred-at 2026-09-01T12:10:00.000Z \
  --report .local/content-seed/withdraw-report.json
```

```sh
pnpm exec tsx packages/infrastructure/src/content/seed-cli.ts \
  --state .local/content-seed/catalogue.json \
  --quarantine revision-id-from-the-report \
  --reason "confirmed ambiguity in one keyed item" \
  --operation-id seed-quarantine-20260901 \
  --occurred-at 2026-09-01T12:15:00.000Z \
  --report .local/content-seed/quarantine-report.json
```

Withdrawal and quarantine stop future selection in the catalogue snapshot. They do not rewrite an
attempt, score, key, or validity assertion. A rights-only withdrawal is a serving disposition. It
does not turn past performance into negative evidence.

## Roll back a content release

Rollback selects a prior recorded release. It does not delete the newer release or retarget past
attempts:

```sh
pnpm exec tsx packages/infrastructure/src/content/seed-cli.ts \
  --state .local/content-seed/catalogue.json \
  --rollback prior-release-id \
  --reason "operator selected the prior approved content release" \
  --operation-id seed-rollback-20260901 \
  --occurred-at 2026-09-01T12:20:00.000Z \
  --report .local/content-seed/rollback-report.json
```

This is content rollback only. A Stage 05 application image rollback to Stage 04 also requires a
database restore to the Stage 03 revision. An image-only rollback is not sufficient because the
older runtime cannot verify the Stage 05 migration set.

## Fake audio limitation

The listening seed stores authored, unreviewed German draft scripts and deterministic PCM WAV
fixture manifests.
The fake renderer emits a short integer waveform. It is not speech. Do not play it to learners and
do not promote it to Independent-B1, Readiness/P4, or Gold. T5 owns the final media model, object
authorization, playback routes, and final media tests.

No command in this guide calls a live synthesis service or another productive provider.

## Owner gates

These gates remain open:

- `OWNER-05-A`: live German voice audition, synthesis, and human audit of final speech bytes
- `OWNER-05-B`: human sign-off for a complete P4 form and its final assets
- `OWNER-05-C`: independent blind solution and key validation by a distinct reviewer

There is also a separate launch human-review requirement from Architecture 09 §5.1. It is not an
owner claim and has not happened. Until independent key validation and launch review are recorded,
the corpus stays draft/candidate and the tool refuses a Training-bearing release. OWNER-05-A,
OWNER-05-B and OWNER-05-C remain unclaimed.
