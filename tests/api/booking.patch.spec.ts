import { test, expect, expectJson, JSON_HEADERS, authCookie } from './support/fixtures';
import { INVALID_TOKEN, NON_EXISTENT_ID } from './support/data';
import { bookingSchema } from './support/schemas';

test.describe('PATCH /booking/:id', { tag: '@positive' }, () => {
  test('atualiza apenas os campos enviados e preserva os demais', async ({
    request,
    booking,
    authToken,
  }) => {
    const response = await request.patch(`/booking/${booking.id}`, {
      headers: { ...JSON_HEADERS, ...authCookie(authToken) },
      data: { firstname: 'Parcial', totalprice: 111 },
    });

    const body = bookingSchema.parse(await expectJson(response, 200));
    expect(body.firstname).toBe('Parcial');
    expect(body.totalprice).toBe(111);
    expect(body.lastname).toBe(booking.payload.lastname);
    expect(body.bookingdates).toEqual(booking.payload.bookingdates);
  });
});

test.describe('PATCH /booking/:id (negativos)', { tag: '@negative' }, () => {
  test('sem autenticação retorna 403', async ({ request, booking }) => {
    const response = await request.patch(`/booking/${booking.id}`, {
      headers: JSON_HEADERS,
      data: { firstname: 'X' },
    });
    expect(response.status()).toBe(403);
  });

  test('token inválido retorna 403', async ({ request, booking }) => {
    const response = await request.patch(`/booking/${booking.id}`, {
      headers: { ...JSON_HEADERS, ...authCookie(INVALID_TOKEN) },
      data: { firstname: 'X' },
    });
    expect(response.status()).toBe(403);
  });

  test('ID inexistente é rejeitado', async ({ request, authToken }) => {
    const response = await request.patch(`/booking/${NON_EXISTENT_ID}`, {
      headers: { ...JSON_HEADERS, ...authCookie(authToken) },
      data: { firstname: 'X' },
    });
    expect([404, 405]).toContain(response.status());
  });
});
