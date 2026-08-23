import pino, { type Logger } from "pino";
import { z } from "zod";

const strictBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .default(false);

const positivePort = z.coerce.number().int().min(1).max(65_535);
const fakeOrConfigured = z.enum(["fake", "configured"]);

const serverEnvironmentSchema = z
  .object({
    BESTEHEN_APP_ENV: z.enum(["local", "test", "preview", "staging", "production"]),
    BESTEHEN_RELEASE_COMMIT: z.string().min(1).max(64),
    BESTEHEN_RELEASE_DIRTY: strictBoolean,
    BESTEHEN_SCHEMA_MIN_REVISION: z.string().min(1).max(128).default("baseline"),
    BESTEHEN_SCHEMA_MAX_REVISION: z.string().min(1).max(128).default("baseline"),
    BESTEHEN_WEB_PORT: positivePort.default(3000),
    BESTEHEN_WORKER_PORT: positivePort.default(3001),
    BESTEHEN_SHUTDOWN_GRACE_MS: z.coerce.number().int().min(100).max(60_000).default(5000),
    BESTEHEN_LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
    BESTEHEN_LOG_FORMAT: z.literal("json").default("json"),
    DATABASE_URL: z.string().url().startsWith("postgresql://"),
    BESTEHEN_AUTH_ADAPTER: fakeOrConfigured.default("fake"),
    BESTEHEN_OBJECT_STORAGE_ADAPTER: fakeOrConfigured.default("fake"),
    BESTEHEN_EMAIL_ADAPTER: fakeOrConfigured.default("fake"),
    BESTEHEN_AI_ADAPTER: fakeOrConfigured.default("fake"),
    BESTEHEN_STT_ADAPTER: fakeOrConfigured.default("fake"),
    BESTEHEN_TTS_ADAPTER: fakeOrConfigured.default("fake"),
    BESTEHEN_FLAG_GUEST_PRESENTATION: strictBoolean,
    BESTEHEN_FLAG_ACCOUNT_OPTIONAL_PRESENTATION: strictBoolean,
    BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS: strictBoolean,
    BESTEHEN_FLAG_PAID_PRODUCTIVE_PROCESSING: strictBoolean,
    BESTEHEN_FLAG_PUBLIC_OBJECT_ACCESS: strictBoolean,
    BESTEHEN_FLAG_EXPERIMENTAL_PRODUCT_BEHAVIOR: strictBoolean,
    BESTEHEN_AUTH0_DOMAIN: z.string().min(1).optional(),
    BESTEHEN_AUTH0_CLIENT_ID: z.string().min(1).optional(),
    BESTEHEN_AUTH0_SESSION_SECRET: z.string().min(16).optional(),
    BESTEHEN_OWNER_ALLOWLIST: z.string().min(1).optional(),
    BESTEHEN_APPLICATION_BASE_URL: z.string().url().optional(),
    BESTEHEN_S3_ENDPOINT: z.string().url().optional(),
    BESTEHEN_S3_REGION: z.string().min(1).optional(),
    BESTEHEN_S3_BUCKET: z.string().min(1).optional(),
    BESTEHEN_S3_PREFIX: z.string().min(1).optional(),
    BESTEHEN_S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    BESTEHEN_S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    BESTEHEN_EMAIL_API_KEY: z.string().min(1).optional(),
    BESTEHEN_AI_API_KEY: z.string().min(1).optional(),
    BESTEHEN_STT_API_KEY: z.string().min(1).optional(),
    BESTEHEN_TTS_API_KEY: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((environment, context) => {
    const adapterFields: ReadonlyArray<
      readonly [keyof typeof environment, readonly (keyof typeof environment)[]]
    > = [
      [
        "BESTEHEN_AUTH_ADAPTER",
        [
          "BESTEHEN_AUTH0_DOMAIN",
          "BESTEHEN_AUTH0_CLIENT_ID",
          "BESTEHEN_AUTH0_SESSION_SECRET",
          "BESTEHEN_OWNER_ALLOWLIST",
          "BESTEHEN_APPLICATION_BASE_URL",
        ],
      ],
      [
        "BESTEHEN_OBJECT_STORAGE_ADAPTER",
        [
          "BESTEHEN_S3_ENDPOINT",
          "BESTEHEN_S3_REGION",
          "BESTEHEN_S3_BUCKET",
          "BESTEHEN_S3_PREFIX",
          "BESTEHEN_S3_ACCESS_KEY_ID",
          "BESTEHEN_S3_SECRET_ACCESS_KEY",
        ],
      ],
      ["BESTEHEN_EMAIL_ADAPTER", ["BESTEHEN_EMAIL_API_KEY"]],
      ["BESTEHEN_AI_ADAPTER", ["BESTEHEN_AI_API_KEY"]],
      ["BESTEHEN_STT_ADAPTER", ["BESTEHEN_STT_API_KEY"]],
      ["BESTEHEN_TTS_ADAPTER", ["BESTEHEN_TTS_API_KEY"]],
    ];

    for (const [adapter, requiredFields] of adapterFields) {
      if (environment[adapter] !== "configured") continue;
      for (const field of requiredFields) {
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
      for (const [adapter] of adapterFields) {
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
] as const;

export function parseServerEnvironment(
  input: Record<string, string | undefined>,
): ServerEnvironment {
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
    application: "stage-01-baseline",
    content: "not-produced",
    evaluation: "not-produced",
    model: "not-produced",
  };
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
}

export function createLogger(context: LoggerContext, destination?: NodeJS.WritableStream): Logger {
  return pino(
    {
      base: context,
      level: "info",
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
