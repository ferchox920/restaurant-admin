"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductPrice } from "@/features/products/prices/api/product-prices.api";
import { productPricesQueryKeys } from "@/features/products/prices/query-keys";
import { productsQueryKeys } from "@/features/products/query-keys";
import type { CreateProductPriceInput } from "@/features/products/prices/types/product-price.types";

export function useCreateProductPrice(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPriceInput) =>
      createProductPrice(productId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: productPricesQueryKeys.history(productId),
      });
      void queryClient.invalidateQueries({
        queryKey: productPricesQueryKeys.history(productId, variables.salesChannelId),
      });
      void queryClient.invalidateQueries({
        queryKey: productPricesQueryKeys.current(productId, variables.salesChannelId),
      });
      void queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId),
      });
    },
  });
}
