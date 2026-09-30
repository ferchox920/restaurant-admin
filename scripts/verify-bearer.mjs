import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";

const base = process.env.INTEGRATION_API_URL;
const checks = [];
const login = await fetch(`${base}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  }),
});
assert.equal(login.status, 200);
const payload = await login.json();
assert.equal(typeof payload.accessToken, "string");
assert.equal(login.headers.get("set-cookie"), null);
checks.push("bearer login returns JWT without cookie");
const headers = { Authorization: `Bearer ${payload.accessToken}` };
assert.equal((await fetch(`${base}/api/auth/me`, { headers })).status, 200);
checks.push("bearer accepted by pinned backend");
assert.equal(
  (await fetch(`${base}/api/auth/logout`, { method: "POST", headers })).status,
  204
);
assert.equal((await fetch(`${base}/api/auth/me`, { headers })).status, 200);
checks.push(
  "legacy bearer remains valid after logout: known backend limitation reproduced"
);
assert.equal((await fetch(`${base}/api/auth/me`)).status, 401);
checks.push("missing authentication rejected");
writeFileSync(
  process.env.INTEGRATION_BEARER_RESULT,
  JSON.stringify(
    {
      backendSha: "e25b7e1d136247210c6a73c5cdc6d0b50c1eacfd",
      checks,
      passed: checks.length,
      browser: false,
    },
    null,
    2
  )
);
console.log(
  `${checks.length} real bearer HTTP checks passed; no browser coverage claimed.`
);
