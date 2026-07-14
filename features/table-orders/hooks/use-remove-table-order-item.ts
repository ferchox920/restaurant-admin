"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeTableOrderItem } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";

export function useRemoveTableOrderItem(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeTableOrderItem(orderId, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: tableOrdersQueryKeys.detail(orderId),
      });
      void queryClient.invalidateQueries({ queryKey: tableOrdersQueryKeys.current() });
      void queryClient.invalidateQueries({ queryKey: tableOrdersQueryKeys.lists() });
    },
  });
}
