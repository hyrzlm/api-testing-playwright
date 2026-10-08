import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { AuthToken, CreatedBooking, type Booking } from '../lib/schemas';
import { ADMIN, newBooking } from '../lib/data';

type Fixtures = {
  /** Cookie header value carrying a fresh admin token. */
  authCookie: string;
  /** Creates a booking and returns its id and the payload that was sent. */
  createBooking: (overrides?: Partial<Booking>) => Promise<{ id: number; sent: Booking }>;
};

export async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/auth', { data: ADMIN });
  expect(res.status()).toBe(200);
  return AuthToken.parse(await res.json()).token;
}

export const test = base.extend<Fixtures>({
  authCookie: async ({ request }, use) => {
    await use(`token=${await getToken(request)}`);
  },
  createBooking: async ({ request }, use) => {
    await use(async (overrides = {}) => {
      const sent = newBooking(overrides);
      const res = await request.post('/booking', { data: sent });
      expect(res.status()).toBe(200);
      const body = CreatedBooking.parse(await res.json());
      return { id: body.bookingid, sent };
    });
  },
});

export { expect };
