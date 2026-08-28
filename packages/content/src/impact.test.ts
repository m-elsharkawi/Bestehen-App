import {
  appId,
  type EvidenceObservationId,
  impactCauseKinds,
  impactModes,
  reasonRegistryRelease,
  reasonRegistryV1,
} from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import { canonicalizationVersion } from "./digest.js";
import {
  type ImpactAssertion,
  type ImpactSelectors,
  type ProjectionDependency,
  changedAxes,
  changesValidity,
  defaultImpactModeForCause,
  impactAxes,
  impactRecomputeSemanticIdentity,
  projectionsToRebuild,
  resolveSelectors,
  selectorBasis,
  validateImpactAssertion,
  verifyRecomputeScope,
} from "./impact.js";

const observation = (id: string): EvidenceObservationId => appId<"evidence_observation">(id);

const observationA = observation("observation-0001");
const observationB = observation("observation-0002");

function selectors(overrides: Partial<ImpactSelectors> = {}): ImpactSelectors {
  return {
    observationIds: [observationA, observationB],
    claimDimensions: ["reading.detail"],
    learnerScopeBound: [appId<"learner_scope">("learner-scope-0001")],
    sourceCutBound: null,
    ...overrides,
  };
}

function assertion(overrides: Partial<ImpactAssertion> = {}): ImpactAssertion {
  return {
    impactAssertionId: appId<"impact_assertion">("impact-0001"),
    incidentId: "incident-0001",
    ownerContext: "Content & Forms",
    actorAndAuthorization: { actorRef: "owner-operator", authorizationVersion: "authz/v1" },
    causeKind: "content_defect",
    selectors: selectors(),
    declaredCardinality: { kind: "exact", count: 2 },
    impactMode: "validity_change",
    requestedValidity: "not_counted",
    scope: { affected: ["item-alpha"], unaffected: ["item-bravo"] },
    reason: "VALIDITY.CONTENT_QUARANTINED_AFTER_PIN",
    evidenceRefs: ["report-0001"],
    effectiveAt: "2026-03-01T00:00:00.000Z",
    recordedAt: "2026-03-01T00:05:00.000Z",
    policyAndContractVersions: {
      contentReleaseIdentity: "stage-05-content-v1",
      reasonRegistryRelease: reasonRegistryRelease.id,
      canonicalizationVersion,
    },
    ...overrides,
  };
}

const priorClaimScope = ["item-alpha", "item-bravo"];

/* ------------------------------------------------------------------------------------------------
 * The assertion shape
 * ---------------------------------------------------------------------------------------------- */

describe("the impact assertion shape", () => {
  it("accepts a well-formed content-defect assertion", () => {
    expect(validateImpactAssertion(assertion(), priorClaimScope)).toEqual([]);
  });

  it("uses the domain's cause kinds and modes rather than a second copy", () => {
    for (const cause of impactCauseKinds) {
      expect(impactModes).toContain(defaultImpactModeForCause(cause));
    }
  });

  it("names a reason code the registry defines", () => {
    const registered = new Set(reasonRegistryV1.map((definition) => definition.code));
    expect(registered.has(assertion().reason)).toBe(true);
  });

  it("refuses a selector with neither observation IDs nor version indexes", () => {
    const basisless = selectors({ observationIds: [], claimDimensions: [] });
    expect(selectorBasis(basisless)).toBe("none");
    expect(
      validateImpactAssertion(assertion({ selectors: basisless }), priorClaimScope).map(
        (defect) => defect.code,
      ),
    ).toContain("selector_without_basis");
  });

  it("prefers exact observation IDs and falls back to version indexes plus claim dimensions", () => {
    expect(selectorBasis(selectors())).toBe("exact_observation_ids");
    expect(selectorBasis(selectors({ observationIds: [], contentRevisionIds: ["rev-0001"] }))).toBe(
      "version_index",
    );
    expect(
      selectorBasis(
        selectors({ observationIds: [], contentRevisionIds: ["rev-0001"], claimDimensions: [] }),
      ),
    ).toBe("none");
  });

  it("refuses an unbounded learner scope", () => {
    const codes = validateImpactAssertion(
      assertion({ selectors: selectors({ learnerScopeBound: [] }) }),
      priorClaimScope,
    ).map((defect) => defect.code);
    expect(codes).toContain("learner_scope_bound_missing");
  });

  it("refuses a declared cardinality that is not a usable expectation", () => {
    for (const declared of [
      { kind: "exact" as const, count: -1 },
      { kind: "reviewed_bound" as const, minimum: 5, maximum: 2, reviewRef: "review-1" },
      { kind: "reviewed_bound" as const, minimum: 0, maximum: 2, reviewRef: " " },
    ]) {
      expect(
        validateImpactAssertion(assertion({ declaredCardinality: declared }), priorClaimScope).map(
          (defect) => defect.code,
        ),
      ).toContain("declared_cardinality_invalid");
    }
  });

  it("requires a disjoint partition that covers the prior claim scope exactly", () => {
    const overlapping = assertion({
      scope: { affected: ["item-alpha"], unaffected: ["item-alpha", "item-bravo"] },
    });
    expect(
      validateImpactAssertion(overlapping, priorClaimScope).map((defect) => defect.code),
    ).toContain("scope_partition_invalid");

    const incomplete = assertion({ scope: { affected: ["item-alpha"], unaffected: [] } });
    expect(
      validateImpactAssertion(incomplete, priorClaimScope).map((defect) => defect.code),
    ).toContain("scope_partition_invalid");
  });

  it("refuses to quarantine an entire learner scope on convenience", () => {
    const bare = assertion({
      unknownScopeSuperset: {
        supersetRef: "superset-all",
        justification: "unclear",
        coversEntireLearnerScope: true,
      },
    });
    expect(validateImpactAssertion(bare, priorClaimScope).map((defect) => defect.code)).toContain(
      "unknown_scope_superset_overbroad",
    );

    const defended = assertion({
      unknownScopeSuperset: {
        supersetRef: "superset-reading-block-3",
        justification:
          "The faulty asset backed every Listening unit in block 3 and no unit outside it.",
        coversEntireLearnerScope: true,
      },
    });
    expect(validateImpactAssertion(defended, priorClaimScope)).toEqual([]);
  });

  it("refuses an assertion recorded under a different canonicalization", () => {
    const drifted = assertion({
      policyAndContractVersions: {
        contentReleaseIdentity: "stage-05-content-v1",
        reasonRegistryRelease: reasonRegistryRelease.id,
        canonicalizationVersion: "canonical-json/v0",
      },
    });
    expect(
      validateImpactAssertion(drifted, priorClaimScope).map((defect) => defect.code),
    ).toContain("canonicalization_version_mismatch");
  });
});

/* ------------------------------------------------------------------------------------------------
 * Rights and correctness stay separate
 * ---------------------------------------------------------------------------------------------- */

describe("rights and correctness stay separate", () => {
  it("defaults a rights takedown to serving only", () => {
    expect(defaultImpactModeForCause("rights_takedown")).toBe("serving_only");
    expect(changesValidity("serving_only")).toBe(false);
    expect(changesValidity("visibility_redaction")).toBe(false);
  });

  it("accepts a serving-only rights takedown that leaves every validity untouched", () => {
    const takedown = assertion({
      causeKind: "rights_takedown",
      impactMode: "serving_only",
      requestedValidity: null,
      reason: "VALIDITY.RIGHTS_COMPATIBILITY",
      scope: { affected: [], unaffected: priorClaimScope },
    });
    expect(validateImpactAssertion(takedown, priorClaimScope)).toEqual([]);
    // Nothing in the assertion requests a validity state at all.
    expect(takedown.requestedValidity).toBeNull();
  });

  it("refuses a rights takedown that changes validity with no reviewed policy", () => {
    const overreaching = assertion({
      causeKind: "rights_takedown",
      impactMode: "validity_change",
      requestedValidity: "not_counted",
      reason: "VALIDITY.RIGHTS_COMPATIBILITY",
    });
    expect(
      validateImpactAssertion(overreaching, priorClaimScope).map((defect) => defect.code),
    ).toContain("rights_takedown_changes_validity_without_reviewed_policy");

    const reviewed = assertion({
      ...overreaching,
      reviewedPolicyOverrideRef: "policy-rights-validity-0001",
    });
    expect(validateImpactAssertion(reviewed, priorClaimScope)).toEqual([]);
  });

  it("refuses a validity state requested on a mode that does not change validity", () => {
    const confused = assertion({
      impactMode: "serving_only",
      requestedValidity: "pending",
    });
    expect(
      validateImpactAssertion(confused, priorClaimScope).map((defect) => defect.code),
    ).toContain("validity_requested_on_non_validity_mode");
  });

  it("refuses a validity change that names no state", () => {
    expect(
      validateImpactAssertion(
        assertion({ impactMode: "validity_change", requestedValidity: null }),
        priorClaimScope,
      ).map((defect) => defect.code),
    ).toContain("validity_change_without_requested_state");
  });
});

/* ------------------------------------------------------------------------------------------------
 * The declared-versus-actual cardinality contract
 * ---------------------------------------------------------------------------------------------- */

describe("the selector cardinality contract", () => {
  it("resolves when the actual count matches the declared count exactly", () => {
    expect(resolveSelectors(assertion(), [observationB, observationA])).toEqual({
      status: "resolved",
      observationIds: [observationA, observationB],
      resolvedCount: 2,
    });
  });

  it("faults on an empty resolution and stops publication", () => {
    const result = resolveSelectors(assertion(), []);
    expect(result.status).toBe("cardinality_fault");
    if (result.status !== "cardinality_fault") return;
    expect(result.fault).toBe("empty_result");
    expect(result.stopsPublication).toBe(true);
    expect(result.incidentRequired).toBe(true);
  });

  it("faults on an excess resolution rather than silently adjusting", () => {
    const result = resolveSelectors(assertion(), [
      observationA,
      observationB,
      observation("observation-0003"),
    ]);
    expect(result.status).toBe("cardinality_fault");
    if (result.status !== "cardinality_fault") return;
    expect(result.fault).toBe("excess_result");
    expect(result.resolvedCount).toBe(3);
    // The declaration is reported unchanged; nothing is rewritten to fit the result.
    expect(result.declared).toEqual({ kind: "exact", count: 2 });
  });

  it("faults on an under-declared resolution", () => {
    const result = resolveSelectors(assertion(), [observationA]);
    expect(result.status).toBe("cardinality_fault");
    if (result.status !== "cardinality_fault") return;
    expect(result.fault).toBe("under_declared");
  });

  it("honours a reviewed bound at both ends", () => {
    const bounded = assertion({
      declaredCardinality: { kind: "reviewed_bound", minimum: 1, maximum: 2, reviewRef: "rev-1" },
    });
    expect(resolveSelectors(bounded, [observationA]).status).toBe("resolved");
    expect(resolveSelectors(bounded, [observationA, observationB]).status).toBe("resolved");
    const over = resolveSelectors(bounded, [
      observationA,
      observationB,
      observation("observation-0003"),
    ]);
    expect(over.status).toBe("cardinality_fault");
    if (over.status === "cardinality_fault") expect(over.fault).toBe("excess_result");
  });

  it("faults on an empty resolution even when the reviewed minimum is zero", () => {
    const permissive = assertion({
      declaredCardinality: { kind: "reviewed_bound", minimum: 0, maximum: 9, reviewRef: "rev-1" },
    });
    const result = resolveSelectors(permissive, []);
    expect(result.status).toBe("cardinality_fault");
    if (result.status === "cardinality_fault") expect(result.fault).toBe("empty_result");
  });

  it("counts each observation once, however often it was resolved", () => {
    const result = resolveSelectors(assertion(), [
      observationA,
      observationA,
      observationB,
      observationB,
    ]);
    expect(result.status).toBe("resolved");
    if (result.status === "resolved")
      expect(result.observationIds).toEqual([observationA, observationB]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Targeted recompute
 * ---------------------------------------------------------------------------------------------- */

describe("targeted recompute", () => {
  const dependencies: readonly ProjectionDependency[] = [
    { projectionKind: "capability_nodes", dependsOnAxes: ["observation", "claim_dimension"] },
    { projectionKind: "listening_readiness", dependsOnAxes: ["media_revision"] },
    { projectionKind: "written_readiness", dependsOnAxes: ["blueprint_release"] },
    { projectionKind: "mistake_episodes", dependsOnAxes: ["observation"] },
  ];

  it("names every axis the selector actually addresses", () => {
    expect(changedAxes(selectors())).toEqual(["observation", "claim_dimension"]);
    for (const axis of changedAxes(selectors({ mediaRevisionIds: ["media-0001"] }))) {
      expect(impactAxes).toContain(axis);
    }
  });

  it("rebuilds only projections that declare a dependency on a changed axis", () => {
    expect(projectionsToRebuild(assertion(), dependencies)).toEqual([
      "capability_nodes",
      "mistake_episodes",
    ]);
  });

  it("rebuilds nothing when no projection depends on the changed axis", () => {
    const mediaOnly = assertion({
      causeKind: "media_defect",
      selectors: selectors({
        observationIds: [],
        mediaRevisionIds: ["media-0001"],
        claimDimensions: [],
      }),
    });
    expect(projectionsToRebuild(mediaOnly, dependencies)).toEqual(["listening_readiness"]);
  });

  it("proves every selected entry changed and no unaffected entry did", () => {
    const before = new Map([
      ["item-alpha", "valid"],
      ["item-bravo", "valid"],
    ]);
    const after = new Map([
      ["item-alpha", "not_counted"],
      ["item-bravo", "valid"],
    ]);
    expect(verifyRecomputeScope(before, after, assertion().scope)).toEqual({
      ok: true,
      selectedUnchanged: [],
      unaffectedChanged: [],
      selectedChangedCount: 1,
    });
  });

  it("blocks the switch when an unaffected projection was touched", () => {
    const before = new Map([
      ["item-alpha", "valid"],
      ["item-bravo", "valid"],
    ]);
    const after = new Map([
      ["item-alpha", "not_counted"],
      ["item-bravo", "pending"],
    ]);
    const verification = verifyRecomputeScope(before, after, assertion().scope);
    expect(verification.ok).toBe(false);
    expect(verification.unaffectedChanged).toEqual(["item-bravo"]);
  });

  it("blocks the switch when a selected entry did not change", () => {
    const unchanged = new Map([
      ["item-alpha", "valid"],
      ["item-bravo", "valid"],
    ]);
    const verification = verifyRecomputeScope(unchanged, unchanged, assertion().scope);
    expect(verification.ok).toBe(false);
    expect(verification.selectedUnchanged).toEqual(["item-alpha"]);
    expect(verification.selectedChangedCount).toBe(0);
  });

  it("names one idempotent effect per assertion, projection kind and generation", () => {
    expect(impactRecomputeSemanticIdentity(assertion(), "capability_nodes", 7)).toBe(
      "impact-0001:capability_nodes:7",
    );
    expect(impactRecomputeSemanticIdentity(assertion(), "capability_nodes", 7)).toBe(
      impactRecomputeSemanticIdentity(assertion(), "capability_nodes", 7),
    );
    expect(impactRecomputeSemanticIdentity(assertion(), "capability_nodes", 8)).not.toBe(
      impactRecomputeSemanticIdentity(assertion(), "capability_nodes", 7),
    );
  });
});
