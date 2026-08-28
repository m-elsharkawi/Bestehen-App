import { contentApprovalLevels } from "@bestehen/domain";
import { describe, expect, it } from "vitest";
import {
  contentReleaseIdentity,
  holdableApprovalLevels,
  maxSafeContentDepth,
  mayEnterGenerationInput,
  mayEnterReusableBank,
  mayReachLearnerDisplay,
  parseSafeContentNode,
  parseSafeContentTree,
  resolveContentClass,
  safeContentNodeKinds,
  safeContentText,
  type SafeContentNode,
} from "./model.js";

const text = (value: string): SafeContentNode => ({ kind: "inline_text", text: value });

function findingCodes(value: unknown): readonly string[] {
  const parsed = parseSafeContentNode(value);
  return parsed.ok ? [] : parsed.findings.map((finding) => finding.code);
}

describe("content class policy (P05-CONTENT-001)", () => {
  it("resolves exactly C0-C4", () => {
    for (const contentClass of ["C0", "C1", "C2", "C3", "C4"]) {
      expect(resolveContentClass(contentClass)).toEqual({ kind: "known", contentClass });
    }
  });

  it("fails closed to draft for an unknown or malformed class", () => {
    for (const raw of ["C5", "c1", "", " C1", "gold", null, undefined, 4, {}, ["C1"]]) {
      const resolution = resolveContentClass(raw);
      expect(resolution.kind).toBe("malformed");
      if (resolution.kind === "malformed") expect(resolution.failsClosedTo).toBe("draft");
      expect(holdableApprovalLevels(raw)).toEqual(["draft"]);
    }
  });

  it("keeps C0 out of learner display and out of generation input", () => {
    expect(mayReachLearnerDisplay("C0")).toBe(false);
    expect(mayEnterGenerationInput("C0")).toBe(false);
    expect(mayEnterReusableBank("C0")).toBe(false);
    expect(holdableApprovalLevels("C0")).toEqual(["draft", "quarantine", "retired"]);
  });

  it("keeps C4 out of the reusable bank, Independent-B1, P4 and Gold", () => {
    expect(mayEnterReusableBank("C4")).toBe(false);
    expect(mayEnterGenerationInput("C4")).toBe(false);
    const levels = holdableApprovalLevels("C4");
    expect(levels).toEqual(["draft", "quarantine", "retired"]);
    for (const forbidden of ["training", "independent_b1", "readiness_p4", "gold"] as const) {
      expect(levels).not.toContain(forbidden);
    }
  });

  it("lets C4 still reach learner display, because ephemeral interaction is still shown", () => {
    expect(mayReachLearnerDisplay("C4")).toBe(true);
  });

  it("permits only C2 to hold every approval level", () => {
    expect(holdableApprovalLevels("C2")).toEqual([...contentApprovalLevels]);
    expect(holdableApprovalLevels("C1")).not.toContain("readiness_p4");
    expect(holdableApprovalLevels("C3")).not.toContain("gold");
  });

  it("pins the content release identity of D17", () => {
    expect(contentReleaseIdentity).toBe("stage-05-content-v1");
  });
});

describe("SafeContentNode is a closed union (P05-SECURITY-001)", () => {
  it("declares exactly the nine architecture node kinds", () => {
    expect([...safeContentNodeKinds]).toEqual([
      "paragraph",
      "heading",
      "inline_text",
      "emphasis",
      "quote",
      "list",
      "evidence_anchor_placeholder",
      "cloze_anchor",
      "semantic_group",
    ]);
  });

  it("accepts a well-formed authored tree", () => {
    const tree: readonly SafeContentNode[] = [
      {
        kind: "semantic_group",
        role: "notice",
        children: [
          { kind: "heading", level: 2, children: [text("Öffnungszeiten")] },
          {
            kind: "paragraph",
            children: [
              text("Die Bibliothek schließt am Freitag früher."),
              { kind: "emphasis", role: "strong", children: [text("Bitte beachten Sie das.")] },
              { kind: "evidence_anchor_placeholder", anchorId: "anchor-1" },
            ],
          },
          { kind: "quote", children: [text("Wir danken für Ihr Verständnis.")] },
          {
            kind: "list",
            ordered: false,
            items: [{ kind: "paragraph", children: [text("Montag bis Donnerstag")] }],
          },
          { kind: "cloze_anchor", gapId: "gap-1" },
        ],
      },
    ];
    expect(parseSafeContentTree(tree)).toEqual({ ok: true });
  });

  it("rejects a script node, because there is no passthrough kind", () => {
    expect(findingCodes({ kind: "script", text: "alert(1)" })).toEqual(["unknown_node_kind"]);
    expect(findingCodes({ kind: "raw_html", html: "<b>x</b>" })).toEqual(["unknown_node_kind"]);
    expect(findingCodes({ kind: "embed", src: "https://evil.example/player" })).toEqual([
      "unknown_node_kind",
    ]);
    expect(findingCodes({ kind: "svg", viewBox: "0 0 1 1" })).toEqual(["unknown_node_kind"]);
  });

  it("rejects an event handler smuggled as an extra property", () => {
    const parsed = parseSafeContentNode({
      kind: "paragraph",
      children: [text("Hallo")],
      onClick: "steal()",
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.findings).toContainEqual(
        expect.objectContaining({ code: "unexpected_property", pointer: "/onClick" }),
      );
    }
    expect(
      findingCodes({ kind: "inline_text", text: "Hallo", dangerouslySetInnerHTML: {} }),
    ).toContain("unexpected_property");
    expect(findingCodes({ kind: "inline_text", text: "Hallo", style: "color:red" })).toContain(
      "unexpected_property",
    );
  });

  it("rejects markup, active schemes and external URLs inside authored text", () => {
    expect(findingCodes(text("<script>alert(1)</script>"))).toContain("markup_in_text");
    expect(findingCodes(text("javascript:alert(1)"))).toContain("active_scheme_in_text");
    expect(findingCodes(text("data:text/html;base64,PHNjcmlwdD4="))).toContain(
      "active_scheme_in_text",
    );
    expect(findingCodes(text("Mehr unter https://tracker.example/pixel"))).toContain(
      "external_url_in_text",
    );
    expect(findingCodes(text("Siehe //cdn.example.com/a.js"))).toContain("external_url_in_text");
  });

  it("rejects control characters and blank authored text", () => {
    expect(findingCodes(text("Hallo\u0007Welt"))).toContain("control_character_in_text");
    expect(findingCodes(text("   "))).toContain("empty_text");
    expect(findingCodes(text("Zeile eins\nZeile zwei"))).not.toContain("control_character_in_text");
  });

  it("names the location of a nested defect", () => {
    const parsed = parseSafeContentNode({
      kind: "semantic_group",
      role: "notice",
      children: [{ kind: "paragraph", children: [{ kind: "iframe", src: "x" }] }],
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.findings).toContainEqual(
        expect.objectContaining({
          code: "unknown_node_kind",
          pointer: "/children/0/children/0",
        }),
      );
    }
  });

  it("rejects a heading that claims h1 and an unknown semantic role", () => {
    expect(findingCodes({ kind: "heading", level: 1, children: [text("x")] })).toContain(
      "invalid_property_type",
    );
    expect(
      findingCodes({ kind: "semantic_group", role: "advertisement", children: [text("x")] }),
    ).toContain("invalid_property_type");
  });

  it("rejects an anchor identity that is not opaque and safe", () => {
    expect(findingCodes({ kind: "cloze_anchor", gapId: "../../etc/passwd" })).toContain(
      "invalid_property_type",
    );
    expect(findingCodes({ kind: "evidence_anchor_placeholder", anchorId: "" })).toContain(
      "invalid_property_type",
    );
  });

  it("rejects unbounded nesting", () => {
    let node: SafeContentNode = text("tief");
    for (let depth = 0; depth <= maxSafeContentDepth + 1; depth += 1) {
      node = { kind: "paragraph", children: [node] };
    }
    expect(findingCodes(node)).toContain("max_depth_exceeded");
  });

  it("rejects a non-object and a bare string", () => {
    expect(findingCodes("<p>hi</p>")).toEqual(["not_an_object"]);
    expect(findingCodes(null)).toEqual(["not_an_object"]);
    expect(findingCodes([text("x")])).toEqual(["not_an_object"]);
  });

  it("flattens authored characters without revealing anchor targets", () => {
    const flattened = safeContentText([
      {
        kind: "paragraph",
        children: [
          text("Die Bibliothek"),
          { kind: "evidence_anchor_placeholder", anchorId: "anchor-1" },
          { kind: "emphasis", role: "strong", children: [text("schließt früher.")] },
          { kind: "cloze_anchor", gapId: "gap-1" },
        ],
      },
    ]);
    expect(flattened).toBe("Die Bibliothek schließt früher.");
    expect(flattened).not.toContain("anchor-1");
    expect(flattened).not.toContain("gap-1");
  });
});
