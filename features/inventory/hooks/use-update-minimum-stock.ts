"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMinimumStock } from "@/features/inventory/api/inventory.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import type { UpdateMinimumStockFormValue } from "@/features/inventory/types/inventory.types";
import { toApiQuantityNumber } from "@/lib/quantity";

export function useUpdateMinimumStock(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMinimumStockFormValue) =>
      updateMinimumStock(productId, {
        minimumStock: toApiQuantityNumber(payload.minimumStock),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: inventoryQueryKeys.detail(productId),
      });
      void queryClient.invalidateQueries({
        queryKey: inventoryQueryKeys.movements(),
      });
      void queryClient.invalidateQueries({
        queryKey: inventoryQueryKeys.productMovementsByProduct(productId),
      });
    },
  });
}
