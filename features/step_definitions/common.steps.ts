import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { env } from '../../src/config/env';
import { CustomWorld } from '../support/world';

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

Given('que estou na página de login', async function (this: CustomWorld) {
  await this.loginPage.open(this.baseURL);
});

Given('que estou logado como {string}', async function (this: CustomWorld, user: string) {
  await this.loginPage.open(this.baseURL);
  await this.loginPage.login(user, env.e2e.password);
  await expect(this.page).toHaveURL(/inventory\.html/);
});

When(
  'acesso diretamente o caminho {string} sem estar autenticado',
  async function (this: CustomWorld, path: string) {
    await this.page.goto(`${this.baseURL}${path}`, { waitUntil: 'domcontentloaded' });
  },
);

Then('a URL deve conter {string}', async function (this: CustomWorld, fragment: string) {
  await expect(this.page).toHaveURL(new RegExp(escapeRegExp(fragment)));
});

Then('devo ver a página {string}', async function (this: CustomWorld, title: string) {

  await expect(this.page.locator('[data-test="title"]')).toHaveText(title);
});
