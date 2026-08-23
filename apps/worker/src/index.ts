import { createServer, type Server } from "node:http";
import {
  createLogger,
  parseServerEnvironment,
  type ServerEnvironment,
} from "@bestehen/configuration";
import {
  checkDatabaseReadiness,
  createPostgresPool,
  PgBossSupervisor,
} from "@bestehen/infrastructure";
import type { Pool } from "pg";

export class WorkerRuntime {
  private readonly environment: ServerEnvironment;
  private readonly pool: Pool;
  private readonly supervisor: PgBossSupervisor;
  private readonly logger;
  private server: Server | undefined;
  private stopping = false;

  public constructor(input: Record<string, string | undefined>) {
    this.environment = parseServerEnvironment(input);
    this.pool = createPostgresPool(this.environment.DATABASE_URL);
    this.supervisor = new PgBossSupervisor(this.environment.DATABASE_URL);
    this.logger = createLogger({
      service: "worker",
      environment: this.environment.BESTEHEN_APP_ENV,
      releaseCommit: this.environment.BESTEHEN_RELEASE_COMMIT,
      level: this.environment.BESTEHEN_LOG_LEVEL,
    });
  }

  public async start(): Promise<void> {
    await this.supervisor.start();
    this.server = createServer(async (request, response) => {
      response.setHeader("content-type", "application/json; charset=utf-8");
      response.setHeader("cache-control", "no-store");
      if (request.method !== "GET") {
        response.writeHead(405).end(JSON.stringify({ status: "method_not_allowed" }));
        return;
      }
      if (request.url === "/health/live") {
        response.writeHead(this.stopping ? 503 : 200).end(
          JSON.stringify({
            version: 1,
            status: this.stopping ? "stopping" : "live",
            service: "worker",
            releaseCommit: this.environment.BESTEHEN_RELEASE_COMMIT,
          }),
        );
        return;
      }
      if (request.url === "/health/ready") {
        const database = await checkDatabaseReadiness(
          this.pool,
          this.environment.BESTEHEN_SCHEMA_MIN_REVISION,
          this.environment.BESTEHEN_SCHEMA_MAX_REVISION,
        );
        const ready =
          !this.stopping && database.connected && database.compatible && this.supervisor.isReady();
        response.writeHead(ready ? 200 : 503).end(
          JSON.stringify({
            version: 1,
            status: ready ? "ready" : "not_ready",
            service: "worker",
            releaseCommit: this.environment.BESTEHEN_RELEASE_COMMIT,
          }),
        );
        return;
      }
      response.writeHead(404).end(JSON.stringify({ status: "not_found" }));
    });
    await new Promise<void>((resolve, reject) => {
      this.server?.once("error", reject);
      this.server?.listen(this.environment.BESTEHEN_WORKER_PORT, "0.0.0.0", () => resolve());
    });
    this.logger.info({
      eventName: "worker_started",
      supervisorState: this.supervisor.status(),
    });
  }

  public async stop(signal: "SIGINT" | "SIGTERM" | "startup_failure"): Promise<void> {
    if (this.stopping) return;
    this.stopping = true;
    this.logger.info({ eventName: "worker_stopping", signal });
    const closeServer = this.server
      ? new Promise<void>((resolve) => this.server?.close(() => resolve()))
      : Promise.resolve();
    let timeout: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        Promise.all([closeServer, this.supervisor.stop(), this.pool.end()]),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error("Worker shutdown exceeded its configured grace period")),
            this.environment.BESTEHEN_SHUTDOWN_GRACE_MS,
          );
        }),
      ]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
    this.logger.info({ eventName: "worker_stopped", signal });
  }
}
