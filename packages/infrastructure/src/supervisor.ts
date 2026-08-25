import { PgBossTransport } from "./jobs/index.js";

export type SupervisorState = "stopped" | "ready_foundation_queues" | "stopping";

/**
 * The worker opens only the pre-installed pg-boss schema. DDL and queue registration remain owned
 * by the dedicated migrator. Stage 03 registers no product/provider handler.
 */
export class PgBossSupervisor {
  private state: SupervisorState = "stopped";
  private readonly transport: PgBossTransport;

  public constructor(databaseUrl: string) {
    this.transport = new PgBossTransport(databaseUrl);
  }

  public async start(): Promise<void> {
    await this.transport.start();
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
