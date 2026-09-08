import { randomUUID } from "node:crypto";
import {
  audioCatalogueValidator,
  canonicalDigest,
  type TaskFamily,
  type SafeContentNode,
} from "@bestehen/content";
import { appId } from "@bestehen/domain";
import {
  appSessionCookie,
  createPostgresPool,
  HmacDigest,
  migrateDatabase,
  PostgresContentRepository,
  PostgresFoundationRepository,
  PostgresMediaCatalogue,
} from "@bestehen/infrastructure";
import { test as base, expect, type BrowserContext } from "@playwright/test";
import { syntheticSpeech } from "../src/server/media-catalogue.test.fixture";

export const publicOrigin = "https://app.bestehen.test:3300";
export const jsonHeaders = {
  "content-type": "application/json",
  origin: publicOrigin,
  "sec-fetch-site": "same-origin",
  "sec-fetch-mode": "cors",
  "x-bestehen-csrf": "1",
};
type Pool = ReturnType<typeof createPostgresPool>;
type WrittenFamily =
  | "R1HeadingMatching"
  | "R2DetailedSelect"
  | "R3SituationNoticeMatching"
  | "SB2SharedBankLexicalCloze";
const text = (value: string): SafeContentNode[] => [{ kind: "inline_text", text: value }];
const stimulus = (id: string, label: string) => ({
  stimulusId: id,
  language: "de" as const,
  genreDomainRegister: "browser-test-only",
  safeContentNodes: text(label),
  evidenceAnchorIds: [],
});
const option = (id: string, label: string) => ({
  optionId: id,
  learnerSafeLabel: text(label),
  positionIsPresentationOnly: true as const,
});

export interface BrowserAttempt {
  id: string;
  revision: string;
  manifest: string;
  itemIds: string[];
  kind: WrittenFamily;
}
export interface BrowserListeningAttempt {
  id: string;
  revision: string;
  manifest: string;
  itemIds: string[];
}
export class OwnerFixture {
  readonly scopeId = randomUUID();
  readonly principalId = randomUUID();
  readonly sessionId = randomUUID();
  readonly activityId = randomUUID();
  appSessionId = "";
  constructor(
    readonly pool: Pool,
    readonly context: BrowserContext,
  ) {}

  async provision() {
    await this.pool.query("INSERT INTO app.learner_scopes(id,state) VALUES($1,'active')", [
      this.scopeId,
    ]);
    await this.pool.query(
      "INSERT INTO app.principals(id,kind,state) VALUES($1,'account','active')",
      [this.principalId],
    );
    await this.pool.query(
      "INSERT INTO app.credential_bindings(id,principal_id,kind,provider,issuer,subject,subject_fingerprint,state,verified_at,identity_release) VALUES($1,$2,'oidc','test-only','https://identity.example.invalid',$3,$4,'active',now(),'identity/test-only')",
      [randomUUID(), this.principalId, this.principalId, canonicalDigest(this.principalId)],
    );
    await this.pool.query(
      "INSERT INTO app.principal_scope_bindings(principal_id,learner_scope_id,state,operation_id) VALUES($1,$2,'active',$3)",
      [this.principalId, this.scopeId, randomUUID()],
    );
    const plan = randomUUID();
    await this.pool.query(
      "INSERT INTO app.plan_revisions(id,learner_scope_id,source_cut,policy_release,reason_release,template_release,content_release,intents,reasons,checksum) VALUES($1,$2,1,'policy/foundation','reason-registry/v1','template/foundation','content/browser-test-only','[]','[]',$3)",
      [plan, this.scopeId, canonicalDigest(plan)],
    );
    await this.pool.query(
      "INSERT INTO app.sessions(id,learner_scope_id,plan_revision_id,state) VALUES($1,$2,$3,'active')",
      [this.sessionId, this.scopeId, plan],
    );
    await this.pool.query(
      "INSERT INTO app.activity_occurrences(id,learner_scope_id,session_id,operation_id,state,resource_version) VALUES($1,$2,$3,$4,'active',1)",
      [this.activityId, this.scopeId, this.sessionId, randomUUID()],
    );
    await this.pool.query(
      "INSERT INTO app.coaching_episodes(id,learner_scope_id,activity_occurrence_id,state,resource_version) VALUES($1,$2,$3,'active',1)",
      [randomUUID(), this.scopeId, this.activityId],
    );
    await this.renewSession();
  }

  async renewSession() {
    const token = randomUUID() + randomUUID();
    const now = new Date();
    this.appSessionId = randomUUID();
    await new PostgresFoundationRepository(this.pool).insert({
      id: appId(this.appSessionId),
      tokenDigest: new HmacDigest(
        process.env.BESTEHEN_AUTH0_SESSION_SECRET ??
          "synthetic-local-only-session-secret-not-for-deployment",
      ).digest("app-session", token),
      principalId: appId(this.principalId),
      learnerScopeId: appId(this.scopeId),
      state: "active",
      createdAt: now,
      lastUsedAt: now,
      authenticatedAt: now,
      idleExpiresAt: new Date(now.getTime() + 3_600_000),
      absoluteExpiresAt: new Date(now.getTime() + 7_200_000),
    });
    await this.context.addCookies([
      {
        name: appSessionCookie.name,
        value: token,
        url: `${publicOrigin}/`,
        secure: true,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    const status = await this.context.request.get(`${publicOrigin}/api/v1/owner/status`);
    expect(status.status()).toBe(200);
    expect(await status.json()).toMatchObject({ status: "completed", owner: { state: "active" } });
    expect(
      (await this.context.cookies()).find((cookie) => cookie.name === appSessionCookie.name),
    ).toMatchObject({
      domain: "app.bestehen.test",
      secure: true,
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
    });
  }

  async expireSession() {
    await this.pool.query(
      "UPDATE app.app_sessions SET idle_expires_at=now()-interval '1 second' WHERE id=$1",
      [this.appSessionId],
    );
  }

  /** Synthetic test content and approval rows. Never imports or approves the authored seed corpus. */
  async createAttempt(kind: WrittenFamily = "R2DetailedSelect"): Promise<BrowserAttempt> {
    const family = randomUUID(),
      revision = randomUUID(),
      rights = randomUUID(),
      manifest = randomUUID();
    const itemIds = [randomUUID(), randomUUID()];
    const keys = itemIds.map(() => randomUUID());
    const constraints = {
      leftCardinality: { min: 1, max: 1 },
      rightReusePolicy: "at_most_once" as const,
      unmatchedPolicy: "forbidden" as const,
      completionRule: "all_left_bound" as const,
    };
    let payload: TaskFamily;
    if (kind === "R1HeadingMatching")
      payload = {
        kind,
        texts: [
          stimulus("left-1", "Der Zug fährt nach Berlin."),
          stimulus("left-2", "Das Museum öffnet um neun Uhr."),
        ],
        headings: [option("choice-1", "Eine Reise"), option("choice-2", "Ein Besuch")],
        matchConstraints: constraints,
        itemBindings: itemIds.map((itemRef, i) => ({ itemRef, leftId: `left-${i + 1}` })),
      };
    else if (kind === "R3SituationNoticeMatching")
      payload = {
        kind,
        situations: [
          { promptId: "left-1", safeContentNodes: text("Sie suchen einen Zug.") },
          { promptId: "left-2", safeContentNodes: text("Sie möchten Kunst sehen.") },
        ],
        notices: [
          stimulus("choice-1", "Züge nach Berlin fahren täglich."),
          stimulus("choice-2", "Das Museum ist geöffnet."),
        ],
        matchConstraints: constraints,
        itemBindings: itemIds.map((itemRef, i) => ({ itemRef, leftId: `left-${i + 1}` })),
      };
    else if (kind === "SB2SharedBankLexicalCloze")
      payload = {
        kind,
        connectedText: {
          ...stimulus("text", "Wir fahren heute nach Berlin. Dort besuchen wir ein Museum."),
          connected: true,
        },
        gaps: itemIds.map((itemRef, i) => ({ itemRef, gapId: `gap-${i + 1}` })),
        candidateBank: [option("choice-1", "heute"), option("choice-2", "dort")],
        candidateReusePolicy: "at_most_once",
      };
    else
      payload = {
        kind,
        stimulus: stimulus(
          "text",
          "Der Zug fährt heute nach Berlin. Das Museum öffnet um neun Uhr.",
        ),
        questions: itemIds.map((itemRef, i) => ({
          itemRef,
          questionId: `question-${i + 1}`,
          questionNodes: text(i === 0 ? "Wohin fährt der Zug?" : "Wann öffnet das Museum?"),
          options: [option("choice-1", "Berlin"), option("choice-2", "Um neun Uhr")],
        })),
      };
    const instruction = {
      instructionId: `browser-${kind}`,
      locale: "de",
      safeContentNodes: text("Lesen Sie den Text und wählen Sie die Antworten."),
      responseMechanic:
        kind === "R2DetailedSelect"
          ? "single_select"
          : kind === "SB2SharedBankLexicalCloze"
            ? "cloze_shared_bank"
            : "match_select_then_place",
      helpPolicy: { offerableAssistanceKinds: [] },
      learnerFacingTimingLabel: "Übungszeit",
    };
    await this.pool.query(
      "INSERT INTO app.content_families(id,family_key,task_family_kind) VALUES($1,$2,$3)",
      [family, `browser-test-only/${family}`, kind],
    );
    await this.pool.query(
      "INSERT INTO app.rights_envelopes(id,envelope_key,state,envelope,digest) VALUES($1,$2,'current','{}',$3)",
      [rights, `browser-test-only/${rights}`, canonicalDigest(rights)],
    );
    await this.pool.query(
      "INSERT INTO app.content_revisions(id,family_id,revision,role,approval_state,rights_state,compatibility_state,digest,content_class,rights_envelope_id,learner_payload,instruction,progression_profile) VALUES($1,$2,'browser-test-only-v1','task','approved','eligible','compatible',$3,'C3',$4,$5,$6,'P2')",
      [
        revision,
        family,
        canonicalDigest(payload),
        rights,
        JSON.stringify(payload),
        JSON.stringify(instruction),
      ],
    );
    for (const [i, item] of itemIds.entries()) {
      const responseKind =
        kind === "R2DetailedSelect"
          ? "single_select"
          : kind === "SB2SharedBankLexicalCloze"
            ? "cloze_bank_candidate"
            : "match";
      const binding =
        kind === "R2DetailedSelect"
          ? { kind: "select", questionId: `question-${i + 1}` }
          : kind === "SB2SharedBankLexicalCloze"
            ? { kind: "gap", gapId: `gap-${i + 1}` }
            : { kind: "match", leftId: `left-${i + 1}` };
      const accepted =
        kind === "R2DetailedSelect"
          ? { kind: "option", optionId: `choice-${i + 1}` }
          : kind === "SB2SharedBankLexicalCloze"
            ? { kind: "candidate", gapId: `gap-${i + 1}`, candidateId: `choice-${i + 1}` }
            : { kind: "match", leftId: `left-${i + 1}`, rightId: `choice-${i + 1}` };
      await this.pool.query(
        "INSERT INTO app.content_items(id,content_revision_id,ordinal,response_kind,binding,scorable) VALUES($1,$2,$3,$4,$5,$6)",
        [
          item,
          revision,
          i + 1,
          responseKind,
          JSON.stringify(binding),
          JSON.stringify({
            responseKind,
            responseCardinality: { min: 1, max: 1 },
            keyRevisionId: keys[i],
            scoringPolicyRef: "objective-scoring/v1",
          }),
        ],
      );
      await this.pool.query(
        "INSERT INTO app.key_revisions(id,content_revision_id,content_item_id,accepted_response_set,response_cardinality_min,response_cardinality_max,scoring_policy_ref,decisive_evidence,distractor_rationale,intended_cause_mapping,independent_validation,digest) VALUES($1,$2,$3,$4,1,1,'objective-scoring/v1','{}','{}','{}','{}',$5)",
        [keys[i], revision, item, JSON.stringify([accepted]), canonicalDigest(keys[i])],
      );
    }
    await this.pool.query(
      "INSERT INTO app.serving_manifests(id,learner_scope_id,operation_id,content_class,approval_role,key_revision_digests,allowed_conditions,learner_safe_payload_digest,freshness_decision,compared_family_refs,authorization_version,content_release_identity,issued_at,expires_at,revocation_state,digest) VALUES($1,$2,$3,'C3','training',$4,$5,$6,'fresh','[]','authorization/v1','content/browser-test-only',now(),now()+interval '1 hour','active',$7)",
      [
        manifest,
        this.scopeId,
        randomUUID(),
        JSON.stringify(keys.map(canonicalDigest)),
        JSON.stringify({
          progressionProfile: "P2",
          timingMode: "practice",
          transcriptPhase: "after_attempt",
          offerableAssistanceKinds: [],
        }),
        canonicalDigest(payload),
        canonicalDigest(manifest),
      ],
    );
    for (const [i, item] of itemIds.entries())
      await this.pool.query(
        "INSERT INTO app.serving_manifest_entries(serving_manifest_id,learner_scope_id,ordinal,content_revision_id,content_item_id) VALUES($1,$2,$3,$4,$5)",
        [manifest, this.scopeId, i + 1, revision, item],
      );
    const created = await this.context.request.post(`${publicOrigin}/api/v1/attempts`, {
      headers: jsonHeaders,
      data: {
        contract: { major: 1, minor: 0 },
        operationId: randomUUID(),
        expectedVersion: 0,
        payload: { servingManifestId: manifest, activityOccurrenceId: this.activityId },
      },
    });
    expect(created.status(), await created.text()).toBe(200);
    return { id: (await created.json()).resourceId as string, revision, manifest, itemIds, kind };
  }

  /** Synthetic H2 metadata only. Production byte delivery remains deliberately unavailable. */
  async createListeningAttempt(): Promise<BrowserListeningAttempt> {
    const speech = await syntheticSpeech(
      this.pool,
      `browser-test-only/${randomUUID()}`,
      "C3",
      false,
      "P4",
    );
    const listeningPayload: TaskFamily = {
      kind: "H2ConversationInterview",
      conversation: {
        stimulusId: speech.manifest.stimulusId,
        mediaRevisionId: appId(speech.mediaId),
        language: "de",
        genreDomainRegister: "browser-test-only",
        writtenInstructionNodes: text("Sie hören ein technisches Testsignal."),
        evidenceAnchorIds: [],
      },
      questions: [
        {
          itemRef: speech.itemId,
          questionId: "synthetic-question",
          questionNodes: text("Welche technische Auswahl ist markiert?"),
          options: [option("choice-1", "Auswahl eins"), option("choice-2", "Auswahl zwei")],
        },
      ],
      allowedPlayCount: 2,
    };
    await this.pool.query(
      "UPDATE app.content_revisions SET learner_payload=$2,instruction=$3 WHERE id=$1",
      [
        speech.revisionId,
        listeningPayload,
        {
          instructionId: speech.manifest.instructionTextRevisionId,
          locale: "de",
          safeContentNodes: text("Prüfen Sie zuerst Audio und Ausgabe."),
          responseMechanic: "single_select",
          helpPolicy: { offerableAssistanceKinds: [] },
          learnerFacingTimingLabel: "Übungszeit",
        },
      ],
    );
    await new PostgresMediaCatalogue(this.pool, audioCatalogueValidator).importCatalogue(
      speech.input,
    );
    const release = (
      await this.pool.query(
        "SELECT rel.release_identity FROM app.content_releases rel JOIN app.content_release_entries e ON e.release_id=rel.id WHERE e.content_revision_id=$1",
        [speech.revisionId],
      )
    ).rows[0];
    const material = (
      await this.pool.query(
        "SELECT instruction,learner_payload FROM app.content_revisions WHERE id=$1",
        [speech.revisionId],
      )
    ).rows[0];
    const manifest = randomUUID();
    const issued = await new PostgresContentRepository(
      this.pool,
      audioCatalogueValidator,
    ).issueServingManifest(
      {
        learnerScopeId: appId(this.scopeId),
        principalId: appId(this.principalId),
        actorKind: "owner",
        capabilities: [],
        authenticatedAt: new Date(),
      },
      {
        servingManifestId: appId(manifest),
        operationId: appId(randomUUID()),
        contentClass: "C3",
        approvalRole: "training",
        entries: [
          {
            ordinal: 1,
            contentRevisionId: appId(speech.revisionId),
            contentItemId: appId(speech.itemId),
          },
          ...speech.manifest.learnerMediaRevisions.map((rendition, index) => ({
            ordinal: index + 2,
            contentRevisionId: appId(speech.revisionId),
            mediaRevisionId: appId(rendition.mediaRevisionId),
          })),
        ],
        keyRevisionDigests: [],
        allowedConditions: {
          progressionProfile: "P4",
          timingMode: "practice",
          transcriptPhase: "after_block",
          offerableAssistanceKinds: [],
          audioManifestPins: [
            {
              assetId: speech.assetId,
              manifestRevision: speech.manifest.manifestRevision,
              digest: speech.record.digest,
              contentRevisionId: speech.revisionId,
              stimulusId: speech.manifest.stimulusId,
              mediaRevisionIds: speech.manifest.learnerMediaRevisions
                .map((rendition) => rendition.mediaRevisionId)
                .sort(),
            },
          ],
        },
        learnerSafePayloadDigest: canonicalDigest({
          instruction: material.instruction,
          learnerPayload: material.learner_payload,
        }),
        freshnessDecision: "fresh",
        comparedFamilyRefs: [],
        authorizationVersion: "authorization/v1",
        contentReleaseIdentity: String(release.release_identity),
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 45 * 60_000),
        digest: canonicalDigest(manifest),
      },
    );
    expect(issued.ok).toBe(true);
    const created = await this.context.request.post(`${publicOrigin}/api/v1/attempts`, {
      headers: jsonHeaders,
      data: {
        contract: { major: 1, minor: 0 },
        operationId: randomUUID(),
        expectedVersion: 0,
        payload: { servingManifestId: manifest, activityOccurrenceId: this.activityId },
      },
    });
    expect(created.status(), await created.text()).toBe(200);
    return {
      id: (await created.json()).resourceId as string,
      revision: speech.revisionId,
      manifest,
      itemIds: [speech.itemId],
    };
  }
}

export const test = base.extend<{ owner: OwnerFixture }, { migratedDatabaseUrl: string }>({
  migratedDatabaseUrl: [
    async ({ playwright: _playwright }, use) => {
      const url = process.env.TEST_DATABASE_URL;
      if (!url)
        throw new Error(
          "Authenticated P05 browser acceptance requires TEST_DATABASE_URL; these cases must not be skipped.",
        );
      await migrateDatabase(url);
      await use(url);
    },
    { scope: "worker" },
  ],
  owner: async ({ context, migratedDatabaseUrl }, use) => {
    const pool = createPostgresPool(migratedDatabaseUrl);
    const owner = new OwnerFixture(pool, context);
    try {
      await owner.provision();
      await use(owner);
    } finally {
      await pool.end();
    }
  },
});
