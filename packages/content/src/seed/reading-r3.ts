/** R3 situation-to-notice matching, with two genuinely different exposure families. */

import type { DistractorFailureFamily } from "../keys.js";
import type { R3SituationNoticeMatching, ReadingStimulus } from "../task-families.js";
import {
  type SeedArtifact,
  type SeedItemSpec,
  buildSeedArtifact,
  option,
  paragraph,
  seedInstruction,
} from "./builders.js";
import { seedItemId } from "./identity.js";

interface NoticeSpec {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly offer: string;
}

interface SituationSpec {
  readonly id: string;
  readonly itemKey: string;
  readonly text: string;
  readonly requirement: string;
  readonly noticeId: string | "no_match";
}

interface R3Spec {
  readonly seedKey: string;
  readonly familySlug: string;
  readonly scenario: string;
  readonly notices: readonly NoticeSpec[];
  readonly situations: readonly SituationSpec[];
}

const instruction = [
  "Lesen Sie die zehn Situationen und die zwölf Anzeigen.",
  "Welche Anzeige passt? Jede Anzeige darf nur einmal gewählt werden. Für eine Situation gibt es keine passende Anzeige.",
];

function buildR3(spec: R3Spec): SeedArtifact {
  const noticeById = new Map(spec.notices.map((notice) => [notice.id, notice] as const));
  const noMatchId = `${spec.seedKey}-no-match`;
  const payload: R3SituationNoticeMatching = {
    kind: "R3SituationNoticeMatching",
    situations: spec.situations.map((situation) => ({
      promptId: situation.id,
      safeContentNodes: [paragraph(situation.text)],
    })),
    notices: spec.notices.map(
      (notice): ReadingStimulus => ({
        stimulusId: notice.id,
        safeContentNodes: [paragraph(notice.title), paragraph(notice.detail)],
        language: "de",
        genreDomainRegister: "Kleinanzeige, Alltag und Dienstleistung, sachlich",
        evidenceAnchorIds: [`${notice.id}-anchor`],
      }),
    ),
    matchConstraints: {
      leftCardinality: { min: 10, max: 10 },
      rightReusePolicy: "at_most_once",
      unmatchedPolicy: "explicit_no_match",
      completionRule: "all_left_bound",
    },
    noMatchOption: option(noMatchId, "Keine Anzeige passt"),
    itemBindings: spec.situations.map((situation) => ({
      itemRef: seedItemId(spec.seedKey, situation.itemKey),
      leftId: situation.id,
    })),
  };

  const items: readonly SeedItemSpec[] = spec.situations.map((situation) => {
    const accepted =
      situation.noticeId === "no_match"
        ? ([{ kind: "no_match", leftId: situation.id }] as const)
        : ([{ kind: "match", leftId: situation.id, rightId: situation.noticeId }] as const);
    const relation =
      situation.noticeId === "no_match"
        ? `Keine Anzeige erfüllt vollständig: ${situation.requirement}`
        : `${situation.requirement} Die Anzeige bietet: ${noticeById.get(situation.noticeId)?.offer ?? "unbekannt"}`;
    return {
      itemKey: situation.itemKey,
      binding: { kind: "match", leftId: situation.id },
      responseKind: "match",
      capabilityRefs: ["tax.reading.constraint_matching"],
      accepted,
      decisiveEvidence: [
        {
          stimulusId: situation.noticeId === "no_match" ? situation.id : situation.noticeId,
          anchorId:
            situation.noticeId === "no_match"
              ? `${situation.id}-constraint-set`
              : `${situation.noticeId}-anchor`,
          safeRevealSpanOrRelation: relation,
          relationKind: "constraint_set",
        },
      ],
      correctRationale: relation,
      distractor: (identifier: string) => {
        const candidate = noticeById.get(identifier);
        const isNoMatchChoice = identifier === noMatchId;
        return {
          whyPlausible: isNoMatchChoice
            ? "Ein Detail der gesuchten Kombination ist nicht sofort sichtbar."
            : `Die Anzeige nennt ein grundsätzlich passendes Alltagsthema: ${candidate?.offer ?? identifier}.`,
          decisiveMismatch: isNoMatchChoice
            ? `Eine Anzeige erfüllt die vollständige Anforderung: ${situation.requirement}`
            : `Die Anzeige erfüllt nicht die vollständige Anforderung: ${situation.requirement}`,
          failureFamily: "partial_constraint_match" as DistractorFailureFamily,
        };
      },
      causeRef: "cause.reading.constraint_not_checked",
    };
  });

  return buildSeedArtifact({
    seedKey: spec.seedKey,
    familySlug: spec.familySlug,
    taskFamilyKind: "R3SituationNoticeMatching",
    scenarioConfigurationRef: spec.scenario,
    decisiveRealizationRef: "realization.complete_constraint_set",
    answerPathRef: "path.compare_must_have_constraints",
    capabilityRefs: ["tax.reading.constraint_matching"],
    instruction: seedInstruction(
      `${spec.seedKey}-instruction`,
      "match_select_then_place",
      instruction,
    ),
    learnerPayload: payload,
    items,
  });
}

const cityNotices: readonly NoticeSpec[] = [
  {
    id: "r3a-n-bike",
    title: "Fahrradwerkstatt mobil",
    detail:
      "Wir reparieren Ihr Rad samstags bei Ihnen zu Hause. Termine online, Anfahrt im Stadtgebiet inklusive.",
    offer: "Fahrradreparatur zu Hause am Samstag",
  },
  {
    id: "r3a-n-dog",
    title: "Hundegruppe am Abend",
    detail: "Gemeinsames Training dienstags um 19 Uhr. Auch junge Hunde sind willkommen.",
    offer: "Hundetraining am Dienstagabend",
  },
  {
    id: "r3a-n-room",
    title: "Ruhiges Zimmer",
    detail: "Möbliertes Zimmer ab November, Nähe Hochschule, Mindestmiete sechs Monate.",
    offer: "möbliertes Zimmer nahe der Hochschule für mindestens sechs Monate",
  },
  {
    id: "r3a-n-guitar",
    title: "Gitarrenunterricht",
    detail: "Einzelstunden für Erwachsene, mittwochs nach 18 Uhr. Leihinstrument vorhanden.",
    offer: "Gitarrenunterricht für Erwachsene mit Leihinstrument",
  },
  {
    id: "r3a-n-table",
    title: "Großer Esstisch",
    detail: "Holztisch für sechs Personen, nur Abholung bis Freitag, 60 Euro.",
    offer: "Esstisch für sechs Personen zur Abholung",
  },
  {
    id: "r3a-n-childcare",
    title: "Kinderbetreuung",
    detail: "Erfahrene Studentin betreut Kinder am Freitagabend bei Ihnen zu Hause.",
    offer: "Kinderbetreuung am Freitagabend zu Hause",
  },
  {
    id: "r3a-n-course",
    title: "Deutsch im Beruf",
    detail: "Onlinekurs B1, montags und donnerstags ab 20 Uhr, zwölf Wochen.",
    offer: "B1-Berufsdeutsch online am späten Abend",
  },
  {
    id: "r3a-n-van",
    title: "Transporter mieten",
    detail: "Kleintransporter stundenweise, Führerschein Klasse B genügt, Abholung am Bahnhof.",
    offer: "stundenweise gemieteter Kleintransporter",
  },
  {
    id: "r3a-n-sewing",
    title: "Nähkurs für Anfänger",
    detail: "Vier Samstage, Maschinen stehen bereit. Material bitte selbst mitbringen.",
    offer: "Anfängernähkurs mit vorhandenen Maschinen",
  },
  {
    id: "r3a-n-plant",
    title: "Pflanzenpflege",
    detail: "Ich gieße Zimmerpflanzen während Ihrer Reise, Innenstadt und Nordviertel.",
    offer: "Pflanzenpflege während einer Reise",
  },
  {
    id: "r3a-n-laptop",
    title: "Notebook günstig",
    detail: "Gebrauchtes Gerät, Akku schwach, Verkauf ohne Garantie.",
    offer: "gebrauchtes Notebook mit schwachem Akku",
  },
  {
    id: "r3a-n-walk",
    title: "Stadtspaziergang",
    detail: "Kostenlose Führung sonntags auf Deutsch, Treffpunkt Rathaus.",
    offer: "deutschsprachige Stadtführung am Sonntag",
  },
];

const citySituations: readonly SituationSpec[] = [
  {
    id: "r3a-s-bike",
    itemKey: "item-bike",
    text: "Nora arbeitet unter der Woche und möchte ihr kaputtes Fahrrad am Samstag reparieren lassen, ohne es zu transportieren.",
    requirement: "Fahrradreparatur am Samstag am eigenen Wohnort.",
    noticeId: "r3a-n-bike",
  },
  {
    id: "r3a-s-dog",
    itemKey: "item-dog",
    text: "Tarek sucht für seinen jungen Hund einen Kurs, den er nach der Arbeit besuchen kann.",
    requirement: "Hundetraining für einen jungen Hund am Abend.",
    noticeId: "r3a-n-dog",
  },
  {
    id: "r3a-s-room",
    itemKey: "item-room",
    text: "Eine Studentin beginnt im November ein Semester und braucht in Hochschulnähe ein möbliertes Zimmer für sechs Monate.",
    requirement: "Möbliertes Zimmer ab November nahe der Hochschule für sechs Monate.",
    noticeId: "r3a-n-room",
  },
  {
    id: "r3a-s-guitar",
    itemKey: "item-guitar",
    text: "Paul möchte als Erwachsener Gitarre lernen, besitzt aber noch kein Instrument und kann mittwochs abends.",
    requirement: "Gitarrenunterricht für Erwachsene am Mittwochabend mit Leihinstrument.",
    noticeId: "r3a-n-guitar",
  },
  {
    id: "r3a-s-table",
    itemKey: "item-table",
    text: "Für eine neue Wohnung wird kurzfristig ein Tisch gesucht, an dem sechs Menschen sitzen können.",
    requirement: "Kurzfristig abholbarer Tisch für sechs Personen.",
    noticeId: "r3a-n-table",
  },
  {
    id: "r3a-s-child",
    itemKey: "item-child",
    text: "Ein Paar braucht diesen Freitagabend eine Betreuung für sein Kind in der eigenen Wohnung.",
    requirement: "Kinderbetreuung am Freitagabend in der Wohnung der Familie.",
    noticeId: "r3a-n-childcare",
  },
  {
    id: "r3a-s-course",
    itemKey: "item-course",
    text: "Mei arbeitet bis 19 Uhr und sucht einen mehrwöchigen Onlinekurs für Deutsch im Beruf auf B1-Niveau.",
    requirement: "Mehrwöchiger Onlinekurs Berufsdeutsch B1 nach 19 Uhr.",
    noticeId: "r3a-n-course",
  },
  {
    id: "r3a-s-van",
    itemKey: "item-van",
    text: "Für einen kleinen Umzug braucht Jonas nur drei Stunden lang ein Fahrzeug, das er mit seinem normalen Führerschein fahren darf.",
    requirement: "Stundenweise mietbares Fahrzeug mit Führerschein Klasse B.",
    noticeId: "r3a-n-van",
  },
  {
    id: "r3a-s-plant",
    itemKey: "item-plant",
    text: "Während einer zehntägigen Reise soll jemand die Zimmerpflanzen einer Wohnung im Nordviertel versorgen.",
    requirement: "Pflanzenpflege während einer Reise im Nordviertel.",
    noticeId: "r3a-n-plant",
  },
  {
    id: "r3a-s-piano",
    itemKey: "item-piano",
    text: "Lea sucht sonntags Klavierunterricht für ihre achtjährige Tochter und hat zu Hause kein Klavier.",
    requirement: "Klavierunterricht für ein Kind am Sonntag mit Instrument.",
    noticeId: "no_match",
  },
];

const ruralNotices: readonly NoticeSpec[] = [
  {
    id: "r3b-n-apples",
    title: "Äpfel selbst pflücken",
    detail: "Samstag und Sonntag von 10 bis 16 Uhr. Körbe können ausgeliehen werden.",
    offer: "Apfelernte am Wochenende mit Leihkörben",
  },
  {
    id: "r3b-n-carpool",
    title: "Mitfahrt zum Gewerbepark",
    detail: "Montag bis Freitag, Abfahrt 6.40 Uhr, Rückfahrt 16.30 Uhr.",
    offer: "werktägliche frühe Fahrgemeinschaft zum Gewerbepark",
  },
  {
    id: "r3b-n-roof",
    title: "Dachdecker-Notdienst",
    detail: "Hilfe nach Sturm und bei akutem Wassereintritt, rund um die Uhr erreichbar.",
    offer: "sofortige Dachhilfe bei Sturmschaden",
  },
  {
    id: "r3b-n-eggs",
    title: "Eier vom Hof",
    detail: "Abholung täglich bis 18 Uhr, Bezahlung bar in die Vertrauenskasse.",
    offer: "täglicher Hofverkauf von Eiern",
  },
  {
    id: "r3b-n-hall",
    title: "Gemeindesaal",
    detail: "Platz für 80 Personen, Küche vorhanden, freie Termine im Januar.",
    offer: "Veranstaltungssaal mit Küche im Januar",
  },
  {
    id: "r3b-n-computer",
    title: "Computerhilfe zu Hause",
    detail: "Einrichtung von Drucker und WLAN, Termine werktags am Vormittag.",
    offer: "Computerhilfe zu Hause am Werktagvormittag",
  },
  {
    id: "r3b-n-wood",
    title: "Trockenes Brennholz",
    detail: "Lieferung ab zwei Raummetern im Umkreis von 20 Kilometern.",
    offer: "Brennholzlieferung ab zwei Raummetern",
  },
  {
    id: "r3b-n-yoga",
    title: "Sanftes Yoga",
    detail: "Kurs für Einsteiger donnerstags um 17 Uhr im Bürgerhaus.",
    offer: "Einsteiger-Yoga am Donnerstagnachmittag",
  },
  {
    id: "r3b-n-goat",
    title: "Tierbetreuung",
    detail: "Versorgung von Ziegen, Hühnern und Katzen während Ihres Urlaubs.",
    offer: "Urlaubsbetreuung für Hof- und Haustiere",
  },
  {
    id: "r3b-n-market",
    title: "Wochenmarkt",
    detail: "Regionale Lebensmittel jeden Mittwoch von 8 bis 13 Uhr am Dorfplatz.",
    offer: "regionaler Wochenmarkt am Mittwochvormittag",
  },
  {
    id: "r3b-n-bike",
    title: "E-Bike-Verleih",
    detail: "Tagesmiete inklusive Helm, Rückgabe bis 19 Uhr.",
    offer: "E-Bike-Tagesmiete mit Helm",
  },
  {
    id: "r3b-n-language",
    title: "Englisch-Stammtisch",
    detail: "Offenes Treffen jeden zweiten Freitag, keine Anmeldung nötig.",
    offer: "offener Englisch-Stammtisch am Freitag",
  },
];

const ruralSituations: readonly SituationSpec[] = [
  {
    id: "r3b-s-apples",
    itemKey: "item-apples",
    text: "Eine Familie möchte am Sonntag Obst selbst ernten und hat keine eigenen Behälter.",
    requirement: "Obst selbst pflücken am Sonntag mit ausleihbaren Behältern.",
    noticeId: "r3b-n-apples",
  },
  {
    id: "r3b-s-carpool",
    itemKey: "item-carpool",
    text: "Ein neuer Mitarbeiter muss an jedem Werktag vor sieben Uhr zum Gewerbepark fahren.",
    requirement: "Werktägliche Fahrt vor sieben Uhr zum Gewerbepark.",
    noticeId: "r3b-n-carpool",
  },
  {
    id: "r3b-s-roof",
    itemKey: "item-roof",
    text: "Nach einem nächtlichen Sturm tropft Wasser durch das Dach. Die Reparatur kann nicht bis morgen warten.",
    requirement: "Soforthilfe nachts bei einem sturmbedingten undichten Dach.",
    noticeId: "r3b-n-roof",
  },
  {
    id: "r3b-s-hall",
    itemKey: "item-hall",
    text: "Ein Verein plant im Januar ein Essen für sechzig Gäste und benötigt auch eine Küche.",
    requirement: "Saal im Januar für sechzig Gäste mit Küche.",
    noticeId: "r3b-n-hall",
  },
  {
    id: "r3b-s-computer",
    itemKey: "item-computer",
    text: "Herr Behr braucht zu Hause Hilfe mit seinem neuen Drucker und hat vormittags Zeit.",
    requirement: "Druckereinrichtung zu Hause an einem Vormittag.",
    noticeId: "r3b-n-computer",
  },
  {
    id: "r3b-s-wood",
    itemKey: "item-wood",
    text: "Eine Familie benötigt drei Raummeter trockenes Holz und kann es nicht selbst abholen.",
    requirement: "Lieferung von mindestens drei Raummetern trockenem Brennholz.",
    noticeId: "r3b-n-wood",
  },
  {
    id: "r3b-s-yoga",
    itemKey: "item-yoga",
    text: "Marta hat noch nie Yoga gemacht und sucht donnerstags vor dem Abendessen einen ruhigen Kurs.",
    requirement: "Einsteiger-Yoga am Donnerstagnachmittag.",
    noticeId: "r3b-n-yoga",
  },
  {
    id: "r3b-s-goat",
    itemKey: "item-goat",
    text: "Während einer Reise müssen zwei Ziegen und mehrere Hühner zuverlässig versorgt werden.",
    requirement: "Urlaubsbetreuung für Ziegen und Hühner.",
    noticeId: "r3b-n-goat",
  },
  {
    id: "r3b-s-bike",
    itemKey: "item-bike",
    text: "Ein Besucher möchte für einen ganzen Tag ein E-Bike fahren und braucht auch einen Helm.",
    requirement: "E-Bike für einen Tag inklusive Helm.",
    noticeId: "r3b-n-bike",
  },
  {
    id: "r3b-s-french",
    itemKey: "item-french",
    text: "Sofia sucht ohne Anmeldung einen französischen Gesprächskreis am Mittwochabend.",
    requirement: "Französischer Gesprächskreis am Mittwochabend ohne Anmeldung.",
    noticeId: "no_match",
  },
];

export const r3FamilyA = buildR3({
  seedKey: "r3-stadtleben",
  familySlug: "r3-family-city-services",
  scenario: "scenario.notice_matching.city_services",
  notices: cityNotices,
  situations: citySituations,
});
export const r3FamilyB = buildR3({
  seedKey: "r3-landkreis",
  familySlug: "r3-family-rural-services",
  scenario: "scenario.notice_matching.rural_services",
  notices: ruralNotices,
  situations: ruralSituations,
});

export const r3SeedArtifacts: readonly SeedArtifact[] = [r3FamilyA, r3FamilyB];
