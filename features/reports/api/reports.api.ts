import type {
  InventoryMovementReportFilters,
  InventoryMovementsReportResponse,
  SalesByChannelReportItem,
  SalesByProductReportItem,
  SalesByUserReportItem,
  SalesReportFilters,
  StockReportFilters,
  StockReportItem,
} from "@/features/reports/types/report.types";
import { buildReportSearchParams } from "@/features/reports/utils/report-formatters";
import { apiClient } from "@/lib/api/api-client";

export function getStockReport(filters?: StockReportFilters) {
  const queryString = buildReportSearchParams(filters);
  return apiClient.get<StockReportItem[]>(`/api/reports/stock${queryString}`);
}

export function getSalesByChannelReport(filters?: SalesReportFilters) {
  const queryString = buildReportSearchParams({
    from: filters?.from,
    to: filters?.to,
    salesChannelId: filters?.salesChannelId,
  });

  return apiClient.get<SalesByChannelReportItem[]>(
    `/api/reports/sales-by-channel${queryString}`
  );
}

export function getSalesByProductReport(filters?: SalesReportFilters) {
  const queryString = buildReportSearchParams({
    from: filters?.from,
    to: filters?.to,
    salesChannelId: filters?.salesChannelId,
    productId: filters?.productId,
  });

  return apiClient.get<SalesByProductReportItem[]>(
    `/api/reports/sales-by-product${queryString}`
  );
}

export function getSalesByUserReport(filters?: SalesReportFilters) {
  const queryString = buildReportSearchParams({
    from: filters?.from,
    to: filters?.to,
    salesChannelId: filters?.salesChannelId,
    userId: filters?.userId,
  });

  return apiClient.get<SalesByUserReportItem[]>(
    `/api/reports/sales-by-user${queryString}`
  );
}

export function getInventoryMovementsReport(
  filters?: InventoryMovementReportFilters
) {
  const queryString = buildReportSearchParams(filters);
  return apiClient.get<InventoryMovementsReportResponse>(
    `/api/reports/inventory-movements${queryString}`
  );
}
