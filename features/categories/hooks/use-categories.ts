"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  type CategoriesFilters,
} from "@/features/categories/api/categories.api";
import { categoriesQueryKeys } from "@/features/categories/query-keys";

export function useCategories(filters?: CategoriesFilters) {
  return useQuery({
    queryKey: categoriesQueryKeys.list(filters),
    queryFn: () => getCategories(filters),
  });
}
