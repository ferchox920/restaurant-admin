"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllPaymentBanks, type PaymentBanksFilters } from "@/features/payment-banks/api/payment-banks.api";
import { paymentBanksQueryKeys } from "@/features/payment-banks/query-keys";

export function useAllPaymentBanks(filters?: Omit<PaymentBanksFilters, "limit" | "offset">) {
  return useQuery({
    queryKey: [...paymentBanksQueryKeys.list(filters), "all-pages"],
    queryFn: () => getAllPaymentBanks(filters),
  });
}
