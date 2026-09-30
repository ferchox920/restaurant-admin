import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { stockIn } from "@/features/inventory/api/inventory.api";
import { useStockIn } from "@/features/inventory/hooks/use-stock-in";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";

vi.mock("@/features/inventory/api/inventory.api", () => ({ stockIn: vi.fn() }));

describe("inventory mutation cache", () => {
  let queryClient: QueryClient;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    vi.mocked(stockIn).mockReset();
  });

  it("invalidates stock detail, lists and movements after stock-in", async () => {
    vi.mocked(stockIn).mockResolvedValue({
      id: "movement-id",
    } as InventoryMovement);
    queryClient.setQueryData(inventoryQueryKeys.list(), []);
    queryClient.setQueryData(inventoryQueryKeys.detail("product-id"), {});
    queryClient.setQueryData(inventoryQueryKeys.movementList(), []);
    queryClient.setQueryData(
      inventoryQueryKeys.productMovementList("product-id"),
      []
    );
    const { result } = renderHook(() => useStockIn("product-id"), { wrapper });

    await act(() =>
      result.current.mutateAsync({ quantity: "1.5", reason: "Compra" })
    );

    expect(stockIn).toHaveBeenCalledWith("product-id", {
      quantity: 1.5,
      reason: "Compra",
    });
    expect(
      queryClient.getQueryState(inventoryQueryKeys.list())?.isInvalidated
    ).toBe(true);
    expect(
      queryClient.getQueryState(inventoryQueryKeys.detail("product-id"))
        ?.isInvalidated
    ).toBe(true);
    expect(
      queryClient.getQueryState(inventoryQueryKeys.movementList())
        ?.isInvalidated
    ).toBe(true);
    expect(
      queryClient.getQueryState(
        inventoryQueryKeys.productMovementList("product-id")
      )?.isInvalidated
    ).toBe(true);
  });
});
