import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getConfig,
  getDatabaseUrl,
  getFrontendOrigin,
  getPort,
} from "../src/config.js";

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

void test("getDatabaseUrl accepts PostgreSQL URLs", () => {
  assert.equal(
    getDatabaseUrl("postgresql://user:password@localhost:5432/job_tracker"),
    "postgresql://user:password@localhost:5432/job_tracker",
  );
});

void test("getDatabaseUrl rejects missing, malformed, and non-PostgreSQL URLs", () => {
  for (const value of [undefined, "", "not-a-url", "https://example.com"]) {
    assert.throws(() => getDatabaseUrl(value), /DATABASE_URL/);
  }
});

void test("getFrontendOrigin uses the local frontend by default", () => {
  assert.equal(getFrontendOrigin(undefined), "http://localhost:3000");
});

void test("getFrontendOrigin accepts exact HTTP origins", () => {
  assert.equal(
    getFrontendOrigin("https://jobs.example.com"),
    "https://jobs.example.com",
  );
});

void test("getFrontendOrigin rejects malformed URLs, paths, and credentials", () => {
  for (const value of [
    "not-a-url",
    "ftp://example.com",
    "https://example.com/path",
    "https://user@example.com",
  ]) {
    assert.throws(() => getFrontendOrigin(value), /FRONTEND_ORIGIN/);
  }
});

void test("getConfig returns validated application configuration", () => {
  assert.deepEqual(
    getConfig({
      DATABASE_URL: "postgresql://user:password@localhost:5432/job_tracker",
      PORT: "4000",
    }),
    {
      databaseUrl: "postgresql://user:password@localhost:5432/job_tracker",
      frontendOrigin: "http://localhost:3000",
      port: 4000,
    },
  );
});
