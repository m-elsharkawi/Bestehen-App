import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import process from "node:process";

const commit = exec("git", ["rev-parse", "HEAD"]).trim();
const suffix = randomBytes(5).toString("hex");
const network = `bestehen-ci-${suffix}`;
const postgres = `bestehen-pg-${suffix}`;
const web = `bestehen-web-${suffix}`;
const worker = `bestehen-worker-${suffix}`;
const webImage = `bestehen-web:${commit.slice(0, 12)}-${suffix}`;
const workerImage = `bestehen-worker:${commit.slice(0, 12)}-${suffix}`;
const postgresImage =
  "postgres:18.6-bookworm@sha256:7d2695c3aa88e792e8b3b233e7e4adb296a20412c6c0ca361e3edaaacfada108";
const nodeManifest = "sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03";
const postgresManifest = "sha256:7d2695c3aa88e792e8b3b233e7e4adb296a20412c6c0ca361e3edaaacfada108";
const created = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : new Date().toISOString();

function exec(command, arguments_, options = {}) {
  return execFileSync(command, arguments_, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function run(command, arguments_) {
  const result = spawnSync(command, arguments_, { encoding: "utf8", stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} failed with status ${result.status}`);
}

function inspect(container, template) {
  return exec("docker", ["inspect", "--format", template, container]).trim();
}

function resolvePlatformManifest(image) {
  const manifests = JSON.parse(exec("docker", ["manifest", "inspect", "--verbose", image]));
  const candidates = Array.isArray(manifests) ? manifests : [manifests];
  const architecture = inspectDockerArchitecture();
  const candidate = candidates.find(
    (entry) =>
      entry.Descriptor?.platform?.os === "linux" &&
      entry.Descriptor?.platform?.architecture === architecture,
  );
  if (!candidate?.Descriptor?.digest) {
    throw new Error(`No linux/${architecture} platform manifest found for ${image}`);
  }
  return candidate.Descriptor.digest;
}

function inspectDockerArchitecture() {
  const architecture = exec("docker", ["version", "--format", "{{.Server.Arch}}"]);
  return architecture.trim().replace("x86_64", "amd64").replace("aarch64", "arm64");
}

function waitFor(description, predicate, timeoutMilliseconds = 60_000) {
  const deadline = Date.now() + timeoutMilliseconds;
  while (Date.now() < deadline) {
    if (predicate()) return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

function runtimeEnvironment(databaseHost = "postgres") {
  return [
    "-e",
    "BESTEHEN_AI_ADAPTER=fake",
    "-e",
    "BESTEHEN_APP_ENV=test",
    "-e",
    "BESTEHEN_AUTH_ADAPTER=fake",
    "-e",
    "BESTEHEN_EMAIL_ADAPTER=fake",
    "-e",
    "BESTEHEN_LOG_FORMAT=json",
    "-e",
    "BESTEHEN_LOG_LEVEL=info",
    "-e",
    "BESTEHEN_OBJECT_STORAGE_ADAPTER=fake",
    "-e",
    `BESTEHEN_RELEASE_COMMIT=${commit}`,
    "-e",
    "BESTEHEN_RELEASE_DIRTY=false",
    "-e",
    "BESTEHEN_SCHEMA_MAX_REVISION=baseline",
    "-e",
    "BESTEHEN_SCHEMA_MIN_REVISION=baseline",
    "-e",
    "BESTEHEN_SHUTDOWN_GRACE_MS=5000",
    "-e",
    "BESTEHEN_STT_ADAPTER=fake",
    "-e",
    "BESTEHEN_TTS_ADAPTER=fake",
    "-e",
    "BESTEHEN_WEB_PORT=3000",
    "-e",
    "BESTEHEN_WORKER_PORT=3001",
    "-e",
    `DATABASE_URL=postgresql://bestehen_ci:bestehen_ci@${databaseHost}:5432/bestehen_ci`,
  ];
}

function removeContainer(name) {
  spawnSync("docker", ["rm", "--force", name], { stdio: "ignore" });
}

function cleanup() {
  for (const container of [web, worker, postgres]) removeContainer(container);
  spawnSync("docker", ["network", "rm", network], { stdio: "ignore" });
}

process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(130));
process.on("SIGTERM", () => process.exit(143));

try {
  exec("docker", ["info"]);
} catch {
  process.stderr.write("Docker daemon is required for the non-waivable OCI gate.\n");
  process.exit(1);
}

const nodeTagManifest = exec("docker", [
  "buildx",
  "imagetools",
  "inspect",
  "node:24.19.0-bookworm-slim",
  "--format",
  "{{.Manifest.Digest}}",
]).trim();
const postgresTagManifest = exec("docker", [
  "buildx",
  "imagetools",
  "inspect",
  "postgres:18.6-bookworm",
  "--format",
  "{{.Manifest.Digest}}",
]).trim();
if (nodeTagManifest !== nodeManifest || postgresTagManifest !== postgresManifest) {
  throw new Error(
    `Pinned image tag drift: node=${nodeTagManifest}, postgres=${postgresTagManifest}`,
  );
}
const nodePlatformManifest = resolvePlatformManifest(`node@${nodeManifest}`);
const postgresPlatformManifest = resolvePlatformManifest(`postgres@${postgresManifest}`);

try {
  run("docker", [
    "build",
    "--file",
    "Dockerfile.web",
    "--build-arg",
    `OCI_CREATED=${created}`,
    "--build-arg",
    `OCI_REVISION=${commit}`,
    "--tag",
    webImage,
    ".",
  ]);
  run("docker", [
    "build",
    "--file",
    "Dockerfile.worker",
    "--build-arg",
    `OCI_CREATED=${created}`,
    "--build-arg",
    `OCI_REVISION=${commit}`,
    "--tag",
    workerImage,
    ".",
  ]);

  for (const image of [webImage, workerImage]) {
    const imageUser = inspect(image, "{{.Config.User}}");
    if (imageUser !== "10001:10001")
      throw new Error(`${image} runs as unexpected user ${imageUser}`);
    const inspection = exec("docker", ["inspect", image]);
    const history = exec("docker", ["history", "--no-trunc", image]);
    const secretSentinel = ["sentinel", "secret", "stage01"].join("-");
    const forbiddenImageMaterial = new RegExp(
      `${secretSentinel}|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY`,
      "i",
    );
    if (forbiddenImageMaterial.test(`${inspection}\n${history}`)) {
      throw new Error(`${image} metadata/history contains forbidden secret evidence`);
    }
    run("docker", [
      "run",
      "--rm",
      "--read-only",
      "--tmpfs",
      "/tmp:size=16m,mode=1777",
      image,
      "sh",
      "-eu",
      "-c",
      "test ! -e /app/Architecture && test ! -e /app/Design && test ! -e /app/Implementation && test ! -e /app/.git",
    ]);
  }

  run("docker", ["network", "create", network]);
  run("docker", [
    "run",
    "--detach",
    "--name",
    postgres,
    "--network",
    network,
    "--network-alias",
    "postgres",
    "-e",
    "POSTGRES_DB=bestehen_ci",
    "-e",
    "POSTGRES_PASSWORD=bestehen_ci",
    "-e",
    "POSTGRES_USER=bestehen_ci",
    "--health-cmd",
    "pg_isready -U bestehen_ci -d bestehen_ci",
    "--health-interval",
    "1s",
    "--health-timeout",
    "3s",
    "--health-retries",
    "30",
    postgresImage,
  ]);
  waitFor(
    "PostgreSQL 18 health",
    () => inspect(postgres, "{{.State.Health.Status}}") === "healthy",
  );

  run("docker", [
    "run",
    "--rm",
    "--network",
    network,
    "--read-only",
    "--tmpfs",
    "/tmp:size=16m,mode=1777",
    ...runtimeEnvironment(),
    workerImage,
    "node",
    "node_modules/@bestehen/infrastructure/dist/postgres/migrate-cli.js",
  ]);

  for (const [name, image] of [
    [web, webImage],
    [worker, workerImage],
  ]) {
    run("docker", [
      "run",
      "--detach",
      "--name",
      name,
      "--network",
      network,
      "--init",
      "--read-only",
      "--tmpfs",
      "/tmp:size=32m,mode=1777",
      ...runtimeEnvironment(),
      image,
    ]);
  }

  for (const name of [web, worker]) {
    waitFor(`${name} health`, () => inspect(name, "{{.State.Health.Status}}") === "healthy");
    if (inspect(name, "{{.HostConfig.ReadonlyRootfs}}") !== "true") {
      throw new Error(`${name} was not started with a read-only root filesystem`);
    }
    if (inspect(name, "{{.HostConfig.Init}}") !== "true") {
      throw new Error(`${name} was not started with an init process`);
    }
    run("docker", [
      "exec",
      name,
      "node",
      "/app/healthcheck.mjs",
      name === web ? "3000" : "3001",
      name === web ? "/api/health/ready" : "/health/ready",
    ]);
    run("docker", ["stop", "--signal", "SIGTERM", "--timeout", "10", name]);
    const exitCode = inspect(name, "{{.State.ExitCode}}");
    if (exitCode !== "0") throw new Error(`${name} exited with ${exitCode} after SIGTERM`);
  }

  const webDigest = inspect(webImage, "{{.Id}}");
  const workerDigest = inspect(workerImage, "{{.Id}}");
  const evidence = `${JSON.stringify(
    {
      commit,
      nodeBaseManifest: nodeManifest,
      nodePlatformManifest,
      postgresManifest,
      postgresPlatformManifest,
      webDigest,
      workerDigest,
      user: "10001:10001",
      readOnlyRoot: true,
      init: true,
      signal: "SIGTERM",
      status: "passed",
    },
    null,
    2,
  )}\n`;
  if (process.env.OCI_EVIDENCE_PATH) {
    writeFileSync(process.env.OCI_EVIDENCE_PATH, evidence, "utf8");
  }
  process.stdout.write(evidence);
} finally {
  cleanup();
}
