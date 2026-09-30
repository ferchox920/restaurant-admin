"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTableOrderItem } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import type { UpdateTableOrderItemFormValues } from "@/features/table-orders/types/table-order.types";
import { toApiQuantityNumber } from "@/lib/quantity";

export function useUpdateTableOrderItem(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: UpdateTableOrderItemFormValues;
    }) =>
      updateTableOrderItem(orderId, itemId, {
        quantity: toApiQuantityNumber(data.quantity),
        ...(data.expectedVersion
          ? { expectedVersion: data.expectedVersion }
          : {}),
      }),
    onSuccess: (order) => {
      queryClient.setQueryData(tableOrdersQueryKeys.detail(orderId), order);
      void queryClient.invalidateQueries({
        queryKey: tableOrdersQueryKeys.lists(),
        refetchType: "none",
      });
    },
  });
}
