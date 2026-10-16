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
  try {
    // Alguns testes DELETE removem a própria massa. O teardown deve confirmar
    // esse estado antes de tentar excluí-la novamente.
    const current = await request.get(`/booking/${id}`);
    if (current.status() === 404) {
      console.info(`[CLEANUP] Reserva ${id} já não existe; nenhuma ação necessária.`);
      return;
    }
    if (current.status() !== 200) {
      const body = await current.text().catch(() => '<corpo indisponível>');
      throw new Error(
        `Não foi possível verificar a reserva ${id} antes do cleanup: ` +
        `HTTP ${current.status()} ${current.statusText()}; resposta: ${body.slice(0, 500)}`,
      );
    }

    const response = await request.delete(`/booking/${id}`, { headers: authCookie(token) });
    if (response.status() !== 201) {
      // Protege contra remoção concorrente: só considera resolvido se a API
      // confirmar que o recurso realmente deixou de existir.
      const verification = await request.get(`/booking/${id}`);
      if (verification.status() === 404) {
        console.info(`[CLEANUP] Reserva ${id} já foi removida durante o cleanup.`);
        return;
      }
      const body = await response.text().catch(() => '<corpo indisponível>');
      const message =
        `Cleanup da reserva ${id} falhou: HTTP ${response.status()} ${response.statusText()}; ` +
        `GET posterior retornou ${verification.status()}; resposta: ${body.slice(0, 500)}`;
      console.error(`[CLEANUP] ${message}`);
      throw new Error(message);
    }
    console.info(`[CLEANUP] Reserva ${id} removida com sucesso.`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`[CLEANUP] Erro ao remover reserva ${id}: ${detail}`);
    throw new Error(`Falha no teardown ao remover a reserva ${id}.`, { cause: error });
  }
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
