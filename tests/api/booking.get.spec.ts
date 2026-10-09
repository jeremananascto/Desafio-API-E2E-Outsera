import { test, expect, expectJson } from './support/fixtures';
import { bookingListSchema, bookingSchema } from './support/schemas';
import { NON_EXISTENT_ID } from './support/data';


test.describe('GET /booking - listagem', { tag: ['@smoke', '@positive'] }, () => {
  test('retorna lista de IDs com schema válido', async ({ request }) => {
    const body = await expectJson(await request.get('/booking'), 200);
    const list = bookingListSchema.parse(body);
    expect(list.length).toBeGreaterThan(0);
  });

  test('filtra por firstname e lastname', async ({ request, booking }) => {
    const { firstname, lastname } = booking.payload;
    const body = await expectJson(
      await request.get('/booking', { params: { firstname, lastname } }),
      200,
    );
    expect(bookingListSchema.parse(body).map((b) => b.bookingid)).toContain(booking.id);
  });

  test('filtra por intervalo de datas', async ({ request, booking }) => {
    const body = await expectJson(
      await request.get('/booking', {
        params: { checkin: '2025-12-01', checkout: '2026-02-01' },
      }),
      200,
    );
    expect(bookingListSchema.parse(body).map((b) => b.bookingid)).toContain(booking.id);
  });
});

test.describe('GET /booking - listagem (negativos)', { tag: '@negative' }, () => {
  test('filtro sem correspondência retorna lista vazia', async ({ request }) => {
    const body = await expectJson(
      await request.get('/booking', { params: { firstname: 'NomeQueNaoExiste12345' } }),
      200,
    );
    expect(bookingListSchema.parse(body)).toHaveLength(0);
  });
});

test.describe('GET /booking/:id', { tag: '@positive' }, () => {
  test('retorna a reserva criada com corpo, headers e schema corretos', async ({
    request,
    booking,
  }) => {
    const response = await request.get(`/booking/${booking.id}`);
    const body = bookingSchema.parse(await expectJson(response, 200));

    expect(body).toEqual(booking.payload);
    expect(response.headers()['content-type']).toContain('application/json');
  });
});

test.describe('GET /booking/:id (negativos)', { tag: '@negative' }, () => {
  test('ID inexistente retorna 404', async ({ request }) => {
    const response = await request.get(`/booking/${NON_EXISTENT_ID}`);
    expect(response.status()).toBe(404);
  });


  for (const id of ['abc', '-1', '0']) {
    test(`ID inválido "${id}" não retorna reserva`, async ({ request }) => {
      const response = await request.get(`/booking/${encodeURIComponent(id)}`);
      expect([400, 404]).toContain(response.status());
    });
  }


  for (const id of ['1.5', "1'OR'1'='1"]) {
    test(`ID malformado "${id}" não causa erro de servidor nem vaza dados`, async ({ request }) => {
      const response = await request.get(`/booking/${encodeURIComponent(id)}`);
      expect(response.status()).toBeLessThan(500);
      if (response.status() === 200) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(false); 
      }
    });
  }
});