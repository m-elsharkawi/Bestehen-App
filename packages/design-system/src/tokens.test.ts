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

describe("P05-CONTRAST-001 runtime controls", () => {
  const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  const tokens = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
  const block = (css: string, selector: string) => {
    const start = css.indexOf(selector);
    if (start < 0) throw new Error(`Missing selector ${selector}`);
    const open = css.indexOf("{", start);
    let depth = 0;
    for (let index = open; index < css.length; index++) {
      if (css[index] === "{") depth++;
      if (css[index] === "}" && --depth === 0) return css.slice(open + 1, index);
    }
    throw new Error(`Unclosed selector ${selector}`);
  };
  const declaration = (css: string, selector: string, property: string) => {
    const value = block(css, selector)
      .match(new RegExp(`${property}:\\s*([^;]+);`))?.[1]
      ?.trim();
    if (!value) throw new Error(`Missing ${property} declaration for ${selector}`);
    return value;
  };
  const variables = (css: string) =>
    Object.fromEntries(
      [...css.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(([, name, value]) => [
        name ?? "",
        value?.trim() ?? "",
      ]),
    );
  const resolve = (value: string, palette: Readonly<Record<string, string>>): string => {
    const variable = value.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
    if (!variable) return value;
    const replacement = palette[variable];
    if (!replacement) throw new Error(`Missing value for ${variable}`);
    return resolve(replacement, palette);
  };
  const color = (value: string, palette: Readonly<Record<string, string>>) => {
    const reference = value.match(/(#[0-9a-f]{6}|var\(--[a-z0-9-]+\))/i)?.[1];
    if (!reference) throw new Error(`No color in ${value}`);
    const resolved = resolve(reference, palette);
    if (!/^#[0-9a-f]{6}$/i.test(resolved)) throw new Error(`Invalid color ${resolved}`);
    return resolved;
  };
  const luminance = (hex: string) => {
    const channel = (offset: number) => {
      const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  };
  const contrast = (foreground: string, background: string) =>
    (Math.max(luminance(foreground), luminance(background)) + 0.05) /
    (Math.min(luminance(foreground), luminance(background)) + 0.05);

  const controls = [
    ["answer choice", ".answer-choice label", ".answer-choice,"],
    ["selected option", '.answer-choice label[data-selected="true"],', ".answer-choice,"],
    [
      "matching prompt and destination",
      ".matching-pair button,\n.matching-destination > button,\n.cloze-shared-bank button {",
      ".matching-pair,",
    ],
    [
      "SB2 candidate chip",
      ".matching-pair button,\n.matching-destination > button,\n.cloze-shared-bank button {",
      ".cloze-shared-bank,",
    ],
    [
      "selected SB2 candidate",
      '.cloze-shared-bank button[data-selected="true"],',
      ".cloze-shared-bank,",
    ],
    ["transport button", '.answer-choice label[data-selected="true"],', ".listening-region"],
    [
      "placement and remove button",
      ".match-pill button,\n.cloze-placement button {",
      ".cloze-shared-placement,",
    ],
    ["transcript disclosure", ".listening-transcript {", ".listening-region"],
    ["R1/R3 match pill", ".match-pill", ".matching-pair,"],
    ["neutral history mark", '.status-word[data-status="system"]', ".card"],
  ] as const;
  const palette = (stylesheet: string, mode: "light" | "dark", history: boolean) => {
    const tokenSelector = mode === "light" ? ":root {" : ':root[data-theme="dark"]';
    const controlSelector =
      mode === "light" ? ".answer-choice," : ':root[data-theme="dark"] .answer-choice,';
    const historySelector =
      mode === "light"
        ? '.status-word[data-status="system"]'
        : ':root[data-theme="dark"] .status-word[data-status="system"]';
    return {
      ...variables(block(tokens, tokenSelector)),
      ...variables(block(stylesheet, ".answer-choice,")),
      ...(mode === "dark" ? variables(block(stylesheet, controlSelector)) : {}),
      ...(history ? variables(block(stylesheet, '.status-word[data-status="system"]')) : {}),
      ...(history && mode === "dark" ? variables(block(stylesheet, historySelector)) : {}),
    };
  };
  const assertActualContrast = (stylesheet: string) => {
    for (const [name, selector, surfaceSelector] of controls) {
      for (const mode of ["light", "dark"] as const) {
        const history = name === "neutral history mark";
        const colors = palette(stylesheet, mode, history);
        const fill = color(declaration(stylesheet, selector, "background"), colors);
        const label = color(declaration(stylesheet, selector, "color"), colors);
        const boundary = color(declaration(stylesheet, selector, "border"), colors);
        const surface = color(declaration(stylesheet, surfaceSelector, "background"), colors);
        expect(contrast(label, fill), `${name} ${mode} text`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(boundary, surface), `${name} ${mode} UI`).toBeGreaterThanOrEqual(3);
      }
    }
  };

  it("resolves every runtime control from its actual selector declarations and current token surfaces", () => {
    for (const selector of [
      ".answer-choice label {",
      '.answer-choice label[data-selected="true"],',
      ".matching-pair button,\n.matching-destination > button,\n.cloze-shared-bank button {",
      '.cloze-shared-bank button[data-selected="true"],',
      ".listening-transport button {",
      ".match-pill button,\n.cloze-placement button {",
      ".listening-transcript {",
      ".match-pill {",
      '.status-word[data-status="system"] {',
    ])
      expect(styles).toContain(selector);
    for (const [, selector, surfaceSelector] of controls) {
      expect(declaration(styles, selector, "background")).toMatch(/^var\(/);
      expect(declaration(styles, selector, "color")).toMatch(/^var\(/);
      expect(declaration(styles, selector, "border")).toMatch(/var\(/);
      expect(declaration(styles, surfaceSelector, "background")).toMatch(/^var\(/);
    }
    assertActualContrast(styles);
  });

  it("fails when a component-owned boundary declaration drifts", () => {
    const drifted = styles.replace(
      /(--learning-control-rest-boundary:\s*)#[0-9a-f]{6}/i,
      "$1#ffffff",
    );
    expect(drifted).not.toBe(styles);
    expect(() => assertActualContrast(drifted)).toThrow();
  });
});
