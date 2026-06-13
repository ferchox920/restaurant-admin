"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmSaleTicket } from "@/features/sales/api/sales.api";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";

export function useConfirmSaleTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => confirmSaleTicket(ticketId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleTicketsQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: saleTicketsQueryKeys.detail(ticketId),
      });
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.details() });
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.movements() });
      void queryClient.invalidateQueries({
        queryKey: inventoryQueryKeys.productMovements(),
      });
    },
  });
}
