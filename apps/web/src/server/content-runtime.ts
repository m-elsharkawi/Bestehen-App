import {
  appSecuritySecret,
  databaseUrlFor,
  parseServerEnvironmentForService,
} from "@bestehen/configuration";
import {
  AppIdentityService,
  createPostgresPool,
  PostgresContentRepository,
} from "@bestehen/infrastructure";
import type { ContentCommandDependencies } from "./content-commands";

let dependencies: ContentCommandDependencies | undefined;

/**
 * The one composition point for the content command routes. It is separate from the handlers so the
 * handlers stay unit-testable: nothing here is reachable from a test, and nothing there needs a
 * pool, a secret or an environment.
 */
export function getContentCommandDependencies(): ContentCommandDependencies {
  if (dependencies) return dependencies;
  const environment = parseServerEnvironmentForService(process.env, "web");
  const pool = createPostgresPool(databaseUrlFor(environment, "web"));
  const identity = new AppIdentityService(pool, environment, appSecuritySecret(environment));
  dependencies = {
    authenticate: (token) => identity.authenticate(token),
    repository: new PostgresContentRepository(pool),
    now: () => new Date(),
  };
  return dependencies;
}
