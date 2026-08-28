import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("P04-ASSET-001 asset integrity", () => {
  it("executes the repository asset checker successfully", () => {
    const output = execFileSync("node", ["scripts/check-assets.mjs"], { encoding: "utf8" });
    expect(output).toContain("P04-ASSET-001 passed");
  });
});

describe("P04-PERF-001 web budget integrity", () => {
  it("builds when needed and executes the web budget checker", () => {
    if (!existsSync("apps/web/.next/build-manifest.json")) {
      execFileSync("pnpm", ["--filter", "@bestehen/web", "build"], { stdio: "pipe" });
    }
    const output = execFileSync("node", ["scripts/check-web-budget.mjs"], { encoding: "utf8" });
    expect(output).toContain("P04-PERF-001 passed");
  }, 30_000);
});

describe("P04-SCOPE-001 scope integrity", () => {
  it("executes the scope checker", () => {
    expect(() => execFileSync("node", ["scripts/check-scope.mjs"])).not.toThrow();
  });
});

describe("P04-COMPAT-001 compatibility integrity", () => {
  it("executes preserved scope fixtures", () => {
    expect(() => execFileSync("node", ["scripts/test-scope.mjs"])).not.toThrow();
  });
});
