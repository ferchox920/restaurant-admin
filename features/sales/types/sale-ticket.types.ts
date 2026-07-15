import type {
  ProductUnit,
  StockManagementType,
} from "@/features/products/types/product.types";
import type { InventoryStockStatus } from "@/features/inventory/types/inventory.types";
export type { SaleTicketStatus } from "@/features/sales/constants/sale-ticket-status";
import type { SaleTicketStatus } from "@/features/sales/constants/sale-ticket-status";
import type { PaginationParams } from "@/types/common";

export type SaleTicketActor = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

export type SaleTicketChannel = {
  id: string;
  name?: string | null;
  code?: string | null;
  active?: boolean;
};

export type SalePaymentMethod = "CASH" | "TRANSFER";

export type SaleTicketItem = {
  id: string;
  ticketId: string;
  productId: string;
  quantity: string;
  productNameSnapshot: string;
  productSkuSnapshot: string | null;
  productUnitSnapshot: ProductUnit | string;
  unitPriceSnapshot: string;
  unitCostSnapshot: string | null;
  subtotal: string;
  createdAt: string;
  updatedAt: string;
};

export type SaleTicketBase = {
  id: string;
  version?: string;
  status: SaleTicketStatus;
  salesChannelId: string;
  salesChannel?: SaleTicketChannel | null;
  paymentMethod?: SalePaymentMethod | null;
  paymentBankId?: string | null;
  paymentBankName?: string | null;
  paymentBankNameSnapshot?: string | null;
  notes?: string | null;
  subtotal: string;
  total: string;
  createdById?: string | null;
  createdBy?: SaleTicketActor | null;
  createdAt: string;
  updatedAt: string;
  confirmedById?: string | null;
  confirmedBy?: SaleTicketActor | null;
  confirmedAt?: string | null;
  voidedById?: string | null;
  voidedBy?: SaleTicketActor | null;
  voidedAt?: string | null;
  voidReason?: string | null;
};

export type SaleTicketListItem = SaleTicketBase & {
  itemsCount?: number | null;
};

export type SaleTicketDetail = SaleTicketBase & {
  items: SaleTicketItem[];
};

export type SaleTicketFilters = PaginationParams & {
  status?: SaleTicketStatus;
  channelId?: string;
  search?: string;
  createdById?: string;
  from?: string;
  to?: string;
};

export type CreateSaleTicketInput = {
  salesChannelId: string;
  notes?: string;
  paymentMethod?: SalePaymentMethod;
  paymentBankId?: string;
};

export type UpdateSaleTicketInput = {
  expectedVersion?: string;
  salesChannelId?: string;
  notes?: string;
  paymentMethod?: SalePaymentMethod;
  paymentBankId?: string;
};

export type ConfirmSaleTicketInput = {
  expectedVersion?: string;
  paymentMethod: SalePaymentMethod;
  paymentBankId?: string;
};

export type AddSaleTicketItemInput = {
  expectedVersion?: string;
  productId: string;
  quantity: number;
};

export type UpdateSaleTicketItemInput = {
  expectedVersion?: string;
  quantity: number;
};

export type CancelSaleTicketInput = {
  expectedVersion?: string;
  reason: string;
};

export type VoidSaleTicketInput = {
  expectedVersion?: string;
  reason: string;
};

export type CreateSaleTicketFormValues = {
  salesChannelId: string;
  notes?: string;
  paymentMethod?: SalePaymentMethod;
  paymentBankId?: string;
};

export type SaleTicketPaymentFormValues = {
  expectedVersion?: string;
  paymentMethod: SalePaymentMethod;
  paymentBankId?: string;
};

export type AddSaleTicketItemFormValues = {
  expectedVersion?: string;
  productId: string;
  quantity: string;
};

export type UpdateSaleTicketItemFormValues = {
  expectedVersion?: string;
  quantity: string;
};

export type VoidSaleTicketFormValues = {
  expectedVersion?: string;
  reason: string;
};

export type SaleProductOption = {
  id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  unit: ProductUnit;
  stockManagementType: StockManagementType;
  stockStatus?: InventoryStockStatus;
  currentStock?: string | null;
  active: boolean;
};
