import { describe, expect, it } from "vitest";
import {
  isMercadoPagoOrderApproved,
  isMercadoPagoOrderRetryable,
  type MercadoPagoOrder,
} from "@/features/mercado-pago/types/mercado-pago-order.types";

function makeOrder(
  overrides: Partial<MercadoPagoOrder> = {},
): MercadoPagoOrder {
  return {
    id: "7d4c0bb0-5a94-4fe0-838b-6c809aaf65af",
    saleTicketId: "5b4c0bb0-5a94-4fe0-838b-6c809aaf65af",
    externalOrderId: "ORD01TEST",
    status: "processing",
    statusDetail: null,
    totalAmount: 1500,
    totalPaidAmount: null,
    currencyId: "ARS",
    paymentId: null,
    paymentStatus: "processing",
    paymentStatusDetail: null,
    paymentMethodId: "master",
    paymentTypeId: "credit_card",
    installments: 1,
    checkoutUrl: null,
    externalCreatedAt: null,
    externalUpdatedAt: null,
    syncedAt: "2026-08-06T12:00:00.000Z",
    reconciledAt: null,
    reconciliationError: null,
    ...overrides,
  };
}

describe("Mercado Pago order status", () => {
  it("recognizes an accredited order", () => {
    expect(
      isMercadoPagoOrderApproved(
        makeOrder({ status: "processed", statusDetail: "accredited" }),
      ),
    ).toBe(true);
  });

  it("keeps a processing order from being retried", () => {
    const order = makeOrder();

    expect(isMercadoPagoOrderApproved(order)).toBe(false);
    expect(isMercadoPagoOrderRetryable(order)).toBe(false);
  });

  it("allows another attempt after a rejected payment", () => {
    expect(
      isMercadoPagoOrderRetryable(makeOrder({ paymentStatus: "rejected" })),
    ).toBe(true);
  });
});
