import { appSecuritySecret, databaseUrlFor, parseServerEnvironment } from "@bestehen/configuration";
import { AppIdentityService, createPostgresPool } from "@bestehen/infrastructure";

let identityService: AppIdentityService | undefined;

export function getIdentityService(): AppIdentityService {
  if (identityService) return identityService;
  const environment = parseServerEnvironment(process.env);
  identityService = new AppIdentityService(
    createPostgresPool(databaseUrlFor(environment, "web")),
    environment,
    appSecuritySecret(environment),
  );
  return identityService;
}
