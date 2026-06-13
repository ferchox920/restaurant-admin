const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "accesstoken",
  "refreshtoken",
  "token",
  "jwttoken",
  "authorization",
  "secret",
  "secrets",
]);

function normalizeKey(key: string) {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function sanitizeRecursive(
  value: unknown,
  depth: number,
  seen: WeakSet<object>
): unknown {
  if (depth > 8) {
    return "[DEPTH_LIMIT]";
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeRecursive(item, depth + 1, seen));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[CIRCULAR]";
    }

    seen.add(value);

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        SENSITIVE_KEYS.has(normalizeKey(key))
          ? "[REDACTED]"
          : sanitizeRecursive(nestedValue, depth + 1, seen),
      ])
    );
  }

  return String(value);
}

export function sanitizeAuditData<T>(value: T): T {
  return sanitizeRecursive(value, 0, new WeakSet<object>()) as T;
}
