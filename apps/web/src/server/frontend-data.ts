import { databaseUrlFor, parseServerEnvironmentForService } from "@bestehen/configuration";
import { assertNoKeyBearingFields } from "@bestehen/content";
import { appId, type AuthorizedScope } from "@bestehen/domain";
import {
  createPostgresPool,
  PostgresAttemptRepository,
  PostgresContentRepository,
} from "@bestehen/infrastructure";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { syntheticFixtureEnabled } from "./runtime";
import { getIdentityService } from "./identity";

export const protectedRouteKinds = [
  "coach",
  "readiness",
  "train",
  "progress",
  "settings",
  "settings-data",
] as const;
export type ProtectedRouteKind = (typeof protectedRouteKinds)[number];

const paths: Record<ProtectedRouteKind, string> = {
  coach: "/coach",
  readiness: "/readiness",
  train: "/train",
  progress: "/progress",
  settings: "/settings",
  "settings-data": "/settings/data",
};

export function safeHeldDestination(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "/coach";
  return (protectedRouteKinds as readonly string[]).includes(value)
    ? paths[value as ProtectedRouteKind]
    : "/coach";
}

export async function requirePersonalSession(returnPath: string): Promise<void> {
  await requireAuthorizedScope(returnPath);
}

/**
 * The route boundary returns the server-authorized learner scope rather than trusting an id in the
 * URL.  A missing, expired, or cross-scope attempt is deliberately indistinguishable to callers.
 */
export async function requireAuthorizedScope(returnPath: string): Promise<AuthorizedScope> {
  const cookieStore = await cookies();
  const token = cookieStore.get(appSessionCookie.name)?.value;
  const requestHeaders = await headers();
  let authorized =
    syntheticFixtureEnabled() && requestHeaders.get("x-bestehen-synthetic-auth") === "1";
  if (!authorized) {
    try {
      authorized = Boolean(await getIdentityService().authenticate(token));
    } catch {
      authorized = false;
    }
  }
  if (!authorized) redirect(`/auth/login?returnTo=${encodeURIComponent(returnPath)}`);
  const scope = await getIdentityService().authenticate(token);
  if (!scope) redirect(`/auth/login?returnTo=${encodeURIComponent(returnPath)}`);
  return scope;
}

let runtimeRepositories:
  | { readonly attempts: PostgresAttemptRepository; readonly content: PostgresContentRepository }
  | undefined;

function repositories() {
  if (runtimeRepositories) return runtimeRepositories;
  const environment = parseServerEnvironmentForService(process.env, "web");
  const pool = createPostgresPool(databaseUrlFor(environment, "web"));
  runtimeRepositories = {
    attempts: new PostgresAttemptRepository(pool),
    content: new PostgresContentRepository(pool),
  };
  return runtimeRepositories;
}

export async function requireAttemptScope(attemptId: string, returnPath: string) {
  const scope = await requireAuthorizedScope(returnPath);
  const attempt = await repositories().attempts.readAttempt(scope, appId<"attempt">(attemptId));
  if (!attempt) return undefined;
  return { scope, attempt };
}

export async function loadAttemptProjection(attemptId: string, returnPath: string) {
  const scoped = await requireAttemptScope(attemptId, returnPath);
  if (!scoped) return undefined;
  const manifest = scoped.attempt.servingManifestId
    ? await repositories().content.readServingManifest(
        scoped.scope,
        scoped.attempt.servingManifestId,
      )
    : undefined;
  if (!manifest) return undefined;
  const projection = {
    attempt: scoped.attempt,
    manifest: {
      servingManifestId: manifest.servingManifestId,
      entries: manifest.entries.map((entry) => ({
        ordinal: entry.ordinal,
        contentRevisionId: entry.contentRevisionId,
        ...(entry.contentItemId ? { contentItemId: entry.contentItemId } : {}),
        ...(entry.mediaRevisionId ? { mediaRevisionId: entry.mediaRevisionId } : {}),
      })),
      allowedConditions: manifest.allowedConditions,
      expiresAt: manifest.expiresAt.toISOString(),
      revocationState: manifest.revocationState,
    },
  };
  // This application boundary is intentionally here: web may import content, infrastructure may not.
  assertNoKeyBearingFields(projection, "active-attempt learner projection");
  return projection;
}

export async function loadResultProjection(attemptId: string, returnPath: string) {
  const scoped = await requireAttemptScope(attemptId, returnPath);
  if (!scoped) return undefined;
  const submission = await repositories().attempts.readCommittedSubmission(
    scoped.scope,
    scoped.attempt.attemptId,
  );
  if (!submission) return undefined;
  const evidence = await repositories().attempts.readDecisiveEvidence(
    scoped.scope,
    scoped.attempt.attemptId,
  );
  if (!evidence.ok) return undefined;
  return { attempt: scoped.attempt, submission, evidence: evidence.value };
}
