import { BaselineShell } from "@bestehen/design-system";

export default function BaselinePage() {
  return (
    <BaselineShell title="Repository baseline">
      <p>
        The web process is running with a deterministic local configuration. Learner workflows,
        readiness claims, productive providers, public access, and experimental behavior remain
        deliberately unavailable.
      </p>
      <p>
        Service operators can inspect the separate liveness and readiness endpoints. Readiness
        reflects required configuration, PostgreSQL connectivity, and schema compatibility.
      </p>
      <nav aria-label="Service information">
        <ul>
          <li>
            <a href="/api/health/live">Liveness</a>
          </li>
          <li>
            <a href="/api/health/ready">Readiness</a>
          </li>
        </ul>
      </nav>
    </BaselineShell>
  );
}
