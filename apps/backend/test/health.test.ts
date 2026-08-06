import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { app } from "../src/app.js";

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

before(async () => {
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

test("GET /health returns a healthy response", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body: unknown = await response.json();

  assert.equal(response.status, 200);
  assert.ok(isHealthResponse(body));
  assert.equal(body.status, "ok");
  assert.match(body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

const isHealthResponse = (
  value: unknown,
): value is { status: string; timestamp: string } =>
  typeof value === "object" &&
  value !== null &&
  "status" in value &&
  typeof value.status === "string" &&
  "timestamp" in value &&
  typeof value.timestamp === "string";
