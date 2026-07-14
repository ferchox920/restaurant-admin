import { apiClient } from "@/lib/api/api-client";
import type {
  CreateProductCostInput,
  CreateProductCostRequest,
  CurrentProductCost,
  ProductCostHistoryItem,
} from "@/features/products/costs/types/product-cost.types";
import { toApiDecimalNumber } from "@/lib/money";
import { buildQueryString } from "@/lib/api/build-query-string";
import { withDefaultPagination } from "@/lib/api/pagination";
import type { PaginationParams } from "@/types/common";

function toCreateProductCostRequest(
  payload: CreateProductCostInput
): CreateProductCostRequest {
  return {
    cost: toApiDecimalNumber(payload.cost),
  };
}

export function getProductCosts(productId: string, pagination?: PaginationParams, signal?: AbortSignal) {
  const params = withDefaultPagination(pagination);
  const queryString = buildQueryString(params);
  return apiClient.get<ProductCostHistoryItem[]>(`/api/products/${productId}/costs${queryString}`, signal);
}

export function getCurrentProductCost(productId: string) {
  return apiClient.getOrNullOnNotFound<CurrentProductCost>(
    `/api/products/${productId}/costs/current`
  );
}

export function createProductCost(
  productId: string,
  payload: CreateProductCostInput
) {
  return apiClient.post<CurrentProductCost>(
    `/api/products/${productId}/costs`,
    toCreateProductCostRequest(payload)
  );
}
