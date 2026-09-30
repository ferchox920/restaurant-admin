"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTableOrderItem } from "@/features/table-orders/api/table-orders.api";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import type { AddTableOrderItemFormValues } from "@/features/table-orders/types/table-order.types";
import { toApiQuantityNumber } from "@/lib/quantity";

export function useAddTableOrderItem(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddTableOrderItemFormValues) =>
      addTableOrderItem(orderId, {
        productId: payload.productId,
        quantity: toApiQuantityNumber(payload.quantity),
        ...(payload.expectedVersion
          ? { expectedVersion: payload.expectedVersion }
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
