import type { TaskFamily } from "@bestehen/content";
import { AttemptShell } from "@bestehen/design-system";
import type { AttemptRuntimeState } from "@bestehen/domain";
import { AttemptClockIsland } from "./islands/attempt-clock";
import { ObjectiveResponseIsland } from "./islands/objective-response";

export function RuntimeAttemptView({
  action,
  attemptId,
  kind,
  learnerPayload,
  nextSequence,
  resourceVersion,
  startedAt,
  state,
}: {
  readonly action: (formData: FormData) => void | Promise<void>;
  readonly attemptId: string;
  readonly kind: "reading" | "language";
  readonly learnerPayload: TaskFamily;
  readonly nextSequence: number;
  readonly resourceVersion: number;
  readonly startedAt?: string;
  readonly state: AttemptRuntimeState;
}) {
  return (
    <AttemptShell
      action={null}
      conditions={["Practice timing", "No answer-bearing help", "Server decides validity"]}
      title={kind === "language" ? "Language Elements" : "Reading"}
    >
      {startedAt ? <AttemptClockIsland startedAt={startedAt} /> : null}
      <ObjectiveResponseIsland
        action={action}
        attemptId={attemptId}
        expectedVersion={resourceVersion}
        payload={learnerPayload}
        sequence={nextSequence}
        startedAt={startedAt ?? new Date(0).toISOString()}
      />
      {state === "result_available" ? <p>The recorded result is ready for review.</p> : null}
    </AttemptShell>
  );
}
