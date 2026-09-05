import { beforeAll, describe, expect, it, test } from "vitest";
import {
  assertSemanticUnionParity,
  collectExecutableCoverageIds,
  loadCoverageManifest,
  loadProductSemanticUnions,
  validateCoverageManifest,
} from "./check-design-coverage.mjs";
import { executableCheckIds } from "./check-design-coverage-ids.mjs";

describe("executable coverage ID extraction", () => {
  test("accepts P04 and P05 IDs in test, it, and describe titles", () => {
    expect([
      ...executableCheckIds(
        "test(\"P04-DEMO-001 works\", () => {}); it('P05-RUNTIME-001 works', () => {}); describe(`P05-SAMPLE-001 tokens`, () => {})",
      ),
    ]).toEqual(["P04-DEMO-001", "P05-RUNTIME-001", "P05-SAMPLE-001"]);
  });

  it("rejects comments and unrelated strings", () => {
    const source = '// P05-FAKE-001\nconst text = "P05-STRING-001";';
    expect([...executableCheckIds(source)]).toEqual([]);
  });

  it("rejects malformed and unallocated future-stage IDs", () => {
    const source = 'test("P5-SHORT-001 P05-lower-001 P05-MISSING-002 P99-FUTURE-001", () => {});';
    expect([...executableCheckIds(source)]).toEqual([]);
  });
});

describe("semantic union parity with the product sources", () => {
  let productUnions;

  beforeAll(() => {
    productUnions = loadProductSemanticUnions();
  });

  it("holds between the checker copy and the real contracts and domain unions", () => {
    expect(assertSemanticUnionParity(productUnions)).toEqual({
      semanticStates: 57,
      semanticReasons: 54,
    });
  });

  function schemaFromProduct() {
    return {
      semanticStates: [...productUnions.semanticStates],
      semanticReasons: [...productUnions.semanticReasons],
    };
  }

  it("rejects a semantic state the contracts union does not declare", () => {
    const schema = schemaFromProduct();
    schema.semanticStates.push("ghost_state");
    expect(() => assertSemanticUnionParity(productUnions, schema)).toThrow(
      /semanticStates drifted from packages\/contracts consequentialUiProjectionStates: extra \[ghost_state\]; missing \[\]/,
    );
  });

  it("rejects a semantic state the contracts union declares but the checker dropped", () => {
    const schema = schemaFromProduct();
    schema.semanticStates = schema.semanticStates.filter((state) => state !== "ready_to_book");
    expect(() => assertSemanticUnionParity(productUnions, schema)).toThrow(
      /semanticStates drifted from packages\/contracts consequentialUiProjectionStates: extra \[\]; missing \[ready_to_book\]/,
    );
  });

  it("rejects a semantic reason the reason registry does not declare", () => {
    const schema = schemaFromProduct();
    schema.semanticReasons.push("FALLBACK.GHOST_REASON");
    expect(() => assertSemanticUnionParity(productUnions, schema)).toThrow(
      /semanticReasons drifted from packages\/domain reasonRegistryV1: extra \[FALLBACK\.GHOST_REASON\]; missing \[\]/,
    );
  });

  it("rejects a semantic reason the reason registry declares but the checker dropped", () => {
    const schema = schemaFromProduct();
    schema.semanticReasons = schema.semanticReasons.filter((code) => code !== "RISK.MOCK_REVEALED");
    expect(() => assertSemanticUnionParity(productUnions, schema)).toThrow(
      /semanticReasons drifted from packages\/domain reasonRegistryV1: extra \[\]; missing \[RISK\.MOCK_REVEALED\]/,
    );
  });

  it("rejects a renamed state as one extra and one missing value at once", () => {
    const schema = schemaFromProduct();
    schema.semanticStates = schema.semanticStates.map((state) =>
      state === "purge_running" ? "purge_in_progress" : state,
    );
    expect(() => assertSemanticUnionParity(productUnions, schema)).toThrow(
      /extra \[purge_in_progress\]; missing \[purge_running\]/,
    );
  });

  it("rejects a reordered union that still holds the same values", () => {
    const schema = schemaFromProduct();
    schema.semanticStates = [...schema.semanticStates].reverse();
    expect(() => assertSemanticUnionParity(productUnions, schema)).toThrow(
      /semanticStates order drifted from packages\/contracts consequentialUiProjectionStates/,
    );
  });
});

describe("coverage manifest integrity", () => {
  let manifest;
  let executableIds;

  beforeAll(() => {
    manifest = loadCoverageManifest();
    executableIds = collectExecutableCoverageIds();
  });

  function validate(candidate) {
    return validateCoverageManifest(candidate, { executableIds });
  }

  it("validates the checked-in typed manifest against real source and target files", () => {
    expect(validate(structuredClone(manifest))).toMatchObject({ rows: 149 });
  });

  it("rejects invented and misspelled semantic states", () => {
    const invented = structuredClone(manifest);
    invented.compactFrames[0].semanticStates = ["invented_state"];
    expect(() => validate(invented)).toThrow(/Invalid semantic state/);

    const misspelled = structuredClone(manifest);
    misspelled.compactFrames[0].semanticStates = ["partially-valid"];
    expect(() => validate(misspelled)).toThrow(/Invalid semantic state/);
  });

  it("rejects an invented Architecture reason code", () => {
    const candidate = structuredClone(manifest);
    candidate.compactFrames[0].semanticReasons = ["FALLBACK.INVENTED_REASON"];
    expect(() => validate(candidate)).toThrow(/Invalid semantic reason/);
  });

  it("rejects unresolved component family and icon dependencies", () => {
    const missingFamily = structuredClone(manifest);
    missingFamily.compactFrames[0].componentDependencies = ["C99"];
    expect(() => validate(missingFamily)).toThrow(/Unresolved component family dependency/);

    const missingIcon = structuredClone(manifest);
    missingIcon.compactFrames[0].iconDependencies = ["I99"];
    expect(() => validate(missingIcon)).toThrow(/Unresolved icon dependency/);
  });

  it("rejects generic and plausible nonexistent board-aware source anchors", () => {
    const generic = structuredClone(manifest);
    generic.largeExemplars[0].sourceAnchor = "D";
    expect(() => validate(generic)).toThrow(/Unresolved coverage source anchor/);

    const nonexistent = structuredClone(manifest);
    nonexistent.largeExemplars[0].sourceAnchor = "D9";
    expect(() => validate(nonexistent)).toThrow(/Unresolved coverage source anchor/);
  });

  function everyRow(candidate) {
    return [
      ...candidate.boardAnchors,
      ...candidate.compactFrames,
      ...candidate.largeExemplars,
      ...candidate.componentFamilies,
      ...candidate.icons,
    ];
  }

  it("rejects a declared semantic state that no row claims", () => {
    const candidate = structuredClone(manifest);
    for (const row of everyRow(candidate)) {
      row.semanticStates = row.semanticStates.filter((state) => state !== "merge");
    }
    expect(() => validate(candidate)).toThrow(
      /Unclaimed semantic state in the coverage manifest: merge/,
    );
  });

  it("rejects a declared semantic reason that no row claims", () => {
    const candidate = structuredClone(manifest);
    for (const row of everyRow(candidate)) {
      row.semanticReasons = row.semanticReasons.filter(
        (code) => code !== "COVERAGE.NORMAL_ROTATION",
      );
    }
    expect(() => validate(candidate)).toThrow(
      /Unclaimed semantic reason in the coverage manifest: COVERAGE\.NORMAL_ROTATION/,
    );
  });

  it("accepts the generated projection that matches the typed manifest", () => {
    const candidate = structuredClone(manifest);
    const generated = { generatedFrom: "source-anchors.ts", ...structuredClone(manifest) };
    expect(validateCoverageManifest(candidate, { executableIds, generated })).toMatchObject({
      rows: 149,
    });
  });

  it("rejects a generated projection that drifted from the typed manifest", () => {
    const candidate = structuredClone(manifest);
    const generated = { generatedFrom: "source-anchors.ts", ...structuredClone(manifest) };
    generated.compactFrames[0].targetAnchor = "DriftedTargetAnchor";
    expect(() => validateCoverageManifest(candidate, { executableIds, generated })).toThrow(
      /Generated source-anchor projection drifted from the typed manifest/,
    );
  });

  it("rejects a target anchor reused beyond the reciprocal limit", () => {
    const candidate = structuredClone(manifest);
    for (const row of candidate.compactFrames.slice(0, 6)) {
      row.targetPath = "apps/web/src/ui/archetypes.tsx";
      row.targetAnchor = "StateView";
      row.targetImplementationExports = ["StateView"];
    }
    expect(() => validate(candidate)).toThrow(/Over-reused target anchor/);
  });
});
