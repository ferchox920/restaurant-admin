"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllProductPrices } from "@/features/products/prices/api/product-prices.api";
import { productPricesQueryKeys } from "@/features/products/prices/query-keys";

export function useAllProductPrices(productId: string | undefined, channelId?: string) {
  return useQuery({
    queryKey: [...productPricesQueryKeys.history(productId ?? "", channelId), "all-pages"],
    queryFn: () => getAllProductPrices(productId as string, channelId),
    enabled: Boolean(productId),
  });
}
