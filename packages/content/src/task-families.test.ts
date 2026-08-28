import { appId } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import { parseSafeContentTree, type Option, type SafeContentNode } from "./model.js";
import {
  collectItemRefs,
  collectOptions,
  collectSafeContentNodes,
  isListeningTaskFamily,
  listeningTaskFamilyKinds,
  p4AllowedPlayCounts,
  taskFamilyKinds,
  writtenTaskFamilyKinds,
  type R1HeadingMatching,
  type R2DetailedSelect,
  type R3SituationNoticeMatching,
  type SB1ContextualGrammarCloze,
  type SB2SharedBankLexicalCloze,
  type H1ShortAnnouncements,
  type H2ConversationInterview,
  type H3ShortFunctionalTexts,
  type TaskFamily,
} from "./task-families.js";

const text = (value: string): SafeContentNode => ({ kind: "inline_text", text: value });

function option(optionId: string, label: string): Option {
  return {
    optionId,
    learnerSafeLabel: [text(label)],
    positionIsPresentationOnly: true,
  };
}

const mediaRevisionId = appId<"media_revision">("media-revision-0001");

const r1: R1HeadingMatching = {
  kind: "R1HeadingMatching",
  texts: [
    {
      stimulusId: "notice-1",
      safeContentNodes: [{ kind: "paragraph", children: [text("Die Bibliothek schließt.")] }],
      language: "de",
      genreDomainRegister: "public_notice",
      evidenceAnchorIds: ["anchor-1"],
    },
  ],
  headings: [option("heading-a", "Öffnungszeiten"), option("heading-b", "Anmeldung")],
  matchConstraints: {
    leftCardinality: { min: 1, max: 1 },
    rightReusePolicy: "at_most_once",
    unmatchedPolicy: "forbidden",
    completionRule: "all_left_bound",
  },
  itemBindings: [{ itemRef: "item-1", leftId: "notice-1" }],
};

const r2: R2DetailedSelect = {
  kind: "R2DetailedSelect",
  stimulus: {
    stimulusId: "article-1",
    safeContentNodes: [{ kind: "paragraph", children: [text("Ein längerer Text.")] }],
    language: "de",
    genreDomainRegister: "magazine",
    evidenceAnchorIds: ["anchor-2"],
  },
  questions: [
    {
      itemRef: "item-2",
      questionId: "question-1",
      questionNodes: [text("Was steht im Text?")],
      options: [option("option-a", "Erste"), option("option-b", "Zweite")],
    },
  ],
};

const r3: R3SituationNoticeMatching = {
  kind: "R3SituationNoticeMatching",
  situations: [{ promptId: "situation-1", safeContentNodes: [text("Sie suchen einen Kurs.")] }],
  notices: [
    {
      stimulusId: "notice-2",
      safeContentNodes: [text("Kursanmeldung im Sekretariat.")],
      language: "de",
      genreDomainRegister: "public_notice",
      evidenceAnchorIds: [],
    },
  ],
  matchConstraints: {
    leftCardinality: { min: 1, max: 1 },
    rightReusePolicy: "at_most_once",
    unmatchedPolicy: "explicit_no_match",
    completionRule: "all_left_bound",
  },
  noMatchOption: option("no-match", "Kein passender Aushang"),
  itemBindings: [{ itemRef: "item-3", leftId: "situation-1" }],
};

const sb1: SB1ContextualGrammarCloze = {
  kind: "SB1ContextualGrammarCloze",
  connectedText: {
    stimulusId: "letter-1",
    safeContentNodes: [
      {
        kind: "paragraph",
        children: [text("Sehr geehrte Damen"), { kind: "cloze_anchor", gapId: "gap-1" }],
      },
    ],
    language: "de",
    genreDomainRegister: "letter",
    evidenceAnchorIds: [],
    connected: true,
  },
  gaps: [
    {
      itemRef: "item-4",
      gapId: "gap-1",
      options: [option("gap1-a", "und"), option("gap1-b", "oder"), option("gap1-c", "aber")],
    },
  ],
};

const sb2: SB2SharedBankLexicalCloze = {
  kind: "SB2SharedBankLexicalCloze",
  connectedText: {
    stimulusId: "letter-2",
    safeContentNodes: [
      {
        kind: "paragraph",
        children: [text("Guten Tag"), { kind: "cloze_anchor", gapId: "gap-2" }],
      },
    ],
    language: "de",
    genreDomainRegister: "letter",
    evidenceAnchorIds: [],
    connected: true,
  },
  gaps: [{ itemRef: "item-5", gapId: "gap-2" }],
  candidateBank: [option("bank-a", "Termin"), option("bank-b", "Antwort")],
  candidateReusePolicy: "at_most_once",
};

const h1: H1ShortAnnouncements = {
  kind: "H1ShortAnnouncements",
  announcements: [
    {
      stimulusId: "announcement-1",
      mediaRevisionId,
      language: "de",
      genreDomainRegister: "station_announcement",
      writtenInstructionNodes: [text("Sie hören fünf kurze Ansagen.")],
      evidenceAnchorIds: [],
    },
  ],
  questions: [
    {
      itemRef: "item-6",
      questionId: "question-2",
      questionNodes: [text("Wohin fährt der Zug?")],
      options: [option("h1-a", "Nach Köln"), option("h1-b", "Nach Bonn")],
    },
  ],
  allowedPlayCountPerText: p4AllowedPlayCounts.H1ShortAnnouncements,
};

const h2: H2ConversationInterview = {
  kind: "H2ConversationInterview",
  conversation: {
    stimulusId: "interview-1",
    mediaRevisionId,
    language: "de",
    genreDomainRegister: "radio_interview",
    writtenInstructionNodes: [text("Sie hören ein Interview.")],
    evidenceAnchorIds: [],
  },
  questions: [
    {
      itemRef: "item-7",
      questionId: "question-3",
      questionNodes: [text("Was sagt die Gästin?")],
      options: [option("h2-a", "Ja"), option("h2-b", "Nein")],
    },
  ],
  allowedPlayCount: p4AllowedPlayCounts.H2ConversationInterview,
};

const h3: H3ShortFunctionalTexts = {
  kind: "H3ShortFunctionalTexts",
  texts: [
    {
      stimulusId: "functional-1",
      mediaRevisionId,
      language: "de",
      genreDomainRegister: "voicemail",
      writtenInstructionNodes: [text("Sie hören fünf kurze Texte.")],
      evidenceAnchorIds: [],
    },
  ],
  questions: [
    {
      itemRef: "item-8",
      questionId: "question-4",
      questionNodes: [text("Was soll man tun?")],
      options: [option("h3-a", "Zurückrufen"), option("h3-b", "Warten")],
    },
  ],
  allowedPlayCountPerText: p4AllowedPlayCounts.H3ShortFunctionalTexts,
};

const everyFamily: readonly TaskFamily[] = [r1, r2, r3, sb1, sb2, h1, h2, h3];

describe("the task-family union is closed (P05-CONTENT-001)", () => {
  it("declares exactly the eight architecture families", () => {
    expect([...taskFamilyKinds]).toEqual([
      "R1HeadingMatching",
      "R2DetailedSelect",
      "R3SituationNoticeMatching",
      "SB1ContextualGrammarCloze",
      "SB2SharedBankLexicalCloze",
      "H1ShortAnnouncements",
      "H2ConversationInterview",
      "H3ShortFunctionalTexts",
    ]);
  });

  it("partitions the union into the written target block and the listening families", () => {
    expect([...writtenTaskFamilyKinds, ...listeningTaskFamilyKinds].sort()).toEqual(
      [...taskFamilyKinds].sort(),
    );
    expect(writtenTaskFamilyKinds).toHaveLength(5);
    expect(listeningTaskFamilyKinds).toHaveLength(3);
  });

  it("covers every kind with a fixture and classifies listening correctly", () => {
    expect(everyFamily.map((family) => family.kind).sort()).toEqual([...taskFamilyKinds].sort());
    for (const family of everyFamily) {
      const listening = listeningTaskFamilyKinds.some((kind) => kind === family.kind);
      expect(isListeningTaskFamily(family)).toBe(listening);
    }
  });

  it("pins the P4 playback opportunities as H1 once, H2 twice, H3 twice", () => {
    expect(p4AllowedPlayCounts).toEqual({
      H1ShortAnnouncements: 1,
      H2ConversationInterview: 2,
      H3ShortFunctionalTexts: 2,
    });
  });
});

describe("learner payload traversal", () => {
  it("yields only safe content nodes for every family", () => {
    for (const family of everyFamily) {
      const nodes = collectSafeContentNodes(family);
      expect(nodes.length).toBeGreaterThan(0);
      expect(parseSafeContentTree(nodes)).toEqual({ ok: true });
    }
  });

  it("declares an item reference for every family", () => {
    for (const family of everyFamily) {
      expect(collectItemRefs(family).length).toBeGreaterThan(0);
    }
  });

  it("treats option position as presentation only", () => {
    const forward = collectOptions(r2);
    const reversed = collectOptions({
      ...r2,
      questions: r2.questions.map((question) => ({
        ...question,
        options: [...question.options].reverse(),
      })),
    });
    expect(forward.map((entry) => entry.optionId).sort()).toEqual(
      reversed.map((entry) => entry.optionId).sort(),
    );
    for (const entry of [...forward, ...reversed]) {
      expect(entry.positionIsPresentationOnly).toBe(true);
    }
  });

  it("never exposes a media object key or digest through the learner payload", () => {
    const serialized = JSON.stringify(everyFamily);
    for (const forbidden of ["objectKey", "digest", "signedUrl", "https://"]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});
