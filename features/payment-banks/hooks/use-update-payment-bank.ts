"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePaymentBank } from "@/features/payment-banks/api/payment-banks.api";
import { paymentBanksQueryKeys } from "@/features/payment-banks/query-keys";
import type { UpdatePaymentBankInput } from "@/features/payment-banks/types/payment-bank.types";

type UpdatePaymentBankPayload = {
  paymentBankId: string;
  data: UpdatePaymentBankInput;
};

export function useUpdatePaymentBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentBankId, data }: UpdatePaymentBankPayload) =>
      updatePaymentBank(paymentBankId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: paymentBanksQueryKeys.lists(),
      });
    },
  });
}

