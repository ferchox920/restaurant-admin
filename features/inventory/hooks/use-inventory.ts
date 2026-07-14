"use client";

import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/features/inventory/api/inventory.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import type { InventoryFilters } from "@/features/inventory/types/inventory.types";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useInventory(filters?: InventoryFilters) {
  return useQuery({
    queryKey: inventoryQueryKeys.list(filters),
    queryFn: ({ signal }) => getInventory(filters, signal),
    retry: shouldRetryQuery,
    staleTime: 15_000,
  });
}
