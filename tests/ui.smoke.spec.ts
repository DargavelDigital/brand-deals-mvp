import { test, expect } from '@playwright/test'

test('layout + nav', async ({ page }) => {
  await page.goto('/dashboard')
  const sidebar = page.locator('nav >> text=Dashboard')
  await expect(sidebar).toBeVisible()
  const search = page.locator('input[type="search"]')
  await expect(search).toBeVisible()
  // only one sidebar rendered:
  await expect(page.locator('nav')).toHaveCount(1)
})
