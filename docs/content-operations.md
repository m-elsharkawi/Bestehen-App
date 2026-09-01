# Content seed operations

The Stage 05 seed tool validates and plans the typed C3 release without importing the content
package into infrastructure. `packages/content/src/seed/release.json` is the package-neutral handoff.
The CLI checks publication results, rights, accessibility, immutable identities, successors, and
release pointers.

The current CLI applies plans to an explicit catalogue state file. This is the deterministic local
and CI path for `P05-SEED-001`. It does not claim that rows were written to PostgreSQL. A database
adapter may consume the same plan later, but it must preserve the report and identity rules below.

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

## Apply and replay locally

Remove `--dry-run` to commit a successful plan to the catalogue state file:

```sh
pnpm exec tsx packages/infrastructure/src/content/seed-cli.ts \
  --state .local/content-seed/catalogue.json \
  --report .local/content-seed/apply-report.json \
  --operation-id seed-apply-20260901 \
  --occurred-at 2026-09-01T12:05:00.000Z
```

Run the same release again with a new operation ID. The report must say `0 created`,
`0 superseded`, and `16 unchanged`. The catalogue content remains unchanged.

## Change a published artifact

Never edit meaning behind an existing revision ID. For a material seed change:

1. Give the successor a new `seedKey`.
2. Set `predecessorSeedKey` to the prior seed key in the artifact builder.
3. Regenerate `release.json`.
4. Run a dry run against the current catalogue.
5. Confirm that the exact family reports `supersede` and names the active revision in
   `currentRevisionId`.

Reusing an existing revision ID with a different digest fails with
`immutable_revision_changed`. Publishing a different digest behind an existing release ID fails
with `immutable_release_changed`. A new family revision that omits the active predecessor fails with
`successor_predecessor_missing`.

## Withdraw or quarantine

Both commands require an exact active family, revision, or seed-key selector and a reason. The
selector must resolve to one active revision.

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

The listening seed stores reviewed German scripts and deterministic PCM WAV fixture manifests.
The fake renderer emits a short integer waveform. It is not speech. Do not play it to learners and
do not promote it to Independent-B1, Readiness/P4, or Gold. T5 owns the final media model, object
authorization, playback routes, and final media tests.

No command in this guide calls a live synthesis service or another productive provider.

## Owner gates

These gates remain open:

- `OWNER-05-A`: live German voice audition, synthesis, and human audit of final speech bytes
- `OWNER-05-B`: human sign-off for a complete P4 form and its final assets
- `OWNER-05-C`: independent blind solution and key validation by a distinct reviewer

Until those records exist, the serving seed requests Training approval only. The tool must not
promote a seed merely because its automated gates pass.
