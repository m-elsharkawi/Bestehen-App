import { createHash } from "node:crypto";
import type { EvidenceObservationId, LearnerScopeId, ValidityAssertionId } from "@bestehen/domain";

export interface ProjectionSourceReference {
  readonly observationId: EvidenceObservationId;
  readonly assertionId: ValidityAssertionId;
  readonly disposition: "included" | "excluded";
  readonly reasonCode?: string;
}

/** Hashes the semantic projection cut, independent of query/delivery order. */
export function deterministicProjectionChecksum(input: {
  readonly learnerScopeId: LearnerScopeId;
  readonly kind: "capability" | "weakness" | "progression" | "readiness";
  readonly sourceCut: number;
  readonly rulesRelease: string;
  readonly sources: readonly ProjectionSourceReference[];
}): string {
  const sources = [...input.sources].sort((left, right) =>
    [left.observationId, left.assertionId, left.disposition, left.reasonCode ?? ""]
      .join("\0")
      .localeCompare(
        [right.observationId, right.assertionId, right.disposition, right.reasonCode ?? ""].join(
          "\0",
        ),
      ),
  );
  return createHash("sha256")
    .update(
      JSON.stringify({
        learnerScopeId: input.learnerScopeId,
        kind: input.kind,
        sourceCut: input.sourceCut,
        rulesRelease: input.rulesRelease,
        sources,
      }),
    )
    .digest("hex");
}
