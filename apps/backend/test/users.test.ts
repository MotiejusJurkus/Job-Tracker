import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { createApp } from '../src/app.js';
import type { CreateUser } from '../src/features/users/users.js';

let server: ReturnType<ReturnType<typeof createApp>['listen']>;
let baseUrl: string;
let receivedPassword: string | undefined;

class UniqueViolationError extends Error {
  readonly code = '23505';
}

const createUser: CreateUser = (input) => {
  receivedPassword = input.password;

  return Promise.resolve({
    id: '2b4f7374-f7ee-45f9-a8aa-a434f5341a5f',
    username: input.username,
    createdAt: new Date('2026-08-07T10:00:00.000Z'),
  });
};

before(async () => {
  const app = createApp({ createUser });

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

void test('POST /users creates a user without returning the password', async () => {
  const response = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'New_User', password: 'secret123' }),
  });
  const body: unknown = await response.json();

  assert.equal(response.status, 201);
  assert.equal(receivedPassword, 'secret123');
  assert.deepEqual(body, {
    user: {
      id: '2b4f7374-f7ee-45f9-a8aa-a434f5341a5f',
      username: 'New_User',
      createdAt: '2026-08-07T10:00:00.000Z',
    },
  });
  assert.doesNotMatch(JSON.stringify(body), /password/i);
});

void test('POST /users rejects invalid input', async () => {
  const response = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'x', password: 'short' }),
  });

  assert.equal(response.status, 400);
});

void test('POST /users returns a conflict for an existing username', async () => {
  const app = createApp({
    createUser: () => Promise.reject(new UniqueViolationError()),
  });
  const duplicateServer = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => duplicateServer.once('listening', resolve));
  const address = duplicateServer.address();
  assert.ok(address && typeof address !== 'string');

  const response = await fetch(`http://127.0.0.1:${address.port}/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'existing', password: 'secret123' }),
  });

  duplicateServer.close();
  assert.equal(response.status, 409);
});
