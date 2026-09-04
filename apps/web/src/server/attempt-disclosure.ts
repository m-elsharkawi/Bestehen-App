import type { AttemptId, AuthorizedScope } from "@bestehen/domain";
import type { PostgresAttemptRepository } from "@bestehen/infrastructure";
import { stableId } from "./attempt-command-runtime";
import type { DeterministicAttemptService } from "./attempt-runtime";

/** Speculative delivery is not a display boundary. Focused navigation uses native anchors. */
export function isSpeculativeDisclosure(headers: Pick<Headers, "get">): boolean {
  return (
    headers.get("next-router-prefetch") !== null ||
    /prefetch/i.test(`${headers.get("purpose") ?? ""} ${headers.get("sec-purpose") ?? ""}`)
  );
}

/** Server delivery is conservative disclosure, not proof that a human read the content. */
export async function readDisplayedAttempt(
  runtime: DeterministicAttemptService,
  attempts: Pick<PostgresAttemptRepository, "recordPinnedDisclosure">,
  scope: AuthorizedScope,
  attemptId: AttemptId,
) {
  const loaded = await runtime.readLearnerAttempt(scope, attemptId);
  if (!loaded.ok) return undefined;
  // Audio acquisition/instructions are not exposure to the unheard target stimulus.
  if (loaded.value.attempt.modality === "listening")
    return { ...loaded.value, preAttemptExposureClass: undefined };
  const disclosure = await attempts.recordPinnedDisclosure(scope, {
    attemptId,
    operationId: stableId("operation", `${attemptId}:written-stimulus-disclosure`),
    kind: "written_stimulus",
  });
  return disclosure.ok
    ? { ...loaded.value, preAttemptExposureClass: disclosure.value.preAttemptExposureClass }
    : undefined;
}

export async function readDisplayedResult(
  attempts: Pick<
    PostgresAttemptRepository,
    "readAttempt" | "readCommittedSubmission" | "readDecisiveEvidence" | "recordPinnedDisclosure"
  >,
  scope: AuthorizedScope,
  attemptId: AttemptId,
) {
  const attempt = await attempts.readAttempt(scope, attemptId);
  if (!attempt) return undefined;
  const submission = await attempts.readCommittedSubmission(scope, attemptId);
  if (!submission) return undefined;
  const evidence = await attempts.readDecisiveEvidence(scope, attemptId);
  if (!evidence.ok) return undefined;
  const disclosure = await attempts.recordPinnedDisclosure(scope, {
    attemptId,
    operationId: stableId("operation", `${attemptId}:committed-result-disclosure`),
    kind: "committed_result",
  });
  return disclosure.ok ? { attempt, submission, evidence: evidence.value } : undefined;
}
