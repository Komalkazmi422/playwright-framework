# Playwright Automation Framework

A professional Playwright automation framework using the **Page Object Model (POM)** pattern with **Allure reporting** integration for **SauceDemo** (https://www.saucedemo.com).

## Project Structure

```
playwright-framework/
├── src/
│   ├── config/
│   │   ├── allure.config.ts          # Allure reporter configuration
│   │   └── test.config.ts            # Test environment configuration
│   ├── fixtures/
│   │   └── test-fixtures.ts          # Custom Playwright test fixtures (7 page objects)
│   ├── helpers/
│   │   └── TestHelper.ts             # Common test helper utilities
│   ├── pages/
│   │   ├── BasePage.ts               # Abstract base page class
│   │   ├── LoginPage.ts              # Login page object
│   │   ├── HomePage.ts               # Home/Inventory page object
│   │   ├── CartPage.ts               # Cart page object
│   │   ├── CheckoutPage.ts           # Checkout step-one page object
│   │   ├── CheckoutOverviewPage.ts   # Checkout step-two (overview) page object
│   │   ├── CheckoutCompletePage.ts   # Checkout complete page object
│   │   ├── ProductDetailsPage.ts     # Product details page object
│   │   └── index.ts                  # Barrel exports
│   └── utils/
│       └── FileUtils.ts              # File utility functions
├── tests/
│   └── specs/
│       ├── login.spec.ts             # TC-01, TC-02, TC-03
│       ├── inventory.spec.ts         # TC-04, TC-06 (3 sort variants)
│       ├── cart.spec.ts              # TC-05
│       ├── product-details.spec.ts   # TC-07
│       ├── checkout.spec.ts          # TC-08, TC-09
│       └── logout.spec.ts            # TC-10
├── scripts/
│   └── generate-report.js            # Custom Node.js Allure HTML report generator
├── allure-results/                   # Allure test results (generated)
├── allure-report/                    # Generated Allure HTML report
├── playwright.config.ts              # Playwright configuration
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
└── opencode.json                     # OpenCode MCP configuration (in workspace root)
```

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

```bash
# Run all tests (chromium)
npm test

# Run tests on chromium only
npm run test:chrome

# Run tests in headed mode
npm run test:headed

# Run tests in UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug
```

## Allure Reporting

```bash
# Generate Allure report
node scripts/generate-report.js

# Or use allure-commandline (requires Java)
npm run allure:report
npm run allure:open
```

## Test Coverage

| TC | Description | Spec File |
|----|-------------|-----------|
| TC-01 | Verify login with valid credentials | login.spec.ts |
| TC-02 | Verify login with invalid credentials | login.spec.ts |
| TC-03 | Verify login validation with empty credentials | login.spec.ts |
| TC-04 | Verify product can be added to cart | inventory.spec.ts |
| TC-05 | Verify product can be removed from cart | cart.spec.ts |
| TC-06 | Verify product sorting (low-to-high, high-to-low, A-Z) | inventory.spec.ts |
| TC-07 | Verify product details page displays correct info | product-details.spec.ts |
| TC-08 | Verify successful checkout flow | checkout.spec.ts |
| TC-09 | Verify checkout validation with missing info | checkout.spec.ts |
| TC-10 | Verify logout returns user to login page | logout.spec.ts |

## Key Features

- **Page Object Model (POM)** - Clean separation of test logic and page interactions
- **Custom Fixtures** - Pre-configured page objects injected into each test
- **Allure Reporting** - Rich test reports with screenshots, steps, and categories
- **TypeScript** - Full type safety and IDE support
- **Helper Utilities** - Common test actions, retry logic, and data generators
- **CI/CD Ready** - Configured for continuous integration
