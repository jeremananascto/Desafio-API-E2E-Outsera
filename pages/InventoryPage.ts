import { BasePage } from './BasePage';

const slug = (name: string): string => name.toLowerCase().replace(/\s+/g, '-');

export class InventoryPage extends BasePage {
  private readonly title = this.byTest('title');
  private readonly items = this.byTest('inventory-item');
  private readonly cartLink = this.byTest('shopping-cart-link');
  private readonly cartBadge = this.byTest('shopping-cart-badge');
  private readonly sortSelect = this.page
    .locator('[data-test="product-sort-container"], select.product_sort_container')
    .first();

  async open(baseURL: string): Promise<void> {
    await this.goto(`${baseURL}/inventory.html`);
  }

  async pageTitle(): Promise<string> {
    await this.title.waitFor();
    return (await this.title.innerText()).trim();
  }

  async productCount(): Promise<number> {
    await this.items.first().waitFor();
    return this.items.count();
  }

  async addToCart(productName: string): Promise<void> {
    await this.byTest(`add-to-cart-${slug(productName)}`).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.byTest(`remove-${slug(productName)}`).click();
  }

  async cartCount(): Promise<number> {
    return (await this.cartBadge.isVisible()) ? Number(await this.cartBadge.innerText()) : 0;
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL(/cart\.html/);
  }

  async sortBy(optionValue: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    try {
      await this.sortSelect.waitFor({ state: 'visible', timeout: 10_000 });
      await this.sortSelect.selectOption(optionValue, { timeout: 10_000 });
    } catch (error) {
      // Diagnóstico: mostra o que realmente existe na página quando o dropdown não é encontrado.
      const testIds = await this.page
        .locator('[data-test]')
        .evaluateAll((els) => els.map((e) => e.getAttribute('data-test')))
        .catch(() => []);
      throw new Error(
        `Falha ao ordenar por "${optionValue}". URL: ${this.page.url()}. ` +
          `data-test na página: ${testIds.join(', ')}. Erro original: ${(error as Error).message}`,
      );
    }
  }

  async productNames(): Promise<string[]> {
    return this.byTest('inventory-item-name').allInnerTexts();
  }

  async productPrices(): Promise<number[]> {
    const texts = await this.byTest('inventory-item-price').allInnerTexts();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async logout(): Promise<void> {
    await this.page.locator('#react-burger-menu-btn').click();
    await this.byTest('logout-sidebar-link').click();
  }
}