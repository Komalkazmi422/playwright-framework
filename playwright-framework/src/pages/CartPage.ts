import { Page, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { BasePage } from "./BasePage";

export class CartPage extends BasePage {
  private readonly cartItems = this.page.locator(".cart_item");
  private readonly cartList = this.page.locator("[data-test='cart-list']");
  private readonly checkoutButton = this.page.locator("[data-test='checkout']");
  private readonly continueShoppingButton = this.page.locator("[data-test='continue-shopping']");
  private readonly pageTitle = this.page.locator(".title");

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await super.navigate("/cart.html");
    await this.waitForPageLoad();
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getCartItemName(index: number): Promise<string> {
    return (await this.cartItems.nth(index).locator(".inventory_item_name").textContent()) || "";
  }

  async getCartItemPrice(index: number): Promise<string> {
    return (await this.cartItems.nth(index).locator(".inventory_item_price").textContent()) || "";
  }

  async getCartItemQuantity(index: number): Promise<string> {
    return (await this.cartItems.nth(index).locator(".cart_quantity").textContent()) || "";
  }

  async removeItem(index: number): Promise<void> {
    const name = await this.getCartItemName(index);
    await allure.step(`Remove "${name}" from cart`, async () => {
      const removeBtn = this.cartItems.nth(index).locator("button");
      await removeBtn.click();
    });
  }

  async checkout(): Promise<void> {
    await this.click(this.checkoutButton, "Checkout button");
  }

  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton, "Continue shopping button");
  }

  async verifyCartPage(): Promise<void> {
    await expect(this.pageTitle).toHaveText("Your Cart");
    await expect(this.checkoutButton).toBeVisible();
  }

  async isCartEmpty(): Promise<boolean> {
    const count = await this.getCartItemCount();
    return count === 0;
  }
}
