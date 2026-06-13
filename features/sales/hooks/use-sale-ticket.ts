"use client";

import { useQuery } from "@tanstack/react-query";
import { getSaleTicket } from "@/features/sales/api/sales.api";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useSaleTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: saleTicketsQueryKeys.detail(ticketId ?? ""),
    queryFn: () => getSaleTicket(ticketId as string),
    enabled: Boolean(ticketId),
    retry: shouldRetryQuery,
    staleTime: 15_000,
  });
}
