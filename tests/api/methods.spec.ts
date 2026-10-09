import { test, expect, JSON_HEADERS } from './support/fixtures';


test.describe('Métodos HTTP inválidos', { tag: '@negative' }, () => {
  const cases: Array<{ method: 'put' | 'patch' | 'delete' | 'post'; path: string }> = [
    { method: 'put', path: '/booking' },
    { method: 'patch', path: '/booking' },
    { method: 'delete', path: '/booking' },
    { method: 'post', path: '/ping' },
    { method: 'put', path: '/ping' },
    { method: 'delete', path: '/ping' },
  ];

  for (const { method, path } of cases) {
    test(`${method.toUpperCase()} ${path} é rejeitado`, async ({ request }) => {
      const response = await request[method](path, { headers: JSON_HEADERS, data: {} });
      expect([403, 404, 405]).toContain(response.status());
    });
  }

  test('recurso inexistente retorna 404', async ({ request }) => {
    const response = await request.get('/recurso-que-nao-existe');
    expect(response.status()).toBe(404);
  });

  test('Content-Type não suportado não cria reserva', async ({ request }) => {
    const response = await request.post('/booking', {
      headers: { 'Content-Type': 'text/plain', Accept: 'application/json' },
      data: 'firstname=Ana&lastname=Silva',
    });
    expect(response.status()).not.toBe(200);
  });
});
