"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllProducts, type ProductsFilters } from "@/features/products/api/products.api";
import { productsQueryKeys } from "@/features/products/query-keys";
import {
  QUERY_STALE_TIME,
  type QueryActivationOptions,
} from "@/lib/query-client/query-policies";

export function useAllProducts(
  filters?: Omit<ProductsFilters, "limit" | "offset">,
  options: QueryActivationOptions = {}
) {
  return useQuery({
    queryKey: [...productsQueryKeys.list(filters), "all-pages"],
    queryFn: ({ signal }) => getAllProducts(filters, signal),
    enabled: options.enabled,
    staleTime: QUERY_STALE_TIME.options,
  });
}
