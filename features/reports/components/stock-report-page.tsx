"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { StockReportFilters } from "@/features/reports/components/stock-report-filters";
import { useStockReport } from "@/features/reports/hooks/use-stock-report";
import { StockReportSummary } from "@/features/reports/components/stock-report-summary";
import { stockReportFiltersSchema } from "@/features/reports/schemas/report-filters.schema";
import type {
  ReportStockStatus,
  StockReportFilters as StockReportQueryFilters,
} from "@/features/reports/types/report.types";
import { StockReportTable } from "@/features/reports/components/stock-report-table";
import { getReportEmptyMessage } from "@/features/reports/utils/report-formatters";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import type { StockManagementType } from "@/features/products/types/product.types";

const initialFilters = {
  activeFilter: "__all__",
  categoryId: "__all__",
  stockStatus: "__all__",
  stockManagementType: "__all__",
  search: "",
} as const;

export function StockReportPage() {
  const [activeFilter, setActiveFilter] = useState<"__all__" | "active" | "inactive">(
    initialFilters.activeFilter
  );
  const [categoryId, setCategoryId] = useState<string>(initialFilters.categoryId);
  const [stockStatus, setStockStatus] = useState<ReportStockStatus | "__all__">(
    initialFilters.stockStatus
  );
  const [stockManagementType, setStockManagementType] = useState<
    StockManagementType | "__all__"
  >(initialFilters.stockManagementType);
  const [search, setSearch] = useState<string>(initialFilters.search);

  const deferredSearch = useDeferredValue(search.trim());
  const filters = useMemo<StockReportQueryFilters>(
    () => ({
      active:
        activeFilter === "__all__"
          ? undefined
          : activeFilter === "active"
            ? true
            : false,
      categoryId: categoryId === "__all__" ? undefined : categoryId,
      stockStatus: stockStatus === "__all__" ? undefined : stockStatus,
      stockManagementType:
        stockManagementType === "__all__" ? undefined : stockManagementType,
      search: deferredSearch || undefined,
    }),
    [activeFilter, categoryId, stockManagementType, stockStatus, deferredSearch]
  );

  const categoriesQuery = useCategories({ active: true });
  const validation = stockReportFiltersSchema.safeParse(filters);
  const stockQuery = useStockReport(filters);
  const isForbidden =
    stockQuery.error &&
    isApiError(stockQuery.error) &&
    stockQuery.error.statusCode === HTTP_STATUS.forbidden;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Reportes"
        title="Stock actual"
        description="Consulta stock, minimo operativo y productos no controlados sin convertir esta vista en una pantalla de operacion."
      />

      <Card>
        <CardHeader>
          <CardTitle>Reporte de stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StockReportFilters
            categories={categoriesQuery.data ?? []}
            values={{
              activeFilter,
              categoryId,
              stockStatus,
              stockManagementType,
              search,
            }}
            onActiveFilterChange={setActiveFilter}
            onCategoryIdChange={setCategoryId}
            onStockStatusChange={setStockStatus}
            onStockManagementTypeChange={setStockManagementType}
            onSearchChange={setSearch}
            onReset={() => {
              setActiveFilter(initialFilters.activeFilter);
              setCategoryId(initialFilters.categoryId);
              setStockStatus(initialFilters.stockStatus);
              setStockManagementType(initialFilters.stockManagementType);
              setSearch(initialFilters.search);
            }}
          />

          <p className="text-xs text-muted-foreground">
            Los productos NON_STOCKED y RECIPE_BASED se muestran como no controlados y no como agotados.
          </p>

          {!validation.success ? (
            <ErrorMessage
              title="Filtros invalidos"
              messages={validation.error.issues.map((issue) => issue.message)}
            />
          ) : null}

          {stockQuery.isLoading ? (
            <LoadingState
              title="Cargando reporte"
              message="Estamos consultando el stock operativo."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {stockQuery.error ? (
            <ErrorMessage
              variant={isForbidden ? "forbidden" : "general"}
              title={
                isForbidden ? "Acceso restringido" : "No se pudo cargar el reporte"
              }
              messages={getApiErrorMessages(stockQuery.error)}
            />
          ) : null}

          {!stockQuery.isLoading &&
          !stockQuery.error &&
          (stockQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="Sin resultados"
              message={getReportEmptyMessage("stock")}
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!stockQuery.isLoading &&
          !stockQuery.error &&
          (stockQuery.data?.length ?? 0) > 0 ? (
            <>
              <StockReportSummary items={stockQuery.data ?? []} />
              <StockReportTable items={stockQuery.data ?? []} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
