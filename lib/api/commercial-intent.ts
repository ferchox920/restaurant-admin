import { isApiError } from "@/lib/api/is-api-error";

const prefix = "restaurant:commercial-intent:";
const uncertainPrefix = "restaurant:commercial-uncertain:";
const pending = new Map<string, Promise<unknown>>();

export type UncertainIntent = {
  operation: string;
  payload: unknown;
  key: string;
};
function changed() {
  window.dispatchEvent(new Event("restaurant:intent-changed"));
}
export function readUncertainIntents(operation: string): UncertainIntent[] {
  if (typeof window === "undefined") return [];
  const operationPrefix = `${prefix}${operation}:`;
  return Object.keys(sessionStorage)
    .filter((slot) => slot.startsWith(operationPrefix))
    .flatMap((slot) => {
      try {
        const marker = sessionStorage.getItem(`${uncertainPrefix}${slot}`);
        if (pending.has(slot) && !marker) return [];
        const key = sessionStorage.getItem(slot);
        if (!key) return [];
        const serialized = slot.slice(operationPrefix.length);
        const payload: unknown =
          serialized === "undefined" ? undefined : JSON.parse(serialized);
        if (marker) {
          const intent = JSON.parse(marker) as UncertainIntent;
          if (
            intent.operation !== operation ||
            intent.key !== key ||
            `${operationPrefix}${canonical(intent.payload)}` !== slot
          )
            return [];
        }
        // After reload there is no in-memory request: a pre-send key without a
        // settled response is uncertain even if navigation interrupted catch().
        return [{ operation, payload, key }];
      } catch {
        return [];
      }
    });
}

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
  const uncertainSlot = `${uncertainPrefix}${slot}`;
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
        storage.removeItem(uncertainSlot);
        changed();
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
        ) {
          storage.removeItem(slot);
          storage.removeItem(uncertainSlot);
        } else {
          storage.setItem(
            uncertainSlot,
            JSON.stringify({ operation, payload, key })
          );
        }
        changed();
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
    .filter((key) => key.startsWith(prefix) || key.startsWith(uncertainPrefix))
    .forEach((key) => window.sessionStorage.removeItem(key));
  changed();
}
