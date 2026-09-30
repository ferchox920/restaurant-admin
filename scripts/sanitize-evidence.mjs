import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";

const jwt = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const sensitive =
  /^(authorization|cookie|set-cookie|password|accessToken|sessionToken|storageState|JWT_SECRET|DATABASE_URL)$/i;
function scrub(value, secrets) {
  if (Array.isArray(value)) return value.map((entry) => scrub(entry, secrets));
  if (value && typeof value === "object") {
    if (
      typeof value.name === "string" &&
      sensitive.test(value.name) &&
      "value" in value
    )
      return { ...value, value: "[REDACTED]" };
    if (value.params && /password/i.test(String(value.params.selector)))
      value = { ...value, params: { ...value.params, value: "[REDACTED]" } };
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        key.toLowerCase() === "cookies"
          ? []
          : sensitive.test(key)
            ? "[REDACTED]"
            : scrub(entry, secrets),
      ])
    );
  }
  return typeof value === "string" ? redactText(value, secrets, false) : value;
}
function redactText(text, secrets, structured = true) {
  for (const secret of secrets)
    if (secret) text = text.split(secret).join("[REDACTED]");
  text = text
    .replace(jwt, "[REDACTED]")
    .replace(/Demo-[a-f0-9]{32}/g, "[REDACTED]")
    .replace(
      /postgres(?:ql)?:\/\/[^\s/@]+:[^\s/@]+@/g,
      "postgresql://[REDACTED]@"
    );
  text = text.replace(
    /(playwrightReportBase64\s*=\s*["']data:application\/zip;base64,)([A-Za-z0-9+/=]+)(["'])/g,
    (_, prefix, data, suffix) =>
      `${prefix}${Buffer.from(redactZip(Buffer.from(data, "base64"), secrets)).toString("base64")}${suffix}`
  );
  if (!structured) return text;
  try {
    return JSON.stringify(scrub(JSON.parse(text), secrets), null, 2);
  } catch {
    /* NDJSON or ordinary log follows */
  }
  return text
    .split("\n")
    .map((line) => {
      try {
        return JSON.stringify(scrub(JSON.parse(line), secrets));
      } catch {
        return line;
      }
    })
    .join("\n");
}
function redactBytes(bytes, secrets) {
  const text = strFromU8(bytes);
  // Preserve images/video/binary unchanged. Trace JSON bodies may have hash-only names.
  if (
    text.includes("\0") ||
    !Buffer.from(strToU8(text)).equals(Buffer.from(bytes))
  )
    return bytes;
  return strToU8(redactText(text, secrets));
}
function redactZip(bytes, secrets) {
  const entries = unzipSync(bytes);
  for (const [name, content] of Object.entries(entries))
    entries[name] = name.endsWith(".zip")
      ? redactZip(content, secrets)
      : redactBytes(content, secrets);
  return zipSync(entries);
}
export function sanitizeEvidence(directory, secrets) {
  let files = 0;
  function walk(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) walk(file);
      else {
        const bytes = readFileSync(file);
        const sanitized = entry.name.endsWith(".zip")
          ? redactZip(bytes, secrets)
          : redactBytes(bytes, secrets);
        writeFileSync(file, sanitized);
        files++;
      }
    }
  }
  walk(directory);
  return {
    files,
    credentialRedaction: true,
    scope: "Disposable fixtures; no cookie/session credentials retained",
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  console.log(
    JSON.stringify(sanitizeEvidence(process.argv[2] || "output/playwright", []))
  );
}
