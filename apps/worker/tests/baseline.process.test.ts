import { type ChildProcess, spawn } from "node:child_process";
import { once } from "node:events";
import { foundationRevision, migrateDatabase, stage05Revision } from "@bestehen/infrastructure";
import { withIsolatedDatabase, withSyntheticDatabaseUnavailable } from "@bestehen/test-support";
import { afterEach, describe, expect, it } from "vitest";

const children = new Set<ChildProcess>();
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

function environment(databaseUrl: string, port: number): NodeJS.ProcessEnv {
  return {
    ...process.env,
    BESTEHEN_AI_ADAPTER: "fake",
    BESTEHEN_APP_ENV: "test",
    BESTEHEN_AUTH_ADAPTER: "fake",
    BESTEHEN_EMAIL_ADAPTER: "fake",
    BESTEHEN_LOG_FORMAT: "json",
    BESTEHEN_LOG_LEVEL: "info",
    BESTEHEN_OBJECT_STORAGE_ADAPTER: "fake",
    BESTEHEN_RELEASE_COMMIT: "process-synthetic",
    BESTEHEN_RELEASE_DIRTY: "false",
    // `migrateDatabase` now brings the database to the Stage 05 terminal revision, so a window
    // that ends at the Stage 03 revision reports the schema as ahead of the image and readiness
    // stays 503 forever. The window is the one the configuration default already describes: from
    // the Stage 03 revision, so a rollback without a database rollback is still legal, through the
    // Stage 05 terminal revision the migrator actually applies.
    BESTEHEN_SCHEMA_MAX_REVISION: stage05Revision,
    BESTEHEN_SCHEMA_MIN_REVISION: foundationRevision,
    BESTEHEN_SHUTDOWN_GRACE_MS: "5000",
    BESTEHEN_STT_ADAPTER: "fake",
    BESTEHEN_TTS_ADAPTER: "fake",
    BESTEHEN_WORKER_PORT: String(port),
    DATABASE_URL: databaseUrl,
  };
}

async function waitFor(url: string, status: number): Promise<void> {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status === status) return;
    } catch {
      // The child has not bound its listener yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

afterEach(async () => {
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGKILL");
      await exited;
    }
  }
  children.clear();
});

describe.skipIf(!testDatabaseUrl)("worker process", () => {
  it("starts ready with foundation queues and drains on SIGTERM", async () => {
    await withIsolatedDatabase(testDatabaseUrl as string, async (databaseUrl) => {
      await migrateDatabase(databaseUrl);
      const port = 34_001;
      const child = spawn(process.execPath, ["apps/worker/dist/main.js"], {
        env: environment(databaseUrl, port),
        stdio: ["ignore", "pipe", "pipe"],
      });
      children.add(child);
      await waitFor(`http://127.0.0.1:${port}/health/ready`, 200);
      await withSyntheticDatabaseUnavailable(databaseUrl, testDatabaseUrl as string, () =>
        waitFor(`http://127.0.0.1:${port}/health/ready`, 503),
      );
      await waitFor(`http://127.0.0.1:${port}/health/ready`, 200);
      const notFound = await fetch(`http://127.0.0.1:${port}/work`);
      expect(notFound.status).toBe(404);
      child.kill("SIGTERM");
      const [code, signal] = (await once(child, "exit")) as [number | null, NodeJS.Signals | null];
      expect({ code, signal }).toEqual({ code: 0, signal: null });
      children.delete(child);
    });
  });

  it("exits non-zero without complete configuration", async () => {
    const child = spawn(process.execPath, ["apps/worker/dist/main.js"], {
      env: { PATH: process.env.PATH },
      stdio: ["ignore", "pipe", "pipe"],
    });
    children.add(child);
    const [code] = (await once(child, "exit")) as [number | null, NodeJS.Signals | null];
    expect(code).toBe(1);
    children.delete(child);
  });
});
