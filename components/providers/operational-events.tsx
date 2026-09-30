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
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let pendingRefresh = synchronize;
    const queueRefresh = (refresh = synchronize) => {
      // A replay can deliver hundreds of events in one frame. Every refresh covers
      // all operational roots, so one trailing refresh also covers earlier events.
      pendingRefresh = refresh;
      if (refreshTimer !== undefined) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = undefined;
        pendingRefresh();
      }, 50);
    };
    const disconnect = connectOperationalStream(
      `${apiUrl}/api/operations/events`,
      {
        onConnected: queueRefresh,
        onEvent: (name, data) => {
          if (name === "resync.required") {
            queueRefresh();
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
          queueRefresh(() => {
            try {
              invalidateOperationalEvent(queryClient, name, JSON.parse(data));
            } catch {
              synchronize();
            }
          });
        },
      }
    );
    const visible = () => {
      if (document.visibilityState === "visible") queueRefresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      disconnect();
      clearTimeout(refreshTimer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [enabled, pathname, queryClient]);
  return null;
}
