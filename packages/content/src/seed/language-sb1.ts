/** SB1 contextual grammar cloze. Each family is one connected letter with six local gaps. */

import type { ClozeStimulus, SB1ContextualGrammarCloze } from "../task-families.js";
import {
  type SeedArtifact,
  type SeedArtifactIntent,
  type SeedItemSpec,
  buildSeedArtifact,
  clozeParagraph,
  option,
  seedInstruction,
} from "./builders.js";
import { seedItemId } from "./identity.js";

interface GapSpec {
  readonly id: string;
  readonly itemKey: string;
  readonly options: readonly [string, string, string];
  readonly accepted: string;
  readonly context: string;
}

interface Sb1Spec {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly scenario: string;
  readonly stimulusId: string;
  readonly segments: readonly (string | { readonly gapId: string })[];
  readonly gaps: readonly GapSpec[];
  readonly intent?: SeedArtifactIntent;
  readonly rightsState?: "current" | "withdrawn";
  readonly validatorDisagreesAt?: string;
}

export function buildSb1(spec: Sb1Spec): SeedArtifact {
  const connectedText: ClozeStimulus = {
    stimulusId: spec.stimulusId,
    safeContentNodes: [clozeParagraph(spec.segments)],
    language: "de",
    genreDomainRegister: "persönliche Nachricht, Alltag, höflich und informell",
    evidenceAnchorIds: spec.gaps.map((gap) => `${gap.id}-anchor`),
    connected: true,
  };
  const payload: SB1ContextualGrammarCloze = {
    kind: "SB1ContextualGrammarCloze",
    connectedText,
    gaps: spec.gaps.map((gap) => ({
      itemRef: seedItemId(spec.seedKey, gap.itemKey),
      gapId: gap.id,
      options: gap.options.map((value) => option(`${gap.id}-${value}`, value)),
    })),
  };
  const items: readonly SeedItemSpec[] = spec.gaps.map((gap) => ({
    itemKey: gap.itemKey,
    binding: { kind: "gap", gapId: gap.id },
    responseKind: "cloze_local_option",
    capabilityRefs: ["tax.language.contextual_grammar"],
    accepted: [{ kind: "option", optionId: `${gap.id}-${gap.accepted}` }],
    decisiveEvidence: [
      {
        stimulusId: spec.stimulusId,
        anchorId: `${gap.id}-anchor`,
        safeRevealSpanOrRelation: gap.context,
        relationKind: "cloze_context",
      },
    ],
    correctRationale: gap.context,
    distractor: (identifier: string) => ({
      whyPlausible: `Die Form „${identifier.slice(gap.id.length + 1)}“ gehört zur gleichen lokalen Auswahl.`,
      decisiveMismatch: `Im verbundenen Satz gilt: ${gap.context}`,
      failureFamily: "grammatical_form_mismatch",
    }),
    causeRef: "cause.language.grammar_context_not_integrated",
    ...(spec.validatorDisagreesAt === gap.id ? { validatorDisagrees: true } : {}),
  }));
  return buildSeedArtifact({
    seedKey: spec.seedKey,
    familySlug: spec.familySlug,
    taskFamilyKind: "SB1ContextualGrammarCloze",
    scenarioConfigurationRef: spec.scenario,
    decisiveRealizationRef: "realization.connected_grammar_context",
    answerPathRef: "path.read_sentence_and_wider_context",
    capabilityRefs: ["tax.language.contextual_grammar"],
    instruction: seedInstruction(`${spec.seedKey}-instruction`, "cloze_local_options", [
      "Lesen Sie die Nachricht. Wählen Sie für jede Lücke die passende Form.",
      "Zu jeder Lücke gehören drei Möglichkeiten.",
    ]),
    learnerPayload: payload,
    items,
    ...(spec.intent === undefined ? {} : { intent: spec.intent }),
    ...(spec.rightsState === undefined ? {} : { rightsState: spec.rightsState }),
  });
}

const visitGaps: readonly GapSpec[] = [
  {
    id: "sb1a-g1",
    itemKey: "item-1",
    options: ["weil", "obwohl", "damit"],
    accepted: "weil",
    context: "Der folgende Hauptsatz nennt den Grund für die Nachricht.",
  },
  {
    id: "sb1a-g2",
    itemKey: "item-2",
    options: ["mich", "mir", "mein"],
    accepted: "mich",
    context: "Das Verb ‚freuen‘ verlangt hier das Reflexivpronomen im Akkusativ.",
  },
  {
    id: "sb1a-g3",
    itemKey: "item-3",
    options: ["kann", "könnte", "konnte"],
    accepted: "könnte",
    context: "Die Frage formuliert eine höfliche Möglichkeit für die Zukunft.",
  },
  {
    id: "sb1a-g4",
    itemKey: "item-4",
    options: ["am", "im", "um"],
    accepted: "am",
    context: "Vor einem Wochentag steht die Präposition ‚am‘.",
  },
  {
    id: "sb1a-g5",
    itemKey: "item-5",
    options: ["mitbringen", "mitgebracht", "bringt mit"],
    accepted: "mitbringen",
    context: "Nach dem Modalverb ‚soll‘ steht der Infinitiv am Satzende.",
  },
  {
    id: "sb1a-g6",
    itemKey: "item-6",
    options: ["deine", "deiner", "deinen"],
    accepted: "deine",
    context: "‚Antwort‘ ist feminin und steht nach ‚auf‘ im Akkusativ.",
  },
];

const visitSegments = [
  "Liebe Jana, ich schreibe dir, ",
  { gapId: "sb1a-g1" },
  " ich meinen Besuch planen möchte. Ich freue ",
  { gapId: "sb1a-g2" },
  " sehr auf das Wochenende. ",
  { gapId: "sb1a-g3" },
  " ich schon am Freitag kommen? Mein Zug ist ",
  { gapId: "sb1a-g4" },
  " Abend in Mainz. Sag mir bitte auch, ob ich Bettwäsche ",
  { gapId: "sb1a-g5" },
  " soll. Ich warte auf ",
  { gapId: "sb1a-g6" },
  " Antwort. Viele Grüße, Samir",
] as const;

const clubGaps: readonly GapSpec[] = [
  {
    id: "sb1b-g1",
    itemKey: "item-1",
    options: ["seit", "für", "vor"],
    accepted: "seit",
    context: "Eine Handlung begann im Frühjahr und dauert bis heute an.",
  },
  {
    id: "sb1b-g2",
    itemKey: "item-2",
    options: ["der", "die", "den"],
    accepted: "der",
    context: "‚Kurs‘ ist maskulin und Subjekt des Relativsatzes.",
  },
  {
    id: "sb1b-g3",
    itemKey: "item-3",
    options: ["stattfindet", "stattfinden", "fand statt"],
    accepted: "stattfindet",
    context: "Im Nebensatz steht das finite Verb am Ende und bezieht sich auf den aktuellen Kurs.",
  },
  {
    id: "sb1b-g4",
    itemKey: "item-4",
    options: ["wenn", "als", "wann"],
    accepted: "wenn",
    context:
      "Die Bedingung gilt für jeden Termin, nicht für ein einmaliges Ereignis in der Vergangenheit.",
  },
  {
    id: "sb1b-g5",
    itemKey: "item-5",
    options: ["uns", "wir", "unser"],
    accepted: "uns",
    context: "Das reflexive Verb lautet ‚sich treffen‘; das Subjekt ist ‚wir‘.",
  },
  {
    id: "sb1b-g6",
    itemKey: "item-6",
    options: ["können", "konnten", "gekonnt"],
    accepted: "können",
    context: "Nach ‚damit‘ steht ein finites Verb im Präsens am Nebensatzende.",
  },
];

const clubSegments = [
  "Hallo Leon, ich bin ",
  { gapId: "sb1b-g1" },
  " dem Frühjahr im Fotoclub. Der Kurs, ",
  { gapId: "sb1b-g2" },
  " jeden zweiten Mittwoch ",
  { gapId: "sb1b-g3" },
  ", ist sehr praktisch. ",
  { gapId: "sb1b-g4" },
  " das Wetter gut ist, fotografieren wir draußen. Danach treffen ",
  { gapId: "sb1b-g5" },
  " oft noch im Café, damit wir die Bilder gemeinsam besprechen ",
  { gapId: "sb1b-g6" },
  ". Möchtest du nächste Woche mitkommen? Grüße, Elena",
] as const;

export const sb1FamilyA = buildSb1({
  seedKey: "sb1-wochenendbesuch",
  familySlug: "sb1-family-visit-planning-letter",
  scenario: "scenario.cloze.personal_visit",
  stimulusId: "sb1a-brief",
  segments: visitSegments,
  gaps: visitGaps,
});
export const sb1FamilyB = buildSb1({
  seedKey: "sb1-fotoclub",
  familySlug: "sb1-family-club-invitation",
  scenario: "scenario.cloze.club_invitation",
  stimulusId: "sb1b-brief",
  segments: clubSegments,
  gaps: clubGaps,
});

export const sb1SeedArtifacts: readonly SeedArtifact[] = [sb1FamilyA, sb1FamilyB];

/** Deliberately ambiguous: two local forms remain defensible, so gate 5 must quarantine it. */
export const ambiguousQuarantineFixture = buildSb1({
  seedKey: "fixture-quarantine-ambiguous-sb1",
  familySlug: "fixture-family-ambiguous-sb1",
  scenario: "scenario.negative_test.ambiguous_cloze",
  stimulusId: "fixture-ambiguous-letter",
  segments: visitSegments,
  gaps: visitGaps,
  intent: "quarantine_fixture",
  validatorDisagreesAt: "sb1a-g3",
});

/** App-original withdrawal subject. Its rights state blocks use without rewriting prior evidence. */
export const withdrawalFixture = buildSb1({
  seedKey: "fixture-withdrawn-sb1",
  familySlug: "fixture-family-withdrawn-sb1",
  scenario: "scenario.negative_test.withdrawn_original",
  stimulusId: "fixture-withdrawn-letter",
  segments: clubSegments,
  gaps: clubGaps,
  intent: "withdrawal_fixture",
  rightsState: "withdrawn",
});
