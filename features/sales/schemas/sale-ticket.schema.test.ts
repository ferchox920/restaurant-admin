import { describe, expect, it } from "vitest";
import { saleTicketPaymentSchema } from "@/features/sales/schemas/sale-ticket.schema";

const bankId = "5b4c0bb0-5a94-4fe0-838b-6c809aaf65af";

describe("saleTicketPaymentSchema", () => {
  it("removes paymentBankId for cash payments", () => {
    const result = saleTicketPaymentSchema.parse({
      paymentMethod: "CASH",
      paymentBankId: bankId,
    });

    expect(result).toEqual({
      paymentMethod: "CASH",
    });
  });

  it("requires paymentBankId for transfer payments", () => {
    const result = saleTicketPaymentSchema.safeParse({
      paymentMethod: "TRANSFER",
      paymentBankId: "",
    });

    expect(result.success).toBe(false);
  });

  it("keeps paymentBankId for valid transfer payments", () => {
    const result = saleTicketPaymentSchema.parse({
      paymentMethod: "TRANSFER",
      paymentBankId: bankId,
    });

    expect(result).toEqual({
      paymentMethod: "TRANSFER",
      paymentBankId: bankId,
    });
  });
});

