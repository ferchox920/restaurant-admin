import { apiClient } from "@/lib/api/api-client";
import type {
  MercadoPagoCardPaymentInput,
  MercadoPagoOrder,
} from "@/features/mercado-pago/types/mercado-pago-order.types";

export function createMercadoPagoOrder(
  ticketId: string,
  payload: MercadoPagoCardPaymentInput,
  idempotencyKey: string,
) {
  return apiClient.post<MercadoPagoOrder>(
    `/api/integrations/mercado-pago/tickets/${ticketId}/orders`,
    payload,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
}

export function getMercadoPagoOrders(ticketId: string, signal?: AbortSignal) {
  return apiClient.get<MercadoPagoOrder[]>(
    `/api/integrations/mercado-pago/tickets/${ticketId}/orders`,
    signal,
  );
}

export function refreshMercadoPagoOrder(orderId: string) {
  return apiClient.post<MercadoPagoOrder>(
    `/api/integrations/mercado-pago/orders/${orderId}/refresh`,
  );
}
