import {
  test,
  expect,
  expectJson,
  JSON_HEADERS,
  authCookie,
  basicAuth,
  rawBody,
} from './support/fixtures';
import { buildBooking, INVALID_TOKEN, NON_EXISTENT_ID } from './support/data';
import { bookingSchema } from './support/schemas';

test.describe('PUT /booking/:id - positivos', { tag: ['@smoke', '@positive'] }, () => {
  test('atualiza a reserva com token (cookie)', async ({ request, booking, authToken }) => {
    const updated = buildBooking({ totalprice: 999, depositpaid: false });
    const response = await request.put(`/booking/${booking.id}`, {
      headers: { ...JSON_HEADERS, ...authCookie(authToken) },
      data: updated,
    });

    expect(bookingSchema.parse(await expectJson(response, 200))).toEqual(updated);

    const persisted = await (await request.get(`/booking/${booking.id}`)).json();
    expect(persisted).toEqual(updated);
  });

  test('atualiza a reserva com Basic Auth', async ({ request, booking }) => {
    const updated = buildBooking({ firstname: 'AtualizadoBasic' });
    const response = await request.put(`/booking/${booking.id}`, {
      headers: { ...JSON_HEADERS, ...basicAuth() },
      data: updated,
    });

    expect(bookingSchema.parse(await expectJson(response, 200)).firstname).toBe('AtualizadoBasic');
  });

  test('PUT é idempotente: repetir a requisição gera o mesmo estado', async ({
    request,
    booking,
    authToken,
  }) => {
    const updated = buildBooking();
    const send = () =>
      request.put(`/booking/${booking.id}`, {
        headers: { ...JSON_HEADERS, ...authCookie(authToken) },
        data: updated,
      });

    const first = await (await send()).json();
    const second = await (await send()).json();
    expect(second).toEqual(first);
  });
});

test.describe('PUT /booking/:id - negativos', { tag: '@negative' }, () => {
  test('sem autenticação retorna 403 e não altera o recurso', async ({ request, booking }) => {
    const response = await request.put(`/booking/${booking.id}`, {
      headers: JSON_HEADERS,
      data: buildBooking({ firstname: 'NaoDeveMudar' }),
    });

    expect(response.status()).toBe(403);
    const persisted = await (await request.get(`/booking/${booking.id}`)).json();
    expect(persisted.firstname).toBe(booking.payload.firstname);
  });

  test('token inválido retorna 403', async ({ request, booking }) => {
    const response = await request.put(`/booking/${booking.id}`, {
      headers: { ...JSON_HEADERS, ...authCookie(INVALID_TOKEN) },
      data: buildBooking(),
    });
    expect(response.status()).toBe(403);
  });

  test('Basic Auth com senha errada retorna 403', async ({ request, booking }) => {
    const response = await request.put(`/booking/${booking.id}`, {
      headers: { ...JSON_HEADERS, ...basicAuth('admin', 'senha-errada') },
      data: buildBooking(),
    });
    expect(response.status()).toBe(403);
  });

  test('ID inexistente é rejeitado (405 na API de referência)', async ({ request, authToken }) => {
    const response = await request.put(`/booking/${NON_EXISTENT_ID}`, {
      headers: { ...JSON_HEADERS, ...authCookie(authToken) },
      data: buildBooking(),
    });
    expect([404, 405]).toContain(response.status());
  });

  test('payload incompleto (sem lastname) retorna 400', async ({ request, booking, authToken }) => {
    const { lastname: _omit, ...incomplete } = buildBooking();
    const response = await request.put(`/booking/${booking.id}`, {
      headers: { ...JSON_HEADERS, ...authCookie(authToken) },
      data: incomplete,
    });
    expect([400, 500]).toContain(response.status());
  });

  test('JSON malformado é rejeitado', async ({ request, booking, authToken }) => {
    const response = await request.put(`/booking/${booking.id}`, {
      headers: { ...JSON_HEADERS, ...authCookie(authToken) },
      data: rawBody('{"firstname": '),
    });
    expect([400, 500]).toContain(response.status());
  });
});
