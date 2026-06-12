"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategory } from "@/features/categories/api/categories.api";
import { categoriesQueryKeys } from "@/features/categories/query-keys";

type UseCategoryOptions = {
  enabled?: boolean;
};

export function useCategory(
  categoryId: string | undefined,
  options: UseCategoryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: categoriesQueryKeys.detail(categoryId ?? ""),
    queryFn: () => getCategory(categoryId as string),
    enabled: enabled && Boolean(categoryId),
  });
}
