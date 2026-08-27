import { Page, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { BasePage } from "./BasePage";

export class CheckoutOverviewPage extends BasePage {
  private readonly cartItems = this.page.locator(".cart_item");
  private readonly finishButton = this.page.locator("[data-test='finish']");
  private readonly cancelButton = this.page.locator("[data-test='cancel']");
  private readonly subtotalLabel = this.page.locator("[data-test='subtotal-label']");
  private readonly taxLabel = this.page.locator("[data-test='tax-label']");
  private readonly totalLabel = this.page.locator("[data-test='total-label']");
  private readonly pageTitle = this.page.locator(".title");
  private readonly paymentInfo = this.page.locator("[data-test='payment-info-value']");
  private readonly shippingInfo = this.page.locator("[data-test='shipping-info-value']");

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await super.navigate("/checkout-step-two.html");
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

  async getSubtotal(): Promise<string> {
    return this.getText(this.subtotalLabel);
  }

  async getTax(): Promise<string> {
    return this.getText(this.taxLabel);
  }

  async getTotal(): Promise<string> {
    return this.getText(this.totalLabel);
  }

  async finishOrder(): Promise<void> {
    await this.click(this.finishButton, "Finish button");
  }

  async cancel(): Promise<void> {
    await this.click(this.cancelButton, "Cancel button");
  }

  async verifyOverviewPage(): Promise<void> {
    await expect(this.pageTitle).toHaveText("Checkout: Overview");
    await expect(this.finishButton).toBeVisible();
  }
}
