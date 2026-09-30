"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAllCategories as useCategories } from "@/features/categories/hooks/use-all-categories";
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
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { ReportPagination } from "@/features/reports/components/report-pagination";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";
import { stockReportPaginationEnabled } from "@/lib/env";

const initialFilters = {
  activeFilter: "__all__",
  categoryId: "__all__",
  stockStatus: "__all__",
  stockManagementType: "__all__",
  search: "",
} as const;

export function StockReportPage() {
  const [activeFilter, setActiveFilter] = useState<
    "__all__" | "active" | "inactive"
  >(initialFilters.activeFilter);
  const [categoryId, setCategoryId] = useState<string>(
    initialFilters.categoryId
  );
  const [stockStatus, setStockStatus] = useState<ReportStockStatus | "__all__">(
    initialFilters.stockStatus
  );
  const [stockManagementType, setStockManagementType] = useState<
    StockManagementType | "__all__"
  >(initialFilters.stockManagementType);
  const [search, setSearch] = useState<string>(initialFilters.search);
  const [offset, setOffset] = useState(0);

  const deferredSearch = useDebouncedValue(search.trim(), 300);
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
      ...(stockReportPaginationEnabled
        ? { limit: DEFAULT_PAGE_LIMIT, offset }
        : {}),
    }),
    [
      activeFilter,
      categoryId,
      deferredSearch,
      offset,
      stockManagementType,
      stockStatus,
    ]
  );

  const categoriesQuery = useCategories({ active: true });
  const validation = stockReportFiltersSchema.safeParse(filters);
  const stockQuery = useStockReport(filters);
  const items = stockQuery.data?.items ?? [];
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
            onActiveFilterChange={(value) => {
              setActiveFilter(value);
              setOffset(0);
            }}
            onCategoryIdChange={(value) => {
              setCategoryId(value);
              setOffset(0);
            }}
            onStockStatusChange={(value) => {
              setStockStatus(value);
              setOffset(0);
            }}
            onStockManagementTypeChange={(value) => {
              setStockManagementType(value);
              setOffset(0);
            }}
            onSearchChange={(value) => {
              setSearch(value);
              setOffset(0);
            }}
            onReset={() => {
              setActiveFilter(initialFilters.activeFilter);
              setCategoryId(initialFilters.categoryId);
              setStockStatus(initialFilters.stockStatus);
              setStockManagementType(initialFilters.stockManagementType);
              setSearch(initialFilters.search);
              setOffset(0);
            }}
          />

          <p className="text-xs text-muted-foreground">
            Los productos NON_STOCKED y RECIPE_BASED se muestran como no
            controlados y no como agotados.
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
                isForbidden
                  ? "Acceso restringido"
                  : "No se pudo cargar el reporte"
              }
              messages={getApiErrorMessages(stockQuery.error)}
            />
          ) : null}

          {!stockQuery.isLoading && !stockQuery.error && items.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              message={getReportEmptyMessage("stock")}
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!stockQuery.isLoading && !stockQuery.error && items.length > 0 ? (
            <>
              <StockReportSummary
                items={items}
                summary={stockQuery.data?.summary}
              />
              <StockReportTable items={items} />
              {stockQuery.data?.paginationMode === "server" ? (
                <ReportPagination
                  count={items.length}
                  limit={stockQuery.data.limit}
                  offset={stockQuery.data.offset}
                  total={stockQuery.data.total}
                  onPrevious={() =>
                    setOffset((current) =>
                      Math.max(0, current - DEFAULT_PAGE_LIMIT)
                    )
                  }
                  onNext={() =>
                    setOffset((current) => current + DEFAULT_PAGE_LIMIT)
                  }
                />
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
