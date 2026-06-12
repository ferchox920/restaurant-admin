"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "@/features/products/api/products.api";
import { productsQueryKeys } from "@/features/products/query-keys";
import type { UpdateProductInput } from "@/features/products/types/product.types";

type UpdateProductPayload = {
  productId: string;
  data: UpdateProductInput;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: UpdateProductPayload) =>
      updateProduct(productId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(variables.productId),
      });
    },
  });
}
