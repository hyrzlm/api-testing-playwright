import { test, expect } from './fixtures';
import { Booking, BookingIds } from '../lib/schemas';
import { newBooking } from '../lib/data';

test.describe('Bookings', () => {
  test('create returns the booking with an id', async ({ request }) => {
    const sent = newBooking();
    const res = await request.post('/booking', { data: sent });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.bookingid).toBeGreaterThan(0);
    expect(body.booking).toEqual(sent);
  });

  test('get by id matches what was created and fits the schema', async ({ request, createBooking }) => {
    const { id, sent } = await createBooking();
    const res = await request.get(`/booking/${id}`);
    expect(res.status()).toBe(200);
    const body = Booking.parse(await res.json());
    expect(body).toEqual(sent);
  });

  test('filter by name finds the new booking', async ({ request, createBooking }) => {
    const { id, sent } = await createBooking();
    const res = await request.get('/booking', {
      params: { firstname: sent.firstname, lastname: sent.lastname },
    });
    expect(res.status()).toBe(200);
    const ids = BookingIds.parse(await res.json()).map((b) => b.bookingid);
    expect(ids).toContain(id);
  });

  test('PUT replaces the whole booking', async ({ request, createBooking, authCookie }) => {
    const { id } = await createBooking();
    const replacement = newBooking({ totalprice: 300, depositpaid: false, additionalneeds: 'Late checkout' });
    const res = await request.put(`/booking/${id}`, { data: replacement, headers: { Cookie: authCookie } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(replacement);
  });

  test('PATCH changes one field and leaves the rest', async ({ request, createBooking, authCookie }) => {
    const { id, sent } = await createBooking();
    const res = await request.patch(`/booking/${id}`, {
      data: { totalprice: 99 },
      headers: { Cookie: authCookie },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ...sent, totalprice: 99 });
  });

  test('DELETE removes the booking', async ({ request, createBooking, authCookie }) => {
    const { id } = await createBooking();
    const del = await request.delete(`/booking/${id}`, { headers: { Cookie: authCookie } });
    // The API acknowledges a delete with 201 Created
    expect(del.status()).toBe(201);
    expect((await request.get(`/booking/${id}`)).status()).toBe(404);
  });
});

test.describe('Bookings: access control', () => {
  test('PUT without a token is forbidden', async ({ request, createBooking }) => {
    const { id } = await createBooking();
    const res = await request.put(`/booking/${id}`, { data: newBooking() });
    expect(res.status()).toBe(403);
  });

  test('DELETE without a token is forbidden and keeps the booking', async ({ request, createBooking }) => {
    const { id } = await createBooking();
    expect((await request.delete(`/booking/${id}`)).status()).toBe(403);
    expect((await request.get(`/booking/${id}`)).status()).toBe(200);
  });

  test('a made-up token is forbidden', async ({ request, createBooking }) => {
    const { id } = await createBooking();
    const res = await request.patch(`/booking/${id}`, {
      data: { totalprice: 1 },
      headers: { Cookie: 'token=not-a-real-token' },
    });
    expect(res.status()).toBe(403);
  });
});

test.describe('Bookings: validation', () => {
  test('unknown id returns 404', async ({ request }) => {
    expect((await request.get('/booking/999999999')).status()).toBe(404);
  });

  test('missing required fields should return 400', async ({ request }) => {
    test.fail(true, 'Known issue: the API crashes with 500 instead of validating the payload');
    const res = await request.post('/booking', { data: { firstname: 'Ada' } });
    expect(res.status()).toBe(400);
  });
});
