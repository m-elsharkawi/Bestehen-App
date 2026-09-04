import { describe, expect, it, vi } from "vitest";
import { appId, type AuthorizedScope } from "@bestehen/domain";
import { isSpeculativeDisclosure, readDisplayedAttempt } from "./attempt-disclosure";
import type { DeterministicAttemptService } from "./attempt-runtime";

describe("P05-SECURITY-001 conservative disclosure boundary", () => {
  it.each([
    { purpose: "prefetch" },
    { "sec-purpose": "prefetch;prerender" },
    { "next-router-prefetch": "1" },
  ])("refuses speculative headers %j", (headers) => {
    expect(isSpeculativeDisclosure(new Headers(headers))).toBe(true);
    expect(isSpeculativeDisclosure(new Headers())).toBe(false);
  });
  it("P05-FRESH-001 Listening instructions/acquisition do not expose unheard audio", async () => {
    const runtime = {
      readLearnerAttempt: vi.fn(async () => ({
        ok: true,
        value: { attempt: { modality: "listening" } },
      })),
    } as unknown as DeterministicAttemptService;
    const attempts = { recordPinnedDisclosure: vi.fn() };
    await readDisplayedAttempt(runtime, attempts, {} as AuthorizedScope, appId("test-attempt"));
    expect(attempts.recordPinnedDisclosure).not.toHaveBeenCalled();
  });
});
