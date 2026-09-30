import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./auth-provider";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  replace: vi.fn(),
}));
vi.mock("@/lib/env", () => ({ sessionMode: "cookie", realtimeEnabled: false }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock("@/features/auth/api/auth.api", () => ({
  getCurrentUser: mocks.getCurrentUser,
  logout: mocks.logout,
}));

function Probe() {
  const auth = useAuth();
  return (
    <>
      <span>{auth.isAuthenticated ? "authenticated" : "anonymous"}</span>
      <button onClick={() => void auth.logout()}>logout</button>
    </>
  );
}
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it.each(["expiry", "logout"])(
  "disables cookie queries after %s instead of recreating the expired session",
  async (reason) => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "fixture",
      email: "fixture@example.com",
      firstName: "Fixture",
      lastName: "Test",
      role: "ADMIN",
      active: true,
    });
    mocks.logout.mockResolvedValue(undefined);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </QueryClientProvider>
    );
    await screen.findByText("authenticated");
    if (reason === "expiry")
      window.dispatchEvent(new Event("restaurant:session-expired"));
    else fireEvent.click(screen.getByRole("button", { name: "logout" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    await client.invalidateQueries();
    expect(mocks.getCurrentUser).toHaveBeenCalledOnce();
    expect(screen.getByText("anonymous")).toBeInTheDocument();
  }
);
