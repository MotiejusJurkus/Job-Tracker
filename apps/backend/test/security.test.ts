import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { createApp } from "../src/app.js";

const FRONTEND_ORIGIN = "https://jobs.example.com";
const OTHER_ORIGIN = "https://malicious.example.com";
const VALID_LOGIN = JSON.stringify({
  username: "Existing_User",
  password: "secret123",
});
const VALID_USER = JSON.stringify({
  username: "New_User",
  password: "secret123",
});

let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
let baseUrl: string;

before(async () => {
  const app = createApp({
    createUser: (input) =>
      Promise.resolve({
        id: "2b4f7374-f7ee-45f9-a8aa-a434f5341a5f",
        username: input.username,
        createdAt: new Date("2026-08-21T12:00:00.000Z"),
      }),
    frontendOrigin: FRONTEND_ORIGIN,
    login: () => Promise.resolve(undefined),
  });

  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

void test("responses include security and exact-origin CORS headers", async () => {
  const response = await fetch(`${baseUrl}/health`, {
    headers: { origin: FRONTEND_ORIGIN },
  });

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    FRONTEND_ORIGIN,
  );
  assert.equal(
    response.headers.get("access-control-allow-credentials"),
    "true",
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-powered-by"), null);
});

void test("unsafe requests require the configured frontend origin", async () => {
  const responses = await Promise.all([
    fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: VALID_LOGIN,
    }),
    fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: OTHER_ORIGIN },
      body: VALID_LOGIN,
    }),
  ]);

  for (const response of responses) {
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
      error: "Request origin is not allowed",
    });
  }
});

void test("oversized JSON bodies receive a safe 413 response", async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: FRONTEND_ORIGIN },
    body: JSON.stringify({
      username: "Existing_User",
      password: "x".repeat(110_000),
    }),
  });

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    error: "Request body is too large",
  });
});

void test("login attempts are rate limited", async () => {
  const responses = [];

  for (let attempt = 0; attempt < 21; attempt += 1) {
    responses.push(
      await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: FRONTEND_ORIGIN,
        },
        body: VALID_LOGIN,
      }),
    );
  }

  assert.equal(responses.at(-1)?.status, 429);
  assert.ok(responses.at(-1)?.headers.get("ratelimit"));
});

void test("signup attempts are rate limited", async () => {
  const responses = [];

  for (let attempt = 0; attempt < 11; attempt += 1) {
    responses.push(
      await fetch(`${baseUrl}/users`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: FRONTEND_ORIGIN,
        },
        body: VALID_USER,
      }),
    );
  }

  assert.equal(responses.at(-1)?.status, 429);
  assert.ok(responses.at(-1)?.headers.get("ratelimit"));
});
