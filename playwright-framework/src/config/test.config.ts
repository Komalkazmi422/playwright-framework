export const TestConfig = {
  baseUrl: process.env.BASE_URL || "https://www.saucedemo.com",
  credentials: {
    standardUser: {
      username: "standard_user",
      password: "secret_sauce",
    },
    lockedOutUser: {
      username: "locked_out_user",
      password: "secret_sauce",
    },
    invalidUser: {
      username: "invalid_user",
      password: "wrong_password",
    },
  },
  timeouts: {
    short: 5_000,
    medium: 15_000,
    long: 30_000,
  },
  allure: {
    resultsDir: "allure-results",
    reportDir: "allure-report",
  },
} as const;
