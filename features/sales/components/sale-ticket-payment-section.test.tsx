import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SaleTicketPaymentSection } from "@/features/sales/components/sale-ticket-payment-section";
import type { PaymentBank } from "@/features/payment-banks/types/payment-bank.types";
import type { SalePaymentMethod } from "@/features/sales/types/sale-ticket.types";

const banks: PaymentBank[] = [
  {
    id: "5b4c0bb0-5a94-4fe0-838b-6c809aaf65af",
    name: "Banco Galicia",
    description: "Cuenta principal",
    active: true,
    createdById: null,
    createdAt: "2026-06-14T18:00:00.000Z",
    updatedAt: "2026-06-14T18:00:00.000Z",
  },
];

afterEach(() => {
  cleanup();
});

function PaymentSectionHarness({
  initialPaymentMethod = "",
  initialPaymentBankId = "",
}: {
  initialPaymentMethod?: SalePaymentMethod | "";
  initialPaymentBankId?: string;
}) {
  const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod | "">(
    initialPaymentMethod
  );
  const [paymentBankId, setPaymentBankId] = useState(initialPaymentBankId);

  return (
    <SaleTicketPaymentSection
      paymentMethod={paymentMethod}
      paymentBankId={paymentBankId}
      banks={banks}
      onPaymentMethodChange={(nextPaymentMethod) => {
        setPaymentMethod(nextPaymentMethod);
        if (nextPaymentMethod === "CASH") {
          setPaymentBankId("");
        }
      }}
      onPaymentBankChange={setPaymentBankId}
      onSave={vi.fn()}
    />
  );
}

describe("SaleTicketPaymentSection", () => {
  it("hides bank selector and enables save for cash", () => {
    render(<PaymentSectionHarness initialPaymentMethod="TRANSFER" initialPaymentBankId={banks[0].id} />);

    fireEvent.click(screen.getByRole("button", { name: /efectivo/i }));

    expect(screen.queryByText("Banco")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar metodo de pago/i })
    ).toBeEnabled();
  });

  it("shows bank selector and blocks save for transfer without bank", () => {
    render(<PaymentSectionHarness initialPaymentMethod="TRANSFER" />);

    expect(screen.getByText("Banco")).toBeInTheDocument();
    expect(
      screen.getByText("Selecciona un banco para confirmar con transferencia.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar metodo de pago/i })
    ).toBeDisabled();
  });

  it("enables save for transfer with bank", () => {
    render(
      <PaymentSectionHarness
        initialPaymentMethod="TRANSFER"
        initialPaymentBankId={banks[0].id}
      />
    );

    expect(screen.getByText("Banco")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar metodo de pago/i })
    ).toBeEnabled();
  });
});
