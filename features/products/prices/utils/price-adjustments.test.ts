import { describe, expect, it } from "vitest";
import { calculateChannelPrice } from "@/features/products/prices/utils/price-adjustments";

describe("calculateChannelPrice", () => {
  it("keeps base price for channels without commission", () => {
    expect(
      calculateChannelPrice("1000", {
        id: "channel-1",
        name: "Mostrador",
        commissionType: "NONE",
        commissionValue: 0,
      })
    ).toBe("1000");
  });

  it("applies positive and negative percentage adjustments from base price", () => {
    expect(
      calculateChannelPrice("1000", {
        id: "channel-1",
        name: "Pedidos Ya",
        commissionType: "PERCENTAGE",
        commissionValue: 15,
      })
    ).toBe("1150");

    expect(
      calculateChannelPrice("1000", {
        id: "channel-2",
        name: "Mayorista",
        commissionType: "PERCENTAGE",
        commissionValue: -10,
      })
    ).toBe("900");
  });

  it("applies fixed adjustments from base price", () => {
    expect(
      calculateChannelPrice("1000", {
        id: "channel-1",
        name: "Delivery",
        commissionType: "FIXED",
        commissionValue: 250,
      })
    ).toBe("1250");
  });
});
