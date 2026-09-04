import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { jobEnvelopeSchema } from "@bestehen/contracts";
import { attemptRuntimeStates, reasonRegistryRelease, reasonRegistryV1 } from "@bestehen/domain";
import type { Pool } from "pg";
import { describe, expect, it } from "vitest";
import {
  contentImpactRecomputeJobPolicy,
  contentPublicationJobPolicy,
  contentQueues,
  foundationJobPolicy,
  foundationQueues,
  jobPolicyFor,
} from "./jobs/index.js";
import { checkSchemaCompatibility } from "./postgres/index.js";
import {
  foundationMigrations,
  foundationRevision,
  migrationChecksums,
  migrationSources,
  reasonRegistryV1Frozen,
  stage05BindingRevision,
  stage05MediaRevision,
  stage05Revision,
  stage05RuntimeRevision,
} from "./postgres/migrations.js";

const stage03Revisions = [
  "20260825_010_identity_release",
  "20260825_020_learner_facts_evidence",
  "20260825_030_jobs_audit_rights",
  foundationRevision,
] as const;

const stage05Revisions = [
  "20260901_051_content_graph",
  "20260901_052_attempt_runtime",
  "20260901_053_content_impact",
  stage05RuntimeRevision,
  "20260904_055_listening_media",
  stage05MediaRevision,
  "20260904_057_listening_bindings",
  stage05BindingRevision,
  "20260904_059_transcript_lineage",
  stage05Revision,
] as const;

/**
 * The twelve inherited sources are immutable. `verifyMigrationChecksums` reads changes as drift
 * against every already-migrated database, so their digests are pinned here rather than merely
 * recomputed from whatever the file happens to say.
 */
const pinnedInheritedChecksums: Readonly<Record<string, string>> = {
  "20260825_010_identity_release":
    "492696d82a1d71fc4d6a0fe2f040385c7e01da32588979f4a35fc4dfa04c6c5f",
  "20260825_020_learner_facts_evidence":
    "a1a60b0993a8bc49328a8ab48ae573c94c1714addd1070043cd3089a3a8f8c9a",
  "20260825_030_jobs_audit_rights":
    "bdd9a303b9863d7f229783c6f7f695d33417a8926921c5047ba98204f2512a43",
  [foundationRevision]: "d1d7506c18586aa92b212eb326069fd1062248e10c792d68b8a8704b30037c34",
  "20260901_051_content_graph": "3d0d1db7db03d80ff9b4e1e498ab670333c97aa3f5e2e2ce8e58e75bfcd685b3",
  "20260901_052_attempt_runtime":
    "f722b0b967e4ab24238292d6ebe84d24f4a531c417f8933dab6a51ae20539dfa",
  "20260901_053_content_impact": "9ff8eeec389baca2c554d8ebbb9d1b2b9e9f26facef231045651b544db3a3930",
  [stage05RuntimeRevision]: "5ac221927f00abb96c2e615b73a4b315d859e70b6e0c6a622343b58ba82710da",
  "20260904_055_listening_media":
    "1802231b3936d69745d67d377dd9ca92c888d4c9201322559366236def799baa",
  [stage05MediaRevision]: "c84c0284e31baeadd3ad012453f2b96bec715bb5725739bab785bcee650ff190",
  "20260904_057_listening_bindings":
    "17069b8b64ae92130c771c4beb1a294e6f549e8779032b06f2cc07c9f28fd44a",
  [stage05BindingRevision]: "67751745126fd61feb0a300e222a865ee9c1f5d1ab5935332ffbaea8e5cb0b37",
};

function source(revision: string): string {
  const value = (migrationSources as Readonly<Record<string, string>>)[revision];
  if (value === undefined) throw new Error(`no migration source for ${revision}`);
  return value;
}

describe("Stage 05 migration registration", () => {
  it("appends the Stage 05 revisions after the Stage 03 four and ends at the terminal revision", () => {
    const registered = Object.keys(foundationMigrations);
    expect(registered).toEqual([...stage03Revisions, ...stage05Revisions]);
    expect(registered.at(-1)).toBe(stage05Revision);
    // `kysely`'s Migrator runs insertion order and `checkSchemaCompatibility` builds its ordinal
    // list from these keys, so the source map and the migration map must agree exactly.
    expect(Object.keys(migrationSources)).toEqual(registered);
    expect(Object.keys(migrationChecksums)).toEqual(registered);
  });

  it("P05-MEDIA-001 leaves all twelve inherited migration sources byte-identical", () => {
    for (const [revision, digest] of Object.entries(pinnedInheritedChecksums)) {
      expect(migrationChecksums[revision]).toBe(digest);
    }
  });

  it("keeps the compatibility window ordered with the Stage 03 revision as a legal minimum", () => {
    const revisions = ["baseline", ...Object.keys(foundationMigrations)];
    expect(revisions.indexOf(foundationRevision)).toBeLessThan(revisions.indexOf(stage05Revision));
  });

  it("never destroys or narrows a Stage 03 relation", () => {
    for (const revision of stage05Revisions) {
      const sql = source(revision);
      expect(sql).not.toMatch(/DROP\s+TABLE/i);
      expect(sql).not.toMatch(/DROP\s+COLUMN/i);
      expect(sql).not.toMatch(/DELETE\s+FROM/i);
      expect(sql).not.toMatch(/DROP\s+TRIGGER/i);
    }
  });
});

describe("D06 attempt state reconciliation", () => {
  const runtimeSql = source("20260901_052_attempt_runtime");

  it("replaces the CHECK with exactly the eleven runtime states, in the domain's order", () => {
    const clause = runtimeSql.match(
      /ADD CONSTRAINT attempts_state_check CHECK\(state IN \(([\s\S]*?)\)\)/,
    )?.[1];
    expect(clause).toBeDefined();
    const declared = [...(clause as string).matchAll(/'([a-z_]+)'/g)].map((match) => match[1]);
    expect(declared).toEqual([...attemptRuntimeStates]);
    expect(declared).not.toContain("not_counted");
    expect(declared).not.toContain("started");
    expect(declared).not.toContain("completed");
  });

  it("drops the old constraint, rewrites existing rows, then adds the new constraint", () => {
    // The order matters and is not the plan's literal one: `in_progress` and `result_available` are
    // not in the Stage 03 union, so the rewrite fails with 23514 while the old CHECK still stands.
    const dropOld = runtimeSql.indexOf("conrelid='app.attempts'::regclass");
    const renameStarted = runtimeSql.indexOf("SET state='in_progress' WHERE state='started'");
    const renameCompleted = runtimeSql.indexOf(
      "SET state='result_available' WHERE state='completed'",
    );
    const moveNotCounted = runtimeSql.indexOf("SET state='interrupted' WHERE state='not_counted'");
    const replaceConstraint = runtimeSql.indexOf("ADD CONSTRAINT attempts_state_check");
    expect(dropOld).toBeGreaterThan(-1);
    for (const rewrite of [renameStarted, renameCompleted, moveNotCounted]) {
      expect(rewrite).toBeGreaterThan(dropOld);
      expect(rewrite).toBeLessThan(replaceConstraint);
    }
  });

  it("moves the meaning of not_counted into validity rather than dropping it", () => {
    expect(runtimeSql).toContain("INSERT INTO app.validity_assertions");
    expect(runtimeSql).toContain("'not_counted'");
    expect(runtimeSql).toContain("VALIDITY.RESPONSE_STRUCTURALLY_INVALID");
    expect(runtimeSql).toContain(reasonRegistryRelease.id);
    // The appended assertion becomes the current one, so the chain stays readable.
    expect(runtimeSql).toContain("UPDATE app.evidence_observations o SET current_assertion_id");
  });

  it("resolves each replaced constraint by name and fails loudly when it is absent", () => {
    for (const revision of ["20260901_052_attempt_runtime", "20260901_053_content_impact"]) {
      const sql = source(revision);
      expect(sql).toContain("FROM pg_constraint");
      expect(sql).toMatch(/IF target IS NULL THEN RAISE EXCEPTION/);
    }
  });
});

describe("validity partition widening", () => {
  const runtimeSql = source("20260901_052_attempt_runtime");

  it("relaxes only the pending arm and still requires a non-empty affected scope", () => {
    const clause = runtimeSql.match(
      /ADD CONSTRAINT validity_assertions_partition_check CHECK\(([\s\S]*?)\n\);/,
    )?.[1];
    expect(clause).toBeDefined();
    expect(clause).toContain("state NOT IN ('partially_valid','pending')");
    expect(clause).toContain("jsonb_array_length(affected_scope)>0");
    // `partially_valid` keeps both halves of the partition; only `pending` may be whole-scope.
    expect(clause).toContain("state='pending' OR jsonb_array_length(unaffected_scope)>0");
    expect(clause).not.toContain("state='partially_valid' OR");
  });
});

describe("registry and terminal source placement", () => {
  it("keeps the reason-registry release out of the terminal source", () => {
    const terminal = source(stage05Revision);
    expect(terminal).not.toMatch(/CREATE\s+TABLE/i);
    expect(terminal).not.toContain("reason_codes");
    expect(terminal).toContain(stage05Revision);
    expect(terminal).toContain("ON CONFLICT (revision) DO NOTHING");
  });

  it("widens the job-kind CHECK without removing a Stage 03 kind", () => {
    const clause = source("20260901_053_content_impact").match(
      /ADD CONSTRAINT job_resources_kind_check CHECK\(kind IN \(([\s\S]*?)\)\)/,
    )?.[1];
    expect(clause).toBeDefined();
    const declared = [...(clause as string).matchAll(/'([a-z0-9_]+)'/g)].map((match) => match[1]);
    expect(declared).toEqual([
      "projection_rebuild_v1",
      "outbox_dispatch_v1",
      "rights_reconcile_v1",
      "content_publication_v1",
      "content_impact_recompute_v1",
    ]);
  });
});

describe("reason-registry/v1 membership is frozen", () => {
  /**
   * Pinned from the Stage 03 tree (`git show 3382938:packages/domain/src/index.ts`), which is what
   * every already-migrated database actually holds in `app.reason_registry_releases`.
   */
  const stage03RegistryDigest = "6bbbae970376a3531524fe4a1bb199d43ba3b5b5ccd9e6a7c1fe4f75e34e950f";

  it("seeds exactly the 43 Stage 03 codes, whatever the live registry grows to", () => {
    expect(reasonRegistryV1Frozen).toHaveLength(43);
    expect(reasonRegistryV1.length).toBeGreaterThan(reasonRegistryV1Frozen.length);
    expect(reasonRegistryV1Frozen.every((reason) => reasonRegistryV1.includes(reason))).toBe(true);
  });

  it("reproduces the digest a Stage 03 database already recorded for v1", () => {
    const digest = createHash("sha256")
      .update(JSON.stringify(reasonRegistryV1Frozen))
      .digest("hex");
    expect(digest).toBe(stage03RegistryDigest);
  });

  it("keeps v1 and v1.1 distinct release identities with distinct digests", () => {
    const v1 = createHash("sha256").update(JSON.stringify(reasonRegistryV1Frozen)).digest("hex");
    const v11 = createHash("sha256")
      .update(JSON.stringify({ release: reasonRegistryRelease, codes: reasonRegistryV1 }))
      .digest("hex");
    expect(reasonRegistryRelease.id).toBe("reason-registry/v1.1");
    expect(v11).not.toBe(v1);
  });

  it("seeds v1 from the frozen list rather than the live registry", () => {
    // The seed callback is not part of the checksummed source, so no checksum can catch a
    // regression here. The `010` block is read from the module text instead.
    const module = readFileSync(new URL("./postgres/migrations.ts", import.meta.url), "utf8");
    // Both revision names also appear in `migrationSources`, so the search starts at the migration
    // map itself rather than at the first occurrence in the file.
    const mapStart = module.indexOf("export const foundationMigrations");
    const start = module.indexOf('"20260825_010_identity_release": immutableMigration', mapStart);
    const end = module.indexOf('"20260825_020_learner_facts_evidence"', start);
    expect(mapStart).toBeGreaterThan(0);
    expect(start).toBeGreaterThan(mapStart);
    expect(end).toBeGreaterThan(start);
    const block = module.slice(start, end);
    expect(block).toContain("reasonRegistryV1Frozen");
    expect(block).not.toMatch(/\breasonRegistryV1\b(?!Frozen)/);
  });
});

interface StubRow {
  readonly revision: string;
  readonly checksum: string;
}

function stubPool(observed: string, recorded: readonly StubRow[]): Pool {
  return {
    async query(text: string) {
      if (text.includes("public.kysely_migration")) {
        return { rows: [{ migration_table: "kysely_migration" }] };
      }
      if (text.includes("FROM kysely_migration")) return { rows: [{ name: observed }] };
      if (text.includes("app.schema_revisions")) {
        return text.includes("to_regclass")
          ? { rows: [{ relation: "app.schema_revisions" }] }
          : { rows: [...recorded] };
      }
      return { rows: [] };
    },
  } as unknown as Pool;
}

const consistentRows: readonly StubRow[] = Object.entries(migrationChecksums).map(
  ([revision, checksum]) => ({ revision, checksum }),
);

describe("checksum verification at the Stage 05 revision", () => {
  it("P05-MEDIA-001 fails closed with the unchanged pre-Listening maximum revision", async () => {
    await expect(
      checkSchemaCompatibility(
        stubPool(stage05Revision, consistentRows),
        foundationRevision,
        stage05RuntimeRevision,
      ),
    ).resolves.toMatchObject({ compatible: false, observedRevision: stage05Revision });
  });
  it("reports the Stage 05 revision compatible inside the P03..P05 window", async () => {
    await expect(
      checkSchemaCompatibility(
        stubPool(stage05Revision, consistentRows),
        foundationRevision,
        stage05Revision,
      ),
    ).resolves.toEqual({
      compatible: true,
      observedRevision: stage05Revision,
      minimumRevision: foundationRevision,
      maximumRevision: stage05Revision,
    });
  });

  it("detects drift at the Stage 05 revision, which the pre-fix guard could not see", async () => {
    const drifted = consistentRows.map((row) =>
      row.revision === stage05Revision ? { ...row, checksum: "f".repeat(64) } : row,
    );
    // The defect: verification used to run only when `revision === foundationRevision`. At the
    // Stage 05 revision that predicate is false, so the drifted row below was silently accepted.
    const observed: string = stage05Revision;
    expect(observed).not.toBe(foundationRevision);
    await expect(
      checkSchemaCompatibility(
        stubPool(stage05Revision, drifted),
        foundationRevision,
        stage05Revision,
      ),
    ).resolves.toMatchObject({ compatible: false, observedRevision: "drifted" });
  });

  it("still detects drift at the Stage 03 revision", async () => {
    const drifted = consistentRows.map((row) =>
      row.revision === foundationRevision ? { ...row, checksum: "f".repeat(64) } : row,
    );
    await expect(
      checkSchemaCompatibility(
        stubPool(foundationRevision, drifted),
        foundationRevision,
        stage05Revision,
      ),
    ).resolves.toMatchObject({ compatible: false, observedRevision: "drifted" });
  });

  it("skips verification for a database that has never been migrated", async () => {
    const pool = {
      async query(text: string) {
        if (text.includes("public.kysely_migration")) return { rows: [{ migration_table: null }] };
        throw new Error("no further query is expected for an uninitialized database");
      },
    } as unknown as Pool;
    await expect(
      checkSchemaCompatibility(pool, foundationRevision, stage05Revision),
    ).resolves.toMatchObject({ compatible: false, observedRevision: "uninitialized" });
  });
});

describe("Stage 05 queue policy", () => {
  it("registers exactly the two content queues after the Stage 03 three", () => {
    expect(foundationQueues).toEqual([
      "projection_rebuild_v1",
      "outbox_dispatch_v1",
      "rights_reconcile_v1",
      "content_publication_v1",
      "content_impact_recompute_v1",
    ]);
    expect(contentQueues.every((queue) => foundationQueues.includes(queue))).toBe(true);
  });

  it("agrees with the job envelope kinds and the job_resources CHECK", () => {
    const wireKinds = jobEnvelopeSchema.shape.kind.options;
    expect([...wireKinds].sort()).toEqual([...foundationQueues].sort());
    const clause = source("20260901_053_content_impact").match(
      /ADD CONSTRAINT job_resources_kind_check CHECK\(kind IN \(([\s\S]*?)\)\)/,
    )?.[1];
    const declared = [...(clause as string).matchAll(/'([a-z0-9_]+)'/g)].map((match) => match[1]);
    expect(declared).toEqual([...foundationQueues]);
  });

  it("leaves every Stage 03 queue on the unchanged foundation policy", () => {
    for (const queue of [
      "projection_rebuild_v1",
      "outbox_dispatch_v1",
      "rights_reconcile_v1",
    ] as const) {
      expect(jobPolicyFor(queue)).toBe(foundationJobPolicy);
    }
    expect(foundationJobPolicy.leaseSeconds).toBe(30);
    expect(foundationJobPolicy.retentionDays).toBe(7);
  });

  it("gives publication a lease long enough for the gates, digests and media render", () => {
    const policy = jobPolicyFor("content_publication_v1");
    expect(policy).toBe(contentPublicationJobPolicy);
    expect(policy.leaseSeconds).toBeGreaterThan(foundationJobPolicy.leaseSeconds);
    expect(policy.leaseSeconds).toBeLessThan(policy.hardDeadlineSeconds);
    expect(policy.heartbeatSeconds).toBeLessThan(policy.leaseSeconds);
    // An audit-bearing job keeps its receipt long enough to be reviewed.
    expect(policy.retentionDays).toBeGreaterThan(foundationJobPolicy.retentionDays);
  });

  it("gives recompute a lease between the foundation and publication policies", () => {
    const policy = jobPolicyFor("content_impact_recompute_v1");
    expect(policy).toBe(contentImpactRecomputeJobPolicy);
    expect(policy.leaseSeconds).toBeGreaterThan(foundationJobPolicy.leaseSeconds);
    expect(policy.leaseSeconds).toBeLessThan(contentPublicationJobPolicy.leaseSeconds);
    expect(policy.heartbeatSeconds).toBeLessThan(policy.leaseSeconds);
  });

  it("keeps the retry limit inside the maximum_attempts CHECK for every queue", () => {
    for (const queue of foundationQueues) {
      const policy = jobPolicyFor(queue);
      expect(policy.retryLimit).toBeGreaterThanOrEqual(1);
      expect(policy.retryLimit).toBeLessThanOrEqual(20);
      expect(policy.concurrency).toBe(1);
      expect(policy.retryBackoff).toBe(true);
    }
  });
});
