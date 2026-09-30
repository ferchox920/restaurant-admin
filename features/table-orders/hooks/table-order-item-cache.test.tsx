import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateTableOrderItem } from "@/features/table-orders/api/table-orders.api";
import { useUpdateTableOrderItem } from "@/features/table-orders/hooks/use-update-table-order-item";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import type { TableOrder } from "@/features/table-orders/types/table-order.types";

vi.mock("@/features/table-orders/api/table-orders.api", () => ({
  updateTableOrderItem: vi.fn(),
}));

describe("table order item cache", () => {
  let queryClient: QueryClient;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    vi.mocked(updateTableOrderItem).mockReset();
  });

  it("stores the mutation response without refetching the order detail", async () => {
    const order = { id: "order-id", status: "OPEN" } as TableOrder;
    vi.mocked(updateTableOrderItem).mockResolvedValue(order);
    queryClient.setQueryData(tableOrdersQueryKeys.list(), []);
    const { result } = renderHook(() => useUpdateTableOrderItem("order-id"), {
      wrapper,
    });

    await act(() =>
      result.current.mutateAsync({
        itemId: "item-id",
        data: { quantity: "2" },
      })
    );

    expect(updateTableOrderItem).toHaveBeenCalledTimes(1);
    expect(
      queryClient.getQueryData(tableOrdersQueryKeys.detail("order-id"))
    ).toBe(order);
    expect(
      queryClient.getQueryState(tableOrdersQueryKeys.list())?.isInvalidated
    ).toBe(true);
  });
});
