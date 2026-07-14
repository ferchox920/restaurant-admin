"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivatePaymentBank } from "@/features/payment-banks/api/payment-banks.api";
import { paymentBanksQueryKeys } from "@/features/payment-banks/query-keys";

export function useDeactivatePaymentBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivatePaymentBank,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: paymentBanksQueryKeys.lists(),
      });
    },
  });
}

