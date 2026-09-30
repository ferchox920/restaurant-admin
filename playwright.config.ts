import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: `${process.env.INTEGRATION_OUTPUT || "output/playwright"}/round-${process.env.INTEGRATION_ROUND || "debug"}-traces`,
  reporter: [["list"], ["json"], ["html", { open: "never" }]],
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    baseURL: process.env.INTEGRATION_BASE_URL,
    trace: "on",
    screenshot: "on",
    video: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile-chromium-emulated",
      use: { ...devices["Pixel 7"], defaultBrowserType: "chromium" },
    },
  ],
});
