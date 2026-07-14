"use client";

import { useQuery } from "@tanstack/react-query";
import { getTableOrder } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";

export function useTableOrder(orderId: string) {
  return useQuery({
    queryKey: tableOrdersQueryKeys.detail(orderId),
    queryFn: () => getTableOrder(orderId),
    enabled: Boolean(orderId),
  });
}
