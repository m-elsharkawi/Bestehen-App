import { appId, contentRightsStates } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import {
  attributionRenderable,
  blocksServing,
  evaluateAction,
  leastPermission,
  renderAttribution,
  rightsActions,
  rightsEligibilities,
  rightsPermissionOrder,
  type RightsCondition,
  type RightsEligibility,
  type RightsEnvelope,
} from "./rights.js";

const allActionsAllowed = Object.fromEntries(
  rightsActions.map((action) => [action, "allowed" as RightsEligibility]),
);

interface EnvelopeOverrides {
  readonly state?: RightsEnvelope["identity"]["state"];
  readonly actions?: RightsEnvelope["actionEligibility"]["actions"];
  readonly conditions?: readonly RightsCondition[];
  readonly territoryLimit?: readonly string[] | null;
  readonly audienceLimit?: readonly string[] | null;
  readonly effectiveFrom?: string;
  readonly effectiveUntil?: string;
  readonly attributionRequired?: boolean;
  readonly authorOrRightsholder?: string;
  readonly componentRef?: string;
}

function envelope(overrides: EnvelopeOverrides = {}): RightsEnvelope {
  const effectiveUntil = overrides.effectiveUntil;
  return {
    identity: {
      rightsEnvelopeId: appId<"rights_envelope">("rights-envelope-0001"),
      revision: 1,
      sourceRef: null,
      sourceComponentRevision: null,
      state: overrides.state ?? "current",
      effectiveFrom: overrides.effectiveFrom ?? "2026-01-01T00:00:00.000Z",
      ...(effectiveUntil === undefined ? {} : { effectiveUntil }),
    },
    separateTrust: { authenticityConfidence: "unverified", qaReferences: [] },
    actionEligibility: {
      actions: overrides.actions ?? allActionsAllowed,
      territoryLimit: overrides.territoryLimit ?? null,
      audienceLimit: overrides.audienceLimit ?? null,
    },
    conditions: overrides.conditions ?? [],
    exactCredit: {
      attributionRequired: overrides.attributionRequired ?? false,
      authorOrRightsholder: overrides.authorOrRightsholder ?? "Bestehen (Stage 05 seed)",
      titleOrSource: "Bestehen practice material",
      requiredLink: null,
      licenceIdentifier: "proprietary-internal",
      licenceNoticeText: null,
      modificationNotice: null,
      placementRule: null,
    },
    componentScope: {
      componentRef: overrides.componentRef ?? "component-text-1",
      componentKind: "text",
    },
    provenance: {
      corpusBundleRef: null,
      rightsDecisionRef: null,
      sourceRevisionRef: null,
      groundingManifest: "originally-authored",
      note: "No restricted source expression was consulted.",
    },
    incidentDisposition: null,
  };
}

const at = new Date("2026-06-01T00:00:00.000Z");

describe("action-level rights evaluation (P05-RIGHTS-001)", () => {
  it("returns the recorded eligibility for a current envelope", () => {
    expect(evaluateAction(envelope(), "display", { at })).toBe("allowed");
    expect(
      evaluateAction(envelope({ actions: { display: "reference_only" } }), "display", { at }),
    ).toBe("reference_only");
  });

  it("fails closed to review when the action is not recorded at all", () => {
    expect(evaluateAction(envelope({ actions: { display: "allowed" } }), "adapt", { at })).toBe(
      "unknown_review_required",
    );
  });

  it("denies an action whose condition is unresolved", () => {
    const unresolved = envelope({
      conditions: [
        {
          conditionId: "condition-1",
          kind: "attribution",
          appliesToActions: ["display"],
          resolved: false,
          obligation: "Credit line has not been agreed.",
        },
      ],
    });
    expect(evaluateAction(unresolved, "display", { at })).toBe("prohibited");
    expect(evaluateAction(unresolved, "cache", { at })).toBe("allowed");
  });

  it("denies an action whose condition has expired", () => {
    const expiring = envelope({
      conditions: [
        {
          conditionId: "condition-2",
          kind: "expiry",
          appliesToActions: ["display"],
          resolved: true,
          obligation: "Licence lapses.",
          expiresAt: "2026-03-01T00:00:00.000Z",
        },
      ],
    });
    expect(evaluateAction(expiring, "display", { at })).toBe("prohibited");
    expect(evaluateAction(expiring, "display", { at: new Date("2026-02-01T00:00:00.000Z") })).toBe(
      "allowed_with_conditions",
    );
  });

  it("downgrades an allowed action that carries a resolved obligation", () => {
    const conditional = envelope({
      conditions: [
        {
          conditionId: "condition-3",
          kind: "modification_notice",
          appliesToActions: ["adapt"],
          resolved: true,
          obligation: "State that the text was shortened.",
        },
      ],
    });
    expect(evaluateAction(conditional, "adapt", { at })).toBe("allowed_with_conditions");
    expect(evaluateAction(conditional, "display", { at })).toBe("allowed");
  });

  it("treats a territory or audience limit as an obligation, not a free pass", () => {
    expect(evaluateAction(envelope({ territoryLimit: ["DE"] }), "display", { at })).toBe(
      "allowed_with_conditions",
    );
    expect(evaluateAction(envelope({ audienceLimit: ["enrolled"] }), "display", { at })).toBe(
      "allowed_with_conditions",
    );
  });

  it("prohibits every action once the envelope is withdrawn or taken down", () => {
    for (const state of ["withdrawn", "takedown"] as const) {
      const stopped = envelope({ state });
      for (const action of rightsActions) {
        expect(evaluateAction(stopped, action, { at })).toBe("prohibited");
      }
      expect(blocksServing(stopped)).toBe(true);
    }
  });

  it("sends a superseded envelope back for review rather than trusting a former permission", () => {
    expect(evaluateAction(envelope({ state: "superseded" }), "display", { at })).toBe(
      "unknown_review_required",
    );
    expect(blocksServing(envelope({ state: "superseded" }))).toBe(false);
  });

  it("covers every rights state the domain declares", () => {
    for (const state of contentRightsStates) {
      expect(rightsEligibilities).toContain(evaluateAction(envelope({ state }), "display", { at }));
    }
  });

  it("requires review outside the effective window", () => {
    expect(
      evaluateAction(envelope({ effectiveFrom: "2027-01-01T00:00:00.000Z" }), "display", { at }),
    ).toBe("unknown_review_required");
    expect(
      evaluateAction(envelope({ effectiveUntil: "2026-02-01T00:00:00.000Z" }), "display", { at }),
    ).toBe("unknown_review_required");
  });
});

describe("mixed components resolve to least permission", () => {
  it("orders the eligibilities from prohibited to allowed", () => {
    expect(rightsEligibilities.map((value) => rightsPermissionOrder[value])).toEqual([
      0, 1, 2, 3, 4,
    ]);
    expect(leastPermission("allowed", "reference_only")).toBe("reference_only");
    expect(leastPermission("reference_only", "allowed")).toBe("reference_only");
    expect(leastPermission("allowed_with_conditions", "prohibited")).toBe("prohibited");
    expect(leastPermission("allowed", "allowed")).toBe("allowed");
  });

  it("lets the most restrictive component govern the whole composite", () => {
    const text = envelope({ componentRef: "component-text-1" });
    const image = envelope({
      componentRef: "component-image-1",
      actions: { display: "reference_only" },
    });
    const audio = envelope({ componentRef: "component-audio-1", state: "withdrawn" });

    expect(evaluateAction([text, text], "display", { at })).toBe("allowed");
    expect(evaluateAction([text, image], "display", { at })).toBe("reference_only");
    expect(evaluateAction([text, image, audio], "display", { at })).toBe("prohibited");
  });

  it("never treats an absent envelope as an absent restriction", () => {
    expect(evaluateAction([], "display", { at })).toBe("unknown_review_required");
  });
});

describe("rights grant nothing but rights", () => {
  it("returns only a rights vocabulary", () => {
    const decision = evaluateAction(envelope(), "display", { at });
    expect(rightsEligibilities).toContain(decision);
    for (const value of rightsEligibilities) {
      expect(value).not.toMatch(/correct|fresh|ready|readiness|target|pass|probab/i);
    }
  });

  it("keeps authenticity confidence out of the permission decision", () => {
    const unverified = envelope();
    expect(unverified.separateTrust.authenticityConfidence).toBe("unverified");
    expect(evaluateAction(unverified, "display", { at })).toBe("allowed");
  });

  it("blocks serving on withdrawal without saying anything about recorded validity", () => {
    const withdrawn = envelope({ state: "withdrawn" });
    expect(blocksServing(withdrawn)).toBe(true);
    expect(Object.keys(withdrawn)).not.toContain("validity");
    expect(JSON.stringify(withdrawn)).not.toMatch(/not_counted|partially_valid/);
  });
});

describe("attribution rendering", () => {
  it("renders the exact credit and labels original content as Bestehen practice", () => {
    const rendered = renderAttribution(envelope({ attributionRequired: false }));
    expect(rendered).toEqual({
      required: false,
      text: "Bestehen (Stage 05 seed) — Bestehen practice material",
      link: null,
      placementRule: null,
      modificationNotice: null,
    });
    expect(rendered.text).not.toMatch(/telc|endorse/i);
  });

  it("reports an unsatisfiable attribution rather than rendering an empty credit", () => {
    const nameless = envelope({ attributionRequired: true, authorOrRightsholder: "  " });
    expect(attributionRenderable(nameless, "display")).toBe(false);
    expect(attributionRenderable(envelope({ attributionRequired: true }), "display")).toBe(true);
    expect(attributionRenderable(envelope(), "display")).toBe(true);
  });
});
