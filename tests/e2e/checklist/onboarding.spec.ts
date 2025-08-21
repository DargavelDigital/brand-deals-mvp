import { test, expect } from '@playwright/test';
import { loginAsDemo, isDemoMode } from '../helpers/testUtils';

test.describe('Onboarding Flow', () => {
  test('Dashboard is accessible without authentication (demo mode)', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Start a Brand Run')).toBeVisible();
    await expect(page.locator('text=Performance Overview')).toBeVisible();
  });

  test('Brand Run wizard is accessible', async ({ page }) => {
    await page.goto('/dashboard');
    const startButton = page.locator('text=Start Brand Run');
    await startButton.click();
    await page.waitForURL('/brand-run');
    await expect(page.locator('h1:has-text("Connect Accounts")')).toBeVisible();
  });

  test('Dashboard shows main features', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Start a Brand Run')).toBeVisible();
    await expect(page.locator('text=Performance Overview')).toBeVisible();
    const metricCards = page.locator('[class*="bg-[var(--card)]"]');
    await expect(metricCards).toHaveCount(6); // Updated to 6 cards
  });

  test('Navigation works correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check sidebar navigation items using more specific selectors
    const sidebar = page.locator('aside');
    
    // On mobile, the sidebar is hidden, so skip this test
    const viewportWidth = page.viewportSize()?.width;
    if (viewportWidth && viewportWidth < 768) {
      test.skip();
      return;
    }
    
    // Check that navigation elements are present in the sidebar
    // Note: The actual href values are /crm for "Deals" and /outreach for "Templates"
    await expect(sidebar.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/brand-run"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/crm"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/outreach"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/settings"]')).toBeVisible();
  });
});
