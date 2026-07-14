import { describe, expect, it } from "vitest";
import { calculateChannelPrice } from "@/features/products/prices/utils/price-adjustments";

describe("calculateChannelPrice", () => {
  it("keeps base price for channels without taxes or commissions", () => {
    expect(
      calculateChannelPrice("1000", {
        id: "channel-1",
        name: "Mostrador",
        subTaxes: [],
      }),
    ).toBe("1000");
  });

  it("applies channel taxes and commissions from base price", () => {
    expect(
      calculateChannelPrice("1000", {
        id: "channel-1",
        name: "Pedidos Ya",
        subTaxes: [
          { id: "tax-1", name: "IVA", percentage: 21 },
          { id: "tax-2", name: "Comision marketplace", percentage: 15 },
        ],
      }),
    ).toBe("1360");
  });

  it("rounds prices with decimal tax percentages", () => {
    expect(
      calculateChannelPrice("1000", {
        id: "channel-2",
        name: "Salon",
        subTaxes: [{ id: "tax-1", name: "Ingresos Brutos", percentage: 3.5 }],
      }),
    ).toBe("1035");
  });
});
