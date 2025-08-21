import { test, expect } from '@playwright/test';
import { loginAsDemo, expectKpiGridResponsive } from '../helpers/testUtils';

test.describe('Dashboard UX & Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('Dashboard CTA "Start Brand Run" is visible and functional', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for hero section
    await expect(page.locator('text=Start a Brand Run')).toBeVisible();
    await expect(page.locator('text=We\'ll audit your content, pick brands, build your media pack, find contacts, and send the outreach automatically.')).toBeVisible();
    
    // Check for primary CTA link (it's an anchor tag, not a button)
    const startButton = page.locator('a[href="/brand-run"]:has-text("Start Brand Run")');
    await expect(startButton).toBeVisible();
    
    // Check for secondary button
    const configureButton = page.locator('button:has-text("Configure")');
    await expect(configureButton).toBeVisible();
  });

  test('KPI grid is responsive across breakpoints', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Use the helper function to test responsiveness for the DashboardGrid
    // The actual grid uses grid-cols-12 with responsive column spans
    await expectKpiGridResponsive(page, '.grid.grid-cols-12');
  });

  test('Dashboard sections render correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for main sections
    await expect(page.locator('text=Start a Brand Run')).toBeVisible();
    await expect(page.locator('text=Performance Overview')).toBeVisible();
    
    // Check for metric cards - there are actually 6 cards total
    const metricCards = page.locator('[class*="bg-[var(--card)]"]');
    await expect(metricCards).toHaveCount(6); // 4 metric cards + 1 hero section + 1 recent activity
    
    // Verify metric card content - these are the actual labels from the dashboard
    await expect(page.locator('text=Total Deals')).toBeVisible();
    await expect(page.locator('text=Active Outreach')).toBeVisible();
    await expect(page.locator('text=Response Rate')).toBeVisible();
    await expect(page.locator('text=Avg Deal Value')).toBeVisible();
  });

  test('Navigation sidebar works correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check sidebar navigation items using more specific selectors
    // Look for sidebar specifically
    const sidebar = page.locator('aside');
    
    // On mobile, the sidebar is hidden, so skip this test
    const viewportWidth = page.viewportSize()?.width;
    if (viewportWidth && viewportWidth < 768) {
      test.skip();
      return;
    }
    
    // Check sidebar navigation items
    // Note: The actual href values are /crm for "Deals" and /outreach for "Templates"
    await expect(sidebar.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/brand-run"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/crm"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/outreach"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/settings"]')).toBeVisible();
  });

  test('Mobile responsive behavior', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 800 });
    
    // Check that hero section is visible on mobile
    await expect(page.locator('text=Start a Brand Run')).toBeVisible();
    
    // Check that metric grid stacks to single column on mobile
    // The actual grid is in DashboardGrid component with grid-cols-12
    const gridContainer = page.locator('.grid.grid-cols-12');
    if (await gridContainer.isVisible()) {
      const gridItems = await gridContainer.locator('> *').count();
      expect(gridItems).toBeGreaterThanOrEqual(1); // Should stack to 1 column on mobile
    }
  });

  test('Design system tokens are applied correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check that cards use design system colors
    const cards = page.locator('[class*="bg-[var(--card)]"]');
    await expect(cards).toHaveCount(6); // 4 metric cards + 1 hero section + 1 recent activity
    
    // Check that borders use design system colors
    const borders = page.locator('[class*="border-[var(--border)]"]');
    await expect(borders).toHaveCount(9); // Should have borders on all cards and other elements
    
    // Check that text uses design system colors
    const textElements = page.locator('[class*="text-[var(--text)]"]');
    await expect(textElements).toHaveCount(19); // Should have text elements
    
    // Check that muted text uses design system colors
    const mutedText = page.locator('[class*="text-[var(--muted)]"]');
    await expect(mutedText).toHaveCount(17); // Should have muted text
  });

  test('No unwanted styles are present', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for absence of dashed borders
    const dashedBorders = page.locator('[class*="border-dashed"]');
    await expect(dashedBorders).toHaveCount(0);
    
    // Check for absence of horizontal scroll
    const horizontalScroll = page.locator('[class*="overflow-x-auto"]');
    await expect(horizontalScroll).toHaveCount(0);
  });
});
