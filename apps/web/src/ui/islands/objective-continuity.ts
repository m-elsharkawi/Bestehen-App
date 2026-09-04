import type { ResponseOperation } from "@bestehen/content";
import type { attemptClockObservationSchema } from "@bestehen/contracts";
import { formOperations, formResponseDigest, valuesFromOperations } from "../objective-form";

export type ClockObservation = ReturnType<typeof attemptClockObservationSchema.parse>;
export interface RecoveryView {
  readonly contract: { readonly major: number };
  readonly resourceVersion: number;
  readonly acknowledgedCheckpointSequence: number;
  readonly checkpoints: readonly {
    readonly sequence: number;
    readonly responseDigest: string;
    readonly operations: readonly ResponseOperation[];
  }[];
  readonly submission: { readonly responseDigest: string } | null;
}
interface Intent {
  readonly operationId: string;
  readonly submitOperationId: string;
  readonly expectedVersion: number;
  readonly sequence: number;
  readonly responseDigest: string;
  readonly operations: readonly ResponseOperation[];
  readonly observedAt: string;
  readonly submit: boolean;
  readonly clockObservation?: ClockObservation;
}
export interface LocalResponse {
  readonly key: string;
  readonly major: 1;
  readonly updatedAt: number;
  readonly values: Readonly<Record<string, string>>;
  readonly expectedVersion: number;
  readonly sequence: number;
  readonly pending: Intent | null;
  readonly conflict: RecoveryView | null;
  readonly acknowledged: boolean;
  readonly captured: boolean;
  readonly submitRequested?: { readonly clockObservation?: ClockObservation } | undefined;
}
export interface ResponseStore {
  read(key: string): Promise<LocalResponse | undefined>;
  write(value: LocalResponse): Promise<void>;
}

/** Origin-scoped, learner-partitioned continuity only. No credentials or stimulus/key bytes. */
export class IndexedResponseStore implements ResponseStore {
  private async database(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("bestehen-objective-continuity-v1", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("responses", { keyPath: "key" });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  public async read(key: string): Promise<LocalResponse | undefined> {
    const db = await this.database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("responses", "readwrite", { durability: "strict" });
      const store = tx.objectStore("responses");
      const request = store.get(key);
      let result: LocalResponse | undefined;
      request.onsuccess = () => {
        const value = request.result as LocalResponse | undefined;
        if (value && value.major !== 1) {
          tx.abort();
          return;
        }
        const retention =
          value?.acknowledged && !value.pending && !value.conflict ? 86_400_000 : 30 * 86_400_000;
        if (value && Date.now() - value.updatedAt > retention) store.delete(key);
        else result = value;
      };
      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onabort = tx.onerror = () => {
        db.close();
        reject(tx.error ?? new Error("Local recovery unavailable"));
      };
    });
  }
  public async write(value: LocalResponse): Promise<void> {
    const db = await this.database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("responses", "readwrite", { durability: "strict" });
      tx.objectStore("responses").put(value);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onabort = tx.onerror = () => {
        db.close();
        reject(tx.error ?? new Error("Local save failed"));
      };
    });
  }
}

export type RecoveryStatus =
  | "ready"
  | "saved"
  | "synced"
  | "retry"
  | "session_expired"
  | "conflict"
  | "submission_unknown"
  | "completed"
  | "update_required"
  | "save_failed";

/** Transport controller only. The server alone accepts a checkpoint and determines an outcome. */
export class ObjectiveContinuity {
  public state: LocalResponse;
  public status: RecoveryStatus = "ready";
  public isSubmitting = false;
  private queue: Promise<void> = Promise.resolve();
  private writes: Promise<void> = Promise.resolve();
  public constructor(
    key: string,
    private readonly attemptId: string,
    version: number,
    sequence: number,
    private readonly store: ResponseStore,
    private readonly transport: typeof fetch,
    private readonly changed: () => void,
    initialValues: Readonly<Record<string, string>> = {},
  ) {
    this.state = {
      key,
      major: 1,
      values: initialValues,
      expectedVersion: version,
      sequence,
      pending: null,
      conflict: null,
      acknowledged: Object.keys(initialValues).length > 0,
      captured: Object.keys(initialValues).length > 0,
      updatedAt: Date.now(),
    };
  }
  private async persist(patch: Partial<LocalResponse>) {
    const write = this.writes.then(async () => {
      const next = { ...this.state, ...patch, updatedAt: Date.now() };
      await this.store.write(next);
      this.state = next;
    });
    this.writes = write.catch(() => undefined);
    await write;
  }
  private run(work: () => Promise<void>) {
    this.queue = this.queue
      .then(work)
      .catch(() => {
        this.status = "save_failed";
      })
      .finally(this.changed);
    return this.queue;
  }
  public restore() {
    const restoring = this.writes.then(async () => {
      const saved = await this.store.read(this.state.key);
      if (saved) this.state = saved;
      this.isSubmitting = Boolean(this.state.submitRequested || this.state.pending?.submit);
    });
    this.writes = restoring.catch(() => undefined);
    return this.run(async () => {
      await restoring;
      await this.reconcile();
    });
  }
  public async change(values: Readonly<Record<string, string>>) {
    if (this.isSubmitting) return;
    try {
      // Local durability never waits for a network request. The pending intent retains its snapshot.
      await this.persist({ values, acknowledged: false, captured: true });
      this.status = "saved";
      this.changed();
    } catch {
      this.status = "save_failed";
      this.changed();
      return;
    }
    return this.run(async () => {
      if (!this.state.conflict && !this.state.pending && !this.state.acknowledged)
        await this.prepare(false);
      await this.reconcile();
    });
  }
  public async submit(clockObservation?: ClockObservation) {
    if (this.state.conflict) {
      this.status = "conflict";
      this.changed();
      return;
    }
    this.isSubmitting = true;
    this.changed();
    try {
      await this.persist({
        submitRequested: clockObservation ? { clockObservation } : {},
        captured: true,
      });
    } catch {
      this.isSubmitting = false;
      this.status = "save_failed";
      this.changed();
      return;
    }
    this.changed();
    return this.run(async () => {
      await this.reconcile();
      if (this.state.pending || this.state.conflict || this.status === "completed") return;
      await this.prepare(true, clockObservation);
      await this.reconcile();
    });
  }
  public retry() {
    return this.run(() => this.reconcile());
  }
  public resolve(use: "local" | "server") {
    return this.run(async () => {
      const remote = this.state.conflict;
      if (!remote) return;
      const latest = remote.checkpoints.find(
        (c) => c.sequence === remote.acknowledgedCheckpointSequence,
      );
      // Keep the conflict in a separate retained record before starting the explicitly chosen branch.
      await this.store.write({
        ...this.state,
        key: `${this.state.key}:conflict:${crypto.randomUUID()}`,
      });
      if (remote.submission) {
        if (use === "server") {
          this.status = "completed";
          await this.persist({ pending: null, conflict: null, acknowledged: true });
        }
        return;
      }
      await this.persist({
        values:
          use === "server" && latest ? valuesFromOperations(latest.operations) : this.state.values,
        expectedVersion: remote.resourceVersion,
        sequence: remote.acknowledgedCheckpointSequence + 1,
        pending: null,
        conflict: null,
        acknowledged: false,
        submitRequested: undefined,
      });
      this.isSubmitting = false;
      await this.prepare(false);
      await this.reconcile();
    });
  }
  private async prepare(submit: boolean, clockObservation?: ClockObservation) {
    const boundary = submit ? this.attemptId : undefined;
    const values = this.state.values;
    const pending: Intent = {
      operationId: crypto.randomUUID(),
      submitOperationId: crypto.randomUUID(),
      expectedVersion: this.state.expectedVersion,
      sequence: this.state.sequence,
      responseDigest: await formResponseDigest(values, boundary),
      operations: formOperations(values, boundary),
      observedAt: new Date().toISOString(),
      submit,
      ...(clockObservation ? { clockObservation } : {}),
    };
    await this.persist({ pending }); // Completed transaction BEFORE any transport.
    this.status = "saved";
  }
  private async reconcile(): Promise<void> {
    let response: Response;
    try {
      response = await this.transport(`/api/v1/attempts/${this.attemptId}?major=1`, {
        cache: "no-store",
      });
    } catch {
      this.status = this.state.pending?.submit ? "submission_unknown" : "retry";
      return;
    }
    if (!response.ok) {
      this.status = response.status === 404 ? "session_expired" : "retry";
      return;
    }
    const remote = (await response.json()) as RecoveryView;
    if (remote.contract.major !== 1) {
      this.status = "update_required";
      return;
    }
    if (this.state.conflict) {
      this.status = "conflict";
      return;
    }
    const intent = this.state.pending;
    if (remote.submission) {
      if (
        (intent && remote.submission.responseDigest !== intent.responseDigest) ||
        (!intent &&
          this.state.captured &&
          !this.state.acknowledged &&
          remote.submission.responseDigest !==
            (await formResponseDigest(this.state.values, this.attemptId)))
      ) {
        await this.persist({ conflict: remote });
        this.status = "conflict";
        return;
      }
      await this.persist({ pending: null, acknowledged: true });
      this.status = "completed";
      return;
    }
    const latest = remote.checkpoints.find(
      (c) => c.sequence === remote.acknowledgedCheckpointSequence,
    );
    if (!intent) {
      if (
        latest &&
        !this.state.acknowledged &&
        this.state.captured &&
        latest.responseDigest !== (await formResponseDigest(this.state.values))
      ) {
        await this.persist({ conflict: remote });
        this.status = "conflict";
        return;
      }
      await this.persist({
        ...(latest && !this.state.captured
          ? { values: valuesFromOperations(latest.operations), captured: true, acknowledged: true }
          : {}),
        expectedVersion: remote.resourceVersion,
        sequence: remote.acknowledgedCheckpointSequence + 1,
      });
      this.status = this.state.conflict ? "conflict" : this.state.acknowledged ? "synced" : "ready";
      if (this.state.submitRequested) {
        await this.prepare(true, this.state.submitRequested.clockObservation);
        await this.reconcile();
      }
      return;
    }
    const receipt = remote.checkpoints.find(
      (c) => c.sequence === intent.sequence && c.responseDigest === intent.responseDigest,
    );
    if (!receipt) {
      if (
        remote.resourceVersion !== intent.expectedVersion ||
        remote.acknowledgedCheckpointSequence >= intent.sequence
      ) {
        await this.persist({ conflict: remote });
        this.status = "conflict";
        return;
      }
      const ok = await this.post("checkpoint", intent.operationId, intent.expectedVersion, {
        attemptId: this.attemptId,
        stream: "primary",
        sequence: intent.sequence,
        operations: intent.operations,
        responseDigest: intent.responseDigest,
        observedAt: intent.observedAt,
      });
      if (ok) await this.reconcile();
      return;
    }
    if (!intent.submit) {
      const acknowledged = intent.responseDigest === (await formResponseDigest(this.state.values));
      await this.persist({
        pending: null,
        expectedVersion: remote.resourceVersion,
        sequence: remote.acknowledgedCheckpointSequence + 1,
        acknowledged,
      });
      this.status = "synced";
      if (!acknowledged) {
        await this.prepare(false);
        await this.reconcile();
        return;
      }
      if (this.state.submitRequested) {
        await this.prepare(true, this.state.submitRequested.clockObservation);
        await this.reconcile();
      }
      return;
    }
    const ok = await this.post("submit", intent.submitOperationId, remote.resourceVersion, {
      attemptId: this.attemptId,
      checkpointSequence: intent.sequence,
      responseDigest: intent.responseDigest,
      conditions: {
        progressionProfile: "P2",
        timingMode: "practice",
        timerIntegrity: "insufficient",
        elapsedMs: 0,
        exposureClass: "unseen",
        independenceClass: "first_attempt",
        assistanceUsed: [],
        accessibilityEquivalence: "equivalent",
      },
      ...(intent.clockObservation ? { clockObservation: intent.clockObservation } : {}),
    });
    if (ok) await this.reconcile();
  }
  private async post(kind: string, operationId: string, expectedVersion: number, payload: unknown) {
    let response: Response;
    try {
      response = await this.transport(`/api/v1/attempts/${this.attemptId}/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contract: { major: 1, minor: 0 },
          operationId,
          expectedVersion,
          payload,
        }),
      });
    } catch {
      this.status = kind === "submit" ? "submission_unknown" : "retry";
      return false;
    }
    if (response.ok) return true;
    const body = (await response.json().catch(() => ({}))) as { code?: string };
    this.status =
      body.code === "unsupported_contract_major"
        ? "update_required"
        : response.status === 404
          ? "session_expired"
          : response.status === 409
            ? "conflict"
            : "retry";
    if (response.status === 409) {
      // Refusal is terminal for this intent. One comparison read may help, but never re-post here.
      try {
        const query = await this.transport(`/api/v1/attempts/${this.attemptId}?major=1`, {
          cache: "no-store",
        });
        if (query.ok) {
          const remote = (await query.json()) as RecoveryView;
          if (remote.contract.major === 1) await this.persist({ conflict: remote });
        }
      } catch {
        /* Preserve the original intent until an explicit recovery action. */
      }
    }
    return false;
  }
}
