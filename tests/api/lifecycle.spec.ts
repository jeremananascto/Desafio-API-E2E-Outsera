import { test, expect, JSON_HEADERS, authCookie } from './support/fixtures';
import { buildBooking } from './support/data';
import { bookingSchema, createBookingResponseSchema } from './support/schemas';


test.describe('Ciclo de vida completo da reserva', { tag: ['@e2e', '@positive'] }, () => {
  test('CRUD completo encadeado', async ({ request, authToken }) => {
    const auth = { ...JSON_HEADERS, ...authCookie(authToken) };

    let id = 0;

    await test.step('POST: cria a reserva', async () => {
      const created = await request.post('/booking', {
        headers: JSON_HEADERS,
        data: buildBooking(),
      });
      expect(created.status()).toBe(200);
      id = createBookingResponseSchema.parse(await created.json()).bookingid;
    });

    await test.step('GET: lê a reserva criada', async () => {
      const response = await request.get(`/booking/${id}`);
      expect(response.status()).toBe(200);
      bookingSchema.parse(await response.json());
    });

    await test.step('PUT: substitui a reserva', async () => {
      const response = await request.put(`/booking/${id}`, {
        headers: auth,
        data: buildBooking({ firstname: 'Fluxo', totalprice: 500 }),
      });
      expect(response.status()).toBe(200);
      expect((await response.json()).firstname).toBe('Fluxo');
    });

    await test.step('PATCH: altera parcialmente', async () => {
      const response = await request.patch(`/booking/${id}`, {
        headers: auth,
        data: { additionalneeds: 'Late checkout' },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.additionalneeds).toBe('Late checkout');
      expect(body.firstname).toBe('Fluxo');
    });

    await test.step('DELETE: remove a reserva', async () => {
      const response = await request.delete(`/booking/${id}`, { headers: auth });
      expect(response.status()).toBe(201);
    });

    await test.step('GET: reserva não existe mais', async () => {
      expect((await request.get(`/booking/${id}`)).status()).toBe(404);
    });
  });
});
