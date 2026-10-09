import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private readonly items = this.byTest('inventory-item');
  private readonly checkoutButton = this.byTest('checkout');
  private readonly continueShopping = this.byTest('continue-shopping');

  async itemNames(): Promise<string[]> {
    return this.byTest('inventory-item-name').allInnerTexts();
  }

  async itemCount(): Promise<number> {
    return this.items.count();
  }

  async remove(productName: string): Promise<void> {
    await this.byTest(`remove-${productName.toLowerCase().replace(/\s+/g, '-')}`).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async backToShopping(): Promise<void> {
    await this.continueShopping.click();
  }
}
