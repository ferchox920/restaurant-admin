"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/features/auth/api/auth.api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import type {
  AuthenticatedUser,
  LoginResponse,
} from "@/features/auth/types/auth.types";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from "@/lib/auth/token-storage";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginResponse) => Promise<void>;
  logout: () => void;
  clearSession: () => void;
  refreshCurrentUser: () => Promise<AuthenticatedUser | null>;
  authErrorStatus: number | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = useSyncExternalStore(
    subscribeToAccessToken,
    getAccessToken,
    () => null
  );

  const currentUserQuery = useCurrentUser({
    enabled: Boolean(token),
  });

  const authErrorStatus =
    currentUserQuery.error && isApiError(currentUserQuery.error)
      ? currentUserQuery.error.statusCode ?? null
      : null;

  const user = (currentUserQuery.data ?? null) as AuthenticatedUser | null;

  useEffect(() => {
    if (authErrorStatus === HTTP_STATUS.unauthorized) {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: ["auth"] });
    }
  }, [authErrorStatus, queryClient]);

  const clearSession = useCallback(() => {
    clearAccessToken();
    queryClient.removeQueries({ queryKey: ["auth"] });
  }, [queryClient]);

  const refreshCurrentUser = useCallback(async () => {
    if (!getAccessToken()) {
      queryClient.removeQueries({ queryKey: ["auth"] });
      return null;
    }

    const nextUser = await queryClient.fetchQuery({
      queryKey: ["auth", "me"],
      queryFn: getCurrentUser,
    });

    return nextUser;
  }, [queryClient]);

  const login = useCallback(
    async (payload: LoginResponse) => {
      setAccessToken(payload.accessToken);
      if (payload.user) {
        queryClient.setQueryData(["auth", "me"], payload.user);
        return;
      }

      await refreshCurrentUser();
    },
    [queryClient, refreshCurrentUser]
  );

  const logout = useCallback(() => {
    clearSession();
    router.replace("/login");
  }, [clearSession, router]);

  const status: AuthStatus = useMemo(() => {
    if (!token) {
      return "unauthenticated";
    }

    if (currentUserQuery.isLoading) {
      return "loading";
    }

    if (authErrorStatus === HTTP_STATUS.forbidden) {
      return "authenticated";
    }

    return user ? "authenticated" : "unauthenticated";
  }, [authErrorStatus, currentUserQuery.isLoading, token, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      login,
      logout,
      clearSession,
      refreshCurrentUser,
      authErrorStatus,
    }),
    [
      authErrorStatus,
      clearSession,
      login,
      logout,
      refreshCurrentUser,
      status,
      token,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
