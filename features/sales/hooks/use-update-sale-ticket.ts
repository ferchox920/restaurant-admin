"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSaleTicket } from "@/features/sales/api/sales.api";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import type { UpdateSaleTicketFormValues } from "@/features/sales/types/sale-ticket.types";

type UpdateSaleTicketPayload = {
  ticketId: string;
  data: UpdateSaleTicketFormValues;
};

export function useUpdateSaleTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, data }: UpdateSaleTicketPayload) =>
      updateSaleTicket(ticketId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: saleTicketsQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: saleTicketsQueryKeys.detail(variables.ticketId),
      });
    },
  });
}
