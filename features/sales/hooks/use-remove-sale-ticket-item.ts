"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeSaleTicketItem } from "@/features/sales/api/sale-ticket-items.api";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";

export function useRemoveSaleTicketItem(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeSaleTicketItem(ticketId, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleTicketsQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: saleTicketsQueryKeys.detail(ticketId),
      });
    },
  });
}
