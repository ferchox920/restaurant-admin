"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/features/products/hooks/use-products";
import { InventoryMovementsReportFilters } from "@/features/reports/components/inventory-movements-report-filters";
import { InventoryMovementsReportTable } from "@/features/reports/components/inventory-movements-report-table";
import { ReportPagination } from "@/features/reports/components/report-pagination";
import { useInventoryMovementsReport } from "@/features/reports/hooks/use-inventory-movements-report";
import { inventoryMovementReportFiltersSchema } from "@/features/reports/schemas/report-filters.schema";
import type { InventoryMovementReportFilters } from "@/features/reports/types/report.types";
import { formatReportDateRange, getReportEmptyMessage, toReportDateRange } from "@/features/reports/utils/report-formatters";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import type {
  InventoryMovementType,
  InventoryReferenceType,
} from "@/features/inventory/types/inventory.types";

const DEFAULT_LIMIT = "50";
const DEFAULT_OFFSET = 0;

function isValidDateInputValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function InventoryMovementsReportPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const productId = searchParams.get("productId") ?? "__all__";
  const movementType = (searchParams.get("movementType") ?? "__all__") as
    | InventoryMovementType
    | "__all__";
  const referenceType = (searchParams.get("referenceType") ?? "__all__") as
    | InventoryReferenceType
    | "__all__";
  const createdById = searchParams.get("createdById") ?? "";
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const parsedLimit = Number(limitParam);
  const parsedOffset = Number(offsetParam);
  const limit =
    limitParam && Number.isInteger(parsedLimit) && parsedLimit >= 1 && parsedLimit <= 100
      ? parsedLimit
      : Number(DEFAULT_LIMIT);
  const offset =
    offsetParam && Number.isInteger(parsedOffset) && parsedOffset >= 0
      ? parsedOffset
      : DEFAULT_OFFSET;
  const hasInvalidDateInput =
    (from.length > 0 && !isValidDateInputValue(from)) ||
    (to.length > 0 && !isValidDateInputValue(to));

  function replaceSearchParams(
    updates: Record<string, string | undefined>,
    options?: { resetOffset?: boolean }
  ) {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "__all__") {
        nextParams.delete(key);
        return;
      }

      nextParams.set(key, value);
    });

    if (options?.resetOffset) {
      nextParams.delete("offset");
    }

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  const filters = useMemo<InventoryMovementReportFilters>(
    () => ({
      ...(hasInvalidDateInput
        ? { from: "__invalid__", to: "__invalid__" }
        : toReportDateRange({ from, to })),
      productId: productId === "__all__" ? undefined : productId,
      movementType: movementType === "__all__" ? undefined : movementType,
      referenceType: referenceType === "__all__" ? undefined : referenceType,
      createdById: createdById.trim() || undefined,
      limit,
      offset,
    }),
    [
      createdById,
      from,
      hasInvalidDateInput,
      limit,
      movementType,
      offset,
      productId,
      referenceType,
      to,
    ]
  );

  const validation = inventoryMovementReportFiltersSchema.safeParse(filters);
  const canRenderReportState = validation.success && !hasInvalidDateInput;
  const productsQuery = useProducts({ active: true });
  const reportQuery = useInventoryMovementsReport(filters);
  const isForbidden =
    reportQuery.error &&
    isApiError(reportQuery.error) &&
    reportQuery.error.statusCode === HTTP_STATUS.forbidden;
  const total = reportQuery.data?.total ?? 0;
  const resolvedLimit = reportQuery.data?.limit ?? limit;
  const resolvedOffset = reportQuery.data?.offset ?? offset;
  const hasOutOfRangeOffset =
    !reportQuery.isLoading &&
    !reportQuery.error &&
    total > 0 &&
    resolvedOffset >= total &&
    (reportQuery.data?.items.length ?? 0) === 0;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Reportes"
        title="Movimientos de inventario"
        description={`Consulta paginada de movimientos. ${formatReportDateRange({
          from,
          to,
        })}.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Reporte de movimientos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InventoryMovementsReportFilters
            products={productsQuery.data ?? []}
            values={{
              from,
              to,
              productId,
              movementType,
              referenceType,
              createdById,
              limit: String(limit),
            }}
            onFromChange={(value) =>
              replaceSearchParams({ from: value || undefined }, { resetOffset: true })
            }
            onToChange={(value) =>
              replaceSearchParams({ to: value || undefined }, { resetOffset: true })
            }
            onProductIdChange={(value) =>
              replaceSearchParams({ productId: value }, { resetOffset: true })
            }
            onMovementTypeChange={(value) =>
              replaceSearchParams({ movementType: value }, { resetOffset: true })
            }
            onReferenceTypeChange={(value) =>
              replaceSearchParams({ referenceType: value }, { resetOffset: true })
            }
            onCreatedByIdChange={(value) =>
              replaceSearchParams(
                { createdById: value.trim() || undefined },
                { resetOffset: true }
              )
            }
            onLimitChange={(value) =>
              replaceSearchParams(
                {
                  limit:
                    Number.isInteger(Number(value)) &&
                    Number(value) >= 1 &&
                    Number(value) <= 100
                      ? value
                      : value.length === 0
                        ? undefined
                        : value,
                },
                { resetOffset: true }
              )
            }
            onReset={() => router.replace(pathname, { scroll: false })}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-border px-3 py-1">
              Solo lectura
            </Badge>
            <Badge variant="outline" className="border-border px-3 py-1">
              Total real desde backend
            </Badge>
            <Badge variant="outline" className="border-border px-3 py-1">
              Sin paginacion local simulada
            </Badge>
          </div>

          {!validation.success || hasInvalidDateInput ? (
            <ErrorMessage
              title="Filtros invalidos"
              messages={
                hasInvalidDateInput
                  ? ["Las fechas en la URL deben usar el formato YYYY-MM-DD."]
                  : validation.success
                    ? []
                    : validation.error.issues.map((issue) => issue.message)
              }
            />
          ) : null}

          {canRenderReportState && reportQuery.isLoading ? (
            <LoadingState
              title="Cargando reporte"
              message="Estamos consultando movimientos de inventario."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {canRenderReportState && reportQuery.error ? (
            <ErrorMessage
              variant={isForbidden ? "forbidden" : "general"}
              title={
                isForbidden ? "Acceso restringido" : "No se pudo cargar el reporte"
              }
              messages={getApiErrorMessages(reportQuery.error)}
            />
          ) : null}

          {canRenderReportState && hasOutOfRangeOffset ? (
            <ErrorMessage
              title="Offset fuera de rango"
              messages="La pagina solicitada queda fuera del total real devuelto por backend. Ajusta filtros o vuelve a una pagina anterior."
            />
          ) : null}

          {canRenderReportState &&
          !reportQuery.isLoading &&
          !reportQuery.error &&
          !hasOutOfRangeOffset &&
          (reportQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState
              title="Sin resultados"
              message={getReportEmptyMessage("inventory-movements")}
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {canRenderReportState &&
          !reportQuery.isLoading &&
          !reportQuery.error &&
          (reportQuery.data?.items.length ?? 0) > 0 ? (
            <>
              <InventoryMovementsReportTable items={reportQuery.data?.items ?? []} />
              <ReportPagination
                count={reportQuery.data?.items.length ?? 0}
                limit={resolvedLimit}
                offset={resolvedOffset}
                total={total}
                onPrevious={() =>
                  replaceSearchParams({
                    offset: String(Math.max(DEFAULT_OFFSET, resolvedOffset - resolvedLimit)),
                  })
                }
                onNext={() =>
                  replaceSearchParams({
                    offset: String(resolvedOffset + resolvedLimit),
                  })
                }
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
