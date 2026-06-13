"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentProductPrice } from "@/features/products/prices/api/product-prices.api";
import { productPricesQueryKeys } from "@/features/products/prices/query-keys";
import { isNotFoundError, shouldRetryQuery } from "@/lib/api/query-utils";

export function useCurrentProductPrice(
  productId: string | undefined,
  channelId: string | undefined
) {
  return useQuery({
    queryKey: productPricesQueryKeys.current(productId ?? "", channelId ?? ""),
    queryFn: async () => {
      try {
        return await getCurrentProductPrice(
          productId as string,
          channelId as string
        );
      } catch (error) {
        if (isNotFoundError(error)) {
          return null;
        }

        throw error;
      }
    },
    enabled: Boolean(productId) && Boolean(channelId),
    retry: shouldRetryQuery,
  });
}
