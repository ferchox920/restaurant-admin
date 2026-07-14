"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivateCategory } from "@/features/categories/api/categories.api";
import { categoriesQueryKeys } from "@/features/categories/query-keys";

export function useReactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.lists(),
      });
    },
  });
}
