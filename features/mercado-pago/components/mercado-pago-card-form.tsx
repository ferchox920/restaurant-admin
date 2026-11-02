"use client";

import { useState, type ComponentProps } from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { MercadoPagoCardPaymentInput } from "@/features/mercado-pago/types/mercado-pago-order.types";

type CardPaymentFormData = Parameters<
  ComponentProps<typeof CardPayment>["onSubmit"]
>[0];
type CardPaymentAdditionalData = Parameters<
  ComponentProps<typeof CardPayment>["onSubmit"]
>[1];

type MercadoPagoCardFormProps = {
  publicKey: string;
  amount: number;
  ticketId: string;
  onSubmit: (payload: MercadoPagoCardPaymentInput) => Promise<void>;
};

let initializedPublicKey: string | null = null;

function initializeSdk(publicKey: string) {
  if (initializedPublicKey === publicKey) {
    return;
  }

  initMercadoPago(publicKey);
  initializedPublicKey = publicKey;
}

function getPaymentType(
  additionalData?: CardPaymentAdditionalData,
): MercadoPagoCardPaymentInput["paymentTypeId"] {
  if (
    additionalData?.paymentTypeId === "credit_card" ||
    additionalData?.paymentTypeId === "debit_card"
  ) {
    return additionalData.paymentTypeId;
  }

  throw new Error(
    "Mercado Pago no informo si la tarjeta es de credito o debito. Revisa los datos e intenta nuevamente.",
  );
}

function toCheckoutPayload(
  formData: CardPaymentFormData,
  additionalData?: CardPaymentAdditionalData,
): MercadoPagoCardPaymentInput {
  const email = formData.payer.email?.trim();
  if (!email) {
    throw new Error("Ingresa el correo del comprador para continuar.");
  }

  const identification = formData.payer.identification;

  return {
    cardToken: formData.token,
    paymentMethodId: formData.payment_method_id,
    paymentTypeId: getPaymentType(additionalData),
    installments: formData.installments,
    payerEmail: email,
    ...(identification?.type && identification.number
      ? {
          identificationType: identification.type,
          identificationNumber: identification.number,
        }
      : {}),
  };
}

export function MercadoPagoCardForm({
  publicKey,
  amount,
  ticketId,
  onSubmit,
}: MercadoPagoCardFormProps) {
  const [brickError, setBrickError] = useState<string | null>(null);
  initializeSdk(publicKey);

  return (
    <div className="space-y-4">
      {brickError ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo preparar el formulario</AlertTitle>
          <AlertDescription>{brickError}</AlertDescription>
        </Alert>
      ) : null}

      <CardPayment
        id={`mercado-pago-card-${ticketId}`}
        locale="es-AR"
        initialization={{ amount }}
        customization={{
          paymentMethods: {
            types: { included: ["credit_card", "debit_card"] },
          },
        }}
        onReady={() => setBrickError(null)}
        onError={(error) => {
          setBrickError(
            error.message || "Mercado Pago no pudo cargar el formulario.",
          );
        }}
        onSubmit={async (formData, additionalData) => {
          setBrickError(null);
          try {
            await onSubmit(toCheckoutPayload(formData, additionalData));
          } catch (error) {
            setBrickError(
              error instanceof Error
                ? error.message
                : "No se pudo procesar el cobro.",
            );
            throw error;
          }
        }}
      />
    </div>
  );
}
