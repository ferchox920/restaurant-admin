"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateProduct } from "@/features/products/api/products.api";
import { productsQueryKeys } from "@/features/products/query-keys";

export function useDeactivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateProduct,
    onSuccess: (_, productId) => {
      void queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId),
      });
    },
  });
}
