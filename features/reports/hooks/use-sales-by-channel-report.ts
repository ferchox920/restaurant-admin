"use client";

import { useQuery } from "@tanstack/react-query";
import { getSalesByChannelReport } from "@/features/reports/api/reports.api";
import { reportsQueryKeys } from "@/features/reports/query-keys";
import { salesReportFiltersSchema } from "@/features/reports/schemas/report-filters.schema";
import type { SalesReportFilters } from "@/features/reports/types/report.types";
import { shouldRetryQuery } from "@/lib/api/query-utils";

export function useSalesByChannelReport(filters?: SalesReportFilters) {
  const parsedFilters = salesReportFiltersSchema.safeParse(filters ?? {});

  return useQuery({
    queryKey: reportsQueryKeys.salesByChannel(filters),
    queryFn: () => getSalesByChannelReport(parsedFilters.data),
    enabled: parsedFilters.success,
    retry: shouldRetryQuery,
    staleTime: 15_000,
  });
}
