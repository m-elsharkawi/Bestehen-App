import type { ReactNode } from "react";
import { useId } from "react";
import { isSupportedProjectionCard, type ProjectionCardContract } from "./contracts.js";
import { componentFamilies } from "./coverage/source-anchors.js";
import { Icon } from "./icons.js";
import { Overlay } from "./overlay.js";
import { Action, SemanticCard, StatusWord } from "./primitives.js";
import { AppShell, AttemptShell, MockShell } from "./shells.js";

export { Overlay } from "./overlay.js";

export function Sequence({
  steps,
  current,
}: {
  readonly steps: readonly string[];
  readonly current: number;
}) {
  return (
    <ol className="sequence">
      {steps.map((step, index) => (
        <li aria-current={index === current ? "step" : undefined} key={step}>
          <span>{index < current ? "Completed" : index === current ? "Current" : "Upcoming"}</span>{" "}
          {step}
        </li>
      ))}
    </ol>
  );
}
export const Button = Action;
export const InlineAction = Action;
export type ChoiceNavVariant = "segmented" | "tabs" | "chip";
export function ChoiceNav({ variant = "segmented" }: { readonly variant?: ChoiceNavVariant }) {
  if (variant === "tabs") {
    return (
      <div aria-label="Example choices" role="tablist">
        <button aria-selected="true" role="tab" type="button">
          Current
        </button>
        <button aria-selected="false" role="tab" type="button">
          Other
        </button>
      </div>
    );
  }
  if (variant === "chip") {
    return (
      <fieldset>
        <legend>Example choices</legend>
        <button aria-pressed="true" type="button">
          Current
        </button>
        <button aria-pressed="false" type="button">
          Other
        </button>
      </fieldset>
    );
  }
  return (
    <nav aria-label="Example choices">
      <a aria-current="page" href="#choice-current">
        Current
      </a>{" "}
      <a href="#choice-other">Other</a>
    </nav>
  );
}
export type BinaryChoiceVariant = "toggle" | "checkbox" | "radio";
export function BinaryChoice({
  legend = "Choose an option",
  variant = "radio",
}: {
  readonly legend?: string;
  readonly variant?: BinaryChoiceVariant;
}) {
  const name = useId();
  if (variant === "toggle") {
    return (
      <button aria-pressed="false" type="button">
        {legend}
      </button>
    );
  }
  return (
    <fieldset>
      <legend>{legend}</legend>
      <label>
        <input name={name} type={variant === "checkbox" ? "checkbox" : "radio"} /> Yes
      </label>
      <label>
        <input name={name} type={variant === "checkbox" ? "checkbox" : "radio"} /> No
      </label>
    </fieldset>
  );
}
export function Field({
  label = "Response",
  error,
  id: explicitId,
  variant = "text",
}: {
  readonly label?: string;
  readonly error?: string;
  readonly id?: string;
  readonly variant?: "text" | "select" | "date" | "month" | "schedule";
}) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {variant === "select" ? (
        <select
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          id={id}
        >
          <option>Choose one</option>
        </select>
      ) : (
        <input
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          id={id}
          type={variant === "schedule" ? "datetime-local" : variant}
        />
      )}
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
export type AnswerChoiceVariant = "single" | "multiple" | "revealed";
export function AnswerChoice({
  legend = "Choose the answer",
  variant = "single",
}: {
  readonly legend?: string;
  readonly variant?: AnswerChoiceVariant;
}) {
  return (
    <>
      <BinaryChoice legend={legend} variant={variant === "multiple" ? "checkbox" : "radio"} />
      {variant === "revealed" ? <p role="status">Answer revealed after submission.</p> : null}
    </>
  );
}
export function MatchingPair() {
  return (
    <fieldset>
      <legend>Match each item</legend>
      <p>Select an item, then choose its numbered position.</p>
      <button type="button">Select item A</button>
      <button type="button">Place in position 1</button>
      <button type="button">Reset matches</button>
    </fieldset>
  );
}
export function ClozeGap({ number = 1 }: { readonly number?: number }) {
  return (
    <label className="cloze-gap">
      Gap {number}
      <input aria-label={`Answer for gap ${number}`} />
    </label>
  );
}
export function ReorderList() {
  return (
    <section>
      <h2>Put the steps in order</h2>
      <ol>
        <li>
          First item <button type="button">Move down</button>
        </li>
        <li>
          Second item <button type="button">Move up</button>
        </li>
      </ol>
    </section>
  );
}
export type FormError = string | { readonly message: string; readonly href: `#${string}` };
export function FormFeedback({ errors }: { readonly errors: readonly FormError[] }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="error-summary" tabIndex={-1}>
      <h2 id={headingId}>Check your answers</h2>
      <ul>
        {errors.map((error) => {
          const message = typeof error === "string" ? error : error.message;
          return (
            <li key={message}>
              {typeof error === "string" ? message : <a href={error.href}>{message}</a>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
export function Recommendation() {
  return (
    <SemanticCard title="Recommended next">
      <p>Repair one content-point pattern in about five minutes.</p>
      <details>
        <summary>Why this</summary>
        <p>A current direct sample supports this reason.</p>
      </details>
    </SemanticCard>
  );
}
export function SessionDurationPicker() {
  const groupName = useId();
  return (
    <fieldset>
      <legend>Session duration</legend>
      {[
        ["Quick", "10 minutes"],
        ["Standard", "20 minutes"],
        ["Extended", "30 minutes"],
      ].map(([label, duration]) => (
        <label key={label}>
          <input name={groupName} type="radio" />
          {label}, {duration}
        </label>
      ))}
    </fieldset>
  );
}
export function CoachMessage() {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Plan note</h2>
      <p>Complete one focused repair, then use a fresh check.</p>
      <Action href="#coach-action" label="Start repair" />
    </section>
  );
}

export function ProjectionCard({ projection }: { readonly projection: ProjectionCardContract }) {
  if (!isSupportedProjectionCard(projection)) {
    throw new Error("Unsupported consequential UI projection");
  }
  const announcementRole = projection.announcement === "assertive" ? "alert" : "status";
  const focusable = projection.focusTarget !== "none";
  return (
    <section
      aria-live={projection.announcement === "none" ? undefined : projection.announcement}
      data-focus-target={projection.focusTarget}
      data-source-cut={projection.source.sourceCut}
      data-source-release={projection.source.release}
      role={projection.announcement === "none" ? undefined : announcementRole}
      tabIndex={focusable ? -1 : undefined}
    >
      <SemanticCard status={projection.status} title={projection.title}>
        <StatusWord status={projection.status === "neutral" ? "system" : projection.status}>
          {projection.state.replaceAll("_", " ")}
        </StatusWord>
        <p>{projection.message}</p>
        {projection.affectedScope.length > 0 ? (
          <p>
            <strong>Affected:</strong> {projection.affectedScope.join(", ")}
          </p>
        ) : null}
        {projection.action ? (
          <Action href={projection.action.href} label={projection.action.label} />
        ) : null}
      </SemanticCard>
      <p className="visually-hidden">
        Source cut {projection.source.sourceCut}, release {projection.source.release}
      </p>
    </section>
  );
}

export const ResultCard = ProjectionCard;
export function DecisiveEvidence() {
  return (
    <SemanticCard title="Decisive evidence">
      <blockquote lang="de">Vielen Dank für die Einladung.</blockquote>
      <dl>
        <dt>Condition</dt>
        <dd>No answer-bearing help</dd>
        <dt>Recorded</dt>
        <dd>
          <time dateTime="2026-08-26">26 August 2026</time>
        </dd>
      </dl>
    </SemanticCard>
  );
}
export function RepairCard() {
  return (
    <SemanticCard title="Repair one pattern">
      <p>Check every requested content point before writing.</p>
      <p lang="de">
        <strong>Example:</strong> Ich komme gern und bringe einen Salat mit.
      </p>
      <Action label="Try a fresh prompt" />
    </SemanticCard>
  );
}
export function HintDisclosure() {
  return (
    <details>
      <summary>Show hint and consequence</summary>
      <p>Using this hint changes the attempt condition label, not the answer.</p>
    </details>
  );
}
export type FreshCheckState = "available" | "unavailable";
export function FreshCheckBanner({ state = "available" }: { readonly state?: FreshCheckState }) {
  if (state === "unavailable") {
    return (
      <SemanticCard status="system" title="Fresh check unavailable">
        <p>A fresh check cannot be prepared right now. Your current evidence is unchanged.</p>
      </SemanticCard>
    );
  }
  return (
    <SemanticCard status="positive" title="Fresh check available">
      <p>Use a new prompt without answer-bearing help.</p>
      <Action label="Start fresh check" />
    </SemanticCard>
  );
}
export type WhatChangedState = "changed" | "unchanged" | "returns_due";
export function WhatChangedSummary({ state = "changed" }: { readonly state?: WhatChangedState }) {
  const summary =
    state === "changed"
      ? [
          "Two content points missing",
          "All requested points present",
          "Return tomorrow for one fresh check.",
        ]
      : state === "unchanged"
        ? [
            "Two content points missing",
            "Two content points still need evidence",
            "Keep the current repair plan.",
          ]
        : [
            "A fresh check was recorded",
            "A return review is due",
            "Return today for one fresh check.",
          ];
  return (
    <section>
      <h2>What changed</h2>
      <dl>
        <dt>Before</dt>
        <dd>{summary[0]}</dd>
        <dt>Now</dt>
        <dd>{summary[1]}</dd>
      </dl>
      <p>{summary[2]}</p>
    </section>
  );
}
export function EvidenceLabel({
  validity,
  reason,
  eligibility,
}: {
  readonly validity: "valid" | "partially_valid" | "pending" | "interrupted" | "not_counted";
  readonly reason: string;
  readonly eligibility?: string;
}) {
  return (
    <p className="evidence-label">
      <strong>{validity.replaceAll("_", " ")}</strong> {reason}
      {eligibility ? <span> · {eligibility}</span> : null}
    </p>
  );
}
export type WeaknessState = "due" | "improving" | "stale" | "contradicted" | "empty";
export function WeaknessCard({ state = "improving" }: { readonly state?: WeaknessState }) {
  const detail: Record<WeaknessState, readonly [string, string]> = {
    due: ["Due", "Review this content point today."],
    improving: ["Improving", "Next review tomorrow."],
    stale: ["Stale", "Fresh evidence is due before this claim is used."],
    contradicted: ["Contradicted", "Two samples disagree; both remain visible."],
    empty: ["No evidence yet", "Absence is not a score or rank."],
  };
  return (
    <article className="card">
      <h2>Content-point coverage</h2>
      <p>
        <strong>{detail[state][0]}</strong>
      </p>
      <p>{detail[state][1]} No level or rank is assigned.</p>
      <a href="#weakness-detail">Open detail</a>
    </article>
  );
}
export type DueReviewState = "due" | "soon" | "later" | "empty";
export function DueReviewGroup({ state = "due" }: { readonly state?: DueReviewState }) {
  const group: Record<DueReviewState, readonly [string, string, string] | null> = {
    due: ["Due now, 1", "today", "2026-08-26"],
    soon: ["Due soon, 1", "tomorrow", "2026-08-27"],
    later: ["Due later, 1", "next week", "2026-09-02"],
    empty: null,
  };
  if (!group[state]) {
    return (
      <section>
        <h2>No reviews due</h2>
        <p>No review is due in this group.</p>
      </section>
    );
  }
  return (
    <section>
      <h2>{group[state][0]}</h2>
      <ul>
        <li>
          <a href="#review-content-points">Content-point coverage</a>{" "}
          <time dateTime={group[state][2]}>{group[state][1]}</time>
        </li>
      </ul>
    </section>
  );
}
export const PendingBanner = ProjectionCard;
export type SystemFailureKind = "identity" | "media" | "capability" | "transfer" | "storage";
const systemFailureCopy: Record<SystemFailureKind, string> = {
  identity: "Sign-in confirmation is unavailable.",
  media: "A recording or file cannot be read.",
  capability: "This device cannot complete the requested step.",
  transfer: "Transfer status cannot be confirmed.",
  storage: "Saved evidence cannot be opened.",
};
export function SystemFailureBanner({
  kind,
  projection,
}: {
  readonly kind: SystemFailureKind;
  readonly projection: ProjectionCardContract;
}) {
  return (
    <div data-failure-kind={kind}>
      <ProjectionCard projection={projection} />
      <p>{systemFailureCopy[kind]}</p>
    </div>
  );
}
export type ContradictionState = "new" | "under_review" | "resolved";
export function ContradictionNotice({ state = "new" }: { readonly state?: ContradictionState }) {
  const copy: Record<ContradictionState, string> = {
    new: "A recent fresh check conflicts with an earlier sample. Both remain visible while the affected Writing claim is reviewed.",
    under_review:
      "The conflicting samples remain visible while the affected Writing claim is under review.",
    resolved: "The review is resolved; the retained evidence and decision remain visible.",
  };
  return (
    <SemanticCard status="attention" title="Evidence needs review">
      <p>{copy[state]}</p>
    </SemanticCard>
  );
}
export type StaleEvidenceState = "stale" | "due" | "scheduled";
export function StaleEvidenceNotice({ state = "stale" }: { readonly state?: StaleEvidenceState }) {
  const copy: Record<StaleEvidenceState, string> = {
    stale:
      "The current sample is older than the accepted window. Recheck Writing before using this claim.",
    due: "Fresh evidence is due before this Writing claim can support readiness.",
    scheduled: "A fresh Writing check is scheduled; the current claim remains stale until then.",
  };
  return (
    <SemanticCard status="system" title="Fresh evidence due">
      <p>{copy[state]}</p>
      <Action label="Schedule recheck" />
    </SemanticCard>
  );
}

export interface ReadinessEvidenceProps {
  readonly state:
    | "evidence_building"
    | "not_ready"
    | "borderline"
    | "safe"
    | "ready_to_book"
    | "stale_contradicted";
  readonly written?: number;
  readonly oral?: number;
  readonly gates: readonly {
    readonly id: "A" | "B" | "C" | "D" | "E" | "F";
    readonly met: boolean;
    readonly reason: string;
  }[];
}
export function ReadinessEvidence({ state, written, oral, gates }: ReadinessEvidenceProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="readiness-evidence">
      <h2 id={headingId}>Readiness evidence</h2>
      <p>
        <StatusWord
          status={
            state === "safe" || state === "ready_to_book"
              ? "positive"
              : state === "borderline"
                ? "attention"
                : state === "not_ready"
                  ? "risk"
                  : "system"
          }
        >
          {state.replaceAll("_", " ")}
        </StatusWord>
      </p>
      <p>
        Written and Oral remain independent. The official line is 60; the current personal margin is
        65.
      </p>
      <table>
        <caption>Current component evidence</caption>
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Estimate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Written</th>
            <td>{written ?? "Not enough evidence"}</td>
          </tr>
          <tr>
            <th scope="row">Oral</th>
            <td>{oral ?? "Not enough evidence"}</td>
          </tr>
        </tbody>
      </table>
      <h3>Ready to Book gates A through F</h3>
      <ul className="gate-list">
        {gates.map((gate) => (
          <li data-status={gate.met ? "positive" : "attention"} key={gate.id}>
            <strong>
              Gate {gate.id}: {gate.met ? "met" : "not met"}
            </strong>
            <span>{gate.reason}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
export type ChangeTimelineState = "events" | "empty";
export function ChangeTimeline({ state = "events" }: { readonly state?: ChangeTimelineState }) {
  if (state === "empty") {
    return (
      <section>
        <h2>Evidence changes</h2>
        <p>No evidence changes have been recorded.</p>
      </section>
    );
  }
  return (
    <section>
      <h2>Evidence changes</h2>
      <ol>
        <li>
          <time dateTime="2026-08-26">26 August</time> Fresh Writing sample recorded.{" "}
          <a href="#evidence">Open evidence</a>
        </li>
        <li>
          <time dateTime="2026-08-20">20 August</time> Earlier assertion retained.
        </li>
      </ol>
    </section>
  );
}
export type MilestoneState = "achieved" | "current" | "upcoming" | "withdrawn";
export function MilestoneRow({ state = "current" }: { readonly state?: MilestoneState }) {
  const copy: Record<MilestoneState, string> = {
    achieved: "Achieved: Direct B1 Writing sample retained",
    current: "Current: Direct B1 Writing sample recorded",
    upcoming: "Upcoming: Direct B1 Writing sample planned",
    withdrawn: "Withdrawn: Direct B1 Writing sample is no longer used",
  };
  return (
    <p>
      <strong>{copy[state]}</strong> <time dateTime="2026-08-26">26 August</time>.
    </p>
  );
}
export function MockOutcome() {
  return (
    <section>
      <h2>Mock outcome</h2>
      <EvidenceLabel
        reason="One measured block completed under comparable conditions."
        validity="partially_valid"
      />
      <table>
        <caption>Comparable raw points</caption>
        <thead>
          <tr>
            <th scope="col">Block</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Written block 1</th>
            <td>32 of 45</td>
          </tr>
          <tr>
            <th scope="row">Oral</th>
            <td>Pending, no number</td>
          </tr>
        </tbody>
      </table>
      <h3>Priorities</h3>
      <ol>
        <li>Complete one fresh Oral sample.</li>
      </ol>
    </section>
  );
}
export function TextAlternativeTable() {
  return (
    <table>
      <caption>Evidence shown in the graphic</caption>
      <thead>
        <tr>
          <th scope="col">Area</th>
          <th scope="col">State</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Written</th>
          <td>Evidence building</td>
        </tr>
      </tbody>
    </table>
  );
}

export function ReadingRegion() {
  return (
    <article lang="de">
      <h2>Lesen</h2>
      <p>Lesen Sie den Text und wählen Sie die passende Antwort.</p>
      <AnswerChoice />
    </article>
  );
}
export function LanguageElementsRegion() {
  return (
    <article lang="de">
      <h2>Sprachbausteine</h2>
      <p>
        Ich freue mich <ClozeGap number={1} /> Ihre Antwort.
      </p>
    </article>
  );
}
export function ListeningRegion() {
  return (
    <section>
      <h2>Hören</h2>
      {/* biome-ignore lint/a11y/useMediaCaption: timed text is intentionally unavailable during this exam task */}
      <audio aria-label="Listening task audio" controls preload="none" />
      <p>Replay limit: two. No transcript is available during this task.</p>
    </section>
  );
}
export function WritingRegion() {
  const draftId = useId();
  return (
    <section className="writing-region">
      <div lang="de">
        <h2>Schreiben</h2>
        <p>Antworten Sie auf die Einladung und behandeln Sie alle Punkte.</p>
      </div>
      <div className="field">
        <label htmlFor={draftId}>Your draft</label>
        <textarea id={draftId} rows={12} />
        <p>Saved locally on this device. The server has not accepted this draft as evidence.</p>
      </div>
    </section>
  );
}
export function SpeakingRegion() {
  return (
    <section>
      <h2>Speaking</h2>
      <p>Microphone access begins only after you choose Start recording.</p>
      <button className="action action-primary" type="button">
        <Icon name="speaking" />
        Start recording
      </button>
      <p role="status">Not recording</p>
    </section>
  );
}

export function DraftConflict() {
  const headingId = useId();
  const name = useId();
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Two saved drafts need your choice</h2>
      <p>Both branches are preserved. Compare them before selecting or merging.</p>
      <div className="draft-compare">
        <article>
          <h3>This device</h3>
          <p lang="de">Vielen Dank für die Einladung.</p>
        </article>
        <article>
          <h3>Server checkpoint</h3>
          <p lang="de">Danke für Ihre Einladung.</p>
        </article>
      </div>
      <fieldset>
        <legend>Resolve the draft</legend>
        <label>
          <input name={name} type="radio" />
          Keep this device
        </label>
        <label>
          <input name={name} type="radio" />
          Keep server checkpoint
        </label>
        <label>
          <input name={name} type="radio" />
          Merge into a new draft
        </label>
      </fieldset>
    </section>
  );
}

export function SessionNotice({
  state,
}: {
  readonly state:
    | "signed_out"
    | "callback_failed"
    | "expired_idle"
    | "expired_mid_attempt"
    | "access_denied";
}) {
  const copy =
    state === "expired_mid_attempt"
      ? "Your draft, elapsed time, and attempt conditions are preserved. The server will decide the final validity after you sign in."
      : state === "access_denied"
        ? "This account cannot open that personal area."
        : "Sign in with the owner's email code to continue.";
  return (
    <SemanticCard status="system" title={state.replaceAll("_", " ")}>
      <p>{copy}</p>
      <Action href="/auth/login" label="Continue to sign in" />
    </SemanticCard>
  );
}
export function UploadStatus({
  state,
  progress,
}: {
  readonly state: "preparing" | "sending" | "queued_offline" | "retrying" | "not_sent" | "sent";
  readonly progress?: number;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="transfer">
      <h2 id={headingId}>Transfer status</h2>
      <p>
        <strong>{state.replaceAll("_", " ")}</strong>
      </p>
      {progress === undefined ? null : (
        <>
          <progress max={100} value={progress}>
            {progress}%
          </progress>
          <span>{progress}% transferred</span>
        </>
      )}
      <p>
        {state === "not_sent"
          ? "The local recording is still available on this device."
          : "Only this transfer is affected."}
      </p>
    </section>
  );
}

export function DeviceSessionList() {
  return (
    <section>
      <h2>Devices and sessions</h2>
      <ul className="session-list">
        <li>
          <strong>Current browser</strong>
          <span>Active now · recent sign-in satisfied</span>
        </li>
        <li>
          <strong>Other browser</strong>
          <span>Last used two days ago</span>
          <button type="button">Revoke session</button>
        </li>
      </ul>
    </section>
  );
}
export function DataRightsStatus() {
  return (
    <section>
      <h2>Export and deletion</h2>
      <p>Exports are source-cut ZIP files. Ready files expire after 24 hours.</p>
      <p>
        Deletion revokes access first. Provider cleanup may remain pending, and inaccessible
        encrypted backup residuals can remain for the bounded retention window.
      </p>
    </section>
  );
}

const projection = {
  announcement: "polite",
  contract: { major: 1, minor: 0 },
  focusTarget: "heading",
  state: "pending",
  title: "Pending evidence",
  message: "Only Writing is affected.",
  status: "attention",
  affectedScope: ["Writing"],
  source: { release: "fixture-1", sourceCut: 1 },
} as const;

export interface ComponentFixtureContract {
  readonly id: (typeof componentFamilies)[number][0];
  readonly variants: readonly string[];
  readonly selector: string;
  readonly expectedText: string;
  readonly render: () => ReactNode;
}

/** Each gallery case is one concrete owned variant rendered through the public family API. */
export interface ComponentFixtureCase extends ComponentFixtureContract {
  readonly variant: string;
}

export const componentFixtureRegistry: readonly ComponentFixtureContract[] = [
  {
    id: "C01",
    variants: ["protected", "bare", "focused"],
    selector: "main",
    expectedText: "Fixture shell",
    render: () => <AppShell title="Fixture shell">Content</AppShell>,
  },
  {
    id: "C02",
    variants: ["conditions", "stickyActionBar"],
    selector: ".sticky-action",
    expectedText: "Continue",
    render: () => (
      <AttemptShell action={<Action label="Continue" />} conditions={["Timed"]} title="Attempt">
        Task
      </AttemptShell>
    ),
  },
  {
    id: "C03",
    variants: ["measuredTimer", "interruptionRecovery"],
    selector: "time",
    expectedText: "12:00",
    render: () => <MockShell remaining="12:00">Mock task</MockShell>,
  },
  {
    id: "C04",
    variants: ["sheet", "dialog", "destructive-confirm"],
    selector: "dialog",
    expectedText: "Overlay",
    render: () => <Overlay title="Overlay" />,
  },
  {
    id: "C05",
    variants: ["stepper", "ordered"],
    selector: "ol",
    expectedText: "Current",
    render: () => <Sequence current={0} steps={["Start", "Finish"]} />,
  },
  {
    id: "C06",
    variants: ["primary", "secondary", "quiet", "destructive", "disabled"],
    selector: "button",
    expectedText: "Unavailable",
    render: () => <Button disabledReason="Evidence is still processing" label="Unavailable" />,
  },
  {
    id: "C07",
    variants: ["link", "iconButton"],
    selector: "a",
    expectedText: "Open details",
    render: () => <InlineAction href="#details" label="Open details" />,
  },
  {
    id: "C08",
    variants: ["segmented", "tabs", "chip"],
    selector: "nav",
    expectedText: "Current",
    render: () => <ChoiceNav />,
  },
  {
    id: "C09",
    variants: ["toggle", "checkbox", "radio"],
    selector: "fieldset",
    expectedText: "Choose an option",
    render: () => <BinaryChoice />,
  },
  {
    id: "C10",
    variants: ["text", "select", "date", "month", "schedule", "invalid"],
    selector: "input[aria-invalid='true']",
    expectedText: "Required",
    render: () => <Field error="Required" />,
  },
  {
    id: "C11",
    variants: ["single", "multiple", "revealed"],
    selector: "fieldset",
    expectedText: "Choose the answer",
    render: () => <AnswerChoice />,
  },
  {
    id: "C12",
    variants: ["select-place", "reset"],
    selector: "fieldset",
    expectedText: "Match each item",
    render: () => <MatchingPair />,
  },
  {
    id: "C13",
    variants: ["input", "options", "result"],
    selector: "input",
    expectedText: "Gap 1",
    render: () => <ClozeGap />,
  },
  {
    id: "C14",
    variants: ["move", "position", "reset"],
    selector: "ol",
    expectedText: "Move down",
    render: () => <ReorderList />,
  },
  {
    id: "C15",
    variants: ["formError", "errorSummary"],
    selector: ".error-summary",
    expectedText: "Check your answers",
    render: () => <FormFeedback errors={["Answer is required"]} />,
  },
  {
    id: "C16",
    variants: ["recommendationCard", "whyThisDisclosure"],
    selector: "details",
    expectedText: "Why this",
    render: () => <Recommendation />,
  },
  {
    id: "C17",
    variants: ["quick", "standard", "extended"],
    selector: "fieldset",
    expectedText: "20 minutes",
    render: () => <SessionDurationPicker />,
  },
  {
    id: "C18",
    variants: ["plan", "diagnosis", "reminder"],
    selector: "section",
    expectedText: "Plan note",
    render: () => <CoachMessage />,
  },
  {
    id: "C19",
    variants: ["outcome", "validity", "partial"],
    selector: "[data-status='attention']",
    expectedText: "Pending evidence",
    render: () => <ResultCard projection={projection} />,
  },
  {
    id: "C20",
    variants: ["excerpt", "conditions"],
    selector: "blockquote",
    expectedText: "Vielen Dank",
    render: () => <DecisiveEvidence />,
  },
  {
    id: "C21",
    variants: ["pattern", "example", "skip"],
    selector: ".card",
    expectedText: "Repair one pattern",
    render: () => <RepairCard />,
  },
  {
    id: "C22",
    variants: ["closed", "open", "used"],
    selector: "details",
    expectedText: "Show hint",
    render: () => <HintDisclosure />,
  },
  {
    id: "C23",
    variants: ["available", "unavailable"],
    selector: ".card",
    expectedText: "Fresh check available",
    render: () => <FreshCheckBanner />,
  },
  {
    id: "C24",
    variants: ["changed", "unchanged", "returns-due"],
    selector: "section",
    expectedText: "What changed",
    render: () => <WhatChangedSummary />,
  },
  {
    id: "C25",
    variants: ["five-validity-values", "practice-only"],
    selector: ".evidence-label",
    expectedText: "interrupted",
    render: () => (
      <EvidenceLabel eligibility="practice-only" reason="Timer stopped" validity="interrupted" />
    ),
  },
  {
    id: "C26",
    variants: ["due", "improving", "stale", "contradicted", "empty"],
    selector: ".card",
    expectedText: "Content-point coverage",
    render: () => <WeaknessCard />,
  },
  {
    id: "C27",
    variants: ["due", "soon", "later", "empty"],
    selector: "section",
    expectedText: "Due now",
    render: () => <DueReviewGroup />,
  },
  {
    id: "C28",
    variants: ["processing", "slow", "pending", "partial", "unavailable", "retry-fresh"],
    selector: "[data-status='attention']",
    expectedText: "pending",
    render: () => <PendingBanner projection={projection} />,
  },
  {
    id: "C29",
    variants: ["identity", "media", "capability", "transfer", "storage"],
    selector: "[data-status='attention']",
    expectedText: "Writing",
    render: () => <SystemFailureBanner kind="identity" projection={projection} />,
  },
  {
    id: "C30",
    variants: ["new", "under-review", "resolved"],
    selector: "section",
    expectedText: "Evidence needs review",
    render: () => <ContradictionNotice />,
  },
  {
    id: "C31",
    variants: ["stale", "due", "scheduled"],
    selector: "section",
    expectedText: "Fresh evidence due",
    render: () => <StaleEvidenceNotice />,
  },
  {
    id: "C32",
    variants: [
      "evidence-building",
      "not-ready",
      "borderline",
      "safe",
      "ready-to-book",
      "stale-contradicted",
    ],
    selector: "table",
    expectedText: "Readiness evidence",
    render: () => (
      <ReadinessEvidence
        gates={["A", "B", "C", "D", "E", "F"].map((id) => ({
          id: id as "A" | "B" | "C" | "D" | "E" | "F",
          met: false,
          reason: "Evidence required",
        }))}
        state="evidence_building"
      />
    ),
  },
  {
    id: "C33",
    variants: ["events", "empty"],
    selector: "ol",
    expectedText: "Evidence changes",
    render: () => <ChangeTimeline />,
  },
  {
    id: "C34",
    variants: ["achieved", "current", "upcoming", "withdrawn"],
    selector: "p",
    expectedText: "Current:",
    render: () => <MilestoneRow />,
  },
  {
    id: "C35",
    variants: ["result", "comparison", "priorities"],
    selector: "section",
    expectedText: "Mock outcome",
    render: () => <MockOutcome />,
  },
  {
    id: "C36",
    variants: ["compact", "expanded"],
    selector: "table",
    expectedText: "Evidence shown in the graphic",
    render: () => <TextAlternativeTable />,
  },
  {
    id: "C37",
    variants: ["readingTextPane", "questionList"],
    selector: "article[lang='de']",
    expectedText: "Lesen",
    render: () => <ReadingRegion />,
  },
  {
    id: "C38",
    variants: ["clozeTextPane", "gap", "result"],
    selector: "article[lang='de']",
    expectedText: "Sprachbausteine",
    render: () => <LanguageElementsRegion />,
  },
  {
    id: "C39",
    variants: ["audioPlayer", "replayCounter", "transcriptPane"],
    selector: "audio",
    expectedText: "Replay limit",
    render: () => <ListeningRegion />,
  },
  {
    id: "C40",
    variants: ["editor", "autosave", "revisionDiff", "conflict"],
    selector: "textarea",
    expectedText: "Your draft",
    render: () => <WritingRegion />,
  },
  {
    id: "C41",
    variants: ["preflight", "recording", "turn-taking", "transcript"],
    selector: "button",
    expectedText: "Start recording",
    render: () => <SpeakingRegion />,
  },
  {
    id: "C42",
    variants: [
      "signed-out",
      "callback-failed",
      "expired-idle",
      "expired-mid-attempt",
      "access-denied",
    ],
    selector: ".card",
    expectedText: "server will decide",
    render: () => <SessionNotice state="expired_mid_attempt" />,
  },
  {
    id: "C43",
    variants: ["preparing", "sending", "queued-offline", "retrying", "not-sent", "sent"],
    selector: "progress",
    expectedText: "50% transferred",
    render: () => <UploadStatus progress={50} state="sending" />,
  },
] as const;

function fixtureProjection(state: ProjectionCardContract["state"]): ProjectionCardContract {
  return {
    affectedScope: ["Writing"],
    announcement: "polite",
    contract: { major: 1, minor: 0 },
    focusTarget: "heading",
    message: `Fixture presentation for ${state.replaceAll("_", " ")}.`,
    source: { release: "fixture-1", sourceCut: 1 },
    state,
    status: state === "pending" || state === "partial" || state === "slow" ? "attention" : "system",
    title: `Fixture ${state.replaceAll("_", " ")}`,
  };
}

const fixtureGates: ReadinessEvidenceProps["gates"] = ["A", "B", "C", "D", "E", "F"].map((id) => ({
  id: id as "A" | "B" | "C" | "D" | "E" | "F",
  met: id === "A",
  reason: id === "A" ? "Fixture evidence is current." : "Fixture evidence is required.",
}));

function renderFixtureVariant(fixture: ComponentFixtureContract, variant: string): ReactNode {
  switch (fixture.id) {
    case "C08":
      return <ChoiceNav variant={variant as ChoiceNavVariant} />;
    case "C09":
      return <BinaryChoice variant={variant as BinaryChoiceVariant} />;
    case "C10":
      return (
        <Field
          {...(variant === "invalid" ? { error: "Required" } : {})}
          variant={
            variant === "invalid"
              ? "text"
              : (variant as "text" | "select" | "date" | "month" | "schedule")
          }
        />
      );
    case "C11":
      return <AnswerChoice variant={variant as AnswerChoiceVariant} />;
    case "C19": {
      const state =
        variant === "outcome" ? "valid" : variant === "validity" ? "partially_valid" : "partial";
      return <ResultCard projection={fixtureProjection(state)} />;
    }
    case "C25":
      return (
        <EvidenceLabel
          {...(variant === "practice-only" ? { eligibility: "practice-only" } : {})}
          reason="Fixture reason"
          validity="interrupted"
        />
      );
    case "C23":
      return <FreshCheckBanner state={variant as FreshCheckState} />;
    case "C24":
      return <WhatChangedSummary state={variant.replaceAll("-", "_") as WhatChangedState} />;
    case "C26":
      return <WeaknessCard state={variant as WeaknessState} />;
    case "C27":
      return <DueReviewGroup state={variant as DueReviewState} />;
    case "C28":
      return (
        <PendingBanner
          projection={fixtureProjection(
            variant.replaceAll("-", "_") as ProjectionCardContract["state"],
          )}
        />
      );
    case "C29":
      return (
        <SystemFailureBanner
          kind={variant as SystemFailureKind}
          projection={fixtureProjection("unavailable")}
        />
      );
    case "C30":
      return <ContradictionNotice state={variant.replaceAll("-", "_") as ContradictionState} />;
    case "C31":
      return <StaleEvidenceNotice state={variant as StaleEvidenceState} />;
    case "C32":
      return (
        <ReadinessEvidence
          gates={fixtureGates}
          oral={64}
          state={variant.replaceAll("-", "_") as ReadinessEvidenceProps["state"]}
          written={65}
        />
      );
    case "C33":
      return <ChangeTimeline state={variant as ChangeTimelineState} />;
    case "C34":
      return <MilestoneRow state={variant as MilestoneState} />;
    case "C42":
      return (
        <SessionNotice
          state={variant.replaceAll("-", "_") as Parameters<typeof SessionNotice>[0]["state"]}
        />
      );
    case "C43":
      return (
        <UploadStatus
          {...(variant === "sending" ? { progress: 50 } : {})}
          state={variant.replaceAll("-", "_") as Parameters<typeof UploadStatus>[0]["state"]}
        />
      );
    default:
      return fixture.render();
  }
}

function fixtureCaseAssertions(fixture: ComponentFixtureContract, variant: string) {
  if (fixture.id === "C08") {
    return {
      expectedText: "Current",
      selector:
        variant === "segmented" ? "nav" : variant === "tabs" ? "[role='tablist']" : "fieldset",
    };
  }
  if (fixture.id === "C09") {
    return {
      expectedText: "Choose an option",
      selector: variant === "toggle" ? "button" : "fieldset",
    };
  }
  if (fixture.id === "C10") {
    return {
      expectedText: variant === "invalid" ? "Required" : "Response",
      selector: variant === "select" ? "select" : "input",
    };
  }
  if (fixture.id === "C23") {
    return {
      expectedText: variant === "available" ? "Fresh check available" : "Fresh check unavailable",
      selector: ".card",
    };
  }
  if (fixture.id === "C24") {
    return {
      expectedText:
        variant === "changed"
          ? "All requested points present"
          : variant === "unchanged"
            ? "still need evidence"
            : "return review is due",
      selector: "section",
    };
  }
  if (fixture.id === "C26") {
    const text: Record<WeaknessState, string> = {
      due: "Due",
      improving: "Improving",
      stale: "Stale",
      contradicted: "Contradicted",
      empty: "No evidence yet",
    };
    return { expectedText: text[variant as WeaknessState], selector: ".card" };
  }
  if (fixture.id === "C27") {
    return {
      expectedText:
        variant === "empty" ? "No reviews due" : variant === "due" ? "Due now" : `Due ${variant}`,
      selector: "section",
    };
  }
  if (fixture.id === "C28") {
    return { expectedText: variant.replaceAll("-", " "), selector: "[data-status]" };
  }
  if (fixture.id === "C19") {
    const state =
      variant === "outcome" ? "valid" : variant === "validity" ? "partially valid" : "partial";
    return { expectedText: `Fixture ${state}`, selector: "[data-source-release]" };
  }
  if (fixture.id === "C29") {
    const text: Record<SystemFailureKind, string> = {
      identity: "Sign-in confirmation",
      media: "recording or file",
      capability: "device cannot",
      transfer: "Transfer status",
      storage: "Saved evidence",
    };
    return {
      expectedText: text[variant as SystemFailureKind],
      selector: `[data-failure-kind='${variant}']`,
    };
  }
  if (fixture.id === "C30") {
    return {
      expectedText:
        variant === "new" ? "recent fresh check conflicts" : variant.replaceAll("-", " "),
      selector: ".card",
    };
  }
  if (fixture.id === "C31") {
    return {
      expectedText: variant === "stale" ? "older than" : variant === "due" ? "is due" : "scheduled",
      selector: ".card",
    };
  }
  if (fixture.id === "C32") {
    return { expectedText: variant.replaceAll("-", " "), selector: ".readiness-evidence" };
  }
  if (fixture.id === "C33") {
    return {
      expectedText: variant === "events" ? "Fresh Writing sample" : "No evidence changes",
      selector: "section",
    };
  }
  if (fixture.id === "C34") {
    return {
      expectedText: `${variant.charAt(0).toUpperCase()}${variant.slice(1)}:`,
      selector: "p",
    };
  }
  if (fixture.id === "C42") {
    return {
      expectedText: variant === "access-denied" ? "cannot open" : "sign in",
      selector: ".card",
    };
  }
  if (fixture.id === "C43") return { expectedText: "Transfer status", selector: ".transfer" };
  return { expectedText: fixture.expectedText, selector: fixture.selector };
}

export const componentFixtureCases: readonly ComponentFixtureCase[] =
  componentFixtureRegistry.flatMap((fixture) =>
    fixture.variants.map((variant) => ({
      ...fixture,
      ...fixtureCaseAssertions(fixture, variant),
      variant,
      render: () => renderFixtureVariant(fixture, variant),
    })),
  );

export function ComponentGallery() {
  return (
    <div className="component-gallery">
      {componentFamilies.map(([id, name]) => {
        const fixtures = componentFixtureCases.filter((entry) => entry.id === id);
        if (fixtures.length === 0) throw new Error(`Missing component fixture ${id}`);
        return (
          <section className="gallery-item" data-component-family={id} id={`family-${id}`} key={id}>
            <h2 className="visually-hidden">
              {id} {name}
            </h2>
            <p className="eyebrow">{id}</p>
            {fixtures.map((fixture) => (
              <div data-fixture-variant={fixture.variant} key={fixture.variant}>
                <p className="visually-hidden">{fixture.variant}</p>
                {fixture.render()}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
