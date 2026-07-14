"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductInventoryMovements } from "@/features/inventory/api/inventory.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import type { InventoryMovementsFilters } from "@/features/inventory/types/inventory.types";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useProductInventoryMovements(
  productId: string | undefined,
  filters?: Omit<InventoryMovementsFilters, "productId">,
  enabled = true,
) {
  return useQuery({
    queryKey: inventoryQueryKeys.productMovementList(productId ?? "", filters),
    queryFn: ({ signal }) => getProductInventoryMovements(productId as string, filters, signal),
    enabled: enabled && Boolean(productId),
    retry: shouldRetryQuery,
    staleTime: 15_000,
  });
}
