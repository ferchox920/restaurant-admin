"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTable } from "@/features/tables/api/tables.api";
import { tablesQueryKeys } from "@/features/tables/query-keys";

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTable,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
    },
  });
}
