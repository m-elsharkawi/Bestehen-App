import { authorize } from "@bestehen/application";
import { assertNoKeyBearingFields } from "@bestehen/content";
import { appId } from "@bestehen/domain";
import type { PostgresAttemptRepository } from "@bestehen/infrastructure";
import { type AttemptCommandDependencies, isDatabaseAppId } from "./attempt-commands";

export type ObjectiveRecovery = NonNullable<
  Awaited<ReturnType<PostgresAttemptRepository["readObjectiveRecovery"]>>
>;

export async function handleAttemptRecovery(
  dependencies: Pick<AttemptCommandDependencies, "authenticate" | "now"> & {
    readonly attempts: Pick<PostgresAttemptRepository, "readObjectiveRecovery">;
  },
  token: string | undefined,
  attemptId: string,
  major = "1",
): Promise<Response> {
  const scope = await dependencies.authenticate(token).catch(() => undefined);
  const authorized = authorize(scope, "attempt:checkpoint", {}, dependencies.now());
  const headers = { "cache-control": "no-store" };
  const unavailable = () =>
    Response.json(
      { status: "unavailable", reasonCode: "FALLBACK.AUTHORIZATION_DENIED" },
      { status: 404, headers },
    );
  if (!authorized.ok || !isDatabaseAppId(attemptId)) return unavailable();
  if (major !== "1")
    return Response.json(
      {
        type: "https://bestehen.invalid/problems/unsupported_contract_major",
        title: "This release speaks contract major 1.",
        status: 400,
        code: "unsupported_contract_major",
        requestId: crypto.randomUUID(),
      },
      { status: 400, headers: { ...headers, "content-type": "application/problem+json" } },
    );
  const recovery = await dependencies.attempts.readObjectiveRecovery(
    authorized.value,
    appId<"attempt">(attemptId),
  );
  if (!recovery) return unavailable();
  const body = { contract: { major: 1, minor: 0 }, ...recovery };
  assertNoKeyBearingFields(body, "objective recovery query");
  return Response.json(body, { headers });
}
