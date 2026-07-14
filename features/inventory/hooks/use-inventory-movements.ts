"use client";

import { useQuery } from "@tanstack/react-query";
import { getInventoryMovements } from "@/features/inventory/api/inventory.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import type { InventoryMovementsFilters } from "@/features/inventory/types/inventory.types";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useInventoryMovements(filters?: InventoryMovementsFilters) {
  return useQuery({
    queryKey: inventoryQueryKeys.movementList(filters),
    queryFn: ({ signal }) => getInventoryMovements(filters, signal),
    retry: shouldRetryQuery,
    staleTime: 15_000,
  });
}
