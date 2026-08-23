import { describe, expect, it } from "vitest";
import { livenessPayload } from "./runtime.js";

describe("web health", () => {
  it("keeps liveness dependency free and minimal", () => {
    expect(livenessPayload("synthetic-commit")).toEqual({
      version: 1,
      status: "live",
      service: "web",
      releaseCommit: "synthetic-commit",
    });
  });
});
