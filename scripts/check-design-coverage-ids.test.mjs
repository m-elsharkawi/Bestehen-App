import { describe, expect, it } from "vitest";
import { executableCheckIds } from "./check-design-coverage-ids.mjs";

describe("executable coverage ID extraction", () => {
  it("accepts IDs in test and describe titles", () => {
    expect([
      ...executableCheckIds(
        "test(\"P04-VISUAL-001 works\", () => {}); describe('P04-TOKEN-001 tokens', () => {})",
      ),
    ]).toEqual(["P04-VISUAL-001", "P04-TOKEN-001"]);
  });

  it("rejects comments and unrelated strings", () => {
    const source = '// P04-FAKE-001\nconst text = "P04-STRING-001";';
    expect([...executableCheckIds(source)]).toEqual([]);
  });
});
