import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  ITestCaseHookParameter,
  Status,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium, Browser } from 'playwright';
import type { Server } from 'node:http';
import { env } from '../../src/config/env';
import { CustomWorld } from './world';


const demoApp = await import('../../demo-app/server.js') as {start: (port: number) => Promise<Server>;};
setDefaultTimeout(30_000);

let browser: Browser;
let demoServer: Server;

BeforeAll(async function () {
  demoServer = await demoApp.start(env.e2e.demoAppPort);
  browser = await chromium.launch({ headless: env.e2e.headless, slowMo: env.e2e.slowMo });
});

AfterAll(async function () {
  await browser?.close();
  await new Promise<void>((resolve) => demoServer?.close(() => resolve()) ?? resolve());
});

Before(async function (this: CustomWorld) {
  
  this.context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await this.context.tracing.start({ screenshots: true, snapshots: true });
  this.page = await this.context.newPage();
  this.initPages();
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const failed = scenario.result?.status === Status.FAILED;

  
  try {
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');
  } catch {
  } catch (error) {
  console.warn('Não foi possível capturar o screenshot:', error);
}
  }

  if (failed) {
    const safeName = scenario.pickle.name.replace(/[^a-z0-9]+/gi, '_').slice(0, 80);
    await this.context.tracing.stop({ path: `reports/e2e/traces/${safeName}.zip` });
  } else {
    await this.context.tracing.stop();
  }
  await this.context.close();
});
