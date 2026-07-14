import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CreateProductPriceInput,
  CreateProductPriceRequest,
  CurrentProductPrice,
  ProductPriceHistoryItem,
} from "@/features/products/prices/types/product-price.types";
import { toApiDecimalNumber } from "@/lib/money";
import { fetchAllPages, withDefaultPagination } from "@/lib/api/pagination";
import type { PaginationParams } from "@/types/common";

function toCreateProductPriceRequest(
  payload: CreateProductPriceInput
): CreateProductPriceRequest {
  return {
    salesChannelId: payload.salesChannelId,
    price: toApiDecimalNumber(payload.price),
  };
}

export function getProductPrices(productId: string, channelId?: string, pagination?: PaginationParams, signal?: AbortSignal) {
  const params = withDefaultPagination(pagination);
  const queryString = buildQueryString({ channelId, ...params });

  return apiClient.get<ProductPriceHistoryItem[]>(
    `/api/products/${productId}/prices${queryString}`, signal
  );
}

export function getAllProductPrices(productId: string, channelId?: string) {
  return fetchAllPages((pagination) => getProductPrices(productId, channelId, pagination));
}

export function getCurrentProductPrice(productId: string, channelId: string) {
  const queryString = buildQueryString({ channelId });

  return apiClient.getOrNullOnNotFound<CurrentProductPrice>(
    `/api/products/${productId}/prices/current${queryString}`
  );
}

export function createProductPrice(
  productId: string,
  payload: CreateProductPriceInput
) {
  return apiClient.post<CurrentProductPrice>(
    `/api/products/${productId}/prices`,
    toCreateProductPriceRequest(payload)
  );
}
