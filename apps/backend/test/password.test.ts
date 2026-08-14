import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  hashPassword,
  verifyPassword,
} from '../src/features/users/password.js';

void test('verifyPassword accepts the password used to create the hash', async () => {
  const passwordHash = await hashPassword('correct horse battery staple');

  assert.equal(
    await verifyPassword('correct horse battery staple', passwordHash),
    true,
  );
});

void test('verifyPassword rejects a different password', async () => {
  const passwordHash = await hashPassword('correct horse battery staple');

  assert.equal(await verifyPassword('incorrect password', passwordHash), false);
});

void test('verifyPassword rejects malformed stored hashes', async () => {
  const malformedHashes = [
    '',
    'argon2:invalid:invalid',
    'scrypt:missing-key',
    'scrypt:not-base64:not-base64',
    `scrypt:${Buffer.alloc(15).toString('base64')}:${Buffer.alloc(64).toString('base64')}`,
    `scrypt:${Buffer.alloc(16).toString('base64')}:${Buffer.alloc(63).toString('base64')}`,
  ];

  for (const malformedHash of malformedHashes) {
    assert.equal(await verifyPassword('password', malformedHash), false);
  }
});
