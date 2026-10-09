import { test as base, expect, APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../../../src/config/env';
import { buildBooking } from './data';
import { authSuccessSchema, Booking, createBookingResponseSchema } from './schemas';

export const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export interface CreatedBooking {
  id: number;
  payload: Booking;
}


export const rawBody = (text: string): Buffer => Buffer.from(text, 'utf-8');


export const authCookie = (token: string) => ({ Cookie: `token=${token}` });


export const basicAuth = (user = env.api.username, pass = env.api.password) => ({
  Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
});

async function createBooking(
  request: APIRequestContext,
  payload: Booking,
): Promise<CreatedBooking> {
  const response = await request.post('/booking', { headers: JSON_HEADERS, data: payload });
  expect(response.status(), 'setup: criação da reserva').toBe(200);
  const body = createBookingResponseSchema.parse(await response.json());
  return { id: body.bookingid, payload };
}

async function safeDelete(request: APIRequestContext, id: number, token: string): Promise<void> {

  await request.delete(`/booking/${id}`, { headers: authCookie(token) }).catch(() => undefined);
}

type Fixtures = {
 
  authToken: string;

  booking: CreatedBooking;
  
  bookingFactory: (overrides?: Partial<Booking>) => Promise<CreatedBooking>;
};

export const test = base.extend<Fixtures>({
  authToken: async ({ request }, use) => {
    const response = await request.post('/auth', {
      headers: JSON_HEADERS,
      data: { username: env.api.username, password: env.api.password },
    });
    expect(response.status(), 'setup: autenticação').toBe(200);
    const { token } = authSuccessSchema.parse(await response.json());
    await use(token);
  },

  bookingFactory: async ({ request, authToken }, use) => {
    const created: CreatedBooking[] = [];
    await use(async (overrides) => {
      const item = await createBooking(request, buildBooking(overrides));
      created.push(item);
      return item;
    });
    for (const item of created) await safeDelete(request, item.id, authToken);
  },

  booking: async ({ bookingFactory }, use) => {
    await use(await bookingFactory());
  },
});

export { expect };


export async function expectJson(response: APIResponse, status: number): Promise<unknown> {
  expect(response.status()).toBe(status);
  expect(response.headers()['content-type']).toContain('application/json');
  return response.json();
}
