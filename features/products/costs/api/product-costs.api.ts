import { apiClient } from "@/lib/api/api-client";
import type {
  CreateProductCostInput,
  CreateProductCostRequest,
  CurrentProductCost,
  ProductCostHistoryItem,
} from "@/features/products/costs/types/product-cost.types";

function toCreateProductCostRequest(
  payload: CreateProductCostInput
): CreateProductCostRequest {
  return {
    cost: Number(payload.cost),
  };
}

export function getProductCosts(productId: string) {
  return apiClient.get<ProductCostHistoryItem[]>(`/api/products/${productId}/costs`);
}

export function getCurrentProductCost(productId: string) {
  return apiClient.get<CurrentProductCost>(
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
