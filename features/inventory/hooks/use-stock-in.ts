"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stockIn } from "@/features/inventory/api/inventory.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import type { InventoryQuantityFormValue } from "@/features/inventory/types/inventory.types";
import { toApiQuantityNumber } from "@/lib/quantity";

export function useStockIn(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InventoryQuantityFormValue) =>
      stockIn(productId, {
        quantity: toApiQuantityNumber(payload.quantity),
        reason: payload.reason.trim(),
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
