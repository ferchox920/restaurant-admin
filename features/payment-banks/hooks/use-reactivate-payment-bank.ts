"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivatePaymentBank } from "@/features/payment-banks/api/payment-banks.api";
import { paymentBanksQueryKeys } from "@/features/payment-banks/query-keys";

export function useReactivatePaymentBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivatePaymentBank,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: paymentBanksQueryKeys.lists(),
      });
    },
  });
}
