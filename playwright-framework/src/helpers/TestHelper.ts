import { allure } from "allure-playwright";

export class TestHelper {
  static async logStep(stepName: string, stepFn: () => Promise<void>): Promise<void> {
    await allure.step(stepName, stepFn);
  }

  static async takeScreenshot(page: import("@playwright/test").Page, name: string): Promise<void> {
    await allure.attachment(name, await page.screenshot({ fullPage: true }), "image/png");
  }

  static async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  static generateRandomString(length: number = 8): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomNumber(min: number = 1, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static async waitAndClick(
    page: import("@playwright/test").Page,
    selector: string,
    timeout: number = 10_000
  ): Promise<void> {
    await page.waitForSelector(selector, { state: "visible", timeout });
    await page.click(selector);
  }

  static async retryAction<T>(
    action: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }
    throw lastError;
  }
}
