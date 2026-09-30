"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllPaymentBanks,
  type PaymentBanksFilters,
} from "@/features/payment-banks/api/payment-banks.api";
import { paymentBanksQueryKeys } from "@/features/payment-banks/query-keys";
import {
  QUERY_STALE_TIME,
  type QueryActivationOptions,
} from "@/lib/query-client/query-policies";

export function useAllPaymentBanks(
  filters?: Omit<PaymentBanksFilters, "limit" | "offset">,
  options: QueryActivationOptions = {}
) {
  return useQuery({
    queryKey: [...paymentBanksQueryKeys.list(filters), "all-pages"],
    queryFn: ({ signal }) => getAllPaymentBanks(filters, signal),
    enabled: options.enabled,
    staleTime: QUERY_STALE_TIME.options,
  });
}
