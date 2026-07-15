"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSaleTicketItem } from "@/features/sales/api/sale-ticket-items.api";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import type { UpdateSaleTicketItemFormValues } from "@/features/sales/types/sale-ticket.types";
import { toApiQuantityNumber } from "@/lib/quantity";

type UpdateSaleTicketItemPayload = {
  itemId: string;
  data: UpdateSaleTicketItemFormValues;
};

export function useUpdateSaleTicketItem(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: UpdateSaleTicketItemPayload) =>
      updateSaleTicketItem(ticketId, itemId, {
        quantity: toApiQuantityNumber(data.quantity),
        ...(data.expectedVersion ? { expectedVersion: data.expectedVersion } : {}),
      }),
    onSuccess: (ticket) => {
      queryClient.setQueryData(saleTicketsQueryKeys.detail(ticketId), ticket);
      void queryClient.invalidateQueries({
        queryKey: saleTicketsQueryKeys.lists(),
        refetchType: "none",
      });
    },
  });
}
