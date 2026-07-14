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
      void queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: tablesQueryKeys.detail(order.restaurantTableId),
      });
      void queryClient.invalidateQueries({
        queryKey: tableOrdersQueryKeys.currentByTable(order.restaurantTableId),
      });
      void queryClient.invalidateQueries({
        queryKey: tableOrdersQueryKeys.detail(orderId),
      });
      void queryClient.invalidateQueries({ queryKey: tableOrdersQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: saleTicketsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: reportsQueryKeys.all });
    },
  });
}
