"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, RefreshCw, Search, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAllTables as useTables } from "@/features/tables/hooks/use-all-tables";
import { FloorGrid } from "@/features/tables/components/floor-grid";
import type {
  RestaurantTable,
  TableStatus,
} from "@/features/tables/types/table.types";
import { useAllSalesChannels as useSalesChannels } from "@/features/sales-channels/hooks/use-all-sales-channels";
import { getCurrentTableOrder } from "@/features/table-orders/api/table-orders.api";
import { useOpenTableOrder } from "@/features/table-orders/hooks/use-open-table-order";
import type { OpenTableOrderFormValues } from "@/features/table-orders/types/table-order.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

export function FloorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canOperate =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "CASHIER";
  const [openingTableId, setOpeningTableId] = useState<string | null>(null);
  const [viewingTableId, setViewingTableId] = useState<string | null>(null);
  const [viewOrderError, setViewOrderError] = useState<unknown>(null);
  const [viewErrorTableId, setViewErrorTableId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TableStatus>("ALL");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const tablesQuery = useTables({ active: true });
  const channelsQuery = useSalesChannels({ active: true });
  const openOrderMutation = useOpenTableOrder();
  const isForbidden =
    tablesQuery.error &&
    isApiError(tablesQuery.error) &&
    tablesQuery.error.statusCode === HTTP_STATUS.forbidden;
  const tables = useMemo(() => tablesQuery.data ?? [], [tablesQuery.data]);
  const tableCounts = useMemo(
    () => ({
      total: tables.length,
      available: tables.filter((table) => table.status === "AVAILABLE").length,
      occupied: tables.filter((table) => table.status === "OCCUPIED").length,
    }),
    [tables]
  );
  const filteredTables = useMemo(
    () =>
      tables.filter((table) => {
        const matchesStatus =
          statusFilter === "ALL" || table.status === statusFilter;
        const matchesSearch =
          !deferredSearch ||
          [table.code, table.name ?? "", table.area ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(deferredSearch);

        return matchesStatus && matchesSearch;
      }),
    [deferredSearch, statusFilter, tables]
  );

  async function handleOpenOrder(
    table: RestaurantTable,
    values: OpenTableOrderFormValues
  ) {
    setOpeningTableId(table.id);
    try {
      const order = await openOrderMutation.mutateAsync({
        tableId: table.id,
        data: values,
      });
      router.push(`/table-orders/${order.id}`);
    } finally {
      setOpeningTableId(null);
    }
  }

  async function handleViewOrder(table: RestaurantTable) {
    setViewingTableId(table.id);
    setViewOrderError(null);
    setViewErrorTableId(null);

    try {
      if (table.currentOrder?.id) {
        router.push(`/table-orders/${table.currentOrder.id}`);
        return;
      }

      const currentOrder = await getCurrentTableOrder(table.id);

      if (!currentOrder?.id) {
        throw new Error("No se encontro una orden abierta para esta mesa.");
      }

      router.push(`/table-orders/${currentOrder.id}`);
    } catch (error) {
      setViewOrderError(error);
      setViewErrorTableId(table.id);
    } finally {
      setViewingTableId(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Salon"
        title="Salón"
        description="Consulta la disponibilidad de las mesas y continúa las órdenes abiertas."
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={tablesQuery.isFetching}
            onClick={() => {
              void tablesQuery.refetch();
            }}
          >
            <RefreshCw
              aria-hidden="true"
              className={tablesQuery.isFetching ? "animate-spin" : undefined}
            />
            {tablesQuery.isFetching ? "Actualizando..." : "Actualizar salón"}
          </Button>
        }
      />

      {!tablesQuery.isLoading && !tablesQuery.error ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <Users aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Mesas activas</p>
                <p className="text-2xl font-semibold">{tableCounts.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <CircleCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-semibold">
                  {tableCounts.available}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <Users aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Ocupadas</p>
                <p className="text-2xl font-semibold">{tableCounts.occupied}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-5">
          {!tablesQuery.isLoading && !tablesQuery.error && tables.length > 0 ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filtrar mesas por estado"
              >
                {(
                  [
                    ["ALL", "Todas", tableCounts.total],
                    ["AVAILABLE", "Disponibles", tableCounts.available],
                    ["OCCUPIED", "Ocupadas", tableCounts.occupied],
                  ] as const
                ).map(([value, label, count]) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={statusFilter === value ? "default" : "outline"}
                    aria-pressed={statusFilter === value}
                    onClick={() => setStatusFilter(value)}
                  >
                    {label} ({count})
                  </Button>
                ))}
              </div>
              <div className="relative w-full lg:max-w-sm">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Buscar mesa por código, nombre o área"
                  className="pr-9 pl-9"
                />
                {search ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    aria-label="Limpiar búsqueda"
                    onClick={() => setSearch("")}
                  >
                    <X aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
          {tablesQuery.isLoading || channelsQuery.isLoading ? (
            <LoadingState
              title="Cargando salon"
              message="Estamos preparando mesas y canales activos."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {tablesQuery.error ? (
            <ErrorMessage
              variant={isForbidden ? "forbidden" : "general"}
              title={
                isForbidden
                  ? "Acceso restringido"
                  : "No se pudo cargar el salon"
              }
              messages={getApiErrorMessages(tablesQuery.error)}
            />
          ) : null}

          {channelsQuery.error ? (
            <ErrorMessage
              title="No se pudieron cargar canales"
              messages={getApiErrorMessages(channelsQuery.error)}
            />
          ) : null}

          {!tablesQuery.isLoading &&
          !tablesQuery.error &&
          tables.length === 0 ? (
            <EmptyState
              title="Sin mesas activas"
              message="No hay mesas activas para operar en el salon."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!tablesQuery.isLoading &&
          !tablesQuery.error &&
          tables.length > 0 &&
          filteredTables.length === 0 ? (
            <EmptyState
              title="Sin mesas coincidentes"
              message="No encontramos mesas con la búsqueda y el estado seleccionados."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!tablesQuery.isLoading &&
          !tablesQuery.error &&
          filteredTables.length > 0 ? (
            <FloorGrid
              tables={filteredTables}
              channels={(channelsQuery.data ?? []).filter(
                (channel) => channel.active
              )}
              canOperate={canOperate}
              openingTableId={openingTableId}
              viewingTableId={viewingTableId}
              openError={openOrderMutation.error}
              openErrorTableId={openOrderMutation.variables?.tableId}
              viewError={viewOrderError}
              viewErrorTableId={viewErrorTableId}
              onOpenOrder={handleOpenOrder}
              onViewOrder={handleViewOrder}
            />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
