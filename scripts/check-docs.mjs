import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const documents = [
  "README.md",
  "docs/architecture/package-boundaries.md",
  "docs/configuration.md",
  "docs/local-development.md",
  "docs/delivery.md",
  "docs/decisions/IDR-0001-personal-deployment-profile.md",
];
const configurationFields = [
  "BESTEHEN_APP_ENV",
  "BESTEHEN_RELEASE_COMMIT",
  "BESTEHEN_RELEASE_DIRTY",
  "BESTEHEN_SCHEMA_MIN_REVISION",
  "BESTEHEN_SCHEMA_MAX_REVISION",
  "BESTEHEN_WEB_PORT",
  "BESTEHEN_WORKER_PORT",
  "BESTEHEN_SHUTDOWN_GRACE_MS",
  "BESTEHEN_LOG_LEVEL",
  "BESTEHEN_LOG_FORMAT",
  "DATABASE_URL",
  "BESTEHEN_AUTH_ADAPTER",
  "BESTEHEN_OBJECT_STORAGE_ADAPTER",
  "BESTEHEN_EMAIL_ADAPTER",
  "BESTEHEN_AI_ADAPTER",
  "BESTEHEN_STT_ADAPTER",
  "BESTEHEN_TTS_ADAPTER",
  "BESTEHEN_FLAG_GUEST_PRESENTATION",
  "BESTEHEN_FLAG_ACCOUNT_OPTIONAL_PRESENTATION",
  "BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS",
  "BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING",
  "BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS",
  "BESTEHEN_FLAG_EXPERIMENTAL_PRODUCT_BEHAVIOR",
  "BESTEHEN_AUTH0_DOMAIN",
  "BESTEHEN_AUTH0_CLIENT_ID",
  "BESTEHEN_AUTH0_SESSION_SECRET",
  "BESTEHEN_OWNER_ALLOWLIST",
  "BESTEHEN_APPLICATION_BASE_URL",
  "BESTEHEN_S3_ENDPOINT",
  "BESTEHEN_S3_REGION",
  "BESTEHEN_S3_BUCKET",
  "BESTEHEN_S3_PREFIX",
  "BESTEHEN_S3_ACCESS_KEY_ID",
  "BESTEHEN_S3_SECRET_ACCESS_KEY",
  "BESTEHEN_EMAIL_API_KEY",
  "BESTEHEN_AI_API_KEY",
  "BESTEHEN_STT_API_KEY",
  "BESTEHEN_TTS_API_KEY",
];

for (const document of documents) {
  const source = readFileSync(document, "utf8");
  if ((source.match(/^```/gm)?.length ?? 0) % 2 !== 0)
    throw new Error(`Unclosed fence in ${document}`);
  for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(document), target);
    if (!existsSync(resolved)) throw new Error(`Broken local link in ${document}: ${match[1]}`);
  }
}

const configuration = readFileSync("docs/configuration.md", "utf8");
const missingFields = configurationFields.filter(
  (field) => !configuration.includes(`\`${field}\``),
);
if (missingFields.length > 0)
  throw new Error(`Configuration documentation missing: ${missingFields}`);

const readme = readFileSync("README.md", "utf8");
for (const command of ["pnpm install --frozen-lockfile", "pnpm db:migrate", "pnpm check"]) {
  if (!readme.includes(command)) throw new Error(`README missing canonical command: ${command}`);
}
process.stdout.write(
  `Documentation links, fences, commands, and ${configurationFields.length} configuration fields are valid.\n`,
);
