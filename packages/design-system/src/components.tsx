import type { ComponentType, ReactNode } from "react";
import type { ConsequentialUiProjection } from "@bestehen/contracts";
import { componentFamilies } from "./coverage/source-anchors.js";
import { Icon } from "./icons.js";
import { Overlay } from "./overlay.js";
import { Action, SemanticCard, StatusWord } from "./primitives.js";

export { Overlay } from "./overlay.js";

export interface FamilyProps {
  readonly title?: string;
  readonly children?: ReactNode;
}
function family(name: string): ComponentType<FamilyProps> {
  return function Family({ title = name, children }: FamilyProps) {
    return (
      <SemanticCard headingLevel={3} title={title}>
        <p>{children ?? `${name} follows the shared semantic and focus contract.`}</p>
      </SemanticCard>
    );
  };
}

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
export function ChoiceNav() {
  return (
    <nav aria-label="Example choices">
      <a aria-current="page" href="#choice-current">
        Current
      </a>{" "}
      <a href="#choice-other">Other</a>
    </nav>
  );
}
export function BinaryChoice({ legend = "Choose an option" }: { readonly legend?: string }) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <label>
        <input name="choice" type="radio" /> Yes
      </label>
      <label>
        <input name="choice" type="radio" /> No
      </label>
    </fieldset>
  );
}
export function Field({
  label = "Response",
  error,
}: {
  readonly label?: string;
  readonly error?: string;
}) {
  const id = "field-example";
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        id={id}
      />
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
export function AnswerChoice({ legend = "Choose the answer" }: { readonly legend?: string }) {
  return <BinaryChoice legend={legend} />;
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
export function FormFeedback({ errors }: { readonly errors: readonly string[] }) {
  return (
    <section aria-labelledby="error-summary" className="error-summary" tabIndex={-1}>
      <h2 id="error-summary">Check your answers</h2>
      <ul>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
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
  return (
    <fieldset>
      <legend>Session duration</legend>
      {[
        ["Quick", "10 minutes"],
        ["Standard", "20 minutes"],
        ["Extended", "30 minutes"],
      ].map(([name, duration]) => (
        <label key={name}>
          <input name="duration" type="radio" />
          {name}, {duration}
        </label>
      ))}
    </fieldset>
  );
}
export function CoachMessage() {
  return (
    <section aria-labelledby="coach-message">
      <h2 id="coach-message">Plan note</h2>
      <p>Complete one focused repair, then use a fresh check.</p>
      <Action href="#coach-action" label="Start repair" />
    </section>
  );
}

export function ProjectionCard({ projection }: { readonly projection: ConsequentialUiProjection }) {
  return (
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
export function FreshCheckBanner() {
  return (
    <SemanticCard status="positive" title="Fresh check available">
      <p>Use a new prompt without answer-bearing help.</p>
      <Action label="Start fresh check" />
    </SemanticCard>
  );
}
export function WhatChangedSummary() {
  return (
    <section>
      <h2>What changed</h2>
      <dl>
        <dt>Before</dt>
        <dd>Two content points missing</dd>
        <dt>Now</dt>
        <dd>All requested points present</dd>
      </dl>
      <p>Return tomorrow for one fresh check.</p>
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
export function WeaknessCard() {
  return (
    <article className="card">
      <h2>Content-point coverage</h2>
      <p>
        <strong>Improving</strong>
      </p>
      <p>Next review tomorrow. No level or rank is assigned.</p>
      <a href="#weakness-detail">Open detail</a>
    </article>
  );
}
export function DueReviewGroup() {
  return (
    <section>
      <h2>Due now, 1</h2>
      <ul>
        <li>
          <a href="#review-content-points">Content-point coverage</a>{" "}
          <time dateTime="2026-08-26">today</time>
        </li>
      </ul>
    </section>
  );
}
export const PendingBanner = ProjectionCard;
export const SystemFailureBanner = ProjectionCard;
export function ContradictionNotice() {
  return (
    <SemanticCard status="attention" title="Evidence needs review">
      <p>
        A recent fresh check conflicts with an earlier sample. Both remain visible while the
        affected Writing claim is reviewed.
      </p>
    </SemanticCard>
  );
}
export function StaleEvidenceNotice() {
  return (
    <SemanticCard status="system" title="Fresh evidence due">
      <p>
        The current sample is older than the accepted window. Recheck Writing before using this
        claim.
      </p>
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
  return (
    <section aria-labelledby="readiness-heading" className="readiness-evidence">
      <h2 id="readiness-heading">Readiness evidence</h2>
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
export function ChangeTimeline() {
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
export function MilestoneRow() {
  return (
    <p>
      <strong>Current:</strong> Direct B1 Writing sample recorded{" "}
      <time dateTime="2026-08-26">26 August</time>.
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
  return (
    <section className="writing-region">
      <div lang="de">
        <h2>Schreiben</h2>
        <p>Antworten Sie auf die Einladung und behandeln Sie alle Punkte.</p>
      </div>
      <div className="field">
        <label htmlFor="writing-draft">Your draft</label>
        <textarea id="writing-draft" rows={12} />
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
  return (
    <section aria-labelledby="draft-conflict">
      <h2 id="draft-conflict">Two saved drafts need your choice</h2>
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
          <input name="draft-choice" type="radio" />
          Keep this device
        </label>
        <label>
          <input name="draft-choice" type="radio" />
          Keep server checkpoint
        </label>
        <label>
          <input name="draft-choice" type="radio" />
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
  return (
    <section aria-labelledby="transfer-title" className="transfer">
      <h2 id="transfer-title">Transfer status</h2>
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

const genericFamilies = new Map<string, ComponentType<FamilyProps>>([
  ["C04", Overlay],
  ["C05", family("Sequence")],
  ["C06", family("Button")],
  ["C07", family("Inline action")],
  ["C08", ChoiceNav],
  ["C09", family("Binary choice")],
  ["C10", family("Field")],
  ["C11", family("Answer choice")],
  ["C12", MatchingPair],
  ["C13", family("Cloze gap")],
  ["C14", ReorderList],
  ["C15", family("Form feedback")],
  ["C16", Recommendation],
  ["C17", SessionDurationPicker],
  ["C18", CoachMessage],
  ["C20", DecisiveEvidence],
  ["C21", RepairCard],
  ["C22", family("Hint disclosure")],
  ["C23", FreshCheckBanner],
  ["C24", WhatChangedSummary],
  ["C25", family("Evidence label")],
  ["C26", WeaknessCard],
  ["C27", DueReviewGroup],
  ["C30", ContradictionNotice],
  ["C31", StaleEvidenceNotice],
  ["C33", ChangeTimeline],
  ["C34", MilestoneRow],
  ["C35", MockOutcome],
  ["C36", family("Text alternative table")],
]);

export function ComponentGallery() {
  return (
    <div className="component-gallery">
      {componentFamilies.map(([id, name]) => {
        const Specific = genericFamilies.get(id);
        return (
          <section className="gallery-item" data-component-family={id} id={`family-${id}`} key={id}>
            <h2 className="visually-hidden">
              {id} {name}
            </h2>
            <p className="eyebrow">{id}</p>
            {Specific ? (
              <Specific title={name} />
            ) : (
              <SemanticCard headingLevel={3} title={name}>
                <p>Deterministic state fixture for {name}.</p>
              </SemanticCard>
            )}
          </section>
        );
      })}
    </div>
  );
}
