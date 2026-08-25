import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  appId,
  appIdKinds,
  canTransitionEvidenceValidity,
  canTransitionSemanticJob,
  evidenceValidityStates,
  readinessStates,
  reasonFamilies,
  reasonRegistryV1,
  semanticJobStates,
  validateValidityPartition,
} from "./index.js";

describe("appId", () => {
  it("accepts an opaque application identifier", () => {
    expect(appId<"correlation">("corr_01_stage01")).toBe("corr_01_stage01");
  });

  it("rejects short or unsafe identifiers", () => {
    expect(() => appId<"correlation">("vendor/1")).toThrow(/opaque/);
  });
});

describe("Stage 03 canonical domain", () => {
  it("keeps distinct App-owned identifiers and exact closed state unions", () => {
    expect(new Set(appIdKinds).size).toBe(26);
    expect(evidenceValidityStates).toEqual([
      "valid",
      "partially_valid",
      "pending",
      "interrupted",
      "not_counted",
    ]);
    expect(readinessStates).toEqual([
      "evidence_building",
      "not_ready",
      "borderline",
      "safe",
      "ready_to_book",
      "stale_contradicted",
    ]);
  });

  it("requires exact affected/unaffected partitions for partial and pending evidence", () => {
    expect(
      validateValidityPartition("partially_valid", ["written", "oral"], {
        affected: ["oral"],
        unaffected: ["written"],
      }),
    ).toMatchObject({ ok: true });
    expect(
      validateValidityPartition("pending", ["written", "oral"], {
        affected: ["oral"],
        unaffected: ["oral"],
      }),
    ).toEqual({ ok: false, error: "partition_overlap" });
  });

  it("has a complete reason-registry/v1 family set without learner-fault protocol reasons", () => {
    expect(new Set(reasonRegistryV1.map((entry) => entry.code.split(".")[0]))).toEqual(
      new Set(reasonFamilies),
    );
    expect(reasonRegistryV1.every((entry) => entry.major === 1 && !entry.learnerFault)).toBe(true);
  });

  it("never permits semantic jobs to leave terminal states", () => {
    const terminal = [
      "published",
      "cancelled",
      "failed_terminal",
      "expired",
      "quarantined",
      "superseded",
    ] as const;
    fc.assert(
      fc.property(
        fc.constantFrom(...terminal),
        fc.constantFrom(...semanticJobStates),
        (from, to) => {
          expect(canTransitionSemanticJob(from, to)).toBe(false);
        },
      ),
    );
  });

  it("exposes only explicitly audited validity reversals", () => {
    expect(canTransitionEvidenceValidity("interrupted", "valid")).toBe(true);
    expect(canTransitionEvidenceValidity("valid", "valid")).toBe(false);
  });
});
