import type { StockManagementType } from "@/features/products/types/product.types";
import type { PaginationParams } from "@/types/common";

export const inventoryMovementTypes = [
  "STOCK_IN",
  "SALE_OUT",
  "MANUAL_ADJUSTMENT",
  "WASTE",
  "RETURN_IN",
  "VOID_REVERSAL",
] as const;

export const inventoryReferenceTypes = [
  "MANUAL",
  "SALE_TICKET",
  "SALE_VOID",
  "SYSTEM",
] as const;

export const inventoryStockStatuses = [
  "OUT_OF_STOCK",
  "LOW_STOCK",
  "AVAILABLE",
] as const;

export type InventoryMovementType = (typeof inventoryMovementTypes)[number];
export type InventoryReferenceType = (typeof inventoryReferenceTypes)[number];
export type InventoryStockStatus = (typeof inventoryStockStatuses)[number];

export type InventoryStockItem = {
  productId: string;
  productName: string;
  productSku: string | null;
  unit: string;
  stockManagementType: StockManagementType;
  currentStock: string;
  minimumStock: string;
  stockStatus: InventoryStockStatus;
  updatedAt: string;
};

export type ProductInventoryDetail = InventoryStockItem;

export type InventoryMovement = {
  id: string;
  productId: string;
  productName: string;
  movementType: InventoryMovementType;
  quantity: string;
  previousStock: string;
  newStock: string;
  reason: string;
  referenceType: InventoryReferenceType;
  referenceId: string | null;
  createdById: string | null;
  createdAt: string;
};

export type InventoryFilters = PaginationParams & {
  active?: boolean;
  stockStatus?: InventoryStockStatus;
  search?: string;
};

export type InventoryMovementsFilters = PaginationParams & {
  productId?: string;
  movementType?: InventoryMovementType;
  from?: string;
  to?: string;
};

export type StockInInput = {
  quantity: number;
  reason: string;
};

export type ManualAdjustmentInput = {
  newStock: number;
  reason: string;
};

export type WasteInput = {
  quantity: number;
  reason: string;
};

export type ReturnInInput = {
  quantity: number;
  reason: string;
};

export type UpdateMinimumStockInput = {
  minimumStock: number;
};

export type InventoryQuantityFormValue = {
  quantity: string;
  reason: string;
};

export type ManualAdjustmentFormValue = {
  newStock: string;
  reason: string;
};

export type UpdateMinimumStockFormValue = {
  minimumStock: string;
};
