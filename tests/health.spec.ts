import { test, expect } from './fixtures';

test('GET /ping reports the API is up', async ({ request }) => {
  const res = await request.get('/ping');
  // The API answers its health check with 201 Created
  expect(res.status()).toBe(201);
});
