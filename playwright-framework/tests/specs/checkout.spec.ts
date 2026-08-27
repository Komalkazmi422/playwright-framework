import { test, expect } from "../../src/fixtures/test-fixtures";
import { allure } from "allure-playwright";

test.describe("Checkout Tests", () => {
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsStandardUser();
    await homePage.waitForInventoryLoad();
  });

  test("TC-08: Verify successful checkout", async ({
    homePage,
    cartPage,
    checkoutPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await allure.epic("Checkout");
    await allure.feature("Checkout Flow");
    await allure.story("Successful Checkout");

    let productName: string;
    let productPrice: string;

    await allure.step("Add a product to cart", async () => {
      productName = await homePage.getItemName(0);
      productPrice = await homePage.getItemPrice(0);
      await homePage.addToCart(0);
    });

    await allure.step("Open cart and proceed to checkout", async () => {
      await homePage.openCart();
      await cartPage.verifyCartPage();
      await cartPage.checkout();
    });

    await allure.step("Verify checkout info page is displayed", async () => {
      await checkoutPage.verifyCheckoutPage();
    });

    await allure.step("Fill in checkout information", async () => {
      await checkoutPage.fillCheckoutInfo("John", "Doe", "12345");
    });

    await allure.step("Continue to overview", async () => {
      await checkoutPage.continueToOverview();
    });

    await allure.step("Verify checkout overview page", async () => {
      await checkoutOverviewPage.verifyOverviewPage();
    });

    await allure.step("Verify product in order summary", async () => {
      const itemCount = await checkoutOverviewPage.getCartItemCount();
      expect(itemCount).toBe(1);

      const summaryName = await checkoutOverviewPage.getCartItemName(0);
      expect(summaryName).toBe(productName);

      const summaryPrice = await checkoutOverviewPage.getCartItemPrice(0);
      expect(summaryPrice).toBe(productPrice);
    });

    await allure.step("Verify order totals are displayed", async () => {
      const subtotal = await checkoutOverviewPage.getSubtotal();
      expect(subtotal).toContain("Item total:");

      const tax = await checkoutOverviewPage.getTax();
      expect(tax).toContain("Tax:");

      const total = await checkoutOverviewPage.getTotal();
      expect(total).toContain("Total:");
    });

    await allure.step("Finish the order", async () => {
      await checkoutOverviewPage.finishOrder();
    });

    await allure.step("Verify order confirmation page", async () => {
      await checkoutCompletePage.verifyOrderConfirmation();

      const header = await checkoutCompletePage.getCompleteHeader();
      expect(header).toContain("Thank you for your order");
    });

    await checkoutCompletePage.screenshot("TC-08-order-confirmation");
  });

  test("TC-09: Verify checkout validation with missing required information", async ({
    homePage,
    cartPage,
    checkoutPage,
  }) => {
    await allure.epic("Checkout");
    await allure.feature("Checkout Validation");
    await allure.story("Missing Required Information");

    await allure.step("Add a product and navigate to checkout", async () => {
      await homePage.addToCart(0);
      await homePage.openCart();
      await cartPage.checkout();
    });

    await allure.step("Click continue without filling any fields", async () => {
      await checkoutPage.continueToOverview();
    });

    await allure.step("Verify error message for missing first name", async () => {
      const isVisible = await checkoutPage.isErrorMessageVisible();
      expect(isVisible).toBe(true);
    });

    await allure.step("Verify error message text", async () => {
      const errorMsg = await checkoutPage.getErrorMessage();
      expect(errorMsg).toContain("First Name is required");
    });

    await allure.step("Fill only first name and try again", async () => {
      await checkoutPage.fillCheckoutInfo("John", "", "");
      await checkoutPage.continueToOverview();
    });

    await allure.step("Verify error message for missing last name", async () => {
      const errorMsg = await checkoutPage.getErrorMessage();
      expect(errorMsg).toContain("Last Name is required");
    });

    await allure.step("Fill first and last name but no postal code", async () => {
      await checkoutPage.fillCheckoutInfo("John", "Doe", "");
      await checkoutPage.continueToOverview();
    });

    await allure.step("Verify error message for missing postal code", async () => {
      const errorMsg = await checkoutPage.getErrorMessage();
      expect(errorMsg).toContain("Postal Code is required");
    });

    await checkoutPage.screenshot("TC-09-checkout-validation-error");
  });
});
