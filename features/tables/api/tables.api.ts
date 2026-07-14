import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CreateTableInput,
  RestaurantTable,
  TableFilters,
  UpdateTableInput,
} from "@/features/tables/types/table.types";
import { fetchAllPages, withDefaultPagination } from "@/lib/api/pagination";

export function getTables(filters?: TableFilters, signal?: AbortSignal) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    active: filters?.active,
    area: filters?.area,
    search: filters?.search,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<RestaurantTable[]>(`/api/tables${queryString}`, signal);
}

export function getAllTables(filters?: Omit<TableFilters, "limit" | "offset">) {
  return fetchAllPages((pagination) => getTables({ ...filters, ...pagination }));
}

export function getTable(tableId: string) {
  return apiClient.get<RestaurantTable>(`/api/tables/${tableId}`);
}

export function createTable(payload: CreateTableInput) {
  return apiClient.post<RestaurantTable>("/api/tables", payload);
}

export function updateTable(tableId: string, payload: UpdateTableInput) {
  return apiClient.patch<RestaurantTable>(`/api/tables/${tableId}`, payload);
}

export function deactivateTable(tableId: string) {
  return apiClient.patch<RestaurantTable>(`/api/tables/${tableId}/deactivate`);
}

export function reactivateTable(tableId: string) {
  return apiClient.patch<RestaurantTable>(`/api/tables/${tableId}/reactivate`);
}
