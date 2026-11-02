export type MercadoPagoCardPaymentInput = {
  cardToken: string;
  paymentMethodId: string;
  paymentTypeId: "credit_card" | "debit_card";
  installments: number;
  payerEmail: string;
  identificationType?: string;
  identificationNumber?: string;
};

export type MercadoPagoOrder = {
  id: string;
  saleTicketId: string;
  externalOrderId: string;
  status: string;
  statusDetail: string | null;
  totalAmount: number;
  totalPaidAmount: number | null;
  currencyId: string;
  paymentId: string | null;
  paymentStatus: string | null;
  paymentStatusDetail: string | null;
  paymentMethodId: string | null;
  paymentTypeId: string | null;
  installments: number | null;
  checkoutUrl: string | null;
  externalCreatedAt: string | null;
  externalUpdatedAt: string | null;
  syncedAt: string;
  reconciledAt: string | null;
  reconciliationError: string | null;
};

export function isMercadoPagoOrderApproved(order: MercadoPagoOrder) {
  return (
    (order.status === "processed" && order.statusDetail === "accredited") ||
    (order.paymentStatus === "processed" &&
      order.paymentStatusDetail === "accredited")
  );
}

export function isMercadoPagoOrderRetryable(order: MercadoPagoOrder) {
  const retryableStatuses = ["cancelled", "canceled", "failed", "rejected"];
  return (
    retryableStatuses.includes(order.status) ||
    (order.paymentStatus !== null &&
      retryableStatuses.includes(order.paymentStatus))
  );
}
