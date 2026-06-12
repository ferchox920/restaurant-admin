"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentProductPrice } from "@/features/products/prices/api/product-prices.api";
import { productPricesQueryKeys } from "@/features/products/prices/query-keys";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useCurrentProductPrice(
  productId: string | undefined,
  channelId: string | undefined
) {
  return useQuery({
    queryKey: productPricesQueryKeys.current(productId ?? "", channelId ?? ""),
    queryFn: () => getCurrentProductPrice(productId as string, channelId as string),
    enabled: Boolean(productId) && Boolean(channelId),
    retry: shouldRetryQuery,
  });
}
