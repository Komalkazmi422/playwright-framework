import { test, expect } from "../../src/fixtures/test-fixtures";
import { allure } from "allure-playwright";

test.describe("Cart Tests", () => {
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await homePage.waitForInventoryLoad();
  });

  test("TC-05: Verify that a product can be removed from the cart", async ({ homePage, cartPage }) => {
    await allure.epic("Cart");
    await allure.feature("Cart Operations");
    await allure.story("Remove Product from Cart");

    await allure.step("Add a product to cart", async () => {
      await homePage.addToCart(0);
    });

    await allure.step("Verify cart badge shows 1", async () => {
      const badgeCount = await homePage.getCartBadgeCount();
      expect(badgeCount).toBe(1);
    });

    await allure.step("Navigate to cart", async () => {
      await homePage.openCart();
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);
    });

    await allure.step("Remove product from cart", async () => {
      await cartPage.removeItem(0);
    });

    await allure.step("Verify cart is empty", async () => {
      const isCartEmpty = await cartPage.isCartEmpty();
      expect(isCartEmpty).toBe(true);
    });

    await cartPage.screenshot("TC-05-product-removed-from-cart");
  });
});
