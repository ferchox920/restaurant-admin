import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addSaleTicketItem, updateSaleTicketItem } from "@/features/sales/api/sale-ticket-items.api";
import { useAddSaleTicketItem } from "@/features/sales/hooks/use-add-sale-ticket-item";
import { useUpdateSaleTicketItem } from "@/features/sales/hooks/use-update-sale-ticket-item";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import type { SaleTicketDetail } from "@/features/sales/types/sale-ticket.types";

vi.mock("@/features/sales/api/sale-ticket-items.api", () => ({
  addSaleTicketItem: vi.fn(),
  updateSaleTicketItem: vi.fn(),
}));

const ticket = {
  id: "ticket-id",
  status: "DRAFT",
  salesChannelId: "channel-id",
  subtotal: "25.50",
  total: "25.50",
  createdAt: "2026-07-13T00:00:00.000Z",
  updatedAt: "2026-07-13T00:00:00.000Z",
  items: [{
    id: "item-id",
    ticketId: "ticket-id",
    productId: "product-id",
    quantity: "2.000",
    productNameSnapshot: "Producto historico",
    productSkuSnapshot: null,
    productUnitSnapshot: "UNIT",
    unitPriceSnapshot: "12.75",
    unitCostSnapshot: "7.00",
    subtotal: "25.50",
    createdAt: "2026-07-13T00:00:00.000Z",
    updatedAt: "2026-07-13T00:00:00.000Z",
  }],
} as SaleTicketDetail;

describe("sale ticket item cache", () => {
  let queryClient: QueryClient;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    vi.mocked(addSaleTicketItem).mockReset();
    vi.mocked(updateSaleTicketItem).mockReset();
  });

  it("replaces ticket detail with the add response", async () => {
    vi.mocked(addSaleTicketItem).mockResolvedValue(ticket);
    const { result } = renderHook(() => useAddSaleTicketItem("ticket-id"), { wrapper });

    await act(() => result.current.mutateAsync({ productId: "product-id", quantity: "2" }));

    expect(addSaleTicketItem).toHaveBeenCalledWith("ticket-id", { productId: "product-id", quantity: 2 });
    expect(queryClient.getQueryData(saleTicketsQueryKeys.detail("ticket-id"))).toBe(ticket);
  });

  it("replaces ticket detail with the quantity update response", async () => {
    vi.mocked(updateSaleTicketItem).mockResolvedValue(ticket);
    const { result } = renderHook(() => useUpdateSaleTicketItem("ticket-id"), { wrapper });

    await act(() => result.current.mutateAsync({ itemId: "item-id", data: { quantity: "2" } }));

    expect(updateSaleTicketItem).toHaveBeenCalledWith("ticket-id", "item-id", { quantity: 2 });
    expect(queryClient.getQueryData(saleTicketsQueryKeys.detail("ticket-id"))).toBe(ticket);
  });
});
