
const common = {
  paths: ['features/**/*.feature'],
  requireModule: ['ts-node/register'],
  require: ['features/support/**/*.ts', 'features/step_definitions/**/*.ts'],
  format: [
    'progress-bar',
    'html:reports/e2e/cucumber-report.html',
    'json:reports/e2e/cucumber-report.json',
    'junit:reports/e2e/cucumber-junit.xml',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  retry: process.env.CI ? 1 : 0,
};

module.exports = {
  default: common,
  smoke: { ...common, tags: '@smoke' },
  positive: { ...common, tags: '@positive' },
  negative: { ...common, tags: '@negative' },
};
