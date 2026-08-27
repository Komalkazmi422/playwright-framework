import { Page, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  private readonly inventoryList = this.page.locator("[data-test='inventory-list']");
  private readonly inventoryItems = this.page.locator("[data-test='inventory-item']");
  private readonly cartBadge = this.page.locator("[data-test='shopping-cart-badge']");
  private readonly cartLink = this.page.locator("[data-test='shopping-cart-link']");
  private readonly menuButton = this.page.locator("#react-burger-menu-btn");
  private readonly logoutLink = this.page.locator("[data-test='logout-sidebar-link']");
  private readonly sortDropdown = this.page.locator("[data-test='product-sort-container']");

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await super.navigate("/inventory.html");
    await this.waitForPageLoad();
  }

  async waitForInventoryLoad(): Promise<void> {
    await allure.step("Wait for inventory to load", async () => {
      await this.inventoryList.waitFor({ state: "visible" });
    });
  }

  async getInventoryItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  async getItemName(index: number): Promise<string> {
    return (await this.inventoryItems.nth(index).locator("[data-test='inventory-item-name']").textContent()) || "";
  }

  async getItemPrice(index: number): Promise<string> {
    return (await this.inventoryItems.nth(index).locator("[data-test='inventory-item-price']").textContent()) || "";
  }

  async getItemDescription(index: number): Promise<string> {
    return (await this.inventoryItems.nth(index).locator("[data-test='inventory-item-desc']").textContent()) || "";
  }

  async addToCart(index: number): Promise<void> {
    const name = await this.getItemName(index);
    await allure.step(`Add "${name}" to cart`, async () => {
      const addBtn = this.inventoryItems.nth(index).locator("button");
      await addBtn.click();
    });
  }

  async removeFromCart(index: number): Promise<void> {
    const name = await this.getItemName(index);
    await allure.step(`Remove "${name}" from cart`, async () => {
      const removeBtn = this.inventoryItems.nth(index).locator("button");
      await removeBtn.click();
    });
  }

  async clickProductByName(name: string): Promise<void> {
    await allure.step(`Click product: ${name}`, async () => {
      const link = this.page.locator(".inventory_item_name", { hasText: name }).first();
      await link.click();
    });
  }

  async clickProductByIndex(index: number): Promise<void> {
    const name = await this.getItemName(index);
    await this.clickProductByName(name);
  }

  async getCartBadgeCount(): Promise<number> {
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  async isCartBadgeVisible(): Promise<boolean> {
    return this.isVisible(this.cartBadge);
  }

  async openCart(): Promise<void> {
    await this.click(this.cartLink, "Cart link");
  }

  async sortBy(option: string): Promise<void> {
    await allure.step(`Sort by: ${option}`, async () => {
      await this.selectOption(this.sortDropdown, option, "Sort dropdown");
    });
  }

  async getAllItemNames(): Promise<string[]> {
    const count = await this.getInventoryItemCount();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push(await this.getItemName(i));
    }
    return names;
  }

  async getAllItemPrices(): Promise<number[]> {
    const count = await this.getInventoryItemCount();
    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      const price = await this.getItemPrice(i);
      prices.push(parseFloat(price.replace("$", "")));
    }
    return prices;
  }

  async openMenu(): Promise<void> {
    await this.click(this.menuButton, "Menu button");
  }

  async logout(): Promise<void> {
    await allure.step("Logout", async () => {
      await this.openMenu();
      await this.click(this.logoutLink, "Logout link");
    });
  }

  async verifyHomePage(): Promise<void> {
    await expect(this.inventoryList).toBeVisible();
    await expect(this.sortDropdown).toBeVisible();
  }
}
