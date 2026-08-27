import { Page, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { BasePage } from "./BasePage";

export class CheckoutPage extends BasePage {
  private readonly firstNameInput = this.page.locator("[data-test='firstName']");
  private readonly lastNameInput = this.page.locator("[data-test='lastName']");
  private readonly postalCodeInput = this.page.locator("[data-test='postalCode']");
  private readonly continueButton = this.page.locator("[data-test='continue']");
  private readonly cancelButton = this.page.locator("[data-test='cancel']");
  private readonly errorMessage = this.page.locator("[data-test='error']");
  private readonly pageTitle = this.page.locator(".title");

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await super.navigate("/checkout-step-one.html");
    await this.waitForPageLoad();
  }

  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await allure.step(`Fill checkout info: ${firstName} ${lastName}, ${postalCode}`, async () => {
      await this.fill(this.firstNameInput, firstName, "First Name");
      await this.fill(this.lastNameInput, lastName, "Last Name");
      await this.fill(this.postalCodeInput, postalCode, "Postal Code");
    });
  }

  async continueToOverview(): Promise<void> {
    await this.click(this.continueButton, "Continue button");
  }

  async cancel(): Promise<void> {
    await this.click(this.cancelButton, "Cancel button");
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return this.isVisible(this.errorMessage);
  }

  async verifyCheckoutPage(): Promise<void> {
    await expect(this.pageTitle).toHaveText("Checkout: Your Information");
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.postalCodeInput).toBeVisible();
  }
}
