import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { afterEach, describe, expect, it } from "vitest";

let child: ChildProcess | undefined;

async function waitFor(url: string): Promise<void> {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).status === 200) return;
    } catch {
      // The child has not bound its listener yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

afterEach(async () => {
  if (child?.exitCode === null && child.signalCode === null) {
    const exited = once(child, "exit");
    child.kill("SIGKILL");
    await exited;
  }
  child = undefined;
});

describe("web process", () => {
  it("forwards SIGTERM to standalone Next and exits cleanly within the bound", async () => {
    const port = 34_002;
    child = spawn(
      process.execPath,
      ["scripts/web-entrypoint.mjs", "apps/web/.next/standalone/apps/web/server.js"],
      {
        env: {
          ...process.env,
          BESTEHEN_SHUTDOWN_GRACE_MS: "5000",
          HOSTNAME: "127.0.0.1",
          PORT: String(port),
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    await waitFor(`http://127.0.0.1:${port}/api/health/live`);
    const exited = once(child, "exit");
    child.kill("SIGTERM");
    const [code, signal] = (await exited) as [number | null, NodeJS.Signals | null];
    expect({ code, signal }).toEqual({ code: 0, signal: null });
  });
});
