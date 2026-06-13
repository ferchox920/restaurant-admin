"use client";

import { useQuery } from "@tanstack/react-query";
import { getStockReport } from "@/features/reports/api/reports.api";
import { reportsQueryKeys } from "@/features/reports/query-keys";
import { stockReportFiltersSchema } from "@/features/reports/schemas/report-filters.schema";
import type { StockReportFilters } from "@/features/reports/types/report.types";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useStockReport(filters?: StockReportFilters) {
  const parsedFilters = stockReportFiltersSchema.safeParse(filters ?? {});

  return useQuery({
    queryKey: reportsQueryKeys.stock(filters),
    queryFn: () => getStockReport(parsedFilters.data),
    enabled: parsedFilters.success,
    retry: shouldRetryQuery,
    staleTime: 15_000,
  });
}
