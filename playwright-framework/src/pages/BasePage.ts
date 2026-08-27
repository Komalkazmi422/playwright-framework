import type { Page, Locator } from "@playwright/test";
import { allure } from "allure-playwright";

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = ""): Promise<void> {
    await allure.step(`Navigate to ${path || "base URL"}`, async () => {
      await this.page.goto(path);
    });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  async click(locator: Locator, description?: string): Promise<void> {
    await allure.step(`Click ${description || "element"}`, async () => {
      await locator.click();
    });
  }

  async fill(locator: Locator, value: string, description?: string): Promise<void> {
    await allure.step(`Fill "${value}" into ${description || "input"}`, async () => {
      await locator.fill(value);
    });
  }

  async selectOption(locator: Locator, value: string, description?: string): Promise<void> {
    await allure.step(`Select "${value}" from ${description || "dropdown"}`, async () => {
      await locator.selectOption(value);
    });
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || "";
  }

  async screenshot(name: string): Promise<void> {
    await allure.attachment(
      name,
      await this.page.screenshot({ fullPage: true }),
      "image/png"
    );
  }
}
