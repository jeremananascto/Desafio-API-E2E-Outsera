// Consolida os resultados (API e E2E) em Markdown. Usado no Job Summary do GitHub Actions.
const fs = require('node:fs');

const read = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null);
const lines = ['# Resumo da execução', '', '| Suíte | Resultado | Detalhes |', '|---|---|---|'];
let failed = false;

const api = read('reports/api/results.json');
if (api) {
  const { expected, unexpected, flaky, skipped } = api.stats;
  failed ||= unexpected > 0;
  lines.push(
    `| API (Playwright) | ${unexpected ? '❌' : '✅'} | ${expected} ok, ${unexpected} falhas, ${flaky} flaky, ${skipped} ignorados |`,
  );
}

const e2e = read('reports/e2e/cucumber-report.json');
if (e2e) {
  let passed = 0;
  let bad = 0;
  for (const feature of e2e) {
    for (const scenario of feature.elements.filter((e) => e.type === 'scenario')) {
      const ok = scenario.steps.every((s) => s.result.status === 'passed');
      ok ? passed++ : bad++;
    }
  }
  failed ||= bad > 0;
  const retryFile = 'reports/e2e/retries.jsonl';
  const retryEvents = fs.existsSync(retryFile)
    ? fs.readFileSync(retryFile, 'utf8').split(/\\r?\\n/).filter(Boolean).map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean)
    : [];
  const retriedScenarios = new Set(retryEvents.map((event) => event.scenario));
  lines.push(
    `| E2E (Cucumber) | ${bad ? '❌' : retriedScenarios.size ? '⚠️' : '✅'} | ` +
    `${passed} cenários ok, ${bad} falhas, ${retriedScenarios.size} cenários com retry ` +
    `(${retryEvents.length} tentativas repetidas) |`,
  );
  if (retriedScenarios.size) {
    lines.push('', '### Instabilidades E2E detectadas', '');
    for (const scenario of retriedScenarios) lines.push(`- ${scenario}`);
  }
}

console.log(lines.join('\n'));
if (process.argv.includes('--strict') && failed) process.exit(1);
