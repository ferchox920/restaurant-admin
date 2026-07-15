import type {
  InventoryMovementReportFilters,
  InventoryMovementsReportResponse,
  SalesByChannelReportItem,
  SalesByProductReportItem,
  SalesByUserReportItem,
  SalesReportFilters,
  StockReportFilters,
  StockReportItem,
  StockReportResponse,
} from "@/features/reports/types/report.types";
import { buildReportSearchParams } from "@/features/reports/utils/report-formatters";
import { apiClient } from "@/lib/api/api-client";
import { stockReportPaginationEnabled } from "@/lib/env";

function getReport<T>(path: string, signal?: AbortSignal) {
  return signal ? apiClient.get<T>(path, signal) : apiClient.get<T>(path);
}

export function getStockReport(filters?: StockReportFilters, signal?: AbortSignal) {
  const queryString = buildReportSearchParams({
    ...filters,
    ...(stockReportPaginationEnabled ? { responseMode: "paged" } : {}),
  } as StockReportFilters & { responseMode?: "paged" });
  return getReport<StockReportItem[] | StockReportResponse>(
    `/api/reports/stock${queryString}`,
    signal
  ).then((response) => {
    if (!Array.isArray(response)) {
      return { ...response, paginationMode: "server" as const };
    }

    return {
      items: response,
      summary: {
        available: response.filter((item) => item.stockStatus === "AVAILABLE").length,
        lowStock: response.filter((item) => item.stockStatus === "LOW_STOCK").length,
        outOfStock: response.filter((item) => item.stockStatus === "OUT_OF_STOCK").length,
        notTracked: response.filter((item) => item.stockStatus === "NOT_TRACKED").length,
      },
      total: response.length,
      limit: response.length,
      offset: 0,
      paginationMode: "legacy" as const,
    };
  });
}

export function getSalesByChannelReport(
  filters?: SalesReportFilters,
  signal?: AbortSignal
) {
  const queryString = buildReportSearchParams({
    from: filters?.from,
    to: filters?.to,
    salesChannelId: filters?.salesChannelId,
  });

  return getReport<SalesByChannelReportItem[]>(
    `/api/reports/sales-by-channel${queryString}`,
    signal
  );
}

export function getSalesByProductReport(
  filters?: SalesReportFilters,
  signal?: AbortSignal
) {
  const queryString = buildReportSearchParams({
    from: filters?.from,
    to: filters?.to,
    salesChannelId: filters?.salesChannelId,
    productId: filters?.productId,
  });

  return getReport<SalesByProductReportItem[]>(
    `/api/reports/sales-by-product${queryString}`,
    signal
  );
}

export function getSalesByUserReport(
  filters?: SalesReportFilters,
  signal?: AbortSignal
) {
  const queryString = buildReportSearchParams({
    from: filters?.from,
    to: filters?.to,
    salesChannelId: filters?.salesChannelId,
    userId: filters?.userId,
  });

  return getReport<SalesByUserReportItem[]>(
    `/api/reports/sales-by-user${queryString}`,
    signal
  );
}

export function getInventoryMovementsReport(
  filters?: InventoryMovementReportFilters,
  signal?: AbortSignal
) {
  const queryString = buildReportSearchParams(filters);
  return getReport<InventoryMovementsReportResponse>(
    `/api/reports/inventory-movements${queryString}`,
    signal
  );
}
