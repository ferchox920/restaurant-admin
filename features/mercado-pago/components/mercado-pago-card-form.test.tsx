import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MercadoPagoCardForm } from "@/features/mercado-pago/components/mercado-pago-card-form";

vi.mock("@mercadopago/sdk-react", () => ({
  initMercadoPago: vi.fn(),
  CardPayment: ({
    onSubmit,
  }: {
    onSubmit: (form: unknown, additional: unknown) => Promise<void>;
  }) => (
    <button
      type="button"
      onClick={() =>
        void onSubmit(
          {
            token: "one-use-token",
            issuer_id: "310",
            payment_method_id: "master",
            transaction_amount: 1500,
            installments: 3,
            payer: {
              email: " buyer@testuser.com ",
              identification: { type: "DNI", number: "12345678" },
            },
          },
          { paymentTypeId: "credit_card" },
        )
      }
    >
      Enviar tarjeta
    </button>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("MercadoPagoCardForm", () => {
  it("maps the Brick token to the backend order contract", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <MercadoPagoCardForm
        publicKey="TEST-public-key"
        amount={1500}
        ticketId="5b4c0bb0-5a94-4fe0-838b-6c809aaf65af"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Enviar tarjeta" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        cardToken: "one-use-token",
        paymentMethodId: "master",
        paymentTypeId: "credit_card",
        installments: 3,
        payerEmail: "buyer@testuser.com",
        identificationType: "DNI",
        identificationNumber: "12345678",
      });
    });
  });
});
