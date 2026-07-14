import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/api-client";
import {
  getSalesByChannelReport,
  getSalesByProductReport,
  getSalesByUserReport,
} from "@/features/reports/api/reports.api";

vi.mock("@/lib/api/api-client", () => ({
  apiClient: { get: vi.fn() },
}));

describe("sales report API", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.get).mockResolvedValue([]);
  });

  it("loads all three reports without filters", async () => {
    await getSalesByChannelReport();
    await getSalesByProductReport();
    await getSalesByUserReport();

    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/api/reports/sales-by-channel");
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/api/reports/sales-by-product");
    expect(apiClient.get).toHaveBeenNthCalledWith(3, "/api/reports/sales-by-user");
  });

  it("sends only each endpoint's supported filters", async () => {
    const common = {
      salesChannelId: "8f160a12-eeb7-4881-9561-3b9b05ac7839",
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-07-31T23:59:59.999Z",
    };

    await getSalesByChannelReport({ ...common, productId: "ignored", userId: "ignored" });
    await getSalesByProductReport({ ...common, productId: "product-id", userId: "ignored" });
    await getSalesByUserReport({ ...common, productId: "ignored", userId: "user-id" });

    expect(apiClient.get).toHaveBeenNthCalledWith(
      1,
      `/api/reports/sales-by-channel?from=${encodeURIComponent(common.from)}&to=${encodeURIComponent(common.to)}&salesChannelId=${common.salesChannelId}`,
    );
    expect(apiClient.get).toHaveBeenNthCalledWith(
      2,
      `/api/reports/sales-by-product?from=${encodeURIComponent(common.from)}&to=${encodeURIComponent(common.to)}&salesChannelId=${common.salesChannelId}&productId=product-id`,
    );
    expect(apiClient.get).toHaveBeenNthCalledWith(
      3,
      `/api/reports/sales-by-user?from=${encodeURIComponent(common.from)}&to=${encodeURIComponent(common.to)}&salesChannelId=${common.salesChannelId}&userId=user-id`,
    );
  });
});
