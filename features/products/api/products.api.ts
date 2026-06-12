import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "@/features/products/types/product.types";

export type ProductsFilters = {
  active?: boolean;
  categoryId?: string;
  search?: string;
};

export function getProducts(filters?: ProductsFilters) {
  const queryString = buildQueryString({
    active: filters?.active,
    categoryId: filters?.categoryId,
    search: filters?.search,
  });

  return apiClient.get<Product[]>(`/api/products${queryString}`);
}

export function getProduct(productId: string) {
  return apiClient.get<Product>(`/api/products/${productId}`);
}

export function createProduct(payload: CreateProductInput) {
  return apiClient.post<Product>("/api/products", payload);
}

export function updateProduct(productId: string, payload: UpdateProductInput) {
  return apiClient.patch<Product>(`/api/products/${productId}`, payload);
}

export function deactivateProduct(productId: string) {
  return apiClient.patch<Product>(`/api/products/${productId}/deactivate`);
}

export function reactivateProduct(productId: string) {
  return apiClient.patch<Product>(`/api/products/${productId}/reactivate`);
}
