import assert from "node:assert/strict";
import { test } from "node:test";

import { getPort } from "../src/config.js";

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
