import { test, expect } from "@playwright/test";

test.describe("/ui-system visual regression", () => {
  test("renders consistently", async ({ page }) => {
    await page.goto("/ui-system");
    // Ensure fonts & tokens applied
    await page.waitForLoadState("networkidle");
    // Hide dynamic timestamps if any (defensive)
    await page.evaluate(() => {
      document.querySelectorAll("[data-dynamic]").forEach((el) => {
        (el as HTMLElement).style.visibility = "hidden";
      });
    });
    await expect(page).toHaveScreenshot("ui-system.full.png", { fullPage: true });
  });
});
