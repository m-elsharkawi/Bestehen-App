import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("P04-ASSET-001 asset integrity", () => {
  it("executes the repository asset checker successfully", () => {
    const output = execFileSync("node", ["scripts/check-assets.mjs"], { encoding: "utf8" });
    expect(output).toContain("P04-ASSET-001 passed");
  });
});

describe("P04-PERF-001 web budget integrity", () => {
  it("executes the repository web budget checker successfully", () => {
    const output = execFileSync("node", ["scripts/check-web-budget.mjs"], { encoding: "utf8" });
    expect(output).toContain("P04-PERF-001 passed");
  });
});

describe("P04-SCOPE-001 repository scope integrity", () => {
  it("executes the scope checker successfully", () => {
    expect(() =>
      execFileSync("node", ["scripts/check-scope.mjs"], { encoding: "utf8" }),
    ).not.toThrow();
  });
});

describe("P04-COMPAT-001 compatibility integrity", () => {
  it("executes the compatibility fixture suite", () => {
    expect(() =>
      execFileSync("node", ["scripts/test-scope.mjs"], { encoding: "utf8" }),
    ).not.toThrow();
  });
});
