"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getInventoryMovementsReport } from "@/features/reports/api/reports.api";
import { reportsQueryKeys } from "@/features/reports/query-keys";
import { inventoryMovementReportFiltersSchema } from "@/features/reports/schemas/report-filters.schema";
import type { InventoryMovementReportFilters } from "@/features/reports/types/report.types";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useInventoryMovementsReport(
  filters?: InventoryMovementReportFilters
) {
  const parsedFilters = inventoryMovementReportFiltersSchema.safeParse(filters ?? {});

  return useQuery({
    queryKey: reportsQueryKeys.inventoryMovements(filters),
    queryFn: ({ signal }) =>
      getInventoryMovementsReport(parsedFilters.data, signal),
    enabled: parsedFilters.success,
    retry: shouldRetryQuery,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });
}
