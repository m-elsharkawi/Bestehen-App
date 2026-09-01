/**
 * R2 — detailed select. Two independent seed families (decision D03).
 *
 * One stimulus of well under four hundred words carries five questions with three options each. The
 * decisive evidence is a **direct span**: for every item the key names the sentence that settles it,
 * and the learner payload carries only the anchor identity, so the span cannot leak before the
 * attempt is finalised.
 *
 * Every distractor is authored against the same span. The failure families used here are the three
 * that a detail question actually produces — a surface word match, a partially satisfied constraint,
 * and a claim that is plausible but simply unsupported — rather than a generic "wrong".
 */

import type { DistractorFailureFamily } from "../keys.js";
import type { R2DetailedSelect, ReadingStimulus } from "../task-families.js";
import {
  type SeedArtifact,
  type SeedItemSpec,
  buildSeedArtifact,
  option,
  paragraph,
  seedInstruction,
} from "./builders.js";
import { seedItemId } from "./identity.js";

const instructionLines = [
  "Lesen Sie den Text. Beantworten Sie danach die fünf Fragen.",
  "Zu jeder Frage gibt es drei Antworten. Nur eine Antwort ist richtig.",
];

interface AnswerSpec {
  readonly optionId: string;
  readonly label: string;
  /** Why this answer looks reasonable, in one authored line. */
  readonly appeal: string;
  readonly failureFamily?: DistractorFailureFamily;
}

interface QuestionSpec {
  readonly questionId: string;
  readonly itemKey: string;
  readonly question: string;
  readonly anchorId: string;
  /** The sentence that decides the item. Server-only; the payload carries the anchor id alone. */
  readonly decisiveSpan: string;
  readonly acceptedOptionId: string;
  readonly answers: readonly AnswerSpec[];
}

interface R2FamilySpec {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly scenario: string;
  readonly stimulusId: string;
  readonly genreDomainRegister: string;
  readonly lines: readonly string[];
  readonly questions: readonly QuestionSpec[];
}

function buildR2(spec: R2FamilySpec): SeedArtifact {
  const stimulus: ReadingStimulus = {
    stimulusId: spec.stimulusId,
    safeContentNodes: spec.lines.map((line) => paragraph(line)),
    language: "de",
    genreDomainRegister: spec.genreDomainRegister,
    evidenceAnchorIds: spec.questions.map((question) => question.anchorId),
  };

  const payload: R2DetailedSelect = {
    kind: "R2DetailedSelect",
    stimulus,
    questions: spec.questions.map((question) => ({
      itemRef: seedItemId(spec.seedKey, question.itemKey),
      questionId: question.questionId,
      questionNodes: [paragraph(question.question)],
      options: question.answers.map((answer) => option(answer.optionId, answer.label)),
    })),
  };

  const items: readonly SeedItemSpec[] = spec.questions.map((question) => {
    const answerById = new Map(
      question.answers.map((answer) => [answer.optionId, answer] as const),
    );
    return {
      itemKey: question.itemKey,
      binding: { kind: "select", questionId: question.questionId },
      responseKind: "single_select",
      capabilityRefs: ["tax.reading.detail"],
      accepted: [{ kind: "option", optionId: question.acceptedOptionId }],
      decisiveEvidence: [
        {
          stimulusId: spec.stimulusId,
          anchorId: question.anchorId,
          safeRevealSpanOrRelation: question.decisiveSpan,
          relationKind: "direct_span",
        },
      ],
      correctRationale: `Der Text sagt: „${question.decisiveSpan}“`,
      distractor: (identifier: string) => {
        const answer = answerById.get(identifier);
        return {
          whyPlausible: answer?.appeal ?? `„${identifier}“ wirkt auf den ersten Blick passend.`,
          decisiveMismatch: `Entscheidend ist der Satz „${question.decisiveSpan}“; er stützt diese Antwort nicht.`,
          failureFamily: answer?.failureFamily ?? "plausible_but_unsupported",
        };
      },
      causeRef: "cause.reading.detail_not_located",
    };
  });

  return buildSeedArtifact({
    seedKey: spec.seedKey,
    familySlug: spec.familySlug,
    taskFamilyKind: "R2DetailedSelect",
    scenarioConfigurationRef: spec.scenario,
    decisiveRealizationRef: "realization.direct_span",
    answerPathRef: "path.locate_span_then_select",
    capabilityRefs: ["tax.reading.detail"],
    instruction: seedInstruction(`${spec.seedKey}-instruction`, "single_select", instructionLines),
    learnerPayload: payload,
    items,
  });
}

/* ------------------------------------------------------------------------------------------------
 * Family A — a shared ride to work
 * ---------------------------------------------------------------------------------------------- */

const rideShareLines: readonly string[] = [
  "Seit dem Frühjahr fährt Marija jeden Werktag von Rosbach nach Friedberg zur Arbeit.",
  "Mit dem Zug wäre sie fast eine Stunde unterwegs, weil sie zweimal umsteigen müsste; mit dem Auto sind es zwanzig Minuten.",
  "Ein eigenes Auto wollte sie sich trotzdem nicht kaufen, denn die Versicherung und die Werkstatt waren ihr zu teuer.",
  "Im Mai hat sie deshalb im Schwarzen Brett ihrer Firma eine Fahrgemeinschaft gesucht und nach zwei Wochen eine Antwort bekommen.",
  "Heute holt ihr Kollege Ahmet sie um Viertel vor sieben an der Bushaltestelle ab; sie teilen sich die Kosten für den Kraftstoff.",
  "An zwei Tagen in der Woche arbeitet Ahmet von zu Hause aus, und an diesen Tagen nimmt Marija doch den Zug.",
  "Sie sagt, das Unangenehmste sei nicht die Fahrzeit, sondern die Unsicherheit am Abend: Wenn eine Besprechung länger dauert, wartet jemand auf sie.",
  "Deshalb haben die beiden vereinbart, dass sie sich spätestens um sechzehn Uhr eine kurze Nachricht schreiben.",
];

const rideShareQuestions: readonly QuestionSpec[] = [
  {
    questionId: "r2a-q-grund",
    itemKey: "item-grund",
    question: "Warum hat Marija sich kein eigenes Auto gekauft?",
    anchorId: "r2a-anchor-kosten",
    decisiveSpan:
      "Ein eigenes Auto wollte sie sich trotzdem nicht kaufen, denn die Versicherung und die Werkstatt waren ihr zu teuer.",
    acceptedOptionId: "r2a-a-kosten",
    answers: [
      {
        optionId: "r2a-a-kosten",
        label: "Die laufenden Kosten waren ihr zu hoch.",
        appeal: "Die richtige Antwort nennt genau den Grund, den der Text angibt.",
      },
      {
        optionId: "r2a-a-fuehrerschein",
        label: "Sie hat noch keinen Führerschein.",
        appeal: "Wer kein Auto kauft, hat oft keinen Führerschein, und der Text erwähnt keinen.",
        failureFamily: "plausible_but_unsupported",
      },
      {
        optionId: "r2a-a-parkplatz",
        label: "In Friedberg findet sie keinen Parkplatz.",
        appeal:
          "Parkplätze sind beim Pendeln ein bekanntes Problem, und der Text spielt in zwei Städten.",
        failureFamily: "plausible_but_unsupported",
      },
    ],
  },
  {
    questionId: "r2a-q-zeit",
    itemKey: "item-zeit",
    question: "Wie lange bräuchte Marija mit dem Zug?",
    anchorId: "r2a-anchor-fahrzeit",
    decisiveSpan:
      "Mit dem Zug wäre sie fast eine Stunde unterwegs, weil sie zweimal umsteigen müsste; mit dem Auto sind es zwanzig Minuten.",
    acceptedOptionId: "r2a-a-stunde",
    answers: [
      {
        optionId: "r2a-a-stunde",
        label: "Beinahe eine Stunde.",
        appeal: "Der Text nennt diese Dauer ausdrücklich für den Zug.",
      },
      {
        optionId: "r2a-a-zwanzig",
        label: "Etwa zwanzig Minuten.",
        appeal: "Die Zahl steht wörtlich im selben Satz, gehört dort aber zur Fahrt mit dem Auto.",
        failureFamily: "surface_word_match",
      },
      {
        optionId: "r2a-a-zweistunden",
        label: "Über zwei Stunden.",
        appeal: "Zweimal umsteigen klingt nach einer sehr langen Fahrt.",
        failureFamily: "partial_constraint_match",
      },
    ],
  },
  {
    questionId: "r2a-q-suche",
    itemKey: "item-suche",
    question: "Wie hat Marija die Fahrgemeinschaft gefunden?",
    anchorId: "r2a-anchor-suche",
    decisiveSpan:
      "Im Mai hat sie deshalb im Schwarzen Brett ihrer Firma eine Fahrgemeinschaft gesucht und nach zwei Wochen eine Antwort bekommen.",
    acceptedOptionId: "r2a-a-aushang",
    answers: [
      {
        optionId: "r2a-a-aushang",
        label: "Über einen Aushang in ihrer Firma.",
        appeal: "Das Schwarze Brett der Firma ist genau der Weg, den der Text nennt.",
      },
      {
        optionId: "r2a-a-app",
        label: "Über eine App für Mitfahrgelegenheiten.",
        appeal: "Fahrgemeinschaften werden heute meist über Apps organisiert.",
        failureFamily: "plausible_but_unsupported",
      },
      {
        optionId: "r2a-a-nachbarn",
        label: "Über eine Nachbarin in Rosbach.",
        appeal: "Rosbach ist ihr Wohnort und wird im Text mehrfach genannt.",
        failureFamily: "surface_word_match",
      },
    ],
  },
  {
    questionId: "r2a-q-homeoffice",
    itemKey: "item-homeoffice",
    question: "Was macht Marija an Ahmets Homeoffice-Tagen?",
    anchorId: "r2a-anchor-zugtage",
    decisiveSpan:
      "An zwei Tagen in der Woche arbeitet Ahmet von zu Hause aus, und an diesen Tagen nimmt Marija doch den Zug.",
    acceptedOptionId: "r2a-a-zug",
    answers: [
      {
        optionId: "r2a-a-zug",
        label: "Sie fährt mit dem Zug.",
        appeal: "Der Text nennt diese Ausnahme direkt.",
      },
      {
        optionId: "r2a-a-zuhause",
        label: "Sie arbeitet ebenfalls von zu Hause.",
        appeal: "Der Satz spricht von Homeoffice, allerdings nur von Ahmets, nicht von ihrem.",
        failureFamily: "wrong_referent",
      },
      {
        optionId: "r2a-a-fahrrad",
        label: "Sie nimmt das Fahrrad.",
        appeal: "Zwanzig Minuten Weg klingen nach einer Strecke, die man radeln könnte.",
        failureFamily: "plausible_but_unsupported",
      },
    ],
  },
  {
    questionId: "r2a-q-absprache",
    itemKey: "item-absprache",
    question: "Was haben Marija und Ahmet vereinbart?",
    anchorId: "r2a-anchor-nachricht",
    decisiveSpan:
      "Deshalb haben die beiden vereinbart, dass sie sich spätestens um sechzehn Uhr eine kurze Nachricht schreiben.",
    acceptedOptionId: "r2a-a-nachricht",
    answers: [
      {
        optionId: "r2a-a-nachricht",
        label: "Sie melden sich am Nachmittag kurz, wenn sich etwas ändert.",
        appeal: "Die Nachricht bis sechzehn Uhr ist genau diese Vereinbarung.",
      },
      {
        optionId: "r2a-a-warten",
        label: "Wer zuerst fertig ist, wartet höchstens eine halbe Stunde.",
        appeal:
          "Das Warten am Abend ist im Text das eigentliche Problem, aber es wird keine Wartezeit vereinbart.",
        failureFamily: "partial_constraint_match",
      },
      {
        optionId: "r2a-a-kosten2",
        label: "Sie rechnen die Kosten am Monatsende ab.",
        appeal: "Die geteilten Kraftstoffkosten kommen im Text tatsächlich vor.",
        failureFamily: "surface_word_match",
      },
    ],
  },
];

/* ------------------------------------------------------------------------------------------------
 * Family B — new lending rules at a city library
 * ---------------------------------------------------------------------------------------------- */

const libraryLines: readonly string[] = [
  "Die Stadtbibliothek Wallhausen ändert ab dem ersten Oktober mehrere Regeln für das Ausleihen.",
  "Bücher dürfen künftig vier Wochen statt drei behalten werden; für Filme und Hörbücher bleibt es bei einer Woche.",
  "Neu ist, dass man die Leihfrist zweimal selbst im Konto verlängern kann, solange niemand das Medium vorgemerkt hat.",
  "Die Gebühr für verspätete Rückgaben steigt nicht, wird aber ab dem ersten Tag berechnet statt wie bisher ab dem dritten.",
  "Wer unter achtzehn ist, zahlt weiterhin keinen Jahresbeitrag; für alle anderen kostet der Ausweis zwölf Euro im Jahr.",
  "Am Eingang steht ab Oktober ein Rückgabekasten, der auch sonntags benutzt werden kann.",
  "Die Bibliothek bittet darum, beschädigte Medien nicht in den Kasten zu werfen, sondern am Schalter abzugeben.",
];

const libraryQuestions: readonly QuestionSpec[] = [
  {
    questionId: "r2b-q-frist",
    itemKey: "item-frist",
    question: "Wie lange darf man ab Oktober ein Buch behalten?",
    anchorId: "r2b-anchor-frist",
    decisiveSpan:
      "Bücher dürfen künftig vier Wochen statt drei behalten werden; für Filme und Hörbücher bleibt es bei einer Woche.",
    acceptedOptionId: "r2b-a-vier",
    answers: [
      {
        optionId: "r2b-a-vier",
        label: "Vier Wochen.",
        appeal: "Der Text nennt diese neue Frist ausdrücklich für Bücher.",
      },
      {
        optionId: "r2b-a-drei",
        label: "Drei Wochen.",
        appeal: "Drei Wochen stehen im selben Satz, gelten aber für die alte Regel.",
        failureFamily: "surface_word_match",
      },
      {
        optionId: "r2b-a-eine",
        label: "Eine Woche.",
        appeal: "Eine Woche wird genannt, allerdings für Filme und Hörbücher.",
        failureFamily: "wrong_referent",
      },
    ],
  },
  {
    questionId: "r2b-q-verlaengern",
    itemKey: "item-verlaengern",
    question: "Unter welcher Bedingung kann man selbst verlängern?",
    anchorId: "r2b-anchor-verlaengern",
    decisiveSpan:
      "Neu ist, dass man die Leihfrist zweimal selbst im Konto verlängern kann, solange niemand das Medium vorgemerkt hat.",
    acceptedOptionId: "r2b-a-vormerkung",
    answers: [
      {
        optionId: "r2b-a-vormerkung",
        label: "Solange kein anderer Mensch das Medium vorgemerkt hat.",
        appeal: "Genau diese Bedingung steht im Text.",
      },
      {
        optionId: "r2b-a-schalter",
        label: "Nur, wenn man vorher am Schalter fragt.",
        appeal:
          "Der Schalter kommt im Text vor, allerdings im Zusammenhang mit beschädigten Medien.",
        failureFamily: "surface_word_match",
      },
      {
        optionId: "r2b-a-gebuehr",
        label: "Nur, wenn keine Gebühren offen sind.",
        appeal: "Offene Gebühren sind in vielen Bibliotheken tatsächlich ein Hindernis.",
        failureFamily: "plausible_but_unsupported",
      },
    ],
  },
  {
    questionId: "r2b-q-gebuehr",
    itemKey: "item-gebuehr",
    question: "Was ändert sich bei der Gebühr für verspätete Rückgaben?",
    anchorId: "r2b-anchor-gebuehr",
    decisiveSpan:
      "Die Gebühr für verspätete Rückgaben steigt nicht, wird aber ab dem ersten Tag berechnet statt wie bisher ab dem dritten.",
    acceptedOptionId: "r2b-a-frueher",
    answers: [
      {
        optionId: "r2b-a-frueher",
        label: "Sie beginnt früher zu laufen.",
        appeal: "Der Text sagt, dass ab dem ersten statt ab dem dritten Tag gerechnet wird.",
      },
      {
        optionId: "r2b-a-teurer",
        label: "Sie wird teurer.",
        appeal:
          "Bei einer Regeländerung liegt eine Erhöhung nahe, der Satz schließt sie aber ausdrücklich aus.",
        failureFamily: "opposite_polarity",
      },
      {
        optionId: "r2b-a-entfaellt",
        label: "Sie entfällt für Jugendliche.",
        appeal: "Für Jugendliche entfällt im Text tatsächlich etwas, nämlich der Jahresbeitrag.",
        failureFamily: "wrong_referent",
      },
    ],
  },
  {
    questionId: "r2b-q-beitrag",
    itemKey: "item-beitrag",
    question: "Wer zahlt keinen Jahresbeitrag?",
    anchorId: "r2b-anchor-beitrag",
    decisiveSpan:
      "Wer unter achtzehn ist, zahlt weiterhin keinen Jahresbeitrag; für alle anderen kostet der Ausweis zwölf Euro im Jahr.",
    acceptedOptionId: "r2b-a-jugend",
    answers: [
      {
        optionId: "r2b-a-jugend",
        label: "Alle, die noch nicht achtzehn sind.",
        appeal: "Der Text nennt genau diese Altersgrenze.",
      },
      {
        optionId: "r2b-a-studierende",
        label: "Studierende.",
        appeal: "Ermäßigungen für Studierende sind in Bibliotheken üblich.",
        failureFamily: "plausible_but_unsupported",
      },
      {
        optionId: "r2b-a-alle",
        label: "Ab Oktober niemand mehr.",
        appeal:
          "Der Text kündigt viele Änderungen zum Oktober an, den Beitrag lässt er aber unverändert.",
        failureFamily: "partial_constraint_match",
      },
    ],
  },
  {
    questionId: "r2b-q-kasten",
    itemKey: "item-kasten",
    question: "Was soll nicht in den Rückgabekasten?",
    anchorId: "r2b-anchor-kasten",
    decisiveSpan:
      "Die Bibliothek bittet darum, beschädigte Medien nicht in den Kasten zu werfen, sondern am Schalter abzugeben.",
    acceptedOptionId: "r2b-a-beschaedigt",
    answers: [
      {
        optionId: "r2b-a-beschaedigt",
        label: "Beschädigte Medien.",
        appeal: "Der Text nennt diese Ausnahme wörtlich.",
      },
      {
        optionId: "r2b-a-filme",
        label: "Filme und Hörbücher.",
        appeal: "Filme und Hörbücher haben im Text eine Sonderregel, aber nur bei der Leihfrist.",
        failureFamily: "wrong_referent",
      },
      {
        optionId: "r2b-a-sonntag",
        label: "Alles, was sonntags zurückkommt.",
        appeal: "Der Sonntag wird genannt, und zwar als der Tag, an dem der Kasten gerade hilft.",
        failureFamily: "opposite_polarity",
      },
    ],
  },
];

export const r2FamilyA: SeedArtifact = buildR2({
  seedKey: "r2-fahrgemeinschaft",
  familySlug: "r2-family-commute-narrative",
  scenario: "scenario.article.commuting_narrative",
  stimulusId: "r2a-fahrgemeinschaft",
  genreDomainRegister: "Zeitschriftentext, Alltag und Arbeit, erzählend-sachlich",
  lines: rideShareLines,
  questions: rideShareQuestions,
});

export const r2FamilyB: SeedArtifact = buildR2({
  seedKey: "r2-bibliothek",
  familySlug: "r2-family-library-rules",
  scenario: "scenario.article.public_service_rules",
  stimulusId: "r2b-bibliothek",
  genreDomainRegister: "Informationstext, öffentliche Einrichtung, sachlich",
  lines: libraryLines,
  questions: libraryQuestions,
});

export const r2SeedArtifacts: readonly SeedArtifact[] = [r2FamilyA, r2FamilyB];
