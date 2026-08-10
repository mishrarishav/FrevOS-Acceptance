import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

function captureBrowserErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    errors.push(`page: ${error.message}`);
  });
  return errors;
}

test.describe("@harness black-box browser capabilities", () => {
  test("observes semantic content and responsive state without browser errors", async ({
    page,
  }, testInfo) => {
    const browserErrors = captureBrowserErrors(page);

    await page.goto("/");
    await expect(page).toHaveTitle("Acceptance Harness Fixture");
    await expect(
      page.getByRole("heading", { level: 1, name: "Independent acceptance harness" }),
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

    const isMobile = testInfo.project.name === "mobile-chromium";
    await expect(
      page.getByTestId(isMobile ? "mobile-indicator" : "desktop-indicator"),
    ).toBeVisible();
    await expect(
      page.getByTestId(isMobile ? "desktop-indicator" : "mobile-indicator"),
    ).toBeHidden();

    await page.getByRole("button", { name: "Load status" }).click();
    await expect(page.getByRole("status")).toHaveText("Available");
    expect(browserErrors, browserErrors.join("\n")).toEqual([]);

    await testInfo.attach("harness-context", {
      body: Buffer.from(
        JSON.stringify(
          {
            project: testInfo.project.name,
            target: "synthetic-fixture",
            productAcceptance: false,
          },
          null,
          2,
        ),
      ),
      contentType: "application/json",
    });
  });

  test("reports a controlled network failure to the user", async ({ page }) => {
    await page.route("**/api/status", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ status: "unavailable" }),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Load status" }).click();
    await expect(page.getByRole("status")).toHaveText("Unable to load status");
  });

  test("has no automatically detectable WCAG A or AA violations", async ({ page }, testInfo) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    await testInfo.attach("axe-results", {
      body: Buffer.from(JSON.stringify({ violations: results.violations }, null, 2)),
      contentType: "application/json",
    });
    expect(results.violations).toEqual([]);
  });
});
