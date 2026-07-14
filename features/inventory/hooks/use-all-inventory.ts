"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllInventory } from "@/features/inventory/api/inventory.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import type { InventoryFilters } from "@/features/inventory/types/inventory.types";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useAllInventory(
  filters?: Omit<InventoryFilters, "limit" | "offset">
) {
  return useQuery({
    queryKey: [...inventoryQueryKeys.list(filters), "all-pages"],
    queryFn: getAllInventory.bind(null, filters),
    retry: shouldRetryQuery,
    staleTime: 15_000,
  });
}
