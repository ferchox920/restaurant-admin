import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "@/features/products/types/product.types";
import type { PaginationParams } from "@/types/common";
import { fetchAllPages, withDefaultPagination } from "@/lib/api/pagination";

export type ProductsFilters = PaginationParams & {
  active?: boolean;
  categoryId?: string;
  search?: string;
};

export function getProducts(filters?: ProductsFilters, signal?: AbortSignal) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    active: filters?.active,
    categoryId: filters?.categoryId,
    search: filters?.search,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<Product[]>(`/api/products${queryString}`, signal);
}

export function getAllProducts(
  filters?: Omit<ProductsFilters, "limit" | "offset">,
  signal?: AbortSignal
) {
  return fetchAllPages(
    (pagination) => getProducts({ ...filters, ...pagination }, signal),
    signal
  );
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
