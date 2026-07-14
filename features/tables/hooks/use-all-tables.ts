"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllTables } from "@/features/tables/api/tables.api";
import { tablesQueryKeys } from "@/features/tables/query-keys";
import type { TableFilters } from "@/features/tables/types/table.types";

export function useAllTables(filters?: Omit<TableFilters, "limit" | "offset">) {
  return useQuery({
    queryKey: [...tablesQueryKeys.list(filters), "all-pages"],
    queryFn: () => getAllTables(filters),
  });
}
