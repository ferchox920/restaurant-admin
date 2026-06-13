import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SaleTicketCriticalActions } from "@/features/sales/components/sale-ticket-critical-actions";
import type { SaleTicketDetail } from "@/features/sales/types/sale-ticket.types";

vi.mock("@/features/sales/components/cancel-sale-ticket-dialog", () => ({
  CancelSaleTicketDialog: () => <div>cancel-action</div>,
}));

vi.mock("@/features/sales/components/confirm-sale-ticket-dialog", () => ({
  ConfirmSaleTicketDialog: () => <div>confirm-action</div>,
}));

vi.mock("@/features/sales/components/void-sale-ticket-dialog", () => ({
  VoidSaleTicketDialog: () => <div>void-action</div>,
}));

function buildTicket(status: SaleTicketDetail["status"]): SaleTicketDetail {
  return {
    id: "ticket-1",
    status,
    salesChannelId: "channel-1",
    subtotal: "10",
    total: "10",
    createdAt: "2026-06-12T00:00:00.000Z",
    updatedAt: "2026-06-12T00:00:00.000Z",
    items: [],
  };
}

describe("SaleTicketCriticalActions", () => {
  it("does not show void action to CASHIER-like permissions", () => {
    render(
      <SaleTicketCriticalActions
        ticket={buildTicket("CONFIRMED")}
        canMutateDraft={true}
        canMutateVoid={false}
        onCancel={() => undefined}
        onConfirm={() => undefined}
        onVoid={() => undefined}
      />
    );

    expect(screen.queryByText("void-action")).not.toBeInTheDocument();
  });

  it("does not show mutations to AUDITOR-like permissions", () => {
    const { container } = render(
      <SaleTicketCriticalActions
        ticket={buildTicket("DRAFT")}
        canMutateDraft={false}
        canMutateVoid={false}
        onCancel={() => undefined}
        onConfirm={() => undefined}
        onVoid={() => undefined}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows void action for ADMIN or MANAGER when ticket is confirmed", () => {
    render(
      <SaleTicketCriticalActions
        ticket={buildTicket("CONFIRMED")}
        canMutateDraft={false}
        canMutateVoid={true}
        onCancel={() => undefined}
        onConfirm={() => undefined}
        onVoid={() => undefined}
      />
    );

    expect(screen.getByText("void-action")).toBeInTheDocument();
  });
});
