"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesQueryKeys } from "@/features/tables/query-keys";
import { openTableOrder } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import type { OpenTableOrderFormValues } from "@/features/table-orders/types/table-order.types";

export function useOpenTableOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tableId,
      data,
    }: {
      tableId: string;
      data: OpenTableOrderFormValues;
    }) => openTableOrder(tableId, data),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: tableOrdersQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: tableOrdersQueryKeys.detail(order.id),
      });
    },
  });
}
