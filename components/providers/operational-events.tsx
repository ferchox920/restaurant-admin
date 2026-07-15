"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import { tablesQueryKeys } from "@/features/tables/query-keys";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import { apiUrl, realtimeEnabled } from "@/lib/env";

type OperationalEventName =
  | "table.changed"
  | "table-order.changed"
  | "sale-ticket.changed"
  | "inventory.changed";

type OperationalEventPayload = {
  entityId: string;
  relatedIds?: {
    productId?: string;
    saleTicketId?: string;
    tableOrderId?: string;
  };
  version?: number;
};

const eventNames: OperationalEventName[] = [
  "table.changed",
  "table-order.changed",
  "sale-ticket.changed",
  "inventory.changed",
];

function isOperationalRoute(pathname: string) {
  return (
    pathname === "/floor" ||
    pathname.startsWith("/sales") ||
    pathname.startsWith("/table-orders")
  );
}

function OperationalEventsConnection({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !isOperationalRoute(pathname)) {
      return;
    }

    let source: EventSource | null = null;
    let reconnectTimer: number | undefined;
    let hiddenTimer: number | undefined;
    let retryDelay = 1_000;
    let lastEventId = "";
    let disposed = false;

    function invalidateEvent(name: OperationalEventName, payload: OperationalEventPayload) {
      if (name === "table.changed") {
        void queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      }

      if (name === "table-order.changed") {
        void queryClient.invalidateQueries({
          queryKey: tableOrdersQueryKeys.detail(payload.entityId),
        });
        void queryClient.invalidateQueries({ queryKey: tableOrdersQueryKeys.lists() });
      }

      if (name === "sale-ticket.changed") {
        void queryClient.invalidateQueries({
          queryKey: saleTicketsQueryKeys.detail(payload.entityId),
        });
        void queryClient.invalidateQueries({ queryKey: saleTicketsQueryKeys.lists() });
      }

      if (name === "inventory.changed") {
        const productId = payload.relatedIds?.productId ?? payload.entityId;
        void queryClient.invalidateQueries({
          queryKey: inventoryQueryKeys.detail(productId),
        });
        void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
      }
    }

    function synchronizeVisibleRoute() {
      if (pathname === "/floor") {
        void queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      }

      const orderId = pathname.match(/^\/table-orders\/([^/]+)$/)?.[1];
      if (orderId) {
        void queryClient.invalidateQueries({
          queryKey: tableOrdersQueryKeys.detail(orderId),
        });
      }

      const ticketId = pathname.match(/^\/sales\/([^/]+)$/)?.[1];
      if (ticketId && ticketId !== "new") {
        void queryClient.invalidateQueries({
          queryKey: saleTicketsQueryKeys.detail(ticketId),
        });
      }
    }

    function connect() {
      if (disposed || document.visibilityState === "hidden") {
        return;
      }

      const baseUrl = apiUrl.replace(/\/+$/, "");
      const url = new URL(
        `${baseUrl}/api/operations/events`,
        window.location.origin
      );
      if (lastEventId) {
        url.searchParams.set("lastEventId", lastEventId);
      }

      source = new EventSource(url, { withCredentials: true });
      source.onopen = () => {
        retryDelay = 1_000;
      };
      source.onerror = () => {
        source?.close();
        source = null;
        window.clearTimeout(reconnectTimer);
        reconnectTimer = window.setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30_000);
      };

      eventNames.forEach((name) => {
        source?.addEventListener(name, (event) => {
          const message = event as MessageEvent<string>;
          if (message.lastEventId) {
            lastEventId = message.lastEventId;
          }

          try {
            invalidateEvent(name, JSON.parse(message.data) as OperationalEventPayload);
          } catch {
            // Ignore malformed events; a visible-route synchronization remains available.
          }
        });
      });
    }

    function handleVisibilityChange() {
      window.clearTimeout(hiddenTimer);
      if (document.visibilityState === "hidden") {
        hiddenTimer = window.setTimeout(() => {
          source?.close();
          source = null;
        }, 60_000);
        return;
      }

      synchronizeVisibleRoute();
      if (!source) {
        connect();
      }
    }

    connect();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      source?.close();
      window.clearTimeout(reconnectTimer);
      window.clearTimeout(hiddenTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, pathname, queryClient]);

  return null;
}

export function OperationalEvents({ enabled }: { enabled: boolean }) {
  if (!realtimeEnabled) {
    return null;
  }

  return <OperationalEventsConnection enabled={enabled} />;
}
