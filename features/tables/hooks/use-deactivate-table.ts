"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateTable } from "@/features/tables/api/tables.api";
import { tablesQueryKeys } from "@/features/tables/query-keys";

export function useDeactivateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateTable,
    onSuccess: (table) => {
      void queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: tablesQueryKeys.detail(table.id),
      });
    },
  });
}
