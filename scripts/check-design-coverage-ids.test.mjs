import { beforeAll, describe, expect, it, test } from "vitest";
import {
  collectExecutableCoverageIds,
  loadCoverageManifest,
  validateCoverageManifest,
} from "./check-design-coverage.mjs";
import { executableCheckIds } from "./check-design-coverage-ids.mjs";

describe("executable coverage ID extraction", () => {
  test("accepts IDs in test and describe titles", () => {
    expect([
      ...executableCheckIds(
        "test(\"P04-DEMO-001 works\", () => {}); describe('P04-SAMPLE-001 tokens', () => {})",
      ),
    ]).toEqual(["P04-DEMO-001", "P04-SAMPLE-001"]);
  });

  it("rejects comments and unrelated strings", () => {
    const source = '// P04-FAKE-001\nconst text = "P04-STRING-001";';
    expect([...executableCheckIds(source)]).toEqual([]);
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
