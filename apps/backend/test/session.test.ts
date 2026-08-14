import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createSessionCredentials,
  hashSessionToken,
} from '../src/features/auth/session.js';

void test('createSessionCredentials creates a random 30-day session', () => {
  const now = new Date('2026-08-14T12:00:00.000Z');
  const first = createSessionCredentials(now);
  const second = createSessionCredentials(now);

  assert.notEqual(first.token, second.token);
  assert.equal(first.tokenHash, hashSessionToken(first.token));
  assert.match(first.tokenHash, /^[a-f0-9]{64}$/);
  assert.equal(first.expiresAt.toISOString(), '2026-09-13T12:00:00.000Z');
});
