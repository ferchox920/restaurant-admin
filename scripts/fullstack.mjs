import { spawn, spawnSync } from "node:child_process";
import {
  createWriteStream,
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { sanitizeEvidence } from "./sanitize-evidence.mjs";

const sha = "5562dec6cef7c00f76c31cc5bf663f5cf282ae14";
const root = process.cwd();
const output = resolve(root, `output/playwright/run-${Date.now()}`);
mkdirSync(output, { recursive: true });
writeFileSync(
  resolve(root, "output/playwright/latest-run.json"),
  JSON.stringify({ output })
);
const backend = resolve(
  process.env.INTEGRATION_BACKEND_PATH || "output/integration-backend"
);
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run through npm run test:fullstack");
function run(command, args, cwd = root, env = process.env, log = "setup") {
  return new Promise((resolveRun, reject) => {
    const stream = createWriteStream(resolve(output, `${log}.log`), {
      flags: "a",
    });
    const child = spawn(command, args, { cwd, env, windowsHide: true });
    child.stdout.pipe(stream);
    child.stderr.pipe(stream);
    child.on("error", reject);
    child.on("exit", (code) => {
      stream.end();
      if (code === 0) resolveRun();
      else
        reject(
          new Error(`${command} ${args[0]} failed (${code}); see ${log}.log`)
        );
    });
  });
}
const npm = (args, cwd, env, log) =>
  run(process.execPath, [npmCli, ...args], cwd, env, log);
async function ready(url, expected, processHandle) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (
      processHandle?.exitCode !== null &&
      processHandle?.exitCode !== undefined
    )
      throw new Error(`Service exited: ${url}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (response.status === expected) return;
    } catch {
      /* bounded probe */
    }
    await new Promise((resolveProbe) => setTimeout(resolveProbe, 200));
  }
  throw new Error(`Readiness deadline: ${url}`);
}
function service(args, cwd, env, name) {
  const stream = createWriteStream(resolve(output, `${name}.log`));
  const child = spawn(process.execPath, args, { cwd, env, windowsHide: true });
  child.stdout.pipe(stream);
  child.stderr.pipe(stream);
  child.once("exit", () => stream.end());
  return child;
}
async function stop(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32")
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      windowsHide: true,
      stdio: "ignore",
    });
  else child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolveExit) => child.once("exit", resolveExit)),
    new Promise((resolveExit) => setTimeout(resolveExit, 5000)),
  ]);
}
if (!existsSync(resolve(backend, ".git")))
  await run("git", [
    "clone",
    "https://github.com/ferchox920/restaurant-api.git",
    backend,
  ]);
await run("git", ["fetch", "origin"], backend);
await run("git", ["checkout", "--detach", sha], backend);
const actual = spawnSync("git", ["rev-parse", "HEAD"], {
  cwd: backend,
  encoding: "utf8",
}).stdout.trim();
if (actual !== sha) throw new Error("Backend SHA mismatch");
await npm(["ci"], backend, process.env, "backend-install");
await npm(["run", "prisma:generate"], backend, process.env, "backend-build");
await npm(["run", "build"], backend, process.env, "backend-build");
const apiPort = 55481;
const frontPort = 55482;
const dbPort = 55483;
const front = `http://localhost:${frontPort}`;
const api = `http://localhost:${apiPort}`;
const frontendEnv = {
  ...process.env,
  API_URL: api,
  NEXT_PUBLIC_API_URL: api,
  NEXT_PUBLIC_SESSION_MODE: "cookie",
  NEXT_PUBLIC_REALTIME_ENABLED: "true",
  NEXT_TELEMETRY_DISABLED: "1",
};
await npm(["run", "build"], root, frontendEnv, "frontend-build");
await npm(["run", "bundle:check"], root, frontendEnv, "frontend-bundle");
const rounds = Number(process.env.INTEGRATION_ROUNDS || 2);
for (let round = 1; round <= rounds; round++) {
  const name = `restaurant-integration-${process.pid}-${round}`;
  const password = randomBytes(20).toString("hex");
  const database = `frontend_integration_${round}`;
  const dbUrl = `postgresql://integration:${password}@localhost:${dbPort}/${database}?schema=public`;
  // Disposable fictional accounts; no credentials from the user or former runs.
  const demoPassword = `Demo-${randomBytes(16).toString("hex")}`;
  const env = {
    ...process.env,
    NODE_ENV: "production",
    DATABASE_URL: dbUrl,
    JWT_SECRET: randomBytes(40).toString("hex"),
    JWT_EXPIRES_IN: "1d",
    SWAGGER_ENABLED: "true",
    PORT: String(apiPort),
    CORS_ENABLED: "true",
    CORS_ORIGIN: front,
    AUTH_COOKIE: "true",
    AUTH_TOKEN_RESPONSE: "false",
    OPTIMISTIC_VERSIONING: "true",
    OPERATIONS_SSE: "true",
    ADMIN_EMAIL: "admin@example.com",
    ADMIN_PASSWORD: demoPassword,
    ADMIN_FIRST_NAME: "Demo",
    ADMIN_LAST_NAME: "Admin",
    MANAGER_EMAIL: "manager@example.com",
    MANAGER_PASSWORD: demoPassword,
    CASHIER_EMAIL: "cashier@example.com",
    CASHIER_PASSWORD: demoPassword,
    AUDITOR_EMAIL: "auditor@example.com",
    AUDITOR_PASSWORD: demoPassword,
  };
  let apiProcess;
  let frontProcess;
  let original;
  const startedAt = new Date().toISOString();
  try {
    await run(
      "docker",
      [
        "run",
        "--name",
        name,
        "--label",
        "restaurant.frontend-integration=true",
        "-e",
        "POSTGRES_USER=integration",
        "-e",
        `POSTGRES_PASSWORD=${password}`,
        "-e",
        `POSTGRES_DB=${database}`,
        "-p",
        `127.0.0.1:${dbPort}:5432`,
        "-d",
        "postgres:17.9",
      ],
      root,
      process.env,
      `round-${round}-database`
    );
    const deadline = Date.now() + 60_000;
    while (
      spawnSync(
        "docker",
        ["exec", name, "pg_isready", "-U", "integration", "-d", database],
        { windowsHide: true, stdio: "ignore" }
      ).status !== 0
    ) {
      if (Date.now() > deadline) throw new Error("Postgres readiness deadline");
      await new Promise((resolveProbe) => setTimeout(resolveProbe, 200));
    }
    await npm(
      ["run", "db:migrate:deploy"],
      backend,
      env,
      `round-${round}-migrations`
    );
    await npm(["run", "db:seed"], backend, env, `round-${round}-seed`);
    apiProcess = service(["dist/main.js"], backend, env, `round-${round}-api`);
    await ready(`${api}/health/readiness`, 200, apiProcess);
    frontProcess = service(
      ["node_modules/next/dist/bin/next", "start", "--port", String(frontPort)],
      root,
      frontendEnv,
      `round-${round}-frontend`
    );
    await ready(`${front}/login`, 200, frontProcess);
    const schema = await (await fetch(`${api}/docs-json`)).json();
    writeFileSync(
      resolve(output, `round-${round}-openapi.json`),
      JSON.stringify(schema, null, 2)
    );
    const testEnv = {
      ...env,
      INTEGRATION_BASE_URL: front,
      INTEGRATION_API_URL: api,
      INTEGRATION_BACKEND_PATH: backend,
      INTEGRATION_PASSWORD: demoPassword,
      INTEGRATION_ROUND: String(round),
      INTEGRATION_OUTPUT: output,
      PLAYWRIGHT_JSON_OUTPUT_FILE: resolve(
        output,
        `round-${round}-results.json`
      ),
      PLAYWRIGHT_HTML_OUTPUT_DIR: resolve(output, `round-${round}-report`),
    };
    for (const project of ["desktop-chromium", "mobile-chromium-emulated"]) {
      // Independent API processes prevent rate-limit state from one client suite leaking into another.
      if (project.startsWith("mobile")) {
        await stop(apiProcess);
        apiProcess = service(
          ["dist/main.js"],
          backend,
          env,
          `round-${round}-api-mobile`
        );
        await ready(`${api}/health/readiness`, 200, apiProcess);
      }
      await run(
        process.execPath,
        ["node_modules/@playwright/test/cli.js", "test", "--project", project],
        root,
        {
          ...testEnv,
          INTEGRATION_PROJECT: project,
          PLAYWRIGHT_JSON_OUTPUT_FILE: resolve(
            output,
            `round-${round}-${project}-results.json`
          ),
          PLAYWRIGHT_HTML_OUTPUT_DIR: resolve(
            output,
            `round-${round}-${project}-report`
          ),
        },
        `round-${round}-${project}-tests`
      );
    }
    for (const project of ["desktop-chromium", "mobile-chromium-emulated"]) {
      const report = JSON.parse(
        readFileSync(
          resolve(output, `round-${round}-${project}-results.json`),
          "utf8"
        )
      );
      if (
        report.stats.expected !== 5 ||
        report.stats.unexpected ||
        report.stats.skipped ||
        report.stats.flaky ||
        report.errors?.length
      )
        throw new Error(`Incomplete/failed Playwright report: ${project}`);
      if (
        !existsSync(
          resolve(output, `round-${round}-${project}-report/index.html`)
        )
      )
        throw new Error(`Missing HTML report: ${project}`);
    }
    await stop(apiProcess);
    const bearerEnv = {
      ...env,
      AUTH_COOKIE: "false",
      AUTH_TOKEN_RESPONSE: "true",
      OPERATIONS_SSE: "false",
    };
    apiProcess = service(
      ["dist/main.js"],
      backend,
      bearerEnv,
      `round-${round}-api-bearer`
    );
    await ready(`${api}/health/readiness`, 200, apiProcess);
    await run(
      process.execPath,
      ["scripts/verify-bearer.mjs"],
      root,
      {
        ...bearerEnv,
        INTEGRATION_API_URL: api,
        INTEGRATION_BEARER_RESULT: resolve(
          output,
          `round-${round}-bearer.json`
        ),
      },
      `round-${round}-bearer`
    );
  } catch (error) {
    original = error;
  } finally {
    await stop(frontProcess);
    await stop(apiProcess);
    await run(
      "docker",
      ["logs", name],
      root,
      process.env,
      `round-${round}-postgres`
    ).catch(() => undefined);
    const cleanup = spawnSync("docker", ["rm", "-f", "-v", name], {
      windowsHide: true,
      encoding: "utf8",
    });
    const sanitized = sanitizeEvidence(output, [
      password,
      demoPassword,
      env.JWT_SECRET,
    ]);
    writeFileSync(
      resolve(output, `round-${round}-sanitization.json`),
      JSON.stringify(sanitized, null, 2)
    );
    writeFileSync(
      resolve(output, `round-${round}-metadata.json`),
      JSON.stringify(
        {
          backendSha: sha,
          startedAt,
          finishedAt: new Date().toISOString(),
          success: !original,
          cleanupExit: cleanup.status,
          error: original?.message,
          projects: ["desktop-chromium", "mobile-chromium-emulated"],
          retries: 0,
        },
        null,
        2
      )
    );
  }
  if (original) throw original;
  console.log(`Round ${round}: passed; own services removed.`);
}
