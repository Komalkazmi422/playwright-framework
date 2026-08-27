import { Page, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { BasePage } from "./BasePage";

export class CheckoutCompletePage extends BasePage {
  private readonly completeHeader = this.page.locator("[data-test='complete-header']");
  private readonly completeText = this.page.locator("[data-test='complete-text']");
  private readonly backToProductsButton = this.page.locator("[data-test='back-to-products']");
  private readonly pageTitle = this.page.locator(".title");

  constructor(page: Page) {
    super(page);
  }

  async getCompleteHeader(): Promise<string> {
    return this.getText(this.completeHeader);
  }

  async getCompleteText(): Promise<string> {
    return this.getText(this.completeText);
  }

  async backToProducts(): Promise<void> {
    await this.click(this.backToProductsButton, "Back to products button");
  }

  async verifyOrderConfirmation(): Promise<void> {
    await expect(this.completeHeader).toBeVisible();
    const header = await this.getCompleteHeader();
    expect(header).toContain("Thank you for your order");
  }
}
