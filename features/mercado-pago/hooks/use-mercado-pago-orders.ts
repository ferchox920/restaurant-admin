"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMercadoPagoOrder,
  getMercadoPagoOrders,
  refreshMercadoPagoOrder,
} from "@/features/mercado-pago/api/mercado-pago-orders.api";
import { mercadoPagoOrderQueryKeys } from "@/features/mercado-pago/query-keys";
import type { MercadoPagoCardPaymentInput } from "@/features/mercado-pago/types/mercado-pago-order.types";
import type { MercadoPagoOrder } from "@/features/mercado-pago/types/mercado-pago-order.types";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import { shouldRetryQuery } from "@/lib/api/query-utils";

function invalidateCheckoutData(
  queryClient: ReturnType<typeof useQueryClient>,
  ticketId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: saleTicketsQueryKeys.detail(ticketId),
  });
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
}

export function useMercadoPagoOrders(ticketId: string, enabled: boolean) {
  return useQuery({
    queryKey: mercadoPagoOrderQueryKeys.ticket(ticketId),
    queryFn: ({ signal }) => getMercadoPagoOrders(ticketId, signal),
    enabled,
    retry: shouldRetryQuery,
  });
}

export function useCreateMercadoPagoOrder(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: MercadoPagoCardPaymentInput;
      idempotencyKey: string;
    }) => createMercadoPagoOrder(ticketId, payload, idempotencyKey),
    onSuccess: (order) => {
      queryClient.setQueryData(
        mercadoPagoOrderQueryKeys.ticket(ticketId),
        (current: MercadoPagoOrder[] | undefined) => [
          order,
          ...(current ?? []).filter((candidate) => candidate.id !== order.id),
        ],
      );
      invalidateCheckoutData(queryClient, ticketId);
    },
  });
}

export function useRefreshMercadoPagoOrder(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshMercadoPagoOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(
        mercadoPagoOrderQueryKeys.ticket(ticketId),
        (current: MercadoPagoOrder[] | undefined) =>
          (current ?? []).map((candidate) =>
            candidate.id === order.id ? order : candidate,
          ),
      );
      invalidateCheckoutData(queryClient, ticketId);
    },
  });
}
