import { responseOperationSchema } from "@bestehen/contracts";
import { describe, expect, it } from "vitest";
import {
  applyResponseOperation,
  emptyCanonicalResponse,
  noMatchRightId,
  type ResponseOperation,
} from "./scoring.js";

/**
 * `ResponseOperation` is defined twice — `responseOperationSchema` in `@bestehen/contracts` is the
 * wire form the API accepts, and the TypeScript union in `./scoring.ts` is the domain form the
 * scorer applies. Nothing in the type system connects them.
 *
 * The failure this file exists to prevent is silent and learner-facing: a later task adds an
 * operation kind to the wire schema only, the API accepts it, `applyResponseOperation` falls off the
 * end of its `switch`, and a response the learner actually gave is recorded but never applied. The
 * assertion is deliberately **bidirectional** — a domain case with no wire kind is the mirror defect
 * (an operation the scorer handles that no client can ever send).
 */

/**
 * Every domain case, as a compile-time-exhaustive record. Adding a case to the union without adding
 * it here fails `tsc`; adding a key that is not a case fails too.
 */
const domainOperationKinds: Readonly<Record<ResponseOperation["kind"], true>> = {
  set_selection: true,
  clear_selection: true,
  set_match: true,
  clear_match: true,
  place_candidate: true,
  remove_candidate: true,
  move_candidate: true,
  confirm_boundary: true,
};

/** One representative operation per domain case, used to prove field-level agreement too. */
const representativeOperations: Readonly<Record<ResponseOperation["kind"], ResponseOperation>> = {
  set_selection: { kind: "set_selection", itemId: "item-0001", optionId: "option-a" },
  clear_selection: { kind: "clear_selection", itemId: "item-0001" },
  set_match: {
    kind: "set_match",
    itemId: "item-0001",
    leftId: "prompt-a",
    rightId: noMatchRightId,
  },
  clear_match: { kind: "clear_match", itemId: "item-0001", leftId: "prompt-a" },
  place_candidate: {
    kind: "place_candidate",
    itemId: "item-0001",
    gapId: "gap-1",
    candidateId: "candidate-1",
  },
  remove_candidate: { kind: "remove_candidate", itemId: "item-0001", gapId: "gap-1" },
  move_candidate: {
    kind: "move_candidate",
    itemId: "item-0001",
    fromGapId: "gap-1",
    toGapId: "gap-2",
  },
  confirm_boundary: { kind: "confirm_boundary", boundaryId: "block-1" },
};

const wireKinds = responseOperationSchema.options.map((option) => option.shape.kind.value);
const domainKinds = Object.keys(domainOperationKinds) as readonly ResponseOperation["kind"][];

describe("ResponseOperation wire/domain parity", () => {
  it("gives every wire kind a domain case", () => {
    expect([...wireKinds].sort()).toEqual([...domainKinds].sort());
    for (const kind of wireKinds) {
      expect(domainKinds).toContain(kind);
    }
  });

  it("gives every domain case a wire kind", () => {
    for (const kind of domainKinds) {
      expect(wireKinds).toContain(kind);
    }
  });

  it("applies every wire kind rather than silently ignoring it", () => {
    for (const kind of wireKinds) {
      const operation = representativeOperations[kind as ResponseOperation["kind"]];
      // The `switch` in `applyResponseOperation` has no `default`, so an unhandled kind returns
      // `undefined` — exactly the "recorded but never applied" bug.
      const result = applyResponseOperation(emptyCanonicalResponse, operation);
      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
    }
  });

  it("accepts every domain operation shape on the wire, field by field", () => {
    for (const kind of domainKinds) {
      const parsed = responseOperationSchema.safeParse(representativeOperations[kind]);
      expect(parsed.success, `${kind} is not wire-legal: ${parsed.error?.message ?? ""}`).toBe(
        true,
      );
    }
  });

  it("rejects an operation kind neither side declares", () => {
    expect(
      responseOperationSchema.safeParse({ kind: "set_ordering", itemId: "item-0001" }).success,
    ).toBe(false);
    expect(domainKinds).not.toContain("set_ordering" as never);
  });
});
