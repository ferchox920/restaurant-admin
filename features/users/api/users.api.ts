import { apiClient } from "@/lib/api/api-client";
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserListItem,
} from "@/features/users/types/user.types";
import { buildQueryString } from "@/lib/api/build-query-string";
import { fetchAllPages, withDefaultPagination } from "@/lib/api/pagination";
import type { PaginationParams } from "@/types/common";

export function getUsers(pagination?: PaginationParams, signal?: AbortSignal) {
  const queryString = buildQueryString(withDefaultPagination(pagination));
  return apiClient.get<UserListItem[]>(`/api/users${queryString}`, signal);
}

export function getAllUsers(signal?: AbortSignal) {
  return fetchAllPages(
    (pagination) => getUsers(pagination, signal),
    signal
  );
}

export function getUser(userId: string) {
  return apiClient.get<User>(`/api/users/${userId}`);
}

export function createUser(payload: CreateUserInput) {
  return apiClient.post<User>("/api/users", { ...payload, email: payload.email.trim().toLowerCase() });
}

export function updateUser(userId: string, payload: UpdateUserInput) {
  return apiClient.patch<User>(`/api/users/${userId}`, {
    ...payload,
    email: payload.email?.trim().toLowerCase(),
  });
}

export function deactivateUser(userId: string) {
  return apiClient.patch<User>(`/api/users/${userId}/deactivate`);
}

export function reactivateUser(userId: string) {
  return apiClient.patch<User>(`/api/users/${userId}/reactivate`);
}
