import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CreateProductPriceInput,
  CreateProductPriceRequest,
  CurrentProductPrice,
  ProductPriceHistoryItem,
} from "@/features/products/prices/types/product-price.types";

function toCreateProductPriceRequest(
  payload: CreateProductPriceInput
): CreateProductPriceRequest {
  return {
    salesChannelId: payload.salesChannelId,
    price: Number(payload.price),
  };
}

export function getProductPrices(productId: string, channelId?: string) {
  const queryString = buildQueryString({ channelId });

  return apiClient.get<ProductPriceHistoryItem[]>(
    `/api/products/${productId}/prices${queryString}`
  );
}

export function getCurrentProductPrice(productId: string, channelId: string) {
  const queryString = buildQueryString({ channelId });

  return apiClient.get<CurrentProductPrice>(
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
