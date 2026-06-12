"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateCategory } from "@/features/categories/api/categories.api";
import { categoriesQueryKeys } from "@/features/categories/query-keys";

export function useDeactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateCategory,
    onSuccess: (_, categoryId) => {
      void queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.detail(categoryId),
      });
    },
  });
}
