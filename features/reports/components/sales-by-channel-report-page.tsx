"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesByChannelReportTable } from "@/features/reports/components/sales-by-channel-report-table";
import { SalesReportFilters } from "@/features/reports/components/sales-report-filters";
import { useSalesByChannelReport } from "@/features/reports/hooks/use-sales-by-channel-report";
import { salesReportFiltersSchema } from "@/features/reports/schemas/report-filters.schema";
import type { SalesReportFilters as SalesReportQueryFilters } from "@/features/reports/types/report.types";
import {
  toReportDateRange,
  formatReportDateRange,
  getDefaultSalesDateRange,
  getReportEmptyMessage,
} from "@/features/reports/utils/report-formatters";
import { useAllSalesChannels as useSalesChannels } from "@/features/sales-channels/hooks/use-all-sales-channels";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

export function SalesByChannelReportPage() {
  const initialRange = useMemo(() => getDefaultSalesDateRange(), []);
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [salesChannelId, setSalesChannelId] = useState<string>("__all__");

  const filters = useMemo<SalesReportQueryFilters>(
    () => ({
      ...toReportDateRange({ from, to }),
      salesChannelId: salesChannelId === "__all__" ? undefined : salesChannelId,
    }),
    [from, to, salesChannelId]
  );

  const validation = salesReportFiltersSchema.safeParse(filters);
  const channelsQuery = useSalesChannels({ active: true });
  const reportQuery = useSalesByChannelReport(filters);
  const isForbidden =
    reportQuery.error &&
    isApiError(reportQuery.error) &&
    reportQuery.error.statusCode === HTTP_STATUS.forbidden;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Reportes"
        title="Ventas por canal"
        description={`Usa solo ventas confirmadas. ${formatReportDateRange({
          from,
          to,
        })}.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Reporte de ventas por canal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SalesReportFilters
            channels={channelsQuery.data ?? []}
            values={{
              from,
              to,
              salesChannelId,
            }}
            onFromChange={setFrom}
            onToChange={setTo}
            onSalesChannelIdChange={setSalesChannelId}
            onReset={() => {
              setFrom(initialRange.from);
              setTo(initialRange.to);
              setSalesChannelId("__all__");
            }}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-border px-3 py-1">
              Ventas confirmadas
            </Badge>
            <Badge variant="outline" className="border-border px-3 py-1">
              Usa montos historicos calculados por backend
            </Badge>
          </div>

          {!validation.success ? (
            <ErrorMessage
              title="Filtros invalidos"
              messages={validation.error.issues.map((issue) => issue.message)}
            />
          ) : null}

          {reportQuery.isLoading ? (
            <LoadingState
              title="Cargando reporte"
              message="Estamos agregando ventas confirmadas por canal."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {reportQuery.error ? (
            <ErrorMessage
              variant={isForbidden ? "forbidden" : "general"}
              title={
                isForbidden
                  ? "Acceso restringido"
                  : "No se pudo cargar el reporte"
              }
              messages={getApiErrorMessages(reportQuery.error)}
            />
          ) : null}

          {!reportQuery.isLoading &&
          !reportQuery.error &&
          (reportQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="Sin resultados"
              message={getReportEmptyMessage("sales-by-channel")}
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!reportQuery.isLoading &&
          !reportQuery.error &&
          (reportQuery.data?.length ?? 0) > 0 ? (
            <>
              <SalesByChannelReportTable items={reportQuery.data ?? []} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
