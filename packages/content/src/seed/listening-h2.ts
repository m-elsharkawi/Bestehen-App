/** H2 conversation/interview seeds. One connected dialogue, five items, two plays at P4. */

import type { MediaRevisionId } from "@bestehen/domain";
import type { H2ConversationInterview, ListeningStimulus } from "../task-families.js";
import { p4AllowedPlayCounts } from "../task-families.js";
import { paragraph } from "./builders.js";
import {
  type ListeningQuestionSpec,
  buildListeningArtifact,
  listeningQuestion,
  seedAudio,
} from "./listening-builders.js";

function buildH2(input: {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly scenario: string;
  readonly stimulusId: string;
  readonly script: string;
  readonly questions: readonly ListeningQuestionSpec[];
}) {
  const audio = [
    seedAudio({
      assetKey: `${input.seedKey}-dialogue`,
      contentSeedKey: input.seedKey,
      contentFamilySlug: input.familySlug,
      listeningFamily: "H2",
      script: input.script,
    }),
  ];
  const conversation: ListeningStimulus = {
    stimulusId: input.stimulusId,
    mediaRevisionId: audio[0]?.rendition.mediaRevisionId as MediaRevisionId,
    language: "de",
    genreDomainRegister: "Alltagsinterview, zwei Sprechende, natürlich und sachlich",
    writtenInstructionNodes: [
      paragraph("Hören Sie das Gespräch zweimal und beantworten Sie die fünf Fragen."),
    ],
    evidenceAnchorIds: input.questions.map((question) => question.anchorId),
  };
  const payload: H2ConversationInterview = {
    kind: "H2ConversationInterview",
    conversation,
    questions: input.questions.map((question) => listeningQuestion(input.seedKey, question)),
    allowedPlayCount: p4AllowedPlayCounts.H2ConversationInterview,
  };
  return buildListeningArtifact({
    seedKey: input.seedKey,
    familySlug: input.familySlug,
    kind: "H2ConversationInterview",
    shortFamily: "H2",
    scenario: input.scenario,
    capabilityRef: "tax.listening.conversation_detail",
    payload,
    questions: input.questions,
    audio,
  });
}

const repairScript =
  "Kundin: Guten Morgen. Mein Fahrrad war gestern zur Reparatur hier. Seitdem schleift die Bremse hinten. Mitarbeiter: Das tut mir leid. Haben Sie den Abholschein dabei? Kundin: Ja. Ich brauche das Rad allerdings heute Abend für den Weg zur Arbeit. Mitarbeiter: Wir sehen es uns sofort an. Wenn nur der Bremszug nachgestellt werden muss, dauert es etwa dreißig Minuten. Ein neues Teil müssten wir bestellen. Kundin: Kostet die Kontrolle noch einmal etwas? Mitarbeiter: Nein, die Nachkontrolle gehört zur gestrigen Reparatur. Setzen Sie sich gern ins Café nebenan. Ich rufe Sie an, sobald wir wissen, was fehlt. Kundin: Gut, meine Nummer steht auf dem Schein.";
const repairQuestions: readonly ListeningQuestionSpec[] = [
  {
    id: "h2a-q-problem",
    itemKey: "item-problem",
    question: "Welches Problem hat die Kundin?",
    stimulusId: "h2a-dialogue",
    anchorId: "h2a-a-problem",
    decisiveRelation: "Seit der Reparatur schleift die hintere Bremse.",
    acceptedOptionId: "h2a-o-brake",
    answers: [
      {
        id: "h2a-o-light",
        label: "Das Licht funktioniert nicht.",
        failureFamily: "plausible_but_unsupported",
      },
      { id: "h2a-o-brake", label: "Die hintere Bremse schleift." },
      {
        id: "h2a-o-tire",
        label: "Der Reifen ist leer.",
        failureFamily: "plausible_but_unsupported",
      },
    ],
  },
  {
    id: "h2a-q-today",
    itemKey: "item-today",
    question: "Warum ist die Reparatur eilig?",
    stimulusId: "h2a-dialogue",
    anchorId: "h2a-a-today",
    decisiveRelation: "Sie braucht das Fahrrad heute Abend für den Arbeitsweg.",
    acceptedOptionId: "h2a-o-work",
    answers: [
      {
        id: "h2a-o-trip",
        label: "Sie fährt morgen in den Urlaub.",
        failureFamily: "plausible_but_unsupported",
      },
      { id: "h2a-o-work", label: "Sie braucht es für den Weg zur Arbeit." },
      {
        id: "h2a-o-sale",
        label: "Sie möchte es verkaufen.",
        failureFamily: "plausible_but_unsupported",
      },
    ],
  },
  {
    id: "h2a-q-duration",
    itemKey: "item-duration",
    question: "Wann dauert die Arbeit ungefähr dreißig Minuten?",
    stimulusId: "h2a-dialogue",
    anchorId: "h2a-a-duration",
    decisiveRelation: "Dreißig Minuten genügen nur, wenn der Bremszug nachgestellt werden muss.",
    acceptedOptionId: "h2a-o-adjust",
    answers: [
      { id: "h2a-o-adjust", label: "Wenn nur der Bremszug eingestellt wird." },
      {
        id: "h2a-o-part",
        label: "Wenn ein neues Teil bestellt wird.",
        failureFamily: "opposite_polarity",
      },
      {
        id: "h2a-o-check",
        label: "Wenn der Abholschein fehlt.",
        failureFamily: "surface_word_match",
      },
    ],
  },
  {
    id: "h2a-q-cost",
    itemKey: "item-cost",
    question: "Was kostet die Nachkontrolle?",
    stimulusId: "h2a-dialogue",
    anchorId: "h2a-a-cost",
    decisiveRelation: "Die Nachkontrolle ist Teil der gestrigen Reparatur und kostet nichts extra.",
    acceptedOptionId: "h2a-o-free",
    answers: [
      { id: "h2a-o-free", label: "Nichts zusätzlich." },
      {
        id: "h2a-o-half",
        label: "Die Hälfte der Reparatur.",
        failureFamily: "plausible_but_unsupported",
      },
      { id: "h2a-o-cafe", label: "Nur den Preis im Café.", failureFamily: "surface_word_match" },
    ],
  },
  {
    id: "h2a-q-contact",
    itemKey: "item-contact",
    question: "Wie erfährt die Kundin das Ergebnis?",
    stimulusId: "h2a-dialogue",
    anchorId: "h2a-a-contact",
    decisiveRelation: "Der Mitarbeiter ruft sie an; die Nummer steht auf dem Schein.",
    acceptedOptionId: "h2a-o-call",
    answers: [
      { id: "h2a-o-email", label: "Per E-Mail.", failureFamily: "plausible_but_unsupported" },
      { id: "h2a-o-call", label: "Durch einen Anruf." },
      {
        id: "h2a-o-return",
        label: "Wenn sie später selbst zurückkommt.",
        failureFamily: "partial_constraint_match",
      },
    ],
  },
];

const courseScript =
  "Moderatorin: Herr Demir, Sie leiten seit einem Jahr einen Kochkurs im Jugendzentrum. Wer kommt zu Ihnen? Kursleiter: Vor allem Menschen, die nach der Arbeit schnell und günstig kochen möchten. Vorkenntnisse braucht niemand. Moderatorin: Was machen Sie heute? Kursleiter: Eine Gemüsesuppe und ein Fladenbrot. Das Brot bereiten wir zuerst vor, weil der Teig ruhen muss. Moderatorin: Müssen die Teilnehmenden etwas mitbringen? Kursleiter: Nur eine Dose für Reste. Zutaten und Schürzen sind im Preis von achtzehn Euro enthalten. Moderatorin: Der Kurs sollte ursprünglich um achtzehn Uhr beginnen. Kursleiter: Richtig, aber der Raum ist vorher belegt. Heute starten wir erst um halb sieben und enden gegen neun. Moderatorin: Gibt es noch Plätze? Kursleiter: Für heute nicht. Für den Termin nächsten Monat kann man sich ab Montag online anmelden.";
const courseQuestions: readonly ListeningQuestionSpec[] = [
  {
    id: "h2b-q-audience",
    itemKey: "item-audience",
    question: "Für wen ist der Kurs besonders gedacht?",
    stimulusId: "h2b-dialogue",
    anchorId: "h2b-a-audience",
    decisiveRelation:
      "Der Kurs richtet sich vor allem an Menschen, die nach der Arbeit schnell und günstig kochen möchten.",
    acceptedOptionId: "h2b-o-workers",
    answers: [
      { id: "h2b-o-workers", label: "Menschen, die nach der Arbeit einfach kochen möchten." },
      {
        id: "h2b-o-pros",
        label: "Erfahrene Köchinnen und Köche.",
        failureFamily: "opposite_polarity",
      },
      { id: "h2b-o-youth", label: "Nur Jugendliche.", failureFamily: "surface_word_match" },
    ],
  },
  {
    id: "h2b-q-first",
    itemKey: "item-first",
    question: "Was bereitet die Gruppe zuerst vor?",
    stimulusId: "h2b-dialogue",
    anchorId: "h2b-a-first",
    decisiveRelation: "Zuerst wird das Fladenbrot vorbereitet, weil der Teig ruhen muss.",
    acceptedOptionId: "h2b-o-bread",
    answers: [
      { id: "h2b-o-soup", label: "Die Gemüsesuppe.", failureFamily: "surface_word_match" },
      { id: "h2b-o-bread", label: "Das Fladenbrot." },
      { id: "h2b-o-salad", label: "Einen Salat.", failureFamily: "plausible_but_unsupported" },
    ],
  },
  {
    id: "h2b-q-bring",
    itemKey: "item-bring",
    question: "Was sollen die Teilnehmenden mitbringen?",
    stimulusId: "h2b-dialogue",
    anchorId: "h2b-a-bring",
    decisiveRelation: "Sie sollen nur eine Dose für mögliche Reste mitbringen.",
    acceptedOptionId: "h2b-o-box",
    answers: [
      { id: "h2b-o-apron", label: "Eine Schürze.", failureFamily: "opposite_polarity" },
      { id: "h2b-o-food", label: "Die Zutaten.", failureFamily: "opposite_polarity" },
      { id: "h2b-o-box", label: "Eine Dose." },
    ],
  },
  {
    id: "h2b-q-time",
    itemKey: "item-time",
    question: "Wann beginnt der Kurs heute?",
    stimulusId: "h2b-dialogue",
    anchorId: "h2b-a-time",
    decisiveRelation: "Heute beginnt der Kurs um halb sieben, also um 18.30 Uhr.",
    acceptedOptionId: "h2b-o-1830",
    answers: [
      { id: "h2b-o-1800", label: "Um 18 Uhr.", failureFamily: "surface_word_match" },
      { id: "h2b-o-1830", label: "Um 18.30 Uhr." },
      { id: "h2b-o-2100", label: "Um 21 Uhr.", failureFamily: "wrong_referent" },
    ],
  },
  {
    id: "h2b-q-next",
    itemKey: "item-next",
    question: "Wie meldet man sich für den nächsten Termin an?",
    stimulusId: "h2b-dialogue",
    anchorId: "h2b-a-next",
    decisiveRelation: "Für den Termin im nächsten Monat beginnt die Online-Anmeldung am Montag.",
    acceptedOptionId: "h2b-o-online",
    answers: [
      {
        id: "h2b-o-phone",
        label: "Heute telefonisch.",
        failureFamily: "plausible_but_unsupported",
      },
      {
        id: "h2b-o-centre",
        label: "Direkt im Jugendzentrum.",
        failureFamily: "surface_word_match",
      },
      { id: "h2b-o-online", label: "Ab Montag online." },
    ],
  },
];

export const h2FamilyA = buildH2({
  seedKey: "h2-fahrradwerkstatt",
  familySlug: "h2-family-service-complaint-dialogue",
  scenario: "scenario.listening.service_problem",
  stimulusId: "h2a-dialogue",
  script: repairScript,
  questions: repairQuestions,
});
export const h2FamilyB = buildH2({
  seedKey: "h2-kochkurs",
  familySlug: "h2-family-local-radio-interview",
  scenario: "scenario.listening.community_interview",
  stimulusId: "h2b-dialogue",
  script: courseScript,
  questions: courseQuestions,
});

export const h2SeedFamilies = [h2FamilyA, h2FamilyB] as const;
export const h2SeedArtifacts = h2SeedFamilies.map((family) => family.artifact);
export const h2SeedAudio = h2SeedFamilies.flatMap((family) => family.audio);
