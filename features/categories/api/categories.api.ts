import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories/types/category.types";
import type { PaginationParams } from "@/types/common";
import { fetchAllPages, withDefaultPagination } from "@/lib/api/pagination";

export type CategoriesFilters = PaginationParams & {
  active?: boolean;
};

export function getCategories(filters?: CategoriesFilters, signal?: AbortSignal) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    active: filters?.active,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<Category[]>(`/api/categories${queryString}`, signal);
}

export function getAllCategories(
  filters?: Omit<CategoriesFilters, "limit" | "offset">,
  signal?: AbortSignal
) {
  return fetchAllPages(
    (pagination) => getCategories({ ...filters, ...pagination }, signal),
    signal
  );
}

export function createCategory(payload: CreateCategoryInput) {
  return apiClient.post<Category>("/api/categories", payload);
}

export function updateCategory(
  categoryId: string,
  payload: UpdateCategoryInput
) {
  return apiClient.patch<Category>(`/api/categories/${categoryId}`, payload);
}

export function deactivateCategory(categoryId: string) {
  return apiClient.patch<Category>(`/api/categories/${categoryId}/deactivate`);
}

export function reactivateCategory(categoryId: string) {
  return apiClient.patch<Category>(`/api/categories/${categoryId}/reactivate`);
}
