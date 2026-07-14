import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CancelSaleTicketInput,
  ConfirmSaleTicketInput,
  CreateSaleTicketInput,
  SaleTicketDetail,
  SaleTicketFilters,
  SaleTicketListItem,
  UpdateSaleTicketInput,
  VoidSaleTicketInput,
} from "@/features/sales/types/sale-ticket.types";
import { withDefaultPagination } from "@/lib/api/pagination";

export function getSaleTickets(filters?: SaleTicketFilters, signal?: AbortSignal) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    status: filters?.status,
    salesChannelId: filters?.channelId,
    createdById: filters?.createdById,
    from: filters?.from,
    to: filters?.to,
    search: filters?.search,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<SaleTicketListItem[]>(`/api/sales/tickets${queryString}`, signal);
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

export function confirmSaleTicket(
  ticketId: string,
  payload: ConfirmSaleTicketInput
) {
  return apiClient.post<SaleTicketDetail>(
    `/api/sales/tickets/${ticketId}/confirm`,
    payload
  );
}

export function voidSaleTicket(ticketId: string, payload: VoidSaleTicketInput) {
  return apiClient.post<SaleTicketDetail>(`/api/sales/tickets/${ticketId}/void`, payload);
}
