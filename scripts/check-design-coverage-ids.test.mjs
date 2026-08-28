import { describe, expect, it, test } from "vitest";
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
