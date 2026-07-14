"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelSaleTicket } from "@/features/sales/api/sales.api";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import type { CancelSaleTicketInput } from "@/features/sales/types/sale-ticket.types";

export function useCancelSaleTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelSaleTicketInput) => cancelSaleTicket(ticketId, payload),
    onSuccess: (ticket) => {
      queryClient.setQueryData(saleTicketsQueryKeys.detail(ticketId), ticket);
      void queryClient.invalidateQueries({ queryKey: saleTicketsQueryKeys.lists() });
    },
  });
}
