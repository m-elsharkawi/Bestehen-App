import { defineConfig, devices } from "@playwright/test";

const port = 3300;

export default defineConfig({
  testDir: "./apps/web/tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results/playwright",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "node apps/web/.next/standalone/apps/web/server.js",
    env: {
      ...process.env,
      BESTEHEN_AI_ADAPTER: "fake",
      BESTEHEN_APP_ENV: "test",
      BESTEHEN_AUTH_ADAPTER: "fake",
      BESTEHEN_EMAIL_ADAPTER: "fake",
      BESTEHEN_LOG_FORMAT: "json",
      BESTEHEN_LOG_LEVEL: "info",
      BESTEHEN_OBJECT_STORAGE_ADAPTER: "fake",
      BESTEHEN_RELEASE_COMMIT: "playwright-synthetic",
      BESTEHEN_RELEASE_DIRTY: "false",
      BESTEHEN_SCHEMA_MAX_REVISION: "baseline",
      BESTEHEN_SCHEMA_MIN_REVISION: "baseline",
      BESTEHEN_STT_ADAPTER: "fake",
      BESTEHEN_TTS_ADAPTER: "fake",
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        "postgresql://synthetic:synthetic@127.0.0.1:5432/synthetic",
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
    },
    url: `http://127.0.0.1:${port}/api/health/live`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
