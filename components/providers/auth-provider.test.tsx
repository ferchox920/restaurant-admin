import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api/api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

const mockReplace = vi.fn();
const mockClearAccessToken = vi.fn();
const mockGetAccessToken = vi.fn();
const mockSetAccessToken = vi.fn();
const mockSubscribeToAccessToken = vi.fn((onStoreChange?: () => void) => {
  void onStoreChange;
  return () => undefined;
});
const mockUseCurrentUser = vi.fn<(options?: unknown) => unknown>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock("@/features/auth/hooks/use-current-user", () => ({
  useCurrentUser: (options?: unknown) => mockUseCurrentUser(options),
}));

vi.mock("@/lib/auth/token-storage", () => ({
  clearAccessToken: () => mockClearAccessToken(),
  getAccessToken: () => mockGetAccessToken(),
  setAccessToken: (token: string) => mockSetAccessToken(token),
  subscribeToAccessToken: (onStoreChange: () => void) =>
    mockSubscribeToAccessToken(onStoreChange),
}));

function AuthProbe() {
  const auth = useAuth();

  return (
    <div>
      <span data-testid="is-authenticated">
        {String(auth.isAuthenticated)}
      </span>
      <span data-testid="is-loading">{String(auth.isLoading)}</span>
      <span data-testid="auth-error-status">{String(auth.authErrorStatus)}</span>
    </div>
  );
}

function renderAuthProvider() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockClearAccessToken.mockReset();
    mockGetAccessToken.mockReset();
    mockSetAccessToken.mockReset();
    mockSubscribeToAccessToken.mockClear();
    mockUseCurrentUser.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("clears the session when current user returns 401", async () => {
    mockGetAccessToken.mockReturnValue("token");
    mockUseCurrentUser.mockReturnValue({
      data: null,
      error: new ApiError({
        statusCode: HTTP_STATUS.unauthorized,
        message: "unauthorized",
      }),
      isLoading: false,
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(mockClearAccessToken).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("auth-error-status")).toHaveTextContent("401");
  });

  it("keeps authentication state available when current user returns 403", () => {
    mockGetAccessToken.mockReturnValue("token");
    mockUseCurrentUser.mockReturnValue({
      data: null,
      error: new ApiError({
        statusCode: HTTP_STATUS.forbidden,
        message: "forbidden",
      }),
      isLoading: false,
    });

    renderAuthProvider();

    expect(mockClearAccessToken).not.toHaveBeenCalled();
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("auth-error-status")).toHaveTextContent("403");
  });
});
