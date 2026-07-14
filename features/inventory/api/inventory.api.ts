import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  InventoryFilters,
  InventoryMovement,
  InventoryMovementsFilters,
  InventoryStockItem,
  ProductInventoryDetail,
  ManualAdjustmentInput,
  ReturnInInput,
  StockInInput,
  UpdateMinimumStockInput,
  WasteInput,
} from "@/features/inventory/types/inventory.types";
import { fetchAllPages, withDefaultPagination } from "@/lib/api/pagination";

export function getInventory(filters?: InventoryFilters, signal?: AbortSignal) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    active: filters?.active,
    stockStatus: filters?.stockStatus,
    search: filters?.search,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<InventoryStockItem[]>(`/api/inventory${queryString}`, signal);
}

export function getAllInventory(
  filters?: Omit<InventoryFilters, "limit" | "offset">
) {
  return fetchAllPages((pagination) =>
    getInventory({ ...filters, ...pagination })
  );
}

export function getProductInventory(productId: string) {
  return apiClient.get<ProductInventoryDetail>(
    `/api/inventory/products/${productId}`
  );
}

export function getInventoryMovements(filters?: InventoryMovementsFilters, signal?: AbortSignal) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    productId: filters?.productId,
    movementType: filters?.movementType,
    from: filters?.from,
    to: filters?.to,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<InventoryMovement[]>(
    `/api/inventory/movements${queryString}`, signal
  );
}

export function getProductInventoryMovements(
  productId: string,
  filters?: Omit<InventoryMovementsFilters, "productId">,
  signal?: AbortSignal
) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    movementType: filters?.movementType,
    from: filters?.from,
    to: filters?.to,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<InventoryMovement[]>(
    `/api/inventory/products/${productId}/movements${queryString}`, signal
  );
}

export function stockIn(productId: string, payload: StockInInput) {
  return apiClient.post<InventoryMovement>(
    `/api/inventory/products/${productId}/stock-in`,
    payload
  );
}

export function manualAdjust(productId: string, payload: ManualAdjustmentInput) {
  return apiClient.post<InventoryMovement>(
    `/api/inventory/products/${productId}/adjust`,
    payload
  );
}

export function registerWaste(productId: string, payload: WasteInput) {
  return apiClient.post<InventoryMovement>(
    `/api/inventory/products/${productId}/waste`,
    payload
  );
}

export function returnIn(productId: string, payload: ReturnInInput) {
  return apiClient.post<InventoryMovement>(
    `/api/inventory/products/${productId}/return-in`,
    payload
  );
}

export function updateMinimumStock(
  productId: string,
  payload: UpdateMinimumStockInput
) {
  return apiClient.patch<ProductInventoryDetail>(
    `/api/inventory/products/${productId}/minimum-stock`,
    payload
  );
}
