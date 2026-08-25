import { databaseUrlFor, parseServerEnvironmentForService } from "@bestehen/configuration";
import { checkDatabaseReadiness, createPostgresPool } from "@bestehen/infrastructure";
import type { Pool } from "pg";

let pool: Pool | undefined;

export function livenessPayload(
  releaseCommit = process.env.BESTEHEN_RELEASE_COMMIT ?? "unconfigured",
) {
  return {
    version: 1 as const,
    status: "live" as const,
    service: "web" as const,
    releaseCommit,
  };
}

export async function readinessPayload(): Promise<{
  readonly statusCode: 200 | 503;
  readonly payload: {
    readonly version: 1;
    readonly status: "ready" | "not_ready";
    readonly service: "web";
    readonly releaseCommit: string;
  };
}> {
  try {
    const environment = parseServerEnvironmentForService(process.env, "web");
    pool ??= createPostgresPool(databaseUrlFor(environment, "web"));
    const readiness = await checkDatabaseReadiness(
      pool,
      environment.BESTEHEN_SCHEMA_MIN_REVISION,
      environment.BESTEHEN_SCHEMA_MAX_REVISION,
    );
    const ready = readiness.connected && readiness.compatible;
    return {
      statusCode: ready ? 200 : 503,
      payload: {
        version: 1,
        status: ready ? "ready" : "not_ready",
        service: "web",
        releaseCommit: environment.BESTEHEN_RELEASE_COMMIT,
      },
    };
  } catch {
    return {
      statusCode: 503,
      payload: {
        version: 1,
        status: "not_ready",
        service: "web",
        releaseCommit: process.env.BESTEHEN_RELEASE_COMMIT ?? "unconfigured",
      },
    };
  }
}
