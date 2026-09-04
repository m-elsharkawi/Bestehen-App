"use client";

import type {
  Instruction,
  ResponseOperation,
  SafeContentNode,
  TaskFamily,
} from "@bestehen/content";
import { NativeButton } from "@bestehen/design-system";
import type { ReactNode } from "react";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { responseFields, responseIssues, valuesFromOperations } from "../objective-form";
import { initialObjectiveFormState, type ObjectiveFormAction } from "../objective-form-state";
import {
  IndexedResponseStore,
  ObjectiveContinuity,
  type RecoveryStatus,
} from "./objective-continuity";
import { readClockObservation } from "./clock-observation";

const noRestoredOperations: readonly ResponseOperation[] = [];

function SafeNodes({ nodes }: { readonly nodes: readonly SafeContentNode[] }): ReactNode {
  return nodes.map((node, index) => {
    const key = `${node.kind}-${index}`;
    switch (node.kind) {
      case "inline_text":
        return node.text;
      case "paragraph":
        return (
          <p key={key}>
            <SafeNodes nodes={node.children} />
          </p>
        );
      case "heading": {
        const contents = <SafeNodes nodes={node.children} />;
        if (node.level === 2) return <h2 key={key}>{contents}</h2>;
        if (node.level === 3) return <h3 key={key}>{contents}</h3>;
        return <h4 key={key}>{contents}</h4>;
      }
      case "emphasis":
        return node.role === "strong" ? (
          <strong key={key}>
            <SafeNodes nodes={node.children} />
          </strong>
        ) : (
          <em key={key}>
            <SafeNodes nodes={node.children} />
          </em>
        );
      case "quote":
        return (
          <blockquote key={key}>
            <SafeNodes nodes={node.children} />
          </blockquote>
        );
      case "list": {
        const items = node.items.map((item) => (
          <li key={JSON.stringify(item)}>
            <SafeNodes nodes={[item]} />
          </li>
        ));
        return node.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
      }
      case "semantic_group":
        return (
          <div key={key}>
            <SafeNodes nodes={node.children} />
          </div>
        );
      case "cloze_anchor":
        return <span key={key}>Gap {node.gapId}: _____</span>;
      case "evidence_anchor_placeholder":
        return null;
    }
    return null;
  });
}

function safeNodeText(nodes: readonly SafeContentNode[]): string {
  return nodes
    .map((node) => {
      switch (node.kind) {
        case "inline_text":
          return node.text;
        case "paragraph":
        case "heading":
        case "emphasis":
        case "quote":
        case "semantic_group":
          return safeNodeText(node.children);
        case "list":
          return safeNodeText(node.items);
        case "cloze_anchor":
          return `Gap ${node.gapId}`;
        case "evidence_anchor_placeholder":
          return "";
      }
      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function responseLabel(payload: TaskFamily, name: string, value: string | undefined): string {
  if (!value) return "blank";
  if (payload.kind === "R3SituationNoticeMatching") {
    if (value === "no_match") return "No matching notice";
    const notice = payload.notices.find((entry) => entry.stimulusId === value);
    return notice ? safeNodeText(notice.safeContentNodes) : "Unavailable choice";
  }
  const options =
    "questions" in payload
      ? (payload.questions.find((q) => name === `select:${q.itemRef}`)?.options ?? [])
      : payload.kind === "SB1ContextualGrammarCloze"
        ? (payload.gaps.find((g) => name === `candidate:${g.itemRef}:${g.gapId}`)?.options ?? [])
        : payload.kind === "SB2SharedBankLexicalCloze"
          ? payload.candidateBank
          : payload.headings;
  const option = options.find((entry) => entry.optionId === value);
  return option ? safeNodeText(option.learnerSafeLabel) : "Unavailable choice";
}

function LearnerMaterial({ payload }: { readonly payload: TaskFamily }) {
  switch (payload.kind) {
    case "R1HeadingMatching":
      return payload.texts.map((text) => (
        <section key={text.stimulusId} lang={text.language}>
          <SafeNodes nodes={text.safeContentNodes} />
        </section>
      ));
    case "R2DetailedSelect":
      return (
        <div lang={payload.stimulus.language}>
          <SafeNodes nodes={payload.stimulus.safeContentNodes} />
        </div>
      );
    case "R3SituationNoticeMatching":
      return (
        <>
          {payload.situations.map((situation) => (
            <div key={situation.promptId} lang="de">
              <SafeNodes nodes={situation.safeContentNodes} />
            </div>
          ))}
          {payload.notices.map((notice) => (
            <div key={notice.stimulusId} lang={notice.language}>
              <SafeNodes nodes={notice.safeContentNodes} />
            </div>
          ))}
        </>
      );
    case "SB1ContextualGrammarCloze":
    case "SB2SharedBankLexicalCloze":
      return (
        <div lang={payload.connectedText.language}>
          <SafeNodes nodes={payload.connectedText.safeContentNodes} />
        </div>
      );
    case "H1ShortAnnouncements":
      return payload.announcements.map((announcement) => (
        <div key={announcement.stimulusId} lang={announcement.language}>
          <SafeNodes nodes={announcement.writtenInstructionNodes} />
        </div>
      ));
    case "H2ConversationInterview":
      return (
        <div lang={payload.conversation.language}>
          <SafeNodes nodes={payload.conversation.writtenInstructionNodes} />
        </div>
      );
    case "H3ShortFunctionalTexts":
      return payload.texts.map((text) => (
        <div key={text.stimulusId} lang={text.language}>
          <SafeNodes nodes={text.writtenInstructionNodes} />
        </div>
      ));
  }
}

export function ObjectiveResponseIsland({
  payload,
  instruction,
  action,
  attemptId,
  expectedVersion,
  sequence,
  startedAt,
  continuityScope,
  restoredOperations = noRestoredOperations,
}: {
  readonly payload: TaskFamily;
  readonly instruction: Instruction;
  readonly action: ObjectiveFormAction;
  readonly attemptId: string;
  readonly expectedVersion: number;
  readonly sequence: number;
  readonly startedAt: string;
  readonly continuityScope?: string;
  readonly restoredOperations?: readonly ResponseOperation[];
}) {
  const [formState, formAction] = useActionState(action, initialObjectiveFormState);
  const [editedAfterForm, setEditedAfterForm] = useState(false);
  const [values, setValues] = useState<Readonly<Record<string, string>>>(
    valuesFromOperations(restoredOperations),
  );
  const [status, setStatus] = useState<RecoveryStatus>("ready");
  const [invalid, setInvalid] = useState<readonly string[]>([]);
  const [conflict, setConflict] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const confirmationId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const controller = useRef<ObjectiveContinuity | null>(null);
  useEffect(() => {
    if (!continuityScope) return;
    const base = `${continuityScope}:${attemptId}`;
    let branch: string;
    try {
      branch = sessionStorage.getItem(base) ?? crypto.randomUUID();
      sessionStorage.setItem(base, branch);
    } catch {
      setStatus("save_failed");
      return;
    }
    let navigating = false;
    const runtime = new ObjectiveContinuity(
      `${base}:${branch}`,
      attemptId,
      expectedVersion,
      sequence,
      new IndexedResponseStore(),
      (...args) => fetch(...args),
      () => {
        setValues(runtime.state.values);
        setStatus(runtime.status);
        setConflict(Boolean(runtime.state.conflict));
        setSubmitting(runtime.isSubmitting);
        if (runtime.status === "completed" && !navigating) {
          navigating = true;
          window.location.assign(`/attempt/${attemptId}/result`);
        }
      },
      valuesFromOperations(restoredOperations),
    );
    controller.current = runtime;
    void runtime.restore();
    const retry = () => {
      if (!document.hidden) void runtime.retry();
    };
    window.addEventListener("online", retry);
    window.addEventListener("pageshow", retry);
    document.addEventListener("visibilitychange", retry);
    return () => {
      controller.current = null;
      window.removeEventListener("online", retry);
      window.removeEventListener("pageshow", retry);
      document.removeEventListener("visibilitychange", retry);
    };
  }, [continuityScope, attemptId, expectedVersion, sequence, restoredOperations]);
  useEffect(() => {
    if (formState.status !== "editing") {
      setValues(formState.values);
      setEditedAfterForm(false);
      setInvalid(formState.invalidFields);
      errorRef.current?.focus();
    }
  }, [formState]);
  const displayed = formState.status === "editing" || editedAfterForm ? values : formState.values;
  const capture = () => {
    if (controller.current?.isSubmitting) return;
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const next = Object.fromEntries(
      responseFields(payload).map((name) => [name, String(data.get(name) ?? "")]),
    );
    setValues(next);
    setEditedAfterForm(true);
    void controller.current?.change(next);
  };
  const controls = (name: string) => ({
    id: name,
    value: displayed[name] ?? "",
    onChange: () => undefined,
    "aria-invalid": invalid.includes(name) || undefined,
    disabled: submitting,
  });
  const noReuse =
    payload.kind === "SB2SharedBankLexicalCloze"
      ? payload.candidateReusePolicy === "at_most_once"
      : "matchConstraints" in payload &&
        payload.matchConstraints.rightReusePolicy === "at_most_once";
  const unavailableChoice = (name: string, value: string) =>
    noReuse &&
    value !== "no_match" &&
    Object.entries(displayed).some(([other, selected]) => other !== name && selected === value);
  const messages: Record<RecoveryStatus, string> = {
    ready: "Choose answers, or deliberately leave blanks, then submit.",
    saved: "Saved on this device. Waiting to sync.",
    synced: "Synced. Your answers are saved.",
    retry: "Your saved work is waiting for a connection. Retry when you are ready.",
    session_expired: "Sign in again, then retry. Pending answers remain saved on this device.",
    conflict: "Another saved response differs. Compare both before choosing which to continue.",
    submission_unknown:
      "Your response is preserved. The submission result is not yet confirmed. Retry to check it.",
    completed: "Your recorded result is ready.",
    update_required:
      "This activity needs an updated app. Your saved answers have not been changed.",
    save_failed:
      "Device saving failed. Keep this page open. Your current choices are still on this page; use the form to try a server save.",
  };
  const selects =
    payload.kind === "R2DetailedSelect" ||
    payload.kind === "H1ShortAnnouncements" ||
    payload.kind === "H2ConversationInterview" ||
    payload.kind === "H3ShortFunctionalTexts"
      ? payload.questions
      : [];
  return (
    <form
      ref={formRef}
      action={formAction}
      onChange={capture}
      onSubmit={(event) => {
        if (!controller.current || status === "save_failed") return;
        event.preventDefault();
        if (new FormData(event.currentTarget).get("confirmBoundary") !== attemptId) return;
        const issues = responseIssues(payload, displayed);
        setInvalid(issues);
        if (issues.length) {
          queueMicrotask(() => errorRef.current?.focus());
          return;
        }
        void controller.current.submit(readClockObservation(attemptId));
      }}
      onKeyDown={(event) => {
        if (controller.current?.isSubmitting) return;
        if (!/^[1-9]$/.test(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
        const target = event.target;
        if (target instanceof HTMLSelectElement) {
          const option = target.options[Number(event.key)];
          if (option && !option.disabled) {
            event.preventDefault();
            target.value = option.value;
            capture();
          }
        } else if (target instanceof HTMLInputElement && target.type === "radio") {
          const radios = [
            ...(target
              .closest("fieldset")
              ?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []),
          ];
          const radio = radios[Number(event.key) - 1];
          if (radio) {
            event.preventDefault();
            radio.checked = true;
            radio.focus();
            capture();
          }
        }
      }}
    >
      <div
        ref={errorRef}
        tabIndex={-1}
        role={invalid.length || formState.message ? "alert" : undefined}
      >
        {formState.message ||
          (invalid.length
            ? "Review the marked answers. Use each restricted choice only once."
            : "")}
        {invalid.length ? (
          <ul>
            {invalid.map((name) => (
              <li key={name}>
                <a
                  href={`#${name}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(name)?.focus();
                  }}
                >
                  Review answer {responseFields(payload).indexOf(name) + 1}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <input name="attemptId" type="hidden" value={attemptId} />
      <input name="expectedVersion" type="hidden" value={expectedVersion} />
      <input name="sequence" type="hidden" value={sequence} />
      <input name="startedAt" type="hidden" value={startedAt} />
      <input name="capturedFields" type="hidden" value={JSON.stringify(responseFields(payload))} />
      <section aria-label="Instructions" lang={instruction.locale}>
        <SafeNodes nodes={instruction.safeContentNodes} />
        {instruction.learnerFacingTimingLabel ? (
          <p>{instruction.learnerFacingTimingLabel}</p>
        ) : null}
      </section>
      {instruction.helpPolicy.offerableAssistanceKinds.length > 0 ? (
        <p lang="en">Help is available when this activity permits it.</p>
      ) : null}
      <LearnerMaterial payload={payload} />
      {selects.map((question) => (
        <fieldset key={question.itemRef} className="answer-choice">
          <legend>
            <span lang="de">{safeNodeText(question.questionNodes)}</span>
          </legend>
          {question.options.map((option) => (
            <label
              key={option.optionId}
              data-selected={
                displayed[`select:${question.itemRef}`] === option.optionId || undefined
              }
            >
              <input
                id={`select:${question.itemRef}:${option.optionId}`}
                disabled={submitting}
                name={`select:${question.itemRef}`}
                checked={displayed[`select:${question.itemRef}`] === option.optionId}
                onChange={() => undefined}
                aria-invalid={invalid.includes(`select:${question.itemRef}`) || undefined}
                type="radio"
                value={option.optionId}
              />
              <span lang="de">
                <SafeNodes nodes={option.learnerSafeLabel} />
              </span>
            </label>
          ))}
          <label data-selected={!displayed[`select:${question.itemRef}`] || undefined}>
            <input
              id={`select:${question.itemRef}`}
              disabled={submitting}
              name={`select:${question.itemRef}`}
              type="radio"
              value=""
              checked={!displayed[`select:${question.itemRef}`]}
              onChange={() => undefined}
            />
            <span>Leave blank</span>
          </label>
        </fieldset>
      ))}
      {payload.kind === "SB1ContextualGrammarCloze"
        ? payload.gaps.map((gap, index) => (
            <label key={gap.itemRef} className="field">
              Gap {index + 1}
              <select
                name={`candidate:${gap.itemRef}:${gap.gapId}`}
                {...controls(`candidate:${gap.itemRef}:${gap.gapId}`)}
              >
                <option value="">Choose</option>
                {gap.options.map((option) => (
                  <option key={option.optionId} lang="de" value={option.optionId}>
                    {safeNodeText(option.learnerSafeLabel)}
                  </option>
                ))}
              </select>
            </label>
          ))
        : null}
      {payload.kind === "SB2SharedBankLexicalCloze"
        ? payload.gaps.map((gap, index) => (
            <label key={gap.itemRef} className="field">
              Gap {index + 1}
              <select
                name={`candidate:${gap.itemRef}:${gap.gapId}`}
                {...controls(`candidate:${gap.itemRef}:${gap.gapId}`)}
              >
                <option value="">Choose</option>
                {payload.candidateBank.map((option) => (
                  <option
                    key={option.optionId}
                    lang="de"
                    value={option.optionId}
                    disabled={unavailableChoice(
                      `candidate:${gap.itemRef}:${gap.gapId}`,
                      option.optionId,
                    )}
                  >
                    {safeNodeText(option.learnerSafeLabel)}
                  </option>
                ))}
              </select>
            </label>
          ))
        : null}
      {payload.kind === "R1HeadingMatching"
        ? payload.itemBindings.map((binding, index) => (
            <label key={binding.itemRef} className="field">
              Text {index + 1}
              <select
                name={`match:${binding.itemRef}:${binding.leftId}`}
                {...controls(`match:${binding.itemRef}:${binding.leftId}`)}
              >
                <option value="">Choose</option>
                {payload.headings.map((option) => (
                  <option
                    key={option.optionId}
                    lang="de"
                    value={option.optionId}
                    disabled={unavailableChoice(
                      `match:${binding.itemRef}:${binding.leftId}`,
                      option.optionId,
                    )}
                  >
                    {safeNodeText(option.learnerSafeLabel)}
                  </option>
                ))}
              </select>
            </label>
          ))
        : null}
      {payload.kind === "R3SituationNoticeMatching"
        ? payload.itemBindings.map((binding, index) => (
            <label key={binding.itemRef} className="field">
              Situation {index + 1}
              <select
                name={`match:${binding.itemRef}:${binding.leftId}`}
                {...controls(`match:${binding.itemRef}:${binding.leftId}`)}
              >
                <option value="">Choose</option>
                {payload.notices.map((notice) => (
                  <option
                    key={notice.stimulusId}
                    lang="de"
                    value={notice.stimulusId}
                    disabled={unavailableChoice(
                      `match:${binding.itemRef}:${binding.leftId}`,
                      notice.stimulusId,
                    )}
                  >
                    {safeNodeText(notice.safeContentNodes)}
                  </option>
                ))}
                {payload.noMatchOption ? (
                  <option value="no_match">
                    {safeNodeText(payload.noMatchOption.learnerSafeLabel)}
                  </option>
                ) : null}
              </select>
            </label>
          ))
        : null}
      <p aria-live="polite">{messages[status]}</p>
      {status === "session_expired" || formState.status === "session_expired" ? (
        <a
          href={`/auth/login?returnTo=${encodeURIComponent(`/attempt/${attemptId}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          Sign in in a new tab, then return here
        </a>
      ) : null}
      {conflict ? (
        <section aria-label="Compare saved responses">
          <h2>Choose the response to continue</h2>
          <p>Both responses are preserved. Choosing one does not erase the other.</p>
          <ol>
            {responseFields(payload).map((name, index) => {
              const other = controller.current?.state.conflict;
              const saved = other?.checkpoints.find(
                (c) => c.sequence === other.acknowledgedCheckpointSequence,
              );
              const remoteValues = valuesFromOperations(saved?.operations ?? []);
              const label =
                "questions" in payload
                  ? safeNodeText(payload.questions[index]?.questionNodes ?? [])
                  : `Answer ${index + 1}`;
              return (
                <li key={name}>
                  {label}: this device {responseLabel(payload, name, values[name])}; other saved
                  response {responseLabel(payload, name, remoteValues[name])}.
                </li>
              );
            })}
          </ol>
          <div className="action-stack">
            <NativeButton
              disabled={Boolean(controller.current?.state.conflict?.submission)}
              onClick={() => void controller.current?.resolve("local")}
            >
              Continue with this device's answers
            </NativeButton>
            <NativeButton onClick={() => void controller.current?.resolve("server")}>
              {controller.current?.state.conflict?.submission
                ? "View the recorded result"
                : "Continue with the other saved answers"}
            </NativeButton>
          </div>
        </section>
      ) : null}
      <fieldset aria-label="Submission confirmation">
        <label htmlFor={confirmationId}>
          <input
            id={confirmationId}
            type="checkbox"
            name="confirmBoundary"
            value={attemptId}
            required
          />
        </label>
        <p>
          <label htmlFor={confirmationId}>
            I confirm these answers, including any blanks, for submission.
          </label>
        </p>
      </fieldset>
      {["retry", "session_expired", "submission_unknown", "save_failed"].includes(status) ? (
        <NativeButton onClick={() => void controller.current?.retry()}>
          Retry saved work
        </NativeButton>
      ) : null}
      <NativeButton name="intent" value="submit" type="submit" disabled={conflict}>
        Submit answer
      </NativeButton>
    </form>
  );
}
