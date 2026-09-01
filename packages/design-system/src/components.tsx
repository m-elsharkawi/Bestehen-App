import type { ReactNode } from "react";
import { useId } from "react";
import {
  isSupportedProjectionCard,
  type AnswerChoiceContract,
  type DecisiveEvidenceContract,
  type ListeningRegionContract,
  type MatchingPairContract,
  type ProjectionCardContract,
  type SharedBankContract,
} from "./contracts.js";
import { componentFamilies } from "./coverage/source-anchors.js";
import { Icon } from "./icons.js";
import { Overlay } from "./overlay.js";
import { Action, SemanticCard, StatusWord } from "./primitives.js";
import { AppShell, AttemptShell, MockShell } from "./shells.js";
import { SessionExpiryAnnouncement } from "./session-expiry-announcement.js";

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
export type InlineActionKind = "link" | "iconButton";
export function InlineAction({
  kind = "link",
  label,
  href,
}: {
  readonly kind?: InlineActionKind;
  readonly label: string;
  readonly href?: string;
}) {
  if (kind === "iconButton") {
    return (
      <button aria-label={label} className="action action-quiet" type="button">
        <Icon name="evidence" />
        <span className="visually-hidden">{label}</span>
      </button>
    );
  }
  return href ? (
    <Action href={href} label={label} variant="quiet" />
  ) : (
    <Action label={label} variant="quiet" />
  );
}
export type ChoiceNavVariant = "segmented" | "tabs" | "chip";
export function ChoiceNav({ variant = "segmented" }: { readonly variant?: ChoiceNavVariant }) {
  if (variant === "tabs") {
    return (
      <div className="choice-nav-preview">
        <p>Example choices</p>
        <ul>
          <li>Current</li>
          <li>Other</li>
        </ul>
      </div>
    );
  }
  if (variant === "chip") {
    return (
      <fieldset>
        <legend>Example choices</legend>
        <label>
          <input defaultChecked type="checkbox" /> Current
        </label>
        <label>
          <input type="checkbox" /> Other
        </label>
      </fieldset>
    );
  }
  return (
    <div className="choice-nav-preview">
      <p>Example choices</p>
      <ul>
        <li>Current</li>
        <li>Other</li>
      </ul>
    </div>
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
  response,
}: {
  readonly legend?: string;
  readonly variant?: AnswerChoiceVariant;
  /** Omitted by the accepted Stage 04 fixtures. A supplied response enables the real primitive. */
  readonly response?: AnswerChoiceContract;
}) {
  if (response) {
    return <RuntimeAnswerChoice response={response} variant={variant} />;
  }
  return (
    <>
      <BinaryChoice legend={legend} variant={variant === "multiple" ? "checkbox" : "radio"} />
      {variant === "revealed" ? <p>Answer revealed after submission.</p> : null}
    </>
  );
}
function RuntimeAnswerChoice({
  response,
  variant,
}: {
  readonly response: AnswerChoiceContract;
  readonly variant: AnswerChoiceVariant;
}) {
  const groupName = useId();
  const multiple = variant === "multiple";
  const selected = new Set(response.selectedIds ?? []);
  return (
    <fieldset className="answer-choice" disabled={response.disabled}>
      <legend>{response.itemLabel}</legend>
      {response.options.map((option) => (
        <label data-selected={selected.has(option.id) || undefined} key={option.id}>
          <input
            checked={selected.has(option.id)}
            disabled={option.disabled}
            name={groupName}
            onChange={() => response.onSelect?.(option.id)}
            type={multiple ? "checkbox" : "radio"}
            value={option.id}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
export function MatchingPair({ matching }: { readonly matching?: MatchingPairContract }) {
  if (matching) {
    const matches = matching.matches ?? {};
    const selectedPrompt = matching.prompts.find(
      (prompt) => prompt.id === matching.selectedPromptId,
    );
    return (
      <fieldset className="matching-pair" disabled={matching.disabled}>
        <legend>{matching.itemLabel}</legend>
        <p>Choose an item, then place it in a named destination.</p>
        <div className="matching-pair-grid">
          <fieldset className="matching-group">
            <legend>Items to match</legend>
            {matching.prompts.map((prompt) => (
              <button
                aria-pressed={matching.selectedPromptId === prompt.id}
                data-selected={matching.selectedPromptId === prompt.id || undefined}
                disabled={prompt.disabled}
                key={prompt.id}
                onClick={() => matching.onSelectPrompt?.(prompt.id)}
                type="button"
              >
                {prompt.label}
              </button>
            ))}
          </fieldset>
          <fieldset className="matching-group">
            <legend>Match destinations</legend>
            {matching.destinations.map((destination) => {
              const prompt = matching.prompts.find(
                (candidate) => matches[candidate.id] === destination.id,
              );
              const canPlace = Boolean(selectedPrompt) && !prompt;
              return (
                <div className="matching-destination" key={destination.id}>
                  <button
                    aria-label={`${destination.label}${prompt ? `, matched with ${prompt.label}` : ", empty"}`}
                    disabled={destination.disabled || !canPlace}
                    onClick={() => {
                      if (selectedPrompt) matching.onPlace?.(selectedPrompt.id, destination.id);
                    }}
                    type="button"
                  >
                    {destination.label}
                  </button>
                  {prompt ? (
                    <span className="match-pill">
                      {prompt.label}
                      <button
                        aria-label={`Remove ${prompt.label} from ${destination.label}`}
                        onClick={() => matching.onClear?.(prompt.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </span>
                  ) : null}
                </div>
              );
            })}
          </fieldset>
        </div>
      </fieldset>
    );
  }
  return (
    <fieldset disabled>
      <legend>Match each item</legend>
      <p>Select an item, then choose its numbered position.</p>
      <p>Matching controls are unavailable in this static preview.</p>
      <button type="button">Select item A</button>
      <button type="button">Place in position 1</button>
      <button type="button">Reset matches</button>
    </fieldset>
  );
}
export type ClozeGapState = "input" | "options" | "result";
/** Design 06 · 6.7 draws three gap conditions inside one passage: the gap that
 *  holds focus, gaps already answered (which read the learner's own word back)
 *  and gaps not visited yet (dashed, never zeroed). */
export type ClozeGapStatus = "active" | "filled" | "unvisited";
const CLOZE_OPTION_KEYS = ["a", "b", "c", "d"] as const;
export function ClozeGap({
  number = 1,
  state = "input",
  status = "active",
  options,
  word,
  sharedBank,
  gapId,
}: {
  readonly number?: number;
  readonly state?: ClozeGapState;
  readonly status?: ClozeGapStatus;
  /** Board 06 · 6.7 keeps the choices scoped to the one active gap, so the option
   *  words travel with the gap rather than being fixed by the family. */
  readonly options?: readonly string[];
  /** The word already chosen for this gap, shown inline so the learner reads
   *  their own sentence back (Design 06 · 6.7). */
  readonly word?: string;
  /** Optional SB2 contract. Its candidate identities are shared across gaps. */
  readonly sharedBank?: SharedBankContract;
  readonly gapId?: string;
}) {
  const sharedCandidate = sharedBank?.candidates.find(
    (candidate) => candidate.id === sharedBank.selectedCandidateId,
  );
  const placedCandidateId = gapId ? sharedBank?.placements?.[gapId] : undefined;
  const placedCandidate = sharedBank?.candidates.find(
    (candidate) => candidate.id === placedCandidateId,
  );
  if (state === "options") {
    if (sharedBank) {
      const usedCandidateIds = new Set(Object.values(sharedBank.placements ?? {}));
      return (
        <fieldset className="cloze-gap cloze-gap-options cloze-shared-bank">
          <legend>{sharedBank.itemLabel}</legend>
          {sharedBank.candidates.map((candidate) => {
            const unavailable =
              candidate.disabled ||
              (sharedBank.reusePolicy === "at_most_once" && usedCandidateIds.has(candidate.id));
            return (
              <button
                aria-pressed={sharedBank.selectedCandidateId === candidate.id}
                data-selected={sharedBank.selectedCandidateId === candidate.id || undefined}
                disabled={unavailable}
                key={candidate.id}
                onClick={() => sharedBank.onSelectCandidate?.(candidate.id)}
                type="button"
              >
                {candidate.label}
                {unavailable ? <span className="visually-hidden">, already placed</span> : null}
              </button>
            );
          })}
        </fieldset>
      );
    }
    const choices = options ?? ["weil", "dass"];
    // Assertion hook: identifies the cloze gap in the component gallery.
    return (
      <fieldset className="cloze-gap cloze-gap-options">
        <legend>Gap {number} · choose one</legend>
        {choices.map((choice, index) => (
          <label key={choice}>
            <input name={`gap-${number}`} type="radio" />
            <span aria-hidden="true" className="cloze-option-key">
              {CLOZE_OPTION_KEYS[index] ?? index + 1}
            </span>
            <span lang="de">{choice}</span>
          </label>
        ))}
      </fieldset>
    );
  }
  // Assertion hook: identifies the cloze gap in the component gallery.
  return (
    <span className="cloze-gap" data-cloze-status={state === "result" ? undefined : status}>
      {state === "result" ? (
        <>Gap {number}: because</>
      ) : sharedBank && gapId ? (
        <>
          <span className="cloze-gap-word">Gap </span>
          <span className="cloze-gap-number">{number}</span>
          {placedCandidate ? (
            <span className="cloze-placement">
              {placedCandidate.label}
              <button
                aria-label={`Remove ${placedCandidate.label} from gap ${number}`}
                onClick={() => sharedBank.onRemoveCandidate?.(gapId)}
                type="button"
              >
                Remove
              </button>
            </span>
          ) : (
            <button
              aria-label={
                sharedCandidate
                  ? `Place ${sharedCandidate.label} in gap ${number}`
                  : `Choose a candidate before placing it in gap ${number}`
              }
              disabled={!sharedCandidate}
              onClick={() => {
                if (sharedCandidate) sharedBank.onPlaceCandidate?.(gapId, sharedCandidate.id);
              }}
              type="button"
            >
              {sharedCandidate ? `Place ${sharedCandidate.label}` : "Choose a candidate"}
            </button>
          )}
        </>
      ) : (
        <label>
          <span className="cloze-gap-word">{"Gap "}</span>
          <span className="cloze-gap-number">{number}</span>
          <input
            aria-label={`Answer for gap ${number}`}
            {...(word === undefined ? {} : { defaultValue: word, size: Math.max(word.length, 3) })}
          />
        </label>
      )}
    </span>
  );
}
export function ReorderList() {
  return (
    <section>
      <h2>Put the steps in order</h2>
      <p>Ordering controls are unavailable in this static preview.</p>
      <ol>
        <li>
          First item{" "}
          <button disabled type="button">
            Move down
          </button>{" "}
          <button disabled type="button">
            Set position 1
          </button>
        </li>
        <li>
          Second item{" "}
          <button disabled type="button">
            Move up
          </button>
        </li>
      </ol>
      <button disabled type="button">
        Reset order
      </button>
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
          // Assertion hook: identifies the form error in the component gallery.
          return (
            <li className="form-error" key={message}>
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
export type CoachMessageVariant = "plan" | "diagnosis" | "reminder";
export function CoachMessage({ variant = "plan" }: { readonly variant?: CoachMessageVariant }) {
  const headingId = useId();
  const copy: Record<CoachMessageVariant, readonly [string, string, string]> = {
    plan: ["Plan note", "Complete one focused repair, then use a fresh check.", "Start repair"],
    diagnosis: ["Diagnosis", "One content-point pattern needs a fresh sample.", "Review pattern"],
    reminder: ["Reminder", "Bring the current evidence to your next fresh check.", "View evidence"],
  };
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>{copy[variant][0]}</h2>
      <p>{copy[variant][1]}</p>
      <Action href="#coach-action" label={copy[variant][2]} />
    </section>
  );
}

const consequentialStateLabels: Record<ProjectionCardContract["state"], string> = {
  valid: "Valid evidence",
  partially_valid: "Partly valid evidence",
  interrupted: "Interrupted",
  not_counted: "Not counted",
  evidence_building: "Evidence building",
  not_ready: "Not ready",
  borderline: "Borderline",
  safe: "Ready with margin",
  ready_to_book: "Ready to book",
  stale_contradicted: "Needs fresh evidence",
  processing: "Working on it",
  slow: "Taking longer than expected",
  pending: "Waiting for an update",
  partial: "Partly available",
  unavailable: "Unavailable right now",
  retry_fresh: "A fresh try is available",
  signed_out: "Sign in required",
  callback_failed: "Sign-in needs another try",
  expired_idle: "Sign-in timed out",
  expired_mid_attempt: "Sign-in needed to continue",
  access_denied: "This area is unavailable",
  preparing: "Preparing",
  sending: "Sending",
  queued_offline: "Saved for later on this device",
  retrying: "Trying again",
  not_sent: "Not sent",
  sent: "Sent",
  requested: "Requested",
  building: "Preparing your file",
  ready: "Ready",
  expired: "No longer available",
  failed: "Could not finish",
  recent_auth_required: "Confirm your sign-in",
  confirmation_required: "Confirmation required",
  revoking: "Removing access",
  purge_running: "Cleaning up",
  provider_pending: "Cleanup is taking longer",
  live_purge_complete: "Cleanup complete",
  completed: "Complete",
  compare: "Compare drafts",
  select: "Choose a draft",
  merge: "Combine drafts",
  available: "Available",
  loading_media: "Loading",
  unavailable_no_fresh_family: "No fresh content available",
  unavailable_rights_or_target: "Not available for this target",
  quarantined_after_pin: "Under review",
  media_failed_not_counted: "Could not load; not counted",
  replacement_ready: "Replacement ready",
  update_required: "Update required",
  acquiring_manifest: "Preparing",
  in_progress: "In progress",
  checkpointed: "Progress saved",
  submission_unknown: "Submission unconfirmed",
  submitted: "Submitted",
  scoring: "Being scored",
  result_available: "Result available",
};

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
          {consequentialStateLabels[projection.state]}
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

export type ResultCardState =
  | "valid"
  | "partially_valid"
  | "interrupted"
  | "not_counted"
  | "pending"
  | "partial";
export type ResultCardContract = Omit<ProjectionCardContract, "state"> & {
  readonly state: ResultCardState;
};

const resultValidityLabels: Record<ResultCardState, readonly [string, string]> = {
  valid: ["Outcome recorded", "Valid evidence"],
  partially_valid: ["Outcome recorded with limits", "Partly valid evidence"],
  interrupted: ["Outcome interrupted", "Interrupted evidence"],
  not_counted: ["Outcome is not counted", "Not counted"],
  pending: ["Outcome is waiting for evidence", "Validity pending"],
  partial: ["Outcome is partly available", "Validity pending for the remaining scope"],
};

/** C19 result projection: outcome and validity remain separate authoritative facts. */
export function ResultCard({ projection }: { readonly projection: ResultCardContract }) {
  if (!isSupportedProjectionCard(projection)) {
    throw new Error("Unsupported result UI projection");
  }
  const [outcome, validity] = resultValidityLabels[projection.state];
  return (
    <section
      aria-live={projection.announcement === "none" ? undefined : projection.announcement}
      data-component="result-card"
      data-focus-target="heading"
      data-source-cut={projection.source.sourceCut}
      data-source-release={projection.source.release}
      role={
        projection.announcement === "assertive"
          ? "alert"
          : projection.announcement === "polite"
            ? "status"
            : undefined
      }
      tabIndex={-1}
    >
      <SemanticCard status={projection.status} title={projection.title}>
        <dl>
          <dt>Outcome</dt>
          <dd>{outcome}</dd>
          <dt>Validity</dt>
          <dd>{validity}</dd>
        </dl>
        <p>{projection.message}</p>
        <p>
          <strong>Affected:</strong> {projection.affectedScope.join(", ")}
        </p>
        {projection.action ? (
          <Action href={projection.action.href} label={projection.action.label} />
        ) : null}
      </SemanticCard>
    </section>
  );
}
export function DecisiveEvidence({ evidence }: { readonly evidence?: DecisiveEvidenceContract }) {
  if (evidence) {
    return (
      <SemanticCard title="Decisive evidence">
        <blockquote lang={evidence.language ?? "de"}>{evidence.excerpt}</blockquote>
        <dl>
          <dt>Relation</dt>
          <dd>{evidence.relation}</dd>
          <dt>Condition</dt>
          <dd>{evidence.condition}</dd>
          <dt>Recorded</dt>
          <dd>
            <time dateTime={evidence.recordedAt.dateTime}>{evidence.recordedAt.label}</time>
          </dd>
        </dl>
      </SemanticCard>
    );
  }
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
      <Action label="Skip this repair" variant="quiet" />
    </SemanticCard>
  );
}
export type HintDisclosureState = "closed" | "open" | "used";
export function HintDisclosure({ state = "closed" }: { readonly state?: HintDisclosureState }) {
  return (
    <details open={state === "open" || state === "used"}>
      <summary>Show hint and consequence</summary>
      <p>Using this hint changes the attempt condition label, not the answer.</p>
      {state === "used" ? <p>Hint used; the condition label is retained.</p> : null}
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
export type PendingBannerState =
  | "processing"
  | "slow"
  | "pending"
  | "partial"
  | "unavailable"
  | "retry_fresh";
export type PendingBannerContract = Omit<ProjectionCardContract, "announcement" | "state"> & {
  readonly announcement: "polite";
  readonly state: PendingBannerState;
};

/** C28 capability status: a polite, server-driven banner without polling or provider detail. */
export function PendingBanner({ projection }: { readonly projection: PendingBannerContract }) {
  if (!isSupportedProjectionCard(projection)) {
    throw new Error("Unsupported pending UI projection");
  }
  return (
    <section
      aria-atomic="true"
      aria-live="polite"
      data-component="pending-banner"
      data-source-cut={projection.source.sourceCut}
      data-source-release={projection.source.release}
      data-state={projection.state}
      role="status"
    >
      <SemanticCard status={projection.status} title={projection.title}>
        <StatusWord status={projection.status === "neutral" ? "system" : projection.status}>
          {consequentialStateLabels[projection.state]}
        </StatusWord>
        <p>{projection.message}</p>
        <p>
          <strong>Affected:</strong> {projection.affectedScope.join(", ")}
        </p>
        {projection.action ? (
          <Action href={projection.action.href} label={projection.action.label} />
        ) : null}
      </SemanticCard>
    </section>
  );
}
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
  const stateId = useId();
  return (
    <section aria-labelledby={`${headingId} ${stateId}`} className="readiness-evidence">
      <h2 id={headingId}>Readiness evidence</h2>
      <p id={stateId}>
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
export type TextAlternativeVariant = "compact" | "expanded";
export function TextAlternativeTable({
  variant = "compact",
}: {
  readonly variant?: TextAlternativeVariant;
}) {
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
        {variant === "expanded" ? (
          <tr>
            <th scope="row">Oral</th>
            <td>Not enough evidence</td>
          </tr>
        ) : null}
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
export type LanguageElementsVariant = "input" | "result";
/** Design 06 · 6.7 runs a passage of eight gaps and focuses one at a time; the
 *  passage itself is drawn as the excerpt that carries gaps 1 to 4. */
const CLOZE_GAP_TOTAL = 8;
const CLOZE_ACTIVE_GAP = 3;
const CLOZE_GAP_OPTIONS = ["kommen", "komme", "gekommen", "zu kommen"] as const;
/** Board 06 · 6.8 maps the same eight gaps to their outcome. */
const CLOZE_WRONG_GAPS: readonly number[] = [3, 6];

function clozeIndexStatus(number: number): ClozeGapStatus {
  if (number === CLOZE_ACTIVE_GAP) return "active";
  return number < CLOZE_ACTIVE_GAP ? "filled" : "unvisited";
}

/** The gap grid of Design 06 · 6.7 and 6.8. It is a persistent index, never a
 *  heat map and never a percentage, and every cell names its state in words. It
 *  carries no tab stop of its own — the passage gaps remain the tab order. */
function ClozeGapIndex({
  variant = "input",
  sharedBank,
}: {
  readonly variant?: LanguageElementsVariant;
  readonly sharedBank?: SharedBankContract;
}) {
  const numbers = Array.from({ length: CLOZE_GAP_TOTAL }, (_, index) => index + 1);
  return (
    <ol
      aria-label={variant === "result" ? "Gap by gap" : "Gap index"}
      className="cloze-index"
      lang="en"
    >
      {numbers.map((number) => {
        const status = clozeIndexStatus(number);
        const outcome = CLOZE_WRONG_GAPS.includes(number) ? "wrong" : "right";
        const placement = sharedBank?.placements?.[`gap-${number}`];
        const placedCandidate = sharedBank?.candidates.find(
          (candidate) => candidate.id === placement,
        );
        const label =
          variant === "result"
            ? `Gap ${number}, ${outcome}`
            : status === "active"
              ? `Gap ${number}, being answered now`
              : status === "filled"
                ? `Gap ${number}, answered`
                : placedCandidate
                  ? `Gap ${number}, placed ${placedCandidate.label}`
                  : `Gap ${number}, not visited`;
        return (
          <li
            data-cloze-outcome={variant === "result" ? outcome : undefined}
            data-cloze-status={variant === "result" ? undefined : status}
            key={number}
          >
            <span aria-hidden="true">{number}</span>
            <span className="visually-hidden">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function LanguageElementsRegion({
  variant = "input",
  sharedBank,
}: {
  readonly variant?: LanguageElementsVariant;
  /** T10 may pass SB2 state without changing the accepted SB1 gallery fixture. */
  readonly sharedBank?: SharedBankContract;
}) {
  if (variant === "result") {
    return (
      <article className="cloze-region cloze-region-result" lang="de">
        <h2>Sprachbausteine</h2>
        <div className="cloze-text-pane">
          <p className="cloze-passage">
            Leider kann ich am Montag nicht <ClozeGap number={CLOZE_ACTIVE_GAP} state="result" />,
            weil ich bis 18 Uhr arbeite.
          </p>
        </div>
        <div className="cloze-options-pane" lang="en">
          <p className="cloze-eyebrow">Gap by gap</p>
          <ClozeGapIndex variant="result" />
          <p className="cloze-note">
            Gaps 3 and 6 both follow a modal verb. That is one pattern, not two mistakes.
          </p>
        </div>
      </article>
    );
  }
  return (
    <article className="cloze-region" lang="de">
      <h2>Sprachbausteine</h2>
      <div className="cloze-text-pane">
        <div className="cloze-pane-head" lang="en">
          <h3>Fill the gaps</h3>
          <p className="cloze-eyebrow">
            Gap {CLOZE_ACTIVE_GAP} of {CLOZE_GAP_TOTAL}
          </p>
        </div>
        <p className="cloze-passage">
          Sehr geehrte Frau Berger, ich habe Ihre Anzeige{" "}
          <ClozeGap
            gapId="gap-1"
            number={1}
            {...(sharedBank ? { sharedBank } : {})}
            state="input"
            status="filled"
            word="in"
          />
          der Zeitung gelesen und{" "}
          <ClozeGap
            gapId="gap-2"
            number={2}
            {...(sharedBank ? { sharedBank } : {})}
            state="input"
            status="filled"
            word="interessiere"
          />
          mich für den Kurs. Leider kann ich am Montag nicht{" "}
          <ClozeGap
            gapId={`gap-${CLOZE_ACTIVE_GAP}`}
            number={CLOZE_ACTIVE_GAP}
            {...(sharedBank ? { sharedBank } : {})}
            state="input"
            status="active"
          />
          , weil ich bis 18 Uhr arbeite. Könnten Sie mir{" "}
          <ClozeGap number={4} state="input" status="unvisited" />
          mitteilen, ob es einen späteren Termin gibt?
        </p>
      </div>
      <div className="cloze-options-pane" lang="en">
        <ClozeGap
          number={CLOZE_ACTIVE_GAP}
          options={CLOZE_GAP_OPTIONS}
          {...(sharedBank ? { sharedBank } : {})}
          state="options"
          status="active"
        />
        <ClozeGapIndex {...(sharedBank ? { sharedBank } : {})} />
        <p className="cloze-note cloze-saved">Saved 7:31</p>
      </div>
    </article>
  );
}
function listeningStatus(state: ListeningRegionContract["state"]): string {
  switch (state) {
    case "preflight":
      return "Checking audio before playback.";
    case "ready":
      return "Audio is ready to play.";
    case "playing":
      return "Audio is playing.";
    case "paused":
      return "Audio is paused.";
    case "unavailable":
      return "Audio is unavailable for this activity.";
  }
}

export function ListeningRegion({ listening }: { readonly listening?: ListeningRegionContract }) {
  const titleId = useId();
  if (listening) {
    const transportDisabled = listening.state === "preflight" || listening.state === "unavailable";
    const canPlay = listening.remainingPlays > 0 && !transportDisabled;
    const transcriptAvailable = listening.transcript.phase === "available";
    return (
      <section aria-labelledby={titleId} className="listening-region">
        <h2 id={titleId}>{listening.title ?? "Listening"}</h2>
        {/* biome-ignore lint/a11y/useMediaCaption: target transcripts are separate authorized objects */}
        <audio
          aria-label={listening.audio.label}
          lang={listening.audio.language ?? "de"}
          preload="none"
          src={listening.audio.src}
        />
        <p>{listening.audio.label}</p>
        <fieldset className="listening-transport">
          <legend>Audio transport</legend>
          <button disabled={!canPlay} onClick={() => listening.onTransport?.("play")} type="button">
            Play
          </button>
          <button
            disabled={listening.state !== "playing"}
            onClick={() => listening.onTransport?.("pause")}
            type="button"
          >
            Pause
          </button>
          <button
            disabled={!canPlay}
            onClick={() => listening.onTransport?.("replay")}
            type="button"
          >
            Replay
          </button>
        </fieldset>
        <p>Plays remaining: {listening.remainingPlays}.</p>
        <p aria-atomic="true" aria-live="polite" className="listening-status" role="status">
          {listeningStatus(listening.state)}
        </p>
        {listening.state === "unavailable" ? (
          <p>
            {listening.unavailableReason ?? "This was a system problem, not a result about you."}
          </p>
        ) : null}
        {transcriptAvailable ? (
          <details className="listening-transcript">
            <summary>{listening.transcript.label}</summary>
            <p lang={listening.transcript.language ?? "de"}>{listening.transcript.text}</p>
          </details>
        ) : (
          <p className="listening-transcript-gate">{listening.transcript.reason}</p>
        )}
      </section>
    );
  }
  return (
    <section>
      <h2>Hören</h2>
      {/* biome-ignore lint/a11y/useMediaCaption: timed text is intentionally unavailable during this exam task */}
      <audio preload="none" />
      <p>Audio controls are unavailable in this static preview.</p>
      <p>Replay limit: two. No transcript is available during this task.</p>
    </section>
  );
}
export type WritingRegionVariant = "editor" | "autosave" | "revisionDiff" | "conflict";
export function WritingRegion({ variant = "editor" }: { readonly variant?: WritingRegionVariant }) {
  const draftId = useId();
  if (variant === "conflict") return <DraftConflict />;
  return (
    <section className="writing-region">
      <div lang="de">
        <h2>Schreiben</h2>
        <p>Antworten Sie auf die Einladung und behandeln Sie alle Punkte.</p>
      </div>
      <div className="field">
        <label htmlFor={draftId}>Your draft</label>
        <textarea id={draftId} rows={12} />
        <p>
          {variant === "autosave"
            ? "Autosave status preview. No draft is saved by this fixture."
            : variant === "revisionDiff"
              ? "Revision difference preview. No versions are loaded or saved by this fixture."
              : "Text entry works in this static preview. No draft is saved or sent."}
        </p>
      </div>
    </section>
  );
}
export type SpeakingRegionVariant = "preflight" | "recording" | "turn-taking" | "transcript";
export function SpeakingRegion({
  variant = "preflight",
}: {
  readonly variant?: SpeakingRegionVariant;
}) {
  const copy: Record<SpeakingRegionVariant, readonly [string, string]> = {
    preflight: ["Start recording", "Microphone access is not requested in this static preview."],
    recording: ["Stop recording", "Recording-state preview. No microphone capture is running."],
    "turn-taking": ["Continue", "Turn-taking preview. No turn progression runs here."],
    transcript: ["View transcript", "Transcript preview. No recording or transcript is loaded."],
  };
  return (
    <section>
      <h2>Speaking</h2>
      <p>{copy[variant][1]}</p>
      <button className="action action-primary" disabled type="button">
        <Icon name="speaking" />
        {copy[variant][0]}
      </button>
      <p>{variant === "recording" ? "Recording controls unavailable" : "Not recording"}</p>
    </section>
  );
}

export function DraftConflict() {
  const headingId = useId();
  const name = useId();
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Draft conflict preview</h2>
      <p>Static comparison only. Choosing an option does not resolve or merge a draft.</p>
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
        <legend>Preview resolution choices</legend>
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

export type SessionNoticeState =
  | "signed_out"
  | "callback_failed"
  | "identity_not_configured"
  | "sign_in_unavailable"
  | "sign_in_failed"
  | "expired_idle"
  | "expired_mid_attempt"
  | "access_denied";
export function sessionNoticeTitle(state: SessionNoticeState): string {
  const title: Record<SessionNoticeState, string> = {
    signed_out: "Sign in required",
    callback_failed: "Sign-in needs another try",
    identity_not_configured: "Sign-in is not configured",
    sign_in_unavailable: "Sign-in is temporarily unavailable",
    sign_in_failed: "Sign-in could not be completed",
    expired_idle: "Sign-in timed out",
    expired_mid_attempt: "Sign-in needed to continue",
    access_denied: "This area is unavailable",
  };
  return title[state];
}
export function SessionNotice({
  state,
  returnTo,
  hideTitle = false,
}: {
  readonly state: SessionNoticeState;
  readonly returnTo?: string;
  readonly hideTitle?: boolean;
}) {
  const title = sessionNoticeTitle(state);
  const copy =
    state === "expired_mid_attempt"
      ? "Your draft, elapsed time, and attempt conditions are preserved. The server will decide the final validity after you sign in."
      : state === "access_denied"
        ? "You do not have permission and cannot open this personal area. Ask the area owner if access should change."
        : state === "identity_not_configured"
          ? "The server has not configured a sign-in provider yet."
          : state === "sign_in_unavailable"
            ? "The server cannot start sign-in right now. Please try again later."
            : state === "sign_in_failed"
              ? "The server could not complete sign-in. Please try again."
              : "Sign in to continue.";
  const isExpired = state === "expired_idle" || state === "expired_mid_attempt";
  const actionHref =
    state === "identity_not_configured" || state === "sign_in_unavailable"
      ? "/"
      : `/auth/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
  const content = (
    <>
      <p>{copy}</p>
      {isExpired ? <SessionExpiryAnnouncement message={copy} /> : null}
      {state === "access_denied" ? null : (
        <Action
          href={actionHref}
          label={
            state === "identity_not_configured" || state === "sign_in_unavailable"
              ? "Return"
              : "Continue to sign in"
          }
        />
      )}
    </>
  );
  return hideTitle ? (
    <section className="card" data-status="system">
      {content}
    </section>
  ) : (
    <SemanticCard status="system" title={title}>
      {content}
    </SemanticCard>
  );
}
export type UploadState =
  | "preparing"
  | "sending"
  | "queued_offline"
  | "retrying"
  | "not_sent"
  | "sent";
export function UploadStatus({
  state,
  progress,
}: {
  readonly state: UploadState;
  readonly progress?: number;
}) {
  const headingId = useId();
  const stateId = useId();
  const progressId = useId();
  const label: Record<UploadState, string> = {
    preparing: "Preparing",
    sending: "Sending",
    queued_offline: "Saved for later on this device",
    retrying: "Trying again",
    not_sent: "Not sent",
    sent: "Sent",
  };
  return (
    <section aria-labelledby={`${headingId} ${stateId}`} className="transfer">
      <h2 id={headingId}>Transfer status</h2>
      <p>
        <strong id={stateId}>{label[state]}</strong>
      </p>
      {progress === undefined ? null : (
        <>
          <progress
            aria-labelledby={`${headingId} ${stateId} ${progressId}`}
            max={100}
            value={progress}
          >
            {progress}%
          </progress>
          <span id={progressId}>{progress}% transferred</span>
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
        Deletion revokes access first. Some cleanup can take longer, and inaccessible encrypted
        backup residuals can remain for the bounded retention window.
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
  readonly caseKind: "variant" | "shared-subpart";
}

export const componentFixtureRegistry: readonly ComponentFixtureContract[] = [
  {
    id: "C01",
    variants: ["protected", "bare", "focused"],
    selector: "main",
    expectedText: "Fixture shell",
    render: () => (
      <AppShell embedded title="Fixture shell">
        Content
      </AppShell>
    ),
  },
  {
    id: "C02",
    variants: ["conditions", "stickyActionBar"],
    selector: ".sticky-action",
    expectedText: "Continue",
    render: () => (
      <AttemptShell
        action={<Action label="Continue" />}
        conditions={["Timed"]}
        embedded
        title="Attempt"
      >
        Task
      </AttemptShell>
    ),
  },
  {
    id: "C03",
    variants: ["measuredTimer", "interruptionRecovery"],
    selector: "time",
    expectedText: "12:00",
    render: () => (
      <MockShell embedded remaining="12:00">
        Mock task
      </MockShell>
    ),
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
    selector: ".choice-nav-preview",
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
    selector: "[data-component='result-card']",
    expectedText: "Pending evidence",
    render: () => <ResultCard projection={projection as ResultCardContract} />,
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
    variants: [
      "valid",
      "partially-valid",
      "pending",
      "interrupted",
      "not-counted",
      "practice-only",
    ],
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
    selector: "[data-component='pending-banner']",
    expectedText: "pending",
    render: () => <PendingBanner projection={projection as PendingBannerContract} />,
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
    variants: ["input", "result"],
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
    case "C01":
      return (
        <AppShell embedded kind={variant as "protected" | "bare" | "focused"} title="Fixture shell">
          Content
        </AppShell>
      );
    case "C03":
      return (
        <MockShell embedded interrupted={variant === "interruptionRecovery"} remaining="12:00">
          Mock task
        </MockShell>
      );
    case "C04":
      return (
        <Overlay kind={variant as "sheet" | "dialog" | "destructive-confirm"} title="Overlay" />
      );
    case "C06":
      return (
        <Button
          {...(variant === "disabled" ? { disabledReason: "Evidence is still processing" } : {})}
          label={variant === "disabled" ? "Unavailable" : `${variant} action`}
          variant={
            variant === "disabled"
              ? "primary"
              : (variant as "primary" | "secondary" | "quiet" | "destructive")
          }
        />
      );
    case "C07":
      return (
        <InlineAction href="#details" kind={variant as InlineActionKind} label="Open details" />
      );
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
    case "C02":
    case "C05":
    case "C12":
    case "C14":
    case "C15":
    case "C16":
    case "C17":
    case "C20":
    case "C21":
    case "C35":
    case "C37":
    case "C39":
      return fixture.render();
    case "C13":
      return <ClozeGap state={variant as ClozeGapState} />;
    case "C18":
      return <CoachMessage variant={variant as CoachMessageVariant} />;
    case "C19": {
      const state =
        variant === "outcome" ? "valid" : variant === "validity" ? "partially_valid" : "partial";
      return <ResultCard projection={fixtureProjection(state) as ResultCardContract} />;
    }
    case "C25":
      return (
        <EvidenceLabel
          {...(variant === "practice-only" ? { eligibility: "practice-only" } : {})}
          reason="Fixture reason"
          validity={
            (variant === "practice-only"
              ? "interrupted"
              : variant.replaceAll("-", "_")) as Parameters<typeof EvidenceLabel>[0]["validity"]
          }
        />
      );
    case "C22":
      return <HintDisclosure state={variant as HintDisclosureState} />;
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
          projection={
            fixtureProjection(
              variant.replaceAll("-", "_") as ProjectionCardContract["state"],
            ) as PendingBannerContract
          }
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
    case "C36":
      return <TextAlternativeTable variant={variant as TextAlternativeVariant} />;
    case "C38":
      return <LanguageElementsRegion variant={variant as LanguageElementsVariant} />;
    case "C40":
      return <WritingRegion variant={variant as WritingRegionVariant} />;
    case "C41":
      return <SpeakingRegion variant={variant as SpeakingRegionVariant} />;
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
      throw new Error(`Missing concrete gallery renderer for ${fixture.id} ${variant}`);
  }
}

const sharedSubpartFamilies = new Set([
  "C02",
  "C05",
  "C12",
  "C14",
  "C15",
  "C16",
  "C17",
  "C20",
  "C21",
  "C35",
  "C37",
  "C39",
]);

function fixtureCaseAssertions(fixture: ComponentFixtureContract, variant: string) {
  if (fixture.id === "C01") return { expectedText: "Fixture shell", selector: `.shell-${variant}` };
  if (fixture.id === "C03") {
    return {
      expectedText: variant === "interruptionRecovery" ? "was interrupted" : "12:00",
      selector: variant === "interruptionRecovery" ? "[role='status']" : "time",
    };
  }
  if (fixture.id === "C04") {
    return { expectedText: "Overlay", selector: `[data-overlay-kind='${variant}']` };
  }
  if (fixture.id === "C06") {
    return {
      expectedText: variant === "disabled" ? "Evidence is still processing" : `${variant} action`,
      selector: ".action",
    };
  }
  if (fixture.id === "C07") {
    return {
      expectedText: "Open details",
      selector: variant === "link" ? "a" : "button[aria-label='Open details']",
    };
  }
  if (fixture.id === "C08") {
    return {
      expectedText: "Current",
      selector: variant === "chip" ? "fieldset" : ".choice-nav-preview",
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
  if (fixture.id === "C02") {
    return {
      expectedText: variant === "conditions" ? "Timed" : "Continue",
      selector: variant === "conditions" ? ".conditions-row" : ".sticky-action",
    };
  }
  if (fixture.id === "C05") {
    return {
      expectedText: "Current",
      selector: variant === "stepper" ? "li[aria-current='step']" : "ol",
    };
  }
  if (fixture.id === "C12") {
    return {
      expectedText: variant === "select-place" ? "Select item A" : "Reset matches",
      selector: "fieldset",
    };
  }
  if (fixture.id === "C13") {
    return {
      expectedText: variant === "result" ? "because" : "Gap 1",
      selector: variant === "options" ? "fieldset" : ".cloze-gap",
    };
  }
  if (fixture.id === "C14") {
    return {
      expectedText:
        variant === "move" ? "Move down" : variant === "position" ? "Set position" : "Reset order",
      selector: "section",
    };
  }
  if (fixture.id === "C15") {
    return {
      expectedText: variant === "formError" ? "Answer is required" : "Check your answers",
      selector: variant === "formError" ? ".form-error" : ".error-summary",
    };
  }
  if (fixture.id === "C16") {
    return {
      expectedText: variant === "recommendationCard" ? "Recommended next" : "Why this",
      selector: variant === "recommendationCard" ? ".card" : "details",
    };
  }
  if (fixture.id === "C17") {
    const text: Record<string, string> = {
      quick: "10 minutes",
      standard: "20 minutes",
      extended: "30 minutes",
    };
    return { expectedText: text[variant] ?? "", selector: "fieldset" };
  }
  if (fixture.id === "C18") {
    return {
      expectedText:
        variant === "plan" ? "Plan note" : `${variant.charAt(0).toUpperCase()}${variant.slice(1)}`,
      selector: "section",
    };
  }
  if (fixture.id === "C22") {
    return { expectedText: variant === "used" ? "Hint used" : "Show hint", selector: "details" };
  }
  if (fixture.id === "C20") {
    return {
      expectedText: variant === "excerpt" ? "Vielen Dank" : "No answer-bearing help",
      selector: variant === "excerpt" ? "blockquote" : "dl",
    };
  }
  if (fixture.id === "C21") {
    return {
      expectedText:
        variant === "pattern"
          ? "Repair one pattern"
          : variant === "example"
            ? "Ich komme gern"
            : "Skip this repair",
      selector: ".card",
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
  if (fixture.id === "C25") {
    return {
      expectedText: variant === "practice-only" ? "practice-only" : variant.replaceAll("-", " "),
      selector: ".evidence-label",
    };
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
  if (fixture.id === "C35") {
    return {
      expectedText:
        variant === "result"
          ? "Mock outcome"
          : variant === "comparison"
            ? "Comparable raw points"
            : "Priorities",
      selector: variant === "comparison" ? "table" : "section",
    };
  }
  if (fixture.id === "C36") {
    return {
      expectedText: variant === "expanded" ? "Not enough evidence" : "Evidence building",
      selector: "table",
    };
  }
  if (fixture.id === "C38") {
    return {
      expectedText: variant === "result" ? "because" : "Gap 1",
      selector: "article[lang='de']",
    };
  }
  if (fixture.id === "C37") {
    return {
      expectedText: variant === "readingTextPane" ? "wählen Sie die passende" : "Choose the answer",
      selector: variant === "readingTextPane" ? "article" : "fieldset",
    };
  }
  if (fixture.id === "C39") {
    return {
      expectedText:
        variant === "audioPlayer"
          ? "Replay limit"
          : variant === "replayCounter"
            ? "Replay limit"
            : "No transcript",
      selector: variant === "audioPlayer" ? "audio" : "section",
    };
  }
  if (fixture.id === "C40") {
    return {
      expectedText:
        variant === "conflict"
          ? "Draft conflict preview"
          : variant === "revisionDiff"
            ? "Revision difference preview"
            : "Your draft",
      selector: variant === "conflict" ? ".draft-compare" : ".writing-region",
    };
  }
  if (fixture.id === "C41") {
    const text: Record<SpeakingRegionVariant, string> = {
      preflight: "Start recording",
      recording: "Recording-state preview",
      "turn-taking": "Turn-taking preview",
      transcript: "Transcript preview",
    };
    return { expectedText: text[variant as SpeakingRegionVariant], selector: "section" };
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
      caseKind: sharedSubpartFamilies.has(fixture.id) ? "shared-subpart" : "variant",
      variant,
      render: () => renderFixtureVariant(fixture, variant),
    })),
  );

export const componentGalleryFixtureCases = componentFixtureCases.filter(
  (fixture, index, all) =>
    fixture.caseKind === "variant" ||
    !all.slice(0, index).some((candidate) => candidate.id === fixture.id),
);

export function ComponentGallery() {
  return (
    <div className="component-gallery">
      {componentFamilies.map(([id, name]) => {
        const fixtures = componentGalleryFixtureCases.filter((entry) => entry.id === id);
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
