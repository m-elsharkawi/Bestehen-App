import pino, { type Logger } from "pino";
import { z } from "zod";

const strictBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .default(false);

const positivePort = z.coerce.number().int().min(1).max(65_535);
const positiveMicroUsd = z.coerce.number().int().positive();
function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "::1" ||
    /^127(?:\.\d{1,3}){3}$/.test(normalized)
  );
}

const httpsOrigin = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      !url.hostname.includes("*") &&
      !isLoopbackHostname(url.hostname)
    );
  });
const auth0EuIssuer = httpsOrigin.refine((value) =>
  new URL(value).hostname.endsWith(".eu.auth0.com"),
);
const r2EuEndpoint = httpsOrigin.refine((value) =>
  new URL(value).hostname.endsWith(".eu.r2.cloudflarestorage.com"),
);

const adapterRequirements = [
  {
    adapter: "BESTEHEN_AUTH_ADAPTER",
    configured: "auth0",
    fields: [
      "BESTEHEN_AUTH0_ISSUER_BASE_URL",
      "BESTEHEN_AUTH0_CLIENT_ID",
      "BESTEHEN_AUTH0_CLIENT_SECRET",
      "BESTEHEN_AUTH0_SESSION_SECRET",
      "BESTEHEN_AUTH0_OWNER_ALLOWLIST_REFERENCE",
      "BESTEHEN_APPLICATION_BASE_URL",
      "BESTEHEN_AUTH0_CONNECTION",
      "BESTEHEN_AUTH0_CALLBACK_PATH",
      "BESTEHEN_AUTH0_SESSION_POLICY_REVISION",
    ],
  },
  {
    adapter: "BESTEHEN_OBJECT_STORAGE_ADAPTER",
    configured: "r2",
    fields: [
      "BESTEHEN_S3_ENDPOINT",
      "BESTEHEN_S3_REGION",
      "BESTEHEN_S3_BUCKET",
      "BESTEHEN_S3_ALLOWED_PREFIXES",
      "BESTEHEN_S3_ACCESS_KEY_ID",
      "BESTEHEN_S3_SECRET_ACCESS_KEY",
    ],
  },
  {
    adapter: "BESTEHEN_EMAIL_ADAPTER",
    configured: "ses",
    fields: [
      "BESTEHEN_SES_REGION",
      "BESTEHEN_SES_FROM_REFERENCE",
      "BESTEHEN_SES_CONFIGURATION_SET",
      "BESTEHEN_SES_ACCESS_KEY_ID",
      "BESTEHEN_SES_SECRET_ACCESS_KEY",
    ],
  },
  {
    adapter: "BESTEHEN_AI_ADAPTER",
    configured: "gemini",
    fields: ["BESTEHEN_GEMINI_MODEL", "BESTEHEN_GEMINI_API_KEY"],
  },
  {
    adapter: "BESTEHEN_STT_ADAPTER",
    configured: "openai",
    fields: ["BESTEHEN_OPENAI_STT_MODEL", "BESTEHEN_OPENAI_STT_API_KEY"],
  },
  {
    adapter: "BESTEHEN_TTS_ADAPTER",
    configured: "openai",
    fields: ["BESTEHEN_OPENAI_TTS_MODEL", "BESTEHEN_OPENAI_TTS_API_KEY"],
  },
] as const;

const paidEnvelopeFields = [
  "BESTEHEN_PAID_DAILY_ENVELOPE_MICRO_USD",
  "BESTEHEN_PAID_ROLLING_30D_ENVELOPE_MICRO_USD",
  "BESTEHEN_PAID_ENVELOPE_POLICY_REVISION",
  "BESTEHEN_PAID_ENVELOPE_VERIFIED_AT",
] as const;

const serverEnvironmentSchema = z
  .object({
    BESTEHEN_APP_ENV: z.enum(["local", "test", "preview", "staging", "production"]),
    BESTEHEN_RELEASE_COMMIT: z.string().min(1).max(64),
    BESTEHEN_RELEASE_DIRTY: strictBoolean,
    BESTEHEN_SCHEMA_MIN_REVISION: z.string().min(1).max(128).default("20260825_040_p03_foundation"),
    BESTEHEN_SCHEMA_MAX_REVISION: z.string().min(1).max(128).default("20260825_040_p03_foundation"),
    BESTEHEN_WEB_PORT: positivePort.default(3000),
    BESTEHEN_WORKER_PORT: positivePort.default(3001),
    BESTEHEN_SHUTDOWN_GRACE_MS: z.coerce.number().int().min(100).max(60_000).default(5000),
    BESTEHEN_LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
    BESTEHEN_LOG_FORMAT: z.literal("json").default("json"),
    DATABASE_URL: z.string().url().startsWith("postgresql://"),
    BESTEHEN_MIGRATOR_DATABASE_URL: z.string().url().startsWith("postgresql://").optional(),
    BESTEHEN_WEB_DATABASE_URL: z.string().url().startsWith("postgresql://").optional(),
    BESTEHEN_WORKER_DATABASE_URL: z.string().url().startsWith("postgresql://").optional(),
    BESTEHEN_AUTH_ADAPTER: z.enum(["fake", "auth0"]).default("fake"),
    BESTEHEN_OBJECT_STORAGE_ADAPTER: z.enum(["fake", "r2"]).default("fake"),
    BESTEHEN_EMAIL_ADAPTER: z.enum(["fake", "ses"]).default("fake"),
    BESTEHEN_AI_ADAPTER: z.enum(["fake", "gemini"]).default("fake"),
    BESTEHEN_STT_ADAPTER: z.enum(["fake", "openai"]).default("fake"),
    BESTEHEN_TTS_ADAPTER: z.enum(["fake", "openai"]).default("fake"),
    BESTEHEN_FLAG_GUEST_PRESENTATION: strictBoolean,
    BESTEHEN_FLAG_ACCOUNT_OPTIONAL_PRESENTATION: strictBoolean,
    BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS: strictBoolean,
    BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING: strictBoolean,
    BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS: strictBoolean,
    BESTEHEN_FLAG_EXPERIMENTAL_PRODUCT_BEHAVIOR: strictBoolean,
    BESTEHEN_AUTH0_ISSUER_BASE_URL: auth0EuIssuer.optional(),
    BESTEHEN_AUTH0_CLIENT_ID: z.string().min(1).optional(),
    BESTEHEN_AUTH0_CLIENT_SECRET: z.string().min(16).optional(),
    BESTEHEN_AUTH0_SESSION_SECRET: z.string().min(32).optional(),
    BESTEHEN_AUTH0_OWNER_ALLOWLIST_REFERENCE: z.string().min(1).optional(),
    BESTEHEN_APPLICATION_BASE_URL: httpsOrigin.optional(),
    BESTEHEN_AUTH0_CONNECTION: z.literal("email").optional(),
    BESTEHEN_AUTH0_CALLBACK_PATH: z.literal("/auth/callback").optional(),
    BESTEHEN_AUTH0_SESSION_POLICY_REVISION: z.literal("session-policy/v1").optional(),
    BESTEHEN_S3_ENDPOINT: r2EuEndpoint.optional(),
    BESTEHEN_S3_REGION: z.literal("auto").optional(),
    BESTEHEN_S3_BUCKET: z
      .string()
      .regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/)
      .optional(),
    BESTEHEN_S3_ALLOWED_PREFIXES: z.literal("media/approved/,audio/raw/,exports/,tmp/").optional(),
    BESTEHEN_S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    BESTEHEN_S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    BESTEHEN_SES_REGION: z.literal("eu-central-1").optional(),
    BESTEHEN_SES_FROM_REFERENCE: z.string().min(1).optional(),
    BESTEHEN_SES_CONFIGURATION_SET: z.string().min(1).optional(),
    BESTEHEN_SES_ACCESS_KEY_ID: z.string().min(1).optional(),
    BESTEHEN_SES_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    BESTEHEN_GEMINI_MODEL: z.literal("gemini-3.6-flash").optional(),
    BESTEHEN_GEMINI_API_KEY: z.string().min(1).optional(),
    BESTEHEN_OPENAI_STT_MODEL: z.literal("gpt-4o-mini-transcribe-2025-12-15").optional(),
    BESTEHEN_OPENAI_STT_API_KEY: z.string().min(1).optional(),
    BESTEHEN_OPENAI_TTS_MODEL: z.literal("gpt-4o-mini-tts-2025-12-15").optional(),
    BESTEHEN_OPENAI_TTS_API_KEY: z.string().min(1).optional(),
    BESTEHEN_PAID_DAILY_ENVELOPE_MICRO_USD: positiveMicroUsd.optional(),
    BESTEHEN_PAID_ROLLING_30D_ENVELOPE_MICRO_USD: positiveMicroUsd.optional(),
    BESTEHEN_PAID_ENVELOPE_POLICY_REVISION: z.string().min(1).optional(),
    BESTEHEN_PAID_ENVELOPE_VERIFIED_AT: z.iso.date().optional(),
  })
  .strict()
  .superRefine((environment, context) => {
    for (const { adapter, configured, fields } of adapterRequirements) {
      if (environment[adapter] !== configured) continue;
      for (const field of fields) {
        if (!environment[field]) {
          context.addIssue({
            code: "custom",
            path: [field],
            message: `is required when ${adapter} is configured`,
          });
        }
      }
    }

    if (environment.BESTEHEN_APP_ENV === "production") {
      for (const { adapter } of adapterRequirements) {
        if (environment[adapter] === "fake") {
          context.addIssue({
            code: "custom",
            path: [adapter],
            message: "fake adapters are forbidden in production",
          });
        }
      }
    }

    if (
      environment.BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS &&
      environment.BESTEHEN_APP_ENV !== "production" &&
      environment.BESTEHEN_APP_ENV !== "staging"
    ) {
      context.addIssue({
        code: "custom",
        path: ["BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS"],
        message: "external provider calls are forbidden in local, test, and preview profiles",
      });
    }

    const providedEnvelopeFields = paidEnvelopeFields.filter((field) => environment[field]);
    if (
      providedEnvelopeFields.length > 0 &&
      providedEnvelopeFields.length !== paidEnvelopeFields.length
    ) {
      for (const field of paidEnvelopeFields.filter((field) => !environment[field])) {
        context.addIssue({ code: "custom", path: [field], message: "paid envelope is incomplete" });
      }
    }

    if (environment.BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING) {
      if (!environment.BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS) {
        context.addIssue({
          code: "custom",
          path: ["BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING"],
          message: "paid processing requires external provider calls",
        });
      }
      for (const field of paidEnvelopeFields) {
        if (!environment[field]) {
          context.addIssue({ code: "custom", path: [field], message: "paid envelope is required" });
        }
      }
      for (const [field, expected] of [
        ["BESTEHEN_AI_ADAPTER", "gemini"],
        ["BESTEHEN_STT_ADAPTER", "openai"],
        ["BESTEHEN_TTS_ADAPTER", "openai"],
      ] as const) {
        if (environment[field] !== expected) {
          context.addIssue({
            code: "custom",
            path: [field],
            message: "paid adapter is not configured",
          });
        }
      }
    }

    if (environment.BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS) {
      context.addIssue({
        code: "custom",
        path: ["BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS"],
        message: "public object access is forbidden for the personal profile",
      });
    }
  });

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

const explicitServerKeys = [
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
  "BESTEHEN_MIGRATOR_DATABASE_URL",
  "BESTEHEN_WEB_DATABASE_URL",
  "BESTEHEN_WORKER_DATABASE_URL",
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
  "BESTEHEN_AUTH0_ISSUER_BASE_URL",
  "BESTEHEN_AUTH0_CLIENT_ID",
  "BESTEHEN_AUTH0_CLIENT_SECRET",
  "BESTEHEN_AUTH0_SESSION_SECRET",
  "BESTEHEN_AUTH0_OWNER_ALLOWLIST_REFERENCE",
  "BESTEHEN_APPLICATION_BASE_URL",
  "BESTEHEN_AUTH0_CONNECTION",
  "BESTEHEN_AUTH0_CALLBACK_PATH",
  "BESTEHEN_AUTH0_SESSION_POLICY_REVISION",
  "BESTEHEN_S3_ENDPOINT",
  "BESTEHEN_S3_REGION",
  "BESTEHEN_S3_BUCKET",
  "BESTEHEN_S3_ALLOWED_PREFIXES",
  "BESTEHEN_S3_ACCESS_KEY_ID",
  "BESTEHEN_S3_SECRET_ACCESS_KEY",
  "BESTEHEN_SES_REGION",
  "BESTEHEN_SES_FROM_REFERENCE",
  "BESTEHEN_SES_CONFIGURATION_SET",
  "BESTEHEN_SES_ACCESS_KEY_ID",
  "BESTEHEN_SES_SECRET_ACCESS_KEY",
  "BESTEHEN_GEMINI_MODEL",
  "BESTEHEN_GEMINI_API_KEY",
  "BESTEHEN_OPENAI_STT_MODEL",
  "BESTEHEN_OPENAI_STT_API_KEY",
  "BESTEHEN_OPENAI_TTS_MODEL",
  "BESTEHEN_OPENAI_TTS_API_KEY",
  "BESTEHEN_PAID_DAILY_ENVELOPE_MICRO_USD",
  "BESTEHEN_PAID_ROLLING_30D_ENVELOPE_MICRO_USD",
  "BESTEHEN_PAID_ENVELOPE_POLICY_REVISION",
  "BESTEHEN_PAID_ENVELOPE_VERIFIED_AT",
] as const;

export type ServerConfigurationScope =
  | "complete"
  | "web"
  | "worker"
  | "migrator"
  | "owner-bootstrap";

function parseServerEnvironmentInput(input: Record<string, string | undefined>): ServerEnvironment {
  const relevantEntries = Object.entries(input).filter(
    ([key, value]) =>
      value !== undefined && (key === "DATABASE_URL" || key.startsWith("BESTEHEN_")),
  );
  const unknown = relevantEntries.filter(
    ([key]) => !explicitServerKeys.includes(key as (typeof explicitServerKeys)[number]),
  );
  if (unknown.length > 0) {
    throw new Error(
      `Unknown server configuration field(s): ${unknown.map(([key]) => key).join(", ")}`,
    );
  }
  const parsedInput = Object.fromEntries(relevantEntries);
  const result = serverEnvironmentSchema.safeParse(parsedInput);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join(".") || "configuration");
    throw new Error(`Invalid server configuration field(s): ${[...new Set(fields)].join(", ")}`);
  }
  return result.data;
}

function assertScopedDeploymentConfiguration(
  environment: ServerEnvironment,
  scope: ServerConfigurationScope,
): void {
  const fields: string[] = [];
  if (
    ["preview", "staging", "production"].includes(environment.BESTEHEN_APP_ENV) &&
    ["complete", "web", "owner-bootstrap"].includes(scope) &&
    !environment.BESTEHEN_AUTH0_SESSION_SECRET
  ) {
    fields.push("BESTEHEN_AUTH0_SESSION_SECRET");
  }

  if (["staging", "production"].includes(environment.BESTEHEN_APP_ENV)) {
    const databaseFieldByScope = {
      web: "BESTEHEN_WEB_DATABASE_URL",
      worker: "BESTEHEN_WORKER_DATABASE_URL",
      migrator: "BESTEHEN_MIGRATOR_DATABASE_URL",
      "owner-bootstrap": "BESTEHEN_MIGRATOR_DATABASE_URL",
    } as const;
    const requiredDatabaseFields =
      scope === "complete"
        ? ([
            "BESTEHEN_MIGRATOR_DATABASE_URL",
            "BESTEHEN_WEB_DATABASE_URL",
            "BESTEHEN_WORKER_DATABASE_URL",
          ] as const)
        : ([databaseFieldByScope[scope]] as const);
    for (const field of requiredDatabaseFields) {
      if (field && !environment[field]) fields.push(field);
    }

    if (scope === "complete") {
      const roleUsers = [
        environment.BESTEHEN_MIGRATOR_DATABASE_URL,
        environment.BESTEHEN_WEB_DATABASE_URL,
        environment.BESTEHEN_WORKER_DATABASE_URL,
      ]
        .filter((value): value is string => Boolean(value))
        .map((value) => new URL(value).username);
      if (roleUsers.length === 3 && new Set(roleUsers).size !== 3) {
        fields.push("BESTEHEN_WEB_DATABASE_URL");
      }
    }
  }

  if (fields.length > 0) {
    throw new Error(`Invalid server configuration field(s): ${[...new Set(fields)].join(", ")}`);
  }
}

export function parseServerEnvironment(
  input: Record<string, string | undefined>,
): ServerEnvironment {
  const environment = parseServerEnvironmentInput(input);
  assertScopedDeploymentConfiguration(environment, "complete");
  return environment;
}

export function parseServerEnvironmentForService(
  input: Record<string, string | undefined>,
  scope: Exclude<ServerConfigurationScope, "complete">,
): ServerEnvironment {
  const environment = parseServerEnvironmentInput(input);
  assertScopedDeploymentConfiguration(environment, scope);
  return environment;
}

export const buildEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    BESTEHEN_RELEASE_COMMIT: z.string().min(1).max(64).default("build-not-specified"),
  })
  .strict();

export const publicEnvironmentSchema = z
  .object({
    NEXT_PUBLIC_APP_NAME: z.literal("Bestehen").default("Bestehen"),
  })
  .strict();

export interface FeatureFlags {
  readonly guestPresentation: boolean;
  readonly accountOptionalPresentation: boolean;
  readonly externalProviderCalls: boolean;
  readonly paidProductiveProcessing: boolean;
  readonly publicObjectAccess: boolean;
  readonly experimentalProductBehavior: boolean;
}

export function featureFlags(environment: ServerEnvironment): FeatureFlags {
  return {
    guestPresentation: environment.BESTEHEN_FLAG_GUEST_PRESENTATION,
    accountOptionalPresentation: environment.BESTEHEN_FLAG_ACCOUNT_OPTIONAL_PRESENTATION,
    externalProviderCalls: environment.BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS,
    paidProductiveProcessing: environment.BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING,
    publicObjectAccess: environment.BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS,
    experimentalProductBehavior: environment.BESTEHEN_FLAG_EXPERIMENTAL_PRODUCT_BEHAVIOR,
  };
}

export interface ReleaseMetadata {
  readonly commit: string;
  readonly dirty: boolean;
  readonly schema: { readonly minimum: string; readonly maximum: string };
  readonly flags: FeatureFlags;
  readonly application: string;
  readonly content: "not-produced";
  readonly evaluation: "not-produced";
  readonly model: "not-produced";
}

export function releaseMetadata(environment: ServerEnvironment): ReleaseMetadata {
  return {
    commit: environment.BESTEHEN_RELEASE_COMMIT,
    dirty: environment.BESTEHEN_RELEASE_DIRTY,
    schema: {
      minimum: environment.BESTEHEN_SCHEMA_MIN_REVISION,
      maximum: environment.BESTEHEN_SCHEMA_MAX_REVISION,
    },
    flags: featureFlags(environment),
    application: "stage-03-foundation",
    content: "not-produced",
    evaluation: "not-produced",
    model: "not-produced",
  };
}

export function appSecuritySecret(environment: ServerEnvironment): string {
  if (environment.BESTEHEN_AUTH0_SESSION_SECRET) return environment.BESTEHEN_AUTH0_SESSION_SECRET;
  if (environment.BESTEHEN_APP_ENV === "local" || environment.BESTEHEN_APP_ENV === "test") {
    return "synthetic-local-only-session-secret-not-for-deployment";
  }
  throw new Error("Protected App session/transaction secret is unavailable");
}

export function databaseUrlFor(
  environment: ServerEnvironment,
  role: "migrator" | "web" | "worker",
): string {
  const configured = {
    migrator: environment.BESTEHEN_MIGRATOR_DATABASE_URL,
    web: environment.BESTEHEN_WEB_DATABASE_URL,
    worker: environment.BESTEHEN_WORKER_DATABASE_URL,
  }[role];
  return configured ?? environment.DATABASE_URL;
}

const secretKeyPattern =
  /authorization|cookie|secret|password|token|api[-_]?key|access[-_]?key|session|owner|allowlist|email|body|response|transcript|audio|provider|signed[-_]?url/i;
const credentialValuePattern =
  /(?:postgres(?:ql)?:\/\/[^\s]+:[^\s]+@|bearer\s+[a-z0-9._-]+|[?&](?:signature|token|key)=|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i;

export function sanitizeLogPayload(value: unknown, key = ""): unknown {
  if (secretKeyPattern.test(key)) return "[REDACTED]";
  if (typeof value === "string") {
    return credentialValuePattern.test(value) ? "[REDACTED]" : value;
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeLogPayload(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeLogPayload(entryValue, entryKey),
      ]),
    );
  }
  return value;
}

export interface LoggerContext {
  readonly service: "web" | "worker" | "migrator";
  readonly environment: ServerEnvironment["BESTEHEN_APP_ENV"];
  readonly releaseCommit: string;
  readonly level: ServerEnvironment["BESTEHEN_LOG_LEVEL"];
}

export function createLogger(context: LoggerContext, destination?: NodeJS.WritableStream): Logger {
  return pino(
    {
      base: {
        service: context.service,
        environment: context.environment,
        releaseCommit: context.releaseCommit,
      },
      level: context.level,
      formatters: {
        log: (payload) => sanitizeLogPayload(payload) as Record<string, unknown>,
      },
      redact: {
        paths: [
          "authorization",
          "cookie",
          "headers.authorization",
          "headers.cookie",
          "*.secret",
          "*.token",
          "*.password",
          "*.databaseUrl",
          "*.email",
          "*.body",
          "*.audio",
          "*.transcript",
          "*.providerResponse",
        ],
        censor: "[REDACTED]",
      },
    },
    destination,
  );
}
