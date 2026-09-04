import { afterEach, describe, expect, it, vi } from "vitest";
import { canonicalizeResponse, canonicalResponseDigest } from "@bestehen/content";
import { formOperations, formResponseDigest } from "../objective-form";
import * as forms from "../objective-form";
import { ObjectiveContinuity, type LocalResponse, type RecoveryView } from "./objective-continuity";

afterEach(() => vi.restoreAllMocks());
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function fixture() {
  const rows = new Map<string, LocalResponse>();
  const store = {
    read: async (key: string) => rows.get(key),
    write: async (value: LocalResponse) => {
      rows.set(value.key, structuredClone(value));
    },
  };
  let remote: RecoveryView = {
    contract: { major: 1 },
    resourceVersion: 2,
    acknowledgedCheckpointSequence: 0,
    checkpoints: [],
    submission: null,
  };
  let failure: "none" | "offline" | "expired" | "lost_checkpoint" | "lost_submit" | "refused" =
    "none";
  const calls: { path: string; body: Record<string, unknown> }[] = [];
  const transport: typeof fetch = async (url, options) => {
    if (failure === "offline") throw new Error("network loss");
    if (failure === "expired") return Response.json({}, { status: 404 });
    if (!options?.body) return Response.json(remote);
    const body = JSON.parse(String(options.body));
    expect(
      [...rows.values()].some(
        (row) =>
          row.pending?.operationId === body.operationId ||
          row.pending?.submitOperationId === body.operationId,
      ),
    ).toBe(true);
    calls.push({ path: String(url), body });
    if (failure === "refused")
      return Response.json({ code: "idempotency_conflict" }, { status: 409 });
    if (String(url).endsWith("checkpoint")) {
      remote = {
        ...remote,
        resourceVersion: remote.resourceVersion + 1,
        acknowledgedCheckpointSequence: body.payload.sequence,
        checkpoints: [
          ...remote.checkpoints,
          {
            sequence: body.payload.sequence,
            responseDigest: body.payload.responseDigest,
            operations: body.payload.operations,
          },
        ],
      };
      if (failure === "lost_checkpoint") {
        failure = "offline";
        throw new Error("committed but acknowledgement lost");
      }
    } else {
      remote = { ...remote, submission: { responseDigest: body.payload.responseDigest } };
      if (failure === "lost_submit") {
        failure = "offline";
        throw new Error("committed but acknowledgement lost");
      }
    }
    return Response.json({ status: "completed", resourceId: "attempt" });
  };
  const controller = () =>
    new ObjectiveContinuity(
      "scope:attempt:branch",
      "attempt-id",
      2,
      1,
      store,
      transport,
      () => undefined,
    );
  return {
    store,
    transport,
    rows,
    calls,
    controller,
    setFailure: (value: typeof failure) => {
      failure = value;
    },
    setRemote: (value: RecoveryView) => {
      remote = value;
    },
  };
}

describe("P05-RECOVERY-001 durable response protocol", () => {
  it.each(["deferred_digest", "queued_write"] as const)(
    "acknowledges only the accepted draft revision across %s",
    async (mode) => {
      const f = fixture();
      const digestStarted = deferred();
      const digestReleased = deferred();
      const digestFinished = deferred();
      const writeStarted = deferred();
      const writeReleased = deferred();
      const secondPosted = deferred();
      const secondAccepted = deferred();
      const originalDigest = forms.formResponseDigest;
      let hashes = 0;
      vi.spyOn(forms, "formResponseDigest").mockImplementation(async (...args) => {
        const ordinal = ++hashes;
        if (ordinal === 2) {
          digestStarted.resolve();
          await digestReleased.promise;
        }
        const result = await originalDigest(...args);
        if (ordinal === 2) digestFinished.resolve();
        return result;
      });
      const history: LocalResponse[] = [];
      let blockedWrite = false;
      const store = {
        read: f.store.read,
        write: async (value: LocalResponse) => {
          if (mode === "queued_write" && value.values["select:item"] === "b" && !blockedWrite) {
            blockedWrite = true;
            writeStarted.resolve();
            await writeReleased.promise;
          }
          await f.store.write(value);
          history.push(structuredClone(value));
        },
      };
      const runtime = new ObjectiveContinuity(
        "scope:attempt:branch",
        "attempt-id",
        2,
        1,
        store,
        async (url, options) => {
          if (options?.body && JSON.parse(String(options.body)).payload.sequence === 2) {
            secondPosted.resolve();
            await secondAccepted.promise;
          }
          return f.transport(url, options);
        },
        () => undefined,
      );
      const savingA = runtime.change({ "select:item": "a" });
      await digestStarted.promise;
      const savingB = runtime.change({ "select:item": "b" });
      try {
        if (mode === "queued_write") await writeStarted.promise;
        else
          await expect.poll(() => f.rows.get(runtime.state.key)?.values["select:item"]).toBe("b");
        digestReleased.resolve();
        await digestFinished.promise;
        // The acknowledgement update must now wait behind the pending B write.
        await Promise.resolve();
        writeReleased.resolve();
        await expect
          .poll(
            () =>
              history.find((row) => row.values["select:item"] === "b" && row.pending === null)
                ?.acknowledged,
          )
          .toBe(false);
        await secondPosted.promise;
        expect(runtime.state.values).toEqual({ "select:item": "b" });
        expect(runtime.state.draftRevision).toBe(2);
        expect(runtime.state.acknowledged).toBe(false);
        expect(f.calls).toHaveLength(1);
        secondAccepted.resolve();
        await Promise.all([savingA, savingB]);
        expect(runtime.state.acknowledged).toBe(true);
        expect(runtime.state.sequence).toBe(3);
        expect(
          f.calls.map((call) => (call.body.payload as { operations: unknown }).operations),
        ).toEqual([formOperations({ "select:item": "a" }), formOperations({ "select:item": "b" })]);
      } finally {
        digestReleased.resolve();
        writeReleased.resolve();
        secondAccepted.resolve();
        await Promise.all([savingA, savingB]);
      }
    },
  );
  it("does not overwrite a newer draft with a recovery projection queued behind its device write", async () => {
    const f = fixture();
    f.setRemote({
      contract: { major: 1 },
      resourceVersion: 3,
      acknowledgedCheckpointSequence: 1,
      checkpoints: [
        {
          sequence: 1,
          responseDigest: await formResponseDigest({ "select:item": "a" }),
          operations: formOperations({ "select:item": "a" }),
        },
      ],
      submission: null,
    });
    const writing = deferred();
    const release = deferred();
    let once = false;
    let editing: Promise<void> | undefined;
    const runtime = new ObjectiveContinuity(
      "scope:attempt:branch",
      "attempt-id",
      2,
      1,
      {
        read: f.store.read,
        write: async (value) => {
          if (!once && value.values["select:item"] === "b") {
            once = true;
            writing.resolve();
            await release.promise;
          }
          await f.store.write(value);
        },
      },
      async (url, options) => {
        if (!once) editing = runtime.change({ "select:item": "b" });
        return f.transport(url, options);
      },
      () => undefined,
    );
    const restoring = runtime.restore();
    await writing.promise;
    // Let the response be decoded and its snapshot update queue behind the blocked local write.
    await new Promise<void>((done) => setTimeout(done, 0));
    release.resolve();
    await restoring;
    await editing;
    expect(runtime.state.values).toEqual({ "select:item": "b" });
    expect(runtime.state.acknowledged).toBe(false);
    expect(runtime.state.conflict?.checkpoints[0]?.operations).toEqual(
      formOperations({ "select:item": "a" }),
    );
  });
  it("persists submit intent without waiting for a hung save and freezes its answer snapshot", async () => {
    const f = fixture();
    let release!: () => void;
    let sent!: () => void;
    const started = new Promise<void>((resolve) => {
      sent = resolve;
    });
    const deferred = new Promise<void>((resolve) => {
      release = resolve;
    });
    const runtime = new ObjectiveContinuity(
      "scope:attempt:branch",
      "attempt-id",
      2,
      1,
      f.store,
      async (url, options) => {
        if (options?.body) {
          sent();
          await deferred;
        }
        return f.transport(url, options);
      },
      () => undefined,
    );
    const saving = runtime.change({ "select:item": "a" });
    await started;
    const submitting = runtime.submit();
    await expect.poll(() => f.rows.get(runtime.state.key)?.submitRequested).toEqual({});
    await runtime.change({ "select:item": "b" });
    expect(runtime.state.values).toEqual({ "select:item": "a" });
    const reload = f.controller();
    f.setFailure("offline");
    await reload.restore();
    expect(reload.isSubmitting).toBe(true);
    expect(reload.state.submitRequested).toEqual({});
    release();
    await Promise.all([saving, submitting]);
    f.setFailure("none");
    await reload.retry();
    expect(reload.status).toBe("completed");
    expect(f.calls.filter((call) => call.path.endsWith("/submit"))).toHaveLength(1);
    expect(f.calls.at(-1)?.body.payload).toMatchObject({
      responseDigest: await formResponseDigest({ "select:item": "a" }, "attempt-id"),
    });
  });
  it("durably captures edits while an earlier checkpoint is in flight, then recovers both snapshots", async () => {
    const f = fixture();
    let release!: () => void;
    let sent!: () => void;
    const started = new Promise<void>((resolve) => {
      sent = resolve;
    });
    const deferred = new Promise<void>((resolve) => {
      release = resolve;
    });
    const transport: typeof fetch = async (url, options) => {
      if (options?.body) {
        sent();
        await deferred;
      }
      return f.transport(url, options);
    };
    const first = new ObjectiveContinuity(
      "scope:attempt:branch",
      "attempt-id",
      2,
      1,
      f.store,
      transport,
      () => undefined,
    );
    const savingA = first.change({ "select:item": "a" });
    await started;
    const intentA = first.state.pending;
    const savingB = first.change({ "select:item": "b" });
    await expect.poll(() => f.rows.get(first.state.key)?.values).toEqual({ "select:item": "b" });
    expect(f.rows.get(first.state.key)?.pending).toEqual(intentA);
    f.setFailure("offline");
    const reload = f.controller();
    await reload.restore();
    expect(reload.state.values).toEqual({ "select:item": "b" });
    expect(reload.state.pending).toEqual(intentA);
    release();
    await Promise.all([savingA, savingB]);
    f.setFailure("none");
    await reload.retry();
    expect(reload.status).toBe("synced");
    expect(reload.state.values).toEqual({ "select:item": "b" });
    expect(f.calls[0]?.body.operationId).toBe(intentA?.operationId);
    expect(
      f.calls.map((call) => (call.body.payload as { operations: unknown }).operations),
    ).toEqual([formOperations({ "select:item": "a" }), formOperations({ "select:item": "b" })]);
    expect(reload.state.sequence).toBe(3);
    expect(reload.state.expectedVersion).toBe(4);
  });
  it("settles an unchanged-version 409 without recursive retries", async () => {
    const f = fixture();
    f.setFailure("refused");
    const runtime = f.controller();
    await runtime.change({ "select:item": "a" });
    expect(runtime.status).toBe("conflict");
    expect(f.calls).toHaveLength(1);
    await runtime.retry();
    expect(f.calls).toHaveLength(1);
  });
  it("preserves an explicitly captured empty draft after a crash before intent creation", async () => {
    const f = fixture();
    const runtime = f.controller();
    f.rows.set(runtime.state.key, { ...runtime.state, captured: true, values: {} });
    f.setRemote({
      contract: { major: 1 },
      resourceVersion: 3,
      acknowledgedCheckpointSequence: 1,
      checkpoints: [
        {
          sequence: 1,
          responseDigest: await formResponseDigest({ "select:item": "old" }),
          operations: formOperations({ "select:item": "old" }),
        },
      ],
      submission: null,
    });
    await runtime.restore();
    expect(runtime.state.values).toEqual({});
    expect(runtime.status).toBe("conflict");
    expect(f.calls).toHaveLength(0);
  });
  it("persists before transport, restores selections after reload, and reconciles a lost checkpoint acknowledgement", async () => {
    const f = fixture();
    f.setFailure("lost_checkpoint");
    const first = f.controller();
    await first.change({ "select:item-b": "option-b" });
    expect(first.status).toBe("retry");
    const operation = first.state.pending?.operationId;
    const reloaded = f.controller();
    await reloaded.restore();
    expect(reloaded.state.values).toEqual({ "select:item-b": "option-b" });
    expect(reloaded.state.pending?.operationId).toBe(operation);
    f.setFailure("none");
    await reloaded.retry();
    expect(reloaded.status).toBe("synced");
    expect(f.calls).toHaveLength(1);
    expect(reloaded.state.expectedVersion).toBe(3);
  });
  it("keeps pending intent through session expiry, then replays the same operation", async () => {
    const f = fixture();
    f.setFailure("expired");
    const first = f.controller();
    await first.change({ "candidate:item:gap": "choice" });
    const pending = first.state.pending;
    expect(first.status).toBe("session_expired");
    const reload = f.controller();
    await reload.restore();
    expect(reload.state.pending).toEqual(pending);
    f.setFailure("none");
    await reload.retry();
    expect(f.calls[0]?.body.operationId).toBe(pending?.operationId);
    expect(reload.state.values).toEqual(first.state.values);
  });
  it("queries a committed submission after lost acknowledgement without submitting twice", async () => {
    const f = fixture();
    const runtime = f.controller();
    await runtime.change({ "select:item": "a" });
    f.setFailure("lost_submit");
    await runtime.submit();
    expect(runtime.status).toBe("submission_unknown");
    const reload = f.controller();
    await reload.restore();
    expect(reload.state.pending?.submit).toBe(true);
    f.setFailure("none");
    await reload.retry();
    expect(reload.status).toBe("completed");
    expect(f.calls.filter((call) => call.path.endsWith("/submit"))).toHaveLength(1);
  });
  it("preserves both divergent branches until an explicit choice creates a new checkpoint", async () => {
    const f = fixture();
    f.setFailure("offline");
    const runtime = f.controller();
    await runtime.change({ "select:item": "local" });
    f.setRemote({
      contract: { major: 1 },
      resourceVersion: 3,
      acknowledgedCheckpointSequence: 1,
      checkpoints: [
        {
          sequence: 1,
          responseDigest: await formResponseDigest({ "select:item": "remote" }),
          operations: formOperations({ "select:item": "remote" }),
        },
      ],
      submission: null,
    });
    f.setFailure("none");
    await runtime.retry();
    expect(runtime.status).toBe("conflict");
    expect(f.calls).toHaveLength(0);
    await runtime.resolve("local");
    expect(runtime.state.values).toEqual({ "select:item": "local" });
    expect(
      [...f.rows.values()].some(
        (row) => row.conflict !== null && row.values["select:item"] === "local",
      ),
    ).toBe(true);
    expect(runtime.state.sequence).toBe(3);
  });
  it("queues a deliberate all-blank submission offline without interpreting technical absence as blank", async () => {
    const f = fixture();
    f.setFailure("offline");
    const runtime = f.controller();
    await runtime.submit();
    expect(runtime.state.pending?.operations).toEqual([
      { kind: "confirm_boundary", boundaryId: "attempt-id" },
    ]);
    expect(f.calls).toHaveLength(0);
    f.setFailure("none");
    await runtime.retry();
    expect(runtime.status).toBe("completed");
  });
});

describe("P05-EQUIV-001 native snapshot identity", () => {
  it("matches T4 canonical bytes for selections, matches, gaps and deliberate blanks regardless of DOM order", async () => {
    for (const values of [
      {},
      { "select:z": "option-a", "match:a:left": "right", "candidate:b:gap": "word" },
      { "candidate:b:gap": "word", "match:a:left": "right", "select:z": "option-a" },
    ]) {
      expect(await formResponseDigest(values, "boundary")).toBe(
        canonicalResponseDigest(canonicalizeResponse(formOperations(values, "boundary")).response),
      );
    }
  });
});
