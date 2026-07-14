"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivateTable } from "@/features/tables/api/tables.api";
import { tablesQueryKeys } from "@/features/tables/query-keys";

export function useReactivateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateTable,
    onSuccess: (table) => {
      void queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: tablesQueryKeys.detail(table.id),
      });
    },
  });
}
