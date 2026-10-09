import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

const SORT_OPTIONS: Record<string, 'az' | 'za' | 'lohi' | 'hilo'> = {
  'Name (A to Z)': 'az',
  'Name (Z to A)': 'za',
  'Price (low to high)': 'lohi',
  'Price (high to low)': 'hilo',
};

When('abro o carrinho', async function (this: CustomWorld) {
  await this.inventoryPage.openCart();
});

When('volto para o catálogo', async function (this: CustomWorld) {
  await this.cartPage.backToShopping();
});

When('ordeno os produtos por {string}', async function (this: CustomWorld, label: string) {
  await this.inventoryPage.sortBy(SORT_OPTIONS[label]);
});

Then('devo ver {int} produtos no catálogo', async function (this: CustomWorld, count: number) {
  expect(await this.inventoryPage.productCount()).toBe(count);
});

Then('o contador do carrinho deve exibir {int}', async function (this: CustomWorld, count: number) {
  await expect
    .poll(() => this.inventoryPage.cartCount(), { message: 'badge do carrinho' })
    .toBe(count);
});

Then(
  'os produtos devem estar ordenados por {string}',
  async function (this: CustomWorld, label: string) {
    const option = SORT_OPTIONS[label];
    if (option === 'az' || option === 'za') {
      const names = await this.inventoryPage.productNames();
      const expected = [...names].sort();
      expect(names).toEqual(option === 'az' ? expected : expected.reverse());
    } else {
      const prices = await this.inventoryPage.productPrices();
      const expected = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(option === 'lohi' ? expected : expected.reverse());
    }
  },
);
