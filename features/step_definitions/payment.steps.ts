import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CardField } from '../../pages/PaymentPage';
import { CustomWorld } from '../support/world';

const FIELD_ALIASES: Record<string, CardField> = {
  nome: 'name',
  numero: 'number',
  validade: 'expiry',
  cvv: 'cvv',
};

Given('que estou na página de pagamento', async function (this: CustomWorld) {
  await this.paymentPage.open(this.paymentURL);
});

When(
  'preencho o cartão com nome {string}, número {string}, validade {string} e CVV {string}',
  async function (this: CustomWorld, name: string, number: string, expiry: string, cvv: string) {
    await this.paymentPage.fill({ name, number, expiry, cvv });
  },
);

When('confirmo o pagamento', async function (this: CustomWorld) {
  await this.paymentPage.pay();
});

Then('o pagamento deve ser aprovado', async function (this: CustomWorld) {
  expect(await this.paymentPage.isPaymentApproved()).toBe(true);
});

Then('o pagamento não deve ser aprovado', async function (this: CustomWorld) {
  expect(await this.paymentPage.isPaymentApproved()).toBe(false);
});

Then(
  'devo ver o erro {string} no campo {string}',
  async function (this: CustomWorld, message: string, field: string) {
    const key = FIELD_ALIASES[field];
    expect(key, `campo desconhecido: ${field}`).toBeDefined();
    expect(await this.paymentPage.fieldError(key)).toBe(message);
  },
);

Then('devo ver erros em todos os campos obrigatórios', async function (this: CustomWorld) {
  for (const field of Object.values(FIELD_ALIASES)) {
    expect(await this.paymentPage.fieldError(field), `erro do campo ${field}`).not.toBe('');
  }
});
