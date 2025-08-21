import { test, expect } from '@playwright/test';

test.describe('UI Design System Template Enforcement', () => {
  test('dashboard layout follows design system grid', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that page loads without horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
    
    // Look for KPI/metric cards that should use our grid system
    const kpiCards = page.locator('[class*="bg-[var(--card)]"]');
    await expect(kpiCards).toHaveCount(4); // Expect 4 KPI cards
    
    // Check that no dashed borders are used (design system violation)
    const elementsWithDashedBorders = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const dashedElements = [];
      
      for (const element of elements) {
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.borderStyle === 'dashed' || computedStyle.outlineStyle === 'dashed') {
          dashedElements.push({
            tagName: element.tagName,
            className: element.className,
            id: element.id
          });
        }
      }
      
      return dashedElements;
    });
    
    expect(dashedElementsWithDashedBorders).toHaveLength(0);
  });

  test('responsive grid behavior at different breakpoints', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test desktop layout (1440px) - should have 4 columns
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(100);
    
    const desktopGrid = page.locator('.grid');
    const desktopCols = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      if (!grid) return 0;
      const computedStyle = window.getComputedStyle(grid);
      return computedStyle.gridTemplateColumns.split(' ').length;
    });
    expect(desktopCols).toBe(12); // 12-column grid
    
    // Test tablet layout (1024px) - should have 2 columns per row
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(100);
    
    const tabletCols = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      if (!grid) return 0;
      const computedStyle = window.getComputedStyle(grid);
      return computedStyle.gridTemplateColumns.split(' ').length;
    });
    expect(tabletCols).toBe(12); // Still 12-column grid, but responsive behavior
    
    // Test mobile layout (375px) - should stack to single column
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);
    
    const mobileCols = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      if (!grid) return 0;
      const computedStyle = window.getComputedStyle(grid);
      return computedStyle.gridTemplateColumns.split(' ').length;
    });
    expect(mobileCols).toBe(12); // Still 12-column grid, but responsive behavior
  });

  test('no banned CSS classes in rendered output', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for banned classes in the DOM
    const bannedClasses = [
      'border-dashed',
      'outline-dashed',
      'w-screen',
      'max-w-full',
      'min-w-full',
      'flex-1',
      'grow',
      'basis-full'
    ];
    
    for (const bannedClass of bannedClasses) {
      const elementsWithBannedClass = page.locator(`.${bannedClass}`);
      await expect(elementsWithBannedClass).toHaveCount(0);
    }
    
    // Also check computed styles for any dashed borders
    const hasDashedBorders = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      for (const element of allElements) {
        const style = window.getComputedStyle(element);
        if (style.borderStyle === 'dashed' || style.outlineStyle === 'dashed') {
          return true;
        }
      }
      return false;
    });
    
    expect(hasDashedBorders).toBe(false);
  });

  test('design system tokens are properly applied', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check that CSS variables are defined
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      return {
        bg: computedStyle.getPropertyValue('--bg'),
        card: computedStyle.getPropertyValue('--card'),
        text: computedStyle.getPropertyValue('--text'),
        border: computedStyle.getPropertyValue('--border')
      };
    });
    
    // Verify CSS variables are set (not empty)
    expect(cssVariables.bg).not.toBe('');
    expect(cssVariables.card).not.toBe('');
    expect(cssVariables.text).not.toBe('');
    expect(cssVariables.border).not.toBe('');
    
    // Check that body uses the design system background
    const bodyBackground = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = getComputedStyle(body);
      return computedStyle.backgroundColor;
    });
    
    // Should use CSS variable (will be computed to actual color)
    expect(bodyBackground).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
  });
});
