import { test, expect } from './fixtures';
import { AuthToken } from '../lib/schemas';
import { ADMIN } from '../lib/data';

test.describe('POST /auth', () => {
  test('valid credentials return a token', async ({ request }) => {
    const res = await request.post('/auth', { data: ADMIN });
    expect(res.status()).toBe(200);
    expect(AuthToken.safeParse(await res.json()).success).toBe(true);
  });

  test('wrong password returns a reason and no token', async ({ request }) => {
    const res = await request.post('/auth', { data: { ...ADMIN, password: 'wrong' } });
    const body = await res.json();
    expect(body).toEqual({ reason: 'Bad credentials' });
    expect(body).not.toHaveProperty('token');
  });

  test('wrong password should be rejected with 401', async ({ request }) => {
    test.fail(true, 'Known issue: the API answers bad credentials with 200 OK');
    const res = await request.post('/auth', { data: { ...ADMIN, password: 'wrong' } });
    expect(res.status()).toBe(401);
  });
});
