import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrivateRoute } from "@/components/auth/private-route";

const mockReplace = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => "/reports",
}));

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("PrivateRoute", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUseAuth.mockReset();
  });

  it("redirects to login with next param when session is missing", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      authErrorStatus: null,
    });

    render(
      <PrivateRoute>
        <div>Contenido privado</div>
      </PrivateRoute>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login?next=%2Freports");
    });
    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
  });
});
