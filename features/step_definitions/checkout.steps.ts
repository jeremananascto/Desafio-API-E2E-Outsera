import { DataTable, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { VALID_SHIPPING } from '../support/test-data';

When('adiciono {string} ao carrinho', async function (this: CustomWorld, product: string) {
  await this.inventoryPage.addToCart(product);
  this.state.addedProducts.push(product);
});

When(
  'adiciono os seguintes produtos ao carrinho:',
  async function (this: CustomWorld, table: DataTable) {
    for (const [product] of table.raw()) {
      await this.inventoryPage.addToCart(product);
      this.state.addedProducts.push(product);
    }
  },
);

When('removo {string} do carrinho', async function (this: CustomWorld, product: string) {
  await this.cartPage.remove(product);
});

When('inicio o checkout', async function (this: CustomWorld) {
  await this.cartPage.checkout();
});

When('preencho os dados de entrega válidos', async function (this: CustomWorld) {
  await this.checkoutPage.fillShipping(VALID_SHIPPING);
});

When(
  'preencho os dados de entrega com nome {string}, sobrenome {string} e CEP {string}',
  async function (this: CustomWorld, firstName: string, lastName: string, postalCode: string) {
    await this.checkoutPage.fillShipping({ firstName, lastName, postalCode });
  },
);

When('continuo o checkout', async function (this: CustomWorld) {
  await this.checkoutPage.continue();
});

When('cancelo o checkout', async function (this: CustomWorld) {
  await this.checkoutPage.cancel();
});

When('finalizo a compra', async function (this: CustomWorld) {
  await this.checkoutPage.finish();
});

Then(/^o carrinho deve conter (\d+) produtos?$/, async function (this: CustomWorld, count: string) {
  await expect
    .poll(() => this.cartPage.itemCount(), { message: 'itens no carrinho' })
    .toBe(Number(count));
});

Then('o carrinho não deve listar {string}', async function (this: CustomWorld, product: string) {
  await expect.poll(() => this.cartPage.itemNames()).not.toContain(product);
});

Then('o subtotal deve ser a soma dos preços dos produtos', async function (this: CustomWorld) {
  const prices = await this.checkoutPage.overviewItemPrices();
  expect(prices).toHaveLength(this.state.addedProducts.length);
  const sum = prices.reduce((acc, p) => acc + p, 0);
  expect(await this.checkoutPage.itemTotal()).toBeCloseTo(sum, 2);
  expect(await this.checkoutPage.totalLabel()).toMatch(/^Total: \$\d+\.\d{2}$/);
});

Then(
  'devo ver a mensagem de erro de checkout {string}',
  async function (this: CustomWorld, expected: string) {
    expect(await this.checkoutPage.errorMessage()).toContain(expected);
  },
);

Then('devo ver a confirmação {string}', async function (this: CustomWorld, message: string) {
  expect(await this.checkoutPage.confirmationHeader()).toBe(message);
  await expect(this.page).toHaveURL(/checkout-complete\.html/);
});
