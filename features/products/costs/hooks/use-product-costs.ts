"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductCosts } from "@/features/products/costs/api/product-costs.api";
import { productCostsQueryKeys } from "@/features/products/costs/query-keys";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useProductCosts(productId: string | undefined) {
  return useQuery({
    queryKey: productCostsQueryKeys.history(productId ?? ""),
    queryFn: () => getProductCosts(productId as string),
    enabled: Boolean(productId),
    retry: shouldRetryQuery,
  });
}
