"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosCatalog } from "@/features/pos/api/pos-catalog.api";
import type { PosCatalogFilters } from "@/features/pos/types/pos-catalog.types";
import { QUERY_STALE_TIME } from "@/lib/query-client/query-policies";

export const posCatalogQueryKeys = {
  all: ["pos-catalog"] as const,
  list: (filters: Omit<PosCatalogFilters, "cursor">) =>
    [...posCatalogQueryKeys.all, filters] as const,
};

export function usePosCatalog(
  filters: Omit<PosCatalogFilters, "cursor">,
  enabled: boolean
) {
  return useInfiniteQuery({
    queryKey: posCatalogQueryKeys.list(filters),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      getPosCatalog({ ...filters, cursor: pageParam }, signal),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && Boolean(filters.salesChannelId),
    staleTime: QUERY_STALE_TIME.operational,
    maxPages: 2,
  });
}
