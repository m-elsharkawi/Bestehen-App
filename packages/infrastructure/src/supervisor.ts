import { type FoundationQueue, PgBossTransport } from "./jobs/index.js";

export type SupervisorState = "stopped" | "ready_foundation_queues" | "stopping";

/** One queue handler. The envelope has already been parsed and matched against its queue. */
export type QueueHandlers = Partial<Record<FoundationQueue, (payload: unknown) => Promise<void>>>;

/**
 * The worker opens only the pre-installed pg-boss schema. DDL and queue registration remain owned
 * by the dedicated migrator; the supervisor attaches handlers to queues that already exist.
 *
 * The state vocabulary and `isReady()` are unchanged: readiness has always meant "the transport is
 * started and its queues are attached", and registering a handler does not alter that contract.
 */
export class PgBossSupervisor {
  private state: SupervisorState = "stopped";
  private readonly transport: PgBossTransport;

  public constructor(databaseUrl: string) {
    this.transport = new PgBossTransport(databaseUrl);
  }

  public async start(handlers: QueueHandlers = {}): Promise<void> {
    await this.transport.start(handlers);
    this.state = "ready_foundation_queues";
  }

  public async stop(): Promise<void> {
    this.state = "stopping";
    await this.transport.stop();
    this.state = "stopped";
  }

  public status(): SupervisorState {
    return this.state;
  }

  public isReady(): boolean {
    return this.state === "ready_foundation_queues";
  }
}
