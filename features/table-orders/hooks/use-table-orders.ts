"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTableOrders } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import type { TableOrderFilters } from "@/features/table-orders/types/table-order.types";

export function useTableOrders(filters?: TableOrderFilters, enabled = true) {
  return useQuery({
    queryKey: tableOrdersQueryKeys.list(filters),
    queryFn: ({ signal }) => getTableOrders(filters, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}
