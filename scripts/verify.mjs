import { spawn } from "node:child_process";
import { mkdirSync, createWriteStream, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const directory = resolve("output/playwright");
mkdirSync(directory, { recursive: true });
const results = [];
const checks = [
  ["lint"],
  ["format:check"],
  ["typecheck"],
  [
    "test",
    "--",
    "--maxWorkers=2",
    "--reporter=json",
    "--outputFile=output/playwright/vitest.json",
  ],
  ["build"],
  ["bundle:check"],
];
for (const [script, ...args] of checks) {
  const startedAt = new Date().toISOString();
  const code = await new Promise((resolveCode, reject) => {
    const log = createWriteStream(
      resolve(directory, `${script.replaceAll(":", "-")}.log`)
    );
    const child = spawn(
      process.execPath,
      [process.env.npm_execpath, "run", script, ...args],
      {
        windowsHide: true,
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      }
    );
    child.stdout.pipe(log);
    child.stderr.pipe(log);
    child.on("error", reject);
    child.on("exit", (exit) => {
      log.end();
      resolveCode(exit);
    });
  });
  results.push({
    script,
    args,
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: code,
  });
  writeFileSync(
    resolve(directory, "verification.json"),
    JSON.stringify(results, null, 2)
  );
  console.log(`${script}: ${code === 0 ? "passed" : "failed"}`);
  if (code !== 0) {
    process.exitCode = 1;
    break;
  }
}
