import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    reporters: ["default", "junit"],
    outputFile: {
      junit: "test-results/vitest-junit.xml",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
    },
  },
});
