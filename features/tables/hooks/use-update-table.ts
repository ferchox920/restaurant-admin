"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTable } from "@/features/tables/api/tables.api";
import { tablesQueryKeys } from "@/features/tables/query-keys";
import type { UpdateTableInput } from "@/features/tables/types/table.types";

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tableId,
      data,
    }: {
      tableId: string;
      data: UpdateTableInput;
    }) => updateTable(tableId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() });
    },
  });
}
