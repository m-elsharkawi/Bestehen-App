import { describe, expect, it } from "vitest";
import {
  boardAnchors,
  compactFrames,
  componentFamilies,
  iconRegistry,
  largeExemplars,
  representativeRoutes,
  sourceAnchorManifest,
} from "./source-anchors.js";

describe("P04-COVERAGE-001 source anchor manifest", () => {
  it("holds the accepted current inventory", () => {
    expect(compactFrames).toHaveLength(41);
    expect(largeExemplars).toHaveLength(8);
    expect(componentFamilies).toHaveLength(43);
    expect(iconRegistry).toHaveLength(20);
    expect(boardAnchors).toHaveLength(37);
    expect(sourceAnchorManifest.inventory).toEqual({
      compactFrames: 41,
      largeExemplars: 8,
      componentFamilies: 43,
      icons: 20,
    });
  });

  it("uses the accepted IDs and complete reciprocal rows", () => {
    expect(compactFrames.map((row) => row.id)).toEqual([
      ...([1, 2, 3, 4, 5] as const).flatMap((group) =>
        Array.from(
          { length: { 1: 4, 2: 6, 3: 4, 4: 6, 5: 6 }[group] },
          (_, index) =>
            `CF-${String(group).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
        ),
      ),
      ...Array.from({ length: 15 }, (_, index) => `CF-06-${String(index + 1).padStart(2, "0")}`),
    ]);
    const rows = [
      ...boardAnchors,
      ...compactFrames,
      ...largeExemplars,
      ...sourceAnchorManifest.componentFamilies,
      ...sourceAnchorManifest.icons,
    ];
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
    for (const row of rows) {
      expect(row.target).toMatch(/\.(?:ts|tsx|css)$/);
      expect(row.targetAnchor).not.toBe("");
      expect(row.tests.length).toBeGreaterThan(0);
      expect(row.resolution).not.toBe("");
      expect(["accepted", "corrected", "derived", "obsolete"]).toContain(row.status);
    }
    expect(representativeRoutes).toContain("/settings/data");
    expect(representativeRoutes).toContain("/attempt/synthetic-reading/result");
  });
});
