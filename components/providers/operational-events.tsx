"use client";

import { connectOperationalStream } from "@/lib/api/operational-stream";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiUrl, realtimeEnabled, sessionMode } from "@/lib/env";
import {
  operationalKeys,
  invalidateOperationalEvent,
} from "@/lib/api/operational-events";

export function OperationalEvents({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (
      !enabled ||
      !realtimeEnabled ||
      sessionMode !== "cookie" ||
      !/^\/(floor|sales|table-orders)(\/|$)/.test(pathname)
    )
      return;
    const synchronize = () => {
      operationalKeys.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey, refetchType: "active" });
      });
    };
    const disconnect = connectOperationalStream(
      `${apiUrl}/api/operations/events`,
      {
        onConnected: synchronize,
        onEvent: (name, data) => {
          if (name === "resync.required") {
            synchronize();
            return;
          }
          if (
            ![
              "table-order.changed",
              "sale-ticket.changed",
              "table.changed",
              "inventory.changed",
            ].includes(name)
          )
            return;
          try {
            invalidateOperationalEvent(queryClient, name, JSON.parse(data));
          } catch {
            synchronize();
          }
        },
      }
    );
    const visible = () => {
      if (document.visibilityState === "visible") synchronize();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      disconnect();
      document.removeEventListener("visibilitychange", visible);
    };
  }, [enabled, pathname, queryClient]);
  return null;
}
