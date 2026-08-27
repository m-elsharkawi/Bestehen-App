import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const semanticTokens = [
  "surface-paper",
  "surface-raised",
  "surface-sunken",
  "surface-mist",
  "surface-ink",
  "text-primary",
  "text-body",
  "text-secondary",
  "text-muted",
  "text-on-ink",
  "border-default",
  "border-strong",
  "accent-base",
  "accent-text",
  "accent-tint",
  "status-attention-graphic",
  "status-attention-text",
  "status-attention-tint",
  "status-risk-graphic",
  "status-risk-text",
  "status-risk-tint",
  "status-system",
  "data-range",
  "focus-ring",
  "elevation-shadow",
] as const;

describe("P04-TOKEN-001 canonical design tokens", () => {
  const tokens = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

  it("contains the exact 25 semantic names and both modes", () => {
    expect(semanticTokens).toHaveLength(25);
    for (const token of semanticTokens) expect(tokens).toContain(`--${token}:`);
    expect(tokens).toContain(':root[data-theme="dark"]');
    expect(tokens).toContain("prefers-color-scheme: dark");
  });

  it("keeps focus, motion, target, and measure contracts named", () => {
    for (const token of [
      "target-min",
      "motion-state",
      "motion-content",
      "motion-sheet",
      "motion-readiness",
      "measure-bare",
      "measure-task",
      "measure-app-wide",
    ])
      expect(tokens).toContain(`--${token}:`);
    expect(tokens).toContain("--target-min: 44px");
  });
});
