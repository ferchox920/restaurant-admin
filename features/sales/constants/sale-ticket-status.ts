export const saleTicketStatuses = [
  "DRAFT",
  "CONFIRMED",
  "CANCELLED",
  "VOIDED",
] as const;

export type SaleTicketStatus = (typeof saleTicketStatuses)[number];
