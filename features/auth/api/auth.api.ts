import { apiClient } from "@/lib/api/api-client";
import type {
  AuthMeResponse,
  LoginRequest,
  LoginResponse,
} from "@/features/auth/types/auth.types";

export function login(payload: LoginRequest) {
  return apiClient.post<LoginResponse>("/api/auth/login", {
    ...payload,
    email: payload.email.trim().toLowerCase(),
  });
}

export function getCurrentUser() {
  return apiClient.get<AuthMeResponse>("/api/auth/me");
}
