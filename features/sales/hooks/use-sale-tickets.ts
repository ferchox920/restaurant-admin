"use client";

import { useQuery } from "@tanstack/react-query";
import { getSaleTickets } from "@/features/sales/api/sales.api";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import type { SaleTicketFilters } from "@/features/sales/types/sale-ticket.types";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useSaleTickets(filters?: SaleTicketFilters, enabled = true) {
  return useQuery({
    queryKey: saleTicketsQueryKeys.list(filters),
    queryFn: ({ signal }) => getSaleTickets(filters, signal),
    retry: shouldRetryQuery,
    staleTime: 15_000,
    enabled,
  });
}
