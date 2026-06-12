"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductPrices } from "@/features/products/prices/api/product-prices.api";
import { productPricesQueryKeys } from "@/features/products/prices/query-keys";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useProductPrices(
  productId: string | undefined,
  channelId?: string
) {
  return useQuery({
    queryKey: productPricesQueryKeys.history(productId ?? "", channelId),
    queryFn: () => getProductPrices(productId as string, channelId),
    enabled: Boolean(productId),
    retry: shouldRetryQuery,
  });
}
