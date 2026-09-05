import type { Instruction, TaskFamily } from "@bestehen/content";
import { AttemptShell } from "@bestehen/design-system";
import type { AttemptRuntimeState } from "@bestehen/domain";
import { AttemptClockIsland } from "./islands/attempt-clock";
import { ObjectiveResponseIsland } from "./islands/objective-response";
import type { ObjectiveFormAction } from "./objective-form-state";
import type { ResponseOperation } from "@bestehen/content";
import { ListeningRuntimeIsland } from "./islands/listening-runtime";

export function RuntimeAttemptView({
  action,
  attemptId,
  kind,
  instruction,
  learnerPayload,
  nextSequence,
  resourceVersion,
  startedAt,
  state,
  continuityScope,
  restoredOperations,
  preAttemptExposureClass,
}: {
  readonly action: ObjectiveFormAction;
  readonly attemptId: string;
  readonly kind: "reading" | "language" | "listening";
  readonly instruction: Instruction;
  readonly learnerPayload: TaskFamily;
  readonly nextSequence: number;
  readonly resourceVersion: number;
  readonly startedAt?: string;
  readonly state: AttemptRuntimeState;
  readonly continuityScope?: string;
  readonly restoredOperations?: readonly ResponseOperation[];
  readonly preAttemptExposureClass?:
    | "unseen"
    | "exposed_family"
    | "near_duplicate_family"
    | "answer_exposed";
}) {
  const response = (
    <ObjectiveResponseIsland
      action={action}
      attemptId={attemptId}
      expectedVersion={resourceVersion}
      payload={learnerPayload}
      instruction={instruction}
      sequence={nextSequence}
      startedAt={startedAt ?? new Date(0).toISOString()}
      {...(continuityScope ? { continuityScope } : {})}
      {...(restoredOperations ? { restoredOperations } : {})}
    />
  );
  return (
    <AttemptShell
      action={null}
      showActionBar={false}
      conditions={[
        "Practice timing",
        "Assistance is recorded when used",
        "Server decides validity",
      ]}
      title={
        kind === "language" ? "Language Elements" : kind === "listening" ? "Listening" : "Reading"
      }
    >
      {preAttemptExposureClass && preAttemptExposureClass !== "unseen" ? (
        <p>Seen before · practice only. This task is not a fresh independent check.</p>
      ) : null}
      {kind === "listening" ? (
        <ListeningRuntimeIsland
          attemptId={attemptId}
          continuityScope={continuityScope ?? "unavailable"}
          {...(startedAt ? { startedAt } : {})}
        >
          {response}
        </ListeningRuntimeIsland>
      ) : (
        <>
          {startedAt ? <AttemptClockIsland attemptId={attemptId} startedAt={startedAt} /> : null}
          {response}
        </>
      )}
      {state === "result_available" ? <p>The recorded result is ready for review.</p> : null}
    </AttemptShell>
  );
}
