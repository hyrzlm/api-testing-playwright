import type { Booking } from './schemas';

/** A unique booking per test, so parallel runs never read each other's data. */
export function newBooking(overrides: Partial<Booking> = {}): Booking {
  const tag = Math.random().toString(36).slice(2, 8);
  return {
    firstname: `Ada${tag}`,
    lastname: `Lovelace${tag}`,
    totalprice: 120,
    depositpaid: true,
    bookingdates: { checkin: '2026-11-01', checkout: '2026-11-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

// Public sandbox credentials from the Restful Booker docs
export const ADMIN = { username: 'admin', password: 'password123' };
