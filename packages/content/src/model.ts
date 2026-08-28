/**
 * Stage 05 content graph — the pseudotypes of `Architecture/09-…` §4.3 and `Architecture/15-…` §5.1
 * made real.
 *
 * Module layering inside `packages/content`: this module is the leaf. It may import **types only**
 * from `./task-families.js` (erased at compile time, so no runtime edge and no module cycle), while
 * `./task-families.js` may import both types and values from here. Never add a value import from
 * this module to `./task-families.js`.
 *
 * Nothing here is a gate. Class is provenance, approval is a gate, rights answer a rights question,
 * and a digest is an integrity fact — none of them implies another.
 */

import {
  type ContentApprovalLevel,
  type ContentClass,
  type ContentFamilyId,
  type ContentFormId,
  type ContentItemId,
  type ContentRevisionId,
  type FreshnessDecision,
  type KeyRevisionId,
  type MediaRevisionId,
  type ServingManifestId,
  type AppId,
  type AssistanceKind,
  canHoldApprovalLevel,
  contentApprovalLevels,
  contentClasses,
} from "@bestehen/domain";
import type { TaskFamily, TaskFamilyKind } from "./task-families.js";

/* ------------------------------------------------------------------------------------------------
 * Release identity
 * ---------------------------------------------------------------------------------------------- */

/**
 * The content release identity of decision D17. It is the same fact as `releaseAxes.content` in the
 * release manifest and as the `app.content_releases` row the seed CLI promotes — not a parallel
 * version concept. The seed corpus must derive `contentReleaseV1.identity` from this constant rather
 * than repeat the literal, so the two cannot drift.
 */
export const contentReleaseIdentity = "stage-05-content-v1";
export type ContentReleaseIdentity = typeof contentReleaseIdentity;

/* ------------------------------------------------------------------------------------------------
 * Content class policy (`Architecture/09-…` §4.2)
 * ---------------------------------------------------------------------------------------------- */

/**
 * Resolution of a class value that arrived from outside the type system — a database column, an
 * imported bundle, an authoring payload. The parameter is deliberately `unknown`: typing it as the
 * narrow union would make the fail-closed branch unreachable and therefore untestable.
 */
export type ContentClassResolution =
  | { readonly kind: "known"; readonly contentClass: ContentClass }
  | { readonly kind: "malformed"; readonly rawClass: string; readonly failsClosedTo: "draft" };

const knownContentClasses: ReadonlySet<string> = new Set<string>(contentClasses);

/** Unknown or malformed class fails closed to Draft (`Architecture/09-…` §4.2). */
export function resolveContentClass(raw: unknown): ContentClassResolution {
  if (typeof raw === "string" && knownContentClasses.has(raw)) {
    return { kind: "known", contentClass: raw as ContentClass };
  }
  return {
    kind: "malformed",
    rawClass: typeof raw === "string" ? raw : String(raw),
    failsClosedTo: "draft",
  };
}

/**
 * Every approval level the class may legally hold, computed from the domain matrix rather than a
 * second copy of it. A malformed class yields exactly `["draft"]`.
 */
export function holdableApprovalLevels(raw: unknown): readonly ContentApprovalLevel[] {
  const resolution = resolveContentClass(raw);
  if (resolution.kind !== "known") return [resolution.failsClosedTo];
  return contentApprovalLevels.filter((level) =>
    canHoldApprovalLevel(resolution.contentClass, level),
  );
}

/**
 * C0 is reference-only: no text, audio, image, option or transcript from it may ever be rendered to
 * a learner. A malformed class is treated as C0 would be.
 */
export function mayReachLearnerDisplay(raw: unknown): boolean {
  const resolution = resolveContentClass(raw);
  return resolution.kind === "known" && resolution.contentClass !== "C0";
}

/**
 * C0 source expression never enters generation — only non-reconstructive blueprint intelligence
 * crosses. C4 is learner-response-dependent and is never reused as training input.
 */
export function mayEnterGenerationInput(raw: unknown): boolean {
  const resolution = resolveContentClass(raw);
  if (resolution.kind !== "known") return false;
  return resolution.contentClass !== "C0" && resolution.contentClass !== "C4";
}

/**
 * C4 is adaptive/ephemeral and can never silently enter a reusable bank; only a separately reviewed
 * C2/C3 successor artifact may. C0 is reference-only and likewise never enters the bank.
 */
export function mayEnterReusableBank(raw: unknown): boolean {
  return mayEnterGenerationInput(raw);
}

/* ------------------------------------------------------------------------------------------------
 * SafeContentNode — the closed learner-content union (`Architecture/15-…` §5.1)
 * ---------------------------------------------------------------------------------------------- */

export const safeContentNodeKinds = [
  "paragraph",
  "heading",
  "inline_text",
  "emphasis",
  "quote",
  "list",
  "evidence_anchor_placeholder",
  "cloze_anchor",
  "semantic_group",
] as const;
export type SafeContentNodeKind = (typeof safeContentNodeKinds)[number];

export const semanticGroupRoles = [
  "stimulus_body",
  "notice",
  "announcement",
  "address_block",
  "turn",
  "caption",
  "signature",
] as const;
export type SemanticGroupRole = (typeof semanticGroupRoles)[number];

export const emphasisRoles = ["strong", "distinguishing"] as const;
export type EmphasisRole = (typeof emphasisRoles)[number];

/** The only node that carries authored characters. Every other node is structure. */
export interface SafeInlineText {
  readonly kind: "inline_text";
  readonly text: string;
}

export interface SafeParagraph {
  readonly kind: "paragraph";
  readonly children: readonly SafeContentNode[];
}

export interface SafeHeading {
  readonly kind: "heading";
  /** Relative rank inside the stimulus. The page owns `h1`; content never claims it. */
  readonly level: 2 | 3 | 4;
  readonly children: readonly SafeContentNode[];
}

export interface SafeEmphasis {
  readonly kind: "emphasis";
  readonly role: EmphasisRole;
  readonly children: readonly SafeContentNode[];
}

export interface SafeQuote {
  readonly kind: "quote";
  readonly children: readonly SafeContentNode[];
}

export interface SafeList {
  readonly kind: "list";
  readonly ordered: boolean;
  readonly items: readonly SafeContentNode[];
}

/**
 * A placeholder for a decisive-evidence anchor. It carries the anchor identity only: the span is
 * resolved server-side after finalization, so no node in a learner payload can leak the answer.
 */
export interface SafeEvidenceAnchorPlaceholder {
  readonly kind: "evidence_anchor_placeholder";
  readonly anchorId: string;
}

/** A cloze gap position. It never carries the accepted candidate or any local option ordering. */
export interface SafeClozeAnchor {
  readonly kind: "cloze_anchor";
  readonly gapId: string;
}

export interface SafeSemanticGroup {
  readonly kind: "semantic_group";
  readonly role: SemanticGroupRole;
  readonly children: readonly SafeContentNode[];
}

/**
 * The closed union. There is no raw-HTML node, no attribute bag, no URL node and no `unknown`
 * escape hatch, so script, event handlers, style injection, active embeds, arbitrary SVG and
 * external URLs are not expressible — not merely filtered. This is half of `P05-SECURITY-001`.
 */
export type SafeContentNode =
  | SafeParagraph
  | SafeHeading
  | SafeInlineText
  | SafeEmphasis
  | SafeQuote
  | SafeList
  | SafeEvidenceAnchorPlaceholder
  | SafeClozeAnchor
  | SafeSemanticGroup;

export const safeContentFindingCodes = [
  "not_an_object",
  "unknown_node_kind",
  "unexpected_property",
  "missing_property",
  "invalid_property_type",
  "empty_text",
  "markup_in_text",
  "active_scheme_in_text",
  "external_url_in_text",
  "control_character_in_text",
  "max_depth_exceeded",
] as const;
export type SafeContentFindingCode = (typeof safeContentFindingCodes)[number];

export interface SafeContentFinding {
  readonly code: SafeContentFindingCode;
  /** JSON pointer into the value that was offered, so a defect names its own location. */
  readonly pointer: string;
  readonly detail: string;
}

export type SafeContentParse =
  | { readonly ok: true; readonly node: SafeContentNode }
  | { readonly ok: false; readonly findings: readonly SafeContentFinding[] };

/** Nesting deeper than this is authoring noise, and unbounded recursion is a denial-of-service. */
export const maxSafeContentDepth = 12;

const markupPattern = /<\s*\/?\s*[a-z!?]/i;
const activeSchemePattern = /\b(?:javascript|data|vbscript|file|blob)\s*:/i;
const externalUrlPattern = /(?:https?:\/\/|\/\/[a-z0-9-]+\.)/i;

/** Tab, newline and carriage return are legitimate whitespace; every other control point is not. */
function hasControlCharacter(text: string): boolean {
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    if (code === 0x09 || code === 0x0a || code === 0x0d) continue;
    if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

const nodeProperties: Readonly<Record<SafeContentNodeKind, readonly string[]>> = {
  paragraph: ["kind", "children"],
  heading: ["kind", "level", "children"],
  inline_text: ["kind", "text"],
  emphasis: ["kind", "role", "children"],
  quote: ["kind", "children"],
  list: ["kind", "ordered", "items"],
  evidence_anchor_placeholder: ["kind", "anchorId"],
  cloze_anchor: ["kind", "gapId"],
  semantic_group: ["kind", "role", "children"],
};

const knownSafeContentNodeKinds: ReadonlySet<string> = new Set<string>(safeContentNodeKinds);
const knownSemanticGroupRoles: ReadonlySet<string> = new Set<string>(semanticGroupRoles);
const knownEmphasisRoles: ReadonlySet<string> = new Set<string>(emphasisRoles);
const identifierPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

function inspectText(text: string, pointer: string, findings: SafeContentFinding[]): void {
  if (text.trim().length === 0) {
    findings.push({ code: "empty_text", pointer, detail: "Authored text must not be blank." });
  }
  if (hasControlCharacter(text)) {
    findings.push({
      code: "control_character_in_text",
      pointer,
      detail: "Control characters are not authored content.",
    });
  }
  if (markupPattern.test(text)) {
    findings.push({
      code: "markup_in_text",
      pointer,
      detail: "Markup is never interpreted; authored content is text plus closed structure nodes.",
    });
  }
  if (activeSchemePattern.test(text)) {
    findings.push({
      code: "active_scheme_in_text",
      pointer,
      detail: "Active URL schemes are rejected at authoring intake.",
    });
  }
  if (externalUrlPattern.test(text)) {
    findings.push({
      code: "external_url_in_text",
      pointer,
      detail: "Learner content never references an external host.",
    });
  }
}

function inspectChildren(
  value: Record<string, unknown>,
  property: "children" | "items",
  pointer: string,
  depth: number,
  findings: SafeContentFinding[],
): void {
  const children = value[property];
  if (!Array.isArray(children)) {
    findings.push({
      code: "invalid_property_type",
      pointer: `${pointer}/${property}`,
      detail: `\`${property}\` must be an array of safe content nodes.`,
    });
    return;
  }
  children.forEach((child, index) => {
    inspectNode(child, `${pointer}/${property}/${index}`, depth + 1, findings);
  });
}

function inspectNode(
  value: unknown,
  pointer: string,
  depth: number,
  findings: SafeContentFinding[],
): void {
  if (depth > maxSafeContentDepth) {
    findings.push({
      code: "max_depth_exceeded",
      pointer,
      detail: `Safe content nests at most ${maxSafeContentDepth} levels.`,
    });
    return;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    findings.push({ code: "not_an_object", pointer, detail: "A node must be a plain object." });
    return;
  }
  const node = value as Record<string, unknown>;
  const kind = node.kind;
  if (typeof kind !== "string" || !knownSafeContentNodeKinds.has(kind)) {
    findings.push({
      code: "unknown_node_kind",
      pointer,
      detail: "The safe content union is closed; there is no passthrough node.",
    });
    return;
  }
  const allowed = nodeProperties[kind as SafeContentNodeKind];
  for (const property of Object.keys(node)) {
    if (!allowed.includes(property)) {
      findings.push({
        code: "unexpected_property",
        pointer: `${pointer}/${property}`,
        detail: "Undeclared properties carry handlers, styles and URLs; they are rejected.",
      });
    }
  }
  for (const property of allowed) {
    if (!Object.hasOwn(node, property)) {
      findings.push({
        code: "missing_property",
        pointer: `${pointer}/${property}`,
        detail: `\`${property}\` is required on a \`${kind}\` node.`,
      });
    }
  }

  switch (kind) {
    case "inline_text": {
      if (typeof node.text !== "string") {
        findings.push({
          code: "invalid_property_type",
          pointer: `${pointer}/text`,
          detail: "`text` must be a string.",
        });
        break;
      }
      inspectText(node.text, `${pointer}/text`, findings);
      break;
    }
    case "heading": {
      if (node.level !== 2 && node.level !== 3 && node.level !== 4) {
        findings.push({
          code: "invalid_property_type",
          pointer: `${pointer}/level`,
          detail: "Content headings rank 2-4; the page owns `h1`.",
        });
      }
      inspectChildren(node, "children", pointer, depth, findings);
      break;
    }
    case "emphasis": {
      if (typeof node.role !== "string" || !knownEmphasisRoles.has(node.role)) {
        findings.push({
          code: "invalid_property_type",
          pointer: `${pointer}/role`,
          detail: "Emphasis roles are a closed set.",
        });
      }
      inspectChildren(node, "children", pointer, depth, findings);
      break;
    }
    case "semantic_group": {
      if (typeof node.role !== "string" || !knownSemanticGroupRoles.has(node.role)) {
        findings.push({
          code: "invalid_property_type",
          pointer: `${pointer}/role`,
          detail: "Semantic group roles are a closed set.",
        });
      }
      inspectChildren(node, "children", pointer, depth, findings);
      break;
    }
    case "list": {
      if (typeof node.ordered !== "boolean") {
        findings.push({
          code: "invalid_property_type",
          pointer: `${pointer}/ordered`,
          detail: "`ordered` must be a boolean.",
        });
      }
      inspectChildren(node, "items", pointer, depth, findings);
      break;
    }
    case "evidence_anchor_placeholder":
    case "cloze_anchor": {
      const property = kind === "cloze_anchor" ? "gapId" : "anchorId";
      const identifier = node[property];
      if (typeof identifier !== "string" || !identifierPattern.test(identifier)) {
        findings.push({
          code: "invalid_property_type",
          pointer: `${pointer}/${property}`,
          detail: "Anchor identities are opaque, safe identifiers.",
        });
      }
      break;
    }
    default:
      inspectChildren(node, "children", pointer, depth, findings);
      break;
  }
}

/**
 * Re-validates authored content at the serving boundary as defence in depth: the closed union stops
 * unsafe *shapes* at compile time, and this stops unsafe *values* that arrived from a database row,
 * an imported bundle or a fixture.
 */
export function parseSafeContentNode(value: unknown, pointer = ""): SafeContentParse {
  const findings: SafeContentFinding[] = [];
  inspectNode(value, pointer, 0, findings);
  if (findings.length > 0) return { ok: false, findings };
  return { ok: true, node: value as SafeContentNode };
}

/** Validates a whole authored tree, returning every finding rather than only the first. */
export function parseSafeContentTree(
  values: readonly unknown[],
  pointer = "",
):
  | { readonly ok: true }
  | { readonly ok: false; readonly findings: readonly SafeContentFinding[] } {
  const findings: SafeContentFinding[] = [];
  values.forEach((value, index) => {
    inspectNode(value, `${pointer}/${index}`, 0, findings);
  });
  if (findings.length > 0) return { ok: false, findings };
  return { ok: true };
}

/** Flattens the authored characters of a safe tree, for digesting and for anti-copy comparison. */
export function safeContentText(nodes: readonly SafeContentNode[]): string {
  const parts: string[] = [];
  const walk = (node: SafeContentNode): void => {
    switch (node.kind) {
      case "inline_text":
        parts.push(node.text);
        return;
      case "evidence_anchor_placeholder":
      case "cloze_anchor":
        return;
      case "list":
        for (const item of node.items) walk(item);
        return;
      default:
        for (const child of node.children) walk(child);
        return;
    }
  };
  for (const node of nodes) walk(node);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/* ------------------------------------------------------------------------------------------------
 * Options, constraints and scorable items (`Architecture/15-…` §5.2)
 * ---------------------------------------------------------------------------------------------- */

/**
 * A learner-selectable label. `positionIsPresentationOnly` is a literal `true`: option position is
 * never identity, so reordering options can change neither the keyed meaning nor the family.
 */
export interface Option {
  readonly optionId: string;
  readonly learnerSafeLabel: readonly SafeContentNode[];
  readonly positionIsPresentationOnly: true;
}

export const rightReusePolicies = ["at_most_once", "unrestricted"] as const;
export type RightReusePolicy = (typeof rightReusePolicies)[number];

export const unmatchedPolicies = ["forbidden", "explicit_no_match", "permitted"] as const;
export type UnmatchedPolicy = (typeof unmatchedPolicies)[number];

export const completionRules = ["all_left_bound", "partial_permitted"] as const;
export type CompletionRule = (typeof completionRules)[number];

export interface MatchConstraint {
  readonly leftCardinality: { readonly min: number; readonly max: number };
  readonly rightReusePolicy: RightReusePolicy;
  readonly unmatchedPolicy: UnmatchedPolicy;
  readonly completionRule: CompletionRule;
}

export const responseKinds = [
  "single_select",
  "match",
  "cloze_local_option",
  "cloze_bank_candidate",
] as const;
export type ResponseKind = (typeof responseKinds)[number];

export const mappingConfidences = ["high", "moderate", "low"] as const;
export type MappingConfidence = (typeof mappingConfidences)[number];

/**
 * The scoring contract for one respondable unit. `keyRevisionId` is a **server-only join**: it is
 * deliberately not part of `TaskFamily`, which is the only thing a learner-safe payload carries.
 */
export interface ScorableItem {
  readonly itemId: ContentItemId;
  readonly responseKind: ResponseKind;
  readonly responseCardinality: { readonly min: number; readonly max: number };
  readonly primaryCapabilityRefs: readonly string[];
  readonly optionalSecondaryRefs: readonly string[];
  readonly mappingConfidence: MappingConfidence;
  readonly keyRevisionId: KeyRevisionId;
  readonly scoringPolicyRef: string;
}

/** Which element of the learner payload a scorable item scores. Bound by identity, never position. */
export type ItemBinding =
  | { readonly kind: "select"; readonly questionId: string }
  | { readonly kind: "match"; readonly leftId: string }
  | { readonly kind: "gap"; readonly gapId: string };

/**
 * A scorable/respondable unit inside one content revision. A material correction creates a
 * successor item; it never retargets the published one (`Architecture/09-…` §4.1).
 */
export interface ContentItem {
  readonly contentItemId: ContentItemId;
  readonly contentRevisionId: ContentRevisionId;
  readonly predecessorItemId?: ContentItemId;
  readonly ordinal: number;
  readonly binding: ItemBinding;
  readonly scorable: ScorableItem;
}

/* ------------------------------------------------------------------------------------------------
 * Instructions (`Architecture/15-…` §5.1)
 * ---------------------------------------------------------------------------------------------- */

export const responseMechanics = [
  "single_select",
  "match_select_then_place",
  "cloze_local_options",
  "cloze_shared_bank",
] as const;
export type ResponseMechanic = (typeof responseMechanics)[number];

/**
 * What help may be offered for this task, expressed with the domain's assistance vocabulary so the
 * instruction, the serving lease and the recorded conditions cannot drift apart.
 */
export interface HelpPolicy {
  readonly offerableAssistanceKinds: readonly AssistanceKind[];
}

export interface Instruction {
  readonly instructionId: string;
  readonly locale: "de" | "en";
  readonly safeContentNodes: readonly SafeContentNode[];
  readonly responseMechanic: ResponseMechanic;
  readonly helpPolicy: HelpPolicy;
  /**
   * A Bestehen practice label. The target duration is never copied into a task definition, and
   * hiding a timer changes presentation only — never the authoritative clock.
   */
  readonly learnerFacingTimingLabel: string | null;
}

/* ------------------------------------------------------------------------------------------------
 * Families, revisions and forms (`Architecture/09-…` §4.1, §4.3; `Architecture/15-…` §5.1)
 * ---------------------------------------------------------------------------------------------- */

export const familyAssignmentBases = [
  "automated_proposal",
  "human_review",
  "conservative_default",
] as const;
export type FamilyAssignmentBasis = (typeof familyAssignmentBases)[number];

export const familyReviewStates = ["proposed", "confirmed", "unresolved"] as const;
export type FamilyReviewState = (typeof familyReviewStates)[number];

/**
 * A conservative semantic exposure family. Revisions, voices, shuffled options, renamed entities and
 * cosmetic nouns do not create freshness (`Architecture/09-…` §4.1, §7.1).
 */
export interface ContentFamily {
  readonly contentFamilyId: ContentFamilyId;
  readonly taskDefinition: { readonly id: string; readonly revision: number };
  readonly taskFamilyKind: TaskFamilyKind;
  readonly scenarioConfigurationRef: string;
  readonly decisiveRealizationRef: string;
  readonly answerPathRef: string;
  readonly assignmentBasis: FamilyAssignmentBasis;
  readonly reviewState: FamilyReviewState;
}

export const progressionProfiles = ["P0", "P1", "P2", "P3", "P4"] as const;
export type ProgressionProfile = (typeof progressionProfiles)[number];

export const evidenceRoles = [
  "learning_practice",
  "repair_check",
  "independent_practice",
  "mini_mock",
  "section_mock",
  "full_mock",
  "booking_confirmation",
] as const;
export type EvidenceRole = (typeof evidenceRoles)[number];

/**
 * The exact immutable learner-visible artifact plus its bindings. Publication freezes it; a material
 * text, key, prompt or obligation change creates a successor revision rather than mutating this one.
 */
export interface ContentRevision {
  readonly contentRevisionId: ContentRevisionId;
  readonly predecessorRevisionId?: ContentRevisionId;
  readonly contentFamilyId: ContentFamilyId;
  readonly contentClass: ContentClass;
  readonly taskDefinition: { readonly id: string; readonly revision: number };
  readonly generationBrief: { readonly id: string; readonly revision: number };
  readonly corpusBundleRef?: { readonly bundleId: string; readonly revision: number };
  readonly targetBlueprintRelease: string;
  readonly taxonomyRelease: string;
  readonly capabilityRefs: readonly string[];
  readonly progressionProfile: ProgressionProfile;
  readonly intendedEvidenceRoles: readonly EvidenceRole[];
  readonly instruction: Instruction;
  /** Learner-safe by construction: a closed task-family union over closed safe content nodes. */
  readonly learnerPayload: TaskFamily;
  readonly items: readonly ContentItem[];
  /** Server-only join. Key material never crosses the serving boundary; only digests do. */
  readonly keyRevisionIds: readonly KeyRevisionId[];
  readonly mediaRevisionIds: readonly MediaRevisionId[];
  readonly rightsEnvelopeId: AppId<"rights_envelope">;
  readonly accessibilityManifestId: string;
  readonly currentApprovalDecisionId?: AppId<"approval_decision">;
  /** Set on first publication and immutable afterwards. */
  readonly frozenAt?: string;
  /** SHA-256 over `canonical-json/v1`. An integrity fact, never a semantic identity. */
  readonly digest: string;
}

export const submissionBoundaries = ["item", "cluster", "task_set", "block"] as const;
export type SubmissionBoundary = (typeof submissionBoundaries)[number];

export const feedbackTimings = ["immediate", "block_end"] as const;
export type FeedbackTiming = (typeof feedbackTimings)[number];

export interface ObjectivePracticeBlock {
  readonly kind: "objective_practice_block";
  readonly blockId: string;
  readonly taskFamilyKind: TaskFamilyKind;
  readonly timingRule:
    | { readonly kind: "open" }
    | { readonly kind: "practice_target"; readonly ruleRef: string };
  readonly submissionBoundary: Extract<SubmissionBoundary, "item" | "cluster" | "task_set">;
  readonly feedbackAfterSubmission: FeedbackTiming;
}

/**
 * The shared written-target block covering R1+R2+R3+SB1+SB2. Its duration is a pinned rule
 * reference, never a literal copied into a task definition.
 */
export interface SharedWrittenTargetBlock {
  readonly kind: "shared_written_target_block";
  readonly blockId: string;
  readonly coveredFamilies: readonly TaskFamilyKind[];
  readonly targetDurationRuleRef: string;
  readonly clockAndResumePolicyRef: string;
  readonly navigationPolicyFromBlueprint: string;
  readonly submissionBoundary: Extract<SubmissionBoundary, "block">;
  readonly feedbackAfterSubmission: Extract<FeedbackTiming, "block_end">;
}

export type BlockContract = ObjectivePracticeBlock | SharedWrittenTargetBlock;

/**
 * An exact frozen composition graph — not a query saved for later. Material composition, timing,
 * key, rubric or asset change creates a new `formId`; history stays pinned to the old form.
 */
export interface ObjectiveForm {
  readonly formId: ContentFormId;
  readonly formRevisionId: string;
  readonly formFamilyId?: string;
  readonly targetBlueprintReleaseId: string;
  readonly taskDefinitionVersions: readonly { readonly id: string; readonly revision: number }[];
  readonly contentRevisionIds: readonly ContentRevisionId[];
  readonly contentFamilyIds: readonly ContentFamilyId[];
  readonly itemIds: readonly ContentItemId[];
  /** Server-only join, exactly as `Architecture/15-…` §5.1 marks it. */
  readonly keyRevisionIds: readonly KeyRevisionId[];
  readonly approvalDecisionId: AppId<"approval_decision">;
  readonly intendedRole: EvidenceRole;
  readonly progressionProfile: ProgressionProfile;
  readonly blockContracts: readonly BlockContract[];
  readonly navigationPolicy: string;
  readonly feedbackPolicy: string;
  readonly checkpointPolicyRef: string;
  readonly rightsAndAccessibilityManifestRefs: readonly string[];
  readonly digest: string;
}

/* ------------------------------------------------------------------------------------------------
 * Serving lease (`Architecture/09-…` §4.3)
 * ---------------------------------------------------------------------------------------------- */

export const revocationStates = ["active", "revoked_before_start", "revoked_after_pin"] as const;
export type RevocationState = (typeof revocationStates)[number];

/**
 * The in-process, branded-identifier mirror of `servingManifestSchema` in `@bestehen/contracts`,
 * which owns the wire form. It carries key **digests** only — never a key, correct flag, distractor
 * rationale, scoring weight or operator note.
 */
export interface ServingManifest {
  readonly servingManifestId: ServingManifestId;
  readonly attemptId: AppId<"attempt">;
  readonly formId?: ContentFormId;
  readonly contentRevisionIds: readonly ContentRevisionId[];
  readonly itemIds: readonly ContentItemId[];
  readonly mediaRevisionIds: readonly MediaRevisionId[];
  readonly keyRevisionDigests: readonly string[];
  readonly contentClass: ContentClass;
  readonly approvalRole: ContentApprovalLevel;
  readonly learnerSafePayloadDigest: string;
  readonly freshnessDecision: FreshnessDecision;
  readonly comparedFamilyRefs: readonly ContentFamilyId[];
  readonly authorizationVersion: string;
  readonly contentReleaseIdentity: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly revocationState: RevocationState;
}
