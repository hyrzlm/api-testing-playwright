# api-testing-playwright

[![API tests](https://github.com/hyrzlm/api-testing-playwright/actions/workflows/api-tests.yml/badge.svg)](https://github.com/hyrzlm/api-testing-playwright/actions/workflows/api-tests.yml)

REST API tests for [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html), a public sandbox API built for testing practice. Written with Playwright's request client, TypeScript and [zod](https://zod.dev) schemas.

## What's covered

| Area | Checks |
|---|---|
| Health | `GET /ping` is up |
| Auth | token on valid credentials, no token on bad ones |
| CRUD | create, read by id, filter by name, full update (PUT), partial update (PATCH), delete |
| Access control | PUT and DELETE without a token, with a fake token |
| Validation | unknown id, payload with missing fields |

Every response body is checked against a schema in [`lib/schemas.ts`](lib/schemas.ts), not just its status code.

## Known issues, tracked as tests

Two tests are marked `test.fail()` because the API behaves differently from what a well-behaved REST API should:

| Expected | Actual |
|---|---|
| Bad credentials → `401 Unauthorized` | `200 OK` with `{"reason":"Bad credentials"}` |
| Missing required fields → `400 Bad Request` | `500 Internal Server Error` |

They pass while the bug exists. If the API is ever fixed, they start failing, which is the signal to turn them into normal tests.

A few other quirks are documented in the tests: the health check and DELETE both answer `201 Created`.

## Design notes

- **Each test creates its own booking** with a random name, so tests can run in parallel and don't depend on shared data.
- **Fixtures** in [`tests/fixtures.ts`](tests/fixtures.ts) provide an auth cookie and a `createBooking()` helper.
- **Retries** are on because the sandbox is shared and resets its data every few minutes.
- **CI** runs on every push and weekly. No browser install needed, so a run takes well under a minute.

## Run it

```bash
npm ci
npm test
npm run report   # open the last HTML report
```
