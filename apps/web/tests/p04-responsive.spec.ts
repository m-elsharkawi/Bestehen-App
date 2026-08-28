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

test("P04-A11Y-001 server content remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Evidence you can inspect");
  await expect(page.getByText("Registration is closed.")).toBeVisible();
  await context.close();
});

test("P04-ROUTE-001 protected and focused product routes fail closed", async ({ page }) => {
  for (const [path, returnPath] of [
    ["/coach", "/coach"],
    ["/readiness", "/readiness"],
    ["/attempt/synthetic", "/attempt/current"],
  ] as const) {
    await page.goto(`${path}?returnTo=${encodeURIComponent(returnPath)}`);
    await expect(page).toHaveURL(/\/auth\/failure\?code=identity_not_configured/);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/auth/failure");
    expect(url.searchParams.get("code")).toBe("identity_not_configured");
    expect(url.searchParams.get("returnTo")).toBe(returnPath);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Return" })).toHaveAttribute("href", "/");
    await page.getByRole("link", { name: "Return" }).click();
    await expect(page).not.toHaveURL(/\/auth\/failure/);
  }
});

test("P04-ROUTE-001 synthetic auth completes only with explicit signal", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-bestehen-synthetic-auth": "1" });
  await page.goto("/auth/login?returnTo=%2Freadiness&synthetic=1");
  await expect(page).toHaveURL(/\/readiness$/);
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

test("P04-RSP-001 representative view reflows at the 400 percent text-zoom spot", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/ui-fixtures/coach");
  await page.addStyleTag({ content: "html { font-size: 400% !important; }" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await expect(page.getByRole("heading", { name: "Your next useful session" })).toBeVisible();
});

test("P04-RSP-001 breakpoint edges and representative text scaling retain content", async ({
  page,
}) => {
  for (const width of [320, 360, 390, 479, 480, 767, 768, 1023, 1024, 1279, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ui-fixtures/coach");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await expect(page.getByRole("heading", { name: "Your next useful session" })).toBeVisible();
  }
  for (const view of [
    "coach",
    "readiness",
    "train",
    "progress",
    "account",
    "data",
    "session",
    "reading",
    "language",
    "writing",
    "result",
    "mock",
    "mock-result",
    "conflict",
    "transfer",
    "session-expiry",
  ]) {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(`/ui-fixtures/${view}`);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
});

test("P04-RSP-001 focused mock content remains at most 720 CSS pixels", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/ui-fixtures/mock");
  const width = await page
    .locator(".mock-measure")
    .evaluate((node) => node.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(720);
});

test("P04-RSP-001 resize preserves theme and draft while history returns", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ui-fixtures/writing");
  await page.getByLabel("Your draft").fill("Erhaltener Entwurf");
  await page.evaluate(() => {
    localStorage.setItem("bestehen-theme", "dark");
    document.documentElement.dataset.theme = "dark";
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByLabel("Your draft")).toHaveValue("Erhaltener Entwurf");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".sticky-action")).toBeVisible();
  await page.goto("/ui-fixtures/coach");
  await page.goto("/ui-fixtures/progress");
  await page.goBack();
  await expect(page).toHaveURL(/ui-fixtures\/coach/);
});

test("P04-A11Y-001 local theme applies before hydration without warnings", async ({ page }) => {
  const messages: string[] = [];
  page.on("console", (message) => messages.push(message.text()));
  await page.addInitScript(() => localStorage.setItem("bestehen-theme", "dark"));
  await page.goto("/ui-fixtures/coach");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(messages.filter((message) => /hydration|did not match/i.test(message))).toEqual([]);
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
      "provider",
      "queue",
      "storage",
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
  await expect(page.locator("[data-fixture-variant]")).toHaveCount(126);
  const overlayTrigger = page
    .locator("[data-component-family='C04'] [data-fixture-variant='dialog']")
    .getByRole("button", { name: "Open Overlay" });
  await overlayTrigger.click();
  await expect(page.getByRole("dialog", { name: "Overlay" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(overlayTrigger).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("P04-A11Y-001 inert gallery cases do not promise missing interaction behavior", async ({
  page,
}) => {
  await page.goto("/ui-fixtures/gallery");
  const family = (id: string) => page.locator(`[data-component-family='${id}']`);

  for (const variant of ["segmented", "tabs"]) {
    const choice = family("C08").locator(`[data-fixture-variant='${variant}']`);
    await expect(choice).toContainText("Current");
    await expect(choice.locator("a, button, input, [role='tablist'], [role='tab']")).toHaveCount(0);
  }
  const chips = family("C08").locator("[data-fixture-variant='chip'] input");
  await expect(chips).toHaveCount(2);
  await expect(chips.first()).toBeEnabled();

  const revealedAnswer = family("C11").locator("[data-fixture-variant='revealed']");
  await expect(revealedAnswer.getByRole("radio").first()).toBeEnabled();
  await expect(revealedAnswer.locator("[role='status'], [aria-live]")).toHaveCount(0);

  for (const id of ["C12", "C14"]) {
    const controls = family(id).getByRole("button");
    expect(await controls.count()).toBeGreaterThan(0);
    for (let index = 0; index < (await controls.count()); index++) {
      await expect(controls.nth(index)).toBeDisabled();
    }
    await expect(family(id)).toContainText("unavailable in this static preview");
  }

  await expect(family("C13").locator("[data-fixture-variant='input'] input")).toBeEnabled();
  const clozeOptions = family("C13").locator("[data-fixture-variant='options'] input");
  await expect(clozeOptions).toHaveCount(2);
  await expect(clozeOptions.first()).toBeEnabled();

  const listening = family("C39");
  await expect(listening).toContainText("Audio controls are unavailable");
  expect(await listening.locator("audio").getAttribute("controls")).toBeNull();

  const autosave = family("C40").locator("[data-fixture-variant='autosave']");
  await expect(autosave.getByLabel("Your draft")).toBeEnabled();
  await expect(autosave).toContainText("No draft is saved by this fixture");
  await expect(autosave).not.toContainText("Saved on this device");
  await expect(autosave.locator("[role='status'], [aria-live]")).toHaveCount(0);

  const speaking = family("C41");
  const speakingControls = speaking.getByRole("button");
  await expect(speakingControls).toHaveCount(4);
  for (let index = 0; index < (await speakingControls.count()); index++) {
    await expect(speakingControls.nth(index)).toBeDisabled();
  }
  await expect(speaking.locator("[role='status'], [aria-live]")).toHaveCount(0);
  await expect(speaking).not.toContainText("Recording is in progress");
});

test("P04-A11Y-001 transfer statuses are named and axe-clean", async ({ page }) => {
  await page.goto("/ui-fixtures/transfer");
  await expect(
    page.getByRole("progressbar", { name: "Transfer status Sending 38% transferred" }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("P04-A11Y-001 sheet and destructive confirmation use their distinct modal contracts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto("/ui-fixtures/gallery");
  const sheet = page.locator("[data-fixture-variant='sheet']");
  await sheet.getByRole("button", { name: "Open Overlay" }).click();
  const sheetDialog = page.locator("dialog[data-overlay-kind='sheet']");
  await expect(sheetDialog).toBeVisible();
  expect(await sheetDialog.evaluate((node) => getComputedStyle(node).bottom)).toBe("0px");
  await page.keyboard.press("Escape");
  await expect(sheetDialog).toBeHidden();

  const destructive = page.locator("[data-fixture-variant='destructive-confirm']");
  const destructiveTrigger = destructive.getByRole("button", { name: "Open Overlay" });
  await destructiveTrigger.click();
  const destructiveDialog = page.locator("dialog[data-overlay-kind='destructive-confirm']");
  await expect(destructiveDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(destructiveDialog).toBeVisible();
  await destructiveDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(destructiveDialog).toBeHidden();
  await expect(destructiveTrigger).toBeFocused();
  await destructiveTrigger.click();
  await destructiveDialog.getByRole("button", { name: "Confirm" }).click();
  await expect(destructiveDialog).toBeHidden();
});

test("P04-A11Y-001 targets, errors, modal focus, and live priorities are observable", async ({
  page,
}) => {
  await page.goto("/ui-fixtures/a11y");
  const actions = page.locator("button:visible");
  for (let index = 0; index < (await actions.count()); index++) {
    const box = await actions.nth(index).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  }
  const fixtureButtons = page.locator(".fixture-actions button");
  const first = await fixtureButtons.nth(0).boundingBox();
  const second = await fixtureButtons.nth(1).boundingBox();
  expect((second?.x ?? 0) - ((first?.x ?? 0) + (first?.width ?? 0))).toBeGreaterThanOrEqual(8);

  await page.getByRole("button", { name: "Check response" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your answers" }).locator(".."),
  ).toBeFocused();
  await expect(page.getByLabel("Response")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Response")).toHaveAttribute("aria-describedby", /.+/);
  await expect(page.getByRole("link", { name: "A response is required" })).toHaveAttribute(
    "href",
    "#a11y-response",
  );

  const trigger = page.getByRole("button", { name: "Open Keyboard review" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Keyboard review" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Secondary dialog action" })).toBeFocused();
  expect(await dialog.evaluate((node) => node.matches(":modal"))).toBe(true);
  await page.getByLabel("Response").evaluate((node) => node.focus());
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();

  await page.getByRole("button", { name: "Polite update" }).click();
  await expect(
    page.locator("[aria-live='polite']").filter({ hasText: "Saved locally" }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Assertive update" }).click();
  await expect(
    page.locator("[aria-live='assertive']").filter({ hasText: "Recording stopped" }),
  ).toHaveCount(1);
  await expect(page.getByText("42 seconds")).not.toHaveAttribute("aria-live");
  await expect(page.getByText("65 percent margin")).not.toHaveAttribute("aria-live");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("P04-A11Y-001 readiness graphic facts have an equivalent text table", async ({ page }) => {
  await page.goto("/ui-fixtures/readiness");
  await expect(page.getByRole("table", { name: "Current component evidence" })).toContainText(
    "Written",
  );
  await expect(page.getByRole("table", { name: "Current component evidence" })).toContainText(
    "Oral",
  );
  await expect(page.getByText(/official line is 60.*personal margin is 65/i)).toBeVisible();
});
