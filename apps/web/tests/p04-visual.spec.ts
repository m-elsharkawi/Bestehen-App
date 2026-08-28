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
    ["writing-768", "/ui-fixtures/writing?draft=autosave", 768, 900, "light"],
    ["coach-1024", "/ui-fixtures/coach", 1024, 900, "light"],
    ["readiness-1280", "/ui-fixtures/readiness", 1280, 900, "light"],
    ["progress-1280", "/ui-fixtures/progress", 1280, 900, "light"],
  ] as const;
  for (const [name, path, width, height, theme] of anchors) {
    await page.setViewportSize({ width, height });
    await page.goto(path);
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
        }
      `,
    });
    await page.evaluate((selected) => {
      document.documentElement.dataset.theme = selected;
    }, theme);
    if (name === "writing-768") {
      await expect(
        page.getByText("Autosave status preview. No draft is saved by this fixture."),
      ).toBeVisible();
    }
    await expect(page).toHaveScreenshot(`${name}.png`, {
      animations: "disabled",
      fullPage: true,
      // Self-hosted font hinting differs across macOS and Linux; semantic tests remain authoritative.
      maxDiffPixelRatio: 0.02,
    });
  }
});
