/**
 * The outbound Corpus request contract — the App → Corpus half of `Architecture/10-…` §5.1 and
 * §11.2, and item 4 of the five-part boundary proof of `Architecture/10-…` §9.2.
 *
 * Publication is one-way Corpus → App. The only values that ever travel in the other direction are
 * a discovery request (highest seen publication sequence plus supported contract metadata) and a
 * capability request resolved from the App's *own* catalogue. Neither carries learner data.
 *
 * The property this module exists to hold is narrow and easy to get subtly wrong:
 *
 * > A forbidden learner or profile field must make serialization **fail**, naming the field.
 * > It must never be silently stripped.
 *
 * Stripping would let the request be built anyway — quietly cleaned — and the defect that produced
 * the contamination would never surface. So {@link serializeOutboundCorpusRequest} scans the raw
 * value *before* the shape is parsed and reports a JSON pointer to every forbidden field it finds,
 * at any depth, in either camelCase or snake_case. Only after that scan passes does the strict
 * schema run.
 *
 * Nothing here opens a socket, holds a credential or names a host. This module is a pure guard, and
 * a guard is exactly the sort of thing that is safe for any process to hold. The Corpus *client*
 * and the bundle reader are separate, worker-only modules that `apps/web` cannot reach; that is a
 * different part of the same proof (`Architecture/10-…` §9.2 items 1 and 2).
 */

import { z } from "zod";
import { taskFamilyKinds } from "./task-families.js";

/* ------------------------------------------------------------------------------------------------
 * The forbidden set
 * ---------------------------------------------------------------------------------------------- */

function toSnakeCase(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Every field name that carries, or directly reveals, learner or profile data. The list is the
 * explicit rejection list of `Architecture/10-…` §5.1 plus the learner-state vocabulary the App
 * resolves a request against locally.
 *
 * `freshnessFamilyExclusions` is deliberately here even though the architecture pseudotype names
 * it: §5.1 states in prose that those App content-family identifiers are used **only locally** and
 * are not transmitted. A field that must not travel is a forbidden field on the wire, whatever the
 * pseudotype sketch lists, so the prose wins and the exclusion set is resolved App-side.
 */
export const forbiddenOutboundFieldNames: readonly string[] = (() => {
  const camelCase = [
    "accessibilityDeclaration",
    "accountId",
    "assistanceEvent",
    "assistanceRecord",
    "attemptId",
    "capabilityEstimate",
    "checkpoint",
    "comment",
    "deviceId",
    "email",
    "examDate",
    "exposureHistory",
    "fatigue",
    "freeText",
    "freshnessFamilyExclusions",
    "learnerId",
    "learnerNote",
    "learnerScopeId",
    "mastery",
    "mistakeMemory",
    "note",
    "objectiveOutcome",
    "preferences",
    "principalId",
    "profileFact",
    "readiness",
    "response",
    "responses",
    "schedule",
    "sessionId",
    "transcript",
    "weakness",
  ];
  const extras = [
    "attempt",
    "learner",
    "preference",
    "profile",
    "scope",
    "session",
    "subject",
    "user",
  ];
  return [...new Set([...camelCase, ...camelCase.map(toSnakeCase), ...extras])].sort();
})();

const forbiddenOutboundFieldNameSet: ReadonlySet<string> = new Set(forbiddenOutboundFieldNames);

/** Guards against unbounded recursion on a cyclic or adversarial value. */
export const maxOutboundScanDepth = 32;

/** One forbidden field, located exactly. `path` is the zod issue path; `pointer` is readable. */
export interface ForbiddenOutboundField {
  readonly fieldName: string;
  readonly path: readonly (string | number)[];
  readonly pointer: string;
}

/**
 * Every forbidden field in a candidate outbound value, at any depth, named by JSON pointer. An
 * empty result is the only acceptable outcome for a request that is about to leave the process.
 */
export function findForbiddenOutboundFields(value: unknown): readonly ForbiddenOutboundField[] {
  const found: ForbiddenOutboundField[] = [];
  const seen = new WeakSet<object>();
  const walk = (node: unknown, path: readonly (string | number)[], depth: number): void => {
    if (depth > maxOutboundScanDepth || typeof node !== "object" || node === null) return;
    if (seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      node.forEach((entry, index) => {
        walk(entry, [...path, index], depth + 1);
      });
      return;
    }
    for (const [name, entry] of Object.entries(node)) {
      const childPath = [...path, name];
      if (forbiddenOutboundFieldNameSet.has(name)) {
        found.push({
          fieldName: name,
          path: childPath,
          pointer: `/${childPath.join("/")}`,
        });
      }
      walk(entry, childPath, depth + 1);
    }
  };
  walk(value, [], 0);
  return found;
}

/* ------------------------------------------------------------------------------------------------
 * Vocabulary (`Architecture/10-…` §5.1)
 * ---------------------------------------------------------------------------------------------- */

export const corpusCapabilities = [
  "target_profile",
  "pattern",
  "blueprint",
  "structured_reference",
  "reference_eligibility",
  "aggregate_prior",
  "skill_graph",
  "difficulty_envelope",
  "provenance_drilldown",
  "reconciliation",
] as const;
export type CorpusCapability = (typeof corpusCapabilities)[number];

export const corpusRequestedActions = [
  "display",
  "reproduce",
  "adapt",
  "generate_from",
  "cache",
  "offline",
  "transform",
] as const;

export const corpusInformationFamilies = [
  "reference_package",
  "exam_structure_release",
  "aggregate_prior_release",
  "skill_graph_release",
  "generation_blueprint_release",
  "demand_signal_release",
] as const;
export type CorpusInformationFamily = (typeof corpusInformationFamilies)[number];

export const corpusConfidenceTiers = ["anchor_only", "exploratory", "supported", "strong"] as const;
export const corpusIndependenceRequirements = ["none", "independent_support"] as const;
export const corpusRealismLevels = ["schematic", "realistic", "authentic_register"] as const;

/**
 * An opaque reference. Deliberately narrow: no whitespace, so a free-text sentence cannot ride
 * inside a field that is nominally a reference.
 */
const opaqueRefSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9._:/-]{2,127}$/i)
  .describe("Opaque Corpus-side reference; never free text");

const familyMajorSchema = z
  .object({
    family: z.enum(corpusInformationFamilies),
    major: z.number().int().positive(),
  })
  .strict();

/* ------------------------------------------------------------------------------------------------
 * The two outbound request shapes
 * ---------------------------------------------------------------------------------------------- */

/**
 * Discovery. `Architecture/10-…` §11.2: the request contains only the highest publication sequence
 * and supported contract metadata. There is no room in this shape for anything else.
 */
export const corpusDiscoveryRequestShape = z
  .object({
    kind: z.literal("corpus_discovery"),
    highestPublicationSequence: z.number().int().nonnegative(),
    supportedContractMajor: z.number().int().positive(),
    supportedPackagingMajor: z.number().int().positive(),
    supportedFamilyMajors: z.array(familyMajorSchema).min(1).max(16),
  })
  .strict();

/**
 * `DesiredPracticeSpec` of `Architecture/10-…` §5.1, minus everything the same section explicitly
 * rejects. It is built **after** the App has resolved private learner state, so what crosses is the
 * resolved task shape, never the reasoning that produced it. There is no extension bag.
 */
export const desiredPracticeSpecShape = z
  .object({
    kind: z.literal("desired_practice_spec"),
    targetProfileRef: opaqueRefSchema,
    capability: z.enum(corpusCapabilities),
    taskFamily: z.enum(taskFamilyKinds).optional(),
    progressionProfile: z.enum(["P0", "P1", "P2", "P3", "P4"]),
    taxonomyNodeRefs: z.array(opaqueRefSchema).max(64),
    difficultyEnvelope: z.object({ minimum: z.number(), maximum: z.number() }).strict().optional(),
    topicConstraints: z
      .object({
        include: z.array(opaqueRefSchema).max(32),
        exclude: z.array(opaqueRefSchema).max(32),
      })
      .strict()
      .optional(),
    modalityAndDeliveryConstraints: z.array(opaqueRefSchema).max(16).optional(),
    desiredRealism: z.enum(corpusRealismLevels).optional(),
    minimumConfidence: z.enum(corpusConfidenceTiers).optional(),
    minimumSourceBreadth: z.number().int().nonnegative().optional(),
    independenceRequirement: z.enum(corpusIndependenceRequirements).optional(),
    exactReferenceRequested: z.boolean(),
    requestedActions: z.array(z.enum(corpusRequestedActions)).max(7).optional(),
    supportedContractMajor: z.number().int().positive(),
    supportedFamilyMajors: z.array(familyMajorSchema).min(1).max(16),
    snapshotRef: opaqueRefSchema,
  })
  .strict();

/** The closed set of values that may leave the App for Corpus. There is no third shape. */
export const outboundCorpusRequestShape = z.discriminatedUnion("kind", [
  corpusDiscoveryRequestShape,
  desiredPracticeSpecShape,
]);

export type CorpusDiscoveryRequest = z.infer<typeof corpusDiscoveryRequestShape>;
export type DesiredPracticeSpec = z.infer<typeof desiredPracticeSpecShape>;
export type OutboundCorpusRequest = z.infer<typeof outboundCorpusRequestShape>;

/**
 * The schema an outbound request is actually validated by.
 *
 * The forbidden-field scan is a *pipe stage in front of* the shape rather than a `superRefine` on
 * the object, and the ordering is the whole point. A refinement attached to a strict object runs
 * only after that object parses; a payload contaminated with `learnerId` fails strict-object
 * parsing first and would be reported as a generic unrecognized key, with no statement that the
 * key was forbidden. Scanning first means every forbidden field is reported by name, at its own
 * path, even when the surrounding request is otherwise malformed.
 */
export const outboundCorpusRequestSchema = z
  .unknown()
  .superRefine((value, ctx) => {
    for (const field of findForbiddenOutboundFields(value)) {
      ctx.addIssue({
        code: "custom",
        path: [...field.path],
        message: `Forbidden learner or profile field \`${field.fieldName}\` at \`${field.pointer}\`. Corpus receives no learner data; the request is rejected rather than cleaned.`,
      });
    }
  })
  .pipe(outboundCorpusRequestShape);

/* ------------------------------------------------------------------------------------------------
 * Serialization
 * ---------------------------------------------------------------------------------------------- */

export interface OutboundSerializationFinding {
  readonly pointer: string;
  readonly detail: string;
  /** `true` when the finding is a forbidden learner/profile field rather than a shape error. */
  readonly forbiddenField: boolean;
  readonly fieldName?: string;
}

export type OutboundSerialization =
  | { readonly ok: true; readonly request: OutboundCorpusRequest; readonly body: string }
  | { readonly ok: false; readonly findings: readonly OutboundSerializationFinding[] };

function pointerOf(path: readonly PropertyKey[]): string {
  return path.length === 0 ? "" : `/${path.map(String).join("/")}`;
}

/**
 * Validates and serializes one outbound request. A contaminated payload produces
 * `ok: false` with a named field pointer; it never produces a cleaned body.
 */
export function serializeOutboundCorpusRequest(value: unknown): OutboundSerialization {
  const forbidden = findForbiddenOutboundFields(value);
  const parsed = outboundCorpusRequestSchema.safeParse(value);
  if (!parsed.success) {
    const byPointer = new Map(forbidden.map((field) => [field.pointer, field] as const));
    const findings = parsed.error.issues.map((issue): OutboundSerializationFinding => {
      const pointer = pointerOf(issue.path);
      const field = byPointer.get(pointer);
      return field === undefined
        ? { pointer, detail: issue.message, forbiddenField: false }
        : {
            pointer,
            detail: issue.message,
            forbiddenField: true,
            fieldName: field.fieldName,
          };
    });
    return { ok: false, findings };
  }
  // Defence in depth: the scan already ran inside the schema, but a serializer that could ever
  // emit a body while a forbidden field was present is the exact failure this module exists to
  // prevent, so the invariant is asserted again at the point bytes are produced.
  if (forbidden.length > 0) {
    return {
      ok: false,
      findings: forbidden.map((field) => ({
        pointer: field.pointer,
        detail: `Forbidden learner or profile field \`${field.fieldName}\`.`,
        forbiddenField: true,
        fieldName: field.fieldName,
      })),
    };
  }
  return { ok: true, request: parsed.data, body: JSON.stringify(parsed.data) };
}

/** Thrown by {@link assertOutboundCorpusRequest}. Carries the findings rather than a cleaned value. */
export class OutboundCorpusRequestRejected extends Error {
  public readonly findings: readonly OutboundSerializationFinding[];

  public constructor(findings: readonly OutboundSerializationFinding[]) {
    super(
      `Outbound Corpus request rejected: ${findings
        .map((finding) => `${finding.pointer || "/"} ${finding.detail}`)
        .join("; ")}`,
    );
    this.name = "OutboundCorpusRequestRejected";
    this.findings = findings;
  }
}

/**
 * Fails loudly rather than stripping. Every transport that could reach Corpus calls this, so the
 * only value that can be handed to a socket is one that already carries no learner data.
 */
export function assertOutboundCorpusRequest(value: unknown): string {
  const serialization = serializeOutboundCorpusRequest(value);
  if (!serialization.ok) throw new OutboundCorpusRequestRejected(serialization.findings);
  return serialization.body;
}
