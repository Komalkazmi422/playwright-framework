import { Page, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { BasePage } from "./BasePage";

export class ProductDetailsPage extends BasePage {
  private readonly productName = this.page.locator("[data-test='inventory-item-name']");
  private readonly productDescription = this.page.locator(".inventory_details_desc");
  private readonly productPrice = this.page.locator("[data-test='inventory-item-price']");
  private readonly productImage = this.page.locator(".inventory_details_img_container");
  private readonly addToCartButton = this.page.locator("button[data-test^='add-to-cart']");
  private readonly removeFromCartButton = this.page.locator("button[data-test^='remove']");
  private readonly backToProductsButton = this.page.locator("[data-test='back-to-products']");

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await super.navigate("/inventory-item.html");
    await this.waitForPageLoad();
  }

  async navigateToItem(id: string): Promise<void> {
    await super.navigate(`/inventory-item.html?id=${id}`);
    await this.waitForPageLoad();
  }

  async getProductName(): Promise<string> {
    return this.getText(this.productName);
  }

  async getProductDescription(): Promise<string> {
    return this.getText(this.productDescription);
  }

  async getProductPrice(): Promise<string> {
    return this.getText(this.productPrice);
  }

  async isProductImageVisible(): Promise<boolean> {
    return this.isVisible(this.productImage);
  }

  async addToCart(): Promise<void> {
    await this.click(this.addToCartButton, "Add to cart button");
  }

  async removeFromCart(): Promise<void> {
    await this.click(this.removeFromCartButton, "Remove from cart button");
  }

  async backToProducts(): Promise<void> {
    await this.click(this.backToProductsButton, "Back to products button");
  }

  async verifyProductDetails(): Promise<void> {
    await expect(this.productName).toBeVisible();
    await expect(this.productDescription).toBeVisible();
    await expect(this.productPrice).toBeVisible();
    await expect(this.productImage).toBeVisible();
  }
}
