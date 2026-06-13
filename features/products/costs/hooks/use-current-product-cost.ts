"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentProductCost } from "@/features/products/costs/api/product-costs.api";
import { productCostsQueryKeys } from "@/features/products/costs/query-keys";
import { isNotFoundError, shouldRetryQuery } from "@/lib/api/query-utils";

export function useCurrentProductCost(productId: string | undefined) {
  return useQuery({
    queryKey: productCostsQueryKeys.current(productId ?? ""),
    queryFn: async () => {
      try {
        return await getCurrentProductCost(productId as string);
      } catch (error) {
        if (isNotFoundError(error)) {
          return null;
        }

        throw error;
      }
    },
    enabled: Boolean(productId),
    retry: shouldRetryQuery,
  });
}
