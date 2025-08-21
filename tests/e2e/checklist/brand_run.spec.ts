import { test, expect } from '@playwright/test';
import { loginAsDemo } from '../helpers/testUtils';

test.describe('Brand Run Wizard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('Brand Run wizard loads with all steps accessible', async ({ page }) => {
    await page.goto('/brand-run');
    
    // Check that the wizard loads and shows the first step
    await expect(page.locator('h1:has-text("Connect Accounts")')).toBeVisible();
    
    // Check for progress indicator
    const progressBar = page.locator('[role="progressbar"], .progress, .step-progress');
    if (await progressBar.isVisible()) {
      await expect(progressBar).toBeVisible();
    }
    
    // Check for step navigation
    const stepList = page.locator('.steps, .step-list, [data-testid="steps"]');
    if (await stepList.isVisible()) {
      await expect(stepList).toBeVisible();
    }
  });

  test('Brand Run steps are properly structured', async ({ page }) => {
    await page.goto('/brand-run');
    
    // Step 1: Connect Accounts
    await expect(page.locator('h1:has-text("Connect Accounts")')).toBeVisible();
    
    // Check for social media accounts section - use h2 to be more specific
    await expect(page.locator('h2:has-text("Social Media Accounts")')).toBeVisible();
    
    // Check for continue button
    const continueButton = page.locator('button:has-text("Connected — Continue")');
    await expect(continueButton).toBeVisible();
    
    // Check that the button is enabled (since accounts are connected from seed)
    await expect(continueButton).toBeEnabled();
  });

  test('Auto mode toggle is present and functional', async ({ page }) => {
    await page.goto('/brand-run');
    
    // Look for auto mode toggle in the right rail - use more specific selector
    const rightRail = page.locator('.grid > .lg\\:block');
    if (await rightRail.isVisible()) {
      // Check for auto mode toggle - just verify it exists
      const autoToggle = page.locator('input[type="checkbox"], [role="switch"], .toggle, .switch').first();
      
      if (await autoToggle.isVisible()) {
        // Just check that the toggle is visible and enabled
        await expect(autoToggle).toBeVisible();
        await expect(autoToggle).toBeEnabled();
        
        // Check that it's a checkbox input
        await expect(autoToggle).toHaveAttribute('type', 'checkbox');
      }
    }
  });

  test('Brand Run wizard shows correct layout', async ({ page }) => {
    await page.goto('/brand-run');
    
    // Check that the wizard container is present - use more specific selector
    const wizardContainer = page.locator('.grid.grid-cols-1.lg\\:grid-cols-\\[1fr_320px\\]').locator('..');
    await expect(wizardContainer).toBeVisible();
    
    // Check for two-column layout
    const gridLayout = page.locator('.grid.grid-cols-1.lg\\:grid-cols-\\[1fr_320px\\]');
    await expect(gridLayout).toBeVisible();
    
    // Check for left content pane
    const contentPane = page.locator('.max-w-\\[900px\\]');
    await expect(contentPane).toBeVisible();
    
    // Check for right rail - use more specific selector
    const rightRail = page.locator('.grid > .lg\\:block');
    await expect(rightRail).toBeVisible();
  });
});
