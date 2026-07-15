"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getProducts,
  type ProductsFilters,
} from "@/features/products/api/products.api";
import { productsQueryKeys } from "@/features/products/query-keys";

export function useProducts(filters?: ProductsFilters) {
  return useQuery({
    queryKey: productsQueryKeys.list(filters),
    queryFn: ({ signal }) => getProducts(filters, signal),
    placeholderData: keepPreviousData,
  });
}
