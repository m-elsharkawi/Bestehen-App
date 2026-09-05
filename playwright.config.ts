import { defineConfig, devices } from "@playwright/test";

const httpsPort = 3300;
const upstreamPort = 3301;
const connectProxyPort = 3302;
const publicOrigin = `https://app.bestehen.test:${httpsPort}`;
const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ?? "postgresql://synthetic:synthetic@127.0.0.1:5432/synthetic";

export default defineConfig({
  testDir: "./apps/web/tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results/playwright",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  use: {
    baseURL: publicOrigin,
    ignoreHTTPSErrors: true,
    proxy: { server: `http://127.0.0.1:${connectProxyPort}` },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "node scripts/serve-playwright-https.mjs apps/web/.next/standalone/apps/web/server.js",
    env: {
      ...process.env,
      BESTEHEN_AI_ADAPTER: "fake",
      BESTEHEN_APP_ENV: "test",
      BESTEHEN_AUTH_ADAPTER: "fake",
      BESTEHEN_EMAIL_ADAPTER: "fake",
      BESTEHEN_LOG_FORMAT: "json",
      BESTEHEN_LOG_LEVEL: "info",
      BESTEHEN_OBJECT_STORAGE_ADAPTER: "fake",
      BESTEHEN_APPLICATION_BASE_URL: publicOrigin,
      BESTEHEN_RELEASE_COMMIT: "playwright-synthetic",
      BESTEHEN_RELEASE_DIRTY: "false",
      BESTEHEN_SCHEMA_MAX_REVISION: "20260905_062_p05_listening_runtime",
      BESTEHEN_SCHEMA_MIN_REVISION: "20260825_040_p03_foundation",
      BESTEHEN_STT_ADAPTER: "fake",
      BESTEHEN_TTS_ADAPTER: "fake",
      DATABASE_URL: testDatabaseUrl,
      PLAYWRIGHT_CONNECT_PROXY_PORT: String(connectProxyPort),
      PLAYWRIGHT_HTTPS_PORT: String(httpsPort),
      PLAYWRIGHT_UPSTREAM_PORT: String(upstreamPort),
      TEST_DATABASE_URL: testDatabaseUrl,
    },
    ignoreHTTPSErrors: true,
    url: `https://127.0.0.1:${httpsPort}/api/health/live`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
