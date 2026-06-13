import type { ProductUnit } from "@/features/products/types/product.types";
import type { SaleTicketStatus } from "@/features/sales/constants/sale-ticket-status";
import type {
  SaleTicketActor,
  SaleTicketBase,
} from "@/features/sales/types/sale-ticket.types";

const saleTicketStatusLabels: Record<SaleTicketStatus, string> = {
  DRAFT: "Borrador",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  VOIDED: "Anulada",
};

const productUnitLabels: Record<ProductUnit, string> = {
  UNIT: "Unidad",
  PORTION: "Porcion",
  SERVICE: "Servicio",
};

export function isDraftTicket(ticket: Pick<SaleTicketBase, "status">) {
  return ticket.status === "DRAFT";
}

export function isConfirmedTicket(ticket: Pick<SaleTicketBase, "status">) {
  return ticket.status === "CONFIRMED";
}

export function canEditTicket(ticket: Pick<SaleTicketBase, "status">) {
  return isDraftTicket(ticket);
}

export function canCancelTicket(ticket: Pick<SaleTicketBase, "status">) {
  return isDraftTicket(ticket);
}

export function canConfirmTicket(ticket: Pick<SaleTicketBase, "status">) {
  return isDraftTicket(ticket);
}

export function canVoidTicket(ticket: Pick<SaleTicketBase, "status">) {
  return isConfirmedTicket(ticket);
}

export function getTicketStatusLabel(status: SaleTicketStatus) {
  return saleTicketStatusLabels[status];
}

export function formatSaleTicketActor(actor?: SaleTicketActor | null, fallbackId?: string | null) {
  if (!actor && !fallbackId) {
    return "-";
  }

  if (!actor) {
    return fallbackId ?? "-";
  }

  const fullName = [actor.firstName, actor.lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  return actor.email ?? actor.id ?? fallbackId ?? "-";
}

export function formatTicketReadableId(ticketId: string) {
  return ticketId.length > 8 ? `#${ticketId.slice(0, 8)}` : ticketId;
}

export function formatSaleTicketUnit(value: ProductUnit | string | null | undefined) {
  if (!value) {
    return "-";
  }

  if (value in productUnitLabels) {
    return productUnitLabels[value as ProductUnit];
  }

  return value;
}
