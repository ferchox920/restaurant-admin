"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmSaleTicket } from "@/features/sales/api/sales.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import type { ConfirmSaleTicketInput } from "@/features/sales/types/sale-ticket.types";

export function useConfirmSaleTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfirmSaleTicketInput) =>
      confirmSaleTicket(ticketId, payload),
    onSuccess: (ticket) => {
      queryClient.setQueryData(saleTicketsQueryKeys.detail(ticketId), ticket);
      void queryClient.invalidateQueries({ queryKey: saleTicketsQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.details() });
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.movements() });
      void queryClient.invalidateQueries({
        queryKey: inventoryQueryKeys.productMovements(),
      });
    },
  });
}
