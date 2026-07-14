"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPaymentBanks,
  type PaymentBanksFilters,
} from "@/features/payment-banks/api/payment-banks.api";
import { paymentBanksQueryKeys } from "@/features/payment-banks/query-keys";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function usePaymentBanks(filters?: PaymentBanksFilters) {
  return useQuery({
    queryKey: paymentBanksQueryKeys.list(filters),
    queryFn: ({ signal }) => getPaymentBanks(filters, signal),
    retry: shouldRetryQuery,
    staleTime: 60_000,
  });
}
