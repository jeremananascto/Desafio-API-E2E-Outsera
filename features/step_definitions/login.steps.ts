import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

When(
  'faço login com usuário {string} e senha {string}',
  async function (this: CustomWorld, user: string, password: string) {
    await this.loginPage.login(user, password);
  },
);

When('faço logout', async function (this: CustomWorld) {
  await this.inventoryPage.logout();
});

When('digito {string} no campo de senha', async function (this: CustomWorld, value: string) {
  await this.loginPage.typePassword(value);
});

Then('devo ver a página de produtos', async function (this: CustomWorld) {
  expect(await this.inventoryPage.pageTitle()).toBe('Products');
});

Then(
  'devo ver a mensagem de erro de login {string}',
  async function (this: CustomWorld, expected: string) {
    expect(await this.loginPage.errorMessage()).toContain(expected);
  },
);

Then('devo permanecer na página de login', async function (this: CustomWorld) {
  expect(await this.loginPage.isLoginFormVisible()).toBe(true);
  await expect(this.page).not.toHaveURL(/inventory\.html/);
});

Then('o campo de senha deve estar mascarado', async function (this: CustomWorld) {
  expect(await this.loginPage.isPasswordMasked()).toBe(true);
});
