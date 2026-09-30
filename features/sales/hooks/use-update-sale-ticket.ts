"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSaleTicket } from "@/features/sales/api/sales.api";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import type { UpdateSaleTicketInput } from "@/features/sales/types/sale-ticket.types";

type UpdateSaleTicketPayload = {
  ticketId: string;
  data: UpdateSaleTicketInput;
};

export function useUpdateSaleTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, data }: UpdateSaleTicketPayload) =>
      updateSaleTicket(ticketId, data),
    onSuccess: (ticket, variables) => {
      queryClient.setQueryData(
        saleTicketsQueryKeys.detail(variables.ticketId),
        ticket
      );
      void queryClient.invalidateQueries({
        queryKey: saleTicketsQueryKeys.lists(),
      });
    },
  });
}
