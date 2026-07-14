"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentTableOrder } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";

export function useCurrentTableOrder(tableId: string, enabled = true) {
  return useQuery({
    queryKey: tableOrdersQueryKeys.currentByTable(tableId),
    queryFn: () => getCurrentTableOrder(tableId),
    enabled: enabled && Boolean(tableId),
  });
}
