import { describe, expect, it } from "vitest";
import { contentBoundary } from "./index.js";

describe("content boundary", () => {
  it("does not pretend a content release exists", () => {
    expect(contentBoundary).toEqual({ contractMajor: 1, produced: false });
  });
});
