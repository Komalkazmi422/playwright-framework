import { test, expect } from "../../src/fixtures/test-fixtures";
import { allure } from "allure-playwright";

test.describe("Inventory Tests", () => {
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await homePage.waitForInventoryLoad();
  });

  test("TC-04: Verify that a product can be added to the cart", async ({ homePage, cartPage }) => {
    await allure.epic("Inventory");
    await allure.feature("Cart Operations");
    await allure.story("Add Product to Cart");

    let productName: string;

    await allure.step("Get name of first product before adding", async () => {
      productName = await homePage.getItemName(0);
    });

    await allure.step("Add first product to cart", async () => {
      await homePage.addToCart(0);
    });

    await allure.step("Verify cart badge shows 1 item", async () => {
      const badgeCount = await homePage.getCartBadgeCount();
      expect(badgeCount).toBe(1);
    });

    await allure.step("Navigate to cart and verify product is present", async () => {
      await homePage.openCart();
      await cartPage.verifyCartPage();

      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);

      const cartItemName = await cartPage.getCartItemName(0);
      expect(cartItemName).toBe(productName);
    });

    await homePage.screenshot("TC-04-product-added-to-cart");
  });

  test("TC-06: Verify product sorting by price (low to high)", async ({ homePage }) => {
    await allure.epic("Inventory");
    await allure.feature("Sorting");
    await allure.story("Sort by Price Low to High");

    await allure.step("Sort products by Price (low to high)", async () => {
      await homePage.sortBy("lohi");
    });

    await allure.step("Verify products are sorted correctly", async () => {
      const prices = await homePage.getAllItemPrices();
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

    await homePage.screenshot("TC-06-sorted-low-to-high");
  });

  test("TC-06: Verify product sorting by price (high to low)", async ({ homePage }) => {
    await allure.epic("Inventory");
    await allure.feature("Sorting");
    await allure.story("Sort by Price High to Low");

    await allure.step("Sort products by Price (high to low)", async () => {
      await homePage.sortBy("hilo");
    });

    await allure.step("Verify products are sorted correctly", async () => {
      const prices = await homePage.getAllItemPrices();
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }
    });

    await homePage.screenshot("TC-06-sorted-high-to-low");
  });

  test("TC-06: Verify product sorting by name (A to Z)", async ({ homePage }) => {
    await allure.epic("Inventory");
    await allure.feature("Sorting");
    await allure.story("Sort by Name A to Z");

    await allure.step("Sort products by Name (A to Z)", async () => {
      await homePage.sortBy("az");
    });

    await allure.step("Verify products are sorted alphabetically", async () => {
      const names = await homePage.getAllItemNames();
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    });

    await homePage.screenshot("TC-06-sorted-a-to-z");
  });
});
