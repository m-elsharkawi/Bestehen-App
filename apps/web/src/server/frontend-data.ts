import { databaseUrlFor, parseServerEnvironmentForService } from "@bestehen/configuration";
import { type AuthorizedScope, appId } from "@bestehen/domain";
import {
  appSessionCookie,
  createPostgresPool,
  PostgresAttemptRepository,
  PostgresContentRepository,
} from "@bestehen/infrastructure";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { stableId } from "./attempt-command-runtime";
import { DeterministicAttemptService } from "./attempt-runtime";
import { loadFoundationRoute, recordFoundationPreference } from "./foundation-runtime";
import { getIdentityService } from "./identity";
import { syntheticFixtureEnabled } from "./runtime";

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

const databaseAppIdPattern =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export function safeHeldDestination(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "/coach";
  return (protectedRouteKinds as readonly string[]).includes(value)
    ? paths[value as ProtectedRouteKind]
    : "/coach";
}

export async function requirePersonalSession(returnPath: string): Promise<void> {
  await requireAuthorizedScope(returnPath);
}

const syntheticScope: AuthorizedScope = {
  principalId: appId<"principal">("11111111-1111-4111-8111-111111111111"),
  learnerScopeId: appId<"learner_scope">("22222222-2222-4222-8222-222222222222"),
  actorKind: "owner",
  capabilities: [],
  authenticatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export async function isSyntheticFixtureRequest(): Promise<boolean> {
  const requestHeaders = await headers();
  return syntheticFixtureEnabled() && requestHeaders.get("x-bestehen-synthetic-auth") === "1";
}

/**
 * The route boundary returns the server-authorized learner scope rather than trusting an id in the
 * URL.  A missing, expired, or cross-scope attempt is deliberately indistinguishable to callers.
 */
export async function requireAuthorizedScope(returnPath: string): Promise<AuthorizedScope> {
  const cookieStore = await cookies();
  const token = cookieStore.get(appSessionCookie.name)?.value;
  if (await isSyntheticFixtureRequest()) return syntheticScope;
  let scope: AuthorizedScope | undefined;
  try {
    scope = await getIdentityService().authenticate(token);
  } catch {
    scope = undefined;
  }
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
  if (!databaseAppIdPattern.test(attemptId)) return undefined;
  const attempt = await repositories().attempts.readAttempt(scope, appId<"attempt">(attemptId));
  if (!attempt) return undefined;
  return { scope, attempt };
}

export async function loadAttemptProjection(attemptId: string, returnPath: string) {
  const scoped = await requireAttemptScope(attemptId, returnPath);
  if (!scoped) return undefined;
  const loaded = await new DeterministicAttemptService(
    repositories(),
    stableId,
    () => new Date(),
  ).readLearnerAttempt(scoped.scope, scoped.attempt.attemptId);
  return loaded.ok ? loaded.value : undefined;
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

export async function loadFoundationProjection(sessionId: string, returnPath: string) {
  const scope = await requireAuthorizedScope(returnPath);
  if (!databaseAppIdPattern.test(sessionId)) return undefined;
  const result = await loadFoundationRoute(repositories().attempts, scope, sessionId, new Date());
  return result.ok ? result.value : undefined;
}

export async function saveFoundationPreference(
  sessionId: string,
  factKind: "target_exam_context_v1" | "access_preferences_v1",
  payload: unknown,
  returnPath: string,
): Promise<boolean> {
  const scope = await requireAuthorizedScope(returnPath);
  if (!databaseAppIdPattern.test(sessionId)) return false;
  const result = await recordFoundationPreference(
    repositories().attempts,
    scope,
    sessionId,
    factKind,
    payload,
    new Date(),
  );
  return result.ok;
}
