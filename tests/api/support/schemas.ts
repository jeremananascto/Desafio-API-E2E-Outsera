import { z } from 'zod';

export const bookingDatesSchema = z.object({
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
});

export const bookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: bookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const createBookingResponseSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: bookingSchema,
});

export const bookingListSchema = z.array(z.object({ bookingid: z.number().int().positive() }));

export const authSuccessSchema = z.object({ token: z.string().min(5) });

export const authFailureSchema = z.object({ reason: z.string() });

export type Booking = z.infer<typeof bookingSchema>;
