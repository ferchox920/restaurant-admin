import { isApiError } from "@/lib/api/is-api-error";

const prefix = "restaurant:commercial-intent:";
const pending = new Map<string, Promise<unknown>>();

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Persist before sending. An uncertain response retains the exact payload/key. */
export function commercialIntent<T>(
  operation: string,
  payload: unknown,
  send: (key: string) => Promise<T>
): Promise<T> {
  const slot = `${prefix}${operation}:${canonical(payload)}`;
  const existing = pending.get(slot);
  if (existing) return existing as Promise<T>;
  // sessionStorage survives rerenders/reloads, and isolates simultaneous browser sessions.
  const storage = window.sessionStorage;
  const key = storage.getItem(slot) ?? crypto.randomUUID();
  storage.setItem(slot, key);
  const task = Promise.resolve()
    .then(() => send(key))
    .then(
      (result) => {
        storage.removeItem(slot);
        return result;
      },
      (error: unknown) => {
        const code =
          isApiError(error) &&
          error.raw &&
          typeof error.raw === "object" &&
          "code" in error.raw
            ? error.raw.code
            : undefined;
        if (
          isApiError(error) &&
          (error.statusCode ?? 500) < 500 &&
          ![
            "IDEMPOTENCY_IN_PROGRESS",
            "IDEMPOTENCY_RECOVERY_REQUIRED",
          ].includes(String(code))
        )
          storage.removeItem(slot);
        throw error;
      }
    )
    .finally(() => {
      pending.delete(slot);
    });
  pending.set(slot, task);
  return task;
}

export function clearCommercialIntents() {
  Object.keys(window.sessionStorage)
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => window.sessionStorage.removeItem(key));
}
