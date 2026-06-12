"use client";

import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/features/products/api/products.api";
import { productsQueryKeys } from "@/features/products/query-keys";

type UseProductOptions = {
  enabled?: boolean;
};

export function useProduct(
  productId: string | undefined,
  options: UseProductOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: productsQueryKeys.detail(productId ?? ""),
    queryFn: () => getProduct(productId as string),
    enabled: enabled && Boolean(productId),
  });
}
