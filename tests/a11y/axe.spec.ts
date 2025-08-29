import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const pages = ['/', '/en/dashboard', '/en/tools/matches', '/en/tools/outreach']

for (const path of pages) {
  test(`axe clean: ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .disableRules(['region']) // if you intentionally suppress some
      .analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
}
