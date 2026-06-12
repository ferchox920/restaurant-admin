import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories/types/category.types";

export type CategoriesFilters = {
  active?: boolean;
};

export function getCategories(filters?: CategoriesFilters) {
  const queryString = buildQueryString({
    active: filters?.active,
  });

  return apiClient.get<Category[]>(`/api/categories${queryString}`);
}

export function getCategory(categoryId: string) {
  return apiClient.get<Category>(`/api/categories/${categoryId}`);
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
