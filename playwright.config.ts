import { defineConfig, devices } from "@playwright/test";
import { readAcceptanceEnvironment } from "./support/environment.js";

const environment = readAcceptanceEnvironment(process.env);
const { CI: continuousIntegration } = process.env;
const isCi = Boolean(continuousIntegration);

export default defineConfig({
  testDir: "./tests",
  outputDir: "artifacts/test-results",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  ...(isCi ? { workers: 1 } : {}),
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [
    ["./support/no-skipped-tests-reporter.ts"],
    ["line"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["junit", { outputFile: "artifacts/results.xml" }],
    ["json", { outputFile: "artifacts/results.json" }],
  ],
  use: {
    baseURL: environment.baseUrl,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    colorScheme: "light",
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
  ...(environment.targetEnvironment === "fixture"
    ? {
        webServer: {
          command: "node scripts/serve-fixture.mjs",
          url: new URL("/health", environment.baseUrl).toString(),
          reuseExistingServer: !isCi,
          timeout: 15_000,
        },
      }
    : {}),
});
