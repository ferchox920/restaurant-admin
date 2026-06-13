"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductInventory } from "@/features/inventory/api/inventory.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useProductInventory(productId: string | undefined) {
  return useQuery({
    queryKey: inventoryQueryKeys.detail(productId ?? ""),
    queryFn: () => getProductInventory(productId as string),
    enabled: Boolean(productId),
    retry: shouldRetryQuery,
    staleTime: 15_000,
  });
}
