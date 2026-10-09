import { test, expect, authCookie, basicAuth } from './support/fixtures';
import { INVALID_TOKEN, NON_EXISTENT_ID } from './support/data';

test.describe('DELETE /booking/:id - positivos', { tag: ['@smoke', '@positive'] }, () => {
  test('remove a reserva (token) e ela deixa de existir', async ({
    request,
    booking,
    authToken,
  }) => {
    const response = await request.delete(`/booking/${booking.id}`, {
      headers: authCookie(authToken),
    });

    // Particularidade documentada: a API retorna 201 "Created" ao deletar.
    expect(response.status()).toBe(201);
    expect(await response.text()).toBe('Created');

    const after = await request.get(`/booking/${booking.id}`);
    expect(after.status()).toBe(404);
  });

  test('remove a reserva com Basic Auth', async ({ request, booking }) => {
    const response = await request.delete(`/booking/${booking.id}`, { headers: basicAuth() });
    expect(response.status()).toBe(201);
  });
});

test.describe('DELETE /booking/:id - negativos', { tag: '@negative' }, () => {
  test('sem autenticação retorna 403 e preserva o recurso', async ({ request, booking }) => {
    const response = await request.delete(`/booking/${booking.id}`);
    expect(response.status()).toBe(403);
    expect((await request.get(`/booking/${booking.id}`)).status()).toBe(200);
  });

  test('token inválido retorna 403 e preserva o recurso', async ({ request, booking }) => {
    const response = await request.delete(`/booking/${booking.id}`, {
      headers: authCookie(INVALID_TOKEN),
    });
    expect(response.status()).toBe(403);
    expect((await request.get(`/booking/${booking.id}`)).status()).toBe(200);
  });

  test('ID inexistente é rejeitado (405 na API de referência)', async ({ request, authToken }) => {
    const response = await request.delete(`/booking/${NON_EXISTENT_ID}`, {
      headers: authCookie(authToken),
    });
    expect([404, 405]).toContain(response.status());
  });

  test('deletar duas vezes: a segunda tentativa falha', async ({ request, booking, authToken }) => {
    const headers = authCookie(authToken);
    expect((await request.delete(`/booking/${booking.id}`, { headers })).status()).toBe(201);
    expect([404, 405]).toContain(
      (await request.delete(`/booking/${booking.id}`, { headers })).status(),
    );
  });
});
