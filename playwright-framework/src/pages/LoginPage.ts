import { Page, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator("#user-name");
  private readonly passwordInput = this.page.locator("#password");
  private readonly loginButton = this.page.locator("#login-button");
  private readonly errorMessage = this.page.locator("[data-test='error']");
  private readonly errorMsgCloseButton = this.page.locator(".error-button");

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await super.navigate("/");
    await this.waitForPageLoad();
  }

  async login(username: string, password: string): Promise<void> {
    await allure.step(`Login with user: ${username}`, async () => {
      await this.fill(this.usernameInput, username, "Username");
      await this.fill(this.passwordInput, password, "Password");
      await this.click(this.loginButton, "Login button");
    });
  }

  async loginAsStandardUser(): Promise<void> {
    await this.login("standard_user", "secret_sauce");
  }

  async loginAsLockedOutUser(): Promise<void> {
    await this.login("locked_out_user", "secret_sauce");
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return this.isVisible(this.errorMessage);
  }

  async closeErrorMessage(): Promise<void> {
    await this.click(this.errorMsgCloseButton, "Error close button");
  }

  async verifyLoginPage(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }
}
