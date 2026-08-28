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
  const declarationNames = (css: string) =>
    [...css.matchAll(/--([a-z0-9-]+)\s*:/g)].map(([, name]) => name ?? "");
  const block = (css: string, start: string) => {
    const begin = css.indexOf(start);
    if (begin < 0) return "";
    let depth = 0;
    for (let index = css.indexOf("{", begin); index < css.length; index++) {
      if (css[index] === "{") depth++;
      if (css[index] === "}" && --depth === 0) return css.slice(css.indexOf("{", begin) + 1, index);
    }
    return "";
  };

  it("contains the exact 25 semantic names and both modes", () => {
    const expected = [...semanticTokens].sort();
    expect(
      declarationNames(block(tokens, ":root {"))
        .filter((name) => expected.includes(name))
        .sort(),
    ).toEqual(expected);
    expect(
      declarationNames(block(tokens, ':root[data-theme="dark"]'))
        .filter((name) => expected.includes(name))
        .sort(),
    ).toEqual(expected);
    const media = block(tokens, "@media (prefers-color-scheme: dark)");
    expect(
      declarationNames(block(media, ':root:not([data-theme="light"])'))
        .filter((name) => expected.includes(name))
        .sort(),
    ).toEqual(expected);
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
