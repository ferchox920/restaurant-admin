import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, relative } from "node:path";

const [schemaFile, backendDirectory] = process.argv.slice(2);
if (!schemaFile || !backendDirectory)
  throw new Error(
    "Usage: node scripts/contract-matrix.mjs openapi.json pinned-backend-directory"
  );
const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(resolve(dir, entry.name))
      : [resolve(dir, entry.name)]
  );
const normalized = (path) =>
  path.replace(/\{[^}]+\}/g, "{}").replace(/:[^/]+/g, "{}");
const roles = new Map();
for (const path of files(resolve(backendDirectory, "src")).filter((file) =>
  file.endsWith(".controller.ts")
)) {
  const text = readFileSync(path, "utf8");
  const classRoles = text
    .slice(0, text.indexOf("@Controller"))
    .match(/@Roles\(([^)]+)\)/)?.[1]
    .replace(/Role\.|['"\s]/g, "")
    .replaceAll(",", ", ");
  const prefix = text.match(/@Controller\((?:['"]([^'"]*)['"])?\)/)?.[1] || "";
  for (const match of text.matchAll(
    /@(Get|Post|Patch|Delete)\((?:['"]([^'"]*)['"])?\)([\s\S]*?)(?=\n  @(?:Get|Post|Patch|Delete)\(|$)/g
  )) {
    const method = match[1].toLowerCase();
    const endpoint = `/api/${[prefix, match[2]].filter(Boolean).join("/")}`;
    const allowed =
      match[3]
        .match(/@Roles\(([^)]+)\)/)?.[1]
        .replace(/Role\.|['"\s]/g, "")
        .replaceAll(",", ", ") ||
      classRoles ||
      "JWT / ver guard";
    roles.set(`${method} ${normalized(endpoint)}`, {
      allowed,
      controller: relative(backendDirectory, path).replaceAll("\\", "/"),
    });
  }
}
const consumers = [];
for (const file of files(resolve("features")).filter((file) =>
  file.endsWith(".api.ts")
)) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/([`"])(\/api\/[^`"\n]+)\1/g)) {
    const before = source.slice(0, match.index);
    const method =
      [
        ...before.matchAll(
          /apiClient\.(getOrNullOnNotFound|get|post|patch|delete)\b/g
        ),
      ].at(-1)?.[1] || "get";
    const endpoint = match[2]
      .replace(/\$\{queryString\}/g, "")
      .replace(/\$\{expectedVersion[\s\S]*/, "")
      .replace(/\$\{[^}]+\}/g, "{param}")
      .split("?")[0];
    const verb = method.startsWith("get") ? "get" : method;
    const found = Object.entries(schema.paths).find(
      ([path, operations]) =>
        normalized(path) === normalized(endpoint) && operations[verb]
    );
    const operation = found?.[1][verb];
    const access = roles.get(`${verb} ${normalized(endpoint)}`);
    const input = operation?.requestBody?.content?.["application/json"]?.schema;
    const responses = Object.entries(operation?.responses || {}).map(
      ([status, response]) =>
        `${status}: ${JSON.stringify(response.content?.["application/json"]?.schema || response.description)}`
    );
    consumers.push({
      consumer: relative(process.cwd(), file).replaceAll("\\", "/"),
      method: verb.toUpperCase(),
      route: endpoint,
      openapiRoute: found?.[0] || null,
      roles:
        endpoint === "/api/auth/login"
          ? "public"
          : access?.allowed || "ver guard",
      controller: access?.controller || null,
      request: input || null,
      parameters: operation?.parameters || [],
      responses,
    });
  }
}
const unique = [
  ...new Map(
    consumers.map((entry) => [
      `${entry.consumer}:${entry.method}:${entry.route}`,
      entry,
    ])
  ).values(),
];
mkdirSync("docs/verification", { recursive: true });
writeFileSync(
  "docs/verification/contract-matrix.json",
  JSON.stringify(
    {
      backendSha: "5562dec6cef7c00f76c31cc5bf663f5cf282ae14",
      source:
        "OpenAPI ejecutado + controladores del clon fijado + consumidores frontend; no acredita ejecución de todos los CRUD",
      consumers: unique,
      schemas: schema.components.schemas,
    },
    null,
    2
  ) + "\n"
);
const lines = [
  "# Matriz de consumidores HTTP",
  "",
  "Fuente: OpenAPI ejecutado del backend 5562dec y controladores/DTO de ese clon. El JSON adyacente conserva parámetros, cuerpos, respuestas y campos de todos los schemas. Esta matriz estática no sustituye las pruebas full-stack.",
  "",
  "| Consumidor | Método | Ruta | Roles efectivos | OpenAPI |",
  "| --- | --- | --- | --- | --- |",
  ...unique.map(
    (item) =>
      `| ${item.consumer} | ${item.method} | ${item.route} | ${item.roles} | ${item.openapiRoute ? "presente" : "brecha"} |`
  ),
  "",
  "Ver frontend-integration.md para dinero, versiones, paginación, errores, SSE y brechas semánticas.",
  "",
];
writeFileSync("docs/verification/contract-matrix.md", lines.join("\n"));
console.log(
  JSON.stringify({
    consumers: unique.length,
    absent: unique
      .filter((entry) => !entry.openapiRoute)
      .map((entry) => `${entry.method} ${entry.route}`),
  })
);
