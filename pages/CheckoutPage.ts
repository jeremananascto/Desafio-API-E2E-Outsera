import { BasePage } from './BasePage';

export interface ShippingData {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage extends BasePage {
  private readonly title = this.byTest('title');
  private readonly firstName = this.byTest('firstName');
  private readonly lastName = this.byTest('lastName');
  private readonly postalCode = this.byTest('postalCode');
  private readonly continueButton = this.byTest('continue');
  private readonly cancelButton = this.byTest('cancel');
  private readonly finishButton = this.byTest('finish');
  private readonly error = this.byTest('error');

  async pageTitle(): Promise<string> {
    await this.title.waitFor();
    return (await this.title.innerText()).trim();
  }

  async fillShipping(data: Partial<ShippingData>): Promise<void> {
    if (data.firstName !== undefined) await this.firstName.fill(data.firstName);
    if (data.lastName !== undefined) await this.lastName.fill(data.lastName);
    if (data.postalCode !== undefined) await this.postalCode.fill(data.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async errorMessage(): Promise<string> {
    await this.error.waitFor({ state: 'visible' });
    return (await this.error.innerText()).trim();
  }

  async itemTotal(): Promise<number> {
    const text = await this.byTest('subtotal-label').innerText();
    return Number(text.replace(/[^0-9.]/g, ''));
  }

  async overviewItemPrices(): Promise<number[]> {
    const texts = await this.byTest('inventory-item-price').allInnerTexts();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async totalLabel(): Promise<string> {
    return (await this.byTest('total-label').innerText()).trim();
  }

  async confirmationHeader(): Promise<string> {
    const header = this.byTest('complete-header');
    await header.waitFor();
    return (await header.innerText()).trim();
  }
}
