import { PgBoss } from "pg-boss";

export type SupervisorState = "stopped" | "idle_no_product_queues" | "stopping";

/**
 * Stage 01 intentionally has no product queue or pg-boss schema. This supervisor proves the
 * configured pg-boss implementation is constructible while keeping schema creation under the
 * future explicit migrator owner.
 */
export class PgBossSupervisor {
  private state: SupervisorState = "stopped";
  private readonly boss: PgBoss;

  public constructor(databaseUrl: string) {
    this.boss = new PgBoss({ connectionString: databaseUrl, migrate: false });
  }

  public async start(): Promise<void> {
    void this.boss;
    this.state = "idle_no_product_queues";
  }

  public async stop(): Promise<void> {
    this.state = "stopping";
    this.state = "stopped";
  }

  public status(): SupervisorState {
    return this.state;
  }

  public isReady(): boolean {
    return this.state === "idle_no_product_queues";
  }
}
