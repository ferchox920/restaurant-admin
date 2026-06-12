"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivateProduct } from "@/features/products/api/products.api";
import { productsQueryKeys } from "@/features/products/query-keys";

export function useReactivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateProduct,
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
