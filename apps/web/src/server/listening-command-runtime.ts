import {
  appSecuritySecret,
  databaseUrlFor,
  parseServerEnvironmentForService,
} from "@bestehen/configuration";
import { audioCatalogueValidator } from "@bestehen/content";
import {
  AppIdentityService,
  createPostgresPool,
  PostgresListeningRuntime,
} from "@bestehen/infrastructure";
import type { ListeningCommandDependencies } from "./listening-commands";

let dependencies: ListeningCommandDependencies | undefined;
export function getListeningCommandDependencies(): ListeningCommandDependencies {
  if (dependencies) return dependencies;
  const environment = parseServerEnvironmentForService(process.env, "web");
  const pool = createPostgresPool(databaseUrlFor(environment, "web"));
  const identity = new AppIdentityService(pool, environment, appSecuritySecret(environment));
  dependencies = {
    authenticate: (token) => identity.authenticate(token),
    now: () => new Date(),
    // No configured private byte adapter exists yet. Absence must not expose a public fallback.
    runtime: new PostgresListeningRuntime(pool, audioCatalogueValidator, {
      read: async () => undefined,
    }),
  };
  return dependencies;
}
