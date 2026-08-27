import { test, expect } from "../../src/fixtures/test-fixtures";
import { allure } from "allure-playwright";

test.describe("Product Details Tests", () => {
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await homePage.waitForInventoryLoad();
  });

  test("TC-07: Verify product details page displays correct information", async ({ homePage, productDetailsPage }) => {
    await allure.epic("Product Details");
    await allure.feature("Product Information");
    await allure.story("View Product Details");

    let expectedName: string;
    let expectedPrice: string;
    let expectedDescription: string;

    await allure.step("Get product info from inventory list", async () => {
      expectedName = await homePage.getItemName(0);
      expectedPrice = await homePage.getItemPrice(0);
      expectedDescription = await homePage.getItemDescription(0);
    });

    await allure.step("Click on product to open details page", async () => {
      await homePage.clickProductByIndex(0);
    });

    await allure.step("Verify product details page is displayed", async () => {
      await productDetailsPage.verifyProductDetails();
    });

    await allure.step("Verify product name matches", async () => {
      const actualName = await productDetailsPage.getProductName();
      expect(actualName).toBe(expectedName);
    });

    await allure.step("Verify product price matches", async () => {
      const actualPrice = await productDetailsPage.getProductPrice();
      expect(actualPrice).toBe(expectedPrice);
    });

    await allure.step("Verify product description matches", async () => {
      const actualDescription = await productDetailsPage.getProductDescription();
      expect(actualDescription).toBe(expectedDescription);
    });

    await allure.step("Verify product image is visible", async () => {
      const isImageVisible = await productDetailsPage.isProductImageVisible();
      expect(isImageVisible).toBe(true);
    });

    await productDetailsPage.screenshot("TC-07-product-details-page");
  });
});
