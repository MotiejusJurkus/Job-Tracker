import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { createApp } from '../src/app.js';
import type { Login } from '../src/features/auth/auth.js';

const EXPIRES_AT = new Date('2026-09-13T12:00:00.000Z');
const SESSION_TOKEN = 'a'.repeat(43);

let server: ReturnType<ReturnType<typeof createApp>['listen']>;
let baseUrl: string;
let receivedPassword: string | undefined;
let receivedSessionToken: string | undefined;

const login: Login = (input) => {
  receivedPassword = input.password;

  return Promise.resolve({
    user: {
      id: '2b4f7374-f7ee-45f9-a8aa-a434f5341a5f',
      username: 'Existing_User',
    },
    sessionToken: SESSION_TOKEN,
    expiresAt: EXPIRES_AT,
  });
};

before(async () => {
  const app = createApp({
    authenticateSession: (token) => {
      receivedSessionToken = token;

      return Promise.resolve({
        id: '2b4f7374-f7ee-45f9-a8aa-a434f5341a5f',
        username: 'Existing_User',
      });
    },
    isSecureCookie: true,
    login,
  });

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

void test('POST /auth/login creates a secure session cookie', async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'Existing_User', password: 'secret123' }),
  });
  const body: unknown = await response.json();
  const cookie = response.headers.get('set-cookie');

  assert.equal(response.status, 200);
  assert.equal(receivedPassword, 'secret123');
  assert.deepEqual(body, {
    user: {
      id: '2b4f7374-f7ee-45f9-a8aa-a434f5341a5f',
      username: 'Existing_User',
    },
  });
  assert.match(cookie ?? '', new RegExp(`^session=${SESSION_TOKEN};`));
  assert.match(cookie ?? '', /HttpOnly/);
  assert.match(cookie ?? '', /Secure/);
  assert.match(cookie ?? '', /SameSite=Lax/);
  assert.match(cookie ?? '', /Path=\//);
  assert.match(cookie ?? '', /Expires=Sun, 13 Sep 2026 12:00:00 GMT/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.doesNotMatch(JSON.stringify(body), /password|token/i);
});

void test('GET /auth/session returns the authenticated user', async () => {
  const response = await fetch(`${baseUrl}/auth/session`, {
    headers: { cookie: `session=${SESSION_TOKEN}` },
  });
  const body: unknown = await response.json();

  assert.equal(response.status, 200);
  assert.equal(receivedSessionToken, SESSION_TOKEN);
  assert.deepEqual(body, {
    user: {
      id: '2b4f7374-f7ee-45f9-a8aa-a434f5341a5f',
      username: 'Existing_User',
    },
  });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

void test('GET /auth/session rejects requests without a session cookie', async () => {
  const response = await fetch(`${baseUrl}/auth/session`);

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Authentication required' });
});

void test('GET /auth/session rejects an unknown session', async () => {
  const app = createApp({
    authenticateSession: () => Promise.resolve(undefined),
  });
  const invalidServer = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => invalidServer.once('listening', resolve));
  const address = invalidServer.address();
  assert.ok(address && typeof address !== 'string');

  const response = await fetch(`http://127.0.0.1:${address.port}/auth/session`, {
    headers: { cookie: `session=${SESSION_TOKEN}` },
  });

  invalidServer.close();
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Authentication required' });
});

void test('POST /auth/login returns a generic error for invalid credentials', async () => {
  const app = createApp({ login: () => Promise.resolve(undefined) });
  const invalidServer = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => invalidServer.once('listening', resolve));
  const address = invalidServer.address();
  assert.ok(address && typeof address !== 'string');

  const response = await fetch(`http://127.0.0.1:${address.port}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'unknown', password: 'wrong-password' }),
  });
  const body: unknown = await response.json();

  invalidServer.close();
  assert.equal(response.status, 401);
  assert.deepEqual(body, { error: 'Invalid username or password' });
  assert.equal(response.headers.get('set-cookie'), null);
});

void test('POST /auth/login rejects an invalid request without authenticating', async () => {
  let loginCalls = 0;
  const app = createApp({
    login: () => {
      loginCalls += 1;
      return Promise.resolve(undefined);
    },
  });
  const invalidServer = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => invalidServer.once('listening', resolve));
  const address = invalidServer.address();
  assert.ok(address && typeof address !== 'string');

  const response = await fetch(`http://127.0.0.1:${address.port}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'x', password: '' }),
  });

  invalidServer.close();
  assert.equal(response.status, 400);
  assert.equal(loginCalls, 0);
});
