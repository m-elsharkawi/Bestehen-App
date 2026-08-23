import { describe, expect, it } from "vitest";
import { WorkerRuntime } from "./index.js";

describe("worker configuration", () => {
  it("fails before opening a listener when configuration is incomplete", () => {
    expect(() => new WorkerRuntime({ BESTEHEN_APP_ENV: "test" })).toThrow(
      /Invalid server configuration/,
    );
  });
});
