"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAllProducts as useProducts } from "@/features/products/hooks/use-all-products";
import { SalesReportFilters } from "@/features/reports/components/sales-report-filters";
import { SalesByProductReportTable } from "@/features/reports/components/sales-by-product-report-table";
import { useSalesByProductReport } from "@/features/reports/hooks/use-sales-by-product-report";
import { salesReportFiltersSchema } from "@/features/reports/schemas/report-filters.schema";
import type { SalesReportFilters as SalesReportQueryFilters } from "@/features/reports/types/report.types";
import {
  formatReportDateRange,
  getDefaultSalesDateRange,
  getReportEmptyMessage,
  toReportDateRange,
} from "@/features/reports/utils/report-formatters";
import { useAllSalesChannels as useSalesChannels } from "@/features/sales-channels/hooks/use-all-sales-channels";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

export function SalesByProductReportPage() {
  const initialRange = useMemo(() => getDefaultSalesDateRange(), []);
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [salesChannelId, setSalesChannelId] = useState<string>("__all__");
  const [productId, setProductId] = useState<string>("__all__");

  const filters = useMemo<SalesReportQueryFilters>(
    () => ({
      ...toReportDateRange({ from, to }),
      salesChannelId: salesChannelId === "__all__" ? undefined : salesChannelId,
      productId: productId === "__all__" ? undefined : productId,
    }),
    [from, to, salesChannelId, productId]
  );

  const validation = salesReportFiltersSchema.safeParse(filters);
  const channelsQuery = useSalesChannels({ active: true });
  const productsQuery = useProducts({ active: true });
  const reportQuery = useSalesByProductReport(filters);
  const isForbidden =
    reportQuery.error &&
    isApiError(reportQuery.error) &&
    reportQuery.error.statusCode === HTTP_STATUS.forbidden;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Reportes"
        title="Ventas por producto"
        description={`Ventas confirmadas con snapshots historicos por producto. ${formatReportDateRange(
          {
            from,
            to,
          }
        )}.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Reporte de ventas por producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SalesReportFilters
            channels={channelsQuery.data ?? []}
            products={productsQuery.data ?? []}
            values={{
              from,
              to,
              salesChannelId,
              productId,
            }}
            onFromChange={setFrom}
            onToChange={setTo}
            onSalesChannelIdChange={setSalesChannelId}
            onProductIdChange={setProductId}
            onReset={() => {
              setFrom(initialRange.from);
              setTo(initialRange.to);
              setSalesChannelId("__all__");
              setProductId("__all__");
            }}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-border px-3 py-1">
              Snapshot historico visible
            </Badge>
            <Badge variant="outline" className="border-border px-3 py-1">
              Sin reemplazar labels por catalogo actual
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
              message="Estamos consultando ventas historicas por producto."
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
              message={getReportEmptyMessage("sales-by-product")}
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!reportQuery.isLoading &&
          !reportQuery.error &&
          (reportQuery.data?.length ?? 0) > 0 ? (
            <>
              <SalesByProductReportTable items={reportQuery.data ?? []} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
