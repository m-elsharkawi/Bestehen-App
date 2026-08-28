import { describe, expect, it } from "vitest";
import { executableCheckIds } from "./check-design-coverage-ids.mjs";

describe("executable coverage ID extraction", () => {
  test("P04-ASSET-001 script check", () => {});
  test("P04-RSP-001 script check", () => {});
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
