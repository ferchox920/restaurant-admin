"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductPrices } from "@/features/products/prices/api/product-prices.api";
import { productPricesQueryKeys } from "@/features/products/prices/query-keys";
import { shouldRetryQuery } from "@/lib/api/query-utils";
import type { PaginationParams } from "@/types/common";

export function useProductPrices(
  productId: string | undefined,
  channelId?: string,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: [...productPricesQueryKeys.history(productId ?? "", channelId), pagination ?? {}],
    queryFn: ({ signal }) => getProductPrices(productId as string, channelId, pagination, signal),
    enabled: Boolean(productId),
    retry: shouldRetryQuery,
  });
}
