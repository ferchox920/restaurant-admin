"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeTableOrderItem } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";

export function useRemoveTableOrderItem(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      expectedVersion,
    }: {
      itemId: string;
      expectedVersion?: string;
    }) => removeTableOrderItem(orderId, itemId, expectedVersion),
    onSuccess: (order) => {
      queryClient.setQueryData(tableOrdersQueryKeys.detail(orderId), order);
      void queryClient.invalidateQueries({
        queryKey: tableOrdersQueryKeys.lists(),
        refetchType: "none",
      });
    },
  });
}
