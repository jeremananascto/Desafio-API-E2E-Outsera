import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from 'playwright';
import { env } from '../../src/config/env';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;


  loginPage!: LoginPage;
  inventoryPage!: InventoryPage;
  cartPage!: CartPage;
  checkoutPage!: CheckoutPage;
  paymentPage!: PaymentPage;

  state: { addedProducts: string[]; lastError?: string } = { addedProducts: [] };

  readonly baseURL = env.e2e.baseURL;
  readonly paymentURL = `http://localhost:${env.e2e.demoAppPort}`;

  constructor(options: IWorldOptions) {
    super(options);
  }

  initPages(): void {
    this.loginPage = new LoginPage(this.page);
    this.inventoryPage = new InventoryPage(this.page);
    this.cartPage = new CartPage(this.page);
    this.checkoutPage = new CheckoutPage(this.page);
    this.paymentPage = new PaymentPage(this.page);
  }
}

setWorldConstructor(CustomWorld);
