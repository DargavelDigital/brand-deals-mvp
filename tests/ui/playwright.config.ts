import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: __dirname,
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: [["list"]],
  expect: {
    toHaveScreenshot: { maxDiffPixels: 200 }, // small tolerance
  },
});
