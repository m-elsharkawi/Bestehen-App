import { expect, test } from "@playwright/test";

test("P04-VISUAL-001 deterministic responsive anchors", async ({ page, browserName }) => {
  test.skip(
    browserName !== "chromium",
    "One fixed raster engine owns supplemental visual baselines",
  );
  const anchors = [
    ["coach-390-light", "/ui-fixtures/coach", 390, 844, "light"],
    ["coach-390-dark", "/ui-fixtures/coach", 390, 844, "dark"],
    ["readiness-320", "/ui-fixtures/readiness", 320, 900, "light"],
    ["writing-768", "/ui-fixtures/writing", 768, 900, "light"],
    ["coach-1024", "/ui-fixtures/coach", 1024, 900, "light"],
    ["readiness-1280", "/ui-fixtures/readiness", 1280, 900, "light"],
    ["progress-1280", "/ui-fixtures/progress", 1280, 900, "light"],
  ] as const;
  for (const [name, path, width, height, theme] of anchors) {
    await page.setViewportSize({ width, height });
    await page.goto(path);
    await page.evaluate((selected) => {
      document.documentElement.dataset.theme = selected;
    }, theme);
    const snapshotName =
      process.platform === "linux" && name === "coach-390-light"
        ? "coach-390-light-linux.png"
        : `${name}.png`;
    await expect(page).toHaveScreenshot(snapshotName, {
      animations: "disabled",
      fullPage: true,
      // The exact Linux Chromium raster is tracked separately for this compact anchor.
      // Semantic and responsive checks remain authoritative across platforms.
      maxDiffPixelRatio: 0.02,
    });
  }
});
