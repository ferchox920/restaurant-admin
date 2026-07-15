"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCategories, type CategoriesFilters } from "@/features/categories/api/categories.api";
import { categoriesQueryKeys } from "@/features/categories/query-keys";
import {
  QUERY_STALE_TIME,
  type QueryActivationOptions,
} from "@/lib/query-client/query-policies";

export function useAllCategories(
  filters?: Omit<CategoriesFilters, "limit" | "offset">,
  options: QueryActivationOptions = {}
) {
  return useQuery({
    queryKey: [...categoriesQueryKeys.list(filters), "all-pages"],
    queryFn: ({ signal }) => getAllCategories(filters, signal),
    enabled: options.enabled,
    staleTime: QUERY_STALE_TIME.options,
  });
}
