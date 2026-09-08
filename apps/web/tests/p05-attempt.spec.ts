import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";
import { test, type BrowserAttempt, type OwnerFixture } from "./p05-owner.fixture";

async function tabTo(page: Page, target: Locator, key = "Tab") {
  for (let i = 0; i < 45; i++) {
    if (await target.evaluate((node) => node === document.activeElement)) return;
    await page.keyboard.press(key);
  }
  await expect(target).toBeFocused();
}
async function gotoAttempt(page: Page, attemptId: string) {
  const recovery = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().includes(`/api/v1/attempts/${attemptId}?major=1`),
  );
  await page.goto(`/attempt/${attemptId}`);
  expect((await recovery).status()).toBe(200);
  await expect(
    page.getByText("Choose answers, or deliberately leave blanks, then submit."),
  ).toBeVisible();
}
const synced = (page: Page) => page.getByText("Synced. Your answers are saved.");
async function reflowReport(page: Page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    return {
      overflow: document.documentElement.scrollWidth - viewport,
      offenders: [...document.querySelectorAll<HTMLElement>("body *")]
        .map((node) => ({
          tag: node.tagName.toLowerCase(),
          className: node.className,
          text: node.textContent?.trim().slice(0, 80),
          left: node.getBoundingClientRect().left,
          right: node.getBoundingClientRect().right,
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
        }))
        .filter(
          (item) =>
            item.left < -1 || item.right > viewport + 1 || item.scrollWidth > item.clientWidth + 1,
        )
        .slice(0, 12),
    };
  });
}
async function changeAndSync(page: Page, change: () => Promise<unknown>) {
  const checkpoint = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.url().endsWith("/checkpoint"),
  );
  await change();
  expect((await checkpoint).status()).toBe(200);
  await expect(synced(page)).toBeVisible();
}

async function answerAndSubmit(
  page: Page,
  attempt: BrowserAttempt,
  options: { waitForSync?: boolean } = {},
) {
  const waitForSync = options.waitForSync ?? true;
  if (attempt.kind === "R2DetailedSelect") {
    const first = () =>
      page.locator(`input[name="select:${attempt.itemIds[0]}"][value="choice-1"]`).check();
    const second = () =>
      page.locator(`input[name="select:${attempt.itemIds[1]}"][value="choice-2"]`).check();
    if (waitForSync) await changeAndSync(page, first);
    else await first();
    if (waitForSync) await changeAndSync(page, second);
    else await second();
  } else {
    const first = () => page.getByRole("combobox").nth(0).selectOption("choice-1");
    const second = () => page.getByRole("combobox").nth(1).selectOption("choice-2");
    if (waitForSync) await changeAndSync(page, first);
    else await first();
    if (waitForSync) await changeAndSync(page, second);
    else await second();
  }
  const confirmation = page.getByRole("checkbox", { name: /I confirm these answers/ });
  await confirmation.check();
  await page.getByRole("button", { name: "Submit answer", exact: true }).click();
  await expect(page).toHaveURL(`/attempt/${attempt.id}/result`);
}
async function assertRecordedScore(owner: OwnerFixture, attempt: BrowserAttempt) {
  const outcomes = await owner.pool.query(
    "SELECT o.supported_scope,o.structurally_invalid_scope FROM app.objective_outcomes o WHERE o.attempt_id=$1",
    [attempt.id],
  );
  expect(outcomes.rows).toHaveLength(1);
  expect(outcomes.rows[0]).toMatchObject({ structurally_invalid_scope: [] });
  const units = await owner.pool.query(
    "SELECT u.kind FROM app.objective_unit_outcomes u JOIN app.objective_outcomes o ON o.id=u.outcome_id WHERE o.attempt_id=$1",
    [attempt.id],
  );
  expect(units.rows).toEqual([{ kind: "correct" }, { kind: "correct" }]);
}

for (const kind of [
  "R1HeadingMatching",
  "R3SituationNoticeMatching",
  "SB2SharedBankLexicalCloze",
] as const) {
  test(`P05-A11Y-001 P05-EQUIV-001 authenticated ${kind} keyboard completion and inspectable relationships`, async ({
    page,
    owner,
    browserName,
  }) => {
    const attempt = await owner.createAttempt(kind);
    await gotoAttempt(page, attempt.id);
    const selects = page.getByRole("combobox");
    await expect(selects).toHaveCount(2);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(
      await page.getByRole("region", { name: "Instructions" }).evaluate((node) => {
        const select = document.querySelector("select");
        return Boolean(
          select && node.compareDocumentPosition(select) & Node.DOCUMENT_POSITION_FOLLOWING,
        );
      }),
    ).toBe(true);
    await tabTo(page, selects.nth(0));
    await changeAndSync(page, () => page.keyboard.press("1"));
    await page.keyboard.press("Tab");
    await expect(selects.nth(1)).toBeFocused();
    await changeAndSync(page, () => page.keyboard.press("2"));
    await expect(selects.nth(0)).toHaveValue("choice-1");
    await expect(selects.nth(1)).toHaveValue("choice-2");
    // Each selected relationship remains inspectable through a named native control.
    for (const select of await selects.all()) {
      expect(await select.locator("option:checked").textContent()).not.toBe("Choose");
      expect(await select.getAttribute("name")).toMatch(/^(match|candidate):/);
    }
    const confirmation = page.getByRole("checkbox", { name: /I confirm these answers/ });
    const forwardKey = browserName === "webkit" ? "Alt+Tab" : "Tab";
    await tabTo(page, confirmation, forwardKey);
    await page.keyboard.press("Space");
    await expect(confirmation).toBeChecked();
    await expect(synced(page)).toBeVisible();
    const submit = page.getByRole("button", { name: "Submit answer", exact: true });
    await tabTo(page, submit, forwardKey);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`/attempt/${attempt.id}/result`);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await assertRecordedScore(owner, attempt);
  });
}

test("P05-A11Y-001 shaped invalid response focuses its summary and named repair without erasing valid choices", async ({
  page,
  owner,
}) => {
  const attempt = await owner.createAttempt("SB2SharedBankLexicalCloze");
  await gotoAttempt(page, attempt.id);
  await changeAndSync(page, () => page.getByRole("combobox").nth(0).selectOption("choice-1"));
  let releaseCheckpoint = () => {};
  const heldCheckpoint = new Promise<void>((resolve) => {
    releaseCheckpoint = resolve;
  });
  await page.route(`**/api/v1/attempts/${attempt.id}/checkpoint`, async (route) => {
    await heldCheckpoint;
    await route.continue();
  });
  // Controlled malformed input reaches the real validation boundary. No handler is replaced.
  try {
    await page
      .getByRole("combobox")
      .nth(1)
      .evaluate((node) => {
        const select = node as HTMLSelectElement;
        const option = select.options[1];
        if (!option) throw new Error("Missing controlled malformed option");
        option.disabled = false;
        select.value = "choice-1";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    await page.getByRole("checkbox", { name: /I confirm these answers/ }).check();
    await page.getByRole("button", { name: "Submit answer", exact: true }).click();
    const summary = page.locator('form [role="alert"]');
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Review answer 2");
    await expect(page.getByRole("combobox").nth(0)).toHaveValue("choice-1");
    await page.getByRole("link", { name: "Review answer 2" }).press("Enter");
    await expect(page.getByRole("combobox").nth(1)).toBeFocused();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  } finally {
    releaseCheckpoint();
    await page.unrouteAll({ behavior: "wait" });
  }
});

test("P05-A11Y-001 authenticated attempts keep timer announcements sparse and respect access settings", async ({
  page,
  owner,
  browserName,
}) => {
  const attempt = await owner.createAttempt();
  await gotoAttempt(page, attempt.id);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({
    reducedMotion: "reduce",
    forcedColors: browserName === "chromium" ? "active" : "none",
  });
  await expect(page.locator("[data-attempt-clock]")).toHaveAttribute("aria-live", "off");
  await expect(page.getByText("Loading the requested view.")).toHaveCount(0);
  const live = page.locator('[aria-live="polite"], [role="status"]');
  const initial = await live.allTextContents();
  await expect.poll(() => page.locator("[data-attempt-clock]").textContent()).not.toContain("0:00");
  expect(await live.allTextContents()).toEqual(initial);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
    true,
  );
  if (browserName === "chromium")
    expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
});

test("P05-RSP-001 authenticated attempt result and foundation reflow at 320px 400% text and representative 200% zoom", async ({
  page,
  owner,
}) => {
  const attempt = await owner.createAttempt();
  await gotoAttempt(page, attempt.id);
  for (const [width, css] of [
    [320, "html { font-size: 400% !important; }"],
    [1280, "html { zoom: 2; }"],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    const style = await page.addStyleTag({ content: css });
    const report = await reflowReport(page);
    expect(report.overflow, JSON.stringify(report.offenders)).toBeLessThanOrEqual(1);
    await expect(page.getByRole("button", { name: "Submit answer", exact: true })).toBeVisible();
    await style.evaluate((node) => node.remove());
  }
  await answerAndSubmit(page, attempt);
  for (const path of [`/attempt/${attempt.id}/result`, `/session/${owner.sessionId}`]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: path.includes("/result") ? "Result" : "Five-skill foundation",
      }),
    ).toBeVisible();
    await page.setViewportSize({ width: 320, height: 900 });
    await page.addStyleTag({ content: "html { font-size: 400% !important; }" });
    const report = await reflowReport(page);
    expect(report.overflow, JSON.stringify(report.offenders)).toBeLessThanOrEqual(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(path);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: path.includes("/result") ? "Result" : "Five-skill foundation",
      }),
    ).toBeVisible();
    await page.addStyleTag({ content: "html { zoom: 2; }" });
    const zoomReport = await reflowReport(page);
    expect(zoomReport.overflow, JSON.stringify(zoomReport.offenders)).toBeLessThanOrEqual(1);
  }
});

test("P05-A11Y-001 P05-RSP-001 authenticated controls have 44px targets and Reading keeps its 720px measure", async ({
  page,
  owner,
}) => {
  const attempt = await owner.createAttempt("R1HeadingMatching");
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoAttempt(page, attempt.id);
  const material = page.locator('form section[lang="de"]').last();
  expect(await material.evaluate((node) => node.getBoundingClientRect().width)).toBeLessThanOrEqual(
    720,
  );
  for (const path of [`/attempt/${attempt.id}`, `/session/${owner.sessionId}`]) {
    if (path.startsWith("/attempt")) await gotoAttempt(page, attempt.id);
    else {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1, name: "Five-skill foundation" }),
      ).toBeVisible();
    }
    const targets = await page
      .locator('main button, main select, main input:not([type="hidden"])')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const control = node as HTMLInputElement;
          const labelledTarget =
            control.type === "radio" || control.type === "checkbox"
              ? control.labels?.[0]
              : undefined;
          const box = (labelledTarget ?? control).getBoundingClientRect();
          return {
            name: control.name || node.textContent?.trim(),
            width: box.width,
            height: box.height,
          };
        }),
      );
    for (const target of targets) {
      expect(target.width, JSON.stringify(target)).toBeGreaterThanOrEqual(44);
      expect(target.height, JSON.stringify(target)).toBeGreaterThanOrEqual(44);
    }
  }
});

test.describe("Native Server Action progressive enhancement", () => {
  test.use({ javaScriptEnabled: false });
  test("P05-EQUIV-001 authenticated R2 submits native forms without JavaScript", async ({
    page,
    owner,
  }) => {
    const attempt = await owner.createAttempt();
    await page.goto(`/attempt/${attempt.id}`);
    await answerAndSubmit(page, attempt, { waitForSync: false });
    await assertRecordedScore(owner, attempt);
  });
  test("P05-FOUNDATION-001 authenticated foundation preferences persist and resume without JavaScript", async ({
    page,
    owner,
  }) => {
    await page.goto(`/session/${owner.sessionId}`);
    await expect(page.getByText(/planning horizon is 65 years/)).toBeVisible();
    await expect(page.getByText(/official target reference remains 60/)).toBeVisible();
    await expect(page.getByText(/Partial work adds evidence building/)).toBeVisible();
    await expect(
      page.getByText(
        "Unavailable in this release. That is our content gap, not a result about you.",
      ),
    ).toHaveCount(2);
    await page.getByLabel("Date status").selectOption("target_month");
    await page.getByLabel("Month (YYYY-MM) or date (YYYY-MM-DD)").fill("2027-06");
    await page.getByRole("button", { name: "Save exam context" }).click();
    await expect(page.getByLabel("Date status")).toHaveValue("target_month");
    await expect(page.getByLabel("Month (YYYY-MM) or date (YYYY-MM-DD)")).toHaveValue("2027-06");
    await page.getByLabel("Prefer reduced motion").check();
    await page.getByRole("button", { name: "Save access preferences" }).click();
    await page.reload();
    await expect(page.getByLabel("Prefer reduced motion")).toBeChecked();
    const facts = await owner.pool.query(
      "SELECT fact_kind,payload FROM app.profile_facts WHERE learner_scope_id=$1 ORDER BY learner_sequence",
      [owner.scopeId],
    );
    expect(facts.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fact_kind: "planning_horizon_v1",
          payload: { horizonYears: 65 },
        }),
        expect.objectContaining({
          fact_kind: "target_exam_context_v1",
          payload: { mode: "target_month", value: "2027-06" },
        }),
      ]),
    );
  });
});
