import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("P04-A11Y-001 personal entry is keyboard reachable and axe-clean", async ({
  page,
  browserName,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Evidence you can inspect");
  await expect(page.getByText("Registration is closed.")).toBeVisible();
  await page.keyboard.press("Tab");
  if (browserName === "webkit") {
    // macOS WebKit follows the host full-keyboard-access preference for links.
    await page.getByRole("link", { name: "Skip to main content" }).focus();
  }
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("P04-ROUTE-001 protected and focused product routes fail closed", async ({ page }) => {
  for (const [path, returnPath] of [
    ["/coach", "/coach"],
    ["/readiness", "/readiness"],
    ["/attempt/synthetic", "/attempt/current"],
  ] as const) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/auth\/failure\?code=identity_not_configured$/);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/auth/failure");
    expect(url.searchParams.get("code")).toBe("identity_not_configured");
    expect(page.url()).not.toContain("synthetic");
    expect(returnPath.startsWith("/")).toBe(true);
  }
});

test("P04-RSP-001 representative views reflow at 320 and 200 percent text", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/ui-fixtures/readiness");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await expect(page.getByText("Not enough evidence").first()).toBeVisible();
  await expect(page.getByText("Gate F: not met")).toBeVisible();
});

test("P04-RSP-001 representative view reflows at a 400 percent effective zoom spot", async ({
  browser,
}) => {
  const context = await browser.newContext({
    deviceScaleFactor: 4,
    viewport: { width: 320, height: 720 },
  });
  const page = await context.newPage();
  await page.goto("/ui-fixtures/coach");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(4);
  await expect(page.getByRole("heading", { name: "Your next useful session" })).toBeVisible();
  await context.close();
});

test("P04-RSP-001 compact and large navigation use one information architecture", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ui-fixtures/coach");
  const compactNav = page.getByRole("navigation", { name: "Primary" });
  await expect(compactNav).toHaveCSS("position", "sticky");
  await expect(page.getByRole("link", { name: "Coach" })).toHaveAttribute("aria-current", "page");
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(compactNav).toHaveCSS("position", "sticky");
  await expect(page.getByRole("link", { name: "Progress" })).toBeVisible();
  expect(
    await compactNav.locator("ul").evaluate((node) => getComputedStyle(node).gridTemplateColumns),
  ).not.toContain(" ");
});

test("P04-A11Y-001 focused views suppress primary navigation and name work conditions", async ({
  page,
}) => {
  await page.goto("/ui-fixtures/writing");
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Attempt conditions" })).toBeVisible();
  await expect(page.getByLabel("Your draft")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("P04-A11Y-001 reduced motion, forced colors, and draft recovery remain usable", async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({
    reducedMotion: "reduce",
    forcedColors: browserName === "chromium" ? "active" : "none",
  });
  await page.goto("/ui-fixtures/conflict");
  await expect(page.getByRole("heading", { name: "This device" })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(3);
  expect(
    await page.locator(".app-shell").evaluate((node) => getComputedStyle(node).transform),
  ).toBe("none");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("P04-SECURITY-001 fixtures make no third-party UI request and avoid forbidden copy", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:3300") external.push(request.url());
  });
  for (const view of ["readiness", "account", "data", "session-expiry", "transfer"]) {
    await page.goto(`/ui-fixtures/${view}`);
    const body = (await page.locator("body").innerText()).toLowerCase();
    for (const forbidden of [
      "pass probability",
      "chance of passing",
      "password",
      "queue",
      "bucket",
      "auth0",
      "openai",
      "still counts",
      "backup is erased immediately",
    ])
      expect(body).not.toContain(forbidden);
  }
  expect(external).toEqual([]);
});

test("P04-COMPONENT-001 deterministic gallery exposes all component families", async ({ page }) => {
  await page.goto("/ui-fixtures/gallery");
  await expect(page.locator("[data-component-family]")).toHaveCount(43);
  const overlayTrigger = page.getByRole("button", { name: "Open Overlay" });
  await overlayTrigger.click();
  await expect(page.getByRole("dialog", { name: "Overlay" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(overlayTrigger).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
