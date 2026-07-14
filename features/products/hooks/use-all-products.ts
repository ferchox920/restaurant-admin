"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllProducts, type ProductsFilters } from "@/features/products/api/products.api";
import { productsQueryKeys } from "@/features/products/query-keys";

export function useAllProducts(filters?: Omit<ProductsFilters, "limit" | "offset">) {
  return useQuery({
    queryKey: [...productsQueryKeys.list(filters), "all-pages"],
    queryFn: () => getAllProducts(filters),
  });
}
