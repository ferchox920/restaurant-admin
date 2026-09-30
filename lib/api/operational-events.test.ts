import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  invalidateOperationalEvent,
  operationalKeys,
} from "./operational-events";

describe("pinned operational event contract", () => {
  it("accepts string BigInt versions and related, and invalidates stock, tables and ticket", () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    invalidateOperationalEvent(client, "table-order.changed", {
      entityType: "TableOrder",
      entityId: "order",
      version: "9007199254740993",
      related: { restaurantTableId: "table", saleTicketId: "ticket" },
    });
    for (const queryKey of operationalKeys)
      expect(invalidate).toHaveBeenCalledWith({
        queryKey,
        refetchType: "active",
      });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["sale-tickets", "detail", "ticket"],
    });
  });
  it("rejects lossy numeric versions so the provider can resynchronize", () => {
    expect(() =>
      invalidateOperationalEvent(new QueryClient(), "table-order.changed", {
        entityType: "TableOrder",
        entityId: "order",
        version: 1,
      } as never)
    ).toThrow();
  });
});
