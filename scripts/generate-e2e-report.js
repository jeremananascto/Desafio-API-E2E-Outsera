
const fs = require('node:fs');

const jsonDir = 'reports/e2e';
if (!fs.existsSync(`${jsonDir}/cucumber-report.json`)) {
  console.error('cucumber-report.json não encontrado. Rode "npm run test:e2e" antes.');
  process.exit(1);
}

(async () => {

  const mod = await import('multiple-cucumber-html-reporter');
  const report = mod.default ?? mod;
  report.generate({
    jsonDir,
    reportPath: `${jsonDir}/html`,
    pageTitle: 'Relatório E2E',
    reportName: 'Testes E2E - Cucumber + Playwright',
    displayDuration: true,
    displayReportTime: true,
    metadata: {
      browser: { name: 'chrome', version: 'Chromium (Playwright)' },
      device: process.env.CI ? 'GitHub Actions runner' : 'Máquina local',
      platform: { name: process.platform },
    },
    customData: {
      title: 'Execução',
      data: [
        { label: 'Aplicação', value: process.env.E2E_BASE_URL || 'https://www.saucedemo.com' },
        { label: 'Commit', value: process.env.GITHUB_SHA || 'local' },
        { label: 'Gerado em', value: new Date().toISOString() },
      ],
    },
  });
  console.log(`Relatório gerado em ${jsonDir}/html/index.html`);
})();
