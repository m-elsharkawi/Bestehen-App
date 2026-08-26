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

  it("uses stable unique ids and maps representative route archetypes", () => {
    expect(new Set(compactFrames.map((row) => row.id)).size).toBe(compactFrames.length);
    expect(new Set(largeExemplars.map((row) => row[0])).size).toBe(largeExemplars.length);
    expect(new Set(componentFamilies.map((row) => row[0])).size).toBe(componentFamilies.length);
    expect(new Set(iconRegistry.map((row) => row[0])).size).toBe(iconRegistry.length);
    expect(representativeRoutes).toContain("/settings/data");
    expect(representativeRoutes).toContain("/attempt/synthetic-reading/result");
  });
});
