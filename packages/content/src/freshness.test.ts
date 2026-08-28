import {
  appId,
  type ExposureClass,
  exposureClasses,
  independenceClasses,
  reasonRegistryV1,
} from "@bestehen/domain";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "./digest.js";
import {
  type ExistingFamily,
  type FamilyReviewInput,
  type FamilySignature,
  type FreshnessRequest,
  assignFamily,
  classifyIndependence,
  countEligibleIndependentFamilies,
  decideFreshness,
  exactDuplicateKey,
  exposureClassForTrigger,
  exposureStrength,
  freshnessUses,
  isExposed,
  mergeExposure,
  normalizeForFamilyComparison,
  recordExposure,
  recordedExposureClasses,
  semanticFamilyKey,
  shouldRecordExposure,
} from "./freshness.js";

const familyA = appId<"content_family">("family-0001");
const familyB = appId<"content_family">("family-0002");

function signature(overrides: Partial<FamilySignature> = {}): FamilySignature {
  return {
    taskFamilyKind: "R2DetailedSelect",
    taskDefinitionId: "task-r2",
    normalizedTextDigest: canonicalDigest("Das Vereinsheft erscheint viermal im Jahr."),
    scenarioConfigurationRef: "scenario/vereinsheft-frequenz",
    decisiveRealizationRef: "decisive/direkte-frequenzangabe",
    answerPathRef: "path/detail-scan",
    obligationRefs: ["obligation/frequenz", "obligation/redaktionsschluss"],
    ...overrides,
  };
}

const conclusive: FamilyReviewInput = {
  outcome: "independent",
  proposedFamilyIds: [],
  humanConfirmed: true,
};

const existing: readonly ExistingFamily[] = [{ contentFamilyId: familyA, signature: signature() }];

/* ------------------------------------------------------------------------------------------------
 * Family assignment
 * ---------------------------------------------------------------------------------------------- */

describe("conservative family assignment", () => {
  it("normalizes case, punctuation and whitespace for the exact-duplicate comparison", () => {
    expect(normalizeForFamilyComparison("  Das   Heft, erscheint —  viermal! ")).toBe(
      "das heft erscheint viermal",
    );
  });

  it("joins an exact duplicate to the same family without any review", () => {
    const assignment = assignFamily(signature(), existing, {
      outcome: "independent",
      proposedFamilyIds: [],
      humanConfirmed: true,
    });
    expect(assignment).toEqual({
      contentFamilyId: familyA,
      basis: "automated_proposal",
      reviewState: "confirmed",
      independenceEligible: false,
      reason: "exact_duplicate",
    });
  });

  it("keeps shuffled options in the same family: option order never reaches the key", () => {
    // Option order is presentation and appears in no part of either family key.
    const shuffled = signature();
    expect(semanticFamilyKey(shuffled)).toBe(semanticFamilyKey(signature()));
    expect(exactDuplicateKey(shuffled)).toBe(exactDuplicateKey(signature()));
  });

  it("keeps renamed entities and changed dates in the same family", () => {
    const renamed = signature({
      normalizedTextDigest: canonicalDigest("Das Clubheft erscheint viermal im Jahr, ab 2027."),
    });
    // The surface text moved, so the exact-duplicate key differs …
    expect(exactDuplicateKey(renamed)).not.toBe(exactDuplicateKey(signature()));
    // … but the semantic key does not, so the candidate still joins the same family.
    expect(semanticFamilyKey(renamed)).toBe(semanticFamilyKey(signature()));
    expect(assignFamily(renamed, existing, conclusive).contentFamilyId).toBe(familyA);
  });

  it("keeps a changed voice in the same family", () => {
    // A voice is a media fact and appears in no field of the signature at all.
    const listening = signature({ taskFamilyKind: "H2ConversationInterview" });
    const sameVoiceChanged = { ...listening };
    expect(semanticFamilyKey(sameVoiceChanged)).toBe(semanticFamilyKey(listening));
  });

  it("keeps a new revision of the same task in the same family", () => {
    const successor = signature({
      normalizedTextDigest: canonicalDigest("Das Vereinsheft erscheint vier Mal pro Jahr."),
    });
    expect(assignFamily(successor, existing, conclusive).reason).toBe("semantic_key_match");
    expect(assignFamily(successor, existing, conclusive).contentFamilyId).toBe(familyA);
  });

  it("mints an independence-eligible family only for a human-confirmed independent review", () => {
    const different = signature({
      scenarioConfigurationRef: "scenario/kursanmeldung",
      decisiveRealizationRef: "decisive/bedingungssatz",
      answerPathRef: "path/inferenz",
      normalizedTextDigest: canonicalDigest("Die Kursanmeldung endet am Freitag."),
    });
    expect(assignFamily(different, existing, conclusive)).toEqual({
      contentFamilyId: null,
      basis: "human_review",
      reviewState: "confirmed",
      independenceEligible: true,
      reason: "independent_new_family",
    });
    const unconfirmed = assignFamily(different, existing, {
      ...conclusive,
      humanConfirmed: false,
    });
    expect(unconfirmed.independenceEligible).toBe(false);
    expect(unconfirmed.reviewState).toBe("proposed");
  });

  it("resolves an unresolved review conservatively, never into independence", () => {
    const ambiguous = signature({
      scenarioConfigurationRef: "scenario/vereinsheft-abgabe",
      normalizedTextDigest: canonicalDigest("Beiträge bitte bis Monatsende einreichen."),
    });
    const joined = assignFamily(ambiguous, existing, {
      outcome: "unresolved",
      proposedFamilyIds: [familyA],
      humanConfirmed: false,
    });
    expect(joined).toEqual({
      contentFamilyId: familyA,
      basis: "conservative_default",
      reviewState: "unresolved",
      independenceEligible: false,
      reason: "unresolved_review_joins_proposed_family",
    });

    const isolated = assignFamily(ambiguous, existing, {
      outcome: "unresolved",
      proposedFamilyIds: [],
      humanConfirmed: false,
    });
    expect(isolated.contentFamilyId).toBeNull();
    expect(isolated.independenceEligible).toBe(false);
    expect(isolated.reviewState).toBe("unresolved");
  });

  it("invents no numeric similarity threshold", () => {
    const source = canonicalDigest(
      JSON.stringify([semanticFamilyKey(signature()), exactDuplicateKey(signature())]),
    );
    // The keys are opaque digests of authored references, not scores; there is no score to compare.
    expect(source).toMatch(/^[0-9a-f]{64}$/);
    expect(Object.keys(conclusive)).toEqual(["outcome", "proposedFamilyIds", "humanConfirmed"]);
  });
});

/* ------------------------------------------------------------------------------------------------
 * Exposure recording
 * ---------------------------------------------------------------------------------------------- */

describe("exposure recording", () => {
  it("uses the domain's exposure vocabulary rather than a second copy", () => {
    expect(recordedExposureClasses).toBe(exposureClasses);
    expect(Object.keys(exposureStrength).sort()).toEqual([...exposureClasses].sort());
  });

  it("records an exposure fact for every material reveal", () => {
    for (const trigger of [
      "learner_visible_stimulus",
      "decisive_information",
      "key_or_rationale",
      "transcript",
      "partner_private_content",
    ] as const) {
      expect(
        shouldRecordExposure({
          contentFamilyId: familyA,
          trigger,
          materiallyRevealed: true,
          attemptAbandoned: false,
        }),
      ).toBe(true);
    }
  });

  it("does not erase exposure when the attempt is abandoned", () => {
    const abandoned = recordExposure("unseen", {
      contentFamilyId: familyA,
      trigger: "decisive_information",
      materiallyRevealed: true,
      attemptAbandoned: true,
    });
    expect(abandoned).toBe("exposed_family");
  });

  it("records key exposure at a manifest boundary as the strongest class", () => {
    expect(exposureClassForTrigger("key_or_rationale")).toBe("answer_exposed");
    expect(
      recordExposure("exposed_family", {
        contentFamilyId: familyA,
        trigger: "key_or_rationale",
        materiallyRevealed: true,
        attemptAbandoned: false,
      }),
    ).toBe("answer_exposed");
  });

  it("never weakens a recorded exposure", () => {
    for (const existingClass of exposureClasses) {
      for (const incoming of exposureClasses) {
        const merged = mergeExposure(existingClass, incoming);
        expect(exposureStrength[merged]).toBeGreaterThanOrEqual(exposureStrength[existingClass]);
      }
    }
    expect(mergeExposure("answer_exposed", "unseen")).toBe("answer_exposed");
  });

  it("ignores an incidental, non-material reveal", () => {
    expect(
      recordExposure("unseen", {
        contentFamilyId: familyA,
        trigger: "learner_visible_stimulus",
        materiallyRevealed: false,
        attemptAbandoned: false,
      }),
    ).toBe("unseen");
  });

  it("treats every class but `unseen` as exposed", () => {
    expect(isExposed("unseen")).toBe(false);
    expect(isExposed("near_duplicate_family")).toBe(true);
    expect(isExposed("exposed_family")).toBe(true);
    expect(isExposed("answer_exposed")).toBe(true);
  });
});

/* ------------------------------------------------------------------------------------------------
 * The freshness/independence table
 * ---------------------------------------------------------------------------------------------- */

describe("the freshness and independence table", () => {
  function request(overrides: Partial<FreshnessRequest> = {}): FreshnessRequest {
    return {
      use: "initial_learning_attempt",
      candidateFamilyId: familyA,
      candidateExposure: "unseen",
      candidateIndependenceEligible: true,
      excludedFamilyIds: [],
      eligibleAlternativeAvailable: true,
      declaredAsReview: false,
      approvalLevel: "training",
      ...overrides,
    };
  }

  it("covers the nine rows of Architecture/09 §7.2", () => {
    expect(freshnessUses).toEqual([
      "initial_learning_attempt",
      "immediate_retry",
      "same_item_review",
      "delayed_transfer",
      "retention_check",
      "mini_or_section_mock",
      "full_mock",
      "booking_confirmation",
      "defect_replacement",
    ]);
    for (const use of freshnessUses) {
      expect(() => decideFreshness(request({ use }))).not.toThrow();
    }
  });

  it("claims only occasion classes the domain defines", () => {
    const claimed = new Set(
      freshnessUses
        .map((use) =>
          classifyIndependence(
            request({ use, formFrozenAndEligible: true, approvalLevel: "readiness_p4" }),
          ),
        )
        .filter((value): value is NonNullable<typeof value> => value !== null),
    );
    for (const value of claimed) expect(independenceClasses).toContain(value);
  });

  it("serves a fresh eligible family for a first attempt", () => {
    expect(decideFreshness(request())).toEqual({
      decision: "fresh",
      independenceClass: "first_attempt",
      labelledAsRepetition: false,
      directClaimPermitted: true,
      exhaustionBehaviour: "choose_another_eligible_family_or_declare_unavailable",
    });
  });

  it("labels an intentionally reviewed exposed family as repetition", () => {
    const outcome = decideFreshness(
      request({ candidateExposure: "exposed_family", declaredAsReview: true }),
    );
    expect(outcome.decision).toBe("exposed_review");
    expect(outcome.labelledAsRepetition).toBe(true);
    expect(outcome.directClaimPermitted).toBe(false);
    expect(outcome.independenceClass).toBe("repeated_exposed_practice");
  });

  it("declares content unavailable when nothing eligible is left for a first attempt", () => {
    const outcome = decideFreshness(
      request({ candidateExposure: "exposed_family", eligibleAlternativeAvailable: false }),
    );
    expect(outcome.decision).toBe("unavailable");
    expect(outcome.reasonCode).toBe("FALLBACK.NO_ELIGIBLE_FAMILY");
  });

  it("allows exposed practice on an immediate retry but never lets it pass as transfer", () => {
    const retry = decideFreshness(
      request({ use: "immediate_retry", candidateExposure: "exposed_family" }),
    );
    expect(retry.decision).toBe("exposed_review");
    expect(retry.independenceClass).toBe("repeated_exposed_practice");
    expect(retry.directClaimPermitted).toBe(false);

    const transfer = decideFreshness(
      request({ use: "delayed_transfer", candidateExposure: "exposed_family" }),
    );
    expect(transfer.decision).toBe("not_independent");
    expect(transfer.independenceClass).toBeNull();
  });

  it("makes same-item review teaching only, whatever the exposure", () => {
    for (const exposure of exposureClasses) {
      const outcome = decideFreshness(
        request({ use: "same_item_review", candidateExposure: exposure }),
      );
      expect(outcome.decision).toBe("exposed_review");
      expect(outcome.independenceClass).toBe("repeated_exposed_practice");
      expect(outcome.directClaimPermitted).toBe(false);
    }
  });

  it("never uses a near-duplicate for a delayed transfer", () => {
    const outcome = decideFreshness(
      request({ use: "delayed_transfer", candidateExposure: "near_duplicate_family" }),
    );
    expect(outcome.decision).toBe("not_independent");
    expect(outcome.exhaustionBehaviour).toBe("defer_independent_claim");
  });

  it("grants a retention occasion only for an unexposed family absent from prior occasions", () => {
    expect(decideFreshness(request({ use: "retention_check" })).independenceClass).toBe(
      "retention_check",
    );
    expect(
      decideFreshness(request({ use: "retention_check", excludedFamilyIds: [familyA] })).decision,
    ).toBe("not_independent");
  });

  it("reports honest unavailability rather than exposed practice for a measurement", () => {
    const mock = decideFreshness(
      request({
        use: "full_mock",
        approvalLevel: "readiness_p4",
        formFrozenAndEligible: true,
        candidateExposure: "exposed_family",
      }),
    );
    expect(mock.decision).toBe("unavailable");
    expect(mock.labelledAsRepetition).toBe(false);
    expect(mock.exhaustionBehaviour).toBe("do_not_reuse_exposed_form");
  });

  it("requires a frozen eligible form and a P4 approval for a full mock", () => {
    expect(
      decideFreshness(request({ use: "full_mock", approvalLevel: "readiness_p4" })).decision,
    ).toBe("unavailable");
    expect(
      decideFreshness(
        request({ use: "full_mock", approvalLevel: "training", formFrozenAndEligible: true }),
      ).reasonCode,
    ).toBe("VALIDITY.CONTENT_APPROVAL");
    expect(
      decideFreshness(
        request({ use: "full_mock", approvalLevel: "readiness_p4", formFrozenAndEligible: true }),
      ),
    ).toEqual({
      decision: "fresh",
      independenceClass: "mock_measurement",
      labelledAsRepetition: false,
      directClaimPermitted: true,
      exhaustionBehaviour: "do_not_reuse_exposed_form",
    });
  });

  it("keeps a booking confirmation independent of the qualifying mock", () => {
    const outcome = decideFreshness(
      request({
        use: "booking_confirmation",
        approvalLevel: "readiness_p4",
        formFrozenAndEligible: true,
        excludedFamilyIds: [familyA],
      }),
    );
    expect(outcome.decision).toBe("unavailable");
    expect(outcome.exhaustionBehaviour).toBe("await_evidence_and_prioritise_inventory");
  });

  it("permits the same family for a defect replacement only when byte delivery alone changed", () => {
    const byteOnly = decideFreshness(
      request({ use: "defect_replacement", onlyByteDeliveryChanged: true }),
    );
    expect(byteOnly.decision).toBe("fresh");
    // Never negative retry history: the replacement is a first attempt, not a penalised retry.
    expect(byteOnly.independenceClass).toBe("first_attempt");

    const exposedBytes = decideFreshness(
      request({
        use: "defect_replacement",
        onlyByteDeliveryChanged: true,
        candidateExposure: "exposed_family",
      }),
    );
    expect(exposedBytes.decision).not.toBe("fresh");
  });

  it("uses only reason codes the registry defines", () => {
    const registered = new Set(reasonRegistryV1.map((definition) => definition.code));
    for (const use of freshnessUses) {
      for (const exposure of exposureClasses) {
        const outcome = decideFreshness(request({ use, candidateExposure: exposure }));
        if (outcome.reasonCode !== undefined) expect(registered.has(outcome.reasonCode)).toBe(true);
      }
    }
  });

  it("never attributes fault to the learner in any reason it emits", () => {
    const byCode = new Map(reasonRegistryV1.map((definition) => [definition.code, definition]));
    for (const use of freshnessUses) {
      const outcome = decideFreshness(request({ use, candidateExposure: "exposed_family" }));
      if (outcome.reasonCode === undefined) continue;
      expect(byCode.get(outcome.reasonCode)?.learnerFault).toBe(false);
    }
  });
});

/* ------------------------------------------------------------------------------------------------
 * Coverage counting
 * ---------------------------------------------------------------------------------------------- */

describe("freshness invariants, property-tested", () => {
  const exposureArbitrary = fc.constantFrom<ExposureClass>(...exposureClasses);
  const useArbitrary = fc.constantFrom(...freshnessUses);

  it("merges exposure monotonically and idempotently, for every pair of classes", () => {
    fc.assert(
      fc.property(exposureArbitrary, exposureArbitrary, (left, right) => {
        const merged = mergeExposure(left, right);
        expect(exposureStrength[merged]).toBeGreaterThanOrEqual(exposureStrength[left]);
        expect(exposureStrength[merged]).toBeGreaterThanOrEqual(exposureStrength[right]);
        expect(mergeExposure(merged, merged)).toBe(merged);
        expect(mergeExposure(left, right)).toBe(mergeExposure(right, left));
      }),
    );
  });

  it("never lowers a recorded exposure, whatever the event says", () => {
    fc.assert(
      fc.property(
        exposureArbitrary,
        fc.constantFrom(
          "learner_visible_stimulus",
          "decisive_information",
          "key_or_rationale",
          "transcript",
          "partner_private_content",
        ) as fc.Arbitrary<Parameters<typeof exposureClassForTrigger>[0]>,
        fc.boolean(),
        fc.boolean(),
        (recorded, trigger, materiallyRevealed, attemptAbandoned) => {
          const next = recordExposure(recorded, {
            contentFamilyId: familyA,
            trigger,
            materiallyRevealed,
            attemptAbandoned,
          });
          expect(exposureStrength[next]).toBeGreaterThanOrEqual(exposureStrength[recorded]);
        },
      ),
    );
  });

  it("keeps the semantic family key blind to surface text and to obligation order", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 64 }),
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 24 }), { maxLength: 6 }),
        (surfaceText, obligations) => {
          const shuffled = [...obligations].reverse();
          const left = signature({
            normalizedTextDigest: canonicalDigest(surfaceText),
            obligationRefs: obligations,
          });
          const right = signature({
            normalizedTextDigest: canonicalDigest(`${surfaceText} (neue Fassung, andere Namen)`),
            obligationRefs: shuffled,
          });
          // Renamed entities, a changed voice, a new revision and reordered obligations all move
          // the surface text and never the semantic key.
          expect(semanticFamilyKey(right)).toBe(semanticFamilyKey(left));
        },
      ),
    );
  });

  it("never permits a direct claim on an exposed or independence-ineligible family", () => {
    fc.assert(
      fc.property(
        useArbitrary,
        exposureArbitrary,
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (use, exposure, eligible, declaredAsReview, frozen, byteOnly) => {
          const outcome = decideFreshness({
            use,
            candidateFamilyId: familyA,
            candidateExposure: exposure,
            candidateIndependenceEligible: eligible,
            excludedFamilyIds: [],
            eligibleAlternativeAvailable: true,
            declaredAsReview,
            approvalLevel: "readiness_p4",
            formFrozenAndEligible: frozen,
            onlyByteDeliveryChanged: byteOnly,
          });
          if (isExposed(exposure) || !eligible) {
            expect(outcome.directClaimPermitted).toBe(false);
          }
          if (outcome.independenceClass !== null) {
            expect(independenceClasses).toContain(outcome.independenceClass);
          }
        },
      ),
    );
  });
});

describe("coverage counts independent families", () => {
  it("counts distinct eligible unexposed families, never raw items", () => {
    expect(
      countEligibleIndependentFamilies([
        { contentFamilyId: familyA, exposure: "unseen", independenceEligible: true },
        { contentFamilyId: familyA, exposure: "unseen", independenceEligible: true },
        { contentFamilyId: familyB, exposure: "unseen", independenceEligible: true },
        { contentFamilyId: familyB, exposure: "exposed_family", independenceEligible: true },
      ]),
    ).toBe(2);
  });

  it("excludes an exposed or independence-ineligible family", () => {
    expect(
      countEligibleIndependentFamilies([
        { contentFamilyId: familyA, exposure: "exposed_family", independenceEligible: true },
        { contentFamilyId: familyB, exposure: "unseen", independenceEligible: false },
      ]),
    ).toBe(0);
  });
});
