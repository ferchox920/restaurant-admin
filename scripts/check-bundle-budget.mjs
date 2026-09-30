import { gzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const routeBudgets = [
  { route: "/dashboard", manifest: "dashboard/page", budgetKb: 65 },
  { route: "/floor", manifest: "floor/page", budgetKb: 170 },
  { route: "/sales", manifest: "sales/page", budgetKb: 170 },
  {
    route: "/sales/[ticketId]",
    manifest: "sales/[ticketId]/page",
    budgetKb: 170,
  },
  {
    route: "/table-orders/[id]",
    manifest: "table-orders/[id]/page",
    budgetKb: 170,
  },
  { route: "/products", manifest: "products/page", budgetKb: 170 },
  { route: "/reports/stock", manifest: "reports/stock/page", budgetKb: 170 },
];

function readManifest(manifestPath) {
  const source = readFileSync(manifestPath, "utf8");
  const assignment = source
    .split(/\r?\n/)
    .find((line) => line.includes("__RSC_MANIFEST[") && line.includes(" = {"));

  if (!assignment) {
    throw new Error(`No se pudo leer el manifest: ${manifestPath}`);
  }

  return JSON.parse(
    assignment.slice(assignment.indexOf(" = ") + 3).replace(/;\s*$/, "")
  );
}

function routeSize(entry) {
  const manifestPath = resolve(
    ".next/server/app/(private)",
    `${entry.manifest}_client-reference-manifest.js`
  );
  const manifest = readManifest(manifestPath);
  const routeEntry = Object.entries(manifest.entryJSFiles).find(([key]) =>
    key.endsWith(`/app/(private)/${entry.manifest}`)
  );

  if (!routeEntry) {
    throw new Error(`No se encontro entryJSFiles para ${entry.route}`);
  }

  const chunks = [...new Set(routeEntry[1])];
  const gzipBytes = chunks.reduce((total, chunk) => {
    const bytes = readFileSync(resolve(".next", chunk));
    return total + gzipSync(bytes).byteLength;
  }, 0);

  return {
    route: entry.route,
    gzipKb: Math.round((gzipBytes / 1024) * 10) / 10,
    budgetKb: entry.budgetKb,
    passed: gzipBytes <= entry.budgetKb * 1024,
    chunks: chunks.length,
  };
}

const results = routeBudgets.map(routeSize);
const outputIndex = process.argv.indexOf("--output");
if (outputIndex >= 0 && process.argv[outputIndex + 1]) {
  writeFileSync(
    process.argv[outputIndex + 1],
    `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`
  );
}

console.table(results);

if (
  process.argv.includes("--enforce") &&
  results.some((result) => !result.passed)
) {
  process.exitCode = 1;
}
