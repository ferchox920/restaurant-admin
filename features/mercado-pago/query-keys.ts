export const mercadoPagoOrderQueryKeys = {
  all: ["mercado-pago-orders"] as const,
  ticket: (ticketId: string) =>
    [...mercadoPagoOrderQueryKeys.all, "ticket", ticketId] as const,
};
