/** Shared, seed-only assembly for H1-H3 select questions and deterministic fake manifests. */

import type { DistractorFailureFamily } from "../keys.js";
import type { SelectItem } from "../task-families.js";
import {
  type SeedArtifact,
  type SeedItemSpec,
  buildSeedArtifact,
  option,
  paragraph,
  seedInstruction,
} from "./builders.js";
import { type SeedAudioManifest, buildSeedAudioManifest } from "./audio.js";
import { seedItemId } from "./identity.js";
import type { TaskFamily, TaskFamilyKind } from "../task-families.js";

export interface ListeningAnswerSpec {
  readonly id: string;
  readonly label: string;
  readonly failureFamily?: DistractorFailureFamily;
}

export interface ListeningQuestionSpec {
  readonly id: string;
  readonly itemKey: string;
  readonly question: string;
  readonly stimulusId: string;
  readonly anchorId: string;
  readonly decisiveRelation: string;
  readonly acceptedOptionId: string;
  readonly answers: readonly [ListeningAnswerSpec, ListeningAnswerSpec, ListeningAnswerSpec];
}

export interface ListeningArtifactInput {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly kind: Extract<
    TaskFamilyKind,
    "H1ShortAnnouncements" | "H2ConversationInterview" | "H3ShortFunctionalTexts"
  >;
  readonly shortFamily: "H1" | "H2" | "H3";
  readonly scenario: string;
  readonly capabilityRef: string;
  readonly payload: TaskFamily;
  readonly questions: readonly ListeningQuestionSpec[];
  readonly audio: readonly SeedAudioManifest[];
}

export interface ListeningSeedFamily {
  readonly artifact: SeedArtifact;
  readonly audio: readonly SeedAudioManifest[];
  readonly authoredMediaBindings: readonly {
    readonly contentItemId: string;
    readonly questionId: string;
    readonly stimulusId: string;
  }[];
}

export function listeningQuestion(seedKey: string, question: ListeningQuestionSpec): SelectItem {
  return {
    itemRef: seedItemId(seedKey, question.itemKey),
    questionId: question.id,
    questionNodes: [paragraph(question.question)],
    options: question.answers.map((answer) => option(answer.id, answer.label)),
  };
}

export function seedAudio(
  input: Omit<Parameters<typeof buildSeedAudioManifest>[0], "listeningFamily"> & {
    readonly listeningFamily: "H1" | "H2" | "H3";
  },
): SeedAudioManifest {
  return buildSeedAudioManifest(input);
}

export function buildListeningArtifact(input: ListeningArtifactInput): ListeningSeedFamily {
  const answerByQuestion = new Map(
    input.questions.map((question) => [
      question.id,
      new Map(question.answers.map((answer) => [answer.id, answer] as const)),
    ]),
  );
  const items: readonly SeedItemSpec[] = input.questions.map((question) => ({
    itemKey: question.itemKey,
    binding: { kind: "select", questionId: question.id },
    responseKind: "single_select",
    capabilityRefs: [input.capabilityRef],
    accepted: [{ kind: "option", optionId: question.acceptedOptionId }],
    decisiveEvidence: [
      {
        stimulusId: question.stimulusId,
        anchorId: question.anchorId,
        safeRevealSpanOrRelation: question.decisiveRelation,
        relationKind: "direct_span",
      },
    ],
    correctRationale: question.decisiveRelation,
    distractor: (identifier: string) => ({
      whyPlausible: `Die Antwort greift ein Wort oder Thema aus dem Hörtext auf.`,
      decisiveMismatch: question.decisiveRelation,
      failureFamily:
        answerByQuestion.get(question.id)?.get(identifier)?.failureFamily ??
        "plausible_but_unsupported",
    }),
    causeRef: "cause.listening.decisive_cue_not_integrated",
  }));
  return {
    authoredMediaBindings: input.questions.map((question) => ({
      contentItemId: seedItemId(input.seedKey, question.itemKey),
      questionId: question.id,
      stimulusId: question.stimulusId,
    })),
    artifact: buildSeedArtifact({
      seedKey: input.seedKey,
      familySlug: input.familySlug,
      taskFamilyKind: input.kind,
      scenarioConfigurationRef: input.scenario,
      decisiveRealizationRef: "realization.spoken_decisive_cue",
      answerPathRef: "path.listen_then_select_by_identity",
      capabilityRefs: [input.capabilityRef],
      instruction: seedInstruction(`${input.seedKey}-instruction`, "single_select", [
        "Lesen Sie zuerst die Aufgaben. Hören Sie dann den Text und wählen Sie jeweils eine Antwort.",
        "Die Zahl der Abspielmöglichkeiten wird vom Übungsplan festgelegt.",
      ]),
      learnerPayload: input.payload,
      items,
      mediaRevisionIds: input.audio.map((manifest) => manifest.rendition.mediaRevisionId),
      hasListeningMedia: true,
    }),
    audio: input.audio,
  };
}
