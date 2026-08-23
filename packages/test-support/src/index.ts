import { randomUUID } from "node:crypto";
import net from "node:net";
import { appId, type AppId } from "@bestehen/domain";
import { Client } from "pg";

export class FakeClock {
  public constructor(private current: Date) {}

  public now(): Date {
    return new Date(this.current);
  }

  public advance(milliseconds: number): void {
    this.current = new Date(this.current.getTime() + milliseconds);
  }
}

export function syntheticId<Kind extends string>(prefix: string): AppId<Kind> {
  return appId<Kind>(`${prefix}_${randomUUID().replaceAll("-", "")}`);
}

export function installExternalEgressGuard(
  allowedHosts = new Set(["127.0.0.1", "localhost", "::1"]),
): () => void {
  const originalConnect = net.connect;
  const guardedConnect = ((...arguments_: unknown[]) => {
    const first = arguments_[0] as { host?: string } | undefined;
    const host =
      typeof first === "object" && first !== null
        ? first.host
        : typeof arguments_[1] === "string"
          ? arguments_[1]
          : undefined;
    if (host && !allowedHosts.has(host)) {
      throw new Error(`External network access denied by the deterministic test guard: ${host}`);
    }
    return Reflect.apply(originalConnect, net, arguments_);
  }) as typeof net.connect;
  net.connect = guardedConnect;
  return () => {
    net.connect = originalConnect;
  };
}

export async function withIsolatedDatabase<T>(
  baseUrl: string,
  callback: (databaseUrl: string) => Promise<T>,
): Promise<T> {
  const adminUrl = new URL(baseUrl);
  adminUrl.pathname = "/postgres";
  const databaseName = `bestehen_test_${randomUUID().replaceAll("-", "")}`;
  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  await admin.query(`CREATE DATABASE "${databaseName}"`);
  const databaseUrl = new URL(baseUrl);
  databaseUrl.pathname = `/${databaseName}`;
  try {
    return await callback(databaseUrl.toString());
  } finally {
    await admin.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
      [databaseName],
    );
    await admin.query(`DROP DATABASE "${databaseName}"`);
    await admin.end();
  }
}

export async function withSyntheticDatabaseUnavailable<T>(
  databaseUrl: string,
  callback: () => Promise<T>,
): Promise<T> {
  const target = new URL(databaseUrl);
  const databaseName = target.pathname.slice(1);
  const role = decodeURIComponent(target.username);
  if (!/^bestehen_test_[a-f0-9]+$/.test(databaseName) || !/^bestehen_(?:ci|local)$/.test(role)) {
    throw new Error("Availability control is limited to isolated synthetic test databases");
  }
  target.pathname = "/postgres";
  const admin = new Client({ connectionString: target.toString() });
  await admin.connect();
  try {
    await admin.query(`ALTER DATABASE "${databaseName}" WITH ALLOW_CONNECTIONS false`);
    await admin.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
      [databaseName],
    );
    return await callback();
  } finally {
    await admin.query(`ALTER DATABASE "${databaseName}" WITH ALLOW_CONNECTIONS true`);
    await admin.end();
  }
}
