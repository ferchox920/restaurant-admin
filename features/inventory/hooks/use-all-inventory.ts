"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllInventory } from "@/features/inventory/api/inventory.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import type { InventoryFilters } from "@/features/inventory/types/inventory.types";
import { shouldRetryQuery } from "@/lib/api/query-utils";
import {
  QUERY_STALE_TIME,
  type QueryActivationOptions,
} from "@/lib/query-client/query-policies";

export function useAllInventory(
  filters?: Omit<InventoryFilters, "limit" | "offset">,
  options: QueryActivationOptions = {}
) {
  return useQuery({
    queryKey: [...inventoryQueryKeys.list(filters), "all-pages"],
    queryFn: ({ signal }) => getAllInventory(filters, signal),
    enabled: options.enabled,
    retry: shouldRetryQuery,
    staleTime: QUERY_STALE_TIME.operational,
  });
}
