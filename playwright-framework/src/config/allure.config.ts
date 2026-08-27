export const allurePlaywrightReporterConfig: [string, Record<string, unknown>][] = [
  [
    "allure-playwright",
    {
      resultsDir: "allure-results",
      environmentInfo: {
        framework: "Playwright",
        platform: process.platform,
        nodeVersion: process.version,
      },
    },
  ],
];
