import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/common/status-badge";
import { SaleTicketStatusBadge } from "@/features/sales/components/sale-ticket-status-badge";

describe("status badges", () => {
  it("renders default status labels", () => {
    render(<StatusBadge status="active" />);

    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("renders representative wrapper labels", () => {
    render(<SaleTicketStatusBadge status="VOIDED" />);

    expect(screen.getByText("Anulada")).toBeInTheDocument();
  });
});
