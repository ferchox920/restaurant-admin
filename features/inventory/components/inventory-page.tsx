"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { InventorySummaryCards } from "@/features/inventory/components/inventory-summary-cards";
import { PageHeader } from "@/components/common/page-header";
import { InventoryFilters } from "@/features/inventory/components/inventory-filters";
import { InventoryTable } from "@/features/inventory/components/inventory-table";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import type { InventoryStockStatus } from "@/features/inventory/types/inventory.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

type InventoryFilterValue = "all" | "active" | "inactive";

const filterToActiveMap: Record<InventoryFilterValue, boolean | undefined> = {
  all: undefined,
  active: true,
  inactive: false,
};

export function InventoryPage() {
  const [activeFilter, setActiveFilter] = useState<InventoryFilterValue>("all");
  const [stockStatus, setStockStatus] = useState<
    InventoryStockStatus | undefined
  >();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const deferredSearch = useDebouncedValue(search.trim(), 300);
  const inventoryQuery = useInventory({
    active: filterToActiveMap[activeFilter],
    stockStatus,
    search: deferredSearch || undefined,
    limit: DEFAULT_PAGE_LIMIT,
    offset,
  });

  const isForbidden =
    inventoryQuery.error &&
    isApiError(inventoryQuery.error) &&
    inventoryQuery.error.statusCode === HTTP_STATUS.forbidden;
  const hasActiveFilters =
    activeFilter !== "all" || Boolean(stockStatus || deferredSearch);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Inventario"
        title="Stock general"
        description="Controla existencias, mínimos y productos que necesitan reposición."
      />

      {!inventoryQuery.isLoading &&
      !inventoryQuery.error &&
      (inventoryQuery.data?.length ?? 0) > 0 ? (
        <InventorySummaryCards items={inventoryQuery.data ?? []} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Inventario de productos finalizados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InventoryFilters
            activeFilter={activeFilter}
            onActiveFilterChange={(value) => {
              setActiveFilter(value);
              setOffset(0);
            }}
            stockStatus={stockStatus}
            onStockStatusChange={(value) => {
              setStockStatus(value);
              setOffset(0);
            }}
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setOffset(0);
            }}
          />

          {inventoryQuery.isLoading ? (
            <LoadingState
              title="Cargando inventario"
              message="Estamos consultando el stock operativo."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {inventoryQuery.error ? (
            <ErrorMessage
              variant={isForbidden ? "forbidden" : "general"}
              title={
                isForbidden
                  ? "Acceso restringido"
                  : "No se pudo cargar el inventario"
              }
              messages={getApiErrorMessages(inventoryQuery.error)}
            />
          ) : null}

          {!inventoryQuery.isLoading &&
          !inventoryQuery.error &&
          (inventoryQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title={hasActiveFilters ? "Sin coincidencias" : "Sin inventario"}
              message={
                hasActiveFilters
                  ? "No encontramos productos con los filtros seleccionados."
                  : "Todavía no hay productos inventariables para mostrar."
              }
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!inventoryQuery.isLoading &&
          !inventoryQuery.error &&
          (inventoryQuery.data?.length ?? 0) > 0 ? (
            <>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {(inventoryQuery.data ?? []).length}{" "}
                {(inventoryQuery.data ?? []).length === 1
                  ? "producto encontrado"
                  : "productos encontrados"}
              </p>
              <InventoryTable items={inventoryQuery.data ?? []} />
            </>
          ) : null}
          {!inventoryQuery.error ? (
            <PaginationControls
              offset={offset}
              limit={DEFAULT_PAGE_LIMIT}
              itemCount={inventoryQuery.data?.length ?? 0}
              onOffsetChange={setOffset}
              disabled={inventoryQuery.isFetching}
            />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
