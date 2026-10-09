import { Page, Locator } from 'playwright';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}


  protected byTest(id: string): Locator {
    return this.page.locator(`[data-test="${id}"]`);
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  get currentUrl(): string {
    return this.page.url();
  }
}
