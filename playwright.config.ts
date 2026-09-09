import { defineConfig } from "@playwright/test";
if (process.env.ALLOW_QA_MUTATIONS !== "1")
  throw new Error(
    "Run the end-to-end suite only on a disposable local demo. Set ALLOW_QA_MUTATIONS=1 explicitly.",
  );
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "docs/qa/e2e-results.json" }]],
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:3000",
    headless: true,
    timezoneId: "Asia/Tehran",
    viewport: { width: 1440, height: 960 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: { args: ["--no-sandbox"] },
  },
});
