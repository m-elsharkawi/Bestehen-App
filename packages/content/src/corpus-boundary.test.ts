/**
 * `P05-BOUNDARY-001` — the Corpus boundary proof of `Architecture/10-…` §9.2, as far as it is
 * decidable without a database.
 *
 * The five parts and where each is proved:
 *
 * | Part | Here? |
 * |---|---|
 * | 1. No Corpus client or credential on a learner route | yes — module-graph assertion below |
 * | 2. Only the import tooling may hold the client | yes — same assertion, positive direction |
 * | 3. Egress policy denies the Corpus host from the web process | **NOT claimed.** There is no live Corpus host in the personal profile, and the absence of a host is not a policy. Recorded as a Stage 10 deployment obligation. |
 * | 4. Serialization **fails** on a forbidden learner/profile field | yes — property test below |
 * | 5. Zero Corpus calls AND zero learner-data bytes | partly — the byte-level half is proved here against an instrumented transport; the full-attempt fixture is the integration half |
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  assertOutboundCorpusRequest,
  findForbiddenOutboundFields,
  forbiddenOutboundFieldNames,
  OutboundCorpusRequestRejected,
  serializeOutboundCorpusRequest,
  type OutboundCorpusRequest,
} from "./corpus-request.js";

/* ------------------------------------------------------------------------------------------------
 * Fixtures
 * ---------------------------------------------------------------------------------------------- */

const cleanDiscoveryRequest = {
  kind: "corpus_discovery",
  highestPublicationSequence: 41,
  supportedContractMajor: 1,
  supportedPackagingMajor: 1,
  supportedFamilyMajors: [{ family: "exam_structure_release", major: 1 }],
} as const satisfies OutboundCorpusRequest;

const cleanPracticeSpec = {
  kind: "desired_practice_spec",
  targetProfileRef: "corpus-target-profile/2026.06",
  capability: "blueprint",
  taskFamily: "R2DetailedSelect",
  progressionProfile: "P4",
  taxonomyNodeRefs: ["tax.reading.detail"],
  exactReferenceRequested: false,
  supportedContractMajor: 1,
  supportedFamilyMajors: [{ family: "generation_blueprint_release", major: 1 }],
  snapshotRef: "corpus-snapshot/2026.06",
} as const satisfies OutboundCorpusRequest;

/**
 * Injection sites. A guard that only checked the top level would pass a test that only contaminated
 * the top level, so every site nests the forbidden name somewhere the shape check would not look.
 */
const injectionSites = [
  {
    name: "top level",
    inject: (field: string): unknown => ({ ...cleanDiscoveryRequest, [field]: "contaminated" }),
    pointer: (field: string): string => `/${field}`,
  },
  {
    name: "inside a nested object",
    inject: (field: string): unknown => ({
      ...cleanPracticeSpec,
      difficultyEnvelope: { minimum: 1, maximum: 3, [field]: "contaminated" },
    }),
    pointer: (field: string): string => `/difficultyEnvelope/${field}`,
  },
  {
    name: "inside an array element",
    inject: (field: string): unknown => ({
      ...cleanPracticeSpec,
      supportedFamilyMajors: [{ family: "skill_graph_release", major: 1, [field]: "contaminated" }],
    }),
    pointer: (field: string): string => `/supportedFamilyMajors/0/${field}`,
  },
  {
    name: "three levels deep",
    inject: (field: string): unknown => ({
      ...cleanPracticeSpec,
      topicConstraints: {
        include: [],
        exclude: [],
        nested: { deeper: { [field]: "contaminated" } },
      },
    }),
    pointer: (field: string): string => `/topicConstraints/nested/deeper/${field}`,
  },
] as const;

/* ------------------------------------------------------------------------------------------------
 * Part 4 — serialization rejects, and never strips
 * ---------------------------------------------------------------------------------------------- */

describe("P05-BOUNDARY-001 outbound contract serialization", () => {
  it("serializes a clean request without dropping any authored field", () => {
    const serialization = serializeOutboundCorpusRequest(cleanPracticeSpec);
    expect(serialization.ok).toBe(true);
    if (!serialization.ok) return;
    // The point of this assertion is the *contrast* with the rejection tests: the mechanism does
    // not remove unexpected content, so a rejection below cannot be a silent strip either.
    expect(Object.keys(JSON.parse(serialization.body)).sort()).toEqual(
      Object.keys(cleanPracticeSpec).sort(),
    );
  });

  it("rejects every forbidden field at every injection site, naming the field", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...forbiddenOutboundFieldNames),
        fc.constantFrom(...injectionSites.map((site) => site.name)),
        (field, siteName) => {
          const site = injectionSites.find((candidate) => candidate.name === siteName);
          if (!site) throw new Error(`unknown injection site ${siteName}`);
          const contaminated = site.inject(field);
          const serialization = serializeOutboundCorpusRequest(contaminated);
          expect(serialization.ok).toBe(false);
          if (serialization.ok) return;
          const named = serialization.findings.filter(
            (finding) => finding.forbiddenField && finding.fieldName === field,
          );
          // Keyed to the field's own pointer, not to the position of the finding in the list.
          expect(named.map((finding) => finding.pointer)).toContain(site.pointer(field));
          expect(named[0]?.detail).toContain(field);
        },
      ),
      { numRuns: forbiddenOutboundFieldNames.length * injectionSites.length * 2 },
    );
  });

  it("covers every forbidden name at least once rather than sampling", () => {
    for (const field of forbiddenOutboundFieldNames) {
      for (const site of injectionSites) {
        const serialization = serializeOutboundCorpusRequest(site.inject(field));
        expect(serialization.ok, `${field} at ${site.name} was accepted`).toBe(false);
      }
    }
  });

  it("produces no serialized body at all when a forbidden field is present", () => {
    const contaminated = { ...cleanDiscoveryRequest, learnerScopeId: "learner-scope-0001" };
    const serialization = serializeOutboundCorpusRequest(contaminated);
    expect(serialization.ok).toBe(false);
    expect(serialization).not.toHaveProperty("body");
    expect(() => assertOutboundCorpusRequest(contaminated)).toThrow(OutboundCorpusRequestRejected);
  });

  it("does not strip: the rejected value still contains the forbidden field afterwards", () => {
    const contaminated: Record<string, unknown> = {
      ...cleanDiscoveryRequest,
      learnerId: "learner-0001",
    };
    expect(serializeOutboundCorpusRequest(contaminated).ok).toBe(false);
    // A stripping implementation would have mutated the input or produced a cleaned copy. Neither
    // happened: the caller's value is untouched and no cleaned body exists to send.
    expect(contaminated.learnerId).toBe("learner-0001");
    expect(findForbiddenOutboundFields(contaminated)).toHaveLength(1);
  });

  it("rejects an unknown-but-not-forbidden field too, as a shape error rather than silently", () => {
    const serialization = serializeOutboundCorpusRequest({
      ...cleanDiscoveryRequest,
      someUnmodelledExtension: 1,
    });
    expect(serialization.ok).toBe(false);
    if (serialization.ok) return;
    expect(serialization.findings.every((finding) => !finding.forbiddenField)).toBe(true);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Part 5 (byte half) — zero calls and zero learner-data bytes
 * ---------------------------------------------------------------------------------------------- */

interface RecordedOffer {
  readonly body: string;
  readonly bytes: number;
}

/**
 * An instrumented transport that records **every byte offered to it**, not merely how many times it
 * was called. One call carrying a learner id is the whole failure, so the assertion has to be over
 * bytes.
 */
class RecordingTransport {
  public readonly offers: RecordedOffer[] = [];

  public get calls(): number {
    return this.offers.length;
  }

  public get bytes(): number {
    return this.offers.reduce((total, offer) => total + offer.bytes, 0);
  }

  public send(body: string): void {
    this.offers.push({ body, bytes: Buffer.byteLength(body, "utf8") });
  }
}

/** The only path to bytes: validate first, then offer. This mirrors the worker-side client. */
function offer(transport: RecordingTransport, request: unknown): void {
  transport.send(assertOutboundCorpusRequest(request));
}

describe("P05-BOUNDARY-001 zero learner-data bytes", () => {
  it("offers zero calls and zero bytes when a request carries learner data", () => {
    const transport = new RecordingTransport();
    const learnerShapedRequests = [
      { ...cleanDiscoveryRequest, learnerScopeId: "learner-scope-0001" },
      { ...cleanPracticeSpec, exposureHistory: ["family-0001"] },
      { ...cleanPracticeSpec, freshnessFamilyExclusions: ["family-0001", "family-0002"] },
      { ...cleanPracticeSpec, readiness: { state: "safe" } },
      { ...cleanPracticeSpec, topicConstraints: { include: [], exclude: [], note: "free text" } },
    ];
    for (const request of learnerShapedRequests) {
      expect(() => offer(transport, request)).toThrow(OutboundCorpusRequestRejected);
    }
    expect(transport.calls).toBe(0);
    expect(transport.bytes).toBe(0);
  });

  it("carries no learner identifier in the bytes of a request that is permitted", () => {
    const transport = new RecordingTransport();
    offer(transport, cleanDiscoveryRequest);
    offer(transport, cleanPracticeSpec);
    expect(transport.calls).toBe(2);
    expect(transport.bytes).toBeGreaterThan(0);
    for (const offered of transport.offers) {
      expect(findForbiddenOutboundFields(JSON.parse(offered.body))).toEqual([]);
      for (const field of forbiddenOutboundFieldNames) {
        expect(offered.body).not.toContain(`"${field}"`);
      }
    }
  });
});

/* ------------------------------------------------------------------------------------------------
 * Parts 1 and 2 — the module-graph assertion
 * ---------------------------------------------------------------------------------------------- */

const repositoryRoot = path.resolve(import.meta.dirname, "..", "..", "..");

/**
 * The modules a learner route may never reach, transitively. This list is the rule `T11` wires into
 * `scripts/check-boundaries.mjs`; the assertions below are its specification and its test.
 */
export const corpusRestrictedModulePaths: readonly string[] = [
  "packages/content/src/corpus/client.ts",
  "packages/content/src/corpus/bundle-reader.ts",
  "packages/content/src/corpus/import.ts",
];

/** Roots whose transitive import graph must contain none of the restricted modules. */
export const corpusForbiddenReachabilityRoots: readonly string[] = ["apps/web"];

const skippedDirectories = new Set(["dist", "node_modules", ".next", "coverage", "test-results"]);

async function collectSourceFiles(directory: string): Promise<readonly string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const collected: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (skippedDirectories.has(entry.name)) continue;
      collected.push(...(await collectSourceFiles(entryPath)));
    } else if (/\.(?:ts|tsx|mts|mjs)$/.test(entry.name)) {
      collected.push(entryPath);
    }
  }
  return collected;
}

const workspaceEntryPoints: Readonly<Record<string, string>> = {
  "@bestehen/application": "packages/application/src/index.ts",
  "@bestehen/configuration": "packages/configuration/src/index.ts",
  "@bestehen/content": "packages/content/src/index.ts",
  "@bestehen/contracts": "packages/contracts/src/index.ts",
  "@bestehen/design-system": "packages/design-system/src/index.ts",
  "@bestehen/domain": "packages/domain/src/index.ts",
  "@bestehen/infrastructure": "packages/infrastructure/src/index.ts",
  "@bestehen/infrastructure/postgres": "packages/infrastructure/src/postgres/index.ts",
  "@bestehen/test-support": "packages/test-support/src/index.ts",
};

/** Resolves one import specifier to a repository-relative source path, or `null` if it leaves the graph. */
function resolveSpecifier(fromRelative: string, specifier: string): string | null {
  const workspaceEntry = workspaceEntryPoints[specifier];
  if (workspaceEntry !== undefined) return workspaceEntry;
  if (specifier.startsWith("@/")) {
    return `apps/web/src/${specifier.slice(2)}`.replace(/\.js$/, ".ts");
  }
  if (!specifier.startsWith(".")) return null;
  const resolved = path
    .normalize(path.join(path.dirname(fromRelative), specifier))
    .replace(/\\/g, "/");
  return resolved.replace(/\.js$/, ".ts");
}

const importPattern = /(?:^|[\s;{(=])(?:import|export)\s+(?:[^'"]*?from\s*)?["']([^"']+)["']/gm;
const dynamicImportPattern = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

async function buildImportGraph(): Promise<ReadonlyMap<string, readonly string[]>> {
  const graph = new Map<string, readonly string[]>();
  for (const top of ["apps", "packages"]) {
    for (const absolute of await collectSourceFiles(path.join(repositoryRoot, top))) {
      const relative = path.relative(repositoryRoot, absolute).replace(/\\/g, "/");
      const source = await readFile(absolute, "utf8");
      const specifiers = new Set<string>();
      for (const pattern of [importPattern, dynamicImportPattern]) {
        pattern.lastIndex = 0;
        for (const match of source.matchAll(pattern)) {
          const resolved = resolveSpecifier(relative, match[1] ?? "");
          if (resolved !== null) specifiers.add(resolved);
        }
      }
      graph.set(relative, [...specifiers]);
    }
  }
  return graph;
}

function reachableFrom(
  graph: ReadonlyMap<string, readonly string[]>,
  roots: readonly string[],
): ReadonlySet<string> {
  const seen = new Set<string>();
  const queue = [...roots];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || seen.has(current)) continue;
    seen.add(current);
    // A specifier that names a directory index, or that this resolver cannot place, contributes no
    // edge — which is why the positive assertion below exists: it proves the resolver finds real
    // edges rather than quietly finding nothing.
    for (const next of graph.get(current) ?? []) queue.push(next);
  }
  return seen;
}

describe("P05-BOUNDARY-001 module graph", () => {
  it("names restricted modules that actually exist", async () => {
    const graph = await buildImportGraph();
    for (const restricted of corpusRestrictedModulePaths) {
      expect(graph.has(restricted), `${restricted} is named by the rule but absent`).toBe(true);
    }
  });

  it("proves the resolver finds real edges: the import tooling does reach the bundle reader", async () => {
    const graph = await buildImportGraph();
    const reachable = reachableFrom(graph, ["packages/content/src/corpus/import.ts"]);
    expect(reachable).toContain("packages/content/src/corpus/bundle-reader.ts");
    expect(reachable).toContain("packages/content/src/corpus/client.ts");
  });

  it("no module under apps/web reaches the Corpus client or the bundle reader", async () => {
    const graph = await buildImportGraph();
    const restricted = new Set(corpusRestrictedModulePaths);
    const violations: string[] = [];
    for (const [module] of graph) {
      if (!corpusForbiddenReachabilityRoots.some((root) => module.startsWith(`${root}/`))) continue;
      for (const reached of reachableFrom(graph, [module])) {
        if (restricted.has(reached)) violations.push(`${module} -> ${reached}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("no module under apps/web names a Corpus host, credential or transport identifier", async () => {
    const webFiles = await collectSourceFiles(path.join(repositoryRoot, "apps", "web"));
    const offenders: string[] = [];
    for (const absolute of webFiles) {
      const source = await readFile(absolute, "utf8");
      if (/CORPUS_[A-Z_]+|corpus:\/\/|corpusTransport|CorpusTransport/.test(source)) {
        offenders.push(path.relative(repositoryRoot, absolute));
      }
    }
    expect(offenders).toEqual([]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Part 3 — recorded as unclaimed
 * ---------------------------------------------------------------------------------------------- */

describe("P05-BOUNDARY-001 egress denial", () => {
  it("is recorded as a Stage 10 deployment obligation and is not claimed here", () => {
    // There is no live Corpus host in the personal profile. "No host exists" is not "a policy
    // denies the host", and this suite must never be read as evidence of the latter. The claim is
    // deliberately left to Stage 10; this assertion exists so the omission is explicit rather than
    // silent, and so a future reader cannot mistake a green run for an egress proof.
    const egressDenialClaimed = false;
    expect(egressDenialClaimed).toBe(false);
  });
});
