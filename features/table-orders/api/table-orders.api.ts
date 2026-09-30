import { commercialIntent } from "@/lib/api/commercial-intent";
import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  AddTableOrderItemInput,
  CancelTableOrderInput,
  CloseTableOrderInput,
  OpenTableOrderInput,
  TableOrder,
  TableOrderFilters,
  UpdateTableOrderItemInput,
} from "@/features/table-orders/types/table-order.types";
import { withDefaultPagination } from "@/lib/api/pagination";

export function openTableOrder(tableId: string, payload: OpenTableOrderInput) {
  return apiClient.post<TableOrder>(
    `/api/tables/${tableId}/orders/open`,
    payload
  );
}

export function getCurrentTableOrder(tableId: string) {
  return apiClient.getOrNullOnNotFound<TableOrder>(
    `/api/tables/${tableId}/orders/current`
  );
}

export function getTableOrders(
  filters?: TableOrderFilters,
  signal?: AbortSignal
) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    status: filters?.status,
    tableId: filters?.tableId,
    openedById: filters?.openedById,
    from: filters?.from,
    to: filters?.to,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<TableOrder[]>(`/api/table-orders${queryString}`, signal);
}

export function getTableOrder(orderId: string) {
  return apiClient.get<TableOrder>(`/api/table-orders/${orderId}`);
}

export function addTableOrderItem(
  orderId: string,
  payload: AddTableOrderItemInput
) {
  return apiClient.post<TableOrder>(
    `/api/table-orders/${orderId}/items`,
    payload
  );
}

export function updateTableOrderItem(
  orderId: string,
  itemId: string,
  payload: UpdateTableOrderItemInput
) {
  return apiClient.patch<TableOrder>(
    `/api/table-orders/${orderId}/items/${itemId}`,
    payload
  );
}

export function removeTableOrderItem(
  orderId: string,
  itemId: string,
  expectedVersion?: string
) {
  return apiClient.delete<TableOrder>(
    `/api/table-orders/${orderId}/items/${itemId}${expectedVersion ? `?expectedVersion=${encodeURIComponent(expectedVersion)}` : ""}`
  );
}

export function cancelTableOrder(
  orderId: string,
  payload: CancelTableOrderInput
) {
  return apiClient.post<TableOrder>(
    `/api/table-orders/${orderId}/cancel`,
    payload
  );
}

export function closeTableOrder(
  orderId: string,
  payload: CloseTableOrderInput
) {
  return commercialIntent(
    `/api/table-orders/${orderId}/close`,
    payload,
    (key) =>
      apiClient.post<TableOrder>(
        `/api/table-orders/${orderId}/close`,
        payload,
        { headers: { "Idempotency-Key": key } }
      )
  );
}
