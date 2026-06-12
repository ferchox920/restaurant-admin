"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/features/products/api/products.api";
import { productsQueryKeys } from "@/features/products/query-keys";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists(),
      });
    },
  });
}
