import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const Booking = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: z.object({ checkin: isoDate, checkout: isoDate }),
  additionalneeds: z.string().optional(),
});
export type Booking = z.infer<typeof Booking>;

export const CreatedBooking = z.object({
  bookingid: z.number().int().positive(),
  booking: Booking,
});

export const BookingIds = z.array(z.object({ bookingid: z.number().int().positive() }));

export const AuthToken = z.object({ token: z.string().min(1) });
