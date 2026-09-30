import { apiClient } from "@/lib/api/api-client";
import type {
  AddSaleTicketItemInput,
  SaleTicketDetail,
  UpdateSaleTicketItemInput,
} from "@/features/sales/types/sale-ticket.types";

export function addSaleTicketItem(
  ticketId: string,
  payload: AddSaleTicketItemInput
) {
  return apiClient.post<SaleTicketDetail>(
    `/api/sales/tickets/${ticketId}/items`,
    payload
  );
}

export function updateSaleTicketItem(
  ticketId: string,
  itemId: string,
  payload: UpdateSaleTicketItemInput
) {
  return apiClient.patch<SaleTicketDetail>(
    `/api/sales/tickets/${ticketId}/items/${itemId}`,
    payload
  );
}

export function removeSaleTicketItem(
  ticketId: string,
  itemId: string,
  expectedVersion?: string
) {
  return apiClient.delete<SaleTicketDetail>(
    `/api/sales/tickets/${ticketId}/items/${itemId}${expectedVersion ? `?expectedVersion=${encodeURIComponent(expectedVersion)}` : ""}`
  );
}
