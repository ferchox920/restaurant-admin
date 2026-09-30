"use client";

import { useSyncExternalStore, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/api-client";
import {
  commercialIntent,
  readUncertainIntents,
  type UncertainIntent,
} from "@/lib/api/commercial-intent";
import { getApiErrorMessages } from "@/lib/api/error-messages";

function subscribe(notify: () => void) {
  window.addEventListener("restaurant:intent-changed", notify);
  return () => window.removeEventListener("restaurant:intent-changed", notify);
}

/** Replay only a known page operation, with the payload/key persisted before its first send. */
export function CommercialRecovery({ operation }: { operation: string }) {
  const client = useQueryClient();
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(readUncertainIntents(operation)),
    () => "[]"
  );
  const intents = JSON.parse(snapshot) as UncertainIntent[];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function recover(intent: UncertainIntent) {
    setBusy(true);
    setMessage("");
    try {
      await commercialIntent(operation, intent.payload, (key) =>
        apiClient.post(operation, intent.payload, {
          headers: { "Idempotency-Key": key },
        })
      );
      await client.invalidateQueries();
      setMessage(
        "Resultado confirmado por el backend. El estado vigente está actualizado."
      );
    } catch (error) {
      setMessage(getApiErrorMessages(error).join(" "));
    } finally {
      setBusy(false);
    }
  }
  if (!intents.length && !message) return null;
  return (
    <section
      aria-label="Recuperación de operación"
      role="status"
      className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 space-y-3"
    >
      {intents.length > 0 && (
        <>
          <h2 className="font-semibold">Resultado incierto</h2>
          <p>
            La respuesta se perdió. La operación puede haberse confirmado.
            Recuperá su resultado con la misma clave y los datos originales; no
            ingreses una operación nueva.
          </p>
        </>
      )}
      {intents.map((intent) => (
        <Button
          key={intent.key}
          disabled={busy}
          onClick={() => void recover(intent)}
        >
          {busy ? "Consultando resultado…" : "Recuperar resultado"}
        </Button>
      ))}
      {message && <p>{message}</p>}
    </section>
  );
}
