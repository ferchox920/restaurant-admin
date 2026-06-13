import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CancelSaleTicketInput,
  CreateSaleTicketInput,
  SaleTicketDetail,
  SaleTicketFilters,
  SaleTicketListItem,
  UpdateSaleTicketInput,
  VoidSaleTicketInput,
} from "@/features/sales/types/sale-ticket.types";

export function getSaleTickets(filters?: SaleTicketFilters) {
  const queryString = buildQueryString({
    status: filters?.status,
    channelId: filters?.channelId,
    createdById: filters?.createdById,
    from: filters?.from,
    to: filters?.to,
  });

  return apiClient.get<SaleTicketListItem[]>(`/api/sales/tickets${queryString}`);
}

export function getSaleTicket(ticketId: string) {
  return apiClient.get<SaleTicketDetail>(`/api/sales/tickets/${ticketId}`);
}

export function createSaleTicket(payload: CreateSaleTicketInput) {
  return apiClient.post<SaleTicketDetail>("/api/sales/tickets", payload);
}

export function updateSaleTicket(ticketId: string, payload: UpdateSaleTicketInput) {
  return apiClient.patch<SaleTicketDetail>(`/api/sales/tickets/${ticketId}`, payload);
}

export function cancelSaleTicket(ticketId: string, payload: CancelSaleTicketInput) {
  return apiClient.post<SaleTicketDetail>(`/api/sales/tickets/${ticketId}/cancel`, payload);
}

export function confirmSaleTicket(ticketId: string) {
  return apiClient.post<SaleTicketDetail>(`/api/sales/tickets/${ticketId}/confirm`);
}

export function voidSaleTicket(ticketId: string, payload: VoidSaleTicketInput) {
  return apiClient.post<SaleTicketDetail>(`/api/sales/tickets/${ticketId}/void`, payload);
}
