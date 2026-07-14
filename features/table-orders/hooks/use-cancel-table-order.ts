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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: tableOrdersQueryKeys.detail(orderId),
      });
      void queryClient.invalidateQueries({ queryKey: tableOrdersQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: saleTicketsQueryKeys.all });
    },
  });
}
