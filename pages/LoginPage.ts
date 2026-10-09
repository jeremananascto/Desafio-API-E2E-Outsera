import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly username = this.byTest('username');
  private readonly password = this.byTest('password');
  private readonly loginButton = this.byTest('login-button');
  private readonly error = this.byTest('error');

  async open(baseURL: string): Promise<void> {
    await this.goto(baseURL);
    await this.loginButton.waitFor();
  }

  async login(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }

  async errorMessage(): Promise<string> {
    await this.error.waitFor({ state: 'visible' });
    return (await this.error.innerText()).trim();
  }

  async isPasswordMasked(): Promise<boolean> {
    return (await this.password.getAttribute('type')) === 'password';
  }

  async typePassword(value: string): Promise<void> {
    await this.password.fill(value);
  }

  async isLoginFormVisible(): Promise<boolean> {
    return this.loginButton
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true, () => false);
  }
}
