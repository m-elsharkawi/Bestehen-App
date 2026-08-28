/**
 * The ordered QA gates of `Architecture/09-…` §5.3, the class/approval publication matrix, and the
 * form-composition rules of `Architecture/09-…` §6.3 — all as pure validators.
 *
 * Three properties this module exists to preserve:
 *
 * 1. **Gates are ordered, and the order is load-bearing.** Audio is rendered only after the script
 *    passes its semantic and language gate; an independent key validation over a structurally broken
 *    item means nothing. So evaluation stops at the first blocking gate and every later gate is
 *    reported `not_evaluated` — a report never claims a downstream gate passed on material that
 *    failed upstream.
 * 2. **A missing recorded result is a block, not a pass.** Several gates are human or offline
 *    review; this module cannot perform them. It requires that each one has a *recorded result and
 *    version* (`Architecture/09-…` §5.3), and blocks when one is absent. Absence of evidence is
 *    never evidence of a pass.
 * 3. **Blocked and quarantine-required are different outcomes.** A missing review blocks
 *    publication. A credible material defect — a blind-validator disagreement, a key that accepts an
 *    identity never offered, a published revision whose digest no longer matches its bytes —
 *    quarantines, and restoration then needs new evidence and an explicit decision.
 *
 * Nothing here consults a clock, a database, a network or a random source. Every answer is derived
 * from the revision and the recorded facts handed in.
 */

import {
  type ContentApprovalLevel,
  type ContentItemId,
  type ContentRevisionId,
  canHoldApprovalLevel,
} from "@bestehen/domain";
import { type AccessibilityManifest, evaluateAccessibilityGate } from "./accessibility.js";
import { contentRevisionDigest, formDigest } from "./digest.js";
import { type KeyDefect, type ObjectiveKeyRevision, validateObjectiveKeyRevision } from "./keys.js";
import type {
  BlockContract,
  ContentItem,
  ContentRevision,
  ItemBinding,
  ObjectiveForm,
  ResponseKind,
  SafeContentNode,
} from "./model.js";
import { type RightsEnvelope, evaluateAction, rightsPermissionOrder } from "./rights.js";
import {
  type TaskFamily,
  type TaskFamilyKind,
  collectItemRefs,
  isListeningTaskFamily,
  p4AllowedPlayCounts,
  writtenTaskFamilyKinds,
} from "./task-families.js";

/* ------------------------------------------------------------------------------------------------
 * The ordered gates
 * ---------------------------------------------------------------------------------------------- */

/** The eleven gates of `Architecture/09-…` §5.3, in their authoritative order. */
export const publicationGateIds = [
  "eligibility_brief",
  "semantic_task_design",
  "language_media_creation",
  "deterministic_structure",
  "independent_key_validation",
  "naturalness_register",
  "difficulty_target_fit",
  "anti_copy_diversity",
  "final_media_render_interaction",
  "approval_publish",
  "post_publication_loop",
] as const;
export type PublicationGateId = (typeof publicationGateIds)[number];

/**
 * The version recorded alongside each gate result. It is the gate *definition* version, not the
 * content version: a changed gate definition must be visible in the recorded result, otherwise an
 * old pass would be silently reused under new rules.
 */
export const publicationGateVersion = "content-qa-gates/v1";

/**
 * Gates this module can decide entirely from the artifact. The rest are human or offline review and
 * are decided by their *recorded* result, which this module requires and never substitutes for.
 */
export const computedPublicationGateIds = [
  "deterministic_structure",
  "independent_key_validation",
  "final_media_render_interaction",
  "approval_publish",
] as const satisfies readonly PublicationGateId[];

export type PublicationGateStatus = "pass" | "blocked" | "not_evaluated" | "not_applicable";

export const publicationFindingCodes = [
  // Gate 1 — eligibility and brief.
  "target_blueprint_missing",
  "target_blueprint_not_current",
  "taxonomy_release_missing",
  "generation_brief_missing",
  "rights_not_eligible_for_display",
  "rights_envelope_missing",
  "corpus_input_class_forbidden",
  // Gate 3 — language and media creation order.
  "media_rendered_before_semantic_pass",
  // Gate 4 — deterministic structure.
  "no_scorable_item",
  "duplicate_item_id",
  "duplicate_item_ordinal",
  "item_ordinal_not_contiguous",
  "item_without_payload_binding",
  "payload_ref_without_item",
  "duplicate_payload_item_ref",
  "binding_kind_mismatch",
  "binding_target_unknown",
  "duplicate_binding_target",
  "response_kind_mismatch",
  "cardinality_invalid",
  "cardinality_not_permitted_for_response_kind",
  "duplicate_offered_identifier",
  "no_offered_identifier",
  "match_constraint_incoherent",
  "no_match_option_missing",
  "no_match_option_not_permitted",
  "bank_smaller_than_gap_count",
  "bank_candidate_not_unique",
  "cloze_anchor_gap_mismatch",
  "allowed_play_count_invalid",
  "allowed_play_count_not_target_pinned",
  "accessibility_manifest_reference_missing",
  "key_reference_missing",
  "key_reference_unused",
  // Gate 5 — independent key validation.
  "key_defect",
  // Gate 9 — final media, render and interaction.
  "accessibility_gate_blocked",
  "media_revision_missing_for_listening",
  // Gate 10 — approval and publication.
  "class_may_not_hold_level",
  "illegal_publication_level",
  "digest_does_not_match_revision",
  "frozen_revision_mutated",
  "approval_decision_missing",
  // Gate 11 — post-publication loop.
  "unresolved_post_publication_report",
  // Any gate.
  "gate_result_not_recorded",
  "gate_result_failed",
] as const;
export type PublicationFindingCode = (typeof publicationFindingCodes)[number];

export interface PublicationFinding {
  readonly code: PublicationFindingCode;
  /** A JSON pointer or opaque identifier naming what failed, so a defect states its own location. */
  readonly pointer: string;
  readonly detail: string;
  /**
   * `true` when the finding is a credible material defect rather than missing work. A quarantining
   * finding is never cleared by a retry; it needs new evidence and an explicit decision.
   */
  readonly requiresQuarantine: boolean;
}

export interface GateResult {
  readonly gate: PublicationGateId;
  /** 1-based position in the authoritative order. */
  readonly ordinal: number;
  readonly status: PublicationGateStatus;
  readonly gateVersion: string;
  readonly findings: readonly PublicationFinding[];
}

export type PublicationDecision = "publishable" | "blocked" | "quarantine_required";

export interface PublicationValidation {
  readonly decision: PublicationDecision;
  readonly requestedLevel: ContentApprovalLevel;
  readonly gateResults: readonly GateResult[];
  /** The first gate that stopped the run, absent when every required gate passed. */
  readonly firstBlockingGate?: PublicationGateId;
  readonly findings: readonly PublicationFinding[];
}

/* ------------------------------------------------------------------------------------------------
 * Recorded review results
 * ---------------------------------------------------------------------------------------------- */

export const reviewGateOutcomes = ["passed", "failed", "not_run"] as const;
export type ReviewGateOutcome = (typeof reviewGateOutcomes)[number];

/**
 * A gate result recorded by a reviewer or an offline check. `methodVersion` is mandatory: a pass
 * without a version cannot be re-evaluated when the method changes, so it is not a usable record.
 */
export interface RecordedGateResult {
  readonly gate: PublicationGateId;
  readonly outcome: ReviewGateOutcome;
  readonly reviewerRef: string;
  readonly methodVersion: string;
  readonly recordedAt: string;
  readonly detail?: string;
  /** A recorded failure that is a credible material defect rather than unfinished work. */
  readonly materialDefect?: boolean;
}

export interface PostPublicationReport {
  readonly reportId: string;
  readonly kind:
    | "learner_report"
    | "validator_disagreement"
    | "cross_learner_pattern"
    | "target_change"
    | "rights_change";
  readonly resolved: boolean;
  readonly materialDefect: boolean;
  readonly detail: string;
}

export interface MediaRenderRecord {
  readonly renderedAt: string;
  /** Audio is rendered only after the script passes its semantic and language gate. */
  readonly afterSemanticAndLanguagePass: boolean;
}

export interface PublicationContext {
  /** Every recorded gate result available for this revision. Later duplicates for a gate win. */
  readonly recordedResults: readonly RecordedGateResult[];
  /** The pinned keys for the revision's scorable items. Server-only; never reaches a payload. */
  readonly keyRevisions: readonly ObjectiveKeyRevision[];
  readonly accessibilityManifest: AccessibilityManifest;
  /** Every rights envelope covering a component of the revision. Resolved to least permission. */
  readonly rightsEnvelopes: readonly RightsEnvelope[];
  readonly currentTargetBlueprintRelease: string;
  readonly mediaRenderRecord?: MediaRenderRecord;
  readonly postPublicationReports?: readonly PostPublicationReport[];
  /**
   * The digest recorded when this revision was first published. Publication freezes the revision, so
   * a frozen revision whose digest has moved has been mutated in place — a quarantining defect.
   */
  readonly publishedDigest?: string;
}

/* ------------------------------------------------------------------------------------------------
 * The structural view of a learner payload
 * ---------------------------------------------------------------------------------------------- */

/**
 * One respondable position declared by a learner payload, described without walking the closed
 * union a second time. `offeredIdentifiers` is exactly what the learner may choose, which is what
 * both the structural gate and the independent key validation need.
 */
export interface PayloadItemView {
  readonly itemRef: string;
  readonly binding: ItemBinding;
  readonly responseKind: ResponseKind;
  readonly offeredIdentifiers: readonly string[];
}

function selectViews(
  questions: readonly {
    readonly itemRef: string;
    readonly questionId: string;
    readonly options: readonly { readonly optionId: string }[];
  }[],
): readonly PayloadItemView[] {
  return questions.map((question) => ({
    itemRef: question.itemRef,
    binding: { kind: "select", questionId: question.questionId },
    responseKind: "single_select",
    offeredIdentifiers: question.options.map((option) => option.optionId),
  }));
}

/**
 * Describes every respondable position of a learner payload. Presentation order is preserved so a
 * caller can compute a keyed-answer position profile, but nothing here treats position as identity.
 */
export function describePayloadItems(family: TaskFamily): readonly PayloadItemView[] {
  switch (family.kind) {
    case "R1HeadingMatching": {
      const offered = family.headings.map((heading) => heading.optionId);
      return family.itemBindings.map((binding) => ({
        itemRef: binding.itemRef,
        binding: { kind: "match", leftId: binding.leftId },
        responseKind: "match",
        offeredIdentifiers: offered,
      }));
    }
    case "R3SituationNoticeMatching": {
      const offered = [
        ...family.notices.map((notice) => notice.stimulusId),
        ...(family.noMatchOption ? [family.noMatchOption.optionId] : []),
      ];
      return family.itemBindings.map((binding) => ({
        itemRef: binding.itemRef,
        binding: { kind: "match", leftId: binding.leftId },
        responseKind: "match",
        offeredIdentifiers: offered,
      }));
    }
    case "R2DetailedSelect":
    case "H1ShortAnnouncements":
    case "H2ConversationInterview":
    case "H3ShortFunctionalTexts":
      return selectViews(family.questions);
    case "SB1ContextualGrammarCloze":
      return family.gaps.map((gap) => ({
        itemRef: gap.itemRef,
        binding: { kind: "gap", gapId: gap.gapId },
        responseKind: "cloze_local_option",
        offeredIdentifiers: gap.options.map((option) => option.optionId),
      }));
    case "SB2SharedBankLexicalCloze": {
      const offered = family.candidateBank.map((candidate) => candidate.optionId);
      return family.gaps.map((gap) => ({
        itemRef: gap.itemRef,
        binding: { kind: "gap", gapId: gap.gapId },
        responseKind: "cloze_bank_candidate",
        offeredIdentifiers: offered,
      }));
    }
  }
}

/** The offered identities keyed by payload item reference, for key validation and scoring setup. */
export function offeredIdentifiersByItemRef(
  family: TaskFamily,
): ReadonlyMap<string, readonly string[]> {
  return new Map(
    describePayloadItems(family).map((view) => [view.itemRef, view.offeredIdentifiers]),
  );
}

/** Every `cloze_anchor` gap identity declared inside a payload's safe content, in document order. */
export function collectClozeAnchorGapIds(family: TaskFamily): readonly string[] {
  const stimulus =
    family.kind === "SB1ContextualGrammarCloze" || family.kind === "SB2SharedBankLexicalCloze"
      ? family.connectedText
      : null;
  if (stimulus === null) return [];
  const gapIds: string[] = [];
  const walk = (nodes: readonly SafeContentNode[]): void => {
    for (const node of nodes) {
      switch (node.kind) {
        case "cloze_anchor":
          gapIds.push(node.gapId);
          break;
        case "inline_text":
        case "evidence_anchor_placeholder":
          break;
        case "list":
          walk(node.items);
          break;
        default:
          walk(node.children);
          break;
      }
    }
  };
  walk(stimulus.safeContentNodes);
  return gapIds;
}

/* ------------------------------------------------------------------------------------------------
 * Findings helpers
 * ---------------------------------------------------------------------------------------------- */

function finding(
  code: PublicationFindingCode,
  pointer: string,
  detail: string,
  requiresQuarantine = false,
): PublicationFinding {
  return { code, pointer, detail, requiresQuarantine };
}

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

function bindingTarget(binding: ItemBinding): string {
  switch (binding.kind) {
    case "select":
      return binding.questionId;
    case "match":
      return binding.leftId;
    case "gap":
      return binding.gapId;
  }
}

/* ------------------------------------------------------------------------------------------------
 * Gate 1 — eligibility and brief
 * ---------------------------------------------------------------------------------------------- */

/**
 * Current target, rights-safe inputs and a real brief. Rights answer only a rights question here:
 * an ineligible envelope blocks *this* publication and says nothing about evidence already recorded
 * under the content.
 */
export function evaluateEligibilityAndBrief(
  revision: ContentRevision,
  context: PublicationContext,
): readonly PublicationFinding[] {
  const findings: PublicationFinding[] = [];
  if (revision.targetBlueprintRelease.trim() === "") {
    findings.push(
      finding(
        "target_blueprint_missing",
        "/targetBlueprintRelease",
        "A revision states the exact target blueprint release it was built against.",
      ),
    );
  } else if (revision.targetBlueprintRelease !== context.currentTargetBlueprintRelease) {
    findings.push(
      finding(
        "target_blueprint_not_current",
        "/targetBlueprintRelease",
        `Built against \`${revision.targetBlueprintRelease}\`; the current release is \`${context.currentTargetBlueprintRelease}\`.`,
      ),
    );
  }
  if (revision.taxonomyRelease.trim() === "") {
    findings.push(
      finding(
        "taxonomy_release_missing",
        "/taxonomyRelease",
        "A revision states the taxonomy release its capability references resolve against.",
      ),
    );
  }
  if (revision.generationBrief.id.trim() === "") {
    findings.push(
      finding(
        "generation_brief_missing",
        "/generationBrief",
        "A revision is built from a structured brief, never from an instruction to rewrite a source.",
      ),
    );
  }
  if (context.rightsEnvelopes.length === 0) {
    findings.push(
      finding(
        "rights_envelope_missing",
        "/rightsEnvelopeId",
        "No envelope is not no restriction; every component states its rights.",
      ),
    );
  } else {
    const eligibility = evaluateAction(context.rightsEnvelopes, "display");
    if (rightsPermissionOrder[eligibility] < rightsPermissionOrder.allowed_with_conditions) {
      findings.push(
        finding(
          "rights_not_eligible_for_display",
          "/rightsEnvelopeId",
          `Least permission across components resolves \`display\` to \`${eligibility}\`.`,
        ),
      );
    }
  }
  if (revision.contentClass === "C0" || revision.contentClass === "C4") {
    findings.push(
      finding(
        "corpus_input_class_forbidden",
        "/contentClass",
        `\`${revision.contentClass}\` is never a publishable learner artifact: C0 is reference-only and C4 is learner-response-dependent.`,
      ),
    );
  }
  return findings;
}

/* ------------------------------------------------------------------------------------------------
 * Gate 4 — deterministic structure
 * ---------------------------------------------------------------------------------------------- */

const responseKindCardinality: Readonly<Record<ResponseKind, { min: number; max: number }>> = {
  single_select: { min: 1, max: 1 },
  match: { min: 1, max: 1 },
  cloze_local_option: { min: 1, max: 1 },
  cloze_bank_candidate: { min: 1, max: 1 },
};

function checkItemInventory(
  items: readonly ContentItem[],
  findings: PublicationFinding[],
): ReadonlyMap<string, ContentItem> {
  const byId = new Map<string, ContentItem>();
  for (const item of items) byId.set(item.contentItemId, item);

  for (const duplicate of duplicates(items.map((item) => item.contentItemId))) {
    findings.push(
      finding("duplicate_item_id", `/items/${duplicate}`, "Item identities are unique.", true),
    );
  }
  const ordinals = items.map((item) => item.ordinal);
  for (const duplicate of duplicates(ordinals.map(String))) {
    findings.push(
      finding("duplicate_item_ordinal", `/items#${duplicate}`, "Item ordinals are unique."),
    );
  }
  const sorted = [...ordinals].sort((left, right) => left - right);
  const contiguous = sorted.every((ordinal, index) => ordinal === index + 1);
  if (items.length > 0 && !contiguous) {
    findings.push(
      finding(
        "item_ordinal_not_contiguous",
        "/items",
        `Ordinals must run 1..${items.length}; found ${sorted.join(",")}.`,
      ),
    );
  }
  return byId;
}

function checkPayloadBindings(
  revision: ContentRevision,
  views: readonly PayloadItemView[],
  itemsById: ReadonlyMap<string, ContentItem>,
  findings: PublicationFinding[],
): void {
  const viewByRef = new Map(views.map((view) => [view.itemRef, view]));
  for (const duplicate of duplicates(collectItemRefs(revision.learnerPayload))) {
    findings.push(
      finding(
        "duplicate_payload_item_ref",
        `/learnerPayload#${duplicate}`,
        "A payload position binds exactly one scorable item.",
        true,
      ),
    );
  }
  for (const view of views) {
    if (!itemsById.has(view.itemRef)) {
      findings.push(
        finding(
          "payload_ref_without_item",
          `/learnerPayload#${view.itemRef}`,
          "The payload declares a respondable position with no scorable item behind it.",
          true,
        ),
      );
    }
  }
  for (const item of itemsById.values()) {
    const view = viewByRef.get(item.contentItemId);
    if (!view) {
      findings.push(
        finding(
          "item_without_payload_binding",
          `/items/${item.contentItemId}`,
          "A scorable item that the payload never presents can never be answered.",
          true,
        ),
      );
      continue;
    }
    if (item.binding.kind !== view.binding.kind) {
      findings.push(
        finding(
          "binding_kind_mismatch",
          `/items/${item.contentItemId}/binding`,
          `The item binds by \`${item.binding.kind}\` but the payload position is \`${view.binding.kind}\`.`,
          true,
        ),
      );
    } else if (bindingTarget(item.binding) !== bindingTarget(view.binding)) {
      findings.push(
        finding(
          "binding_target_unknown",
          `/items/${item.contentItemId}/binding`,
          `\`${bindingTarget(item.binding)}\` is not the identity the payload declares for this position.`,
          true,
        ),
      );
    }
    if (item.scorable.responseKind !== view.responseKind) {
      findings.push(
        finding(
          "response_kind_mismatch",
          `/items/${item.contentItemId}/scorable/responseKind`,
          `The task family requires \`${view.responseKind}\`; the item declares \`${item.scorable.responseKind}\`.`,
          true,
        ),
      );
    }
    if (view.offeredIdentifiers.length === 0) {
      findings.push(
        finding(
          "no_offered_identifier",
          `/learnerPayload#${view.itemRef}`,
          "A respondable position offers at least one identity to choose.",
          true,
        ),
      );
    }
    for (const duplicate of duplicates(view.offeredIdentifiers)) {
      findings.push(
        finding(
          "duplicate_offered_identifier",
          `/learnerPayload#${view.itemRef}/${duplicate}`,
          "Two offered choices share one identity, so a response would be ambiguous.",
          true,
        ),
      );
    }
  }
  for (const duplicate of duplicates(
    [...itemsById.values()].map((item) => bindingTarget(item.binding)),
  )) {
    findings.push(
      finding(
        "duplicate_binding_target",
        `/items#${duplicate}`,
        "Two items bind the same payload position.",
        true,
      ),
    );
  }
}

function checkCardinality(items: readonly ContentItem[], findings: PublicationFinding[]): void {
  for (const item of items) {
    const { min, max } = item.scorable.responseCardinality;
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < min) {
      findings.push(
        finding(
          "cardinality_invalid",
          `/items/${item.contentItemId}/scorable/responseCardinality`,
          `\`${min}-${max}\` is not a usable response cardinality.`,
          true,
        ),
      );
      continue;
    }
    const permitted = responseKindCardinality[item.scorable.responseKind];
    if (min !== permitted.min || max !== permitted.max) {
      findings.push(
        finding(
          "cardinality_not_permitted_for_response_kind",
          `/items/${item.contentItemId}/scorable/responseCardinality`,
          `\`${item.scorable.responseKind}\` pins ${permitted.min}-${permitted.max} from the verified target release; found ${min}-${max}.`,
        ),
      );
    }
  }
}

function checkFamilyRules(
  revision: ContentRevision,
  views: readonly PayloadItemView[],
  findings: PublicationFinding[],
): void {
  const family = revision.learnerPayload;
  if (family.kind === "R1HeadingMatching" || family.kind === "R3SituationNoticeMatching") {
    const constraint = family.matchConstraints;
    const leftCount = family.itemBindings.length;
    if (
      constraint.leftCardinality.min > constraint.leftCardinality.max ||
      constraint.leftCardinality.max > leftCount ||
      constraint.leftCardinality.min < 0
    ) {
      findings.push(
        finding(
          "match_constraint_incoherent",
          "/learnerPayload/matchConstraints/leftCardinality",
          `Left cardinality ${constraint.leftCardinality.min}-${constraint.leftCardinality.max} does not fit ${leftCount} prompts.`,
        ),
      );
    }
    const rightCount = views[0]?.offeredIdentifiers.length ?? 0;
    if (constraint.rightReusePolicy === "at_most_once" && rightCount < leftCount) {
      findings.push(
        finding(
          "match_constraint_incoherent",
          "/learnerPayload/matchConstraints/rightReusePolicy",
          `\`at_most_once\` needs at least ${leftCount} right-hand choices; ${rightCount} are offered.`,
        ),
      );
    }
    if (family.kind === "R3SituationNoticeMatching") {
      if (constraint.unmatchedPolicy === "explicit_no_match" && !family.noMatchOption) {
        findings.push(
          finding(
            "no_match_option_missing",
            "/learnerPayload/noMatchOption",
            "`explicit_no_match` requires a selectable no-match choice; a learner cannot express it otherwise.",
            true,
          ),
        );
      }
      if (constraint.unmatchedPolicy === "forbidden" && family.noMatchOption) {
        findings.push(
          finding(
            "no_match_option_not_permitted",
            "/learnerPayload/noMatchOption",
            "The constraint forbids leaving a prompt unmatched, so a no-match choice must not be offered.",
          ),
        );
      }
    }
  }

  if (family.kind === "SB2SharedBankLexicalCloze") {
    const bank = family.candidateBank.map((candidate) => candidate.optionId);
    for (const duplicate of duplicates(bank)) {
      findings.push(
        finding(
          "bank_candidate_not_unique",
          `/learnerPayload/candidateBank/${duplicate}`,
          "A shared bank candidate identity appears twice, so a placement would be ambiguous.",
          true,
        ),
      );
    }
    if (family.candidateReusePolicy === "at_most_once" && bank.length < family.gaps.length) {
      findings.push(
        finding(
          "bank_smaller_than_gap_count",
          "/learnerPayload/candidateBank",
          `\`at_most_once\` needs at least ${family.gaps.length} candidates; the bank holds ${bank.length}.`,
        ),
      );
    }
  }

  if (family.kind === "SB1ContextualGrammarCloze" || family.kind === "SB2SharedBankLexicalCloze") {
    const declared = family.gaps.map((gap) => gap.gapId);
    const anchored = collectClozeAnchorGapIds(family);
    const declaredSet = new Set(declared);
    const anchoredSet = new Set(anchored);
    const missing = declared.filter((gapId) => !anchoredSet.has(gapId));
    const orphaned = anchored.filter((gapId) => !declaredSet.has(gapId));
    if (missing.length > 0 || orphaned.length > 0) {
      findings.push(
        finding(
          "cloze_anchor_gap_mismatch",
          "/learnerPayload/connectedText",
          `Gaps without an anchor: [${missing.join(",")}]; anchors without a gap: [${orphaned.join(",")}].`,
          true,
        ),
      );
    }
  }

  if (isListeningTaskFamily(family)) {
    const declared =
      family.kind === "H2ConversationInterview"
        ? family.allowedPlayCount
        : family.allowedPlayCountPerText;
    if (!Number.isInteger(declared) || declared < 1) {
      findings.push(
        finding(
          "allowed_play_count_invalid",
          "/learnerPayload/allowedPlayCount",
          `\`${declared}\` is not a usable playback opportunity count.`,
        ),
      );
    } else if (
      revision.progressionProfile === "P4" &&
      declared !== p4AllowedPlayCounts[family.kind]
    ) {
      findings.push(
        finding(
          "allowed_play_count_not_target_pinned",
          "/learnerPayload/allowedPlayCount",
          `P4 pins ${p4AllowedPlayCounts[family.kind]} plays for ${family.kind}; the revision declares ${declared}.`,
        ),
      );
    }
  }
}

function checkKeyReferences(
  revision: ContentRevision,
  context: PublicationContext,
  findings: PublicationFinding[],
): void {
  const pinned = new Set(context.keyRevisions.map((key) => key.keyRevisionId));
  const declared = new Set<string>(revision.keyRevisionIds);
  for (const item of revision.items) {
    if (!pinned.has(item.scorable.keyRevisionId) || !declared.has(item.scorable.keyRevisionId)) {
      findings.push(
        finding(
          "key_reference_missing",
          `/items/${item.contentItemId}/scorable/keyRevisionId`,
          "The item names a key revision that the revision does not pin.",
          true,
        ),
      );
    }
  }
  const used = new Set<string>(revision.items.map((item) => item.scorable.keyRevisionId));
  for (const keyRevisionId of declared) {
    if (!used.has(keyRevisionId)) {
      findings.push(
        finding(
          "key_reference_unused",
          `/keyRevisionIds/${keyRevisionId}`,
          "A pinned key scores no item, so the revision's key set does not describe it.",
        ),
      );
    }
  }
}

/**
 * QA gate 4: counts, identities, cardinality, missing and duplicate bindings, shared-bank rules and
 * the presence of the target, rights and accessibility references. Everything here is decided from
 * the artifact; nothing is delegated to a reviewer.
 */
export function evaluateDeterministicStructure(
  revision: ContentRevision,
  context: PublicationContext,
): readonly PublicationFinding[] {
  const findings: PublicationFinding[] = [];
  if (revision.items.length === 0) {
    findings.push(
      finding(
        "no_scorable_item",
        "/items",
        "A publishable revision scores at least one unit.",
        true,
      ),
    );
  }
  const views = describePayloadItems(revision.learnerPayload);
  const itemsById = checkItemInventory(revision.items, findings);
  checkPayloadBindings(revision, views, itemsById, findings);
  checkCardinality(revision.items, findings);
  checkFamilyRules(revision, views, findings);
  checkKeyReferences(revision, context, findings);
  if (revision.accessibilityManifestId.trim() === "") {
    findings.push(
      finding(
        "accessibility_manifest_reference_missing",
        "/accessibilityManifestId",
        "Accessibility is a hard publication requirement, so its manifest reference is structural.",
      ),
    );
  }
  return findings;
}

/* ------------------------------------------------------------------------------------------------
 * Gate 5 — independent key validation
 * ---------------------------------------------------------------------------------------------- */

/** A key defect surfaced by gate 5, paired with the item whose key produced it. */
export interface ItemKeyDefect {
  readonly itemId: ContentItemId;
  readonly defect: KeyDefect;
}

/**
 * Runs `validateObjectiveKeyRevision` for every scorable item against exactly the identities its
 * payload position offers. A key that accepts something never offered, or that the blind validator
 * disagreed with, quarantines rather than merely blocking.
 */
export function evaluateIndependentKeyValidation(
  revision: ContentRevision,
  context: PublicationContext,
): readonly PublicationFinding[] {
  const findings: PublicationFinding[] = [];
  const offered = offeredIdentifiersByItemRef(revision.learnerPayload);
  const keysById = new Map(context.keyRevisions.map((key) => [key.keyRevisionId, key]));
  for (const item of revision.items) {
    const key = keysById.get(item.scorable.keyRevisionId);
    if (!key) continue; // Gate 4 already reported the missing pin; do not report it twice.
    for (const defect of validateObjectiveKeyRevision(key, {
      offeredResponseIdentifiers: offered.get(item.contentItemId) ?? [],
    })) {
      findings.push(
        finding(
          "key_defect",
          `/items/${item.contentItemId}/key/${defect.code}`,
          defect.detail,
          defect.requiresQuarantine,
        ),
      );
    }
  }
  return findings;
}

/** The same gate 5 evaluation, itemised, for a report that needs to name each defect's item. */
export function collectItemKeyDefects(
  revision: ContentRevision,
  context: PublicationContext,
): readonly ItemKeyDefect[] {
  const offered = offeredIdentifiersByItemRef(revision.learnerPayload);
  const keysById = new Map(context.keyRevisions.map((key) => [key.keyRevisionId, key]));
  const defects: ItemKeyDefect[] = [];
  for (const item of revision.items) {
    const key = keysById.get(item.scorable.keyRevisionId);
    if (!key) continue;
    for (const defect of validateObjectiveKeyRevision(key, {
      offeredResponseIdentifiers: offered.get(item.contentItemId) ?? [],
    })) {
      defects.push({ itemId: item.contentItemId, defect });
    }
  }
  return defects;
}

/* ------------------------------------------------------------------------------------------------
 * Gate 9 — final media, render and interaction
 * ---------------------------------------------------------------------------------------------- */

export function evaluateFinalMediaAndInteraction(
  revision: ContentRevision,
  context: PublicationContext,
): readonly PublicationFinding[] {
  const findings: PublicationFinding[] = [];
  const accessibility = evaluateAccessibilityGate(context.accessibilityManifest);
  for (const accessibilityFinding of accessibility.findings) {
    findings.push(
      finding(
        "accessibility_gate_blocked",
        `/accessibility/${accessibilityFinding.code}`,
        `${accessibilityFinding.requirement} ${accessibilityFinding.detail}`,
      ),
    );
  }
  if (isListeningTaskFamily(revision.learnerPayload) && revision.mediaRevisionIds.length === 0) {
    findings.push(
      finding(
        "media_revision_missing_for_listening",
        "/mediaRevisionIds",
        "A listening artifact pins the exact approved bytes it plays.",
        true,
      ),
    );
  }
  return findings;
}

/* ------------------------------------------------------------------------------------------------
 * Gate 10 — approval and publication
 * ---------------------------------------------------------------------------------------------- */

/**
 * Levels a publication may target. `quarantine` is a defect disposition and `retired` is a
 * withdrawal, and neither is reached by publishing an artifact.
 */
export const publishableApprovalLevels = [
  "draft",
  "training",
  "independent_b1",
  "readiness_p4",
  "gold",
] as const satisfies readonly ContentApprovalLevel[];
export type PublishableApprovalLevel = (typeof publishableApprovalLevels)[number];

const publishableLevels: ReadonlySet<string> = new Set<string>(publishableApprovalLevels);

/**
 * The class/approval publication matrix: which gates a level requires. It composes with — never
 * replaces — `canHoldApprovalLevel`, which decides whether the *class* may hold the level at all.
 * Both must hold, exactly as `Architecture/09-…` §4.2 and §5.1 are two separate tables.
 */
export function requiredGatesForLevel(level: ContentApprovalLevel): readonly PublicationGateId[] {
  switch (level) {
    case "draft":
      // Identity, brief and input provenance exist; unresolved checks stay explicit.
      return ["eligibility_brief", "approval_publish"];
    case "training":
      return [
        "eligibility_brief",
        "semantic_task_design",
        "language_media_creation",
        "deterministic_structure",
        "independent_key_validation",
        "naturalness_register",
        "difficulty_target_fit",
        "anti_copy_diversity",
        "final_media_render_interaction",
        "approval_publish",
      ];
    case "independent_b1":
    case "readiness_p4":
    case "gold":
      // Training's gates plus the post-publication loop: promotion above training may not ignore an
      // unresolved report, a validator disagreement or a target/rights change already on record.
      return [
        "eligibility_brief",
        "semantic_task_design",
        "language_media_creation",
        "deterministic_structure",
        "independent_key_validation",
        "naturalness_register",
        "difficulty_target_fit",
        "anti_copy_diversity",
        "final_media_render_interaction",
        "approval_publish",
        "post_publication_loop",
      ];
    case "quarantine":
    case "retired":
      return [];
  }
}

export function evaluateApprovalAndPublish(
  revision: ContentRevision,
  level: ContentApprovalLevel,
  context: PublicationContext,
): readonly PublicationFinding[] {
  const findings: PublicationFinding[] = [];
  if (!publishableLevels.has(level)) {
    findings.push(
      finding(
        "illegal_publication_level",
        "/approvalLevel",
        `\`${level}\` is a disposition, not a publication target.`,
      ),
    );
  }
  if (!canHoldApprovalLevel(revision.contentClass, level)) {
    findings.push(
      finding(
        "class_may_not_hold_level",
        "/contentClass",
        `Class \`${revision.contentClass}\` may not hold \`${level}\`.`,
      ),
    );
  }
  const computed = contentRevisionDigest(revision);
  if (revision.digest !== computed) {
    findings.push(
      finding(
        "digest_does_not_match_revision",
        "/digest",
        "The recorded digest does not match the revision's own canonical serialization.",
        true,
      ),
    );
  }
  if (
    revision.frozenAt !== undefined &&
    context.publishedDigest !== undefined &&
    context.publishedDigest !== computed
  ) {
    findings.push(
      finding(
        "frozen_revision_mutated",
        "/frozenAt",
        "Publication freezes a revision; a material change creates a successor rather than editing it.",
        true,
      ),
    );
  }
  if (level !== "draft" && revision.currentApprovalDecisionId === undefined) {
    findings.push(
      finding(
        "approval_decision_missing",
        "/currentApprovalDecisionId",
        "Serving levels carry an appended, scoped approval decision.",
      ),
    );
  }
  return findings;
}

/* ------------------------------------------------------------------------------------------------
 * Gate 11 — post-publication loop
 * ---------------------------------------------------------------------------------------------- */

export function evaluatePostPublicationLoop(
  context: PublicationContext,
): readonly PublicationFinding[] {
  const findings: PublicationFinding[] = [];
  for (const report of context.postPublicationReports ?? []) {
    if (report.resolved) continue;
    findings.push(
      finding(
        "unresolved_post_publication_report",
        `/postPublicationReports/${report.reportId}`,
        `${report.kind}: ${report.detail}`,
        report.materialDefect,
      ),
    );
  }
  return findings;
}

/* ------------------------------------------------------------------------------------------------
 * The ordered run
 * ---------------------------------------------------------------------------------------------- */

function recordedFindings(
  gate: PublicationGateId,
  context: PublicationContext,
): readonly PublicationFinding[] {
  let record: RecordedGateResult | undefined;
  for (const candidate of context.recordedResults) {
    if (candidate.gate === gate) record = candidate;
  }
  if (!record || record.outcome === "not_run" || record.methodVersion.trim() === "") {
    return [
      finding(
        "gate_result_not_recorded",
        `/gates/${gate}`,
        "Each gate carries a recorded result and version; an absent record is not a pass.",
      ),
    ];
  }
  if (record.outcome === "failed") {
    return [
      finding(
        "gate_result_failed",
        `/gates/${gate}`,
        record.detail ?? `\`${gate}\` was reviewed and failed.`,
        record.materialDefect === true,
      ),
    ];
  }
  return [];
}

function evaluateGate(
  gate: PublicationGateId,
  revision: ContentRevision,
  level: ContentApprovalLevel,
  context: PublicationContext,
): readonly PublicationFinding[] {
  switch (gate) {
    case "eligibility_brief":
      return [
        ...evaluateEligibilityAndBrief(revision, context),
        ...recordedFindings(gate, context),
      ];
    case "language_media_creation": {
      const findings = [...recordedFindings(gate, context)];
      const render = context.mediaRenderRecord;
      if (render !== undefined && !render.afterSemanticAndLanguagePass) {
        findings.push(
          finding(
            "media_rendered_before_semantic_pass",
            "/mediaRenderRecord",
            "Audio is rendered only after the script passes its semantic and language gate.",
          ),
        );
      }
      return findings;
    }
    case "deterministic_structure":
      return evaluateDeterministicStructure(revision, context);
    case "independent_key_validation":
      return evaluateIndependentKeyValidation(revision, context);
    case "final_media_render_interaction":
      return evaluateFinalMediaAndInteraction(revision, context);
    case "approval_publish":
      return evaluateApprovalAndPublish(revision, level, context);
    case "post_publication_loop":
      return evaluatePostPublicationLoop(context);
    case "semantic_task_design":
    case "naturalness_register":
    case "difficulty_target_fit":
    case "anti_copy_diversity":
      return recordedFindings(gate, context);
  }
}

/**
 * Runs the eleven gates in their authoritative order for the requested approval level.
 *
 * Evaluation stops at the first gate that produces a finding, and every later gate is reported
 * `not_evaluated`. That is what "ordered" means here: a downstream pass over upstream-failed
 * material would be a false record. A gate the requested level does not require is reported
 * `not_applicable`, so the returned list always covers all eleven and a dropped gate is visible.
 */
export function validateForPublication(
  revision: ContentRevision,
  level: ContentApprovalLevel,
  context: PublicationContext,
): PublicationValidation {
  const required = new Set<PublicationGateId>(requiredGatesForLevel(level));
  const gateResults: GateResult[] = [];
  const findings: PublicationFinding[] = [];
  let firstBlockingGate: PublicationGateId | undefined;

  publicationGateIds.forEach((gate, index) => {
    const ordinal = index + 1;
    if (!required.has(gate)) {
      gateResults.push({
        gate,
        ordinal,
        status: "not_applicable",
        gateVersion: publicationGateVersion,
        findings: [],
      });
      return;
    }
    if (firstBlockingGate !== undefined) {
      gateResults.push({
        gate,
        ordinal,
        status: "not_evaluated",
        gateVersion: publicationGateVersion,
        findings: [],
      });
      return;
    }
    const gateFindings = evaluateGate(gate, revision, level, context);
    if (gateFindings.length > 0) firstBlockingGate = gate;
    findings.push(...gateFindings);
    gateResults.push({
      gate,
      ordinal,
      status: gateFindings.length === 0 ? "pass" : "blocked",
      gateVersion: publicationGateVersion,
      findings: gateFindings,
    });
  });

  const decision: PublicationDecision = findings.some((entry) => entry.requiresQuarantine)
    ? "quarantine_required"
    : findings.length > 0
      ? "blocked"
      : "publishable";

  return {
    decision,
    requestedLevel: level,
    gateResults,
    ...(firstBlockingGate === undefined ? {} : { firstBlockingGate }),
    findings,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Form composition (`Architecture/09-…` §6.3)
 * ---------------------------------------------------------------------------------------------- */

export const formCompositionCodes = [
  "revision_not_in_form",
  "form_revision_not_supplied",
  "item_set_mismatch",
  "key_set_mismatch",
  "duplicate_family_outside_cluster",
  "cluster_revision_not_in_form",
  "exposed_family_in_measurement_form",
  "revision_level_insufficient_for_role",
  "form_digest_mismatch",
  "block_contract_missing",
  "written_block_does_not_cover_families",
  "duration_rule_missing",
  "asset_incomplete",
  "answer_position_run_too_long",
  "candidate_bank_constraint_violated",
] as const;
export type FormCompositionCode = (typeof formCompositionCodes)[number];

export interface FormCompositionFinding {
  readonly code: FormCompositionCode;
  readonly pointer: string;
  readonly detail: string;
}

export interface SharedStimulusCluster {
  readonly clusterId: string;
  readonly contentRevisionIds: readonly ContentRevisionId[];
}

export interface FormCompositionContext {
  /** Every revision the form composes, exactly as pinned. */
  readonly revisions: readonly ContentRevision[];
  /** The approval level each revision actually holds, keyed by revision id. */
  readonly approvalLevelByRevisionId: ReadonlyMap<ContentRevisionId, ContentApprovalLevel>;
  /** Shared-stimulus clusters. Revisions inside one cluster may share a family. */
  readonly sharedStimulusClusters: readonly SharedStimulusCluster[];
  /** Families already materially exposed to this learner. */
  readonly exposedFamilyIds: readonly string[];
  /**
   * The presentation ordinal of each keyed choice, in form order, and the longest identical run the
   * composition rules permit. Position is never identity for *scoring*; this rule exists so a form
   * does not accidentally teach a position pattern.
   */
  readonly answerPositionProfile?: {
    readonly keyedOrdinals: readonly number[];
    readonly maxConsecutiveIdenticalOrdinal: number;
  };
}

export interface FormCompositionResult {
  readonly status: "pass" | "blocked";
  readonly findings: readonly FormCompositionFinding[];
  /** Distinct families, never item count. Shared questions on one stimulus stay one cluster. */
  readonly independentFamilyCount: number;
}

/** Roles that measure rather than teach, and therefore may not contain an exposed family. */
export const measurementEvidenceRoles = [
  "mini_mock",
  "section_mock",
  "full_mock",
  "booking_confirmation",
] as const;

const measurementRoles: ReadonlySet<string> = new Set<string>(measurementEvidenceRoles);

/**
 * Counts eligible independent families. Item count never inflates independence: shared questions on
 * one stimulus share a family and remain one correlated cluster.
 */
export function countIndependentFamilies(revisions: readonly ContentRevision[]): number {
  return new Set(revisions.map((revision) => revision.contentFamilyId)).size;
}

function longestIdenticalRun(values: readonly number[]): number {
  let longest = 0;
  let current = 0;
  let previous: number | undefined;
  for (const value of values) {
    current = value === previous ? current + 1 : 1;
    previous = value;
    if (current > longest) longest = current;
  }
  return longest;
}

function checkFormBlocks(
  form: ObjectiveForm,
  kinds: ReadonlySet<TaskFamilyKind>,
  findings: FormCompositionFinding[],
): void {
  if (form.blockContracts.length === 0) {
    findings.push({
      code: "block_contract_missing",
      pointer: "/blockContracts",
      detail: "A form states the blocks its items are answered inside.",
    });
    return;
  }
  const written = [...writtenTaskFamilyKinds].filter((kind) => kinds.has(kind));
  const sharedBlocks = form.blockContracts.filter(
    (block: BlockContract) => block.kind === "shared_written_target_block",
  );
  for (const block of sharedBlocks) {
    if (block.kind !== "shared_written_target_block") continue;
    if (block.targetDurationRuleRef.trim() === "") {
      findings.push({
        code: "duration_rule_missing",
        pointer: `/blockContracts/${block.blockId}/targetDurationRuleRef`,
        detail: "The shared written block pins its duration by rule reference, never by a literal.",
      });
    }
    const covered = new Set<string>(block.coveredFamilies);
    const uncovered = written.filter((kind) => !covered.has(kind));
    if (uncovered.length > 0) {
      findings.push({
        code: "written_block_does_not_cover_families",
        pointer: `/blockContracts/${block.blockId}/coveredFamilies`,
        detail: `The form contains ${uncovered.join(",")}, which the shared written block does not cover.`,
      });
    }
  }
}

/**
 * The form-composition rules of `Architecture/09-…` §6.3. A form manifest is an exact frozen graph:
 * every rule here is checked against what the form pins, never against what a query would return
 * today.
 */
export function validateFormComposition(
  form: ObjectiveForm,
  context: FormCompositionContext,
): FormCompositionResult {
  const findings: FormCompositionFinding[] = [];
  const supplied = new Map(
    context.revisions.map((revision) => [revision.contentRevisionId, revision] as const),
  );
  const pinned = new Set<ContentRevisionId>(form.contentRevisionIds);

  for (const revisionId of pinned) {
    if (!supplied.has(revisionId)) {
      findings.push({
        code: "form_revision_not_supplied",
        pointer: `/contentRevisionIds/${revisionId}`,
        detail: "The form pins a revision that was not supplied for validation.",
      });
    }
  }
  for (const revision of context.revisions) {
    if (!pinned.has(revision.contentRevisionId)) {
      findings.push({
        code: "revision_not_in_form",
        pointer: `/revisions/${revision.contentRevisionId}`,
        detail: "A revision was supplied that the form does not pin.",
      });
    }
  }

  const composed = context.revisions.filter((revision) => pinned.has(revision.contentRevisionId));

  const expectedItems = new Set<string>(
    composed.flatMap((revision) => revision.items.map((item) => item.contentItemId)),
  );
  const declaredItems = new Set<string>(form.itemIds);
  if (
    expectedItems.size !== declaredItems.size ||
    [...expectedItems].some((itemId) => !declaredItems.has(itemId))
  ) {
    findings.push({
      code: "item_set_mismatch",
      pointer: "/itemIds",
      detail: "The form's item set is not exactly the items of the revisions it pins.",
    });
  }
  const expectedKeys = new Set<string>(
    composed.flatMap((revision) => [...revision.keyRevisionIds]),
  );
  const declaredKeys = new Set<string>(form.keyRevisionIds);
  if (
    expectedKeys.size !== declaredKeys.size ||
    [...expectedKeys].some((keyId) => !declaredKeys.has(keyId))
  ) {
    findings.push({
      code: "key_set_mismatch",
      pointer: "/keyRevisionIds",
      detail: "The form's pinned key set is not exactly the keys of the revisions it pins.",
    });
  }

  const clusterByRevision = new Map<string, string>();
  for (const cluster of context.sharedStimulusClusters) {
    for (const revisionId of cluster.contentRevisionIds) {
      if (!pinned.has(revisionId)) {
        findings.push({
          code: "cluster_revision_not_in_form",
          pointer: `/clusters/${cluster.clusterId}/${revisionId}`,
          detail: "A shared-stimulus cluster names a revision the form does not pin.",
        });
        continue;
      }
      clusterByRevision.set(revisionId, cluster.clusterId);
    }
  }

  const clustersByFamily = new Map<string, Set<string>>();
  for (const revision of composed) {
    const key = revision.contentFamilyId;
    const cluster =
      clusterByRevision.get(revision.contentRevisionId) ?? `solo:${revision.contentRevisionId}`;
    const existing = clustersByFamily.get(key) ?? new Set<string>();
    existing.add(cluster);
    clustersByFamily.set(key, existing);
  }
  for (const [familyId, clusters] of clustersByFamily) {
    if (clusters.size > 1) {
      findings.push({
        code: "duplicate_family_outside_cluster",
        pointer: `/contentFamilyIds/${familyId}`,
        detail:
          "One family appears in more than one place in the form; item count never inflates independence.",
      });
    }
  }

  if (measurementRoles.has(form.intendedRole)) {
    const exposed = new Set(context.exposedFamilyIds);
    for (const revision of composed) {
      if (exposed.has(revision.contentFamilyId)) {
        findings.push({
          code: "exposed_family_in_measurement_form",
          pointer: `/revisions/${revision.contentRevisionId}`,
          detail: "A measurement form excludes every materially exposed family.",
        });
      }
    }
  }

  if (form.intendedRole === "full_mock" || form.progressionProfile === "P4") {
    for (const revision of composed) {
      const level = context.approvalLevelByRevisionId.get(revision.contentRevisionId);
      if (level !== "readiness_p4") {
        findings.push({
          code: "revision_level_insufficient_for_role",
          pointer: `/revisions/${revision.contentRevisionId}`,
          detail: `A P4 form uses only Readiness/P4-approved revisions; this one holds \`${level ?? "unknown"}\`.`,
        });
      }
    }
  }

  for (const revision of composed) {
    if (isListeningTaskFamily(revision.learnerPayload) && revision.mediaRevisionIds.length === 0) {
      findings.push({
        code: "asset_incomplete",
        pointer: `/revisions/${revision.contentRevisionId}/mediaRevisionIds`,
        detail: "A listening revision in a published form pins its final assets.",
      });
    }
  }

  checkFormBlocks(
    form,
    new Set(composed.map((revision) => revision.learnerPayload.kind)),
    findings,
  );

  const profile = context.answerPositionProfile;
  if (profile) {
    const run = longestIdenticalRun(profile.keyedOrdinals);
    if (run > profile.maxConsecutiveIdenticalOrdinal) {
      findings.push({
        code: "answer_position_run_too_long",
        pointer: "/answerPositionProfile",
        detail: `${run} consecutive keyed answers share a presentation ordinal; the form permits ${profile.maxConsecutiveIdenticalOrdinal}.`,
      });
    }
  }

  for (const revision of composed) {
    const payload = revision.learnerPayload;
    if (payload.kind !== "SB2SharedBankLexicalCloze") continue;
    if (
      payload.candidateReusePolicy === "at_most_once" &&
      payload.candidateBank.length < payload.gaps.length
    ) {
      findings.push({
        code: "candidate_bank_constraint_violated",
        pointer: `/revisions/${revision.contentRevisionId}/candidateBank`,
        detail: "A shared bank offers at least one candidate per gap when reuse is forbidden.",
      });
    }
  }

  if (form.digest !== formDigest(form)) {
    findings.push({
      code: "form_digest_mismatch",
      pointer: "/digest",
      detail:
        "A material composition, timing, key or asset change creates a new form, not a new digest on the old one.",
    });
  }

  return {
    status: findings.length === 0 ? "pass" : "blocked",
    findings,
    independentFamilyCount: countIndependentFamilies(composed),
  };
}
