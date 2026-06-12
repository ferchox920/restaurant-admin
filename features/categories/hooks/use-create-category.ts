"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/features/categories/api/categories.api";
import { categoriesQueryKeys } from "@/features/categories/query-keys";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.lists(),
      });
    },
  });
}
