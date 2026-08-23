import { WorkerRuntime } from "./index.js";

async function main(): Promise<void> {
  let runtime: WorkerRuntime;
  try {
    runtime = new WorkerRuntime(process.env);
    await runtime.start();
  } catch (error) {
    process.stderr.write(
      `Worker startup failed: ${error instanceof Error ? error.message : "unknown error"}\n`,
    );
    process.exitCode = 1;
    return;
  }

  const shutdown = async (signal: "SIGINT" | "SIGTERM") => {
    try {
      await runtime.stop(signal);
      process.exitCode = 0;
    } catch (error) {
      process.stderr.write(
        `Worker shutdown failed: ${error instanceof Error ? error.message : "unknown error"}\n`,
      );
      process.exitCode = 1;
    }
  };
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
}

void main();
