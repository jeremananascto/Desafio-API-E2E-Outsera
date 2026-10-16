import fs from 'node:fs';
import path from 'node:path';
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

setDefaultTimeout(30_000);

let browser: Browser;
let demoServer: Server;

BeforeAll(async function () {
  fs.mkdirSync('reports/e2e/traces', { recursive: true });
  // Cada execução começa com um registro limpo de retries.
  fs.rmSync('reports/e2e/retries.jsonl', { force: true });

  const demoApp = await import('../../demo-app/server.js');

  demoServer = await demoApp.start(env.e2e.demoAppPort);

  browser = await chromium.launch({
    headless: env.e2e.headless,
    slowMo: env.e2e.slowMo,
  });
});

AfterAll(async function () {
  await browser?.close();

  await new Promise<void>((resolve, reject) => {
    if (!demoServer?.listening) {
      resolve();
      return;
    }

    demoServer.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
});

Before(async function (this: CustomWorld) {
  this.context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  await this.context.tracing.start({
    screenshots: true,
    snapshots: true,
  });

  this.page = await this.context.newPage();
  this.initPages();
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const failed = scenario.result?.status === Status.FAILED;

  // Cucumber executa o hook também na tentativa que será repetida.
  // Guardamos um evento por linha para o resumo consolidado da CI.
  if (scenario.willBeRetried) {
    const reportDir = 'reports/e2e';
    fs.mkdirSync(reportDir, { recursive: true });
    fs.appendFileSync(
      path.join(reportDir, 'retries.jsonl'),
      JSON.stringify({
        scenario: scenario.pickle.name,
        status: scenario.result?.status ?? 'UNKNOWN',
        timestamp: new Date().toISOString(),
        retryScheduled: true,
      }) + '\\n',
    );
    this.attach(
      `Instabilidade detectada: "${scenario.pickle.name}" falhou e será reexecutado pelo retry do Cucumber.`,
      'text/plain',
    );
    console.warn(`[FLAKY] "${scenario.pickle.name}" falhou; nova tentativa agendada.`);
  }

  try {
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');
  } catch (error) {
    console.warn('Não foi possível capturar o screenshot:', error);
  }

  if (failed) {
    const safeName = scenario.pickle.name.replace(/[^a-z0-9]+/gi, '_').slice(0, 80);

    await this.context.tracing.stop({
      path: `reports/e2e/traces/${safeName}.zip`,
    });
  } else {
    await this.context.tracing.stop();
  }

  await this.context.close();
});
