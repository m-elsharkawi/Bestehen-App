import type { Instruction, TaskFamily } from "@bestehen/content";
import { AttemptShell } from "@bestehen/design-system";
import type { AttemptRuntimeState } from "@bestehen/domain";
import { AttemptClockIsland } from "./islands/attempt-clock";
import { ObjectiveResponseIsland } from "./islands/objective-response";
import type { ObjectiveFormAction } from "./objective-form-state";
import type { ResponseOperation } from "@bestehen/content";

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
}: {
  readonly action: ObjectiveFormAction;
  readonly attemptId: string;
  readonly kind: "reading" | "language";
  readonly instruction: Instruction;
  readonly learnerPayload: TaskFamily;
  readonly nextSequence: number;
  readonly resourceVersion: number;
  readonly startedAt?: string;
  readonly state: AttemptRuntimeState;
  readonly continuityScope?: string;
  readonly restoredOperations?: readonly ResponseOperation[];
}) {
  return (
    <AttemptShell
      action={null}
      showActionBar={false}
      conditions={[
        "Practice timing",
        "Assistance is recorded when used",
        "Server decides validity",
      ]}
      title={kind === "language" ? "Language Elements" : "Reading"}
    >
      {startedAt ? <AttemptClockIsland attemptId={attemptId} startedAt={startedAt} /> : null}
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
      {state === "result_available" ? <p>The recorded result is ready for review.</p> : null}
    </AttemptShell>
  );
}
