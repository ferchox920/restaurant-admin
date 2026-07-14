import type { ProductUnit } from "@/features/products/types/product.types";
import type { SalePaymentMethod } from "@/features/sales/types/sale-ticket.types";
import type { PaginationParams } from "@/types/common";

export const tableOrderStatuses = ["OPEN", "CANCELLED", "CLOSED"] as const;
export const tableOrderSaleTicketStatuses = [
  "DRAFT",
  "CONFIRMED",
  "CANCELLED",
  "VOIDED",
] as const;

export type TableOrderStatus = (typeof tableOrderStatuses)[number];
export type SaleTicketStatus = (typeof tableOrderSaleTicketStatuses)[number];

export type TableOrderItem = {
  id: string;
  ticketId: string;
  productId: string;
  productNameSnapshot: string;
  productSkuSnapshot: string | null;
  productUnitSnapshot: ProductUnit | string;
  quantity: string;
  unitPriceSnapshot: string;
  unitCostSnapshot: string;
  subtotal: string;
};

export type TableOrderSaleTicket = {
  id: string;
  status: SaleTicketStatus;
  salesChannelId: string;
  items: TableOrderItem[];
  subtotal: string;
  total: string;
};

export type TableOrder = {
  id: string;
  restaurantTableId: string;
  tableCode: string;
  tableName: string | null;
  tableArea: string | null;
  saleTicketId: string;
  status: TableOrderStatus;
  openedById: string;
  cancelledById: string | null;
  closedById: string | null;
  notes: string | null;
  cancelReason: string | null;
  openedAt: string;
  cancelledAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  saleTicket: TableOrderSaleTicket;
};

export type TableOrderSummary = {
  id: string;
  status: TableOrderStatus;
  openedAt?: string | null;
  total?: string | null;
  saleTicket?: Pick<TableOrderSaleTicket, "id" | "status" | "total"> | null;
};

export type TableOrderFilters = PaginationParams & {
  status?: TableOrderStatus;
  tableId?: string;
  openedById?: string;
  from?: string;
  to?: string;
};

export type OpenTableOrderInput = {
  salesChannelId: string;
  notes?: string;
};

export type AddTableOrderItemInput = {
  productId: string;
  quantity: number;
};

export type UpdateTableOrderItemInput = {
  quantity: number;
};

export type CancelTableOrderInput = {
  reason: string;
};

export type CloseTableOrderInput = {
  paymentMethod: SalePaymentMethod;
  paymentBankId?: string;
};

export type OpenTableOrderFormValues = {
  salesChannelId: string;
  notes?: string;
};

export type AddTableOrderItemFormValues = {
  productId: string;
  quantity: string;
};

export type UpdateTableOrderItemFormValues = {
  quantity: string;
};

export type CancelTableOrderFormValues = {
  reason: string;
};

export type CloseTableOrderFormValues = {
  paymentMethod: SalePaymentMethod;
  paymentBankId?: string;
};
