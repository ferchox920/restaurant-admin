"use client";

import { useQuery } from "@tanstack/react-query";
import { getTable } from "@/features/tables/api/tables.api";
import { tablesQueryKeys } from "@/features/tables/query-keys";

export function useTable(tableId: string) {
  return useQuery({
    queryKey: tablesQueryKeys.detail(tableId),
    queryFn: () => getTable(tableId),
    enabled: Boolean(tableId),
  });
}
