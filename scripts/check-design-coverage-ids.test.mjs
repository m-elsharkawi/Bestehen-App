import { describe, expect, it } from "vitest";
import { executableCheckIds } from "./check-design-coverage-ids.mjs";

describe("executable coverage ID extraction", () => {
  test("accepts IDs in test and describe titles", () => {
    expect([
      ...executableCheckIds(
        "test(\"QA-VISUAL-001 works\", () => {}); describe('QA-TOKEN-001 tokens', () => {})",
      ),
    ]).toEqual(["QA-VISUAL-001", "QA-TOKEN-001"]);
  });

  it("rejects comments and unrelated strings", () => {
    const source = '// P04-FAKE-001\nconst text = "P04-STRING-001";';
    expect([...executableCheckIds(source)]).toEqual([]);
  });
});
