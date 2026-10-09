import { test, expect } from './support/fixtures';

test.describe('Health check - GET /ping', { tag: ['@smoke', '@positive'] }, () => {
  test('API responde ao healthcheck', async ({ request }) => {
    const response = await request.get('/ping');
   
    expect(response.status()).toBe(201);
    expect(await response.text()).toBe('Created');
  });

  test('tempo de resposta do healthcheck é aceitável', async ({ request }) => {
    const start = Date.now();
    await request.get('/ping');
    expect(Date.now() - start).toBeLessThan(5_000);
  });
});
