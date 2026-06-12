"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategory } from "@/features/categories/api/categories.api";
import { categoriesQueryKeys } from "@/features/categories/query-keys";
import type { UpdateCategoryInput } from "@/features/categories/types/category.types";

type UpdateCategoryPayload = {
  categoryId: string;
  data: UpdateCategoryInput;
};

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: UpdateCategoryPayload) =>
      updateCategory(categoryId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: categoriesQueryKeys.detail(variables.categoryId),
      });
    },
  });
}
