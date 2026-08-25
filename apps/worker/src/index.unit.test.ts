import { describe, expect, it } from "vitest";
import { WorkerRuntime } from "./index.js";

describe("worker configuration", () => {
  it("fails before opening a listener when configuration is incomplete", () => {
    expect(() => new WorkerRuntime({ BESTEHEN_APP_ENV: "test" })).toThrow(
      /Invalid server configuration/,
    );
  });

  it("accepts a staging worker with only its own role credential", () => {
    expect(
      () =>
        new WorkerRuntime({
          BESTEHEN_APP_ENV: "staging",
          BESTEHEN_RELEASE_COMMIT: "synthetic-commit",
          DATABASE_URL: "postgresql://synthetic_worker:synthetic@database.invalid/synthetic",
          BESTEHEN_WORKER_DATABASE_URL:
            "postgresql://synthetic_worker:synthetic@database.invalid/synthetic",
        }),
    ).not.toThrow();
  });
});
