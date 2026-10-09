import { Booking } from './schemas';

let counter = 0;


export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  counter += 1;
  const unique = `${Date.now().toString(36)}${counter}${Math.random().toString(36).slice(2, 6)}`;
  return {
    firstname: `QA${unique}`,
    lastname: `Tester${unique}`,
    totalprice: 250,
    depositpaid: true,
    bookingdates: { checkin: '2026-01-10', checkout: '2026-01-15' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

export const NON_EXISTENT_ID = 999999999;
export const INVALID_TOKEN = 'token-invalido-123';
