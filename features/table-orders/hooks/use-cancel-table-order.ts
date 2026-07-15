"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import { tablesQueryKeys } from "@/features/tables/query-keys";
import { cancelTableOrder } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import type { CancelTableOrderFormValues } from "@/features/table-orders/types/table-order.types";

export function useCancelTableOrder(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelTableOrderFormValues) =>
      cancelTableOrder(orderId, payload),
    onSuccess: (order) => {
      queryClient.setQueryData(tableOrdersQueryKeys.detail(orderId), order);
      const staleKeys = [
        tablesQueryKeys.lists(),
        tableOrdersQueryKeys.lists(),
        saleTicketsQueryKeys.all,
      ];
      staleKeys.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey, refetchType: "none" });
      });
    },
  });
}
