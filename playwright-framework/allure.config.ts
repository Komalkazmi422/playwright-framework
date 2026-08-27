export const allureEnvironment = {
  framework: "Playwright",
  version: "1.52.0",
  environment: process.env.NODE_ENV || "test",
  baseUrl: process.env.BASE_URL || "https://www.saucedemo.com",
  platform: process.platform,
  nodeVersion: process.version,
  browser: "chromium",
  timestamp: new Date().toISOString(),
};
