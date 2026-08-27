import { test, expect } from "../../src/fixtures/test-fixtures";
import { allure } from "allure-playwright";

test.describe("Logout Tests", () => {
  test("TC-10: Verify logout returns user to login page", async ({ loginPage, homePage }) => {
    await allure.epic("Authentication");
    await allure.feature("Logout");
    await allure.story("Successful Logout");

    await allure.step("Login as standard user", async () => {
      await loginPage.navigate();
      await loginPage.loginAsStandardUser();
      await homePage.waitForInventoryLoad();
    });

    await allure.step("Verify user is on inventory page", async () => {
      const url = await loginPage.getUrl();
      expect(url).toContain("/inventory.html");
    });

    await allure.step("Perform logout", async () => {
      await homePage.logout();
    });

    await allure.step("Verify user is redirected to login page", async () => {
      const url = await loginPage.getUrl();
      expect(url).not.toContain("/inventory.html");
      expect(url).toContain("saucedemo.com");
    });

    await allure.step("Verify login form is visible again", async () => {
      await loginPage.verifyLoginPage();
    });

    await loginPage.screenshot("TC-10-logout-success");
  });
});
