export const p04CheckIds = [
  "P04-SCOPE-001",
  "P04-COVERAGE-001",
  "P04-TOKEN-001",
  "P04-ASSET-001",
  "P04-COMPONENT-001",
  "P04-SEMANTIC-001",
  "P04-ROUTE-001",
  "P04-RSP-001",
  "P04-A11Y-001",
  "P04-VISUAL-001",
  "P04-PERF-001",
  "P04-SECURITY-001",
  "P04-COMPAT-001",
] as const;

export const componentFamilies = [
  ["C01", "AppShell"],
  ["C02", "AttemptShell"],
  ["C03", "MockShell"],
  ["C04", "Overlay"],
  ["C05", "Sequence"],
  ["C06", "Button"],
  ["C07", "InlineAction"],
  ["C08", "ChoiceNav"],
  ["C09", "BinaryChoice"],
  ["C10", "Field"],
  ["C11", "AnswerChoice"],
  ["C12", "MatchingPair"],
  ["C13", "ClozeGap"],
  ["C14", "ReorderList"],
  ["C15", "FormFeedback"],
  ["C16", "Recommendation"],
  ["C17", "SessionDurationPicker"],
  ["C18", "CoachMessage"],
  ["C19", "ResultCard"],
  ["C20", "DecisiveEvidence"],
  ["C21", "RepairCard"],
  ["C22", "HintDisclosure"],
  ["C23", "FreshCheckBanner"],
  ["C24", "WhatChangedSummary"],
  ["C25", "EvidenceLabel"],
  ["C26", "WeaknessCard"],
  ["C27", "DueReviewGroup"],
  ["C28", "PendingBanner"],
  ["C29", "SystemFailureBanner"],
  ["C30", "ContradictionNotice"],
  ["C31", "StaleEvidenceNotice"],
  ["C32", "ReadinessEvidence"],
  ["C33", "ChangeTimeline"],
  ["C34", "MilestoneRow"],
  ["C35", "MockOutcome"],
  ["C36", "TextAlternativeTable"],
  ["C37", "ReadingRegion"],
  ["C38", "LanguageElementsRegion"],
  ["C39", "ListeningRegion"],
  ["C40", "WritingRegion"],
  ["C41", "SpeakingRegion"],
  ["C42", "SessionNotice"],
  ["C43", "UploadStatus"],
] as const;

export const iconRegistry = [
  ["I01", "coach", "MessageSquareText"],
  ["I02", "readiness", "Gauge"],
  ["I03", "train", "Dumbbell"],
  ["I04", "progress", "TrendingUp"],
  ["I05", "reading", "BookOpen"],
  ["I06", "listening", "Headphones"],
  ["I07", "writing", "PenLine"],
  ["I08", "speaking", "Mic"],
  ["I09", "measured-time", "Timer"],
  ["I10", "evidence", "ClipboardCheck"],
  ["I11", "exam-date", "CalendarCheck"],
  ["I12", "safe-correct", "CircleCheck"],
  ["I13", "borderline", "TriangleAlert"],
  ["I14", "not-ready", "OctagonAlert"],
  ["I15", "evidence-building", "CircleDashed"],
  ["I16", "stale-recheck", "RefreshCw"],
  ["I17", "our-fault", "WifiOff"],
  ["I18", "transcript", "BookOpen"],
  ["I19", "lock", "Lock"],
  ["I20", "upload", "ArrowUp"],
] as const;

export type CoverageStatus = "accepted" | "corrected" | "derived" | "obsolete";
export interface CoverageRow {
  readonly id: string;
  readonly source: string;
  readonly anchor: string;
  readonly target: string;
  /** A concrete symbol, selector, or test declaration in the implementation target. */
  readonly targetAnchor: string;
  readonly tests: readonly (typeof p04CheckIds)[number][];
  readonly status: CoverageStatus;
  readonly resolution: string;
}

const originalGroups = [
  [1, 4, "bare entry, goal, foundation route, and result", "corrected"],
  [2, 6, "App shell and shared attempt, result, and repair flow", "accepted"],
  [3, 4, "five typed skill regions in the shared shell", "accepted"],
  [4, 6, "protected destinations, mock shells, and Gates A through F", "corrected"],
  [5, 6, "architecture-owned recovery, interruption, and data-rights states", "corrected"],
] as const;
const originalCompactFrames: CoverageRow[] = originalGroups.flatMap(
  ([group, count, resolution, status]) =>
    Array.from({ length: count }, (_, index) => ({
      id: `CF-${String(group).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
      source: "Design/Bestehen-02-Mobile-Screens.dc.html",
      anchor: `${group}.${index + 1}`,
      target: "apps/web/src/ui/archetypes.tsx",
      targetAnchor: "StateView",
      tests: ["P04-ROUTE-001", "P04-RSP-001", "P04-SEMANTIC-001"],
      status,
      resolution,
    })),
);

const deltaCompactFrames: CoverageRow[] = Array.from({ length: 15 }, (_, index) => ({
  id: `CF-06-${String(index + 1).padStart(2, "0")}`,
  source: "Design/Bestehen-06-Critical-View-Deltas.dc.html",
  anchor: `6.${index + 1}`,
  target: "apps/web/src/ui/archetypes.tsx",
  targetAnchor: "StateView",
  tests: ["P04-COMPONENT-001", "P04-RSP-001", "P04-SEMANTIC-001"],
  status: index < 2 || index === 3 || index > 9 ? "corrected" : "accepted",
  resolution: "Architecture-owned critical state rendered through the shared shell and components",
}));

export const compactFrames = [...originalCompactFrames, ...deltaCompactFrames] as const;

export const largeExemplars: readonly CoverageRow[] = [
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "V3",
  "V4",
  "V7",
].map((anchor) => ({
  id: `LG-${anchor}`,
  source: anchor.startsWith("D")
    ? "Design/Bestehen-03-Desktop-Responsive.dc.html"
    : "Design/Bestehen-06-Critical-View-Deltas.dc.html",
  anchor,
  target: "apps/web/src/ui/archetypes.tsx",
  targetAnchor: "StateView",
  tests: ["P04-RSP-001", "P04-VISUAL-001", "P04-A11Y-001"],
  status: anchor === "V7" ? "corrected" : "accepted",
  resolution:
    anchor === "V7"
      ? "Gates A through F replace the obsolete four-row gate list"
      : "Shared responsive archetype",
}));

const boardAnchorIds = [
  "01-s00",
  "01-s01",
  "01-s02",
  "01-s03",
  "02-a1",
  "02-a2",
  "02-a3",
  "02-a4",
  "02-a5",
  "03-d1",
  "03-d2",
  "03-d3",
  "03-d4",
  "03-d5",
  "03-d6",
  "04-f",
  "04-a",
  "04-c",
  "04-h",
  "05-u0",
  "05-u1",
  "05-u2",
  "05-u3",
  "05-u4",
  "05-u5",
  "05-u6",
  "05-u7",
  "06-v0",
  "06-v1",
  "06-v2",
  "06-v3",
  "06-v4",
  "06-v5",
  "06-v6",
  "06-v7",
  "06-v8",
  "06-v9",
] as const;

const correctedBoards = new Set([
  "01-s02",
  "01-s03",
  "02-a1",
  "02-a4",
  "02-a5",
  "04-c",
  "06-v1",
  "06-v2",
  "06-v6",
  "06-v7",
  "06-v8",
]);
const derivedBoards = new Set(["03-d6", "04-f", "04-h", "05-u0", "06-v0", "06-v9"]);
const boardChecks: Record<
  (typeof boardAnchorIds)[number],
  readonly (typeof p04CheckIds)[number][]
> = {
  "01-s00": ["P04-COVERAGE-001", "P04-SEMANTIC-001"],
  "01-s01": ["P04-TOKEN-001", "P04-ASSET-001", "P04-RSP-001"],
  "01-s02": ["P04-COVERAGE-001", "P04-COMPONENT-001", "P04-A11Y-001"],
  "01-s03": ["P04-SEMANTIC-001", "P04-A11Y-001"],
  "02-a1": ["P04-ROUTE-001", "P04-SEMANTIC-001", "P04-VISUAL-001"],
  "02-a2": ["P04-COMPONENT-001", "P04-ROUTE-001", "P04-VISUAL-001"],
  "02-a3": ["P04-COMPONENT-001", "P04-A11Y-001", "P04-RSP-001"],
  "02-a4": ["P04-SEMANTIC-001", "P04-COMPONENT-001", "P04-VISUAL-001"],
  "02-a5": ["P04-SEMANTIC-001", "P04-A11Y-001", "P04-SECURITY-001"],
  "03-d1": ["P04-RSP-001", "P04-VISUAL-001"],
  "03-d2": ["P04-RSP-001", "P04-A11Y-001", "P04-VISUAL-001"],
  "03-d3": ["P04-RSP-001", "P04-COMPONENT-001", "P04-VISUAL-001"],
  "03-d4": ["P04-RSP-001", "P04-PERF-001", "P04-VISUAL-001"],
  "03-d5": ["P04-RSP-001", "P04-A11Y-001", "P04-VISUAL-001"],
  "03-d6": ["P04-RSP-001", "P04-A11Y-001"],
  "04-f": ["P04-ROUTE-001", "P04-SEMANTIC-001"],
  "04-a": ["P04-A11Y-001", "P04-RSP-001"],
  "04-c": ["P04-COVERAGE-001", "P04-VISUAL-001"],
  "04-h": ["P04-SCOPE-001", "P04-COMPAT-001"],
  "05-u0": ["P04-SCOPE-001", "P04-COVERAGE-001"],
  "05-u1": ["P04-COMPONENT-001", "P04-ROUTE-001", "P04-RSP-001"],
  "05-u2": ["P04-COMPONENT-001", "P04-A11Y-001", "P04-SEMANTIC-001"],
  "05-u3": ["P04-COMPONENT-001", "P04-SEMANTIC-001", "P04-A11Y-001"],
  "05-u4": ["P04-COMPONENT-001", "P04-A11Y-001", "P04-SECURITY-001"],
  "05-u5": ["P04-SEMANTIC-001", "P04-A11Y-001"],
  "05-u6": ["P04-RSP-001", "P04-VISUAL-001"],
  "05-u7": ["P04-A11Y-001", "P04-RSP-001"],
  "06-v0": ["P04-SCOPE-001", "P04-COVERAGE-001"],
  "06-v1": ["P04-ROUTE-001", "P04-A11Y-001", "P04-SECURITY-001"],
  "06-v2": ["P04-SEMANTIC-001", "P04-SECURITY-001", "P04-COMPAT-001"],
  "06-v3": ["P04-COMPONENT-001", "P04-RSP-001", "P04-VISUAL-001"],
  "06-v4": ["P04-COMPONENT-001", "P04-A11Y-001", "P04-VISUAL-001"],
  "06-v5": ["P04-COMPONENT-001", "P04-A11Y-001", "P04-SECURITY-001"],
  "06-v6": ["P04-SEMANTIC-001", "P04-COMPONENT-001"],
  "06-v7": ["P04-SEMANTIC-001", "P04-A11Y-001", "P04-VISUAL-001"],
  "06-v8": ["P04-ROUTE-001", "P04-SEMANTIC-001", "P04-RSP-001"],
  "06-v9": ["P04-COVERAGE-001", "P04-SEMANTIC-001", "P04-COMPAT-001"],
};
export const boardAnchors: readonly CoverageRow[] = boardAnchorIds.map((id) => ({
  id,
  source: `Design/Bestehen-${id.slice(0, 2)}-${id.startsWith("01") ? "Design-System" : id.startsWith("02") ? "Mobile-Screens" : id.startsWith("03") ? "Desktop-Responsive" : id.startsWith("04") ? "Flows-Handoff" : id.startsWith("05") ? "UI-Foundation-Delta" : "Critical-View-Deltas"}.dc.html`,
  anchor: id.slice(3),
  target:
    id === "01-s01"
      ? "packages/design-system/src/tokens.css"
      : id === "04-c" || id === "05-u0"
        ? "packages/design-system/src/coverage/source-anchors.ts"
        : id.startsWith("04")
          ? "apps/web/tests/p04-responsive.spec.ts"
          : "apps/web/src/ui/archetypes.tsx",
  targetAnchor:
    id === "01-s01"
      ? ":root"
      : id === "04-c" || id === "05-u0"
        ? "sourceAnchorManifest"
        : id.startsWith("04")
          ? "test("
          : "StateView",
  tests: boardChecks[id],
  status: correctedBoards.has(id) ? "corrected" : derivedBoards.has(id) ? "derived" : "accepted",
  resolution: correctedBoards.has(id)
    ? "Architecture-owned state and copy replace the named stale Design contract"
    : derivedBoards.has(id)
      ? "Rule or composition maps to shared implementation rather than a separate route"
      : "Accepted presentation contract",
}));

export const componentRows: readonly CoverageRow[] = componentFamilies.map(([id, name]) => ({
  id,
  source: "Implementation/Personal/04-responsive-web-design-system/plan.md",
  anchor: id,
  target:
    id <= "C03"
      ? "packages/design-system/src/shells.tsx"
      : id === "C04"
        ? "packages/design-system/src/overlay.tsx"
        : "packages/design-system/src/components.tsx",
  targetAnchor: name,
  tests: ["P04-COMPONENT-001", "P04-A11Y-001"],
  status: "accepted",
  resolution: `${name} closed fixture registry entry`,
}));

export const iconRows: readonly CoverageRow[] = iconRegistry.map(([id, name]) => ({
  id,
  source: "Implementation/Personal/04-responsive-web-design-system/plan.md",
  anchor: id,
  target: "packages/design-system/src/icons.tsx",
  targetAnchor: name,
  tests: ["P04-ASSET-001", "P04-COMPONENT-001"],
  status: "accepted",
  resolution: "Closed local Lucide geometry registry",
}));

export const representativeRoutes = [
  "/",
  "/coach",
  "/readiness",
  "/train",
  "/progress",
  "/settings",
  "/settings/data",
  "/session/synthetic",
  "/attempt/synthetic-reading",
  "/attempt/synthetic-reading/result",
  "/mock/synthetic",
  "/mock/synthetic/result",
] as const;

export const sourceAnchorManifest = {
  version: "p04-source-anchors/v1",
  inventory: { compactFrames: 41, largeExemplars: 8, componentFamilies: 43, icons: 20 },
  boardAnchors,
  compactFrames,
  largeExemplars,
  componentFamilies: componentRows,
  icons: iconRows,
  routes: representativeRoutes,
  tests: p04CheckIds,
} as const;
