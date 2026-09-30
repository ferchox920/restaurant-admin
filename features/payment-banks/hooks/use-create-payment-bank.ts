"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentBank } from "@/features/payment-banks/api/payment-banks.api";
import { paymentBanksQueryKeys } from "@/features/payment-banks/query-keys";

export function useCreatePaymentBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentBank,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: paymentBanksQueryKeys.lists(),
      });
    },
  });
}
