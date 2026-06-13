import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoleGuard } from "@/components/auth/role-guard";

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

describe("RoleGuard", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUseAuth.mockReset();
  });

  it("renders children for an allowed role", () => {
    mockUseAuth.mockReturnValue({
      user: { role: "AUDITOR" },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <RoleGuard>
        <div>Contenido permitido</div>
      </RoleGuard>
    );

    expect(screen.getByText("Contenido permitido")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("blocks and redirects when the role cannot access the route", async () => {
    mockUseAuth.mockReturnValue({
      user: { role: "CASHIER" },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <RoleGuard>
        <div>Contenido restringido</div>
      </RoleGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/forbidden");
    });
    expect(screen.queryByText("Contenido restringido")).not.toBeInTheDocument();
  });
});
