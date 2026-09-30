"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { manualAdjust } from "@/features/inventory/api/inventory.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import type { ManualAdjustmentFormValue } from "@/features/inventory/types/inventory.types";
import { toApiQuantityNumber } from "@/lib/quantity";

export function useManualAdjustment(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualAdjustmentFormValue & { reason: string }) =>
      manualAdjust(productId, {
        newStock: toApiQuantityNumber(payload.newStock),
        reason: payload.reason.trim(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: inventoryQueryKeys.lists(),
      });
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
