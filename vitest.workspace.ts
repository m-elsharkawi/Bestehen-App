import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ["default", "junit"],
    outputFile: {
      junit: "test-results/vitest-junit.xml",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      exclude: ["**/dist/**", "**/.next/**", "**/*.test.*", "**/tests/**"],
    },
    projects: [
      {
        test: {
          name: "unit",
          include: [
            "packages/*/src/**/*.test.ts",
            "packages/*/src/**/*.test.tsx",
            "apps/*/src/**/*.unit.test.ts",
            "apps/*/src/**/*.unit.test.tsx",
            "scripts/check-design-coverage-ids.test.mjs",
            "scripts/check-assets.integration.test.mjs",
          ],
          exclude: ["**/*.integration.test.ts", "**/*.process.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: [
            "packages/*/src/**/*.integration.test.ts",
            "apps/*/src/**/*.integration.test.ts",
          ],
          testTimeout: 30_000,
          hookTimeout: 30_000,
          fileParallelism: false,
        },
      },
      {
        test: {
          name: "process",
          include: ["apps/*/src/**/*.process.test.ts", "apps/*/tests/**/*.process.test.ts"],
          testTimeout: 45_000,
          hookTimeout: 45_000,
          fileParallelism: false,
        },
      },
    ],
  },
});
