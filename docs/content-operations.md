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

## Offline Listening media catalogue

`apps/worker/src/media-import.ts` exports `importCommittedSeedMedia(pool, operationId)`. It is an
explicit offline operation, not a registered worker job or startup hook. Apply the original T6 draft
release first using the existing seed command. The database must be migrated through the Stage 05
terminal revision `20260905_062_p05_listening_runtime`; this operation does not migrate it.

After building the workspace packages, an operator can invoke the composition with an already
configured database URL. Use an isolated local database for rehearsal, never the owner's retained
upgrade database:

```sh
pnpm --filter @bestehen/worker exec node --import=tsx --input-type=module -e '
import { createPostgresPool } from "@bestehen/infrastructure";
import { importCommittedSeedMedia } from "./src/media-import.ts";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const pool = createPostgresPool(url);
try {
  const result = await importCommittedSeedMedia(pool, "offline-media-catalogue-v1");
  console.log(JSON.stringify(result));
} finally {
  await pool.end();
}
'
```

The pure `prepareCommittedSeedMediaImport()` builds all 22 committed non-speech handoffs. It retains
the source release, keys, item IDs and object keys, then authors six distinct successor content
revisions with new item/key identities, explicit predecessors and revision-scoped rights envelopes.
The optional `revisionLabel` and `rightsEnvelopeKey` seed fields distinguish those successors while
legacy seed documents retain their original labels and digests. Item-to-stimulus mapping comes
directly from authored Listening question metadata, never from a runtime key query or array position.

The seed transaction commits only unapproved drafts. A separate atomic catalogue transaction
reconciles missing historical rendition rows against the committed seed catalogue, verifies every
supplied byte digest/length, and stores immutable manifests, renditions, private transcript metadata
and exact item/stimulus/candidate bindings. It neither stores object bytes nor calls a provider.
Relocated rendition IDs are successors; original IDs are never retargeted to new object keys.

The result states are explicit:

- `draft_import_refused`: the seed planner refused the successor operation.
- `draft_retained_media_refused`: the draft committed, but all media writes rolled back. It remains
  unapproved with no active publication. Retry the same operation and exact source after resolving
  the refusal; do not invent a new seed identity to hide the partial state.
- `quarantined_catalogue_imported`: catalogue facts committed or exactly replayed. The audio is
  still non-speech, learner admission is not granted, and byte storage was not performed.

General authored imports use `PostgresMediaCatalogue(pool, audioCatalogueValidator)` with the full
canonical manifest records, explicit bindings and exact bytes. The parser is required on writes and
reads. Conflicting immutable identity reuse is refused; exact historical catalogue retries do not
reactivate withdrawn media or replace the current aggregate. Storing a draft successor leaves the
existing current aggregate unchanged. A first insertion may explicitly activate an approved
successor with `activateApprovedSuccessor`; it must name the current predecessor and pass the exact
approval checks. This is not an automatic approval path.

For an approved import, allocate the decision ID, serialize the final manifest, review that exact
digest, then append the approval decision with evidence reference
`audio-manifest/sha256/<canonical aggregate digest>`. Only then import it. One approval ID cannot
authorize a different aggregate. Current admission checks the subject's predecessor chain under the
same lock as the approval writer, not timestamp ordering. Test-only synthetic approvals prove this
mechanism; they do not approve the seed or satisfy a human gate.

Listening selection requires complete exact-revision bindings and current eligible media, rights,
accessibility and approval facts. A missing validator keeps Listening unavailable. New Listening
leases must carry the optional, strict `audioManifestPins` condition, ordered by asset ID with
candidate IDs ordered by identity. Issuance rechecks the pins and current eligibility. Acquiring a
lease does not record target audio exposure.

The runtime now supplies same-origin byte authorization, digest verification, browser decode and
output confirmation, durable preflight, exact play ordinals, recovery facts and transcript-phase
authorization. Separate transcript envelopes must have the right component purpose and be
current/effective at admission. No transcript body, key, provider URL or object key is included in a
learner lease. The offline importer itself still stores no bytes and grants no learner admission;
conditional offline playback remains refused. OWNER-05-A/B/C/E and Stage 10 egress remain unclaimed.

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
  --operation-id seed-apply-20260901
```

For PostgreSQL, the transaction timestamp is authoritative. `--occurred-at` exists only to make
state-file fixtures deterministic; it cannot override the database-recorded lifecycle time.

The PostgreSQL adapter uses one transaction and parameterized statements to write rights envelopes,
accessibility manifests, content families and revisions, items, key revisions, recorded gate
results, the candidate release, and its entries. It does not write audio-provider rows; media
catalogue import and Listening playback are separate operations. A database apply requires the
Stage 05 migrations.

The adapter records compact, audit-shaped immutable facts: one operation receipt plus one
`content_revision` action event for every apply result. The events carry canonical digests, real
target classes, reason-registry codes, release references and the database-recorded time. They do
not store a report body in an audit classification field. Replay uses the recorded per-revision
actions to reproduce mixed create, supersede and unchanged reports exactly. Repeating the same
operation ID with the same canonical command returns the original report without another mutation.
Reusing it with a different release, selector or reason returns `idempotency_conflict` and changes
nothing. A generated client timestamp is not semantic, so a transport retry need not repeat
`--occurred-at`.

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

`--reason` is a frozen reason-registry code, not free-form notes. Withdrawal accepts
`VALIDITY.RIGHTS_COMPATIBILITY`; quarantine accepts
`UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT`.

```sh
pnpm exec tsx packages/infrastructure/src/content/seed-cli.ts \
  --state .local/content-seed/catalogue.json \
  --withdraw r1-family-id-from-the-report \
  --reason VALIDITY.RIGHTS_COMPATIBILITY \
  --operation-id seed-withdraw-20260901 \
  --occurred-at 2026-09-01T12:10:00.000Z \
  --report .local/content-seed/withdraw-report.json
```

```sh
pnpm exec tsx packages/infrastructure/src/content/seed-cli.ts \
  --state .local/content-seed/catalogue.json \
  --quarantine revision-id-from-the-report \
  --reason UNCERTAINTY.KEY_VALIDATOR_DISAGREEMENT \
  --operation-id seed-quarantine-20260901 \
  --occurred-at 2026-09-01T12:15:00.000Z \
  --report .local/content-seed/quarantine-report.json
```

Withdrawal appends a successor withdrawn rights envelope, a granted `retired` approval decision and
a `serving_only`/`rights_takedown` impact assertion, then moves the revision's current projection
pointers. Quarantine appends a granted `quarantine` decision and a scoped `serving_only` content
impact assertion. Neither command rewrites the prior rights or approval facts. Draft content has no
learner-scoped impact targets, and rights-only withdrawal appends no validity assertion. Past
performance does not become negative evidence.

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

The PostgreSQL rollback path accepts only an active or retired approved release. It refuses a
`candidate` seed release, so rollback cannot promote the unreviewed draft corpus.

## Fake audio limitation

The listening seed stores authored, unreviewed German draft scripts and deterministic PCM WAV
fixture manifests.
The fake renderer emits a short integer waveform. It is not speech. Do not play it to learners and
do not promote it to Independent-B1, Readiness/P4, or Gold. The implemented media authorization and
playback runtime continues to refuse these unapproved catalogue entries for learner use.

No command in this guide calls a live synthesis service or another productive provider.

## Owner gates

These gates remain open:

- `OWNER-05-A`: live German voice audition, synthesis, and human audit of final speech bytes
- `OWNER-05-B`: human sign-off for a complete P4 form and its final assets
- `OWNER-05-C`: independent blind solution and key validation by a distinct reviewer
- `OWNER-05-E`: manual VoiceOver/NVDA and real-device zoom/reflow completion

There is also a separate launch human-review requirement from Architecture 09 §5.1. It is not an
owner claim and has not happened. Until independent key validation and launch review are recorded,
the corpus stays draft/candidate and the tool refuses a Training-bearing release. OWNER-05-A,
OWNER-05-B, OWNER-05-C and OWNER-05-E remain unclaimed. Deployment-level Corpus-host egress denial
also remains a Stage 10 obligation.
