import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllProducts } from "@/features/products/api/products.api";
import { useAllProducts } from "@/features/products/hooks/use-all-products";

vi.mock("@/features/products/api/products.api", () => ({
  getAllProducts: vi.fn(),
}));

describe("useAllProducts activation", () => {
  let queryClient: QueryClient;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(getAllProducts).mockReset();
    vi.mocked(getAllProducts).mockResolvedValue([]);
  });

  it("does not download the catalog when the consumer is read-only", () => {
    renderHook(
      () => useAllProducts({ active: true }, { enabled: false }),
      { wrapper }
    );

    expect(getAllProducts).not.toHaveBeenCalled();
  });

  it("passes React Query cancellation to the catalog request", async () => {
    renderHook(
      () => useAllProducts({ active: true }, { enabled: true }),
      { wrapper }
    );

    await waitFor(() => expect(getAllProducts).toHaveBeenCalledTimes(1));
    expect(vi.mocked(getAllProducts).mock.calls[0]?.[1]).toBeInstanceOf(
      AbortSignal
    );
  });
});
