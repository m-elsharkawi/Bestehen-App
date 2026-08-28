import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("P04-ASSET-001 asset integrity", () => {
  it("executes the repository asset checker successfully", () => {
    const output = execFileSync("node", ["scripts/check-assets.mjs"], { encoding: "utf8" });
    expect(output).toContain("P04-ASSET-001 passed");
  });
});
