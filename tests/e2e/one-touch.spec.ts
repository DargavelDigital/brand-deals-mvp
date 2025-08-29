import { test, expect } from '@playwright/test'

test('One-Touch run → Review & Send', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Click the One-Touch button
  await page.getByTestId('one-touch-btn').click()

  // Progress sheet appears and ticks through steps (polling for state labels)
  await expect(page.getByTestId('progress-sheet')).toBeVisible()
  await page.waitForTimeout(500) // short debounce

  // Wait for some steps to complete (optional: assert a few step labels become "Done")
  await page.waitForTimeout(1500)

  // Jump to Outreach
  await page.getByTestId('review-send').click()
  await expect(page).toHaveURL(/tools\/outreach/)

  // Ensure the prefilled, paused sequence is visible
  await expect(page.getByTestId('start-sequence')).toBeVisible()
})

test('One-Touch flow with progress tracking', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Start One-Touch
  await page.getByTestId('one-touch-btn').click()
  
  // Verify progress sheet is visible
  const progressSheet = page.getByTestId('progress-sheet')
  await expect(progressSheet).toBeVisible()
  
  // Wait for at least one step to complete
  await page.waitForTimeout(2000)
  
  // Verify we can see step statuses
  const steps = await page.locator('[data-testid="progress-sheet"] > div').count()
  expect(steps).toBeGreaterThan(0)
  
  // Close the sheet
  await page.locator('button:has-text("Close")').click()
  
  // Verify sheet is hidden
  await expect(progressSheet).not.toBeVisible()
})
