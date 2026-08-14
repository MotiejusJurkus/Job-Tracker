import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readSessionToken } from '../src/features/auth/require-auth.js';

const SESSION_TOKEN = 'a'.repeat(43);

void test('readSessionToken reads the session from multiple cookies', () => {
  assert.equal(
    readSessionToken(`theme=dark; session=${SESSION_TOKEN}; language=en`),
    SESSION_TOKEN,
  );
});

void test('readSessionToken rejects malformed and duplicate session cookies', () => {
  const invalidCookieHeaders = [
    undefined,
    'session=too-short',
    `session=${'!'.repeat(43)}`,
    `session=${SESSION_TOKEN}; session=${SESSION_TOKEN}`,
  ];

  for (const cookieHeader of invalidCookieHeaders) {
    assert.equal(readSessionToken(cookieHeader), undefined);
  }
});
