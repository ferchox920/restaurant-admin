import { apiClient } from "@/lib/api/api-client";
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserListItem,
} from "@/features/users/types/user.types";

export function getUsers() {
  return apiClient.get<UserListItem[]>("/api/users");
}

export function getUser(userId: string) {
  return apiClient.get<User>(`/api/users/${userId}`);
}

export function createUser(payload: CreateUserInput) {
  return apiClient.post<User>("/api/users", payload);
}

export function updateUser(userId: string, payload: UpdateUserInput) {
  return apiClient.patch<User>(`/api/users/${userId}`, payload);
}

export function deactivateUser(userId: string) {
  return apiClient.patch<User>(`/api/users/${userId}/deactivate`);
}

export function reactivateUser(userId: string) {
  return apiClient.patch<User>(`/api/users/${userId}/reactivate`);
}
