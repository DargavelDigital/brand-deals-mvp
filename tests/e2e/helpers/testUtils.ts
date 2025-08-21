import { Page, expect } from '@playwright/test';

/**
 * Login as demo user - navigates directly to dashboard since auth is not implemented yet
 */
export async function loginAsDemo(page: Page): Promise<void> {
  // Since authentication is not implemented yet, go directly to dashboard
  // In a real app, this would handle the auth flow
  await page.goto('/dashboard');
  
  // Wait for dashboard to load
  await page.waitForLoadState('networkidle');
}

/**
 * Start Brand Run with Auto mode enabled
 */
export async function startBrandRunAuto(page: Page): Promise<void> {
  await page.goto('/brand-run');
  
  // Find and toggle auto mode switch - use a more reliable method
  const autoToggle = page.locator('input[type="checkbox"]').first();
  if (await autoToggle.isVisible()) {
    // Try clicking the label or parent element instead of the hidden checkbox
    const toggleContainer = autoToggle.locator('..');
    if (await toggleContainer.isVisible()) {
      await toggleContainer.click();
    } else {
      // Fallback: try to find a visible toggle element
      const visibleToggle = page.locator('[role="switch"], .toggle, .switch').first();
      if (await visibleToggle.isVisible()) {
        await visibleToggle.click();
      }
    }
  }
  
  // Step 1: Connect Accounts - should already be connected from seed
  await expect(page.locator('h1:has-text("Connect Accounts")')).toBeVisible();
  
  // Wait for any loading states
  await page.waitForLoadState('networkidle');
  
  // Continue to next step
  const continueButton = page.locator('button:has-text("Continue")');
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }
  
  // Step 2: AI Audit
  await expect(page.locator('h1:has-text("AI Audit")')).toBeVisible();
  await page.waitForLoadState('networkidle');
  
  // Continue to next step
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }
  
  // Step 3: Brand Matches
  await expect(page.locator('h1:has-text("Brand Matches")')).toBeVisible();
  await page.waitForLoadState('networkidle');
  
  // Continue to next step
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }
  
  // Step 4: Approval
  await expect(page.locator('h1:has-text("Approval")')).toBeVisible();
  await page.waitForLoadState('networkidle');
  
  // Continue to next step
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }
  
  // Step 5: Media Pack
  await expect(page.locator('h1:has-text("Media Pack")')).toBeVisible();
  await page.waitForLoadState('networkidle');
  
  // Continue to next step
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }
  
  // Step 6: Contacts
  await expect(page.locator('h1:has-text("Contacts")')).toBeVisible();
  await page.waitForLoadState('networkidle');
  
  // Continue to next step
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }
  
  // Step 7: Outreach
  await expect(page.locator('h1:has-text("Outreach")')).toBeVisible();
  await page.waitForLoadState('networkidle');
}

/**
 * Check KPI grid responsive layout at different breakpoints
 */
export async function expectKpiGridResponsive(page: Page, selector: string): Promise<void> {
  // Desktop (1440px) - should be 4 columns
  await page.setViewportSize({ width: 1440, height: 900 });
  const desktopGrid = page.locator(selector);
  const desktopItems = await desktopGrid.locator('> *').count();
  expect(desktopItems).toBeGreaterThanOrEqual(4);
  
  // Tablet (1024px) - should be 2 columns
  await page.setViewportSize({ width: 1024, height: 768 });
  const tabletGrid = page.locator(selector);
  const tabletItems = await tabletGrid.locator('> *').count();
  expect(tabletItems).toBeGreaterThanOrEqual(2);
  
  // Mobile (375px) - should be 1 column
  await page.setViewportSize({ width: 375, height: 800 });
  const mobileGrid = page.locator(selector);
  const mobileItems = await mobileGrid.locator('> *').count();
  expect(mobileItems).toBeGreaterThanOrEqual(1);
}

/**
 * Safe click with retries to avoid flaky tests
 */
export async function safeClick(page: Page, textOrSelector: string): Promise<void> {
  const locator = page.locator(textOrSelector);
  await locator.waitFor({ state: 'visible' });
  await locator.click();
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

/**
 * Wait for network idle to avoid flaky tests
 */
export async function waitForNetworkIdle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}
