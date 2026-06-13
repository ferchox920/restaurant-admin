import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ForbiddenState } from "@/components/feedback/forbidden-state";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe("ForbiddenState", () => {
  it("renders the expected title, message and call to action", () => {
    render(
      <ForbiddenState
        title="Sin permiso"
        message="No puedes ingresar aqui."
        actionHref="/dashboard"
        actionLabel="Volver"
      />
    );

    expect(screen.getByText("Sin permiso")).toBeInTheDocument();
    expect(screen.getByText("No puedes ingresar aqui.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver" })).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });
});
