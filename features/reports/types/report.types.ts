import type {
  InventoryMovementType,
  InventoryReferenceType,
} from "@/features/inventory/types/inventory.types";
import type { StockManagementType } from "@/features/products/types/product.types";
import type { PaginationParams } from "@/types/common";

export const reportStockStatuses = [
  "AVAILABLE",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "NOT_TRACKED",
] as const;

export type ReportStockStatus = (typeof reportStockStatuses)[number];

export type StockReportItem = {
  productId: string;
  productName: string;
  productSku: string | null;
  categoryId: string | null;
  categoryName: string | null;
  unit: string;
  stockManagementType: StockManagementType;
  active: boolean;
  currentStock: string;
  minimumStock: string;
  stockStatus: ReportStockStatus;
  updatedAt: string;
};

export type StockReportSummary = {
  available: number;
  lowStock: number;
  outOfStock: number;
  notTracked: number;
};

export type StockReportResponse = {
  items: StockReportItem[];
  summary: StockReportSummary;
  total: number;
  limit: number;
  offset: number;
};

export type SalesByChannelReportItem = {
  salesChannelId: string;
  salesChannelName: string;
  salesChannelCode: string;
  ticketsCount: number;
  itemsCount: number;
  quantitySold: string;
  grossSales: string;
  historicalCost: string;
  grossProfit: string;
  averageTicket: string;
};

export type SalesByProductReportItem = {
  productId: string;
  productNameSnapshot: string;
  productSkuSnapshot: string | null;
  productUnitSnapshot: string;
  quantitySold: string;
  grossSales: string;
  historicalCost: string;
  grossProfit: string;
  ticketsCount: number;
};

export type SalesByUserReportItem = {
  userId: string | null;
  userEmail: string | null;
  userFullName: string | null;
  ticketsCount: number;
  itemsCount: number;
  quantitySold: string;
  grossSales: string;
  historicalCost: string;
  grossProfit: string;
};

export type InventoryMovementReportItem = {
  movementId: string;
  productId: string;
  productName: string;
  productSku: string | null;
  movementType: InventoryMovementType;
  quantity: string;
  previousStock: string;
  newStock: string;
  reason: string;
  referenceType: InventoryReferenceType;
  referenceId: string | null;
  createdById: string | null;
  createdByEmail: string | null;
  createdByName: string | null;
  createdAt: string;
};

export type InventoryMovementsReportResponse = {
  items: InventoryMovementReportItem[];
  limit: number;
  offset: number;
  total: number;
};

export type StockReportFilters = PaginationParams & {
  active?: boolean;
  categoryId?: string;
  stockStatus?: ReportStockStatus;
  stockManagementType?: StockManagementType;
  search?: string;
};

export type SalesReportFilters = {
  from?: string;
  to?: string;
  salesChannelId?: string;
  productId?: string;
  userId?: string;
};

export type InventoryMovementReportFilters = {
  productId?: string;
  movementType?: InventoryMovementType;
  referenceType?: InventoryReferenceType;
  createdById?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};
