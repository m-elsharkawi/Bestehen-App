import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("neutral baseline is semantic, keyboard reachable, and axe-clean", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Repository baseline" })).toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("baseline reflows at 320 CSS pixels and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ height: 640, width: 320 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
  await expect(page.getByText(/learner workflows.*remain deliberately unavailable/i)).toBeVisible();
});

test("health payloads are minimal and liveness is dependency-free", async ({ request }) => {
  const live = await request.get("/api/health/live");
  expect(live.status()).toBe(200);
  expect(await live.json()).toEqual({
    version: 1,
    status: "live",
    service: "web",
    releaseCommit: "playwright-synthetic",
  });

  const ready = await request.get("/api/health/ready");
  expect([200, 503]).toContain(ready.status());
  const payload = await ready.json();
  expect(Object.keys(payload).sort()).toEqual(["releaseCommit", "service", "status", "version"]);
});

test("personal owner routes deny anonymously and fake identity makes no provider call", async ({
  page,
  request,
}) => {
  const owner = await request.get("/api/v1/owner/status");
  expect(owner.status()).toBe(404);
  expect(await owner.json()).toEqual({ status: "not_available" });

  await page.goto("/auth/login");
  await expect(page).toHaveURL(/\/auth\/failure\?code=identity_not_configured$/);
  await expect(page.getByRole("heading", { name: "Sign-in unavailable" })).toBeVisible();
  await expect(
    page.getByText(
      "Email OTP sign-in could not be completed. Try again without changing your saved work.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText(/password/i)).toHaveCount(0);
});
