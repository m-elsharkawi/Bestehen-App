/** Explicit offline tool entry point. Not registered as a job and never called at runtime startup. */
import { audioCatalogueValidator, prepareCommittedSeedMediaImport } from "@bestehen/content";
import {
  type createPostgresPool,
  executePostgresSeedCommand,
  PostgresMediaCatalogue,
  validateSeedReleaseDocument,
} from "@bestehen/infrastructure";

export async function importCommittedSeedMedia(
  pool: ReturnType<typeof createPostgresPool>,
  operationId: string,
) {
  const prepared = prepareCommittedSeedMediaImport();
  const draft = await executePostgresSeedCommand(pool, {
    command: "apply",
    release: validateSeedReleaseDocument(prepared.successorRelease),
    operationId,
    dryRun: false,
    reportPath: null,
    selector: null,
    reason: null,
    occurredAt: new Date().toISOString(),
  });
  if (draft.summary.hardFailures > 0) return { state: "draft_import_refused" as const, draft };
  try {
    const media = await new PostgresMediaCatalogue(pool, audioCatalogueValidator).importCatalogue(
      prepared.catalogue,
    );
    return {
      state: "quarantined_catalogue_imported" as const,
      draft,
      media,
      limitations: prepared.limitations,
    };
  } catch {
    // The existing seed planner owns its transaction. Media refusal cannot undo that draft.
    // Nothing in either transaction creates an approval, active release or learner exposure.
    return {
      state: "draft_retained_media_refused" as const,
      draft,
      retry: "same_operation_and_exact_source" as const,
      learnerAdmission: "not_granted" as const,
    };
  }
}
