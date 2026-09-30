"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import { reportsQueryKeys } from "@/features/reports/query-keys";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import { tablesQueryKeys } from "@/features/tables/query-keys";
import { closeTableOrder } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import type { CloseTableOrderFormValues } from "@/features/table-orders/types/table-order.types";

export function useCloseTableOrder(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CloseTableOrderFormValues) =>
      closeTableOrder(orderId, payload),
    onSuccess: (order) => {
      queryClient.setQueryData(tableOrdersQueryKeys.detail(orderId), order);
      const staleKeys = [
        tablesQueryKeys.lists(),
        tableOrdersQueryKeys.lists(),
        saleTicketsQueryKeys.all,
        inventoryQueryKeys.all,
        reportsQueryKeys.all,
      ];
      staleKeys.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey, refetchType: "active" });
      });
    },
  });
}
