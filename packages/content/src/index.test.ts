import { describe, expect, it } from "vitest";
import * as content from "./index.js";
import { contentBoundary } from "./index.js";

describe("content boundary", () => {
  it("declares a produced content release with the D17 release identity", () => {
    expect(contentBoundary).toEqual({
      contractMajor: 1,
      produced: true,
      releaseIdentity: "stage-05-content-v1",
    });
  });

  it("names the same release identity the content graph pins", () => {
    expect(contentBoundary.releaseIdentity).toBe(content.contentReleaseIdentity);
  });
});

describe("the barrel re-exports every module", () => {
  it("exposes the content graph, task families, keys, rights, accessibility and digests", () => {
    for (const name of [
      "resolveContentClass",
      "parseSafeContentNode",
      "taskFamilyKinds",
      "collectSafeContentNodes",
      "sealObjectiveKeyRevision",
      "findKeyBearingFields",
      "evaluateAction",
      "leastPermission",
      "evaluateAccessibilityGate",
      "canonicalJson",
      "contentRevisionDigest",
      "keyRevisionDigest",
    ]) {
      expect(content).toHaveProperty(name);
    }
  });
});
