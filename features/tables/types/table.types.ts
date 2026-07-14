import type { TableOrderSummary } from "@/features/table-orders/types/table-order.types";
import type { PaginationParams } from "@/types/common";

export const tableStatuses = ["AVAILABLE", "OCCUPIED", "INACTIVE"] as const;

export type TableStatus = (typeof tableStatuses)[number];

export type RestaurantTable = {
  id: string;
  code: string;
  name: string | null;
  area: string | null;
  capacity: number | null;
  active: boolean;
  status: TableStatus;
  currentOrder: TableOrderSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type TableFilters = PaginationParams & {
  active?: boolean;
  area?: string;
  search?: string;
};

export type CreateTableInput = {
  code: string;
  name?: string;
  area?: string;
  capacity?: number;
};

export type UpdateTableInput = {
  name?: string;
  area?: string;
  capacity?: number;
};
