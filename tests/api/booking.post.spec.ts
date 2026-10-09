import { test, expect, expectJson, JSON_HEADERS, authCookie, rawBody } from './support/fixtures';
import { buildBooking } from './support/data';
import { createBookingResponseSchema } from './support/schemas';

test.describe('POST /booking - positivos', { tag: ['@smoke', '@positive'] }, () => {
  test('cria reserva e ecoa os dados enviados', async ({ request, authToken }) => {
    const payload = buildBooking();
    const response = await request.post('/booking', { headers: JSON_HEADERS, data: payload });
    const body = createBookingResponseSchema.parse(await expectJson(response, 200));

    expect(body.booking).toEqual(payload);

    
    const fetched = await request.get(`/booking/${body.bookingid}`);
    expect(fetched.status()).toBe(200);

    await request.delete(`/booking/${body.bookingid}`, { headers: authCookie(authToken) });
  });

  test('cria reserva sem campo opcional additionalneeds', async ({ request, authToken }) => {
    const { additionalneeds: _omit, ...payload } = buildBooking();
    const response = await request.post('/booking', { headers: JSON_HEADERS, data: payload });
    const body = createBookingResponseSchema.parse(await expectJson(response, 200));

    expect(body.booking.firstname).toBe(payload.firstname);
    await request.delete(`/booking/${body.bookingid}`, { headers: authCookie(authToken) });
  });

  test('IDs gerados são únicos entre criações consecutivas', async ({ bookingFactory }) => {
    const a = await bookingFactory();
    const b = await bookingFactory();
    expect(a.id).not.toBe(b.id);
  });

  test('aceita caracteres especiais e unicode nos nomes', async ({ bookingFactory, request }) => {
    const created = await bookingFactory({ firstname: 'José-Ação', lastname: "D'Ávila ç" });
    const body = await (await request.get(`/booking/${created.id}`)).json();
    expect(body.firstname).toBe('José-Ação');
    expect(body.lastname).toBe("D'Ávila ç");
  });
});

test.describe('POST /booking - negativos', { tag: '@negative' }, () => {
  
  const REJECTED = [400, 500];

  const requiredFields = ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'];
  for (const field of requiredFields) {
    test(`rejeita payload sem o campo obrigatório "${field}"`, async ({ request }) => {
      const payload: Record<string, unknown> = { ...buildBooking() };
      delete payload[field];

      const response = await request.post('/booking', { headers: JSON_HEADERS, data: payload });
      expect(REJECTED).toContain(response.status());
    });
  }

  test('rejeita corpo vazio', async ({ request }) => {
    const response = await request.post('/booking', { headers: JSON_HEADERS, data: {} });
    expect(REJECTED).toContain(response.status());
  });

  test('rejeita JSON malformado', async ({ request }) => {
    const response = await request.post('/booking', {
      headers: JSON_HEADERS,
      data: rawBody('{"firstname": "Ana", "lastname": '),
    });
    expect(REJECTED).toContain(response.status());
  });

  test('rejeita bookingdates sem checkout', async ({ request }) => {
    const payload = { ...buildBooking(), bookingdates: { checkin: '2026-01-10' } };
    const response = await request.post('/booking', { headers: JSON_HEADERS, data: payload });
    expect(REJECTED).toContain(response.status());
  });

  test('POST em /booking/:id não é um método válido', async ({ request, booking }) => {
    const response = await request.post(`/booking/${booking.id}`, {
      headers: JSON_HEADERS,
      data: buildBooking(),
    });
    expect([404, 405]).toContain(response.status());
  });
});
