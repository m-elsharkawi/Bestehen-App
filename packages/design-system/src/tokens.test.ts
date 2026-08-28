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
  const semanticSection = (css: string) => {
    const start = css.indexOf("/* semantic-tokens-start */");
    const end = css.indexOf("/* semantic-tokens-end */", start);
    return start < 0 || end < 0 ? "" : css.slice(start, end);
  };
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
  const tokenValue = (css: string, name: string) =>
    css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1] ?? "";
  const relativeLuminance = (hex: string) => {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Invalid color token ${hex}`);
    const channel = (offset: number) => {
      const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  };
  const contrastRatio = (foreground: string, background: string) => {
    const foregroundLuminance = relativeLuminance(foreground);
    const backgroundLuminance = relativeLuminance(background);
    return (
      (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
      (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
    );
  };

  it("contains the exact 25 semantic names and both modes", () => {
    const expected: string[] = [...semanticTokens].sort();
    expect(declarationNames(semanticSection(block(tokens, ":root {"))).sort()).toEqual(expected);
    expect(
      declarationNames(semanticSection(block(tokens, ':root[data-theme="dark"]'))).sort(),
    ).toEqual(expected);
    const media = block(tokens, "@media (prefers-color-scheme: dark)");
    expect(
      declarationNames(semanticSection(block(media, ':root:not([data-theme="light"])'))).sort(),
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

  it("keeps muted light-mode text readable on the paper surface", () => {
    const light = block(tokens, ":root {");
    expect(
      contrastRatio(tokenValue(light, "text-muted"), tokenValue(light, "surface-paper")),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
