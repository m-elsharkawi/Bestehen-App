import {
  createLogger,
  databaseUrlFor,
  parseServerEnvironmentForService,
} from "@bestehen/configuration";
import { migrateDatabase } from "./index.js";

async function main(): Promise<void> {
  const environment = parseServerEnvironmentForService(process.env, "migrator");
  const logger = createLogger({
    service: "migrator",
    environment: environment.BESTEHEN_APP_ENV,
    releaseCommit: environment.BESTEHEN_RELEASE_COMMIT,
    level: environment.BESTEHEN_LOG_LEVEL,
  });
  const result = await migrateDatabase(databaseUrlFor(environment, "migrator"));
  logger.info({
    eventName: "migration_completed",
    fromRevision: result.fromRevision,
    toRevision: result.toRevision,
    appliedCount: result.applied.length,
  });
}

main().catch((error: unknown) => {
  process.stderr.write(
    `Migration failed: ${error instanceof Error ? error.message : "unknown error"}\n`,
  );
  process.exitCode = 1;
});
