import { BasePage } from './BasePage';

export interface CardData {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
}

export type CardField = 'name' | 'number' | 'expiry' | 'cvv';

export class PaymentPage extends BasePage {
  async open(url: string): Promise<void> {
    await this.goto(url);
    await this.byTest('pay-button').waitFor();
  }

  async fill(data: Partial<CardData>): Promise<void> {
    for (const [field, value] of Object.entries(data)) {
      await this.byTest(`card-${field}`).fill(value);
    }
  }

  async pay(): Promise<void> {
    await this.byTest('pay-button').click();
  }

  async fieldError(field: CardField): Promise<string> {
    return (await this.byTest(`card-${field}-error`).innerText()).trim();
  }

  async isPaymentApproved(): Promise<boolean> {
    return this.byTest('payment-success').isVisible();
  }
}
