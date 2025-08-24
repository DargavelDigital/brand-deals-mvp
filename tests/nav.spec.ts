import { test, expect } from '@playwright/test'
test('MVP sidebar order', async ({ page }) => {
  await page.goto('/dashboard')
  const items = page.locator('aside nav a span')
  await expect(items.nth(0)).toHaveText('Dashboard')
  await expect(items.nth(1)).toHaveText('Brand Run')
  await expect(items.nth(2)).toHaveText('Contacts')
  await expect(items.nth(3)).toHaveText('CRM')
  await expect(items.nth(4)).toHaveText('Settings')
  await expect(page.locator('aside nav a')).toHaveCount(5)
})
