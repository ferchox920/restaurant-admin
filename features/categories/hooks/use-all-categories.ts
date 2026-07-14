"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCategories, type CategoriesFilters } from "@/features/categories/api/categories.api";
import { categoriesQueryKeys } from "@/features/categories/query-keys";

export function useAllCategories(filters?: Omit<CategoriesFilters, "limit" | "offset">) {
  return useQuery({
    queryKey: [...categoriesQueryKeys.list(filters), "all-pages"],
    queryFn: () => getAllCategories(filters),
  });
}
