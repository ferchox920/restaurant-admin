"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "@/features/tables/api/tables.api";
import { tablesQueryKeys } from "@/features/tables/query-keys";
import type { TableFilters } from "@/features/tables/types/table.types";

export function useTables(filters?: TableFilters) {
  return useQuery({
    queryKey: tablesQueryKeys.list(filters),
    queryFn: ({ signal }) => getTables(filters, signal),
    placeholderData: keepPreviousData,
  });
}
