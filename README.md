# We Do IT — Automação de Testes (API · E2E · CI/CD)

Suíte de automação de testes construída como se fosse para produção: testes de **API** (Playwright Test), **E2E** com **Cucumber + Playwright** (Page Object Pattern) e pipeline de **CI/CD** no GitHub Actions, com relatórios e evidências publicados como artefatos.


| Camada | Ferramenta | Alvo | Qtde |
|---|---|---|---|
| API | Playwright Test (TypeScript) + Zod | [Restful-Booker](https://restful-booker.herokuapp.com) (CRUD + autenticação) | 64 testes |
| E2E | Cucumber (Gherkin em pt-BR) + Playwright | [SauceDemo](https://www.saucedemo.com) (login, navegação, checkout) + `demo-app` local (pagamento com cartão) | 49 cenários |
| CI/CD | GitHub Actions | — | 4 jobs |

## Arquitetura / estrutura de pastas

```
.
├── .github/workflows/ci.yml        # Pipeline: qualidade → API / E2E → relatório consolidado
├── src/config/env.ts               # Configuração central (lê .env, com defaults seguros)
├── tests/api/                      # Testes de API (Playwright Test)
│   ├── support/
│   │   ├── fixtures.ts             # authToken, booking, bookingFactory (com cleanup automático)
│   │   ├── schemas.ts              # Contratos Zod das respostas
│   │   └── data.ts                 # Factory de dados únicos (execução paralela segura)
│   ├── health.spec.ts · auth.spec.ts
│   ├── booking.{get,post,put,patch,delete}.spec.ts
│   ├── methods.spec.ts             # métodos inválidos / recurso inexistente
│   └── lifecycle.spec.ts           # CRUD encadeado ponta a ponta
├── features/                       # E2E (Cucumber)
│   ├── *.feature                   # login · navegacao · checkout · pagamento (Gherkin pt-BR)
│   ├── step_definitions/           # steps finos: só orquestram Page Objects
│   └── support/                    # World, hooks (browser, trace, screenshot), massa de dados
├── pages/                          # Page Objects (BasePage, Login, Inventory, Cart, Checkout, Payment)
├── demo-app/                       # Página de pagamento local (validação de cartão, Luhn) + servidor
├── scripts/                        # generate-e2e-report.js · ci-summary.js
├── cucumber.js · playwright.config.ts · tsconfig.json · eslint.config.mjs
└── reports/                        # Saída das execuções (ignorada pelo git)
```

**Decisões de design**

- **Isolamento total:** cada teste de API cria os próprios dados via fixture e os remove no teardown; cada cenário E2E roda em um `BrowserContext` novo. Nada depende de ordem de execução.
- **Page Object Pattern:** seletores ficam só em `pages/` (via `data-test`, estáveis); steps e features não conhecem o DOM.
- **Contrato validado com Zod:** além de status e headers, o corpo é validado por schema.
- **Dados únicos por teste:** evita colisão em execução paralela.
- **Evidências:** screenshot em **todos** os cenários E2E (inclusive falhas esperadas dos negativos) e *trace* do Playwright para qualquer falha real.
- **Por que existe o `demo-app`:** o SauceDemo não tem formulário de cartão. Para cobrir "número de cartão inválido" de forma determinística (sem depender de terceiros), há uma página local com validação de Luhn, validade, CVV e nome.

## Versões utilizadas

| Item | Versão |
|---|---|
| Node.js | ≥ 20 (CI usa 20; desenvolvimento validado com 22) |
| @playwright/test / playwright | 1.64.0 |
| @cucumber/cucumber | 13.3.0 |
| TypeScript / ts-node | 6.0.3 / 10.9.2 |
| zod | 4.6.5 |
| multiple-cucumber-html-reporter | 4.4.2 |
| ESLint / Prettier | 10.12.0 / 3.9.9 |

## Dependências e instalação

```bash
# 1. Dependências Node
npm ci

# 2. Navegador usado no E2E
npm run install:browsers          # (Linux/CI: npx playwright install --with-deps chromium)

# 3. Configuração (os defaults já funcionam; ajuste só se quiser trocar alvos)
cp .env.example .env

```

## Como executar os testes e gerar os relatórios

### API
```bash
npm run test:api              # suíte completa
npm run test:api:smoke        # apenas @smoke
npm run test:api:negative     # apenas cenários negativos
npm run report:api            # abre o relatório HTML (reports/api/html)
```
Saídas: `reports/api/html` (HTML), `reports/api/junit.xml`, `reports/api/results.json`, traces das falhas.

### E2E (Cucumber)
```bash
npm run test:e2e              # todos os cenários
npm run test:e2e:smoke        # @smoke
npm run test:e2e:negative     # @negative
npm run report:e2e            # gera reports/e2e/html/index.html (com screenshots)
npm run test:e2e:dry          # valida Gherkin + steps sem abrir navegador
HEADLESS=false SLOW_MO=300 npm run test:e2e   # modo visual para depuração
```
Saídas: `reports/e2e/cucumber-report.html` (relatório nativo), `reports/e2e/html` (relatório detalhado), `cucumber-report.json`, `cucumber-junit.xml`, `reports/e2e/traces/*.zip` (falhas; abra com `npx playwright show-trace`).

Filtros por tag em qualquer perfil: `npx cucumber-js --tags "@checkout and @negative"`.

### Tudo de uma vez
```bash
npm test && npm run report:e2e
npm run typecheck && npm run lint
```

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml` roda a cada push/PR e também por agendamento noturno e disparo manual:

1. **quality** — typecheck, ESLint e *dry-run* do Cucumber (garante que nenhum step ficou sem implementação).
2. **api-tests** e **e2e-tests** — em paralelo, após `quality`. Cada um publica seu relatório como artefato (retenção de 14 dias).
3. **report** — baixa os artefatos e escreve uma tabela consolidada no *Job Summary*; falha o pipeline se qualquer suíte falhou.


## Cenários cobertos (resumo)

- **API:** healthcheck; autenticação (válida + 7 variações inválidas, incluindo SQL injection e payload malformado); listagem com filtros; GET/POST/PUT/PATCH/DELETE com status, headers, corpo e schema; campos obrigatórios ausentes um a um; JSON malformado; token ausente/inválido/Basic Auth incorreto; IDs inexistentes e inválidos; idempotência do PUT; métodos HTTP inválidos; content-type não suportado; unicode; CRUD encadeado.
- **E2E:** login válido/inválido (senha, usuário inexistente, bloqueado, case-sensitive, SQL injection, campos em branco), logout, máscara de senha, proteção de rotas; navegação até o formulário, contador do carrinho, ordenação (4 critérios); checkout com 1 e vários produtos, soma do subtotal, remoção, cancelamento, dados de entrega incompletos; pagamento com 4 bandeiras/formatos e 12 variações inválidas (Luhn, tamanho, letras, validade expirada/inválida, CVV, nome, formulário vazio).

## Comportamentos particulares do Restful-Booker

A API de referência foge de convenções REST em alguns pontos. Os testes **documentam** esses comportamentos em vez de escondê-los:

| Situação | Retorno real | Convencional |
|---|---|---|
| Credenciais inválidas em `POST /auth` | 200 + `{"reason":"Bad credentials"}` | 401 |
| `DELETE /booking/:id` com sucesso | 201 `Created` | 204/200 |
| `GET /ping` | 201 | 200 |
| PUT/PATCH/DELETE em ID inexistente | 405 | 404 |
| POST com payload inválido/malformado | 500 | 400 |

Onde a API pode legitimamente variar, o teste aceita uma lista explícita (ex.: `[400, 500]`) com comentário. Se você trocar o alvo por uma API que segue as convenções, basta apertar essas asserções.
