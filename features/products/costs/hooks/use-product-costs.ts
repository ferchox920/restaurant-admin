"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductCosts } from "@/features/products/costs/api/product-costs.api";
import { productCostsQueryKeys } from "@/features/products/costs/query-keys";
import { shouldRetryQuery } from "@/lib/api/query-utils";
import type { PaginationParams } from "@/types/common";

export function useProductCosts(
  productId: string | undefined,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: [
      ...productCostsQueryKeys.history(productId ?? ""),
      pagination ?? {},
    ],
    queryFn: ({ signal }) =>
      getProductCosts(productId as string, pagination, signal),
    enabled: Boolean(productId),
    retry: shouldRetryQuery,
  });
}
