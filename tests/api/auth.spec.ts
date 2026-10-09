import { env } from '../../src/config/env';
import { test, expect, JSON_HEADERS, rawBody } from './support/fixtures';
import { authFailureSchema, authSuccessSchema } from './support/schemas';

test.describe('POST /auth - positivos', { tag: ['@smoke', '@positive'] }, () => {
  test('credenciais válidas retornam token', async ({ request }) => {
    const response = await request.post('/auth', {
      headers: JSON_HEADERS,
      data: { username: env.api.username, password: env.api.password },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = authSuccessSchema.parse(await response.json());
    expect(body.token).toMatch(/^[a-z0-9]+$/i);
  });
});

test.describe('POST /auth - negativos', { tag: '@negative' }, () => {
  
  const invalidCredentials = [
    { name: 'senha incorreta', data: { username: env.api.username, password: 'errada' } },
    { name: 'usuário inexistente', data: { username: 'nao-existe', password: env.api.password } },
    { name: 'usuário e senha vazios', data: { username: '', password: '' } },
    { name: 'campos ausentes (corpo vazio)', data: {} },
    { name: 'senha ausente', data: { username: env.api.username } },
    { name: 'usuário ausente', data: { password: env.api.password } },
    {
      name: 'tentativa de SQL injection',
      data: { username: "' OR '1'='1", password: "' OR '1'='1" },
    },
  ];

  for (const { name, data } of invalidCredentials) {
    test(`rejeita ${name}`, async ({ request }) => {
      const response = await request.post('/auth', { headers: JSON_HEADERS, data });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(authSuccessSchema.safeParse(body).success, 'não deve emitir token').toBe(false);
      expect(authFailureSchema.parse(body).reason).toBe('Bad credentials');
    });
  }

  test('payload malformado não gera token', async ({ request }) => {
    const response = await request.post('/auth', {
      headers: JSON_HEADERS,
      data: rawBody('{"username": "admin", "password": '),
    });

    expect([400, 500]).toContain(response.status());
    expect(await response.text()).not.toContain('"token"');
  });

  test('GET /auth não é permitido', async ({ request }) => {
    const response = await request.get('/auth');
    expect([404, 405]).toContain(response.status());
  });
});
