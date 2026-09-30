"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSaleTicket } from "@/features/sales/api/sales.api";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import type { CreateSaleTicketFormValues } from "@/features/sales/types/sale-ticket.types";

export function useCreateSaleTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSaleTicketFormValues) =>
      createSaleTicket(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: saleTicketsQueryKeys.lists(),
      });
    },
  });
}
