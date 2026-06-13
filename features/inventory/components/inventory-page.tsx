"use client";

import { useDeferredValue, useState } from "react";
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

  const deferredSearch = useDeferredValue(search.trim());
  const inventoryQuery = useInventory({
    active: filterToActiveMap[activeFilter],
    stockStatus,
    search: deferredSearch || undefined,
  });

  const isForbidden =
    inventoryQuery.error &&
    isApiError(inventoryQuery.error) &&
    inventoryQuery.error.statusCode === HTTP_STATUS.forbidden;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Inventario"
        title="Stock general"
        description="Consulta el stock actual de productos finalizados, con filtros operativos y acceso al detalle por producto."
      />

      <Card>
        <CardHeader>
          <CardTitle>Inventario de productos finalizados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InventoryFilters
            activeFilter={activeFilter}
            onActiveFilterChange={setActiveFilter}
            stockStatus={stockStatus}
            onStockStatusChange={setStockStatus}
            search={search}
            onSearchChange={setSearch}
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
              title="Sin resultados"
              message="No hay productos inventariables para los filtros seleccionados."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!inventoryQuery.isLoading &&
          !inventoryQuery.error &&
          (inventoryQuery.data?.length ?? 0) > 0 ? (
            <>
              <InventorySummaryCards items={inventoryQuery.data ?? []} />
              <InventoryTable items={inventoryQuery.data ?? []} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
