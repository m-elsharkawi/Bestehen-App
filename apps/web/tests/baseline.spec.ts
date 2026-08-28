import { expect, test } from "@playwright/test";

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
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign-in is not configured" }),
  ).toBeVisible();
  await expect(page.getByText(/owner's email code/i)).toBeVisible();
  await expect(page.getByText(/password/i)).toHaveCount(0);
});
