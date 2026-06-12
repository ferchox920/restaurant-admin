"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductCost } from "@/features/products/costs/api/product-costs.api";
import { productCostsQueryKeys } from "@/features/products/costs/query-keys";
import { productsQueryKeys } from "@/features/products/query-keys";
import type { CreateProductCostInput } from "@/features/products/costs/types/product-cost.types";

export function useCreateProductCost(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductCostInput) =>
      createProductCost(productId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productCostsQueryKeys.history(productId),
      });
      void queryClient.invalidateQueries({
        queryKey: productCostsQueryKeys.current(productId),
      });
      void queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId),
      });
    },
  });
}
