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
      const staleKeys = [
        saleTicketsQueryKeys.lists(),
        inventoryQueryKeys.lists(),
        inventoryQueryKeys.details(),
        inventoryQueryKeys.movements(),
        inventoryQueryKeys.productMovements(),
      ];
      staleKeys.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey, refetchType: "none" });
      });
    },
  });
}
