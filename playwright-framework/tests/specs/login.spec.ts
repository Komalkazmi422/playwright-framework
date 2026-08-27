import { test, expect } from "../../src/fixtures/test-fixtures";
import { allure } from "allure-playwright";

test.describe("Login Tests", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
    await allure.step("Verify login page is loaded", async () => {
      await loginPage.verifyLoginPage();
    });
  });

  test("TC-01: Verify login with valid credentials", async ({ loginPage }) => {
    await allure.epic("Authentication");
    await allure.feature("Login");
    await allure.story("Valid Credentials");

    await allure.step("Enter valid credentials and login", async () => {
      await loginPage.loginAsStandardUser();
    });

    await allure.step("Verify user is redirected to Products page", async () => {
      const url = await loginPage.getUrl();
      expect(url).toContain("/inventory.html");
    });

    await allure.step("Verify Products page title is displayed", async () => {
      const title = await loginPage.page.locator(".title").textContent();
      expect(title).toBe("Products");
    });

    await loginPage.screenshot("TC-01-products-page");
  });

  test("TC-02: Verify login with invalid credentials", async ({ loginPage }) => {
    await allure.epic("Authentication");
    await allure.feature("Login");
    await allure.story("Invalid Credentials");

    await allure.step("Enter invalid credentials", async () => {
      await loginPage.login("invalid_user", "wrong_password");
    });

    await allure.step("Verify error message is displayed", async () => {
      const isVisible = await loginPage.isErrorMessageVisible();
      expect(isVisible).toBe(true);
    });

    await allure.step("Verify error message text", async () => {
      const errorMsg = await loginPage.getErrorMessage();
      expect(errorMsg).toContain("Username and password do not match");
    });

    await allure.step("Verify user stays on login page", async () => {
      const url = await loginPage.getUrl();
      expect(url).not.toContain("/inventory.html");
    });

    await loginPage.screenshot("TC-02-invalid-login-error");
  });

  test("TC-03: Verify login validation with empty username and password", async ({ loginPage }) => {
    await allure.epic("Authentication");
    await allure.feature("Login");
    await allure.story("Empty Credentials");

    await allure.step("Submit empty credentials", async () => {
      await loginPage.login("", "");
    });

    await allure.step("Verify username required error is displayed", async () => {
      const isVisible = await loginPage.isErrorMessageVisible();
      expect(isVisible).toBe(true);
    });

    await allure.step("Verify error message contains required field text", async () => {
      const errorMsg = await loginPage.getErrorMessage();
      expect(errorMsg).toContain("Username is required");
    });

    await loginPage.screenshot("TC-03-empty-credentials-error");
  });
});
