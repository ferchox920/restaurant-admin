"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllTables } from "@/features/tables/api/tables.api";
import { tablesQueryKeys } from "@/features/tables/query-keys";
import type { TableFilters } from "@/features/tables/types/table.types";
import {
  QUERY_STALE_TIME,
  type QueryActivationOptions,
} from "@/lib/query-client/query-policies";

export function useAllTables(
  filters?: Omit<TableFilters, "limit" | "offset">,
  options: QueryActivationOptions = {}
) {
  return useQuery({
    queryKey: [...tablesQueryKeys.list(filters), "all-pages"],
    queryFn: ({ signal }) => getAllTables(filters, signal),
    enabled: options.enabled,
    staleTime: QUERY_STALE_TIME.operational,
  });
}
