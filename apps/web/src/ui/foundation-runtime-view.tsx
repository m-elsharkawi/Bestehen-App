import { AppShell, NativeButton, SemanticCard, Sequence } from "@bestehen/design-system";
import type { FoundationRouteProjection } from "../server/foundation-runtime";

type FormAction = (formData: FormData) => void | Promise<void>;

function objectValue(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

const skillLabels = {
  reading: "Reading",
  language_elements: "Language Elements",
  listening: "Listening",
} as const;

export function FoundationRuntimeView({
  projection,
  saveAccess,
  saveTarget,
  startAttempt,
}: {
  readonly projection: FoundationRouteProjection;
  readonly saveAccess: FormAction;
  readonly saveTarget: FormAction;
  readonly startAttempt: FormAction;
}) {
  const target = objectValue(projection.targetExamContext);
  const access = objectValue(projection.accessPreferences);
  const availableComplete = projection.completedSkills.filter(
    (skill) => skill === "reading" || skill === "language_elements" || skill === "listening",
  ).length;
  return (
    <AppShell backHref="/coach" kind="focused" title="Five-skill foundation">
      <Sequence
        current={Math.min(availableComplete + 1, 5)}
        steps={["Reading", "Language Elements", "Listening", "Writing", "Speaking"]}
      />
      <p>
        Completed parts stay recorded. Partial work adds evidence building and never assigns a
        placement or level.
      </p>
      <SemanticCard title="Planning horizon">
        <p>
          Your planning horizon is {projection.planningHorizonYears} years. The official target
          reference remains {projection.officialTargetYears}. These values remain separate.
        </p>
      </SemanticCard>
      <SemanticCard title="Continue the available sequence">
        {projection.nextSkill && projection.activityOccurrenceId ? (
          <form action={startAttempt}>
            <input name="sessionId" type="hidden" value={projection.sessionId} />
            <NativeButton type="submit">
              Continue with {skillLabels[projection.nextSkill]}
            </NativeButton>
          </form>
        ) : (
          <p>The available Reading, Language Elements, and Listening checkpoints are complete.</p>
        )}
      </SemanticCard>
      {projection.unavailableSkills.map((entry) => (
        <SemanticCard
          key={entry.skill}
          status="attention"
          title={entry.skill === "writing" ? "Writing" : "Speaking"}
        >
          <p>Unavailable in this release. That is our content gap, not a result about you.</p>
        </SemanticCard>
      ))}
      <SemanticCard title="Exam context">
        <form action={saveTarget}>
          <input name="sessionId" type="hidden" value={projection.sessionId} />
          <div className="field">
            <label htmlFor="foundation-target-mode">Date status</label>
            <select
              defaultValue={String(target.mode ?? "no_date")}
              id="foundation-target-mode"
              name="mode"
            >
              <option value="no_date">No date</option>
              <option value="target_month">Target month</option>
              <option value="booked_date">Booked date</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="foundation-target-value">Month (YYYY-MM) or date (YYYY-MM-DD)</label>
            <input
              defaultValue={String(target.value ?? "")}
              id="foundation-target-value"
              name="value"
              type="text"
            />
          </div>
          <NativeButton type="submit">Save exam context</NativeButton>
        </form>
      </SemanticCard>
      <SemanticCard title="Access preferences">
        <form action={saveAccess}>
          <input name="sessionId" type="hidden" value={projection.sessionId} />
          <fieldset>
            <legend>Preferences for this route</legend>
            <label htmlFor="foundation-reduced-motion">
              <input
                defaultChecked={access.reducedMotion === true}
                id="foundation-reduced-motion"
                name="reducedMotion"
                type="checkbox"
              />
              Prefer reduced motion
            </label>
            <label htmlFor="foundation-forced-colors">
              <input
                defaultChecked={access.forcedColors === true}
                id="foundation-forced-colors"
                name="forcedColors"
                type="checkbox"
              />
              Use forced colors
            </label>
            <label htmlFor="foundation-audio-available">
              <input
                defaultChecked={access.audioAvailable === true}
                id="foundation-audio-available"
                name="audioAvailable"
                type="checkbox"
              />
              Audio is available
            </label>
            <label htmlFor="foundation-captions-preferred">
              <input
                defaultChecked={access.captionsPreferred === true}
                id="foundation-captions-preferred"
                name="captionsPreferred"
                type="checkbox"
              />
              Prefer captions
            </label>
          </fieldset>
          <NativeButton type="submit">Save access preferences</NativeButton>
        </form>
      </SemanticCard>
    </AppShell>
  );
}
