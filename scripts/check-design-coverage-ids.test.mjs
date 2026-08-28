import { describe, expect, it } from "vitest";
import { executableCheckIds } from "./check-design-coverage-ids.mjs";

describe("executable coverage ID extraction", () => {
  test("P04-ASSET-001 validates asset check output", () => {
    expect(executableCheckIds('test("P04-ASSET-001", () => {})')).toContain("P04-ASSET-001");
  });
  test("P04-RSP-001 validates responsive check output", () => {
    expect(executableCheckIds('test("P04-RSP-001", () => {})')).toContain("P04-RSP-001");
  });
  test("P04-PERF-001 validates performance check output", () => {
    expect(executableCheckIds('describe("P04-PERF-001", () => {})')).toContain("P04-PERF-001");
  });
  test("P04-SCOPE-001 validates scope check output", () => {
    expect(executableCheckIds('test("P04-SCOPE-001", () => {})')).toContain("P04-SCOPE-001");
  });
  test("P04-COMPAT-001 validates compatibility check output", () => {
    expect(executableCheckIds('describe("P04-COMPAT-001", () => {})')).toContain("P04-COMPAT-001");
  });
  it("accepts IDs in test and describe titles", () => {
    expect([
      ...executableCheckIds(
        'test("P04-VISUAL-001 works", () => {}); describe(\'P04-TOKEN-001 tokens\', () => {}); test("P04-ASSET-001 assets", () => {}); test("P04-RSP-001 responsive", () => {})',
      ),
    ]).toEqual(["P04-VISUAL-001", "P04-TOKEN-001", "P04-ASSET-001", "P04-RSP-001"]);
  });

  it("rejects comments and unrelated strings", () => {
    const source = '// P04-FAKE-001\nconst text = "P04-STRING-001";';
    expect([...executableCheckIds(source)]).toEqual([]);
  });
});
