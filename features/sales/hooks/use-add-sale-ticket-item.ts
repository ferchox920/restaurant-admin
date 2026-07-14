"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSaleTicketItem } from "@/features/sales/api/sale-ticket-items.api";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import type { AddSaleTicketItemFormValues } from "@/features/sales/types/sale-ticket.types";
import { toApiQuantityNumber } from "@/lib/quantity";

export function useAddSaleTicketItem(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddSaleTicketItemFormValues) =>
      addSaleTicketItem(ticketId, {
        productId: payload.productId,
        quantity: toApiQuantityNumber(payload.quantity),
      }),
    onSuccess: (ticket) => {
      queryClient.setQueryData(saleTicketsQueryKeys.detail(ticketId), ticket);
      void queryClient.invalidateQueries({ queryKey: saleTicketsQueryKeys.lists() });
    },
  });
}
