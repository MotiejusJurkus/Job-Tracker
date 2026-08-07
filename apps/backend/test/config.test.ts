import assert from "node:assert/strict";
import { test } from "node:test";

import { getConfig, getDatabaseUrl, getPort } from "../src/config.js";

void test("getPort uses the default when PORT is missing", () => {
  assert.equal(getPort(undefined), 3001);
});

void test("getPort accepts a valid port", () => {
  assert.equal(getPort("4000"), 4000);
});

void test("getPort rejects invalid ports", () => {
  for (const value of ["invalid", "0", "65536", "3.5"]) {
    assert.throws(() => getPort(value), /PORT must be an integer/);
  }
});

void test('getDatabaseUrl accepts PostgreSQL URLs', () => {
  assert.equal(
    getDatabaseUrl('postgresql://user:password@localhost:5432/job_tracker'),
    'postgresql://user:password@localhost:5432/job_tracker',
  );
});

void test('getDatabaseUrl rejects missing, malformed, and non-PostgreSQL URLs', () => {
  for (const value of [undefined, '', 'not-a-url', 'https://example.com']) {
    assert.throws(() => getDatabaseUrl(value), /DATABASE_URL/);
  }
});

void test('getConfig returns validated application configuration', () => {
  assert.deepEqual(
    getConfig({
      DATABASE_URL: 'postgresql://user:password@localhost:5432/job_tracker',
      PORT: '4000',
    }),
    {
      databaseUrl: 'postgresql://user:password@localhost:5432/job_tracker',
      port: 4000,
    },
  );
});
